const mongoose = require('mongoose');

// Student Schema (AKTU Compatible)
const StudentSchema = new mongoose.Schema({
  rollNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
  fullName: { type: String, required: true, trim: true },
  branch: { type: String, required: true, uppercase: true, trim: true }, // e.g., CSE, ECE, ME, IT
  year: { type: String, required: true }, // e.g., 3rd Year
  semester: { type: String, required: true }, // e.g., 5th Sem
  section: { type: String, required: true, uppercase: true }, // e.g., A
  mobileNumber: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  profilePhotoUrl: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80' },
  photoApproved: { type: Boolean, default: true },
  photoPendingUrl: { type: String, default: null },
  boundDeviceId: { type: String, default: null },
  isBiometricsEnrolled: { type: Boolean, default: true },
  isRootedDetected: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Teacher Schema
const TeacherSchema = new mongoose.Schema({
  facultyId: { type: String, required: true, unique: true, uppercase: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  mobileNumber: { type: String, required: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  assignedSubjects: [{ type: String }], // Array of Subject Codes e.g. ["KCS-501", "KCS-502"]
  boundDeviceId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Admin Schema
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['SUPER_ADMIN', 'DEPT_ADMIN'], default: 'SUPER_ADMIN' },
  department: { type: String, default: 'ALL' },
  createdAt: { type: Date, default: Date.now }
});

// Department Schema
const DepartmentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  headOfDept: { type: String },
  sections: [{ type: String }]
});

// Subject Schema
const SubjectSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true }, // e.g. KCS-501
  name: { type: String, required: true },
  branch: { type: String, required: true },
  semester: { type: String, required: true },
  totalLecturesHeld: { type: Number, default: 0 }
});

// Attendance Session Schema
const AttendanceSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  subjectCode: { type: String, required: true, uppercase: true },
  subjectName: { type: String, required: true },
  facultyId: { type: String, required: true },
  facultyName: { type: String, required: true },
  branch: { type: String, required: true },
  semester: { type: String, required: true },
  section: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  startTime: { type: String, required: true }, // HH:mm
  endTime: { type: String, required: true }, // HH:mm
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  allowedRadiusMeters: { type: Number, default: 50 },
  qrCodeToken: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Attendance Record Schema
const AttendanceRecordSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  studentId: { type: String, required: true },
  rollNumber: { type: String, required: true, uppercase: true },
  studentName: { type: String, required: true },
  subjectCode: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'FLAGGED', 'MANUAL'], default: 'PRESENT' },
  verificationDetails: {
    distanceMeters: { type: Number },
    isWithinRadius: { type: Boolean },
    biometricVerified: { type: Boolean, default: true },
    photoVerified: { type: Boolean, default: true },
    deviceId: { type: String },
    antiSpoofPassed: { type: Boolean, default: true }
  },
  markedAt: { type: Date, default: Date.now }
});

// Notification Schema
const NotificationSchema = new mongoose.Schema({
  recipientId: { type: String, required: true }, // RollNumber or FacultyId
  recipientRole: { type: String, enum: ['STUDENT', 'TEACHER', 'ADMIN'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['INFO', 'WARNING', 'ATTENDANCE', 'APPROVAL'], default: 'INFO' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Audit Log Schema
const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  userRole: { type: String, required: true },
  userId: { type: String, required: true },
  ipAddress: { type: String, default: '127.0.0.1' },
  deviceId: { type: String, default: 'UNKNOWN' },
  details: { type: String },
  timestamp: { type: Date, default: Date.now }
});

module.exports = {
  Student: mongoose.model('Student', StudentSchema),
  Teacher: mongoose.model('Teacher', TeacherSchema),
  Admin: mongoose.model('Admin', AdminSchema),
  Department: mongoose.model('Department', DepartmentSchema),
  Subject: mongoose.model('Subject', SubjectSchema),
  AttendanceSession: mongoose.model('AttendanceSession', AttendanceSessionSchema),
  AttendanceRecord: mongoose.model('AttendanceRecord', AttendanceRecordSchema),
  Notification: mongoose.model('Notification', NotificationSchema),
  AuditLog: mongoose.model('AuditLog', AuditLogSchema)
};
