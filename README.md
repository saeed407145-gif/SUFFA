# 🏫 Al-Suffa School Management System & Gemini AI Copilot

A modern, multi-user academic administration and institutional management platform built for **Al-Suffa Schools (Science & Grammar, Lahore)**. Powered by **React 18**, **TypeScript**, **Node.js/Express**, **Firebase Firestore**, and **Google's Gemini 3.7 Flash AI**, this system provides end-to-end management of student admissions, daily attendance logging, fee recovery, academic grading, classroom inventory, and AI-driven pedagogical analytics.

---

## 🌟 Key Features

### 🔐 1. Multi-Role Authentication & Access Control (RBAC)
* **Student Gateway**:
  * Sign in via Class Roll Number and optional password.
  * Self-service **Student Sign Up** with immediate Firestore persistence (Name, Grade, Roll No, Guardian info, Contact).
* **Faculty / Teacher Portal**:
  * Email and password-based authentication.
  * Teacher registration with subject specialization, academic qualifications, and class assignment.
* **Secure Administrator Node**:
  * Protected Principal and Administrative Gateway.
  * Secondary administrator node creation secured by the **Master System Key** (`admin123` / `alsuffa2026`).

---

### 🖥️ 2. Role-Based Workspaces & Dashboards

* **🎓 Student Portal**:
  * **Academic Scorecard**: Subject-wise mark sheets, GPAs, percentages, and teacher remarks.
  * **Attendance Tracker**: Daily present/absent statistics with real-time percentage indicators.
  * **Fee Ledger**: Monthly fee status, receipt numbers, and payment verification.
  * **Leave Application System**: Digital leave submission with live approval status from class teachers.
  * **School Feedback**: Direct, private channel for student feedback and suggestions.

* **👨‍🏫 Teacher Workspace**:
  * **Academic Grading**: Term and Mid-Term grade entry, score updates, and automated GPA calculation.
  * **Daily Attendance Logger**: Quick one-click classroom roll call with bulk 'Mark All Present' and date-based logging.
  * **Leave Approvals**: Review and approve/reject pending student leave requests.

* **🏛️ Principal & Administrator Operations**:
  * **Student Admissions**: Complete registration lifecycle with roll number validation and contact records.
  * **Fee Management**: Monthly fee tracking, billing statements, pending dues monitoring, and fee status toggling.
  * **Faculty Registry**: Staff roster management with salary scales, contact numbers, and subject allocation.
  * **Supply & Inventory Control**: Classroom asset tracking with low-stock alerts, reorder thresholds, and expiration dates.
  * **Master Analytics**: High-level enrollment metrics, revenue projections, and attendance health summaries.

---

### 🤖 3. Gemini 3.7 Flash AI Assistant

Integrated directly into the dark-themed dashboard via a secure, server-side Express API powered by the `@google/genai` SDK:

1. 💬 **AI Administrative Chat**:
   * Conversational assistant for drafting parent circulars, resolving timetable conflicts, and creating school policies.
   * Real-time loading states, session history, and quick-prompt suggestions.
2. 📊 **Student Performance Analysis**:
   * Evaluates live Firestore academic grades and exam records.
   * Identifies honor roll students, flags students requiring academic remediation, and pinpoints subject-level bottlenecks.
3. ⏱️ **Attendance Insights & Absenteeism Auditor**:
   * Analyzes daily attendance logs from Firestore.
   * Highlights chronic absenteeism (< 75% attendance) and recommends parent notification triggers.
4. 📚 **AI Lesson Planner**:
   * Generates curriculum-aligned lesson plans by Class, Subject, Topic, Duration, and Aptitude level.
   * Formats Bloom's taxonomy objectives, timed step-by-step delivery hooks, activities, and differentiated homework.
5. 📝 **AI Quiz & Exam Generator**:
   * Generates board-standard examination test papers (MCQs, Short Questions, Numerical Problems).
   * Generates a confidential Teacher Marking Scheme & Answer Key.
6. 📋 **Executive AI School Report**:
   * Synthesizes live school metrics (student distribution, fee collection, attendance rates, inventory alerts) into an official quarterly institutional audit.

---

## 🛠️ Tech Stack & Libraries

* **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React Icons
* **Backend**: Node.js, Express, `tsx` (Dev runtime), `esbuild` (Production bundler)
* **AI Engine**: Google Gemini API (`@google/genai` SDK, model: `gemini-3.7-flash`)
* **Database & Persistence**: Google Cloud Firestore & Firebase Client SDK (with offline cache support)
* **Desktop Context**: Reference implementation also includes CustomTkinter Python desktop architecture (`school_app.py`).

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the root directory (refer to `.env.example`):

```env
# Gemini API Key (Required for AI features - kept secure on server)
GEMINI_API_KEY=your_gemini_api_key_here

# Server Port (Default is 3000)
PORT=3000

# Node Environment
NODE_ENV=development
