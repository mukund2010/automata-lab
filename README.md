# 🔬 Pumping Lemma Lab & Automata Theory Laboratory

An interactive academic laboratory and computational platform for exploring **Automata Theory**, **Formal Languages**, and the **Pumping Lemma for Regular Languages**.

[![Frontend Deployment](https://img.shields.io/badge/Vercel-Frontend%20Live-black?style=flat&logo=vercel)](https://automata-lab-eta.vercel.app)
[![Backend API](https://img.shields.io/badge/Render-Backend%20API-46E3B7?style=flat&logo=render)](https://automata-lab-backend.onrender.com)
[![GitHub Repository](https://img.shields.io/badge/GitHub-mukund2010%2Fautomata--lab-181717?style=flat&logo=github)](https://github.com/mukund2010/automata-lab)
[![Tests Passing](https://img.shields.io/badge/Tests-124%20passed-brightgreen?style=flat)](#automated-testing)

---

## 🌐 Live Deployments

- **Frontend (Vercel):** [https://automata-lab-eta.vercel.app](https://automata-lab-eta.vercel.app)
- **Backend API (Render):** [https://automata-lab-backend.onrender.com](https://automata-lab-backend.onrender.com)
- **GitHub Repository:** [https://github.com/mukund2010/automata-lab](https://github.com/mukund2010/automata-lab)

---

## 📑 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [System Architecture](#system-architecture)
- [API Reference](#api-reference)
- [Local Setup & Running](#local-setup--running)
- [Automated Testing](#automated-testing)
- [Tech Stack](#tech-stack)

---

## 🎯 Overview

The **Pumping Lemma Lab** is designed to provide an intuitive, visual, and mathematically rigorous environment for students and instructors of theoretical computer science. It bridges the gap between abstract mathematical theorems and tangible computation through:

1. **Interactive Pumping Decomposition:** Visually dissect strings into $w = xyz$ and test pumping exponent $i \ge 0$ against formal lemma conditions.
2. **Automata Steppers:** Step-by-step state visualization for Deterministic Finite Automata (DFA) and Non-Deterministic Finite Automata (NFA).
3. **Real-World State Machines:** 3D simulations illustrating practical finite state machine applications (Vending Machines, Traffic Controllers, Password Recognizers).
4. **Guided Proof Laboratory:** Step-by-step game framework for proving non-regularity with automated contradiction generation.
5. **Decoupled Architecture:** Client-side visual laboratory deployed on Vercel paired with an Express.js computation API on Render.

---

## ✨ Key Features

### 1. Pumping Lemma Simulator
- Interactive string partition ruler with drag handles for $x$, $y$, and $z$.
- Real-time condition checking:
  - Condition 1: $|y| \ge 1$
  - Condition 2: $|xy| \le p$
  - Condition 3: $\forall i \ge 0, xy^i z \in L$
- Supports 21+ formal languages (both regular and non-regular):
  - $L = \{a^n b^n \mid n \ge 0\}$
  - $L = \{0^n 1^n \mid n \ge 0\}$
  - $L = \{w \mid w = w^R\}$ (Palindromes)
  - $L = \{a^p \mid p \text{ is prime}\}$
  - $L = \{a^n \mid n \text{ is a perfect square}\}$
  - $L = (ab)^*$ (Regular verification via DFA)
  - Custom user-defined regular expressions and alphabets.

### 2. Automata Lab
- **DFA Simulator:** Step-by-step execution on user input tape, active state tracking, and acceptance verdicts.
- **NFA Explorer:** Multiple branch tracking, $\varepsilon$-transitions, dead-end branch pruning, and acceptance tree visualization.
- **Custom Automaton Builder:** Create states, transitions, initial and accept states with instant validation.

### 3. Real-World State Machines
- **3D Vending Machine:** Full state transitions (`IDLE` $\to$ `SELECTION` $\to$ `PAYMENT` $\to$ `DISPENSING` $\to$ `COMPLETE`) with currency credit and change calculation.
- **3D Traffic Intersection:** Time-sliced state transitions (`RED` $\to$ `GREEN` $\to$ `YELLOW`), cross-street logic, and vehicle queueing.
- **Password Strength DFA:** Multi-class character recognizer (Uppercase, Lowercase, Digit, Symbol) verifying length and security criteria.
- **Binary Modulo Recognizer:** Recognizes binary strings matching specified patterns.

### 4. Challenge Zone & Progress Dashboard
- 3 difficulty levels: **Beginner**, **Intermediate**, **Advanced**.
- Randomized question banks covering membership, valid decompositions, and predictive pumping outcomes.
- Persistent progress tracking stored in browser `localStorage`.

---

## 🏗️ System Architecture

```
automata-lab/
├── frontend/                     # Deployed to Vercel
│   └── index.html                # Single-page laboratory application with SVG and CSS 3D
├── backend/                      # Deployed to Render
│   ├── server.js                 # Express.js REST API with CORS
│   ├── engine.js                 # Automata and formal languages core engine
│   ├── package.json              # Backend dependencies
│   └── package-lock.json
├── Automata project/             # Laboratory source & test suite
│   ├── index.html                # Standalone lab distribution
│   └── test_runner.js            # Node.js automated test runner (124 tests)
├── .gitignore
└── README.md
```

---

## 📡 API Reference

Base URL: `https://automata-lab-backend.onrender.com`

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status and endpoint directory |
| `GET` | `/api/health` | Service uptime and language catalog count |
| `GET` | `/api/languages` | Complete catalog of regular and non-regular languages |
| `POST` | `/api/check-membership` | Check if string $w \in L$ (`{ lang: "anbn", w: "aabb" }`) |
| `POST` | `/api/decompositions` | Compute all valid $(x, y, z)$ splits for length $p$ |
| `POST` | `/api/pump` | Generate pumped series $xy^i z$ for $i = 0 \dots k$ |
| `POST` | `/api/validate-decomposition` | Validate decomposition against formal conditions |
| `POST` | `/api/dfa-trace` | Step-by-step state sequence for a given DFA |
| `POST` | `/api/nfa-trace` | State branch evolution for a given NFA |
| `GET` | `/api/quiz-round` | Generate a challenge round (`?level=intermediate`) |

---

## 🚀 Local Setup & Running

### Prerequisites
- Node.js (v18 or higher)
- Python 3 (optional, for lightweight static serving)

### 1. Run the Frontend Locally

```bash
# Option A: Open directly in browser (macOS)
open frontend/index.html

# Option B: Run via Python HTTP server
cd frontend && python3 -m http.server 8000
# Then visit: http://localhost:8000

# Option C: Run via npx serve
npx serve frontend
```

### 2. Run the Backend Locally

```bash
cd backend
npm install
npm start
# Server starts on: http://localhost:4000
```

---

## 🧪 Automated Testing

The project includes an extensive test suite verifying formal language algorithms, DFA/NFA tracers, decomposition math, and state machines:

```bash
node "Automata project/test_runner.js"
```

### Test Coverage Highlights:
- **Language Membership:** $a^n b^n$, $0^n 1^n$, palindromes, primes, $(ab)^*$, $(a \cup b)^*$, and custom regex.
- **Decomposition Engine:** Full verification against pumping constraints ($|y| > 0, |xy| \le p$).
- **DFA & NFA Stepping:** $\varepsilon$-closure, deterministic transitions, non-deterministic branches, and dead state traps.
- **Finite State Machines:** Vending machine event reducer purity, traffic light timing, and password validator states.
- **Total Tests:** **124 passed, 0 failed**.

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML5, CSS3 (Custom Properties, CSS 3D Transforms, Responsive Grid), SVG, Vanilla JavaScript (ES6+).
- **Backend:** Node.js, Express.js, CORS.
- **Hosting & CI/CD:**
  - **Frontend:** [Vercel](https://vercel.com) (Edge CDN, SSL)
  - **Backend:** [Render](https://render.com) (Node.js Web Service)
  - **VCS:** GitHub
