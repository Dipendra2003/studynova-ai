<div align="center">
  <img src="public/favicon.jpg" alt="StudyNova AI Logo" width="90" height="90" style="border-radius: 20px; box-shadow: 0 10px 25px rgba(124, 58, 237, 0.3); max-width: 100%; height: auto;" />

  # StudyNova AI
  ### Learn Smarter. Create Faster. Build with AI.

  <p align="center">
    <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-7C3AED.svg?style=for-the-badge" alt="License: MIT" /></a>
    <a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-19.x-2563EB.svg?style=for-the-badge&logo=react&logoColor=white" alt="Built with React" /></a>
    <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/AI-Google%20Gemini-F59E0B.svg?style=for-the-badge&logo=google&logoColor=white" alt="Powered by Gemini" /></a>
    <a href="https://vercel.com/"><img src="https://img.shields.io/badge/Deploy-Vercel-000000.svg?style=for-the-badge&logo=vercel&logoColor=white" alt="Deploy with Vercel" /></a>
  </p>

  <p align="center">
    <strong>An all-in-one creative AI learning suite packed with 10 practical instruments for students, researchers, and creators.</strong>
  </p>

  <p align="center">
    <a href="#-the-10-workspaces">Explore Tools</a> •
    <a href="#-getting-started">Quickstart</a> •
    <a href="#-deploy-to-vercel">Deploy to Vercel</a> •
    <a href="#-tech-stack">Tech Stack</a>
  </p>
</div>

---

## 🌟 The 10 Workspaces

StudyNova AI provides 10 dedicated workspaces engineered for speed, accuracy, and ease of use on both mobile and desktop.

<br />

<details open>
<summary><strong>📄 01. AI Resume Builder</strong> <code>/resume-builder</code></summary>
<br />

* **Purpose:** Create professional, ATS-compliant resumes tailored to specific roles.
* **Key Features:** Live ATS score auditor, single-page A4 vector PDF export, customizable sections (Skills, Projects, Experience).
* **Highlights:** Zero canvas rasterization, passes automated scanners with 98%+ match.
</details>

<details open>
<summary><strong>📝 02. AI Notes Generator</strong> <code>/notes-generator</code></summary>
<br />

* **Purpose:** Turn raw study material and complex topics into structured revision notes.
* **Key Features:** Clean markdown formatting, exam points, summary highlights, and vector PDF downloads.
* **Highlights:** Multi-tier academic parser with customizable depth (Concise, Standard, Deep Dive).
</details>

<details open>
<summary><strong>📊 03. AI Presentation Generator</strong> <code>/presentation-generator</code></summary>
<br />

* **Purpose:** Generate complete slide decks with slide-by-slide speaker scripts.
* **Key Features:** Interactive presentation player, color theme palette picker, visual cues, and slide PDF export.
</details>

<details open>
<summary><strong>🧠 04. AI Mind Map Generator</strong> <code>/mind-map-generator</code></summary>
<br />

* **Purpose:** Convert dense syllabi and concepts into interactive visual trees.
* **Key Features:** Interactive SVG rendering, hierarchical node explorer, responsive zoom & pan, SVG download.
</details>

<details open>
<summary><strong>📈 05. Google Sheets Data Tool</strong> <code>/google-sheets</code></summary>
<br />

* **Purpose:** Connect Google Sheets as a live zero-maintenance database.
* **Key Features:** Instant sync, student cohort analytics, dynamic filters, and automated AI data insights.
</details>

<details open>
<summary><strong>🎯 06. AI Quiz Generator</strong> <code>/quiz-generator</code></summary>
<br />

* **Purpose:** Generate interactive multiple-choice quizzes for self-assessment.
* **Key Features:** Instant grading, question breakdown, real-time Socratic explanations, active recall mode.
</details>

<details open>
<summary><strong>💡 07. AI Doubt Solver</strong> <code>/doubt-solver</code></summary>
<br />

* **Purpose:** Step-by-step tutoring chat environment with relatable real-world analogies.
* **Key Features:** Socratic explanations, code debugging assistance, math formula breakdowns, conversational chat.
</details>

<details open>
<summary><strong>🗂️ 08. AI Flashcard Generator</strong> <code>/flashcard-generator</code></summary>
<br />

* **Purpose:** Interactive 3D flippable study cards built for spaced repetition.
* **Key Features:** 3D CSS flip animations, deck shuffle, score tracking, and revision modes.
</details>

<details open>
<summary><strong>📅 09. AI Study Planner</strong> <code>/study-planner</code></summary>
<br />

* **Purpose:** Generate personalized day-wise study timetables and exam countdowns.
* **Key Features:** Priority subject matrix, customizable daily slots, balanced revision pace, PDF schedule export.
</details>

<details open>
<summary><strong>📷 10. OCR Notes Summarizer</strong> <code>/ocr-summarizer</code></summary>
<br />

* **Purpose:** Scan handwritten lecture notes or whiteboard photos and generate concise summaries.
* **Key Features:** Multimodal OCR extraction, handwriting recognition, key formula detection, quick revision notes.
</details>

---

## 🎨 UI & Design Highlights

* **Pure Light Theme:** Crisp, high-contrast, modern aesthetic locked across all mobile and desktop devices.
* **Mobile-First Responsive:** Fluid layouts optimized for touch screens, tablets, and large monitors.
* **Zero Paywalls:** 100% free access to all 10 tools with live Gemini AI processing.
* **Direct Exports:** One-click Vector PDF downloads and clean print styling.

---

## ⚡ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Icons & UI** | Lucide React, Motion, Canvas Capture |
| **AI Integration** | Google Gemini API (`@google/genai`) |
| **Backend & Serverless** | Express.js, Node.js, Vercel Serverless Functions |
| **Export Utilities** | `jspdf`, `html2canvas` |

---

## 🚀 Getting Started

Run StudyNova AI locally in a few easy steps:

### 1. Clone the repository
```bash
git clone https://github.com/Dipendra2003/studynova-ai.git
cd studynova-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
> *Get a free API key from [Google AI Studio](https://aistudio.google.com/).*

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel

1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import your **`studynova-ai`** repository.
4. Under **Environment Variables**, add:
   * **Key:** `GEMINI_API_KEY`
   * **Value:** `your_gemini_api_key_here`
5. Click **"Deploy"** 🚀.

---

## 👨‍💻 Author & Developer

<div align="center">

**Dipendra Kumar**

[![GitHub](https://img.shields.io/badge/GitHub-Dipendra2003-181717?style=flat-square&logo=github)](https://github.com/Dipendra2003)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/dipendra-kumar-b077b9286/)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit%20Website-7C3AED?style=flat-square&logo=google-chrome&logoColor=white)](https://portfolio-dipendra.vercel.app/)
[![Email](https://img.shields.io/badge/Email-dipendrak299@gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:dipendrak299@gmail.com)

</div>

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

<div align="center">
  <sub>Built with ❤️ for learners, creators, and students worldwide.</sub>
</div>
