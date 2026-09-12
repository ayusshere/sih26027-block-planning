# 🚦 AI-Powered Automatic Block Planning — Indian Railways

> Smart India Hackathon 2026 | Problem ID: **SIH26027**
> Team **LastCommit** (ID: SIH260270214)

An intelligent dispatcher cockpit that helps Indian Railways schedule track maintenance **without colliding with trains** 🚆 — think of it as *"Google Calendar with Physics"* for railway blocks!

![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?logo=springboot)
![React](https://img.shields.io/badge/React-18-blue?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📌 The Problem

Indian Railways runs **13,000+ trains daily** 🚄. To keep tracks safe, maintenance teams need "blocks" (closed windows) — but right now this is done **manually** 📞📋, causing:

- ❌ Random rejections of maintenance requests
- ❌ Cascading delays (one bad block = hours of delay!)
- ❌ 3 departments (Civil, Signal, Electrical) closing the *same* track 3 separate times
- ❌ No unified visual timeline

## 💡 Our Solution

An AI engine that:

- 🔍 Detects 100% of train-vs-maintenance collisions (with a strict 15-min safety buffer)
- ⚡ Finds the best conflict-free time slot in **under 120ms**
- 🤝 Bundles Civil + Signal + Electrical work into one **Mega-Block**
- 📈 Boosts track availability from **89.5% → 98.5%**
- ⏱️ Saves **270+ minutes** of passenger delay per cycle

---

## 🏗️ Tech Stack

| Layer | Tech |
|---|---|
| **Backend** | Java 21, Spring Boot 3.x, Spring Data JPA, Hibernate, PostgreSQL, JWT Security, Maven, Lombok |
| **Frontend** | React 18 (Vite), Tailwind CSS, Recharts, Lucide Icons, Canvas Confetti 🎉 |

---

## 🧠 Core Algorithms

| Engine | What it does |
|---|---|
| `ConflictResolver.java` | 2D spatial-temporal collision detection + 15-min safety headway 🛡️ |
| `PriorityScorer.java` | Ranks disruption cost (High/Medium/Low priority trains) |
| `BlockOptimizer.java` | 24-hour sliding-window search → gives Top 3 best slots 🎯 |
| `AssetAvailabilityService.java` | Finds "Shadow Blocking" opportunities to bundle maintenance 🔧 |

---

## ✨ Key Features

- 📊 **Interactive Gantt/String Chart** — see trains & blocks on one timeline
- 🚨 **Live Conflict Banners** — instant collision alerts
- 🤖 **1-Click AI Optimizer** — auto-suggests best maintenance windows
- 🌙 **Night Lull Bundling** — groups blocks into 1:00–4:30 AM for zero disruption
- 📄 **DRM Executive Dossier** — printable report for railway officials
- 🔄 **Dual-Mode** — works live with backend, or offline with demo data

---

## 📈 Results (Manual vs AI)

| Metric | Manual 😓 | AI-Optimized 🚀 |
|---|---|---|
| Track Availability | 89.5% | **98.5%** |
| Train Collisions | 11 | **0** |
| Passenger Delay | 315 min | **45 min** |
| Slot Planning Time | 4–6 hours | **< 120 ms** |

---

## 🚀 Getting Started

### ✅ Prerequisites
- JDK 21+
- Maven 3.9+
- PostgreSQL 15+
- Node.js 18+ & npm 9+

### 1️⃣ Database Setup
```sql
CREATE DATABASE blockplanning_db;
CREATE USER ayush WITH ENCRYPTED PASSWORD 'ayush123';
GRANT ALL PRIVILEGES ON DATABASE blockplanning_db TO ayush;
```

### 2️⃣ Backend
```bash
cd backend/blockplanning
mvn clean install -DskipTests
mvn spring-boot:run
```
👉 Runs at `http://localhost:8080`
📘 Swagger docs: `http://localhost:8080/swagger-ui/index.html`

### 3️⃣ Frontend
```bash
cd frontend
npm install
npm run dev
```
👉 Runs at `http://localhost:5173`

---

## 🎬 3-Minute Demo Flow

1. 🔴 See a live collision on the Dashboard (train vs maintenance block)
2. 🤖 Click "Resolve via AI Optimizer" → apply the best slot → confetti! 🎉
3. 🌆 Open "Corridor Mega-Block Plan" → watch ALL conflicts vanish at once

---

## 👥 Team LastCommit

- need to implement everybody's names

---

## 📜 License

This project is built for **Smart India Hackathon 2026** under the Ministry of Railways, Government of India. 🇮🇳
