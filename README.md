# 🛡️ Multi-Model AI Platform — Operations Center & Command Hub

A production-grade, highly optimized, multi-agent AI environment. The platform offers domain-specific analytics, real-time metrics trackers, digital twin visualizations, and system control grids across specialized hubs: **Medical AI**, **Agriculture AI (Agri-Vision)**, **Student AI (EduMentor)**, and **Finance AI**.

Designed with a futuristic, data-dense glassmorphism language inspired by high-tier dashboard systems (Azure AI Studio, Palantir Foundry, and Datadog), this platform functions as a centralized AI Command Center.

---

## 📸 Key Operations Panels

### 1. ⚡ AI Command Center (User Dashboard)
A command dashboard serving as the user entry point:
- **Operations status indicator**: Real-time pulsing system status card.
- **5 KPI analytics overview cards**: Tracks Total Interactions, Active Models, AI Confidence (%), Reports Generated, and Scan Images.
- **AI Hubs Overview (Donut Chart)**: Recharts Pie chart displaying query share by domain, with custom detail legend indexes.
- **AI Performance Trend (Line Chart)**: Smooth Recharts curves displaying weekly confidence metrics with neon glow drop-shadow filters.
- **Digital Twin SVG Map**: An interactive node-link SVG diagram showing animated data flow streams branching out from a pulsing center node "Multi-Model AI" to the specialized modules.
- **Hub Performance Analytics**: Neon gradient progress bars showing individual module load levels.

### 2. 🛡️ AI Operations Center (Admin Console)
A secure system control center for platform administrators:
- **KPI Monitoring Row**: Tracks active users, success rates, latency, and active session counts.
- **System Health Circle Gauge**: Animated circular health indicator displaying overall platform health (96% Score - Status: Excellent) alongside service check-ins (Backend, MongoDB, Gemini, Roboflow, Auth, Storage).
- **AI Model Status Grid**: A 6-card sub-grid showing real-time accuracy progress bars, latencies, requests, active states, and relative timestamps for individual models.
- **Live Requests Stream**: Monitors active user workflows, displaying processing state indicators, relative run-times, and status badges.
- **Security & Billing Centers**: Logs threat indices, failed logins, JWT security health, and estimated Gemini/Roboflow API resource costs.
- **Audit Logs Table**: Time-stamped event logger showing login activities, model updates, registrations, and backups.
- **AI Forecast Center**: Displays predictive load forecasts for tomorrow (queries, peak activity time, CPU usage).
- **AI Control Center Action Panel**: Quick-action controls (Restart Models, Run Diagnostics, Refresh Analytics, Export Reports, View Logs, Manage Users).

---

## 🏥 Module Hub Specs

- **Medical AI**: Focuses on object detection and classification for medical scans. Powered by Roboflow visual inference models (Lungs, Heart, Brain) and Gemini Flash for hybrid clinical analysis and consultation suggestions.
- **Agriculture AI**: Agri-Vision crop analysis. Accepts visual uploads of crop leaves to identify diseases (e.g. Early Blight) via Gemini Vision and designs treatment suggestions. Highlights geographical context with a dynamic Leaflet Map Visualizer.
- **Student AI (EduMentor)**: Evaluates academic details, skills, and goals to plot career roadmaps and customized study guides.
- **Finance AI**: Visualizes spending breakdowns and budget advice. Accepts CSV bank/credit statements to synthesize spending patterns, and estimates potential medical bills.

---

## 🛠️ Technology Stack

### Frontend Core
- **Framework**: React.js (Vite compiler)
- **Styling**: Tailwind CSS (Glassmorphic dark-mode presets)
- **State Management**: React Context (Auth, Language, Theme)
- **Charting Engine**: Recharts (Pie, Line, Cells, Custom SVG filters)
- **Interactive Mapping**: React Leaflet & Leaflet (Geographic Context Visualizations)
- **Icons**: Lucide React
- **Animations**: Framer Motion & CSS SVG Flow animations

### Backend Core
- **Framework**: Flask (Python)
- **Database**: MongoDB (via PyMongo)
- **APIs**: JWT authentication, CORS, TTS synthesize, and model routing.
- **LLM/Vision**: Google Gemini (Vertex AI SDK), Roboflow Inference API, Cerebras.

---

## ⚙️ Multi-Screen & Responsive Design

The platform implements strict responsiveness parameters:
- **Root Viewport Constraint**: Wrapped inside `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` to manage fluid DPI layout scaling.
- **Max-Width Containers**: Core layout is bounded using `max-w-[1600px] mx-auto` to prevent layout distension on ultra-wide desktop monitors.
- **Responsive Grids**: Flexbox containers switch from vertical columns to horizontal flows (`flex-col md:flex-row`), and KPI grid classes adapt dynamically (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-5`).
- **Sidebar Drawer Navigation**: The sidebar changes from a hidden mobile drawer to a fixed layout using transform states (`-translate-x-full lg:translate-x-0`).
- **Scalable SVGs**: The Digital Twin map is styled using fluid SVGs (`w-full max-w-[400px] h-[240px]`), ensuring coordinate alignments scale perfectly.

---

## 🚀 Vercel Deployment Architecture

The monorepo contains configurations to be deployed as a unified project:
- **`vercel.json`**: Located at the project root, routing all API subpaths (`/api/*`) to the Python handler, exposing static files, and mapping catching routes to the SPA `/index.html` (supporting React Router browser history routing).
- **Exposed WSGI Instance**: Instantiates `app = create_app()` at the top level of `backend/app.py` so Vercel can run the application as a Python serverless function.
- **Root-level dependencies**: Uses a root-level `requirements.txt` to trigger Vercel's pip install step during deployments.
- **Cross-platform temp directories**: Utilizes `tempfile.gettempdir()` inside controllers (e.g. `agriculture_routes.py`) to store uploaded files in `/tmp` in production (which is Vercel's only writable serverless directory) while falling back to the standard TEMP path locally.
- **Relative Production URLs**: Configures Vite's production check (`import.meta.env.PROD ? '' : 'http://localhost:5000'`) in `config/api.js` to run on relative local endpoints on Vercel without cross-origin configuration blockages.

---

## 📁 Workspace Map

```
├── backend/
│   ├── routes/              # Blueprint routes (auth, medical, agriculture, etc.)
│   ├── services/            # Service integrations (Gemini, Roboflow, Cerebras)
│   ├── utils/               # Helper scripts (file validation, upload managers)
│   ├── app.py               # WSGI Flask Entry Point
│   ├── config.py            # Environment configurations
│   ├── extensions.py        # Database and JWT wrappers
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/      # UI elements (MapVisualizer, Disclaimer, layout structure)
│   │   ├── context/         # Auth and Language providers
│   │   ├── pages/           # Platform views (Dashboard, Admin, History, Hubs)
│   │   ├── services/        # Axios API callers
│   │   ├── App.jsx          # Route router
│   │   ├── index.css        # Tailwind directives and scrollbars
│   │   └── main.jsx         # DOM anchor and global Leaflet CSS imports
│   ├── index.html           # HTML5 viewport markup
│   ├── tailwind.config.js   # Style color tokens and presets
│   └── package.json         # Package scripts and library versions
├── requirements.txt         # Root-level deployment dependencies
└── vercel.json              # Monorepo build and path router
```

---

## 🛠️ Local Installation & Development

### 1. Backend Setup
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Set up a Python Virtual Environment:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up the `.env` configuration file:
   ```env
   GEMINI_API_KEY=your_gemini_key
   MONGO_URI=mongodb://localhost:27017/ai_platform
   SECRET_KEY=jwt_token_secret_key
   ```
5. Launch Flask:
   ```bash
   python app.py
   ```
   *Runs on `http://localhost:5000`*

### 2. Frontend Setup
1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start Vite dev server:
   ```bash
   npm run dev
   ```
   *Runs on `http://localhost:3001` (or `http://localhost:3000`)*

---

## 🐳 Docker Setup & Deployment

The application is fully containerized using **Docker** and **Docker Compose** for easy one-command orchestration of MongoDB, Flask Backend (Gunicorn), and React Frontend (Nginx).

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Fill in your API keys (e.g. `GEMINI_API_KEY`, `ROBOFLOW_API_KEY`, `CEREBRAS_API_KEY`, `ELEVENLABS_API_KEY`).

### 2. Run with Docker Compose
To build and start all container services (MongoDB, Backend, Frontend):
```bash
docker compose up --build -d
```

### 3. Accessing Services
- **React Frontend**: `http://localhost:80` (or `http://localhost`)
- **Flask Backend API**: `http://localhost:5000/api/health`
- **MongoDB**: `localhost:27017`

### 4. Stopping Containers
```bash
docker compose down
```
To stop containers and remove persistent data volumes:
```bash
docker compose down -v
```

