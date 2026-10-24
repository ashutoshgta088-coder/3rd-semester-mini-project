const mongoose = require('mongoose');

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// ─── Offline Mock Data for Student Overview ───────────────────────────────────
const OFFLINE_STUDENT_PROFILES = {
  '2100270100001': {
    rollNumber: '2100270100001',
    fullName: 'Amit Kumar Singh',
    branch: 'CSE',
    year: '3rd Year',
    semester: '5th Sem',
    section: 'A',
    mobileNumber: '9988776655',
    email: 'amit.singh@student.aktu.ac.in',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    photoApproved: true
  },
  '2100270100002': {
    rollNumber: '2100270100002',
    fullName: 'Priya Sharma',
    branch: 'CSE',
    year: '3rd Year',
    semester: '5th Sem',
    section: 'A',
    mobileNumber: '9988776656',
    email: 'priya.sharma@student.aktu.ac.in',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    photoApproved: true
  }
};

const OFFLINE_SUBJECT_STATS = [
  { subjectCode: 'KCS-501', subjectName: 'Web Technology', totalLectures: 24, attended: 22, percentage: 92, isDefaulter: false },
  { subjectCode: 'KCS-502', subjectName: 'Database Management Systems', totalLectures: 26, attended: 23, percentage: 88, isDefaulter: false },
  { subjectCode: 'KCS-503', subjectName: 'Design & Analysis of Algorithms', totalLectures: 28, attended: 21, percentage: 75, isDefaulter: false },
  { subjectCode: 'KNC-501', subjectName: 'Constitution of India', totalLectures: 15, attended: 13, percentage: 86, isDefaulter: false }
];

const OFFLINE_ATTENDANCE_HISTORY = [
  { subjectCode: 'KCS-501', subjectName: 'Web Technology', date: '2026-09-13', status: 'PRESENT', markedAt: new Date().toISOString(), distanceMeters: 14.2, facultyName: 'Prof. Rajesh Kumar' },
  { subjectCode: 'KCS-502', subjectName: 'Database Management Systems', date: '2026-09-12', status: 'PRESENT', markedAt: new Date(Date.now() - 86400000).toISOString(), distanceMeters: 22.5, facultyName: 'Prof. Rajesh Kumar' },
  { subjectCode: 'KCS-503', subjectName: 'Design & Analysis of Algorithms', date: '2026-09-11', status: 'ABSENT', markedAt: null, distanceMeters: null, facultyName: 'Dr. Sunita Agarwal' },
  { subjectCode: 'KCS-501', subjectName: 'Web Technology', date: '2026-09-10', status: 'PRESENT', markedAt: new Date(Date.now() - 3 * 86400000).toISOString(), distanceMeters: 8.9, facultyName: 'Prof. Rajesh Kumar' },
  { subjectCode: 'KCS-502', subjectName: 'Database Management Systems', date: '2026-09-09', status: 'PRESENT', markedAt: new Date(Date.now() - 4 * 86400000).toISOString(), distanceMeters: 31.1, facultyName: 'Prof. Rajesh Kumar' }
];

const OFFLINE_NOTIFICATIONS = [
  { _id: 'N1', title: 'Attendance Marked ✅', message: 'PRESENT for KCS-501 (Web Technology)', type: 'ATTENDANCE', isRead: false, createdAt: new Date().toISOString() },
  { _id: 'N2', title: 'Attendance Session Started', message: 'Prof. Rajesh Kumar started KCS-502 session', type: 'INFO', isRead: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 'N3', title: 'Photo Approved ✅', message: 'Your profile photo has been verified and approved by admin.', type: 'INFO', isRead: true, createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { _id: 'N4', title: 'Low Attendance Warning ⚠️', message: 'Your attendance in KCS-503 is at 75%. Minimum required is 75%.', type: 'WARNING', isRead: true, createdAt: new Date(Date.now() - 5 * 86400000).toISOString() }
];

// ─── Get Student Profile ──────────────────────────────────────────────────────
exports.getStudentProfile = async (req, res) => {
  try {
    const rollNumber = req.user.identifier;

    if (!isMongoConnected()) {
      const profile = OFFLINE_STUDENT_PROFILES[rollNumber] || OFFLINE_STUDENT_PROFILES['2100270100001'];
      return res.json({ success: true, student: profile, _offline: true });
    }

    const { Student } = require('../models/Schemas');
    const student = await Student.findOne({ rollNumber }).select('-password');
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }
    return res.json({ success: true, student });
  } catch (err) {
    console.error('[studentController.getStudentProfile]', err.message);
    return res.json({ success: true, student: OFFLINE_STUDENT_PROFILES['2100270100001'], _offline: true });
  }
};

// ─── Get Student Attendance Overview (Subject-wise) ───────────────────────────
exports.getStudentAttendanceOverview = async (req, res) => {
  try {
    const rollNumber = req.user.identifier;

    if (!isMongoConnected()) {
      const totalHeld = OFFLINE_SUBJECT_STATS.reduce((s, x) => s + x.totalLectures, 0);
      const totalAttended = OFFLINE_SUBJECT_STATS.reduce((s, x) => s + x.attended, 0);
      const overallPercentage = Math.round((totalAttended / totalHeld) * 100);

      return res.json({
        success: true,
        rollNumber,
        fullName: 'Amit Kumar Singh',
        overallPercentage,
        isDefaulter: overallPercentage < 75,
        subjectStats: OFFLINE_SUBJECT_STATS,
        recentHistory: OFFLINE_ATTENDANCE_HISTORY.slice(0, 5),
        _offline: true
      });
    }

    const { Student, AttendanceRecord, Subject } = require('../models/Schemas');
    const student = await Student.findOne({ rollNumber });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    const records = await AttendanceRecord.find({ rollNumber });
    const subjects = await Subject.find({ branch: student.branch, semester: student.semester });

    const subjectStats = subjects.map(sub => {
      const subRecords = records.filter(r => r.subjectCode === sub.code);
      const attended = subRecords.filter(r => r.status === 'PRESENT' || r.status === 'MANUAL').length;
      const totalLectures = sub.totalLecturesHeld || 1;
      const percentage = Math.round((attended / totalLectures) * 100);
      return {
        subjectCode: sub.code,
        subjectName: sub.name,
        totalLectures,
        attended,
        percentage,
        isDefaulter: percentage < 75
      };
    });

    const totalHeld = subjectStats.reduce((s, x) => s + x.totalLectures, 0);
    const totalAttended = subjectStats.reduce((s, x) => s + x.attended, 0);
    const overallPercentage = totalHeld > 0 ? Math.round((totalAttended / totalHeld) * 100) : 0;

    const recentHistory = records
      .sort((a, b) => new Date(b.markedAt) - new Date(a.markedAt))
      .slice(0, 10)
      .map(r => ({
        subjectCode: r.subjectCode,
        date: r.date,
        status: r.status,
        markedAt: r.markedAt,
        distanceMeters: r.verificationDetails?.distanceMeters
      }));

    return res.json({
      success: true,
      rollNumber,
      fullName: student.fullName,
      overallPercentage,
      isDefaulter: overallPercentage < 75,
      subjectStats,
      recentHistory
    });
  } catch (err) {
    console.error('[studentController.getStudentAttendanceOverview]', err.message);
    return res.json({
      success: true,
      rollNumber: req.user.identifier,
      fullName: req.user.name,
      overallPercentage: 86,
      isDefaulter: false,
      subjectStats: OFFLINE_SUBJECT_STATS,
      recentHistory: OFFLINE_ATTENDANCE_HISTORY.slice(0, 5),
      _offline: true
    });
  }
};

// ─── Get Attendance History (Full) ────────────────────────────────────────────
exports.getAttendanceHistory = async (req, res) => {
  try {
    const rollNumber = req.user.identifier;
    const { subjectCode, status, limit = 50 } = req.query;

    if (!isMongoConnected()) {
      let history = [...OFFLINE_ATTENDANCE_HISTORY];
      if (subjectCode) history = history.filter(h => h.subjectCode === subjectCode);
      if (status) history = history.filter(h => h.status === status);
      return res.json({ success: true, history: history.slice(0, Number(limit)), total: history.length, _offline: true });
    }

    const { AttendanceRecord } = require('../models/Schemas');
    const query = { rollNumber };
    if (subjectCode) query.subjectCode = subjectCode;
    if (status) query.status = status;

    const history = await AttendanceRecord.find(query)
      .sort({ markedAt: -1 })
      .limit(Number(limit));

    return res.json({ success: true, history, total: history.length });
  } catch (err) {
    console.error('[studentController.getAttendanceHistory]', err.message);
    return res.json({ success: true, history: OFFLINE_ATTENDANCE_HISTORY, total: OFFLINE_ATTENDANCE_HISTORY.length, _offline: true });
  }
};

// ─── Request Photo Update ─────────────────────────────────────────────────────
exports.requestPhotoUpdate = async (req, res) => {
  try {
    const rollNumber = req.user.identifier;
    const { photoUrl } = req.body;

    if (!photoUrl) {
      return res.status(400).json({ success: false, message: 'Photo URL is required.' });
    }

    if (!isMongoConnected()) {
      return res.json({
        success: true,
        message: 'Photo update request submitted. Pending teacher/admin approval.'
      });
    }

    const { Student, Notification } = require('../models/Schemas');
    const student = await Student.findOne({ rollNumber });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

    student.photoPendingUrl = photoUrl;
    student.photoApproved = false;
    await student.save();

    // Notify admin/teacher about pending approval
    await Notification.create({
      recipientId: 'ADMIN',
      recipientRole: 'ADMIN',
      title: 'Photo Approval Requested',
      message: `${student.fullName} (${rollNumber}) has submitted a new profile photo for approval.`,
      type: 'APPROVAL'
    }).catch(() => {});

    return res.json({
      success: true,
      message: 'Photo update request submitted! Pending teacher/admin approval.',
      student: { rollNumber, photoApproved: false }
    });
  } catch (err) {
    console.error('[studentController.requestPhotoUpdate]', err.message);
    return res.json({ success: true, message: 'Photo update request submitted (offline mode).' });
  }
};

// ─── Get Notifications ────────────────────────────────────────────────────────
exports.getStudentNotifications = async (req, res) => {
  try {
    const rollNumber = req.user.identifier;

    if (!isMongoConnected()) {
      return res.json({
        success: true,
        notifications: OFFLINE_NOTIFICATIONS,
        unreadCount: OFFLINE_NOTIFICATIONS.filter(n => !n.isRead).length,
        _offline: true
      });
    }

    const { Notification } = require('../models/Schemas');
    const notifications = await Notification.find({ recipientId: rollNumber })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = notifications.filter(n => !n.isRead).length;
    return res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    console.error('[studentController.getStudentNotifications]', err.message);
    return res.json({
      success: true,
      notifications: OFFLINE_NOTIFICATIONS,
      unreadCount: 2,
      _offline: true
    });
  }
};

// ─── Mark Notification as Read ────────────────────────────────────────────────
exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    if (!isMongoConnected()) {
      return res.json({ success: true, message: 'Notification marked as read.' });
    }
    const { Notification } = require('../models/Schemas');
    await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    return res.json({ success: true, message: 'Notification marked as read.' });
  }
};
