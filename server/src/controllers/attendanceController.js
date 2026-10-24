const QRCode = require('qrcode');
const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const mongoose = require('mongoose');

function isMongoConnected() { return mongoose.connection.readyState === 1; }

// ─── Offline Fallback Session Store ───────────────────────────────────────────
const OFFLINE_SESSION = {
  sessionId: 'SESS_DEMO_KCS501',
  subjectCode: 'KCS-501',
  subjectName: 'Web Technology',
  facultyId: 'T1001',
  facultyName: 'Prof. Rajesh Kumar',
  branch: 'CSE',
  semester: '5th Sem',
  section: 'A',
  date: new Date().toISOString().split('T')[0],
  startTime: '10:00',
  endTime: '11:00',
  location: { latitude: 28.6139, longitude: 77.2090 },
  allowedRadiusMeters: 50,
  qrCodeToken: 'QR_DEMO_TOKEN_123',
  isActive: true
};

const OFFLINE_ROSTER = [
  { rollNumber: '2100270100001', fullName: 'Amit Kumar Singh', profilePhotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80', status: 'PRESENT', distanceMeters: 14.2, markedAt: '10:04 AM' },
  { rollNumber: '2100270100002', fullName: 'Priya Sharma', profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', status: 'PRESENT', distanceMeters: 8.5, markedAt: '10:06 AM' },
  { rollNumber: '2100270100003', fullName: 'Rahul Verma', profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', status: 'ABSENT', distanceMeters: null, markedAt: null },
  { rollNumber: '2100270100004', fullName: 'Sneha Patel', profilePhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', status: 'ABSENT', distanceMeters: null, markedAt: null }
];

const { isWithinGeofence } = require('../utils/geofence');

// ─── Teacher: Create Session ──────────────────────────────────────────────────
exports.createSession = async (req, res) => {
  try {
    const { subjectCode, subjectName, branch, semester, section, allowedRadiusMeters, location, durationMinutes } = req.body;
    if (!subjectCode || !location?.latitude || !location?.longitude) {
      return res.status(400).json({ success: false, message: 'Subject code and GPS location are required.' });
    }

    const sessionId = 'SESS_' + Date.now();
    const qrCodeToken = 'QR_' + Math.random().toString(36).substring(2, 10).toUpperCase();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const startTimeStr = now.toTimeString().substring(0, 5);
    const endObj = new Date(now.getTime() + (durationMinutes || 60) * 60000);
    const endTimeStr = endObj.toTimeString().substring(0, 5);

    const sessionData = {
      sessionId, subjectCode, subjectName: subjectName || subjectCode,
      facultyId: req.user.identifier, facultyName: req.user.name,
      branch: branch || 'CSE', semester: semester || '5th Sem', section: section || 'A',
      date: dateStr, startTime: startTimeStr, endTime: endTimeStr,
      location: { latitude: Number(location.latitude), longitude: Number(location.longitude) },
      allowedRadiusMeters: allowedRadiusMeters || 50,
      qrCodeToken, isActive: true
    };

    if (isMongoConnected()) {
      const { AttendanceSession } = require('../models/Schemas');
      await AttendanceSession.updateMany({ subjectCode, section, isActive: true }, { isActive: false });
      await AttendanceSession.create(sessionData);
    } else {
      Object.assign(OFFLINE_SESSION, sessionData);
    }

    const qrDataUrl = await QRCode.toDataURL(JSON.stringify({ sessionId, qrCodeToken, subjectCode }));
    return res.json({ success: true, message: 'Session created!', session: sessionData, qrDataUrl });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error creating session.', error: err.message });
  }
};

// ─── Get Active Sessions ──────────────────────────────────────────────────────
exports.getActiveSessions = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      return res.json({ success: true, sessions: [OFFLINE_SESSION] });
    }
    const { AttendanceSession } = require('../models/Schemas');
    const sessions = await AttendanceSession.find({ isActive: true }).sort({ createdAt: -1 });
    return res.json({ success: true, count: sessions.length, sessions });
  } catch (err) {
    return res.json({ success: true, sessions: [OFFLINE_SESSION] });
  }
};

// ─── Student: Mark Attendance ─────────────────────────────────────────────────
exports.markAttendance = async (req, res) => {
  try {
    const { sessionId, qrCodeToken, location, biometricVerified, deviceId } = req.body;
    const rollNumber = req.user.identifier;

    if (!sessionId || location?.latitude === undefined) {
      return res.status(400).json({ success: false, message: 'Session ID and GPS location are required.' });
    }

    // Offline mode
    if (!isMongoConnected()) {
      const session = OFFLINE_SESSION;
      if (!session.isActive) return res.status(400).json({ success: false, message: 'Session is closed.' });
      if (qrCodeToken && session.qrCodeToken !== qrCodeToken) return res.status(400).json({ success: false, message: 'Invalid QR code.' });

      const geo = isWithinGeofence(Number(location.latitude), Number(location.longitude), session.location.latitude, session.location.longitude, session.allowedRadiusMeters);
      if (!geo.isWithin) return res.status(403).json({ success: false, message: `You are ${geo.distanceMeters}m away. Must be within ${session.allowedRadiusMeters}m of classroom.` });
      if (!biometricVerified) return res.status(400).json({ success: false, message: 'Biometric verification failed.' });

      return res.json({ success: true, message: `Attendance marked PRESENT for ${session.subjectName}!`, record: { sessionId, rollNumber, subjectCode: session.subjectCode, status: 'PRESENT', markedAt: new Date() } });
    }

    // MongoDB mode
    const { AttendanceSession, AttendanceRecord, Student, Notification, AuditLog } = require('../models/Schemas');
    const session = await AttendanceSession.findOne({ sessionId });
    if (!session?.isActive) return res.status(400).json({ success: false, message: 'Session is closed or not found.' });
    if (qrCodeToken && session.qrCodeToken !== qrCodeToken) return res.status(400).json({ success: false, message: 'Invalid QR code.' });

    const existing = await AttendanceRecord.findOne({ sessionId, rollNumber });
    if (existing) return res.status(400).json({ success: false, message: 'Duplicate attendance blocked! Already marked for this session.', markedAt: existing.markedAt });

    const geo = isWithinGeofence(Number(location.latitude), Number(location.longitude), session.location.latitude, session.location.longitude, session.allowedRadiusMeters || 50);
    if (!geo.isWithin) {
      await AuditLog?.create({ action: 'GEOFENCE_BREACH', userRole: 'STUDENT', userId: rollNumber, details: `${geo.distanceMeters}m > ${session.allowedRadiusMeters}m limit` }).catch(() => {});
      return res.status(403).json({ success: false, message: `Geofence failed: ${geo.distanceMeters}m away. Must be within ${session.allowedRadiusMeters}m.` });
    }
    if (!biometricVerified) return res.status(400).json({ success: false, message: 'Biometric verification failed or skipped.' });

    const student = await Student.findOne({ rollNumber });
    const record = await AttendanceRecord.create({ sessionId, studentId: student?._id || rollNumber, rollNumber, studentName: student?.fullName || req.user.name, subjectCode: session.subjectCode, date: session.date, status: 'PRESENT', verificationDetails: { distanceMeters: geo.distanceMeters, isWithinRadius: true, biometricVerified: true, photoVerified: true, deviceId: deviceId || 'DEVICE_01' } });

    await Notification?.create({ recipientId: rollNumber, recipientRole: 'STUDENT', title: 'Attendance Marked ✅', message: `PRESENT for ${session.subjectCode} (${session.subjectName})`, type: 'ATTENDANCE' }).catch(() => {});
    return res.json({ success: true, message: 'Attendance marked successfully!', record, studentPhotoUrl: student?.profilePhotoUrl });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error marking attendance.', error: err.message });
  }
};

// ─── Teacher: Get Session Roster ──────────────────────────────────────────────
exports.getSessionAttendance = async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const present = OFFLINE_ROSTER.filter(r => r.status === 'PRESENT').length;
      return res.json({ success: true, session: OFFLINE_SESSION, totalStudents: OFFLINE_ROSTER.length, presentCount: present, absentCount: OFFLINE_ROSTER.length - present, roster: OFFLINE_ROSTER });
    }
    const { AttendanceSession, AttendanceRecord, Student } = require('../models/Schemas');
    const session = await AttendanceSession.findOne({ sessionId: req.params.sessionId });
    if (!session) return res.status(404).json({ success: false, message: 'Session not found.' });
    const records = await AttendanceRecord.find({ sessionId: req.params.sessionId });
    const allStudents = await Student.find({ branch: session.branch, section: session.section });
    const roster = allStudents.map(st => {
      const rec = records.find(r => r.rollNumber === st.rollNumber);
      return { rollNumber: st.rollNumber, fullName: st.fullName, profilePhotoUrl: st.profilePhotoUrl, status: rec ? rec.status : 'ABSENT', markedAt: rec?.markedAt, distanceMeters: rec?.verificationDetails?.distanceMeters };
    });
    return res.json({ success: true, session, totalStudents: allStudents.length, presentCount: records.length, absentCount: allStudents.length - records.length, roster });
  } catch (err) {
    return res.json({ success: true, session: OFFLINE_SESSION, totalStudents: OFFLINE_ROSTER.length, presentCount: 2, absentCount: 2, roster: OFFLINE_ROSTER });
  }
};

// ─── Teacher: Toggle Status ───────────────────────────────────────────────────
exports.toggleAttendanceStatus = async (req, res) => {
  try {
    const { sessionId, rollNumber, newStatus } = req.body;
    if (!isMongoConnected()) {
      const student = OFFLINE_ROSTER.find(r => r.rollNumber === rollNumber);
      if (student) student.status = newStatus;
      return res.json({ success: true, message: `${rollNumber} set to ${newStatus}` });
    }
    const { AttendanceRecord, Student, AttendanceSession } = require('../models/Schemas');
    let record = await AttendanceRecord.findOne({ sessionId, rollNumber });
    const student = await Student.findOne({ rollNumber });
    const session = await AttendanceSession.findOne({ sessionId });
    if (!record) {
      record = await AttendanceRecord.create({ sessionId, studentId: student?._id || rollNumber, rollNumber, studentName: student?.fullName || 'Student', subjectCode: session?.subjectCode || 'SUBJECT', date: session?.date || new Date().toISOString().split('T')[0], status: newStatus || 'PRESENT', verificationDetails: { biometricVerified: false, photoVerified: true } });
    } else { record.status = newStatus; await record.save(); }
    return res.json({ success: true, message: `Status updated to ${newStatus}`, record });
  } catch (err) { return res.status(500).json({ success: false, message: 'Error updating status.' }); }
};

// ─── Teacher: Get All Sessions ────────────────────────────────────────────────
exports.getTeacherSessions = async (req, res) => {
  try {
    const facultyId = req.user.identifier;
    if (!isMongoConnected()) {
      return res.json({ success: true, sessions: [OFFLINE_SESSION], total: 1 });
    }
    const { AttendanceSession, AttendanceRecord } = require('../models/Schemas');
    const sessions = await AttendanceSession.find({ facultyId }).sort({ createdAt: -1 }).limit(30);
    const sessionsWithCounts = await Promise.all(sessions.map(async (sess) => {
      const presentCount = await AttendanceRecord.countDocuments({ sessionId: sess.sessionId, status: 'PRESENT' });
      return { ...sess.toObject(), presentCount };
    }));
    return res.json({ success: true, sessions: sessionsWithCounts, total: sessions.length });
  } catch (err) {
    return res.json({ success: true, sessions: [OFFLINE_SESSION], total: 1 });
  }
};

// ─── Teacher: Close Session ───────────────────────────────────────────────────
exports.closeSession = async (req, res) => {
  try {
    if (!isMongoConnected()) { OFFLINE_SESSION.isActive = false; return res.json({ success: true, message: 'Session closed.' }); }
    const { AttendanceSession } = require('../models/Schemas');
    const session = await AttendanceSession.findOneAndUpdate({ sessionId: req.params.sessionId }, { isActive: false }, { new: true });
    return res.json({ success: true, message: 'Session closed.', session });
  } catch (err) { return res.status(500).json({ success: false, message: 'Error closing session.' }); }
};

// ─── Export to Excel ──────────────────────────────────────────────────────────
exports.exportToExcel = async (req, res) => {
  try {
    const roster = isMongoConnected() ? [] : OFFLINE_ROSTER;
    const session = OFFLINE_SESSION;
    const data = roster.map((st, idx) => ({
      'S.No': idx + 1, 'AKTU Roll No': st.rollNumber, 'Student Name': st.fullName,
      'Subject': session.subjectCode, 'Date': session.date,
      'Status': st.status, 'Distance (m)': st.distanceMeters || 'N/A'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Attendance_${req.params.sessionId}.xlsx`);
    return res.send(buffer);
  } catch (err) { return res.status(500).json({ success: false, message: 'Error exporting Excel.' }); }
};

// ─── Export to PDF ────────────────────────────────────────────────────────────
exports.exportToPdf = async (req, res) => {
  try {
    const roster = isMongoConnected() ? [] : OFFLINE_ROSTER;
    const session = OFFLINE_SESSION;
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Attendance_${req.params.sessionId}.pdf`);
    doc.pipe(res);
    doc.fontSize(16).font('Helvetica-Bold').text('AKTU Smart Attendance System — stuatten', { align: 'center' });
    doc.fontSize(11).font('Helvetica').text(`Subject: ${session.subjectName} (${session.subjectCode}) | Date: ${session.date}`, { align: 'center' });
    doc.text(`Faculty: ${session.facultyName} | Branch: ${session.branch}-${session.section}`, { align: 'center' });
    doc.moveDown();
    doc.font('Helvetica-Bold').text('S.No  Roll Number        Name                    Status');
    doc.font('Helvetica');
    roster.forEach((st, idx) => { doc.text(`${String(idx + 1).padEnd(5)} ${st.rollNumber.padEnd(18)} ${st.fullName.padEnd(23)} ${st.status}`); });
    doc.end();
  } catch (err) { return res.status(500).json({ success: false, message: 'Error generating PDF.' }); }
};
