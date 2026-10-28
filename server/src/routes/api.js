const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const attendanceController = require('../controllers/attendanceController');
const studentController = require('../controllers/studentController');
const adminController = require('../controllers/adminController');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// ─── Public Auth Routes ───────────────────────────────────────────────────────
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.post('/auth/forgot-password', authController.forgotPassword);
router.post('/auth/reset-password', authController.resetPassword);

// ─── Student Routes ───────────────────────────────────────────────────────────
router.get('/student/profile', verifyToken, verifyRole(['STUDENT']), studentController.getStudentProfile);
router.get('/student/overview', verifyToken, verifyRole(['STUDENT']), studentController.getStudentAttendanceOverview);
router.get('/student/history', verifyToken, verifyRole(['STUDENT']), studentController.getAttendanceHistory);
router.post('/student/photo-request', verifyToken, verifyRole(['STUDENT']), studentController.requestPhotoUpdate);
router.get('/student/notifications', verifyToken, verifyRole(['STUDENT']), studentController.getStudentNotifications);
router.post('/student/notifications/read', verifyToken, verifyRole(['STUDENT']), studentController.markNotificationRead);
router.get('/student/sessions/active', verifyToken, attendanceController.getActiveSessions);

// ─── Attendance Flow Routes ───────────────────────────────────────────────────
router.get('/attendance/active-sessions', verifyToken, attendanceController.getActiveSessions);
router.post('/attendance/mark', verifyToken, verifyRole(['STUDENT']), attendanceController.markAttendance);

// ─── Teacher Routes ───────────────────────────────────────────────────────────
router.post('/teacher/session/create', verifyToken, verifyRole(['TEACHER', 'ADMIN']), attendanceController.createSession);
router.get('/teacher/sessions', verifyToken, verifyRole(['TEACHER', 'ADMIN']), attendanceController.getTeacherSessions);
router.get('/teacher/session/:sessionId/roster', verifyToken, verifyRole(['TEACHER', 'ADMIN']), attendanceController.getSessionAttendance);
router.post('/teacher/session/:sessionId/start', verifyToken, verifyRole(['TEACHER', 'ADMIN']), (req, res) => res.json({ success: true, message: 'Session started.' }));
router.post('/teacher/session/toggle-status', verifyToken, verifyRole(['TEACHER', 'ADMIN']), attendanceController.toggleAttendanceStatus);
router.post('/teacher/session/:sessionId/manual', verifyToken, verifyRole(['TEACHER', 'ADMIN']), attendanceController.toggleAttendanceStatus);
router.post('/teacher/session/:sessionId/toggle-status', verifyToken, verifyRole(['TEACHER', 'ADMIN']), attendanceController.toggleAttendanceStatus);
router.post('/teacher/session/:sessionId/close', verifyToken, verifyRole(['TEACHER', 'ADMIN']), attendanceController.closeSession);
router.get('/teacher/session/:sessionId/export/excel', verifyToken, attendanceController.exportToExcel);
router.get('/teacher/session/:sessionId/export/pdf', verifyToken, attendanceController.exportToPdf);
router.get('/teacher/session/:sessionId/export', verifyToken, attendanceController.exportToExcel);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.get('/admin/stats', verifyToken, verifyRole(['ADMIN']), adminController.getAdminDashboardStats);
router.get('/admin/students', verifyToken, verifyRole(['ADMIN']), adminController.getAllStudents);
router.post('/admin/students', verifyToken, verifyRole(['ADMIN']), adminController.createStudent);
router.put('/admin/students/:rollNumber', verifyToken, verifyRole(['ADMIN']), adminController.updateStudent);
router.delete('/admin/students/:rollNumber', verifyToken, verifyRole(['ADMIN']), adminController.deleteStudent);
router.get('/admin/teachers', verifyToken, verifyRole(['ADMIN']), adminController.getAllTeachers);
router.post('/admin/teachers', verifyToken, verifyRole(['ADMIN']), adminController.createTeacher);
router.put('/admin/teachers/:facultyId', verifyToken, verifyRole(['ADMIN']), adminController.updateTeacher);
router.delete('/admin/teachers/:facultyId', verifyToken, verifyRole(['ADMIN']), adminController.deleteTeacher);
router.post('/admin/approve-photo', verifyToken, verifyRole(['ADMIN', 'TEACHER']), adminController.approveStudentPhoto);
router.get('/admin/audit-logs', verifyToken, verifyRole(['ADMIN']), adminController.getAuditLogs);
router.get('/admin/subjects', verifyToken, verifyRole(['ADMIN', 'TEACHER']), adminController.getAllSubjects);
router.post('/admin/subjects', verifyToken, verifyRole(['ADMIN']), adminController.createSubject);
router.get('/admin/departments', verifyToken, verifyRole(['ADMIN', 'TEACHER']), adminController.getAllDepartments);
router.post('/admin/departments', verifyToken, verifyRole(['ADMIN']), adminController.createDepartment);
router.get('/admin/sessions', verifyToken, verifyRole(['ADMIN']), adminController.getAllSessions);
router.get('/admin/analytics', verifyToken, verifyRole(['ADMIN']), adminController.getAnalytics);

// ─── System Health Check ──────────────────────────────────────────────────────
router.get('/health', (req, res) => {
  const mongoose = require('mongoose');
  return res.json({
    status: 'UP',
    appName: 'stuatten API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    aktuCompatible: true,
    mongoConnected: mongoose.connection.readyState === 1,
    mode: mongoose.connection.readyState === 1 ? 'MONGODB' : 'OFFLINE_DEMO'
  });
});

module.exports = router;
