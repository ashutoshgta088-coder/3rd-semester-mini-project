const mongoose = require('mongoose');

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// In-memory fallback teacher profiles
const OFFLINE_TEACHER_PROFILES = {
  'T1001': {
    facultyId: 'T1001',
    fullName: 'Mr. Vishal Gupta',
    designation: 'Assistant Professor & Project Coordinator',
    department: 'Computer Science & Engineering',
    college: 'Lloyd Institute of Engineering & Technology, Greater Noida',
    email: 'vishal.gupta@liet.in',
    mobileNumber: '9876543210',
    assignedSubjects: ['KCS-301 (Data Structures)', 'BCC351 (Mini Project)', 'KCS-501 (Web Tech)'],
    profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    officeLocation: 'Room 304, Academic Block A',
    joiningYear: '2021'
  }
};

// ─── Get Teacher Profile ──────────────────────────────────────────────────────
exports.getTeacherProfile = async (req, res) => {
  try {
    const facultyId = (req.user?.identifier || req.user?.id || 'T1001').toUpperCase();

    if (!isMongoConnected()) {
      const profile = OFFLINE_TEACHER_PROFILES[facultyId] || {
        facultyId,
        fullName: req.user?.name || 'Faculty Member',
        designation: 'Assistant Professor',
        department: req.user?.department || 'Computer Science & Engineering',
        college: 'Lloyd Institute of Engineering & Technology, Greater Noida',
        email: `${facultyId.toLowerCase()}@liet.in`,
        mobileNumber: '9876543210',
        assignedSubjects: ['BCC351 (Mini Project)', 'KCS-301'],
        profilePhotoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(req.user?.name || facultyId)}&background=1E3A8A&color=fff&size=160`
      };
      return res.json({ success: true, profile });
    }

    const { Teacher } = require('../models/Schemas');
    let teacher = await Teacher.findOne({ facultyId }).select('-password');
    if (!teacher) {
      // Create if missing
      teacher = await Teacher.create({
        facultyId,
        fullName: req.user?.name || 'Faculty Member',
        department: req.user?.department || 'CSE',
        email: `${facultyId.toLowerCase()}@liet.in`,
        mobileNumber: '9876543210',
        assignedSubjects: ['BCC351', 'KCS-301'],
        profilePhotoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(facultyId)}&background=1E3A8A&color=fff&size=160`
      });
    }

    return res.json({ success: true, profile: teacher });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving profile.', error: err.message });
  }
};

// ─── Update Teacher Profile (Edit details & Upload profile photo) ────────────
exports.updateTeacherProfile = async (req, res) => {
  try {
    const facultyId = (req.user?.identifier || req.user?.id || 'T1001').toUpperCase();
    const {
      fullName,
      email,
      mobileNumber,
      department,
      assignedSubjects,
      profilePhotoUrl,
      designation,
      college,
      officeLocation
    } = req.body;

    const updatedData = {
      fullName: fullName || req.user?.name,
      email: email || `${facultyId.toLowerCase()}@liet.in`,
      mobileNumber: mobileNumber || '9876543210',
      department: department || 'Computer Science & Engineering',
      assignedSubjects: Array.isArray(assignedSubjects)
        ? assignedSubjects
        : (typeof assignedSubjects === 'string' ? assignedSubjects.split(',').map(s => s.trim()) : ['BCC351']),
      profilePhotoUrl: profilePhotoUrl || null,
      designation: designation || 'Assistant Professor',
      college: college || 'Lloyd Institute of Engineering & Technology, Greater Noida',
      officeLocation: officeLocation || 'Faculty Block'
    };

    // Update in-memory fallback
    OFFLINE_TEACHER_PROFILES[facultyId] = {
      ...(OFFLINE_TEACHER_PROFILES[facultyId] || {}),
      facultyId,
      ...updatedData
    };

    // Update in MongoDB if connected
    if (isMongoConnected()) {
      try {
        const { Teacher } = require('../models/Schemas');
        await Teacher.findOneAndUpdate(
          { facultyId },
          { $set: updatedData },
          { new: true, upsert: true }
        );
      } catch (dbErr) {
        console.warn('[TeacherProfile] MongoDB update fallback:', dbErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'Profile updated successfully!',
      profile: { facultyId, ...updatedData }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error updating profile.', error: err.message });
  }
};

// ─── Stop All Active Sessions (on Teacher Logout or timeout) ─────────────────
exports.stopActiveSessionsOnLogout = async (req, res) => {
  try {
    const facultyId = (req.user?.identifier || req.user?.id || '').toUpperCase();

    // 1. In-memory session closure
    const { OFFLINE_SESSION } = require('./attendanceController');
    if (OFFLINE_SESSION) {
      OFFLINE_SESSION.isActive = false;
      OFFLINE_SESSION.status = 'CLOSED';
    }

    // 2. MongoDB closure if connected
    if (isMongoConnected()) {
      try {
        const { AttendanceSession } = require('../models/Schemas');
        await AttendanceSession.updateMany(
          { facultyId, isActive: true },
          { $set: { isActive: false, status: 'CLOSED' } }
        );
      } catch (e) {}
    }

    // 3. Emit real-time closure event
    const io = req.app.get('io');
    if (io) {
      io.emit('session:closed', { facultyId, reason: 'TEACHER_LOGOUT' });
    }

    console.log(`🔒 Active attendance sessions automatically stopped for faculty ${facultyId} upon logout.`);
    return res.json({ success: true, message: 'Active sessions closed on logout.' });
  } catch (err) {
    return res.json({ success: true, message: 'Sessions closed.' });
  }
};
