# 🎓 stuatten — Smart Biometric Attendance System
### 3rd Semester Mini Project | AKTU Compatible

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

An **Android-first & Web-compatible Smart Biometric Attendance Management System** engineered to eliminate proxy attendance in colleges and universities using multi-factor verification: GPS geofencing (50-meter radius), biometric authentication, photo identity verification, and faculty-controlled dynamic sessions.

---

## 📌 Project Objectives

- **Zero-Proxy Guarantee**: Enforce physical presence inside the classroom through GPS Geofencing (50m strict radius) and biometric validation.
- **Role-Based Access Control**: Tailored portals for **Students**, **Teachers**, and **College Administrators**.
- **Dynamic Session Control**: Real-time lecture session creation with dynamic QR codes, live rosters, and manual override capabilities.
- **Instant Analytics & Reports**: Automatic calculation of subject-wise attendance percentages, defaulter detection (<75%), and one-click export to **Excel (.xlsx/.csv)** and **PDF**.
- **AKTU Compatible**: Built to align with Dr. A.P.J. Abdul Kalam Technical University roll number formatting, semester layouts, and curriculum compliance.

---

## 📑 Application Pages & Verification Modules

| # | Page / Module | Status | Description |
| :-: | :--- | :-: | :--- |
| 1 | **Landing Page** | ✅ Implemented | Modern responsive portal introducing Stuatten, core capabilities, security highlights, and direct CTAs. |
| 2 | **Login Page** | ✅ Implemented | Secure multi-role login with role switching (Student, Faculty, Admin) and 1-click demo autofill. |
| 3 | **Registration Page** | ✅ Implemented | Interactive onboarding for new students (AKTU 13-digit roll, branch, sem) and faculty members. |
| 4 | **Teacher Dashboard** | ✅ Implemented | Session launcher with dynamic QR codes, live attendance roster, and manual override controls. |
| 5 | **Student Dashboard** | ✅ Implemented | Live overall attendance gauge, active lecture banner, defaulter alert (<75%), and subject stats. |
| 6 | **Attendance Page** | ✅ Implemented | Guided 5-step anti-proxy attendance flow ensuring end-to-end identity and physical presence. |
| 7 | **Location Verification** | ✅ Implemented | Real browser Geolocation permission (`navigator.geolocation`) validating 50m classroom boundary via Haversine. |
| 8 | **Biometric Verification** | ✅ Implemented | WebAuthn & Passkeys API (`window.PublicKeyCredential`) for Windows Hello, Touch ID, Face ID, and Fingerprint. |
| 9 | **Attendance History** | ✅ Implemented | Comprehensive filterable lecture log with geofence distance logs, verification methods, and timestamps. |
| 10 | **Reports Page & Excel Export** | ✅ Implemented | Summary KPI cards, interactive filters (subject/section/status), and 1-click **Excel (.csv/.xlsx)** download. |

---

## ✨ Features by Role

### 👨‍🎓 Student Portal
- **Secure Authentication**: AKTU 13-digit roll number login with encrypted password.
- **Interactive Dashboard**: Real-time overall attendance gauge, defaulter warning indicator (<75%), and subject-wise progress bars.
- **5-Step Attendance Workflow**:
  1. *Select Active Session*: Pick live classroom lecture created by faculty.
  2. *GPS Geofence Verification*: Validates student coordinates within 50m of teacher coordinates using the Haversine formula.
  3. *Biometric Authentication*: Hardware fingerprint / Face unlock authentication.
  4. *Photo Identity Check*: Displays approved official student profile photo.
  5. *Submission*: Instant confirmation with duplicate attendance blocking.
- **Attendance History**: Complete filterable log with timestamps and geofence distance logs.
- **Alerts & Notifications**: Automated push warnings for low attendance and approvals.
- **Profile & Photo Management**: Request official photo update with faculty/admin approval workflow.

### 👩‍🏫 Teacher Portal
- **Faculty Portal**: Assigned subjects management and lecture overview.
- **Create Attendance Session**:
  - Select subject, branch, semester, and section.
  - Set geofence radius (default 50 meters) using current GPS position.
  - Generates live dynamic session QR code.
- **Live Attendance Roster**:
  - Real-time list of students marking attendance.
  - One-click Present/Absent manual toggle.
  - Search students by roll number or name.
  - Export session roster to **Excel (.xlsx)** and **PDF**.
- **Session History & Control**: Close active sessions anytime or inspect past logs.

### 🛠️ Admin Portal
- **Executive Analytics**: Total student count, faculty count, defaulter statistics (<75%), and branch-wise attendance metrics.
- **Defaulter Management**: Real-time list of students below 75% attendance criteria.
- **Profile Photo Approvals**: Approve or reject student profile photo update requests.
- **Security Audit Logs**: Comprehensive security trail tracking logins, geofence violations, duplicate attempts, and administrative actions.

---

## 🔐 Advanced Security Implementation

| Security Layer | Mechanism |
| :--- | :--- |
| **GPS Geofencing** | High-precision Haversine algorithm enforcing a strict 50m radius around the faculty's location. |
| **Biometric Auth** | Integrated with Android BiometricPrompt API (Fingerprint & Face Unlock). |
| **Anti-Proxy Identity** | Verification of verified student photo upon attendance submission. |
| **Token-Based Auth** | Secure stateless JWT (JSON Web Tokens) with role claims. |
| **Session Control** | Time-bound lecture sessions with single-submission enforcement per student per session. |
| **Database Encryption** | Passwords hashed using `bcryptjs` with salt rounds. |
| **Audit Trails** | Complete logging of all security events and anomaly detections. |

---

## 🚀 Quick Start Guide

### Option 1: Run Web App via Backend Server (Recommended)

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   npm install
   npm start
   ```
2. Open your web browser at:
   ```
   http://localhost:5000
   ```
   *(The server includes an in-memory offline fallback if MongoDB is not locally running!)*

### Option 2: Standalone Zero-Server Web App

You can run the web app with **zero dependencies or servers** by directly opening:
- Double click [`stuatten.html`](stuatten.html) in any browser (Chrome, Edge, Firefox, Safari).

### Option 3: Launch with Windows Desktop Script

Double-click `START_APP.bat` or `START_stuatten.bat` to automatically spin up the backend server and open the browser interface in one click.

### Option 4: React Native Mobile App (Expo)

1. From the project root folder:
   ```bash
   npm install
   npx expo start
   ```
2. Press `a` for Android Emulator, `w` for Web, or scan the QR code using the **Expo Go** app on your physical Android device.

---

## 🔑 Demo Credentials

| Role | Username / Identifier | Password |
| :--- | :--- | :--- |
| **Student** | `2100270100001` | `studentpassword` |
| **Teacher** | `T1001` | `teacherpassword` |
| **Admin** | `admin` | `adminpassword123` |

*(Quick-login demo buttons are also available directly on the login screen for instant evaluation.)*

---

## 📂 Project Structure

```
stuatten/
├── App.js                         # React Native root navigation & state machine
├── package.json                   # Mobile app dependencies (Expo, React Native)
├── stuatten.html                  # Standalone zero-dependency web app
├── DEPLOYMENT_GUIDE.md            # Detailed deployment & operations guide
├── START_APP.bat                  # One-click Windows launcher
├── src/                           # Mobile app source code
│   ├── context/                   # Authentication Context
│   ├── screens/
│   │   ├── admin/                 # Admin Dashboard
│   │   ├── auth/                  # Login Screen
│   │   ├── student/               # Student screens (Dashboard, Mark, History, Profile)
│   │   └── teacher/               # Teacher screens (Dashboard, Create Session, Live Roster)
│   ├── services/                  # REST API client
│   └── theme/                     # Global colors and styling
└── server/                        # Node.js + Express backend
    ├── package.json               # Backend dependencies
    ├── public/
    │   └── index.html             # Served web application
    └── src/
        ├── config/db.js           # MongoDB connection with offline fallback
        ├── controllers/           # Auth, Student, Teacher, Admin, Attendance logic
        ├── middleware/            # JWT verification & RBAC middleware
        ├── models/                # Mongoose schemas (Students, Teachers, Sessions, etc.)
        ├── routes/api.js          # REST API endpoints
        ├── utils/geofence.js      # Haversine distance calculator
        ├── seed.js                # Database seeder
        └── server.js              # Express app entrypoint
```

---

## 🌐 API Overview

- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/student/overview` — Subject stats, overall %, recent history
- `POST /api/attendance/mark` — Verify GPS geofence + mark biometric attendance
- `POST /api/teacher/session/create` — Generate dynamic attendance session & QR
- `GET /api/teacher/session/:id/roster` — Real-time attendance list
- `GET /api/teacher/session/:id/export/excel` — Export attendance sheet to Excel
- `GET /api/admin/stats` — University-wide attendance analytics & defaulter list

---

## 👤 Author

- **Ashutosh Gupta**
- AKTU Roll Number: `2100270100088`
- 3rd Semester Mini Project

---

## 📄 License
This project is licensed under the MIT License.
