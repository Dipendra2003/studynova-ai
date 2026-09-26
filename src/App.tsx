import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
import { NotesGeneratorPage } from './pages/NotesGeneratorPage';
import { PresentationGeneratorPage } from './pages/PresentationGeneratorPage';
import { MindMapGeneratorPage } from './pages/MindMapGeneratorPage';
import { GoogleSheetsPage } from './pages/GoogleSheetsPage';
import { QuizGeneratorPage } from './pages/QuizGeneratorPage';
import { DoubtSolverPage } from './pages/DoubtSolverPage';
import { FlashcardGeneratorPage } from './pages/FlashcardGeneratorPage';
import { StudyPlannerPage } from './pages/StudyPlannerPage';
import { OCRSummarizerPage } from './pages/OCRSummarizerPage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

const TOOL_ROUTES = new Set([
  '/resume-builder',
  '/notes-generator',
  '/presentation-generator',
  '/mind-map-generator',
  '/google-sheets',
  '/quiz-generator',
  '/doubt-solver',
  '/flashcard-generator',
  '/study-planner',
  '/ocr-summarizer'
]);

// Hide Footer inside tools so workspaces remain clean, focused, and free of clutter
function ConditionalFooter() {
  const { pathname } = useLocation();
  if (TOOL_ROUTES.has(pathname)) {
    return null;
  }
  return <Footer />;
}

function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const isDoubtSolver = pathname === '/doubt-solver';

  return (
    <div
      className={`${
        isDoubtSolver ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen'
      } bg-[#F0EEFA] text-[#080909] flex flex-col font-body selection:bg-[#7C3AED] selection:text-white transition-colors duration-200`}
    >
      <Navbar />

      <main className={`flex-1 ${isDoubtSolver ? 'min-h-0 flex flex-col overflow-hidden' : ''}`}>
        {children}
      </main>

      <ConditionalFooter />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <MainContentWrapper>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resume-builder" element={<ResumeBuilderPage />} />
            <Route path="/notes-generator" element={<NotesGeneratorPage />} />
            <Route path="/presentation-generator" element={<PresentationGeneratorPage />} />
            <Route path="/mind-map-generator" element={<MindMapGeneratorPage />} />
            <Route path="/google-sheets" element={<GoogleSheetsPage />} />
            <Route path="/quiz-generator" element={<QuizGeneratorPage />} />
            <Route path="/doubt-solver" element={<DoubtSolverPage />} />
            <Route path="/flashcard-generator" element={<FlashcardGeneratorPage />} />
            <Route path="/study-planner" element={<StudyPlannerPage />} />
            <Route path="/ocr-summarizer" element={<OCRSummarizerPage />} />

            {/* Platform info routes */}
            <Route path="/about" element={<AboutPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
        </MainContentWrapper>
      </BrowserRouter>
    </ThemeProvider>
  );
}
