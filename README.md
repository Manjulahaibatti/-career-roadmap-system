# Career Roadmap System 🚀

A modern full-stack career navigation platform built with **React (Vite)**, **Node.js/Express**, and **MongoDB**.

---

## 🛠️ How to Open & Run in VS Code

### Step 1: Open the Project in VS Code
1. Open **Visual Studio Code**.
2. Click **File** → **Open Folder...**
3. Select the folder:
   `C:\Users\Kannika naik\Documents\career-roadmap-system`

---

### Step 2: Open Terminal in VS Code
Press `Ctrl + ~` (or go to top menu: **Terminal** → **New Terminal**).

---

### Step 3: Run the Application (1 Single Command!)

In your VS Code terminal, simply run:
```powershell
npm run dev
```

This single command automatically starts **BOTH**:
1. 🟢 **Backend API Server** on `http://localhost:5000`
2. 🟣 **Frontend Client** on `http://localhost:5173`

Then open [**`http://localhost:5173`**](http://localhost:5173) in your browser!

---

#### Alternative Run Modes:

- **Production Unified Mode** (Frontend + Backend on the exact same port `5000`):
  ```powershell
  npm start
  ```
  Open `http://localhost:5000`

- **Manual Separate Terminals**:
  - Terminal 1: `npm run server` (or `cd backend && node server.js`)
  - Terminal 2: `npm run client` (or `cd frontend && npm run dev`)

---

## 🗄️ MongoDB Database
Ensure your MongoDB service is running on port `27017` (or configured in `backend/.env`).
The system automatically connects to:
`mongodb://127.0.0.1:27017/career_roadmap_db`
and seeds 1,197 careers, 1,197 roadmaps, and 35,474 resources into MongoDB. This includes 1,181 generated pathways and 35,430 career-specific learning resources. Startup seeding fills missing generated records without replacing existing user data.
Authenticated user profiles, career goals, Roadmap Studio preferences, bookmarks, and lesson progress are stored per account. Anonymous lesson drafts stay on the device and are migrated when the learner signs in.

---

## ✨ Features
- **1,197 Career Paths**: 16 seeded careers plus 1,181 generated pathways, filterable by technical, non-technical, government, private-sector, and competitive-exam categories.
- **Career-specific Roadmaps**: Generated pathways, matching roadmaps, and career-specific resources are stored in MongoDB and served by the API.
- **Gated Step-by-Step Lessons**: Learners must finish each step's reading, 10-question MCQ (70% pass mark), written response, and assignment before the next step unlocks.
- **Interactive Checklists**: Lesson progress, saved drafts, and active roadmap steps persist to MongoDB for signed-in learners.
- **Account Persistence**: Career goals, profile data, Roadmap Studio preferences, and saved resources persist to each MongoDB user account.
- **Vetted Resources**: Curated resources plus career-specific courses, articles, books, practice, and projects are stored in MongoDB.
- **User Authentication**: Secure JWT login, registration, and user dashboard.
