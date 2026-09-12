# 🚆 Indian Railways AI Block Planning System — Frontend Master Guide

> **Problem Statement ID:** SIH26027  
> **Title:** AI-Powered Automatic Block Planning to Maximize Asset Availability for Train Operations on Indian Railways  
> **Organization:** Ministry of Railways  
> **Target Milestone:** Internal SIH Hackathon (12 September 2026)  
> **Backend Server URL:** `http://localhost:8080/api`  
> **Purpose of this Folder:** Complete UI/UX blueprint for the frontend developer to build an interactive, high-impact web application.

---

## 📑 Quick Navigation
1. [🌟 Hackathon Mission & The Core Problem](#1-hackathon-mission--the-core-problem)
2. [🎨 Design System, Indian Railways Branding & Colors](#2-design-system-indian-railways-branding--colors)
3. [⚡ Setup & Dependencies to Install](#3-setup--dependencies-to-install)
4. [📁 Complete Directory & File Blueprint](#4-complete-directory--file-blueprint)
5. [🖥️ UI Screens, Wireframes & Component Specs](#5-ui-screens-wireframes--component-specs)
   - [5.1 Executive Dashboard (`DashboardPage.jsx`)](#51-executive-dashboard-dashboardpagejsx)
   - [5.2 Visual Timetable & Gantt Chart (`GanttChart.jsx`)](#52-visual-timetable--gantt-chart-ganttchartjsx)
   - [5.3 Block Planning Workbench (`BlockPlanningPage.jsx`)](#53-block-planning-workbench-blockplanningpagejsx)
   - [5.4 AI Recommendation Modal (`RecommendationModal.jsx`)](#54-ai-recommendation-modal-recommendationmodaljsx)
   - [5.5 Shadow Blocking Alert (`ShadowBlockModal.jsx`)](#55-shadow-blocking-alert-shadowblockmodaljsx)
   - [5.6 Asset Condition Tracker (`AssetTrackerPage.jsx`)](#56-asset-condition-tracker-assettrackerpagejsx)
   - [5.7 Hackathon Impact Analytics (`ReportsPage.jsx`)](#57-hackathon-impact-analytics-reportspagejsx)
6. [🔌 Complete Backend REST API Contract](#6-complete-backend-rest-api-contract)
7. [🏆 Live Hackathon Demo Walkthrough (What to show judges)](#7-live-hackathon-demo-walkthrough-what-to-show-judges)

---

## 1. 🌟 Hackathon Mission & The Core Problem

Indian Railways runs over 13,000 trains daily across busy corridors (e.g. New Delhi to Kanpur/Ghaziabad). Periodically, tracks, overhead electric wires (OHE), and signaling systems require maintenance windows called **"traffic blocks"**.

### The Real-World Railway Problem:
1. **Manual Inefficiency:** Maintenance engineers request track blocks via phone/paper logs. Dispatchers reject them to avoid delaying passenger trains.
2. **Cascading Delays:** A poorly scheduled 2-hour track maintenance can ripple into 4–6 hours of delays across Rajdhani and Vande Bharat trains.
3. **Repeated Track Closures:** If a track is closed for OHE maintenance on Monday, an adjoining worn-out switch on the same track is closed again on Thursday—doubling downtime.

### What Your Frontend Must Deliver to Win:
- **Interactive Visual Timetable (Gantt Chart):** Live view of train movements alongside maintenance slots.
- **Instant Conflict Detection:** Highlight schedule clashes in glowing red when a block overlaps with high-priority trains.
- **1-Click AI Slot Allocation:** Automatically suggest the **Top 3 optimal conflict-free windows** (prioritizing night lull periods 01:00 AM – 04:30 AM) with computed disruption scores.
- **Shadow Blocking:** Proactively alert dispatchers: *"Asset Point Machine P-102 also has low health (58%) on this section. Bundle it into this block to eliminate future shutdowns."*
- **Uptime & Delay Metrics:** Prove track availability percentage improvement (>96%) and passenger delay minutes saved.

---

## 2. 🎨 Design System, Indian Railways Branding & Colors

Use a modern, high-contrast dark/slate enterprise theme (`bg-slate-900`) with vibrant Indian Railways accents.

### 🎨 Color Palette

| Token | Hex | Tailwind Class | Usage |
| :--- | :--- | :--- | :--- |
| **Rail Navy** | `#0B1E3D` | `bg-slate-900` / `bg-blue-950` | Primary backgrounds, top navbar |
| **IR Blue** | `#1E40AF` | `bg-blue-700` / `text-blue-500` | Primary action buttons, Express trains |
| **Vande Orange** | `#F97316` | `bg-orange-500` / `text-orange-400` | Vande Bharat / Rajdhani HIGH priority trains |
| **Safety Emerald** | `#10B981` | `bg-emerald-500` / `text-emerald-400` | APPROVED blocks, healthy assets (>80% health) |
| **Warning Amber** | `#F59E0B` | `bg-amber-500` / `text-amber-400` | PENDING blocks, moderate wear assets (70-80%) |
| **Conflict Crimson** | `#EF4444` | `bg-red-500` / `text-red-400` | Schedule clashes, REJECTED, critical assets (<70%) |
| **Surface Card** | `#1E293B` | `bg-slate-800` / `border-slate-700` | Cards, modals, data tables |

### 🔤 Typography & Iconography
- **Font:** Inter, Plus Jakarta Sans, or Roboto.
- **Icons:** Use `lucide-react` icons exclusively:
  - Trains: `Train`, `Compass`, `Clock`
  - Blocks & Assets: `Wrench`, `ShieldAlert`, `Activity`, `Layers`
  - Actions & Status: `CheckCircle`, `XCircle`, `Sparkles`, `RefreshCw`

---

## 3. ⚡ Setup & Dependencies to Install

Run these commands inside the `frontend/` directory to install and initialize the project:

```bash
cd frontend

# 1. Install core dependencies
npm install react react-dom react-router-dom axios lucide-react clsx tailwind-merge date-fns

# 2. Install UI polish & charts (Crucial for SIH judges!)
npm install recharts canvas-confetti

# 3. Install and initialize Tailwind CSS
npm install -D tailwindcss postcss autoprefixer vite @vitejs/plugin-react
npx tailwindcss init -p
```

### Essential Configuration Files

#### `package.json` Scripts
Ensure your `package.json` contains:
```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### `vite.config.js` (Proxying Backend API)
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      }
    }
  }
})
```

#### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rail: {
          dark: '#0B1E3D',
          primary: '#1E40AF',
          accent: '#3B82F6',
          surface: '#0F172A',
          card: '#1E293B',
          border: '#334155'
        }
      }
    },
  },
  plugins: [],
}
```

#### `src/index.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-slate-900 text-slate-100 min-h-screen antialiased font-sans;
}
```

---

## 4. 📁 Complete Directory & File Blueprint

Every file in the structure has been created. Here is the responsibility for each file:

```text
src/
├── main.jsx                     # Renders <App /> wrapped in <BrowserRouter>
├── App.jsx                      # App shell: Sidebar + Navbar + Route Switcher
├── index.css                    # Tailwind CSS directives
│
├── components/
│   ├── common/
│   │   ├── Navbar.jsx           # Top header: Indian Railways crest, active section, role switcher
│   │   ├── Sidebar.jsx          # Left navigation links with active state styling
│   │   ├── Badge.jsx            # Reusable status chip (PENDING, APPROVED, CONFLICT, HIGH, LOW)
│   │   ├── Loader.jsx           # Loading spinner for asynchronous API requests
│   │   └── ConfirmModal.jsx     # Reusable confirmation dialog for approve/reject actions
│   │
│   ├── dashboard/
│   │   ├── StatCard.jsx         # Metric card (Value, label, percentage change, icon)
│   │   ├── GanttChart.jsx       # 🌟 Interactive visual timetable & maintenance slots
│   │   ├── BlockTimeline.jsx    # Chronological list of today's approved blocks
│   │   ├── ConflictAlert.jsx    # Pulsing banner when active train conflicts are detected
│   │   └── AssetAvailabilityCard.jsx # Radial gauge showing track availability (e.g. 96.8%)
│   │
│   └── blocks/
│       ├── BlockRequestForm.jsx # Modal form for engineers to submit a block request
│       ├── BlockList.jsx        # Data table with filtering, search, and action triggers
│       ├── BlockCalendarView.jsx# Day / Week calendar view for maintenance planning
│       ├── RecommendationModal.jsx # 🌟 AI Optimizer: Displays Top 3 conflict-free alternative slots
│       └── ShadowBlockModal.jsx # 🌟 Shadow Blocking: Alerts to bundle low-health assets
│
├── pages/
│   ├── LoginPage.jsx            # Authentication page with quick demo login buttons
│   ├── DashboardPage.jsx        # Section Controller overview with Gantt chart & KPIs
│   ├── BlockPlanningPage.jsx    # Maintenance block management workbench
│   ├── AssetTrackerPage.jsx     # Track asset health monitoring (OHE, Signals, Points)
│   ├── ReportsPage.jsx          # Graphs of delay minutes saved and track uptime
│   └── NotFoundPage.jsx         # 404 handler
│
├── services/
│   ├── api.js                   # Axios client with baseURL '/api' and JWT interceptors
│   ├── authService.js           # login(), logout(), getCurrentUser()
│   ├── blockService.js          # getBlocks(), createBlock(), approveBlock(), autoOptimize()
│   ├── assetService.js          # getAssets(), getHealthAlerts()
│   └── trainService.js          # getTracks(), getTrains(), getSchedules()
│
├── context/
│   ├── AuthContext.jsx          # Global user state (role: STATION_MASTER / MAINTENANCE_ENGINEER)
│   └── ThemeContext.jsx         # Theme toggle state
│
├── hooks/
│   ├── useAuth.js               # Helper hook to access AuthContext
│   └── useBlockPlanner.js       # Hook managing active blocks, conflict state, and recommendations
│
├── routes/
│   ├── AppRoutes.jsx            # Route declarations (/dashboard, /blocks, /assets, /reports)
│   └── ProtectedRoute.jsx       # Redirects to /login if unauthenticated
│
└── utils/
    ├── constants.js             # Station names, priority labels, API route constants
    ├── formatDate.js            # Formatters for Indian Railways time (e.g. "14:30 hrs, 07 Sep")
    └── statusColors.js          # Maps statuses and priorities to Tailwind badge classes
```

---

## 5. 🖥️ UI Screens, Wireframes & Component Specs

### 5.1 Executive Dashboard (`DashboardPage.jsx`)
The default landing view for the Section Controller.

```text
+-----------------------------------------------------------------------------------------+
| [🚆 INDIAN RAILWAYS] Northern Railway | Section: NDLS-GZB Corridor   [Ayush (Controller)]|
+-----------------------------------------------------------------------------------------+
| [  Track Availability  ] [   Delays Avoided   ] [  Active Blocks  ] [ Asset Health Alerts]|
| [        96.8%         ] [      185 mins      ] [    3 Today      ] [    2 Critical (<70%)]|
+-----------------------------------------------------------------------------------------+
| ⚠️ ACTIVE CONFLICT DETECTED                                                            |
| Block #104 on Track UP-NDLS clashes with Train 22436 (Vande Bharat).                     |
| [✨ Launch AI Optimizer & Resolve Slot]                                                 |
+-----------------------------------------------------------------------------------------+
| 📊 LIVE TIMETABLE & MAINTENANCE GANTT CHART                                             |
| [Track Section Dropdown: NDLS-GZB-UP ▼]                      [Zoom: 1h | 2h | 6h | 24h]   |
| 00:00        04:00        08:00        12:00        16:00        20:00            24:00 |
| [=== Freight 54308 ===]            [== 22436 Vande B ==]        [== 12424 Rajdhani ==]  |
|               [== AI Recommended Block Slot (01:15 - 03:45 AM) ==]                      |
+-----------------------------------------------------------------------------------------+
| RECENT BLOCK REQUESTS                                                                   |
| Track            Asset               Requested Time       Status     Action             |
| SEC-NDLS-GZB-UP  OHE Wire KM 14      14:00 - 16:30 hrs    CONFLICT   [✨ AI Resolve]    |
| SEC-NDLS-GZB-DN  Signal S-4          02:00 - 04:00 hrs    APPROVED   [View Details]     |
+-----------------------------------------------------------------------------------------+
```

---

### 5.2 Visual Timetable & Gantt Chart (`GanttChart.jsx`)
> 🌟 **Evaluation Highlight:** Hackathon evaluators will judge how clearly train movements and track maintenance blocks are visualized together.

- **Horizontal Axis (Time):** 24-hour horizontal grid (00:00 to 24:00).
- **Vertical Rows (Tracks):** Each row represents a track section (e.g., `SEC-NDLS-GZB-UP`, `SEC-NDLS-GZB-DOWN`).
- **Train Schedule Blocks:**
  - **Vande Bharat / Rajdhani:** Solid Orange pill (`bg-orange-500`) with train number.
  - **Mail / Express:** Blue pill (`bg-blue-600`).
  - **Freight / Goods:** Slate pill (`bg-slate-600`).
- **Maintenance Blocks:**
  - **Approved:** Emerald green hatched bar (`bg-emerald-600 border-2 border-emerald-400`).
  - **Conflict Detected:** Pulsing crimson bar (`bg-red-600 animate-pulse`).
- **Interactive Tooltip:** Hovering over any element shows:
  - *Train:* Train Number, Name, Speed, Arrival/Departure timestamps.
  - *Block:* Block Title, Assigned Engineer, Maintenance Purpose, Conflicted Trains.

---

### 5.3 Block Planning Workbench (`BlockPlanningPage.jsx`)
- **Top Actions:**
  - `[+ Request New Block]` button (opens form).
  - Filter tabs: `All Blocks (8)`, `Pending Review (3)`, `Approved (4)`, `Conflicts (1)`.
- **Block Request Form Modal:**
  - Track Section: Dropdown.
  - Asset: Dropdown populated dynamically from selected track.
  - Start Time & End Time pickers.
  - Priority: `HIGH` (Emergency/Safety), `MEDIUM` (Periodic), `LOW` (Preventive).
  - Purpose: Textarea.
  - Toggle: `[x] Run AI Auto-Optimizer if schedule conflicts exist`.

---

### 5.4 AI Recommendation Modal (`RecommendationModal.jsx`)
> 🌟 **The Core SIH Innovation Feature:** Proves our backend doesn't just reject blocks—it mathematically optimizes alternative windows.

When a block request has conflicts, opening this modal shows:

```text
+-----------------------------------------------------------------------------------------+
| ✨ AI Schedule Optimizer — Alternative Windows for Block #104                            |
| Target Track: SEC-NDLS-GZB-UP | Duration Needed: 2 Hours 30 Minutes                     |
| Current Clashes: Train 22436 Vande Bharat (CRITICAL - Delaying causes passenger penalty)|
+-----------------------------------------------------------------------------------------+
| [🌟 OPTION 1: RECOMMENDED NIGHT LULL WINDOW] (Score: 0.0 - Optimal)                    |
| 🕒 01:15 AM - 03:45 AM (Tomorrow Morning)                                              |
| • Passenger Disruption: ZERO                                                            |
| • Freight Disruption: ZERO                                                              |
| • Reason: Natural railway lull window. Minimum operational disruption.                  |
| [⚡ Apply & Allocate This Window]                                                       |
+-----------------------------------------------------------------------------------------+
| [OPTION 2: LOW-IMPACT FREIGHT WINDOW] (Score: 1.5)                                      |
| 🕒 11:30 AM - 14:00 PM (Today)                                                          |
| • Passenger Disruption: ZERO                                                            |
| • Freight Disruption: 1 Freight Train (Delayed by 15 mins)                              |
| • Reason: No passenger trains impacted; minor freight rescheduling required.            |
| [Apply This Window]                                                                     |
+-----------------------------------------------------------------------------------------+
| [OPTION 3: POST-PEAK AFTERNOON WINDOW] (Score: 4.2)                                     |
| 🕒 16:45 PM - 19:15 PM (Today)                                                          |
| • Passenger Disruption: 1 Express Train (Delayed ~10 mins)                              |
| [Apply This Window]                                                                     |
+-----------------------------------------------------------------------------------------+
```

When the user clicks **"Apply & Allocate"**:
1. It sends `PUT /api/blocks/{id}/approve` with the selected allocated times.
2. Triggers a celebration notification / toast.
3. Updates the Gantt chart in real-time.

---

### 5.5 Shadow Blocking Alert (`ShadowBlockModal.jsx`)
Indian Railways loses track capacity when the same track is closed repeatedly. The **Shadow Blocking** modal appears whenever a block is scheduled on a track that has *other* deteriorating assets:

```text
+-----------------------------------------------------------------------------------------+
| 🔗 SHADOW BLOCKING OPPORTUNITY DETECTED!                                                |
+-----------------------------------------------------------------------------------------+
| Track SEC-NDLS-GZB-UP will be closed on 07 Sep (01:15 AM - 03:45 AM).                   |
|                                                                                         |
| ⚠️ Asset on the SAME section requires scheduled service:                                |
| • Asset Name: Point Machine P-102 (Track Crossover)                                     |
| • Asset Health Score: 58% (Threshold < 70% Requires Maintenance)                        |
| • Last Serviced: 48 Days Ago                                                            |
|                                                                                         |
| 💡 AI Recommendation:                                                                   |
| Bundle servicing of Point Machine P-102 into this exact block window.                   |
| 🎯 Direct Benefit: Prevents an additional 2.5 hours of future line closure!             |
|                                                                                         |
| [🔗 Bundle Into Block]                          [Dismiss / Single Asset Only]           |
+-----------------------------------------------------------------------------------------+
```

---

### 5.6 Asset Condition Tracker (`AssetTrackerPage.jsx`)
- Grid / Table of all track infrastructure assets.
- Visual Health Meter:
  - `80% – 100%`: 🟢 Optimal (Green bar)
  - `70% – 79%`: 🟡 Inspection Due (Yellow bar)
  - `< 70%`: 🔴 Degraded / Urgent Maintenance (Red bar + Warning badge)
- Button on degraded assets: `[🛠️ Plan Maintenance Block]` (pre-fills the block request form with track and asset details).

---

### 5.7 Hackathon Impact Analytics (`ReportsPage.jsx`)
Charts that prove real-world business value:
1. **Track Availability Rate:** Bar chart comparing 88.4% (Manual Planning) vs **96.8% (AI-Optimized Planning)**.
2. **Train Delay Minutes Avoided:** Total accumulated minutes saved (e.g. `2,340 mins this month`).
3. **Asset Reliability Metric:** MTBF (Mean Time Between Failures) improvement after shadow maintenance bundling.

---

## 6. 🔌 Complete Backend REST API Contract

All endpoints run on `http://localhost:8080`.  
Every response is wrapped in a standardized envelope:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-09-06T12:00:00"
}
```

### 6.1 Authentication (`/api/auth`)

#### `POST /api/auth/login`
- **Request Body:**
```json
{
  "username": "ayush_sm",
  "password": "password123"
}
```
- **Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "tokenType": "Bearer",
    "userId": 1,
    "username": "ayush_sm",
    "email": "ayush@indianrailways.gov.in",
    "role": "STATION_MASTER",
    "designation": "Section Controller",
    "stationAssigned": "NDLS"
  }
}
```

---

### 6.2 Maintenance Blocks (`/api/blocks`)

#### `GET /api/blocks`
- **Query Params (Optional):** `?status=PENDING&trackId=1`
- **Response:** List of `BlockResponseDTO` objects.

#### `POST /api/blocks` (Create New Block Request)
- **Request Body:**
```json
{
  "title": "OHE Wire Tensioning KM 14",
  "trackId": 1,
  "assetId": 2,
  "requestedByUserId": 1,
  "requestedStartTime": "2026-09-07T14:00:00",
  "requestedEndTime": "2026-09-07T16:30:00",
  "purpose": "Routine OHE tensioning & bracket inspection",
  "priority": "HIGH",
  "autoOptimize": true
}
```
- **Response (201 Created):**
```json
{
  "success": true,
  "message": "Block request submitted successfully. Clashes detected; 3 optimal alternatives generated.",
  "data": {
    "id": 101,
    "title": "OHE Wire Tensioning KM 14",
    "trackId": 1,
    "trackSectionCode": "SEC-NDLS-GZB-UP",
    "startStation": "NDLS",
    "endStation": "GZB",
    "assetId": 2,
    "assetName": "OHE Catenary Wire KM 14",
    "requestedByUserId": 1,
    "requestedByUsername": "ayush_sm",
    "requestedStartTime": "2026-09-07T14:00:00",
    "requestedEndTime": "2026-09-07T16:30:00",
    "allocatedStartTime": null,
    "allocatedEndTime": null,
    "purpose": "Routine OHE tensioning & bracket inspection",
    "status": "PENDING",
    "priority": "HIGH",
    "conflictRemarks": "Direct overlap with 22436 Vande Bharat Express",
    "hasConflict": true,
    "conflicts": [
      {
        "scheduleId": 5,
        "trainNumber": "22436",
        "trainName": "Vande Bharat Express",
        "trainType": "VANDE_BHARAT",
        "trainPriority": "HIGH",
        "entryTime": "2026-09-07T14:15:00",
        "exitTime": "2026-09-07T14:45:00",
        "overlapDurationMinutes": 30,
        "severity": "CRITICAL"
      }
    ],
    "recommendedSlots": [
      {
        "proposedStartTime": "2026-09-08T01:15:00",
        "proposedEndTime": "2026-09-08T03:45:00",
        "disruptionCostScore": 0.0,
        "conflictingTrainsCount": 0,
        "isNightLullWindow": true,
        "feasibilityReason": "Zero passenger train impact. Natural night lull window."
      },
      {
        "proposedStartTime": "2026-09-07T11:30:00",
        "proposedEndTime": "2026-09-07T14:00:00",
        "disruptionCostScore": 1.5,
        "conflictingTrainsCount": 1,
        "isNightLullWindow": false,
        "feasibilityReason": "Impacts only 1 Freight train with minimal ~15 min delay."
      }
    ],
    "shadowBlockOpportunities": [
      {
        "assetId": 4,
        "assetName": "Point Machine P-102",
        "assetType": "POINT_MACHINE",
        "healthScore": 58,
        "recommendationReason": "Health is 58% (< 70%). Bundling into this block eliminates 2.5 hours of future line closure."
      }
    ]
  }
}
```

#### `PUT /api/blocks/{id}/approve`
- **Request Body (Optional - if applying an AI-recommended window):**
```json
{
  "allocatedStartTime": "2026-09-08T01:15:00",
  "allocatedEndTime": "2026-09-08T03:45:00"
}
```
- **Response:** Updated block object with `status: "APPROVED"`.

#### `PUT /api/blocks/{id}/reject`
- **Request Body:**
```json
{
  "reason": "Corridor required for emergency VIP special movement"
}
```

---

### 6.3 Railway Infrastructure & Timetable

- `GET /api/tracks` ➔ Returns railway sections (`sectionCode`, `startStation`, `endStation`, `lengthKm`).
- `GET /api/trains` ➔ Returns train catalog with priorities (`VANDE_BHARAT`, `RAJDHANI`, `EXPRESS`, `FREIGHT`).
- `GET /api/schedules` ➔ Timetable schedules powering the Gantt Chart (`trainNumber`, `trackSectionCode`, `entryTime`, `exitTime`).
- `GET /api/assets` ➔ Physical track assets with health condition scores (0–100).
- `GET /api/assets/health-alerts` ➔ Filtered list of assets with `healthScore < 70`.

---

## 7. 🏆 Live Hackathon Demo Walkthrough (What to show judges)

Here is the exact 3-minute demonstration script for your team on hackathon day:

1. **Minute 1: The Status Quo & The Problem**
   - Open the **Gantt Chart**: Point out high-density traffic on the `NDLS-GZB-UP` line.
   - Switch role to *Maintenance Engineer* and submit a block request for Track 1 between `14:00 - 16:30`.
   - The UI immediately flags a **Flashing Red Conflict Banner**: *"Direct Collision with 22436 Vande Bharat Express (CRITICAL)"*.
2. **Minute 2: The AI Solution (1-Click Optimization)**
   - Click the purple **"✨ AI Auto-Optimize"** button.
   - The **Recommendation Modal** appears: Point out the mathematical disruption scores.
   - Click **"Apply Recommended Window (01:15 AM – 03:45 AM)"**.
   - Watch the Gantt chart smoothly animate the block moving into the green conflict-free night slot.
3. **Minute 3: The Shadow Blocking Innovation & ROI**
   - The **Shadow Blocking Modal** triggers: *"Opportunity: Point Machine P-102 on this track has health 58%."*
   - Click **"Bundle Maintenance"** to show judges how Indian Railways saves 2.5 hours of track downtime in a single action.
   - Open the **Analytics Page** to show the final statistics: **Track availability increased to 96.8%** and **185 train delay minutes avoided**.

---

*This guide contains everything required to build a winning UI for SIH26027. All the best!*
