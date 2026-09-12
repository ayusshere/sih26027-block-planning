🚆 RailBlock — AI-Powered Automatic Block Planning

<p align="center">

Intelligent Railway Maintenance Scheduling & Conflict Resolution

Smart India Hackathon · SIH26027

Team LastCommit · Team ID: SIH260270214

</p>

⸻

🧭 What is RailBlock?

RailBlock is an AI-assisted railway maintenance planning platform designed to coordinate maintenance blocks with train operations.

Instead of treating maintenance requests independently, RailBlock analyzes:

* 🚆 Train schedules
* 🛤️ Track sections
* 🔧 Infrastructure asset health
* 🏗️ Departmental maintenance requests
* ⏱️ Safety headway buffers
* 📊 Train priority
* 🌙 Low-traffic maintenance windows

It then identifies conflicts, recommends better maintenance slots, and combines compatible departmental work into Integrated Mega-Blocks.

Think of it as Google Calendar + railway traffic scheduling + spatial-temporal conflict detection.

⸻

🎯 Problem

Railway maintenance requires physical possession of track sections.

The challenge is finding maintenance windows that do not interfere with train movements while still allowing critical maintenance to happen on time.

Traditional fragmented planning can lead to:

Civil Maintenance
       ↓
Track closed
       ↓
Train disruption
S&T Maintenance
       ↓
Same track closed again
       ↓
More disruption
Electrical Maintenance
       ↓
Same track closed again
       ↓
More disruption

The result

* ❌ Schedule conflicts
* ❌ Repeated line closures
* ❌ Delayed maintenance
* ❌ Poor coordination between departments
* ❌ Increased passenger-train disruption
* ❌ Difficult manual decision-making

⸻

💡 Our Solution

RailBlock creates a unified scheduling layer across:

             ┌──────────────────────┐
             │   Train Timetables   │
             └──────────┬───────────┘
                        │
             ┌──────────▼───────────┐
             │ Maintenance Requests │
             └──────────┬───────────┘
                        │
             ┌──────────▼───────────┐
             │   Asset Health Data  │
             └──────────┬───────────┘
                        │
                        ▼
             ┌──────────────────────┐
             │  AI / Optimization   │
             │       Engine         │
             └──────────┬───────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
     Conflict       Optimal       Shadow Block
     Detection       Slots        Detection
          │             │             │
          └─────────────┼─────────────┘
                        ▼
             ┌──────────────────────┐
             │ Integrated Planning  │
             │   & Mega-Blocks      │
             └──────────────────────┘

⸻

✨ Key Features

Feature	What it does
🚨 Conflict Detection	Detects train-maintenance time collisions
🛡️ 15-Minute Safety Buffer	Adds configurable headway protection
🤖 AI Slot Optimizer	Searches alternative maintenance windows
🎯 Priority Scoring	Gives greater weight to high-priority trains
🌙 Night Lull Optimization	Prefers low-traffic maintenance windows
🔧 Asset Health Monitoring	Identifies degraded infrastructure
👥 Shadow Blocking	Finds other maintenance work that can be bundled
🚧 Mega-Block Planning	Combines Civil + S&T + Electrical work
📈 KPI Dashboard	Tracks uptime, conflicts and delay mitigation
📊 Interactive Gantt Chart	Visualizes trains and maintenance blocks
🔐 JWT Authentication	Secures backend APIs
📴 Offline Demo Mode	Frontend remains demonstrable without backend
📄 DRM Dossier	Executive reporting interface

⸻

🏗️ System Architecture

flowchart TB
    A[Railway Users] --> B[React Dispatcher Cockpit]
    B --> C[REST API]
    C --> D[Spring Boot Backend]
    D --> E[Conflict Resolver]
    D --> F[Block Optimizer]
    D --> G[Priority Scorer]
    D --> H[Asset Availability Engine]
    E --> I[(PostgreSQL)]
    F --> I
    G --> I
    H --> I
    I --> J[Train Schedules]
    I --> K[Track & Asset Data]
    I --> L[Maintenance Requests]
    E --> M[Conflict Results]
    F --> N[Optimal Slots]
    H --> O[Shadow Blocks]
    H --> P[Mega-Block Plan]
    M --> B
    N --> B
    O --> B
    P --> B

⸻

🔄 End-to-End Workflow

sequenceDiagram
    participant E as Maintenance Engineer
    participant UI as React UI
    participant API as Spring Boot
    participant CR as Conflict Resolver
    participant OPT as Block Optimizer
    participant DB as PostgreSQL
    E->>UI: Submit maintenance block
    UI->>API: POST /api/blocks
    API->>CR: Check train conflicts
    CR->>DB: Fetch schedules
    DB-->>CR: Train timetable
    CR-->>API: Conflict details
    alt Conflict detected
        API->>OPT: Find optimal slots
        OPT->>DB: Check schedules & approved blocks
        DB-->>OPT: Existing operations
        OPT-->>API: Top 3 recommendations
    end
    API-->>UI: Block + conflicts + recommendations
    E->>UI: Apply recommended slot
    UI->>API: Approve allocation
    API->>DB: Save approved block
    DB-->>API: Success
    API-->>UI: Updated maintenance plan

⸻

🧠 Optimization Engine

RailBlock does not simply search for an empty time slot.

It evaluates each candidate window against multiple constraints.

1. Spatial-Temporal Conflict Detection

A conflict exists when:

Same Track
    +
Overlapping Time
    +
Safety Buffer Violation
    =
CONFLICT

Conceptually:

Train:
          |──────────────|
Block:
                   |──────────────|
Buffer:
             |← 15m →|

The engine evaluates both:

* Direct overlap
* Pre/post maintenance safety buffer

⸻

2. Priority-Weighted Disruption Score

Different trains have different operational importance.

Priority	Weight
🔴 HIGH	5.0
🟡 MEDIUM	2.5
🟢 LOW	1.0

The disruption score is based on:

Disruption Cost
=
Σ(Train Priority × Overlap Duration)

This means a slot affecting a high-priority passenger service is ranked worse than a slot affecting a low-priority service.

⸻

3. Night Maintenance Lull

Candidate windows overlapping the configured:

01:00 AM ───────── 04:30 AM

maintenance lull receive a lower disruption score when appropriate.

The objective is simple:

Move maintenance away from peak train traffic whenever operationally feasible.

⸻

🤖 BlockOptimizer

The core optimizer uses a sliding-window heuristic search.

Search strategy

Requested Window
       │
       ▼
Generate Candidate Windows
       │
       ▼
30-Minute Search Steps
       │
       ▼
Hard Constraint Check
       │
       ├── Existing approved block?
       │          │
       │          └── ❌ Reject
       │
       ▼
Train Conflict Evaluation
       │
       ▼
Priority Disruption Score
       │
       ▼
Night-Lull Evaluation
       │
       ▼
Rank Candidates
       │
       ▼
Return Top 3 Slots

Search configuration

Search Horizon : 24 hours
Search Step    : 30 minutes
Recommendations: Top 3
Diversification: ≥ 60 minutes
Night Lull     : 01:00 – 04:30

⸻

🔧 Shadow Blocking

One of the major ideas in RailBlock is Shadow Blocking.

Suppose Civil Engineering already receives a track possession.

The system checks whether other degraded assets exist on the same track:

Track 2
│
├── Civil
│   └── Track Tamping
│
├── S&T
│   └── Point Machine PM-102
│
└── Electrical
    └── OHE Maintenance

If another asset requires maintenance, RailBlock can recommend performing that work during the same possession.

Result

Without Integration
Civil       █████████
S&T                  ███████
Electrical                    ███████████
Total closure = Sum of individual blocks
With RailBlock
Civil       █████████████████████████
S&T         █████████████████████████
Electrical  █████████████████████████
Total closure = Longest required block

⸻

🚧 Integrated Mega-Block

For multiple departments:

Civil ───────────────┐
                     │
S&T ─────────────────┼──► Integrated Mega-Block
                     │
Electrical ──────────┘

Instead of scheduling three independent possessions, the system attempts to synchronize compatible work.

Example

Department	Work	Duration
Civil	Track tamping	2.5 h
S&T	Point machine overhaul	2.0 h
Electrical	OHE tensioning	3.0 h

Fragmented planning

2.5h + 2h + 3h = 7.5h

Integrated planning

max(2.5h, 2h, 3h) = 3h

Potential closure reduction

7.5h → 3h
4.5 hours saved

⸻

🏥 Asset Health & Maintenance Urgency

RailBlock monitors infrastructure health using a normalized health score.

Health	Condition	Action
85–100%	🟢 Optimal	Routine monitoring
70–84%	🟡 Good	Preventive maintenance
50–69%	🟠 Degraded	Shadow-block candidate
<50%	🔴 Critical	High-priority intervention

Asset urgency is calculated from:

Urgency
=
(100 - Health Score) × Priority Weight

⸻

🖥️ Dispatcher Cockpit

The frontend is designed around a railway controller’s operational workflow.

Dashboard

┌──────────────────────────────────────────────┐
│ 🚆 RAILBLOCK             LIVE IST 23:27     │
├──────────────────────────────────────────────┤
│                                              │
│  Track Uptime     Conflicts     Active Blocks│
│     98.5%            0              5        │
│                                              │
├──────────────────────────────────────────────┤
│ 🚨 CONFLICT DETECTED                         │
│                                              │
│ Line 2 │ Maintenance Block                   │
│        │ ████████████████████                │
│        │       🚆 Train 12401                │
│        │          █████████                   │
│                                              │
│       [ Resolve via AI ]                     │
└──────────────────────────────────────────────┘

⸻

📊 Interactive Gantt / String Chart

The Gantt chart provides a visual representation of:

* 🚆 Train movements
* 🛤️ Track sections
* 🔧 Maintenance blocks
* 🚨 Conflicts
* 🟢 Approved windows
* 🟡 Pending requests
* ⏱️ Safety buffers
* 📍 Current operational time

Views

24H Full Corridor
        ↓
00:00 ───────────────────────── 24:00
Night Lull
        ↓
00:00 ─────── 06:00
Morning Shift
        ↓
06:00 ─────── 14:00
Evening Peak
        ↓
14:00 ─────── 22:00

⸻

🧑‍💻 Technology Stack

Backend

Technology	Purpose
☕ Java 21	Core backend language
🌱 Spring Boot 3.x	REST backend
Spring Data JPA	Persistence layer
Hibernate	ORM
PostgreSQL 16	Relational database
Maven	Build & dependency management
Lombok	Boilerplate reduction
Spring Security	API security
JWT	Stateless authentication
Swagger / OpenAPI	API documentation

Frontend

Technology	Purpose
⚛️ React 18	UI
⚡ Vite	Development/build tooling
🎨 Tailwind CSS	Styling
📊 Recharts	Analytics charts
🎯 Lucide Icons	UI icons
🎉 Canvas Confetti	Allocation feedback
🔗 Axios	REST communication
📅 date-fns	Date/time handling

Development

Git
GitHub
IntelliJ IDEA / VS Code
Postman
DBeaver / pgAdmin

⸻

📁 Project Structure

railblock/
│
├── backend/
│   └── blockplanning/
│       ├── pom.xml
│       └── src/main/java/com/sih/blockplanning/
│           │
│           ├── algorithm/
│           │   ├── BlockOptimizer.java
│           │   ├── ConflictResolver.java
│           │   └── PriorityScorer.java
│           │
│           ├── controller/
│           ├── service/
│           ├── entity/
│           ├── repository/
│           ├── dto/
│           ├── enums/
│           ├── security/
│           ├── config/
│           └── exception/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── routes/
│   │   └── utils/
│   │
│   ├── package.json
│   └── vite.config.js
│
├── database/
├── docs/
└── README.md

⸻

🗄️ Database Model

erDiagram
    USER ||--o{ BLOCK_REQUEST : creates
    TRACK ||--o{ SCHEDULE : contains
    TRAIN ||--o{ SCHEDULE : operates
    TRACK ||--o{ ASSET : contains
    TRACK ||--o{ BLOCK_REQUEST : receives
    ASSET ||--o{ BLOCK_REQUEST : maintains
    USER {
        bigint id
        string username
        string fullName
        string role
        string department
    }
    TRACK {
        bigint id
        string sectionCode
        string startStation
        string endStation
        double lengthKm
        string status
    }
    TRAIN {
        bigint id
        string trainNumber
        string trainName
        string trainType
        string priority
    }
    SCHEDULE {
        bigint id
        datetime entryTime
        datetime exitTime
        string status
    }
    ASSET {
        bigint id
        string assetName
        string assetType
        int healthScore
        date lastMaintenanceDate
    }
    BLOCK_REQUEST {
        bigint id
        string title
        string department
        datetime requestedStartTime
        datetime requestedEndTime
        datetime allocatedStartTime
        datetime allocatedEndTime
        string priority
        string status
    }

⸻

🔌 REST API

All APIs are prefixed with:

/api

Authentication

Method	Endpoint	Purpose
POST	/auth/login	Authenticate user
GET	/auth/me	Current user

Block Planning

Method	Endpoint	Purpose
POST	/blocks	Create maintenance request
GET	/blocks	List blocks
GET	/blocks/{id}	Block details
PUT	/blocks/{id}/approve	Approve block
PUT	/blocks/{id}/reject	Reject block
GET	/blocks/{id}/recommendations	AI recommendations
GET	/blocks/conflicts/check	Sandbox conflict check
GET	/blocks/corridor-plan	Generate corridor plan

Assets

Method	Endpoint	Purpose
GET	/assets	List assets
GET	/assets/{id}	Asset details
GET	/assets/health-alerts	Degraded assets
GET	/assets/track/{id}/shadow-opps	Shadow opportunities

Reporting

Method	Endpoint	Purpose
GET	/reports/asset-availability	Track availability
GET	/reports/kpi-summary	Executive KPIs

⸻

🔐 Security

RailBlock uses Spring Security + JWT for stateless API authentication.

Login
  │
  ▼
POST /api/auth/login
  │
  ▼
JWT Token
  │
  ▼
Frontend stores token
  │
  ▼
Axios Authorization Interceptor
  │
  ▼
Authorization: Bearer <token>
  │
  ▼
JwtFilter
  │
  ▼
Spring Security
  │
  ▼
Protected API

Demo roles

* STATION_MASTER
* MAINTENANCE_ENGINEER
* ADMIN

⸻

🧪 Demo Dataset

The prototype uses a simulated Northern Railway corridor dataset representing:

🚉 Corridor

New Delhi
    │
    ▼
Sahibabad
    │
    ▼
Ghaziabad

🛤️ Infrastructure

* 4 primary trunk lines
* Additional bridge/yard sections
* Track assets
* Signals
* Point machines
* OHE equipment
* Bridges
* Substation equipment

🚆 Trains

The demo dataset contains high-, medium- and low-priority train services to demonstrate different scheduling decisions.

🔧 Maintenance

Multiple Civil, S&T and Electrical requests are seeded to demonstrate:

Conflict
   ↓
AI Recommendation
   ↓
Approval
   ↓
Shadow Blocking
   ↓
Mega-Block Planning

⸻

📈 Demonstration Metrics

The prototype demonstrates the following target scenario:

Metric	Manual	AI-Optimized
Track Availability	89.5%	98.5%
Schedule Conflicts	11	0
Fragmented Blocks	8	5
Corridor Downtime	21.5 h	13.0 h
Passenger Delay	315 min	45 min
Delay Mitigation	—	270 min
Safety Buffer	Manual	15 min enforced
Slot Search	Hours	Algorithmic

Note: These figures represent the project’s demonstration/benchmark dataset and simulation assumptions, not production measurements from Indian Railways.

⸻

🎬 3-Minute Demo

01 — Detect

Open the dashboard.

Show:

🚨 CONFLICT DETECTED
Line 2 DOWN
Maintenance Block
        ×
Train 12401
        ×
Train 12015

Explain:

“The requested maintenance window overlaps with scheduled train movements.”

⸻

02 — Optimize

Click:

Resolve via AI Optimizer

The optimizer evaluates candidate windows.

Requested
14:00 ───────── 17:00
        ❌ conflicts
Candidate 1
01:30 ───────── 04:30
        ✅ conflict-free
Candidate 2
05:00 ───────── 08:00
        ⚠️ disruption
Candidate 3
11:00 ───────── 14:00
        ⚠️ disruption

Apply the recommended slot.

⸻

03 — Bundle

The system identifies degraded assets on the same track.

Existing Block
       │
       ├── Civil
       ├── S&T
       └── Electrical

Select:

Bundle Maintenance

The departments are synchronized into one possession.

⸻

04 — Corridor Optimization

Open:

Corridor Mega-Block Plan

Show:

11 Conflicts → 0
270 min delay mitigation
Multiple departments → Integrated blocks

⸻

05 — Executive View

Open Reports.

Show:

* Track availability
* Delay mitigation
* Maintenance blocks
* Asset health
* Departmental synergy
* Corridor optimization

Finish with:

“RailBlock does not replace railway controllers. It gives them an intelligent decision-support system to make faster, safer and more coordinated maintenance planning decisions.”

⸻

🚀 Getting Started

Prerequisites

Java 21+
Maven 3.9+
PostgreSQL 15+
Node.js 18+
npm 9+

⸻

1. Clone

git clone <your-repository-url>
cd <your-repository>

⸻

2. Database

Create the database:

CREATE DATABASE blockplanning_db;

Configure your PostgreSQL credentials in:

backend/blockplanning/src/main/resources/application.properties

Example:

spring.datasource.url=jdbc:postgresql://localhost:5432/blockplanning_db
spring.datasource.username=ayush
spring.datasource.password=YOUR_PASSWORD

⸻

3. Start Backend

cd backend/blockplanning
mvn clean install -DskipTests
mvn spring-boot:run

Backend:

http://localhost:8080

Swagger:

http://localhost:8080/swagger-ui/index.html

⸻

4. Start Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173

⸻

📴 Offline Demo Mode

RailBlock also supports a frontend fallback mode.

Backend Available?
       │
   ┌───┴────┐
  YES       NO
   │         │
   ▼         ▼
Live API   Mock Data
   │         │
   └────┬────┘
        ▼
  Same UI Experience

This makes the prototype suitable for demonstrations even when the backend or database is unavailable.

⸻

🧩 Major Backend Components

Component	Responsibility
BlockOptimizer	Finds optimal maintenance windows
ConflictResolver	Detects spatial-temporal conflicts
PriorityScorer	Calculates disruption/urgency scores
BlockPlanningService	Coordinates complete block lifecycle
AssetAvailabilityService	Asset health & shadow blocking
ConflictDetectionService	Ad-hoc conflict checking
AuthService	Authentication
NotificationService	Status/operational notifications

⸻

🎨 Major Frontend Components

Component	Responsibility
DashboardPage	Operational overview
GanttChart	Train + maintenance visualization
BlockPlanningPage	Maintenance workbench
AssetTrackerPage	Asset health monitoring
ReportsPage	Analytics & KPIs
RecommendationModal	AI slot recommendations
ShadowBlockModal	Department bundling
CorridorPlanModal	Mega-block optimization
DrmDossierModal	Executive reporting

⸻

📌 Why This Architecture?

Java + Spring Boot

Chosen for:

* Strong enterprise ecosystem
* REST API development
* Security
* Database integration
* Maintainable layered architecture

PostgreSQL

Chosen for:

* Relational railway data
* Schedule queries
* Track relationships
* Transactional consistency
* Reliable persistence

React

Chosen for:

* Interactive operational dashboards
* Dynamic Gantt visualization
* Real-time UI updates
* Component-based architecture

Heuristic Optimization

Chosen because railway block planning is fundamentally a constraint and scheduling problem.

The prototype therefore focuses on:

Constraints
    +
Priority
    +
Time Windows
    +
Asset Health
    +
Department Coordination
        ↓
Optimized Candidate Windows

⸻

🧠 Project Architecture at a Glance

                     ┌─────────────────────┐
                     │    Railway Users    │
                     │ Controller / SSE /  │
                     │ Engineer / Admin    │
                     └──────────┬──────────┘
                                │
                                ▼
                     ┌─────────────────────┐
                     │    React Frontend   │
                     │                     │
                     │ Dashboard           │
                     │ Gantt               │
                     │ Assets              │
                     │ Reports             │
                     └──────────┬──────────┘
                                │
                             REST API
                                │
                                ▼
                ┌──────────────────────────────┐
                │       Spring Boot 3.x        │
                │                              │
                │ Controllers → Services       │
                │               ↓              │
                │ Algorithms → Repositories   │
                └──────────────┬───────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
       Conflict Engine    Block Optimizer   Asset Engine
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                       ┌───────────────┐
                       │  PostgreSQL   │
                       └───────────────┘

⸻

👨‍💻 Team

Team LastCommit

Member	Role
Ayush	Backend / Algorithms
Tanishk	Backend / Frontend

Team ID: SIH260270214

Problem Statement: SIH26027

⸻

🛠️ Future Scope

RailBlock can be extended with:

* 📡 Live railway operational feeds
* 🤖 ML-based delay prediction
* 📈 Historical schedule learning
* 🛰️ Real-time asset telemetry
* 🗺️ GIS-based railway topology
* 🔮 Predictive maintenance forecasting
* ☁️ Cloud deployment
* 📱 Mobile controller interface
* 🔄 Real-time event streaming with Kafka
* 🧠 Advanced mathematical optimization using OR/constraint solvers

⸻

⚠️ Prototype Disclaimer

RailBlock is a Smart India Hackathon prototype and decision-support demonstration.

The railway infrastructure, schedules, asset health values and operational metrics used in the prototype are simulated/demo data and should not be interpreted as live Indian Railways operational data.

Any deployment in a real railway environment would require validation against applicable railway operating rules, safety procedures, signaling systems, operational data and authorized infrastructure.

⸻

⭐ The Core Idea

Don’t schedule maintenance around trains.

Schedule maintenance with the railway system in mind.

RailBlock brings train scheduling, maintenance planning, asset health and departmental coordination into one decision-support platform.

Detect → Predict → Optimize → Coordinate → Execute

⸻

<p align="center">

🚆 RailBlock

AI-Assisted Automatic Block Planning for Smarter Railway Operations

SIH26027 · Team LastCommit

</p>
