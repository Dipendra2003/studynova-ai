# StudyNova AI

**Learn Smarter. Create Faster. Your AI-Powered Student Workspace.**

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![Built with React](https://img.shields.io/badge/React-19.x-blue.svg)](https://reactjs.org/)
[![Powered by Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)](https://ai.google.dev/)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com/)

StudyNova AI is a premium, all-in-one creative learning platform uniting **10 practical AI instruments** for curious students, ambitious researchers, and modern creators. Powered by the **Gemini AI Engine**, this application delivers a beautiful glassmorphism UI, blazing fast tools, and comprehensive academic support with zero paywalls.

---

## Workspace Directory

StudyNova AI provides 10 dedicated workspaces, each meticulously designed to solve a specific academic challenge:

| Workspace | Description | Key Features |
|---|---|---|
| **AI Resume Builder** | Create professional, ATS-compliant resumes instantly. | Vector PDF export, AI-assisted bullet points, ATS formatting |
| **AI Notes Generator** | Turn raw study material into perfectly structured markdown notes. | Auto-formatting, Highlight generation, Easy export |
| **AI Presentation Generator** | Get complete slide-by-slide presentation deck layouts. | Speaker scripts, visual cues, key takeaways |
| **AI Mind Map Generator** | Convert dense subjects into interactive, visual mind maps. | SVG rendering, hierarchical trees, zoom/pan UI |
| **Google Sheets Data Tool** | Connect Google Sheets as a live zero-maintenance database. | Live sync, cohort analytics, instant AI insights |
| **AI Quiz Generator** | Generate interactive multiple-choice quizzes from topics. | Instant grading, detailed explanations, active recall |
| **AI Doubt Solver** | Step-by-step tutoring chat environment. | Relatable analogies, continuous chat, deep-dive explanations |
| **AI Flashcard Generator** | Flippable 3D flashcards designed for spaced repetition. | Interactive 3D CSS, shuffle mode, score tracking |
| **AI Study Planner** | Generate highly personalized, day-wise study timetables. | Priority matrix, exam countdowns, balanced scheduling |
| **OCR Notes Summarizer** | Extract, analyze, and summarize handwritten notes. | Multimodal OCR, handwriting recognition, math extraction |

---

## UI & Design System

StudyNova AI is built with a focus on premium aesthetics and user experience:
- **Glassmorphism:** Frosted glass effects, dynamic gradients, and vibrant accents.
- **Micro-interactions:** Smooth hover states, playful animations, and tactile feedback.
- **Export Ready:** One-click Vector PDF downloads and clean print styling.
- **Responsive:** Fully optimized for mobile, tablet, and desktop viewing.

---

## Technology Stack

- **Frontend Framework:** React 19 with TypeScript and Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React & Custom SVG integrations
- **AI Integration:** Google Gemini API (`@google/genai`)
- **Server:** Express.js + Vercel Serverless Functions
- **Utilities:** `jspdf` (PDF generation), `html2canvas` (Visual capture)

---

## Getting Started

Follow these steps to run StudyNova AI locally on your machine.

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** or **yarn**
- **Gemini API Key:** Get it for free from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/Dipendra2003/studynova-ai.git
cd studynova-ai
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment Setup:**
Create a `.env` file in the root directory and add your API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Start the development server:**
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`.

---

## Deploy to Vercel

1. Push your code to GitHub.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your `studynova-ai` repository.
4. Add the environment variable:
   - `GEMINI_API_KEY`: `your_gemini_api_key_here`
5. Click **"Deploy"**.

---

## Author & Developer

- **Dipendra Kumar**
- **GitHub:** [@Dipendra2003](https://github.com/Dipendra2003)
- **LinkedIn:** [Dipendra Kumar](https://www.linkedin.com/in/dipendra-kumar-b077b9286/)
- **Portfolio:** [portfolio-dipendra.vercel.app](https://portfolio-dipendra.vercel.app/)
- **Email:** dipendrak299@gmail.com

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
