import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isDoubtSolver = location.pathname === '/doubt-solver';

  return (
    <div
      className={`${
        isDoubtSolver
          ? 'z-30 px-3 sm:px-6 pt-2 pb-1 w-full shrink-0'
          : 'sticky top-4 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pointer-events-none'
      }`}
    >
      <header
        className={`pointer-events-auto bg-[#F7F8FA]/90 backdrop-blur-md border border-[#DFE4F2] shadow-sm flex items-center justify-between transition-all ${
          isDoubtSolver
            ? 'rounded-2xl px-4 py-2 sm:px-5 sm:py-2.5 max-w-7xl mx-auto'
            : 'rounded-full px-5 py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
        }`}
      >
        {/* Brand: StudyNova AI */}
        <Link
          to="/"
          className="text-base sm:text-lg font-black tracking-tight text-[#080909] font-display flex items-center gap-2 hover:opacity-85 transition-opacity"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED] animate-pulse" />
          <span>StudyNova AI</span>
        </Link>

        {/* Minimal Navigation: Tools · How It Works · About */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#080909]/75 font-body">
          <a
            href="/#tools"
            className="hover:text-[#080909] transition-colors relative py-1 hover:underline underline-offset-4"
          >
            Tools
          </a>
          <Link
            to="/how-it-works"
            className={`hover:text-[#080909] transition-colors py-1 ${
              location.pathname === '/how-it-works'
                ? 'text-[#080909] font-bold underline underline-offset-4'
                : ''
            }`}
          >
            How It Works
          </Link>
          <Link
            to="/about"
            className={`hover:text-[#080909] transition-colors py-1 ${
              location.pathname === '/about'
                ? 'text-[#080909] font-bold underline underline-offset-4'
                : ''
            }`}
          >
            About
          </Link>
        </nav>

        {/* Action: [Explore Tools] */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="/#tools"
            className="group px-5 py-2 text-xs sm:text-sm font-bold text-white bg-[#080909] hover:bg-[#7C3AED] rounded-full transition-all duration-300 flex items-center gap-1.5 shadow-sm"
          >
            <span>Explore Tools</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <a
            href="/#tools"
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#080909] rounded-full"
          >
            Explore
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#080909] hover:bg-[#DFE4F2]/50 rounded-full transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Compact Mobile Menu */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto sm:hidden mt-2 bg-[#F7F8FA] border border-[#DFE4F2] rounded-3xl p-5 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-3 text-sm font-semibold text-[#080909]">
            <a
              href="/#tools"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#DFE4F2]/60 transition-colors"
            >
              Tools
            </a>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#DFE4F2]/60 transition-colors"
            >
              How It Works
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#DFE4F2]/60 transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl hover:bg-[#DFE4F2]/60 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* Quick Access to All 10 Tools */}
          <div className="pt-3 border-t border-[#DFE4F2] space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#080909]/60 px-1 font-body">
              All 10 AI Tools
            </span>
            <div className="grid grid-cols-1 gap-1 max-h-56 overflow-y-auto pr-1">
              {[
                { name: '01 AI Resume Builder', path: '/resume-builder' },
                { name: '02 AI Notes Generator', path: '/notes-generator' },
                { name: '03 AI Presentation Generator', path: '/presentation-generator' },
                { name: '04 AI Mind Map Generator', path: '/mind-map-generator' },
                { name: '05 Google Sheets Data Tool', path: '/google-sheets' },
                { name: '06 AI Quiz Generator', path: '/quiz-generator' },
                { name: '07 AI Doubt Solver', path: '/doubt-solver' },
                { name: '08 AI Flashcard Generator', path: '/flashcard-generator' },
                { name: '09 AI Study Planner', path: '/study-planner' },
                { name: '10 OCR Notes Summarizer', path: '/ocr-summarizer' }
              ].map((tool) => (
                <Link
                  key={tool.path}
                  to={tool.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#080909]/80 hover:text-[#080909] hover:bg-white transition-colors flex items-center justify-between"
                >
                  <span>{tool.name}</span>
                  <span className="text-[10px] text-[#7C3AED] font-bold">Open →</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
