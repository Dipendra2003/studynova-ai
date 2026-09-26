import React, { useState } from 'react';
import {
  Layers,
  RotateCw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Copy,
  Check,
  CheckCircle2
} from 'lucide-react';
import { ToolHeader } from '../components/ToolHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { EmptyState } from '../components/EmptyState';
import { generateFlashcardsAI } from '../services/aiService';
import { Flashcard } from '../types';

export const FlashcardGeneratorPage: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [material, setMaterial] = useState('');
  const [count, setCount] = useState<number>(6);
  const [difficulty, setDifficulty] = useState('Intermediate');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[] | null>(null);

  // Active player state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<{ [id: number]: boolean }>({});
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError('Please provide a topic for flashcard generation.');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds({});

    try {
      const generated = await generateFlashcardsAI({
        topic,
        material,
        count,
        difficulty
      });
      setCards(generated);
    } catch (err: any) {
      setError(err.message || 'Failed to generate flashcards.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!cards) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    if (!cards) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    if (!cards) return;
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const toggleMastered = (id: number) => {
    setMasteredIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = () => {
    if (!cards) return;
    const txt = cards.map((c, i) => `CARD ${i + 1}:\nQ: ${c.question}\nA: ${c.answer}`).join('\n\n');
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!cards) return;
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(cards, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `flashcards_${topic.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <ToolHeader
        toolNumber="08"
        title="AI Flashcard Generator"
        subtitle="Turn study material into interactive revision cards."
        icon={<Layers className="w-6 h-6 text-[#2563EB]" />}
        badge="Active Recall"
        category="Revision & Memory"
        statusText="AI Ready"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#DFE4F2] rounded-3xl p-6 sm:p-7 space-y-4 shadow-sm text-left transition-all">
          <div className="border-b border-[#DFE4F2] pb-3">
            <h2 className="text-xs font-bold text-[#080909] uppercase tracking-wider font-display">
              Flashcard Setup
            </h2>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-800 dark:text-slate-200 font-semibold block mb-1">Topic or Chapter *</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="e.g. JavaScript Closures, Cell Biology..."
              />
            </div>

            <div>
              <label className="text-slate-600 dark:text-slate-400 block mb-1">Study Text (Optional)</label>
              <textarea
                rows={4}
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                placeholder="Paste key definitions or paragraphs to synthesize into cards..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Deck Size</label>
                <select
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-200"
                >
                  <option value={4}>4 Cards</option>
                  <option value={6}>6 Cards</option>
                  <option value={8}>8 Cards</option>
                  <option value={10}>10 Cards</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 dark:text-slate-400 block mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-200"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-5 bg-[#080909] hover:bg-[#8B5CF6] disabled:opacity-50 text-white rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer pt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{cards ? 'Regenerate with AI' : 'Generate with AI'}</span>
            </button>
          </form>
        </div>

        {/* Right 3D Player Arena (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm transition-colors">
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              3D Interactive Deck Player
            </span>

            {cards && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShuffle}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" /> Shuffle
                </button>
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> JSON
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <LoadingState toolName="3D Flashcard Deck" />
          ) : error ? (
            <ErrorState message={error} onRetry={() => handleGenerate()} />
          ) : cards && cards.length > 0 ? (
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl text-center transition-colors">
              {/* Deck Counter & Mastery */}
              <div className="flex justify-between items-center text-xs font-mono text-slate-500 dark:text-slate-400">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                  Card {currentIndex + 1} of {cards.length}
                </span>
                <button
                  onClick={() => toggleMastered(cards[currentIndex].id)}
                  className={`px-3 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                    masteredIds[cards[currentIndex].id]
                      ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{masteredIds[cards[currentIndex].id] ? 'Mastered' : 'Mark Mastered'}</span>
                </button>
              </div>

              {/* 3D Flip Card */}
              <div className="perspective-1000 w-full max-w-xl mx-auto h-[260px] sm:h-[300px]">
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  className={`relative w-full h-full duration-500 transform-style-3d cursor-pointer rounded-2xl shadow-xl transition-transform ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-50/80 via-white to-indigo-100/60 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/80 border-2 border-indigo-300 dark:border-indigo-500/40 rounded-2xl p-6 sm:p-8 flex flex-col justify-between text-center">
                    <div className="flex justify-between items-center text-[11px] font-mono text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                      <span>Front · Question</span>
                      <span>Tap to Reveal</span>
                    </div>
                    <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-white my-auto px-4 leading-relaxed">
                      {cards[currentIndex].question}
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Click or tap anywhere to flip card</span>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-100/60 dark:from-indigo-950 dark:via-slate-950 dark:to-slate-900 border-2 border-emerald-300 dark:border-emerald-500/40 rounded-2xl p-6 sm:p-8 flex flex-col justify-between text-center">
                    <div className="flex justify-between items-center text-[11px] font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      <span>Back · Answer</span>
                      <span>Tap to Flip Back</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 my-auto px-4 leading-relaxed font-medium">
                      {cards[currentIndex].answer}
                    </p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Click card again to view question</span>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex justify-center items-center gap-4 pt-2">
                <button
                  onClick={handlePrev}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <RotateCw className="w-4 h-4" /> Flip Card
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No Flashcard Deck Generated"
              description="Configure your study topic on the left and click 'Generate Revision Cards' to spin up your 3D revision deck."
              icon={<Layers className="w-8 h-8 text-indigo-400" />}
              actionHint="Hardware-accelerated CSS 3D flip animation with active recall answer verification."
            />
          )}
        </div>
      </div>
    </div>
  );
};
