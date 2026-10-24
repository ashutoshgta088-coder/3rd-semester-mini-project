const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { Student, Teacher, Admin, Department, Subject, AttendanceSession, AttendanceRecord } = require('./models/Schemas');

const seedData = async () => {
  try {
    await connectDB();
    if (!mongoose.connection.readyState) {
      console.log('[Seed Info] MongoDB connection not active. Pre-configured mock data engine is ready for frontend offline mode.');
      process.exit(0);
    }
    console.log('[Seed] Seeding AKTU sample dataset...');

    // Clear existing
    await Promise.all([
      Student.deleteMany({}),
      Teacher.deleteMany({}),
      Admin.deleteMany({}),
      Department.deleteMany({}),
      Subject.deleteMany({}),
      AttendanceSession.deleteMany({}),
      AttendanceRecord.deleteMany({})
    ]);

    // Departments
    await Department.create([
      { code: 'CSE', name: 'Computer Science & Engineering', headOfDept: 'Dr. A. K. Sharma', sections: ['A', 'B', 'C'] },
      { code: 'ECE', name: 'Electronics & Communication Engg', headOfDept: 'Dr. R. P. Verma', sections: ['A', 'B'] },
      { code: 'ME', name: 'Mechanical Engineering', headOfDept: 'Dr. S. K. Gupta', sections: ['A'] }
    ]);

    // Subjects (AKTU 3rd Year 5th Sem)
    await Subject.create([
      { code: 'KCS-501', name: 'Web Technology', branch: 'CSE', semester: '5th Sem', totalLecturesHeld: 24 },
      { code: 'KCS-502', name: 'Database Management Systems', branch: 'CSE', semester: '5th Sem', totalLecturesHeld: 26 },
      { code: 'KCS-503', name: 'Design & Analysis of Algorithms', branch: 'CSE', semester: '5th Sem', totalLecturesHeld: 28 },
      { code: 'KNC-501', name: 'Constitution of India', branch: 'CSE', semester: '5th Sem', totalLecturesHeld: 15 }
    ]);

    // Admin
    await Admin.create({
      username: 'admin',
      fullName: 'System Administrator',
      email: 'admin@aktu-college.edu.in',
      password: 'adminpassword123',
      role: 'SUPER_ADMIN'
    });

    // Teachers
    await Teacher.create([
      {
        facultyId: 'T1001',
        fullName: 'Prof. Rajesh Kumar',
        email: 'rajesh.kumar@aktu-college.edu.in',
        mobileNumber: '9876543210',
        password: 'teacherpassword',
        department: 'CSE',
        assignedSubjects: ['KCS-501', 'KCS-502']
      },
      {
        facultyId: 'T1002',
        fullName: 'Dr. Sunita Agarwal',
        email: 'sunita.agarwal@aktu-college.edu.in',
        mobileNumber: '9876543211',
        password: 'teacherpassword',
        department: 'CSE',
        assignedSubjects: ['KCS-503']
      }
    ]);

    // Students (AKTU Roll Numbers)
    const students = await Student.create([
      {
        rollNumber: '2100270100001',
        fullName: 'Amit Kumar Singh',
        branch: 'CSE',
        year: '3rd Year',
        semester: '5th Sem',
        section: 'A',
        mobileNumber: '9988776655',
        email: 'amit.singh@student.aktu.ac.in',
        password: 'studentpassword',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
        photoApproved: true
      },
      {
        rollNumber: '2100270100002',
        fullName: 'Priya Sharma',
        branch: 'CSE',
        year: '3rd Year',
        semester: '5th Sem',
        section: 'A',
        mobileNumber: '9988776656',
        email: 'priya.sharma@student.aktu.ac.in',
        password: 'studentpassword',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
        photoApproved: true
      },
      {
        rollNumber: '2100270100003',
        fullName: 'Rahul Verma',
        branch: 'CSE',
        year: '3rd Year',
        semester: '5th Sem',
        section: 'A',
        mobileNumber: '9988776657',
        email: 'rahul.verma@student.aktu.ac.in',
        password: 'studentpassword',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        photoApproved: true
      },
      {
        rollNumber: '2100270100004',
        fullName: 'Sneha Patel',
        branch: 'CSE',
        year: '3rd Year',
        semester: '5th Sem',
        section: 'A',
        mobileNumber: '9988776658',
        email: 'sneha.patel@student.aktu.ac.in',
        password: 'studentpassword',
        profilePhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
        photoApproved: true
      }
    ]);

    // Active Sample Attendance Session
    const activeSession = await AttendanceSession.create({
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
      location: {
        latitude: 28.6139, // Campus coordinates sample
        longitude: 77.2090
      },
      allowedRadiusMeters: 50,
      qrCodeToken: 'QR_DEMO_TOKEN_123',
      isActive: true
    });

    // Sample Attendance Record
    await AttendanceRecord.create({
      sessionId: activeSession.sessionId,
      studentId: students[0]._id,
      rollNumber: students[0].rollNumber,
      studentName: students[0].fullName,
      subjectCode: 'KCS-501',
      date: activeSession.date,
      status: 'PRESENT',
      verificationDetails: {
        distanceMeters: 12.4,
        isWithinRadius: true,
        biometricVerified: true,
        photoVerified: true,
        deviceId: 'DEVICE_AMIT_01'
      }
    });

    console.log('✅ [Seed Success] AKTU sample dataset populated!');
    process.exit(0);
  } catch (err) {
    console.error('❌ [Seed Error]', err);
    process.exit(1);
  }
};

seedData();
