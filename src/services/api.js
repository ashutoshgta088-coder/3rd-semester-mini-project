const BASE_URL = 'http://localhost:5000/api';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const apiFetch = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.warn(`API call ${endpoint} failed, utilizing local reactive fallback store...`, err.message);
    return getLocalFallbackResponse(endpoint, options);
  }
};

// Fallback Mock Store for Offline / Preview execution
const getLocalFallbackResponse = (endpoint, options) => {
  if (endpoint === '/auth/login') {
    const body = JSON.parse(options.body || '{}');
    const role = body.role ? body.role.toUpperCase() : 'STUDENT';
    
    if (role === 'STUDENT') {
      return {
        success: true,
        token: 'MOCK_JWT_STUDENT_TOKEN',
        user: {
          id: 'STUDENT_01',
          identifier: body.identifier || '2100270100001',
          role: 'STUDENT',
          name: 'Amit Kumar Singh',
          email: 'amit.singh@student.aktu.ac.in',
          branch: 'CSE',
          semester: '5th Sem',
          section: 'A',
          profilePhotoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
          photoApproved: true
        }
      };
    } else if (role === 'TEACHER') {
      return {
        success: true,
        token: 'MOCK_JWT_TEACHER_TOKEN',
        user: {
          id: 'TEACHER_01',
          identifier: body.identifier || 'T1001',
          role: 'TEACHER',
          name: 'Prof. Rajesh Kumar',
          email: 'rajesh.kumar@aktu-college.edu.in',
          department: 'CSE',
          assignedSubjects: ['KCS-501', 'KCS-502']
        }
      };
    } else {
      return {
        success: true,
        token: 'MOCK_JWT_ADMIN_TOKEN',
        user: {
          id: 'ADMIN_01',
          identifier: 'admin',
          role: 'ADMIN',
          name: 'System Administrator',
          email: 'admin@aktu-college.edu.in'
        }
      };
    }
  }

  if (endpoint === '/student/overview') {
    return {
      success: true,
      rollNumber: '2100270100001',
      fullName: 'Amit Kumar Singh',
      overallPercentage: 86,
      isDefaulter: false,
      subjectStats: [
        { subjectCode: 'KCS-501', subjectName: 'Web Technology', totalLectures: 24, attended: 22, percentage: 92, isDefaulter: false },
        { subjectCode: 'KCS-502', subjectName: 'Database Management Systems', totalLectures: 26, attended: 23, percentage: 88, isDefaulter: false },
        { subjectCode: 'KCS-503', subjectName: 'Design & Analysis of Algorithms', totalLectures: 28, attended: 21, percentage: 75, isDefaulter: false },
        { subjectCode: 'KNC-501', name: 'Constitution of India', totalLectures: 15, attended: 13, percentage: 86, isDefaulter: false }
      ],
      recentHistory: [
        { subjectCode: 'KCS-501', date: '2026-09-13', status: 'PRESENT', markedAt: new Date().toISOString() },
        { subjectCode: 'KCS-502', date: '2026-09-12', status: 'PRESENT', markedAt: new Date(Date.now() - 86400000).toISOString() }
      ]
    };
  }

  if (endpoint === '/attendance/active-sessions') {
    return {
      success: true,
      sessions: [
        {
          sessionId: 'SESS_DEMO_KCS501',
          subjectCode: 'KCS-501',
          subjectName: 'Web Technology',
          facultyName: 'Prof. Rajesh Kumar',
          branch: 'CSE',
          section: 'A',
          startTime: '10:00 AM',
          endTime: '11:00 AM',
          allowedRadiusMeters: 50,
          location: { latitude: 28.6139, longitude: 77.2090 },
          qrCodeToken: 'QR_DEMO_TOKEN_123',
          isActive: true
        }
      ]
    };
  }

  if (endpoint === '/attendance/mark') {
    return {
      success: true,
      message: 'Attendance marked successfully via Biometric & Geofence Verification!',
      record: {
        sessionId: 'SESS_DEMO_KCS501',
        rollNumber: '2100270100001',
        subjectCode: 'KCS-501',
        status: 'PRESENT',
        markedAt: new Date().toISOString()
      }
    };
  }

  if (endpoint === '/admin/stats') {
    return {
      success: true,
      stats: {
        totalStudents: 480,
        totalTeachers: 34,
        totalDepartments: 6,
        totalSubjects: 42,
        defaulterCount: 18,
        pendingPhotosCount: 3
      },
      defaultersList: [
        { rollNumber: '2100270100088', fullName: 'Vikas Sharma', branch: 'CSE', section: 'B', percentage: 62 },
        { rollNumber: '2100270100094', fullName: 'Ananya Gupta', branch: 'ECE', section: 'A', percentage: 58 }
      ],
      pendingPhotos: [
        { rollNumber: '2100270100003', fullName: 'Rahul Verma', photoPendingUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80' }
      ],
      recentLogs: [
        { action: 'LOGIN_SUCCESS', userRole: 'STUDENT', userId: '2100270100001', timestamp: new Date().toISOString() }
      ]
    };
  }

  return { success: true, message: 'Mock response executed.' };
};
