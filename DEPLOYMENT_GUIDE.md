# 🎓 stuatten — Smart Biometric Attendance System
## Deployment & Operating Guide (AKTU Compatible)

Android-first smart attendance with biometric authentication, GPS geofencing, QR code sessions, and anti-proxy detection.

---

## 🌐 Run in Web Browser (Quickest Start)

**Just start the backend — the web app is served automatically:**

```bash
cd server
npm install
npm start
```

Then open your browser at:

> **http://localhost:5000**

That's it! The complete web app (Student + Teacher + Admin dashboards) loads directly in any browser — Chrome, Firefox, Edge, Safari.

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│    Browser  →  http://localhost:5000    │
│    React Native Mobile App (Expo)       │
└──────────────────┬──────────────────────┘
                   │ HTTPS / REST API
                   ▼
┌─────────────────────────────────────────┐
│      Node.js / Express Server           │
│      JWT Auth + Security Middleware     │
│      Serves: /api/* + public/index.html │
└────────────┬────────────────────────────┘
             │
    ┌─────────────────┐
    │  MongoDB (opt.) │   ← Falls back to in-memory demo data
    │  OR OFFLINE MODE│     if MongoDB is not installed
    └─────────────────┘
```

---

## 🛠️ Backend Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment (Optional — defaults work)
Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/stuatten
JWT_SECRET=stuatten_secret_key_aktu_2026_SECURE_XYZ_9a8b7c
```

### 3. Seed Sample Data (if MongoDB is running)
```bash
npm run seed
```

### 4. Start Server
```bash
npm start
```

Server output:
```
✅ MongoDB connected (or) ⚠️ Running in OFFLINE/DEMO MODE
===================================================
🚀 stuatten Server running on port 5000
🌐 Web App:  http://localhost:5000
📡 API:      http://localhost:5000/api
❤️  Health:   http://localhost:5000/api/health
===================================================
```

---

## 📱 React Native Mobile App Setup

### 1. Install Dependencies (root folder)
```bash
npm install
```

### 2. Run Options

| Platform | Command |
|---------|---------|
| **Web Browser** | `npx expo start --web` |
| **Android Emulator** | `npx expo start --android` |
| **Physical Android Device** | `npx expo start` → scan QR with Expo Go |
| **iOS Simulator** | `npx expo start --ios` |

### 3. Build Android APK
```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

---

## 🔑 Demo Credentials

| Role | Identifier | Password |
|------|-----------|---------|
| **Student** | `2100270100001` | `studentpassword` |
| **Student 2** | `2100270100002` | `studentpassword` |
| **Teacher** | `T1001` | `teacherpassword` |
| **Admin** | `admin` | `adminpassword123` |

---

## 🔒 Security Features Implemented

| Feature | Implementation |
|---------|---------------|
| **GPS Geofencing** | Haversine formula, 50m classroom radius lock |
| **Biometric Auth** | Android Fingerprint/Face API (expo-local-authentication) |
| **JWT Tokens** | 24h expiry, role-based access control |
| **Device Binding** | `boundDeviceId` stored per account |
| **QR Code Sessions** | Unique token per session, validated server-side |
| **Duplicate Prevention** | One attendance per student per session |
| **Photo Approval Flow** | Teacher/admin approval before photo changes take effect |
| **Audit Logs** | All logins, attendance events, geofence breaches logged |
| **Defaulter Detection** | Automatic flagging of students < 75% attendance |
| **Rate Limiting** | 300 requests/15min per IP |
| **Helmet.js** | HTTP security headers |

---

## ☁️ Cloud Deployment (Free Options)

### Option A: Railway.app (Recommended)

1. Push code to GitHub
2. Connect Railway to your GitHub repo
3. Set environment variables:
   - `MONGODB_URI` → MongoDB Atlas connection string
   - `JWT_SECRET` → your secret key
4. Railway auto-deploys, gives you a public URL

### Option B: Render.com

1. Create new **Web Service** on render.com
2. Connect GitHub repo, set `Start Command`: `cd server && npm start`
3. Add environment variables
4. Free tier gives you `https://stuatten.onrender.com`

### Option C: MongoDB Atlas (Cloud Database)

1. Create free cluster at mongodb.com/atlas
2. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/stuatten`
3. Whitelist your server's IP
4. Set as `MONGODB_URI` environment variable

---

## 📡 API Reference

### Authentication
```
POST /api/auth/login
Body: { "identifier": "2100270100001", "password": "studentpassword", "role": "STUDENT" }
Response: { "success": true, "token": "JWT...", "user": {...} }
```

### Student APIs (require Bearer token)
```
GET  /api/student/profile        — Full student profile
GET  /api/student/overview       — Subject-wise attendance stats
GET  /api/student/history        — Full attendance history
GET  /api/student/notifications  — Notifications list
POST /api/student/photo-request  — Request photo update
```

### Teacher APIs (require Teacher token)
```
POST /api/teacher/session/create              — Create attendance session (returns QR)
GET  /api/teacher/sessions                    — Session history
GET  /api/teacher/session/:id/roster          — Live attendance list
POST /api/teacher/session/toggle-status       — Mark present/absent manually
POST /api/teacher/session/:id/close           — Close session
GET  /api/teacher/session/:id/export/excel    — Download Excel report
GET  /api/teacher/session/:id/export/pdf      — Download PDF report
```

### Admin APIs (require Admin token)
```
GET  /api/admin/stats            — Dashboard statistics
GET  /api/admin/students         — All students
POST /api/admin/students         — Create student
PUT  /api/admin/students/:roll   — Update student
GET  /api/admin/teachers         — All teachers
POST /api/admin/approve-photo    — Approve/reject photo update
GET  /api/admin/audit-logs       — Security audit trail
GET  /api/admin/subjects         — All subjects
GET  /api/admin/departments      — All departments
GET  /api/admin/analytics        — Branch-wise analytics
```

### System
```
GET /api/health   — Server status + MongoDB connection state
```

---

## 📊 Database Schema Summary

| Collection | Key Fields |
|-----------|-----------|
| `students` | rollNumber, fullName, branch, semester, section, profilePhotoUrl, photoApproved |
| `teachers` | facultyId, fullName, department, assignedSubjects |
| `admins` | username, role (SUPER_ADMIN / DEPT_ADMIN) |
| `attendancesessions` | sessionId, subjectCode, location, qrCodeToken, isActive |
| `attendancerecords` | sessionId, rollNumber, status, verificationDetails |
| `subjects` | code, name, branch, semester, totalLecturesHeld |
| `departments` | code, name, headOfDept, sections |
| `notifications` | recipientId, title, message, type, isRead |
| `auditlogs` | action, userId, userRole, timestamp, ipAddress |

---

## 🧪 Testing the 5-Step Attendance Flow

1. **Teacher**: Login → Create Session (get QR code)
2. **Student**: Login → Mark Attendance → Select session
3. **GPS**: System verifies student within 50m radius
4. **Biometric**: Fingerprint/Face ID authentication
5. **Photo**: Student profile photo shown for visual verification
6. **Submit**: Attendance marked PRESENT, duplicate blocked

© 2026 stuatten — Smart Biometric Attendance System (AKTU Compatible)
