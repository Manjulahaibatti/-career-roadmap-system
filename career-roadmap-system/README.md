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
The backend connects to MongoDB using `MONGO_URI` in `backend/.env`. For a local MongoDB service, use:

```env
MONGO_URI=mongodb://127.0.0.1:27017/career_roadmap_db
```

To use MongoDB Atlas, create a database user and allow your machine's IP in the Atlas Network Access settings. Then set `MONGO_URI` in `backend/.env` to your Atlas connection URL:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/career_roadmap_db?retryWrites=true&w=majority
```

Replace the placeholders with your Atlas database username, password, and cluster host. URL-encode special characters in the username or password, and keep `backend/.env` private (it is git-ignored). Start the backend after saving the file; it connects before starting the API and auto-seeds 16 careers, 16 roadmaps, and 32 vetted courses on first launch.

The public catalog also provides 1,181 generated career pathways across private-sector technical and non-technical roles, Indian government roles, and competitive-exam routes. Generated pathways are served by the API and receive a matching roadmap without requiring 1,181 database seed records.

---

## ✨ Features
- **1,197 Career Paths**: 16 seeded careers plus 1,181 generated pathways, filterable by technical, non-technical, government, private-sector, and competitive-exam categories.
- **Career-specific Roadmaps**: Each generated pathway includes a six-stage roadmap; career cards open the matching career details and milestones.
- **Gated Step-by-Step Lessons**: Learners must finish each step's reading, 10-question MCQ (70% pass mark), written response, and assignment before the next step unlocks.
- **Interactive Checklists**: Check off milestones with live MongoDB persistence.
- **Vetted Resources**: 32 curated courses from Harvard, Google, MIT, and HubSpot.
- **User Authentication**: Secure JWT login, registration, and user dashboard.
