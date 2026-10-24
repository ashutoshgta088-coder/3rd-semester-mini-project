const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// ─── In-Memory Fallback Users (used when MongoDB is offline) ─────────────────
const FALLBACK_USERS = {
  STUDENT: [
    {
      _id: 'S001',
      rollNumber: '2100270100001',
      fullName: 'Amit Kumar Singh',
      email: 'amit.singh@student.aktu.ac.in',
      password: 'studentpassword',
      branch: 'CSE',
      semester: '5th Sem',
      section: 'A',
      year: '3rd Year',
      mobileNumber: '9988776655',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
      photoApproved: true
    },
    {
      _id: 'S002',
      rollNumber: '2100270100002',
      fullName: 'Priya Sharma',
      email: 'priya.sharma@student.aktu.ac.in',
      password: 'studentpassword',
      branch: 'CSE',
      semester: '5th Sem',
      section: 'A',
      year: '3rd Year',
      mobileNumber: '9988776656',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
      photoApproved: true
    }
  ],
  TEACHER: [
    {
      _id: 'T001',
      facultyId: 'T1001',
      fullName: 'Prof. Rajesh Kumar',
      email: 'rajesh.kumar@aktu-college.edu.in',
      password: 'teacherpassword',
      department: 'CSE',
      mobileNumber: '9876543210',
      assignedSubjects: ['KCS-501', 'KCS-502'],
      boundDeviceId: null
    }
  ],
  ADMIN: [
    {
      _id: 'A001',
      username: 'admin',
      fullName: 'System Administrator',
      email: 'admin@aktu-college.edu.in',
      password: 'adminpassword123',
      role: 'SUPER_ADMIN'
    }
  ]
};

function fallbackLogin(role, identifier, password) {
  const users = FALLBACK_USERS[role] || [];
  let user = null;

  if (role === 'STUDENT') {
    user = users.find(u => u.rollNumber === identifier.toUpperCase());
  } else if (role === 'TEACHER') {
    user = users.find(u => u.facultyId === identifier.toUpperCase());
  } else if (role === 'ADMIN') {
    user = users.find(u => u.username === identifier);
  }

  if (!user || user.password !== password) return null;
  return user;
}

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

// ─── Login Handler ────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { identifier, password, role, deviceId } = req.body;

    if (!identifier || !password || !role) {
      return res.status(400).json({ success: false, message: 'Identifier, password, and role are required.' });
    }

    const userRole = role.toUpperCase();
    let user = null;
    let usedFallback = false;

    // ── Try MongoDB first ──────────────────────────────────────────────────────
    if (isMongoConnected()) {
      try {
        const { Student, Teacher, Admin } = require('../models/Schemas');
        if (userRole === 'STUDENT') {
          user = await Student.findOne({ rollNumber: identifier.toUpperCase() });
        } else if (userRole === 'TEACHER') {
          user = await Teacher.findOne({ facultyId: identifier.toUpperCase() });
        } else if (userRole === 'ADMIN') {
          user = await Admin.findOne({ username: identifier });
        }

        if (!user) {
          return res.status(404).json({ success: false, message: `${userRole} not found.` });
        }

        const bcrypt = require('bcryptjs');
        const isMatch = (password === user.password) ||
          (await bcrypt.compare(password, user.password).catch(() => false));

        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your password.' });
        }
      } catch (dbErr) {
        console.warn('[Auth] MongoDB query failed, falling back to in-memory store:', dbErr.message);
        user = null;
      }
    }

    // ── Fallback to in-memory store when MongoDB is offline ───────────────────
    if (!user) {
      user = fallbackLogin(userRole, identifier, password);
      usedFallback = true;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials. Check Roll Number / Faculty ID and password.'
        });
      }
    }

    // ── Build JWT payload ──────────────────────────────────────────────────────
    const payload = {
      id: user._id,
      identifier: userRole === 'STUDENT' ? user.rollNumber : userRole === 'TEACHER' ? user.facultyId : user.username,
      role: userRole,
      name: user.fullName,
      branch: user.branch,
      department: user.department
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        identifier: payload.identifier,
        role: userRole,
        name: user.fullName,
        email: user.email,
        branch: user.branch,
        semester: user.semester,
        section: user.section,
        department: user.department,
        profilePhotoUrl: user.profilePhotoUrl || null,
        photoApproved: user.photoApproved !== false,
        assignedSubjects: user.assignedSubjects || [],
        _dataSource: usedFallback ? 'OFFLINE_FALLBACK' : 'MONGODB'
      }
    });
  } catch (err) {
    console.error('[Auth Login Error]', err);
    return res.status(500).json({ success: false, message: 'Server error during authentication.', error: err.message });
  }
};
