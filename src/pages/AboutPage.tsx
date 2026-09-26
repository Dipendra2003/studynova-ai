import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Code2, ArrowRight, Sparkles, Zap, BrainCircuit, Globe, Rocket, Target, Eye, User, Mail, ExternalLink } from 'lucide-react';
import { Github, Linkedin } from '../components/SocialIcons';
import dipendraProfileImg from '../assets/images/dipendra-profile.jpg';

export const AboutPage: React.FC = () => {
  return (
    <div className="relative min-h-screen text-[#080909] dark:text-white overflow-hidden pb-20">
      {/* Background Gradients & Effects */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-indigo-500/10 to-transparent rounded-full blur-[120px] pointer-events-none -translate-y-1/3 translate-x-1/3" />
      <div className="absolute top-1/2 left-0 w-[800px] h-[800px] bg-gradient-to-t from-pink-500/10 to-transparent rounded-full blur-[120px] pointer-events-none -translate-x-1/4" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 relative z-10 space-y-16">
        
        {/* Header Section */}
        <div className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-4 py-2 rounded-full ring-1 ring-indigo-500/20 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Our Creative Mission</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-[#080909] dark:text-white tracking-tight font-display leading-[1.1]">
            Empowering the next generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-500">learners & creators.</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#080909]/75 dark:text-slate-300 font-body leading-relaxed">
            StudyNova AI is a playful, creative workspace uniting 10 practical AI instruments for curious students, ambitious researchers, and modern creators.
          </p>
        </div>

        {/* Vision & Story Section (Glassmorphism Card) */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-800 rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center relative z-10">
            <div className="space-y-6 text-base sm:text-lg text-[#080909]/80 dark:text-slate-300 font-body leading-relaxed">
              <h3 className="text-2xl font-black text-[#080909] dark:text-white font-display">The Problem with Traditional EdTech</h3>
              <p>
                Traditional AI education is often split between dry theoretical formulas on one hand and generic, uninspiring corporate chatbots on the other. Students rarely get to experience how modern artificial intelligence integrates directly into specialized, purpose-built applications to solve real study bottlenecks.
              </p>
              <p>
                We built this suite to re-imagine that experience: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">playful yet rigorous, experimental yet deeply usable.</strong>
              </p>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-inner">
              <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Powered by Gemini AI</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Google's advanced multimodal engine</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                "Our goal is to provide 10 distinct, self-contained educational micro-services—ranging from career preparation tools like the ATS AI Resume Builder to multimodal study aids like the OCR Note Summarizer."
              </p>
            </div>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-8 border border-white/40 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/20 transition-colors" />
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 border border-indigo-200 dark:border-indigo-800">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-[#080909] dark:text-white font-display mb-4">Our Mission</h3>
            <p className="text-[#080909]/75 dark:text-slate-300 font-body leading-relaxed text-sm sm:text-base">
              To democratize access to advanced AI education technology. We aim to break down paywalls and provide students worldwide with open access to high-quality, specialized tools that accelerate learning and deep comprehension.
            </p>
          </div>

          {/* Vision Card */}
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-8 border border-white/40 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-pink-500/20 transition-colors" />
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/50 rounded-2xl flex items-center justify-center text-pink-600 dark:text-pink-400 mb-6 border border-pink-200 dark:border-pink-800">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-[#080909] dark:text-white font-display mb-4">Our Vision</h3>
            <p className="text-[#080909]/75 dark:text-slate-300 font-body leading-relaxed text-sm sm:text-base">
              A future where artificial intelligence isn't just a generic chatbot, but a deeply integrated partner in the creative and academic process. We envision a unified workspace where every study bottleneck is solved by a dedicated AI micro-service.
            </p>
          </div>
        </div>

        {/* Developer Details Section */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40 dark:border-slate-800 relative overflow-hidden text-center sm:text-left">
          
          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 relative z-10">
            {/* Developer Avatar/Icon */}
            <div className="w-32 h-32 sm:w-48 sm:h-48 shrink-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-1.5 rounded-full shadow-2xl relative group">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 overflow-hidden">
                <img src={dipendraProfileImg} alt="Dipendra Kumar - Full Stack Developer" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
            </div>
            
            {/* Developer Info */}
            <div className="space-y-4 flex-1">
              <div className="inline-flex items-center justify-center sm:justify-start gap-2 text-[10px] font-bold uppercase tracking-wider text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-500/10 px-3 py-1 rounded-full border border-pink-200 dark:border-pink-500/20">
                <Code2 className="w-3 h-3" />
                <span>Lead Developer</span>
              </div>
              <div>
                <h3 className="text-2xl sm:text-4xl font-black text-[#080909] dark:text-white font-display">Dipendra Kumar</h3>
                <h4 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600 dark:from-indigo-400 dark:to-pink-400 mt-1">Full-Stack AI Developer</h4>
                <p className="text-[#080909]/75 dark:text-slate-400 font-body mt-3 max-w-xl text-sm sm:text-base leading-relaxed mx-auto sm:mx-0">
                  I'm a passionate Full-Stack Developer specializing in modern AI-driven web applications. My goal is to build accessible, high-performance tools that bridge the gap between complex artificial intelligence and practical student needs. 
                  <br/><br/>
                  StudyNova AI represents my commitment to pushing the boundaries of React, TypeScript, and the Gemini Multimodal API to build scalable software that makes a real difference in education.
                </p>
                
                {/* Developer Social Links */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-6">
                  <a href="https://github.com/Dipendra2003" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-white transition-colors border border-slate-200 dark:border-slate-700">
                    <Github className="w-4 h-4" />
                  </a>
                  <a href="https://www.linkedin.com/in/dipendra-kumar-b077b9286/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-600 flex items-center justify-center text-slate-700 dark:text-white hover:text-indigo-600 transition-colors border border-slate-200 dark:border-slate-700">
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a href="mailto:dipendrak299@gmail.com" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-600 flex items-center justify-center text-slate-700 dark:text-white hover:text-pink-600 transition-colors border border-slate-200 dark:border-slate-700">
                    <Mail className="w-4 h-4" />
                  </a>
                  <a href="https://portfolio-dipendra.vercel.app/" target="_blank" rel="noreferrer" className="px-4 h-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-slate-200 flex items-center justify-center text-slate-700 dark:text-white hover:text-white dark:hover:text-slate-900 transition-colors border border-slate-200 dark:border-slate-700 text-xs font-bold gap-2">
                    <span>Portfolio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values Grid */}
        <div className="space-y-8">
          <h3 className="text-2xl font-black text-center text-[#080909] dark:text-white font-display">Our Core Pillars</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <ShieldCheck className="w-6 h-6 text-emerald-500" />,
                title: '100% Free Access',
                desc: 'Zero paywalls, zero subscription tiers, and no credit card gates. Learn without friction.'
              },
              {
                icon: <Code2 className="w-6 h-6 text-indigo-500" />,
                title: 'Modern Tech Stack',
                desc: 'Crafted in React, TypeScript, and Tailwind CSS with server-side AI processing.'
              },
              {
                icon: <Zap className="w-6 h-6 text-amber-500" />,
                title: 'Instant Execution',
                desc: 'Generate PDFs, presentations, mind maps, and live data in seconds, not minutes.'
              },
              {
                icon: <Globe className="w-6 h-6 text-pink-500" />,
                title: 'Accessible Anywhere',
                desc: 'A responsive workspace built for desktops, tablets, and phones on the go.'
              }
            ].map((value, idx) => (
              <div key={idx} className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-6 rounded-2xl border border-white/40 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:-translate-y-1 transition-transform group">
                <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  {value.icon}
                </div>
                <h4 className="font-bold text-[#080909] dark:text-white mb-2">{value.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center pt-10 border-t border-slate-200 dark:border-slate-800 gap-6">
          <Link to="/" className="text-sm font-bold text-slate-500 hover:text-[#080909] dark:hover:text-white transition-colors flex items-center gap-2">
            ← Return to Home
          </Link>
          <Link
            to="/#tools"
            className="group px-8 py-4 bg-[#080909] dark:bg-white hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white dark:text-slate-900 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Rocket className="w-4 h-4" />
            <span>Explore All 10 Tools</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

      </div>
    </div>
  );
};

