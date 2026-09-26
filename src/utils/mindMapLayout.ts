import { MindMapNode } from '../types';

export type MindMapLayoutMode = 'horizontal' | 'radial';

export interface BranchPalette {
  stroke: string;
  glow: string;
  darkBg: string;
  darkText: string;
  lightBg: string;
  lightBorder: string;
  lightText: string;
}

export const BRANCH_PALETTES: BranchPalette[] = [
  { stroke: '#10B981', glow: 'rgba(16, 185, 129, 0.4)', darkBg: '#064E3B', darkText: '#A7F3D0', lightBg: '#ECFDF5', lightBorder: '#10B981', lightText: '#065F46' }, // Emerald
  { stroke: '#6366F1', glow: 'rgba(99, 102, 241, 0.4)', darkBg: '#312E81', darkText: '#C7D2FE', lightBg: '#EEF2FF', lightBorder: '#6366F1', lightText: '#3730A3' }, // Indigo
  { stroke: '#F59E0B', glow: 'rgba(245, 158, 11, 0.4)', darkBg: '#78350F', darkText: '#FDE68A', lightBg: '#FFFBEB', lightBorder: '#F59E0B', lightText: '#92400E' }, // Amber
  { stroke: '#EC4899', glow: 'rgba(236, 72, 153, 0.4)', darkBg: '#831843', darkText: '#FBCFE8', lightBg: '#FDF2F8', lightBorder: '#EC4899', lightText: '#9D174D' }, // Pink
  { stroke: '#06B6D4', glow: 'rgba(6, 182, 212, 0.4)', darkBg: '#164E63', darkText: '#A5F3FC', lightBg: '#ECFEFF', lightBorder: '#06B6D4', lightText: '#155E75' }, // Cyan
  { stroke: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)', darkBg: '#4C1D95', darkText: '#DDD6FE', lightBg: '#F5F3FF', lightBorder: '#8B5CF6', lightText: '#5B21B6' }, // Purple
  { stroke: '#3B82F6', glow: 'rgba(59, 130, 246, 0.4)', darkBg: '#1E3A8A', darkText: '#BFDBFE', lightBg: '#EFF6FF', lightBorder: '#3B82F6', lightText: '#1E40AF' }, // Blue
  { stroke: '#14B8A6', glow: 'rgba(20, 184, 166, 0.4)', darkBg: '#134E4A', darkText: '#99F6E4', lightBg: '#F0FDFA', lightBorder: '#14B8A6', lightText: '#115E59' }  // Teal
];

export interface RenderedNode {
  id: string;
  title: string;
  explanation: string;
  x: number;
  y: number;
  width: number;
  height: number;
  colorIndex: number;
  level: number;
  hasChildren: boolean;
  isCollapsed: boolean;
  side: 'left' | 'right';
  parentId?: string;
  parentX?: number;
  parentY?: number;
  rawNode: MindMapNode;
}

export interface RenderedEdge {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  side: 'left' | 'right';
}

export interface MindMapLayoutResult {
  nodes: RenderedNode[];
  edges: RenderedEdge[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
}

/**
 * Calculates visual layout coordinates for a hierarchical MindMapNode tree.
 */
export function computeMindMapLayout(
  root: MindMapNode,
  collapsedMap: Record<string, boolean>,
  mode: MindMapLayoutMode = 'horizontal'
): MindMapLayoutResult {
  const nodes: RenderedNode[] = [];
  const edges: RenderedEdge[] = [];

  const NODE_CONFIG = {
    root: { width: 220, height: 60 },
    level1: { width: 200, height: 50 },
    level2: { width: 180, height: 44 },
    horizontalGap: 100,
    verticalGap: 24
  };

  if (mode === 'radial') {
    // -------------------------------------------------------------
    // RADIAL / BILATERAL MODE: Center Root, Units alternate Left & Right
    // -------------------------------------------------------------
    const rootX = 0;
    const rootY = 0;
    const rootNode: RenderedNode = {
      id: root.id || 'root',
      title: root.title,
      explanation: root.explanation || '',
      x: rootX,
      y: rootY,
      width: NODE_CONFIG.root.width,
      height: NODE_CONFIG.root.height,
      colorIndex: 0,
      level: 0,
      hasChildren: Boolean(root.children && root.children.length > 0),
      isCollapsed: false,
      side: 'right',
      rawNode: root
    };
    nodes.push(rootNode);

    const children = root.children || [];
    const rightChildren: MindMapNode[] = [];
    const leftChildren: MindMapNode[] = [];

    // Distribute children symmetrically
    children.forEach((c, i) => {
      if (i % 2 === 0) {
        rightChildren.push(c);
      } else {
        leftChildren.push(c);
      }
    });

    // Helper to calculate total height of a branch subtree
    const getSubtreeHeight = (node: MindMapNode, level: number): number => {
      const isCollapsed = collapsedMap[node.id];
      const h = level === 1 ? NODE_CONFIG.level1.height : NODE_CONFIG.level2.height;
      if (isCollapsed || !node.children || node.children.length === 0) {
        return h;
      }
      let childSum = 0;
      node.children.forEach((ch, idx) => {
        childSum += getSubtreeHeight(ch, level + 1);
        if (idx > 0) childSum += NODE_CONFIG.verticalGap;
      });
      return Math.max(h, childSum);
    };

    // Layout right side
    const totalHeightRight = rightChildren.reduce((acc, c, idx) => {
      return acc + getSubtreeHeight(c, 1) + (idx > 0 ? NODE_CONFIG.verticalGap * 1.5 : 0);
    }, 0);

    let startYRight = -totalHeightRight / 2;
    rightChildren.forEach((unit, idx) => {
      const colorIndex = (idx * 2) % BRANCH_PALETTES.length;
      const branchHeight = getSubtreeHeight(unit, 1);
      const unitY = startYRight + branchHeight / 2;
      const unitX = NODE_CONFIG.root.width / 2 + NODE_CONFIG.horizontalGap + NODE_CONFIG.level1.width / 2;

      layoutBranch(
        unit,
        1,
        unitX,
        unitY,
        rootX + NODE_CONFIG.root.width / 2,
        rootY,
        'right',
        colorIndex,
        collapsedMap,
        nodes,
        edges,
        NODE_CONFIG,
        getSubtreeHeight
      );

      startYRight += branchHeight + NODE_CONFIG.verticalGap * 1.5;
    });

    // Layout left side
    const totalHeightLeft = leftChildren.reduce((acc, c, idx) => {
      return acc + getSubtreeHeight(c, 1) + (idx > 0 ? NODE_CONFIG.verticalGap * 1.5 : 0);
    }, 0);

    let startYLeft = -totalHeightLeft / 2;
    leftChildren.forEach((unit, idx) => {
      const colorIndex = (idx * 2 + 1) % BRANCH_PALETTES.length;
      const branchHeight = getSubtreeHeight(unit, 1);
      const unitY = startYLeft + branchHeight / 2;
      const unitX = -(NODE_CONFIG.root.width / 2 + NODE_CONFIG.horizontalGap + NODE_CONFIG.level1.width / 2);

      layoutBranch(
        unit,
        1,
        unitX,
        unitY,
        rootX - NODE_CONFIG.root.width / 2,
        rootY,
        'left',
        colorIndex,
        collapsedMap,
        nodes,
        edges,
        NODE_CONFIG,
        getSubtreeHeight
      );

      startYLeft += branchHeight + NODE_CONFIG.verticalGap * 1.5;
    });
  } else {
    // -------------------------------------------------------------
    // HORIZONTAL TREE MODE: Left to Right
    // -------------------------------------------------------------
    const getSubtreeHeight = (node: MindMapNode, level: number): number => {
      const isCollapsed = collapsedMap[node.id];
      const h = level === 0 ? NODE_CONFIG.root.height : level === 1 ? NODE_CONFIG.level1.height : NODE_CONFIG.level2.height;
      if (isCollapsed || !node.children || node.children.length === 0) {
        return h;
      }
      let childSum = 0;
      node.children.forEach((ch, idx) => {
        childSum += getSubtreeHeight(ch, level + 1);
        if (idx > 0) childSum += NODE_CONFIG.verticalGap;
      });
      return Math.max(h, childSum);
    };

    const rootX = 0;
    const rootY = 0;
    const rootNode: RenderedNode = {
      id: root.id || 'root',
      title: root.title,
      explanation: root.explanation || '',
      x: rootX,
      y: rootY,
      width: NODE_CONFIG.root.width,
      height: NODE_CONFIG.root.height,
      colorIndex: 0,
      level: 0,
      hasChildren: Boolean(root.children && root.children.length > 0),
      isCollapsed: false,
      side: 'right',
      rawNode: root
    };
    nodes.push(rootNode);

    const children = root.children || [];
    const totalHeight = children.reduce((acc, c, idx) => {
      return acc + getSubtreeHeight(c, 1) + (idx > 0 ? NODE_CONFIG.verticalGap * 1.5 : 0);
    }, 0);

    let currentY = -totalHeight / 2;
    children.forEach((unit, idx) => {
      const colorIndex = idx % BRANCH_PALETTES.length;
      const branchHeight = getSubtreeHeight(unit, 1);
      const unitY = currentY + branchHeight / 2;
      const unitX = NODE_CONFIG.root.width / 2 + NODE_CONFIG.horizontalGap + NODE_CONFIG.level1.width / 2;

      layoutBranch(
        unit,
        1,
        unitX,
        unitY,
        rootX + NODE_CONFIG.root.width / 2,
        rootY,
        'right',
        colorIndex,
        collapsedMap,
        nodes,
        edges,
        NODE_CONFIG,
        getSubtreeHeight
      );

      currentY += branchHeight + NODE_CONFIG.verticalGap * 1.5;
    });
  }

  // Calculate overall bounding box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  nodes.forEach((n) => {
    const left = n.x - n.width / 2;
    const right = n.x + n.width / 2;
    const top = n.y - n.height / 2;
    const bottom = n.y + n.height / 2;

    if (left < minX) minX = left;
    if (right > maxX) maxX = right;
    if (top < minY) minY = top;
    if (bottom > maxY) maxY = bottom;
  });

  const padding = 100;
  return {
    nodes,
    edges,
    bounds: {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2
    }
  };
}

/**
 * Recursive branch layout builder
 */
function layoutBranch(
  node: MindMapNode,
  level: number,
  x: number,
  y: number,
  parentConnectX: number,
  parentConnectY: number,
  side: 'left' | 'right',
  colorIndex: number,
  collapsedMap: Record<string, boolean>,
  nodesList: RenderedNode[],
  edgesList: RenderedEdge[],
  cfg: any,
  heightCalculator: (n: MindMapNode, lvl: number) => number
) {
  const isCollapsed = Boolean(collapsedMap[node.id]);
  const nodeCfg = level === 1 ? cfg.level1 : cfg.level2;
  const hasChildren = Boolean(node.children && node.children.length > 0);

  const rendered: RenderedNode = {
    id: node.id,
    title: node.title,
    explanation: node.explanation || '',
    x,
    y,
    width: nodeCfg.width,
    height: nodeCfg.height,
    colorIndex,
    level,
    hasChildren,
    isCollapsed,
    side,
    parentId: undefined,
    parentX: parentConnectX,
    parentY: parentConnectY,
    rawNode: node
  };
  nodesList.push(rendered);

  // Connect edge from parent to this node
  const myConnectX = side === 'right' ? x - nodeCfg.width / 2 : x + nodeCfg.width / 2;
  const myConnectY = y;
  const palette = BRANCH_PALETTES[colorIndex % BRANCH_PALETTES.length];

  edgesList.push({
    id: `edge-${rendered.id}`,
    startX: parentConnectX,
    startY: parentConnectY,
    endX: myConnectX,
    endY: myConnectY,
    color: palette.stroke,
    side
  });

  // If not collapsed, recursively layout children (Level 2+)
  if (!isCollapsed && hasChildren && node.children) {
    const totalChildHeight = node.children.reduce((acc, ch, idx) => {
      return acc + heightCalculator(ch, level + 1) + (idx > 0 ? cfg.verticalGap : 0);
    }, 0);

    let startChildY = y - totalChildHeight / 2;
    const parentOutX = side === 'right' ? x + nodeCfg.width / 2 : x - nodeCfg.width / 2;

    node.children.forEach((child) => {
      const childSubtreeHeight = heightCalculator(child, level + 1);
      const childY = startChildY + childSubtreeHeight / 2;
      const childX =
        side === 'right'
          ? x + nodeCfg.width / 2 + cfg.horizontalGap + cfg.level2.width / 2
          : x - (nodeCfg.width / 2 + cfg.horizontalGap + cfg.level2.width / 2);

      layoutBranch(
        child,
        level + 1,
        childX,
        childY,
        parentOutX,
        y,
        side,
        colorIndex,
        collapsedMap,
        nodesList,
        edgesList,
        cfg,
        heightCalculator
      );

      startChildY += childSubtreeHeight + cfg.verticalGap;
    });
  }
}

// ============================================================
// TREE MUTATION & SEARCH UTILITIES
// ============================================================

/**
 * Searches the tree for matching keywords, returning IDs of matching nodes and all their ancestors.
 */
export function searchTree(
  root: MindMapNode,
  query: string
): { matches: Set<string>; ancestorsToExpand: Set<string> } {
  const matches = new Set<string>();
  const ancestorsToExpand = new Set<string>();

  if (!query.trim()) return { matches, ancestorsToExpand };
  const cleanQuery = query.toLowerCase().trim();

  function walk(node: MindMapNode, path: string[]) {
    const titleMatch = node.title.toLowerCase().includes(cleanQuery);
    const explanationMatch = (node.explanation || '').toLowerCase().includes(cleanQuery);

    if (titleMatch || explanationMatch) {
      matches.add(node.id);
      path.forEach((ancestorId) => ancestorsToExpand.add(ancestorId));
    }

    if (node.children) {
      node.children.forEach((c) => walk(c, [...path, node.id]));
    }
  }

  walk(root, []);
  return { matches, ancestorsToExpand };
}

/**
 * Updates a node in place (immutable copy returned).
 */
export function updateNodeInTree(
  root: MindMapNode,
  targetId: string,
  updates: Partial<MindMapNode>
): MindMapNode {
  if (root.id === targetId) {
    return { ...root, ...updates };
  }

  if (!root.children) return root;

  return {
    ...root,
    children: root.children.map((c) => updateNodeInTree(c, targetId, updates))
  };
}

/**
 * Adds a new child node to a given parent node ID.
 */
export function addNodeToTree(
  root: MindMapNode,
  parentId: string,
  newNode: MindMapNode
): MindMapNode {
  if (root.id === parentId) {
    return {
      ...root,
      children: [...(root.children || []), newNode]
    };
  }

  if (!root.children) return root;

  return {
    ...root,
    children: root.children.map((c) => addNodeToTree(c, parentId, newNode))
  };
}

/**
 * Deletes a node by ID from the tree.
 */
export function deleteNodeFromTree(root: MindMapNode, targetId: string): MindMapNode {
  if (root.id === targetId) return root; // Cannot delete root
  if (!root.children) return root;

  return {
    ...root,
    children: root.children
      .filter((c) => c.id !== targetId)
      .map((c) => deleteNodeFromTree(c, targetId))
  };
}

/**
 * Counts total number of nodes in tree.
 */
export function countTreeNodes(root: MindMapNode): number {
  let count = 1;
  if (root.children) {
    root.children.forEach((c) => {
      count += countTreeNodes(c);
    });
  }
  return count;
}

/**
 * Converts MindMapNode hierarchy to a structured Markdown outline.
 */
export function treeToMarkdown(root: MindMapNode): string {
  const lines: string[] = [];
  lines.push(`# Mind Map: ${root.title}`);
  if (root.explanation) {
    lines.push(`> ${root.explanation}\n`);
  }
  lines.push('---');

  function walk(node: MindMapNode, depth: number) {
    if (depth === 1) {
      lines.push(`\n## 📌 ${node.title}`);
      if (node.explanation) lines.push(`*${node.explanation}*\n`);
    } else if (depth >= 2) {
      const indent = '  '.repeat(depth - 2);
      lines.push(`${indent}- **${node.title}**${node.explanation ? `: ${node.explanation}` : ''}`);
    }

    if (node.children) {
      node.children.forEach((child) => walk(child, depth + 1));
    }
  }

  if (root.children) {
    root.children.forEach((c) => walk(c, 1));
  }

  return lines.join('\n');
}
