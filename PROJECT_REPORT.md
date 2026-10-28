# STUATTEN: BLUETOOTH-BASED SMART ATTENDANCE SYSTEM
## Mini Project Report — Academic Session 2026–27

**Submitted in partial fulfilment of the requirement for the award of the degree of**  
**Bachelor of Technology in Computer Science & Engineering (B.Tech CSE)**  
**Affiliated to:** Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow  
**Department:** Department of Computer Science & Engineering & Allied Branches  
**Institution:** Lloyd Institute of Engineering & Technology, Plot No. 3, Knowledge Park II, Greater Noida (U.P.) 201306  

---

### Student & Supervisor Information
- **Student Name:** Ashutosh Gupta
- **University Roll No:** 2501530100032
- **Semester & Section:** Semester 3 & Section 2A
- **Course & Code:** B.Tech Second Year Mini Project &bull; BCC351
- **Project Guide:** Mr. Vishal Gupta, Assistant Professor & Project Coordinator
- **Project Coordinator:** Dr. Devendra Gautam, Associate Professor
- **Head of Department:** Ms. Deepika Arora, Assistant Professor & Deputy Head – CSE
- **Dean Academics:** Prof. (Dr.) Kumud Saxena, Professor

---

## Abstract
In engineering institutions affiliated with Dr. A.P.J. Abdul Kalam Technical University (AKTU), maintaining 75% attendance is mandatory for semester examination eligibility. However, traditional attendance techniques — paper roll calls and static QR codes — waste 15–20% of lecture time (8 to 12 minutes per class) and suffer from rampant proxy marking.

**Stuatten** is a zero-hardware, high-security smart attendance ecosystem combining:
1. **Bluetooth Low Energy (BLE) Beacon Proximity Detection:** Teacher phone advertises short-lived, encrypted 128-bit UUID session tokens without pairing.
2. **Device-Level Biometric Verification:** FIDO2 / WebAuthn passkeys supporting native fingerprint sensors and camera face unlock.
3. **Haversine GPS Geofencing:** Mathematical distance checks ensuring the student is physically within 50 meters of the classroom center.
4. **Instant Real-Time Synchronization:** WebSockets / Socket.IO live updates streamed directly to the educator's dashboard without refreshing.
5. **AKTU Automated Analytics:** Instant calculation of the 75% attendance rule, identification of defaulters, and one-click UTF-8 BOM Excel exports.

---

## 1. Problem Statement & Objectives
- Eliminate proxy attendance using a 5-layer multi-factor presence verification pipeline (BLE + Biometrics + Geofencing).
- Automate attendance logging to under 45 seconds per lecture.
- Provide real-time live synchronization using WebSockets (Socket.IO).
- Automate AKTU 75% percentage tracking and provide one-click Excel/CSV report exports.

---

## 2. System Architecture
```
[ Teacher Dashboard ] ──(Create Session)──▶ [ Express REST API ]
         │ (BLE Advertisement)                       │
         ▼                                           ▼
[ Ephemeral Beacon Token ]                    [ MongoDB Atlas ]
         ▲                                           ▲
         │ (Scan & Detect)                           │ (POST /attendance/mark)
[ Student Smartphone ] ──(Biometric + GPS Geofence)─┘
         │
         ▼
[ Socket.IO Server ] ──(Emit "attendance:new")──▶ [ Teacher Live Roster Updates ]
```

---

## 3. Technology Stack
- **Frontend:** React.js 18, Vite 5, CSS3 Custom Properties (Dark/Light themes).
- **Backend API:** Node.js v18+, Express.js 4, Socket.IO 4.8.
- **Database:** MongoDB Atlas, Mongoose 8.4 with in-memory offline fallback.
- **Mobile Engine:** Android Native (Kotlin) & Expo SDK 51.

---

## 4. Test Results
- **Classroom Convergence:** < 45 seconds for 60 students.
- **API Response Latency:** < 180 ms.
- **Socket.IO Live Roster Push:** < 50 ms.
- **Duplicate Prevention:** 100% blocked by compound unique database indexes `{ sessionId: 1, rollNumber: 1 }`.
- **Geofence Enforcement:** 100% blocked when GPS distance > 50 meters.
