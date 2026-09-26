import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowLeft } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-8">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 mb-6 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-600/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">
              Terms of Service
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Last updated: September 2026
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed shadow-xl transition-colors">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing and using StudyNova AI, you agree to comply with these terms. These services are provided freely to empower students, researchers, and educators with artificial intelligence study aids.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Educational & Academic Integrity</h2>
          <p>
            StudyNova AI is designed to assist learning, concept breakdown, active recall revision, and career readiness. Users are responsible for adhering to their academic institution's honor codes and policies regarding AI usage in coursework.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">3. User Content & Ownership</h2>
          <p>
            You retain all rights and ownership to the inputs you provide and the documents (resumes, notes, study timetables, presentations) generated using our platform. You may freely download, distribute, and publish your generated materials.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Availability & Warranties</h2>
          <p>
            While we strive for 100% uptime and high generation quality, the service is provided on an "as-is" basis. AI model outputs should always be reviewed for accuracy before formal submission.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Inquiries & Feedback</h2>
          <p>
            For questions or suggestions regarding these terms, visit our{' '}
            <Link to="/contact" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Contact & Feedback page
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
};
