import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Network,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Download,
  Info,
  ChevronRight,
  ChevronDown,
  Layers,
  Search,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  Edit3,
  Check,
  FolderOpen,
  FileCode,
  FileText,
  Image as ImageIcon,
  Share2,
  Palette,
  Compass,
  ArrowRight,
  HelpCircle,
  Eye
} from 'lucide-react';
import { ToolHeader } from '../components/ToolHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { generateMindMapAI } from '../services/aiService';
import { MindMapNode } from '../types';
import {
  computeMindMapLayout,
  MindMapLayoutMode,
  RenderedNode,
  RenderedEdge,
  BRANCH_PALETTES,
  searchTree,
  updateNodeInTree,
  addNodeToTree,
  deleteNodeFromTree,
  countTreeNodes,
  treeToMarkdown
} from '../utils/mindMapLayout';

// ============================================================
// VISUAL CANVAS THEMES
// ============================================================
export type CanvasThemeId = 'neon' | 'light' | 'emerald' | 'midnight';

interface CanvasThemeConfig {
  id: CanvasThemeId;
  name: string;
  bg: string;
  gridDot: string;
  rootFill: string;
  rootStroke: string;
  rootText: string;
  nodeFill: string;
  nodeBorder: string;
  nodeText: string;
  panelBg: string;
  panelBorder: string;
}

const CANVAS_THEMES: Record<CanvasThemeId, CanvasThemeConfig> = {
  neon: {
    id: 'neon',
    name: 'Cyber Neon (Dark)',
    bg: '#080C14',
    gridDot: 'rgba(255, 255, 255, 0.08)',
    rootFill: '#1E1B4B',
    rootStroke: '#818CF8',
    rootText: '#FFFFFF',
    nodeFill: '#0F172A',
    nodeBorder: '#334155',
    nodeText: '#F8FAFC',
    panelBg: 'rgba(15, 23, 42, 0.95)',
    panelBorder: '#334155'
  },
  light: {
    id: 'light',
    name: 'Academic Paper (Light)',
    bg: '#F8FAFC',
    gridDot: 'rgba(0, 0, 0, 0.08)',
    rootFill: '#0F172A',
    rootStroke: '#2563EB',
    rootText: '#FFFFFF',
    nodeFill: '#FFFFFF',
    nodeBorder: '#CBD5E1',
    nodeText: '#0F172A',
    panelBg: 'rgba(255, 255, 255, 0.95)',
    panelBorder: '#E2E8F0'
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Forest',
    bg: '#022C22',
    gridDot: 'rgba(52, 211, 153, 0.12)',
    rootFill: '#064E3B',
    rootStroke: '#34D399',
    rootText: '#FFFFFF',
    nodeFill: '#043D32',
    nodeBorder: '#059669',
    nodeText: '#ECFDF5',
    panelBg: 'rgba(4, 61, 50, 0.95)',
    panelBorder: '#059669'
  },
  midnight: {
    id: 'midnight',
    name: 'Deep Midnight',
    bg: '#0F172A',
    gridDot: 'rgba(129, 140, 248, 0.12)',
    rootFill: '#1E293B',
    rootStroke: '#6366F1',
    rootText: '#FFFFFF',
    nodeFill: '#131D31',
    nodeBorder: '#334155',
    nodeText: '#E2E8F0',
    panelBg: 'rgba(19, 29, 49, 0.95)',
    panelBorder: '#334155'
  }
};

// ============================================================
// ACADEMIC SYLLABUS PRESETS
// ============================================================
interface SyllabusPreset {
  label: string;
  title: string;
  outline: string;
}

const SYLLABUS_PRESETS: SyllabusPreset[] = [
  {
    label: 'Data Structures & Algorithms',
    title: 'Data Structures & Algorithms',
    outline: `Unit 1: Linear Data Structures
- Arrays, Dynamic Arrays, and Amortized Analysis
- Singly and Doubly Linked Lists
- Stacks, Queues, and Circular Ring Buffers

Unit 2: Non-Linear Hierarchies & Trees
- Binary Search Trees (BST) and In-order Traversal
- Self-Balancing Trees: AVL Trees and Red-Black Trees
- Priority Queues and Binary Heaps

Unit 3: Graph Algorithms & Traversals
- Graph Representations: Adjacency Matrix vs List
- Breadth-First Search (BFS) and Depth-First Search (DFS)
- Shortest Paths: Dijkstra and Bellman-Ford
- Minimum Spanning Trees: Kruskal and Prim

Unit 4: Advanced Algorithm Paradigms
- Divide & Conquer: Merge Sort and Fast Exponentiation
- Dynamic Programming: Knapsack, LCS, and Memoization
- Greedy Strategies: Huffman Coding and Activity Selection`
  },
  {
    label: 'Operating Systems & Architecture',
    title: 'Operating Systems & Concurrency',
    outline: `Unit 1: Kernel & Process Management
- Monolithic vs Microkernel Architectures
- Process Control Block (PCB) and Context Switching
- CPU Scheduling: Round Robin, Multi-level Feedback Queues

Unit 2: Concurrency & Synchronization
- Race Conditions, Critical Sections, and Mutex Locks
- Semaphores and Producer-Consumer Problem
- Deadlocks: Necessary Conditions, Banker's Algorithm

Unit 3: Memory Hierarchy & Virtual Memory
- Paging, Segmentation, and Translation Lookaside Buffer (TLB)
- Page Faults and Demand Paging
- Page Replacement Algorithms: FIFO, LRU, and Optimal

Unit 4: Storage Systems & File Systems
- Inodes, Directory Structures, and File Allocation (FAT, Ext4)
- Disk Scheduling: SCAN, C-SCAN, and SSD Wear-Leveling`
  },
  {
    label: 'Full-Stack Web Engineering',
    title: 'Full-Stack Web Engineering',
    outline: `Unit 1: Modern Frontend Architecture
- DOM Manipulation & React Component Lifecycle
- State Management: Context API, Redux, and Zustand
- Responsive CSS: Flexbox, Grid, and Tailwind Utility Systems

Unit 2: Backend APIs & Microservices
- RESTful API Conventions, HTTP Status Codes, and Headers
- Node.js Event Loop, Express Routing, and Middleware Chains
- Asynchronous Patterns: Promises, Async/Await, and WebSockets

Unit 3: Database Design & Persistence
- Relational Schema Design: Normalization (1NF, 2NF, 3NF)
- SQL Indexing (B-Trees) and Query Performance Optimization
- NoSQL Document Stores: MongoDB and Redis In-Memory Caching

Unit 4: Security, DevOps & Cloud Deployment
- Authentication: JWT, OAuth 2.0, and Session Cookies
- Web Security: OWASP Top 10, CORS, XSS, and CSRF Protection
- CI/CD Pipelines, Docker Containerization, and Cloud Hosting`
  },
  {
    label: 'Deep Learning & Neural Networks',
    title: 'Deep Learning & Neural Networks',
    outline: `Unit 1: Neural Network Foundations
- Perceptrons, Artificial Neurons, and Activation Functions (ReLU, Sigmoid, Softmax)
- Forward Propagation, Cross-Entropy Loss, and Backpropagation
- Gradient Descent Optimization: SGD, Momentum, and Adam

Unit 2: Computer Vision & CNNs
- Convolutional Filters, Stride, and Feature Map Pooling
- Benchmark Architectures: ResNet, Residual Skip Connections
- Object Detection Principles: YOLO and Fast R-CNN

Unit 3: Sequential Modeling & Transformers
- Recurrent Neural Networks (RNN) and LSTM Gating Mechanisms
- Self-Attention Mechanism, Scaled Dot-Product, and Multi-Head Projections
- Large Language Models: Decoder-Only Architecture and Reinforcement Learning from Human Feedback (RLHF)`
  }
];

export const MindMapGeneratorPage: React.FC = () => {
  // Input State
  const [syllabusText, setSyllabusText] = useState('');

  // AI & Tree State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mindMapData, setMindMapData] = useState<MindMapNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);

  // Canvas Viewport & Layout State
  const [layoutMode, setLayoutMode] = useState<MindMapLayoutMode>('horizontal');
  const [canvasTheme, setCanvasTheme] = useState<CanvasThemeId>('neon');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Inspector & Editing State
  const [editTitle, setEditTitle] = useState('');
  const [editExplanation, setEditExplanation] = useState('');
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [newChildTitle, setNewChildTitle] = useState('');
  const [newChildExplanation, setNewChildExplanation] = useState('');

  // Export State
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // SEARCH & FILTER
  // ============================================================
  const { matches: searchMatches, ancestorsToExpand } = useMemo(() => {
    if (!mindMapData || !searchQuery.trim()) {
      return { matches: new Set<string>(), ancestorsToExpand: new Set<string>() };
    }
    return searchTree(mindMapData, searchQuery);
  }, [mindMapData, searchQuery]);

  // Automatically uncollapse branches when search matches are inside them
  useEffect(() => {
    if (ancestorsToExpand.size > 0) {
      setCollapsedNodes((prev) => {
        const next = { ...prev };
        ancestorsToExpand.forEach((id) => {
          next[id] = false;
        });
        return next;
      });
    }
  }, [ancestorsToExpand]);

  // ============================================================
  // LAYOUT CALCULATION
  // ============================================================
  const layoutResult = useMemo(() => {
    if (!mindMapData) return null;
    return computeMindMapLayout(mindMapData, collapsedNodes, layoutMode);
  }, [mindMapData, collapsedNodes, layoutMode]);

  // Keep inspector in sync when selectedNode changes
  useEffect(() => {
    if (selectedNode) {
      setEditTitle(selectedNode.title);
      setEditExplanation(selectedNode.explanation || '');
    }
  }, [selectedNode]);

  // Center Root Node on initial generation or mode switch
  const handleRecenter = () => {
    if (!layoutResult) return;
    setZoomLevel(1);
    // Center at (0, 0)
    setPanOffset({ x: 0, y: 0 });
  };

  // ============================================================
  // AI GENERATION HANDLER
  // ============================================================
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!syllabusText.trim()) {
      setError('Please provide syllabus or topic outline text.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tree = await generateMindMapAI(syllabusText);
      setMindMapData(tree);
      setSelectedNode(tree);
      setCollapsedNodes({});
      setPanOffset({ x: 0, y: 0 });
      setZoomLevel(1);
    } catch (err: any) {
      setError(err.message || 'Failed to generate visual mind map.');
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: SyllabusPreset) => {
    setSyllabusText(preset.outline);
  };

  // ============================================================
  // CANVAS PAN & ZOOM INTERACTION
  // ============================================================
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only pan if clicking canvas background (not an interactive node)
    const target = e.target as HTMLElement;
    if (target.closest('.mindmap-node') || target.closest('button')) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoomLevel((prev) => Math.min(2.5, Math.max(0.4, prev * zoomFactor)));
  };

  const toggleCollapse = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = () => {
    setCollapsedNodes({});
  };

  const handleCollapseAll = () => {
    if (!mindMapData || !mindMapData.children) return;
    const allCollapsed: Record<string, boolean> = {};
    mindMapData.children.forEach((c) => {
      allCollapsed[c.id] = true;
    });
    setCollapsedNodes(allCollapsed);
  };

  // ============================================================
  // IN-PLACE NODE EDITING
  // ============================================================
  const handleSaveNodeEdit = () => {
    if (!mindMapData || !selectedNode) return;
    const updated = updateNodeInTree(mindMapData, selectedNode.id, {
      title: editTitle.trim() || selectedNode.title,
      explanation: editExplanation.trim()
    });
    setMindMapData(updated);
    setSelectedNode({
      ...selectedNode,
      title: editTitle.trim() || selectedNode.title,
      explanation: editExplanation.trim()
    });
  };

  const handleAddChildNode = () => {
    if (!mindMapData || !selectedNode || !newChildTitle.trim()) return;
    const newId = `node-${Date.now()}`;
    const newNode: MindMapNode = {
      id: newId,
      title: newChildTitle.trim(),
      explanation: newChildExplanation.trim() || 'Custom branch concept'
    };
    const updated = addNodeToTree(mindMapData, selectedNode.id, newNode);
    setMindMapData(updated);
    // Uncollapse parent so new child is visible
    setCollapsedNodes((prev) => ({ ...prev, [selectedNode.id]: false }));
    setShowAddChildModal(false);
    setNewChildTitle('');
    setNewChildExplanation('');
  };

  const handleDeleteNode = () => {
    if (!mindMapData || !selectedNode || selectedNode.id === mindMapData.id) return;
    const confirmed = window.confirm(`Delete branch "${selectedNode.title}" and its subtopics?`);
    if (!confirmed) return;
    const updated = deleteNodeFromTree(mindMapData, selectedNode.id);
    setMindMapData(updated);
    setSelectedNode(updated);
  };

  // ============================================================
  // FULLSCREEN HANDLERS
  // ============================================================
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // ============================================================
  // EXPORT HANDLERS
  // ============================================================
  const handleExportSvg = () => {
    const svgElem = svgRef.current;
    if (!svgElem || !mindMapData || !layoutResult) return;

    const svgData = new XMLSerializer().serializeToString(svgElem);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.href = url;
    element.download = `${mindMapData.title.replace(/\s+/g, '_')}_MindMap.svg`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  const handleExportPng = () => {
    const svgElem = svgRef.current;
    if (!svgElem || !mindMapData || !layoutResult) return;

    const svgData = new XMLSerializer().serializeToString(svgElem);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2; // High-res 2x
      const width = Math.max(layoutResult.bounds.width, 1000);
      const height = Math.max(layoutResult.bounds.height, 600);
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(scale, scale);
        // Canvas Background
        ctx.fillStyle = themeConfig.bg;
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);

        const pngUrl = canvas.toDataURL('image/png');
        const element = document.createElement('a');
        element.href = pngUrl;
        element.download = `${mindMapData.title.replace(/\s+/g, '_')}_MindMap.png`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
    setExportMenuOpen(false);
  };

  const handleExportMarkdown = () => {
    if (!mindMapData) return;
    const md = treeToMarkdown(mindMapData);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const element = document.createElement('a');
    element.href = url;
    element.download = `${mindMapData.title.replace(/\s+/g, '_')}_Outline.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  const handleExportJson = () => {
    if (!mindMapData) return;
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(mindMapData, null, 2)], {
      type: 'application/json'
    });
    element.href = URL.createObjectURL(file);
    element.download = `${mindMapData.title.replace(/\s+/g, '_')}_MindMap.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setExportMenuOpen(false);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.title) {
          setMindMapData(parsed);
          setSelectedNode(parsed);
          setCollapsedNodes({});
          setPanOffset({ x: 0, y: 0 });
          setZoomLevel(1);
        } else {
          alert('Invalid mind map JSON file.');
        }
      } catch (err: any) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const themeConfig = CANVAS_THEMES[canvasTheme];
  const totalNodesCount = mindMapData ? countTreeNodes(mindMapData) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hidden File Input for Importing JSON */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportJson}
        accept=".json"
        className="hidden"
      />

      <ToolHeader
        toolNumber="04"
        title="AI Mind Map Generator"
        subtitle="Transform any syllabus, curriculum, or technical topic into an interactive, pan-and-zoom SVG mind map."
        icon={<Network className="w-6 h-6 text-[#10B981]" />}
        badge="Interactive SVG Canvas"
        category="Visual & Outlines"
        statusText="AI Ready"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: SYLLABUS INPUT & PRESETS (4 COLS)               */}
        {/* ============================================================ */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-[#DFE4F2] rounded-3xl p-6 space-y-4 shadow-sm text-left">
            <div className="flex items-center justify-between border-b border-[#DFE4F2] pb-3">
              <h2 className="text-xs font-bold text-[#080909] uppercase tracking-wider font-display flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#10B981]" />
                Syllabus Outline Input
              </h2>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-semibold text-slate-600 hover:text-[#10B981] flex items-center gap-1 cursor-pointer transition-colors"
                title="Import an existing Mind Map JSON file"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Import JSON</span>
              </button>
            </div>

            {/* Quick Academic Syllabus Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Academic Presets
                </span>
                <span className="text-[10px] text-slate-400">Click to fill</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SYLLABUS_PRESETS.map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer text-left"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="text-[#080909] font-bold block mb-1">
                  Paste Syllabus / Curriculum Modules *
                </label>
                <textarea
                  rows={8}
                  required
                  value={syllabusText}
                  onChange={(e) => setSyllabusText(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#DFE4F2] rounded-2xl p-3 text-[#080909] placeholder:text-[#080909]/40 focus:outline-none focus:border-[#10B981] font-mono text-[11px] leading-relaxed"
                  placeholder="Unit 1: Module Title&#10;- Subtopic A&#10;- Subtopic B&#10;&#10;Unit 2: Next Module..."
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  AI extracts core units and branches them out into an expandable visual graph.
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-5 bg-[#080909] hover:bg-[#10B981] disabled:opacity-50 text-white rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{mindMapData ? 'Regenerate Mind Map' : 'Generate Visual Mind Map'}</span>
              </button>
            </form>
          </div>

          {/* Node Inspector & In-Place Editor Card */}
          {selectedNode && (
            <div className="bg-white border border-[#DFE4F2] rounded-3xl p-5 space-y-3 shadow-sm text-left animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-[#DFE4F2] pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  Node Inspector & Editor
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  Level {selectedNode.id === mindMapData?.id ? '0 (Root)' : 'Branch'}
                </span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Branch Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Conceptual Explanation
                  </label>
                  <textarea
                    rows={3}
                    value={editExplanation}
                    onChange={(e) => setEditExplanation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 leading-relaxed"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveNodeEdit}
                    className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 shadow-xs cursor-pointer transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Edits</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddChildModal(true)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-slate-200"
                    title="Add a new sub-branch under this node"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Add Child</span>
                  </button>

                  {selectedNode.id !== mindMapData?.id && (
                    <button
                      type="button"
                      onClick={handleDeleteNode}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-200 cursor-pointer transition-colors"
                      title="Delete this branch and its children"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Canvas Themes Picker */}
          <div className="bg-white border border-[#DFE4F2] rounded-3xl p-5 space-y-3 shadow-sm text-left">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-emerald-500" />
              Canvas Theme
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(CANVAS_THEMES) as CanvasThemeId[]).map((themeKey) => {
                const t = CANVAS_THEMES[themeKey];
                const isSelected = canvasTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => setCanvasTheme(themeKey)}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs bg-emerald-50/50 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-slate-50/50'
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-inner shrink-0"
                      style={{ background: t.bg }}
                    />
                    <span className="truncate">{t.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: INTERACTIVE SVG MIND MAP CANVAS (8 COLS)       */}
        {/* ============================================================ */}
        <div className="lg:col-span-8 space-y-4">
          {/* Canvas Control Header Bar */}
          <div className="bg-white border border-[#DFE4F2] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Network className="w-4 h-4 text-[#10B981]" />
                Interactive Mind Map
              </span>

              {mindMapData && (
                <>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {totalNodesCount} Nodes
                  </span>

                  {/* Layout Mode Toggle: Horizontal Tree vs Radial Bilateral */}
                  <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setLayoutMode('horizontal')}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        layoutMode === 'horizontal'
                          ? 'bg-white text-emerald-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Horizontal Left-to-Right Hierarchy"
                    >
                      Tree
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutMode('radial')}
                      className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        layoutMode === 'radial'
                          ? 'bg-white text-emerald-600 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title="Bilateral Mind Map Hub"
                    >
                      Bilateral Hub
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Canvas Actions & Exports */}
            {mindMapData && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Search Bar in Canvas */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search topics..."
                    className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 w-32 sm:w-40"
                  />
                  {searchQuery && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-emerald-600 font-bold">
                      {searchMatches.size}
                    </span>
                  )}
                </div>

                {/* Expand / Collapse All */}
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  title="Expand all branches"
                >
                  Expand All
                </button>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                  title="Collapse to primary modules"
                >
                  Collapse
                </button>

                {/* Recenter Canvas */}
                <button
                  type="button"
                  onClick={handleRecenter}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg cursor-pointer transition-colors"
                  title="Recenter Mind Map"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                {/* Export Dropdown Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setExportMenuOpen(!exportMenuOpen)}
                    className="px-3 py-1 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>

                  {exportMenuOpen && (
                    <div
                      className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1.5 text-left animate-in fade-in slide-in-from-top-1"
                      onMouseLeave={() => setExportMenuOpen(false)}
                    >
                      <button
                        type="button"
                        onClick={handleExportPng}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                        <div>
                          <div className="font-semibold text-slate-900">PNG Image</div>
                          <div className="text-[10px] text-slate-500">High-resolution graphic</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportSvg}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <FileCode className="w-3.5 h-3.5 text-blue-500" />
                        <div>
                          <div className="font-semibold text-slate-900">Vector SVG</div>
                          <div className="text-[10px] text-slate-500">Infinite resolution vector</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportMarkdown}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        <div>
                          <div className="font-semibold text-slate-900">Markdown Outline (.md)</div>
                          <div className="text-[10px] text-slate-500">Hierarchical bullet notes</div>
                        </div>
                      </button>

                      <div className="border-t border-slate-100 my-1" />

                      <button
                        type="button"
                        onClick={handleExportJson}
                        className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
                        <div>
                          <div className="font-semibold text-slate-900">Mind Map JSON</div>
                          <div className="text-[10px] text-slate-500">Full structured tree data</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Toggle Fullscreen Canvas (Esc to exit)"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </button>
              </div>
            )}
          </div>

          {/* Canvas States */}
          {loading ? (
            <LoadingState toolName="Mind Map Hierarchy" />
          ) : error ? (
            <ErrorState message={error} onRetry={() => handleGenerate()} />
          ) : mindMapData && layoutResult ? (
            /* ============================================================ */
            /* INTERACTIVE SVG MIND MAP CANVAS CONTAINER                    */
            /* ============================================================ */
            <div
              ref={containerRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onWheel={handleWheel}
              className={`relative w-full h-[620px] rounded-3xl border overflow-hidden select-none shadow-xl transition-all cursor-${
                isPanning ? 'grabbing' : 'grab'
              }`}
              style={{
                backgroundColor: themeConfig.bg,
                borderColor: themeConfig.panelBorder
              }}
            >
              {/* Canvas Zoom & Navigation Floating HUD */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg">
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(0.4, prev - 0.15))}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[11px] font-mono font-bold text-white px-2 min-w-[48px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.15))}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-white/20 mx-0.5" />
                <button
                  type="button"
                  onClick={handleRecenter}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
                  title="Reset View to Center"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Floating Helper Pill */}
              <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-[11px] text-white/70">
                <Compass className="w-3.5 h-3.5 text-emerald-400" />
                <span>Drag to pan &bull; Scroll to zoom &bull; Click node to inspect</span>
              </div>

              {/* SVG Stage */}
              <svg
                ref={svgRef}
                className="w-full h-full"
                style={{
                  touchAction: 'none'
                }}
              >
                {/* Background Dot Pattern */}
                <defs>
                  <pattern
                    id="grid-pattern"
                    width="28"
                    height="28"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="2" cy="2" r="1.5" fill={themeConfig.gridDot} />
                  </pattern>

                  {/* Gradient Filter for Connections */}
                  <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                <rect width="100%" height="100%" fill="url(#grid-pattern)" />

                {/* Transform Group for Pan & Zoom */}
                <g
                  transform={`translate(${containerRef.current ? containerRef.current.clientWidth / 2 + panOffset.x : panOffset.x}, ${
                    containerRef.current ? containerRef.current.clientHeight / 2 + panOffset.y : panOffset.y
                  }) scale(${zoomLevel})`}
                  style={{ transition: isPanning ? 'none' : 'transform 0.1s ease-out' }}
                >
                  {/* ============================================================ */}
                  {/* RENDER BÉZIER CONNECTION EDGES                              */}
                  {/* ============================================================ */}
                  {layoutResult.edges.map((edge) => {
                    const dx = edge.endX - edge.startX;
                    const cx1 = edge.startX + dx * 0.5;
                    const cy1 = edge.startY;
                    const cx2 = edge.startX + dx * 0.5;
                    const cy2 = edge.endY;
                    const pathData = `M ${edge.startX} ${edge.startY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${edge.endX} ${edge.endY}`;

                    return (
                      <g key={edge.id}>
                        {/* Glow halo */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke={edge.color}
                          strokeWidth="6"
                          strokeOpacity="0.25"
                        />
                        {/* Main crisp line */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke={edge.color}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      </g>
                    );
                  })}

                  {/* ============================================================ */}
                  {/* RENDER NODES                                                */}
                  {/* ============================================================ */}
                  {layoutResult.nodes.map((node) => {
                    const isRoot = node.level === 0;
                    const isSelected = selectedNode?.id === node.id;
                    const palette = BRANCH_PALETTES[node.colorIndex % BRANCH_PALETTES.length];
                    const isMatched = searchMatches.has(node.id);

                    // Compute node colors based on theme and level
                    let fill = themeConfig.nodeFill;
                    let stroke = palette.stroke;
                    let textCol = themeConfig.nodeText;

                    if (isRoot) {
                      fill = themeConfig.rootFill;
                      stroke = themeConfig.rootStroke;
                      textCol = themeConfig.rootText;
                    } else if (canvasTheme === 'neon' || canvasTheme === 'emerald' || canvasTheme === 'midnight') {
                      if (isSelected) {
                        fill = palette.darkBg;
                        stroke = '#FFFFFF';
                      }
                    } else {
                      // Light Theme
                      if (isSelected) {
                        fill = palette.lightBg;
                        stroke = palette.stroke;
                      }
                    }

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${node.x - node.width / 2}, ${node.y - node.height / 2})`}
                        onClick={() => setSelectedNode(node.rawNode)}
                        className="mindmap-node cursor-pointer group"
                      >
                        {/* Search Highlight Glow Ring */}
                        {isMatched && (
                          <rect
                            x="-6"
                            y="-6"
                            width={node.width + 12}
                            height={node.height + 12}
                            rx="18"
                            fill="none"
                            stroke="#F59E0B"
                            strokeWidth="3.5"
                            strokeDasharray="4 2"
                            className="animate-pulse"
                          />
                        )}

                        {/* Selected Halo Ring */}
                        {isSelected && !isMatched && (
                          <rect
                            x="-4"
                            y="-4"
                            width={node.width + 8}
                            height={node.height + 8}
                            rx="16"
                            fill="none"
                            stroke={isRoot ? '#818CF8' : palette.stroke}
                            strokeWidth="2.5"
                            strokeOpacity="0.8"
                          />
                        )}

                        {/* Main Node Card Shape */}
                        <rect
                          width={node.width}
                          height={node.height}
                          rx={isRoot ? 16 : 12}
                          fill={fill}
                          stroke={stroke}
                          strokeWidth={isRoot ? 3 : isSelected ? 2.5 : 1.5}
                          className="transition-all duration-150 group-hover:filter group-hover:brightness-110 shadow-lg"
                        />

                        {/* Node Label Text */}
                        <text
                          x={node.width / 2}
                          y={node.height / 2}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={textCol}
                          fontSize={isRoot ? 14 : node.level === 1 ? 12 : 11}
                          fontWeight={isRoot ? 900 : node.level === 1 ? 700 : 600}
                          className="font-sans select-none pointer-events-none"
                        >
                          {node.title.length > 24 ? `${node.title.slice(0, 22)}…` : node.title}
                        </text>

                        {/* Expand / Collapse Button Pill for Nodes with Children */}
                        {node.hasChildren && !isRoot && (
                          <g
                            transform={`translate(${
                              node.side === 'right' ? node.width : 0
                            }, ${node.height / 2})`}
                            onClick={(e) => toggleCollapse(node.id, e as any)}
                            className="cursor-pointer"
                          >
                            <circle
                              r="9"
                              fill={palette.stroke}
                              stroke="#FFFFFF"
                              strokeWidth="1.5"
                              className="hover:scale-110 transition-transform"
                            />
                            <text
                              textAnchor="middle"
                              dominantBaseline="central"
                              fill="#FFFFFF"
                              fontSize="10"
                              fontWeight="bold"
                            >
                              {node.isCollapsed ? '+' : '−'}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              </svg>
            </div>
          ) : (
            <EmptyState
              title="No Mind Map Generated"
              description="Paste your syllabus modules or course topics on the left to render an interactive visual mind map graph."
              icon={<Network className="w-8 h-8 text-[#10B981]" />}
              actionHint="Supports Bézier curve branching, bilateral mind map layout, pan & zoom, search, and vector export."
            />
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* ADD CHILD BRANCH MODAL                                       */}
      {/* ============================================================ */}
      {showAddChildModal && selectedNode && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-left space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                Add Sub-branch to "{selectedNode.title}"
              </h3>
              <button
                type="button"
                onClick={() => setShowAddChildModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Sub-branch Topic Title *
                </label>
                <input
                  type="text"
                  required
                  value={newChildTitle}
                  onChange={(e) => setNewChildTitle(e.target.value)}
                  placeholder="e.g. Memory Management, Dijkstra's Algorithm..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Conceptual Explanation (Optional)
                </label>
                <textarea
                  rows={3}
                  value={newChildExplanation}
                  onChange={(e) => setNewChildExplanation(e.target.value)}
                  placeholder="Explain the core mechanism or study notes for this branch..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddChildNode}
                  disabled={!newChildTitle.trim()}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Add Branch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* IMMERSIVE FULLSCREEN PRESENTATION MODE                       */}
      {/* ============================================================ */}
      {isFullscreen && mindMapData && layoutResult && (
        <div className="fixed inset-0 z-[99999] bg-[#07090E] flex flex-col justify-between select-none overflow-hidden animate-in fade-in duration-150">
          {/* Top Fullscreen HUD */}
          <div className="w-full px-6 py-3 bg-black/60 backdrop-blur-md border-b border-white/10 flex items-center justify-between z-20 shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-700/60">
                {totalNodesCount} Nodes
              </span>
              <span className="text-sm font-bold text-white truncate max-w-md">
                {mindMapData.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Layout Switcher */}
              <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/15">
                <button
                  type="button"
                  onClick={() => setLayoutMode('horizontal')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                    layoutMode === 'horizontal' ? 'bg-emerald-600 text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Tree
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('radial')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
                    layoutMode === 'radial' ? 'bg-emerald-600 text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  Bilateral Hub
                </button>
              </div>

              {/* Theme Switcher */}
              <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-1">
                {(Object.keys(CANVAS_THEMES) as CanvasThemeId[]).map((tKey) => (
                  <button
                    key={tKey}
                    type="button"
                    onClick={() => setCanvasTheme(tKey)}
                    className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                      canvasTheme === tKey ? 'border-white scale-110 shadow-sm' : 'border-transparent opacity-60'
                    }`}
                    style={{ background: CANVAS_THEMES[tKey].bg }}
                    title={CANVAS_THEMES[tKey].name}
                  />
                ))}
              </div>

              {/* Recenter */}
              <button
                type="button"
                onClick={handleRecenter}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                title="Recenter"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Exit Fullscreen */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="px-3 py-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit (Esc)</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Canvas Body */}
          <div
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing overflow-hidden"
            style={{ backgroundColor: themeConfig.bg }}
          >
            {/* Zoom Controls HUD */}
            <div className="absolute top-4 left-6 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.max(0.4, prev - 0.15))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono font-bold text-white px-2">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((prev) => Math.min(2.5, prev + 0.15))}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* SVG Render */}
            <svg className="w-full h-full">
              <g
                transform={`translate(${window.innerWidth / 2 + panOffset.x}, ${
                  window.innerHeight / 2 + panOffset.y
                }) scale(${zoomLevel})`}
                style={{ transition: isPanning ? 'none' : 'transform 0.1s ease-out' }}
              >
                {layoutResult.edges.map((edge) => {
                  const dx = edge.endX - edge.startX;
                  const cx1 = edge.startX + dx * 0.5;
                  const cy1 = edge.startY;
                  const cx2 = edge.startX + dx * 0.5;
                  const cy2 = edge.endY;
                  const pathData = `M ${edge.startX} ${edge.startY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${edge.endX} ${edge.endY}`;

                  return (
                    <g key={edge.id}>
                      <path d={pathData} fill="none" stroke={edge.color} strokeWidth="6" strokeOpacity="0.25" />
                      <path d={pathData} fill="none" stroke={edge.color} strokeWidth="2.5" strokeLinecap="round" />
                    </g>
                  );
                })}

                {layoutResult.nodes.map((node) => {
                  const isRoot = node.level === 0;
                  const isSelected = selectedNode?.id === node.id;
                  const palette = BRANCH_PALETTES[node.colorIndex % BRANCH_PALETTES.length];

                  let fill = themeConfig.nodeFill;
                  let stroke = palette.stroke;
                  let textCol = themeConfig.nodeText;

                  if (isRoot) {
                    fill = themeConfig.rootFill;
                    stroke = themeConfig.rootStroke;
                    textCol = themeConfig.rootText;
                  }

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x - node.width / 2}, ${node.y - node.height / 2})`}
                      onClick={() => setSelectedNode(node.rawNode)}
                      className="cursor-pointer group"
                    >
                      {isSelected && (
                        <rect
                          x="-4"
                          y="-4"
                          width={node.width + 8}
                          height={node.height + 8}
                          rx="16"
                          fill="none"
                          stroke={isRoot ? '#818CF8' : palette.stroke}
                          strokeWidth="2.5"
                        />
                      )}
                      <rect
                        width={node.width}
                        height={node.height}
                        rx={isRoot ? 16 : 12}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={isRoot ? 3 : 1.5}
                      />
                      <text
                        x={node.width / 2}
                        y={node.height / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={textCol}
                        fontSize={isRoot ? 14 : 11}
                        fontWeight={isRoot ? 900 : 700}
                      >
                        {node.title.length > 24 ? `${node.title.slice(0, 22)}…` : node.title}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Floating Deep-Dive Inspector in Fullscreen */}
            {selectedNode && (
              <div className="absolute bottom-6 right-6 max-w-sm w-full bg-slate-950/95 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-4 shadow-2xl text-left space-y-2 z-30 animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    {selectedNode.id === mindMapData.id ? 'Root Hub' : 'Branch Concept'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedNode(null)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <h4 className="text-sm font-bold text-white">{selectedNode.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed max-h-40 overflow-y-auto">
                  {selectedNode.explanation || 'No explanation provided for this branch.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
