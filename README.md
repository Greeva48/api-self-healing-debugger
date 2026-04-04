# ⚡ Agentic Self-Healing API Debugger (PoC)

🚀 Built as part of my Google Summer of Code 2026 proposal for API Dash.

---

## 🎥 Demo Video

👉 https://drive.google.com/file/d/1uX3yqTJDTSeXKvV-O7WwmcrRL8U6G-9J/view?usp=sharing

---

## 🧠 Overview

This project demonstrates an intelligent **agent-based API debugging system** that can automatically detect failures, analyze issues, apply fixes, and retry requests without manual intervention.

The system follows a self-healing pipeline:

**Executor → Analyzer → Fixer → Retry → Evaluation**

---

## ✨ Features

- Detects API failures (e.g., 404, invalid endpoints)
- Analyzes root cause of errors
- Applies heuristic-based fixes (pluralization, endpoint correction)
- Automatically retries corrected requests
- Displays full debugging flow in a modern UI
- Shows URL transformation (Before → After)

---

## ⚙️ How It Works

### 1️⃣ Executor
Sends the initial API request and captures failure.

### 2️⃣ Analyzer
Identifies the issue (e.g., "Endpoint not found").

### 3️⃣ Fixer
Applies intelligent corrections:
- `/post` → `/posts`
- Fuzzy matching for similar endpoints

### 4️⃣ Retry
Retries request using the corrected URL.

### 5️⃣ Evaluation
Determines success or failure of the fix.

---

## 📌 Example

### Input
https://jsonplaceholder.typicode.com/post

## 🧪 Test API

This project uses JSONPlaceholder (a mock REST API) to simulate real-world API failures.

Example:
- https://jsonplaceholder.typicode.com/post → ❌ Invalid endpoint (404)
- https://jsonplaceholder.typicode.com/posts → ✅ Valid endpoint (200)

This allows the system to demonstrate automatic error detection and self-healing behavior.


### System Behavior
- Detects 404 error
- Identifies incorrect endpoint
- Fixes `post` → `posts`
- Retries request
- Returns 200 success ✅

---

## 🧩 Tech Stack

### Backend
- Node.js
- Express.js

### Frontend
- React (Vite)
- Tailwind CSS
- Framer Motion

---

## 🖥️ Running Locally

### 1. Backend
```bash
node server.js

### 2. Frontend
cd client
npm install
npm run dev


