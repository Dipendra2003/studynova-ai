import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-8">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-white hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 mb-6 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Last updated: September 2026
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed shadow-xl transition-colors">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">1. Student Data Protection</h2>
          <p>
            StudyNova AI is designed with student privacy as a foundational principle. We do not sell, rent, or monetize your personal information or academic submissions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">2. Information You Provide</h2>
          <p>
            When using our services (such as the AI Resume Builder, Notes Generator, or Study Planner), information you type into form fields is processed strictly to generate your requested academic documents and outputs.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">3. Local & Client-Side Processing</h2>
          <p>
            Your generated resumes, study notes, quiz scores, and flashcard decks are held in your browser session. We do not permanently store your confidential study notes on private ad-tracking databases.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">4. Google Sheets Integration</h2>
          <p>
            When you connect a Google Sheets Web App URL in the Google Sheets tool, all data queries communicate directly between your browser and your personal Google Apps Script deployment. We do not inspect or retain your private spreadsheet credentials.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">5. Contact Us</h2>
          <p>
            If you have questions regarding this Privacy Policy or student data practices, please reach out via our{' '}
            <Link to="/contact" className="text-indigo-600 hover:underline font-medium">
              Contact & Feedback page
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
};
