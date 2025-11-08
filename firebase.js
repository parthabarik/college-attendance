// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-app.js";
import { getDatabase, ref, set, get, push, remove, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCe0DvO_8prqSxzzr7A8AfiGyOqqj-_DP4",
  authDomain: "attendance-67f62.firebaseapp.com",
  databaseURL: "https://attendance-67f62-default-rtdb.firebaseio.com",
  projectId: "attendance-67f62",
  storageBucket: "attendance-67f62.firebasestorage.app",
  messagingSenderId: "459244634281",
  appId: "1:459244634281:web:e8630366dc5cfe31dca9b8",
  measurementId: "G-RM00FSG6Q9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Student Management Functions
export async function addStudent(studentData) {
  try {
    // Use fullRollNo as the key to ensure uniqueness per branch-section-roll
    const studentRef = ref(db, `students/${studentData.fullRollNo}`);
    await set(studentRef, studentData);
    return true;
  } catch (error) {
    console.error('Error adding student:', error);
    return false;
  }
}

export async function getStudents() {
  try {
    const snapshot = await get(ref(db, 'students'));
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    console.error('Error getting students:', error);
    return {};
  }
}

export async function deleteStudent(studentId) {
  try {
    await remove(ref(db, `students/${studentId}`));
    return true;
  } catch (error) {
    console.error('Error deleting student:', error);
    return false;
  }
}

export async function checkRegistrationNumber(regNo) {
  try {
    const students = await getStudents();
    // Check if any student has this registration number
    for (const student of Object.values(students)) {
      if (student.regNo === regNo) {
        return false; // Registration number already exists
      }
    }
    return true; // Registration number is unique
  } catch (error) {
    console.error('Error checking registration number:', error);
    return false;
  }
}

// Teacher Management Functions
export async function addTeacher(teacherData) {
  try {
    const teacherId = `T${Date.now()}`; // Generate unique ID
    const teacherRef = ref(db, `teachers/${teacherId}`);
    await set(teacherRef, { ...teacherData, id: teacherId });
    return true;
  } catch (error) {
    console.error('Error adding teacher:', error);
    return false;
  }
}

export async function getTeachers() {
  try {
    const snapshot = await get(ref(db, 'teachers'));
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    console.error('Error getting teachers:', error);
    return {};
  }
}

export async function deleteTeacher(teacherId) {
  try {
    await remove(ref(db, `teachers/${teacherId}`));
    return true;
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return false;
  }
}

// Teacher-specific functions
export async function getStudentsByBranchSection(branch, section) {
  try {
    const snapshot = await get(ref(db, 'students'));
    if (!snapshot.exists()) return [];
    
    const allStudents = snapshot.val();
    const filteredStudents = [];
    
    for (const key in allStudents) {
      const student = allStudents[key];
      if (student.branch === branch && student.section === section) {
        filteredStudents.push({
          ...student,
          id: key
        });
      }
    }
    
    return filteredStudents;
  } catch (error) {
    console.error('Error getting students by branch/section:', error);
    return [];
  }
}

export async function getTeacher(teacherId) {
  try {
    const snapshot = await get(ref(db, `teachers/${teacherId}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting teacher:', error);
    return null;
  }
}

export async function getClassAttendance(dateKey, classKey) {
  try {
    const snapshot = await get(ref(db, `attendance/${dateKey}/${classKey}`));
    return snapshot.exists() ? snapshot.val() : {};
  } catch (error) {
    console.error('Error getting class attendance:', error);
    return {};
  }
}

export async function getStudentAttendance(studentId) {
  try {
    const snapshot = await get(ref(db, 'attendance'));
    if (!snapshot.exists()) return [];
    
    const allAttendance = snapshot.val();
    const studentRecords = [];
    
    for (const date in allAttendance) {
      for (const classKey in allAttendance[date]) {
        const records = allAttendance[date][classKey];
        for (const recordId in records) {
          const record = records[recordId];
          if (record.attendanceData) {
            const studentRecord = record.attendanceData.find(
              s => s.studentId === studentId
            );
            if (studentRecord) {
              studentRecords.push({
                date,
                subject: record.subject,
                status: studentRecord.status,
                period: record.period,
                teacher: record.teacher
              });
            }
          }
        }
      }
    }
    
    return studentRecords;
  } catch (error) {
    console.error('Error getting student attendance:', error);
    return [];
  }
}

// QR Session Management Functions
export async function createQRSession(sessionData) {
  try {
    const sessionRef = ref(db, `qrSessions/${sessionData.id}`);
    await set(sessionRef, sessionData);
    return true;
  } catch (error) {
    console.error('Error creating QR session:', error);
    return false;
  }
}

export async function getQRSession(sessionId) {
  try {
    const snapshot = await get(ref(db, `qrSessions/${sessionId}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting QR session:', error);
    return null;
  }
}

export async function updateQRCode(sessionId, qrCodeData) {
  try {
    await set(ref(db, `qrSessions/${sessionId}/currentCode`), qrCodeData);
    return true;
  } catch (error) {
    console.error('Error updating QR code:', error);
    return false;
  }
}

export async function markQRAttendance(sessionId, studentData) {
  try {
    await set(ref(db, `qrSessions/${sessionId}/scannedStudents/${studentData.studentId}`), studentData);
    return true;
  } catch (error) {
    console.error('Error marking QR attendance:', error);
    return false;
  }
}

export async function getTeacherQRSessions(teacherId) {
  try {
    const snapshot = await get(ref(db, 'qrSessions'));
    if (!snapshot.exists()) return [];
    
    const allSessions = snapshot.val();
    const teacherSessions = [];
    
    for (const sessionId in allSessions) {
      const session = allSessions[sessionId];
      if (session.teacherId === teacherId) {
        teacherSessions.push({
          id: sessionId,
          ...session
        });
      }
    }
    
    return teacherSessions;
  } catch (error) {
    console.error('Error getting teacher QR sessions:', error);
    return [];
  }
}

// Initialize sample data if not exists
export async function initializeSampleData() {
  try {
    // Check if data already exists
    const snapshot = await get(ref(db));
    
    if (!snapshot.exists()) {
      // Initialize sample students with sections
      const students = {
        'CSE-A-R001': { 
          name: 'Aditya Sharma', 
          rollNo: 'R001',
          email: 'aditya@example.com',
          password: 'student123',
          regNo: 'REG2023001',
          branch: 'CSE',
          section: 'A',
          semester: '5',
          phone: '9876543210',
          parentPhone: '9876543211',
          address: '123 Main Street, City',
          createdAt: new Date().toISOString(),
          fullRollNo: 'CSE-A-R001'
        },
        'CSE-A-R002': { 
          name: 'Shipra Singh', 
          rollNo: 'R002',
          email: 'shipra@example.com',
          password: 'student123',
          regNo: 'REG2023002',
          branch: 'CSE',
          section: 'A',
          semester: '5',
          phone: '9876543212',
          parentPhone: '9876543213',
          address: '456 Oak Avenue, City',
          createdAt: new Date().toISOString(),
          fullRollNo: 'CSE-A-R002'
        },
        'CSE-B-R001': { 
          name: 'Rahul Kumar', 
          rollNo: 'R001',
          email: 'rahul@example.com',
          password: 'student123',
          regNo: 'REG2023003',
          branch: 'CSE',
          section: 'B',
          semester: '5',
          phone: '9876543214',
          parentPhone: '9876543215',
          address: '789 Pine Road, City',
          createdAt: new Date().toISOString(),
          fullRollNo: 'CSE-B-R001'
        }
      };
      
      // Initialize sample teachers
      const teachers = {
        'T001': { 
          id: 'T001', 
          name: 'Dr. Sunita Patel', 
          email: 'sunita@example.com', 
          password: 'teacher123', 
          subject: 'Data Structures',
          department: 'CSE',
          phone: '9876543201',
          qualification: 'Ph.D in Computer Science',
          experience: '8',
          createdAt: new Date().toISOString()
        },
        'T002': { 
          id: 'T002', 
          name: 'Prof. Rajesh Kumar', 
          email: 'rajesh@example.com', 
          password: 'teacher123', 
          subject: 'Mathematics',
          department: 'CSE',
          phone: '9876543202',
          qualification: 'M.Tech, M.Sc',
          experience: '6',
          createdAt: new Date().toISOString()
        }
      };
      
      // Initialize admin
      const admin = {
        username: 'admin',
        password: 'admin123'
      };

      // Initialize sample queries/feedback
      const queries = {
        'query1': {
          name: 'Aditya Sharma',
          email: 'aditya@example.com',
          rollNo: 'R001',
          message: 'I have a query regarding my attendance in Mathematics class. Could you please check and update if there is any discrepancy?',
          timestamp: new Date().toISOString(),
          status: 'pending'
        },
        'query2': {
          name: 'Shipra Singh',
          email: 'shipra@example.com',
          rollNo: 'R002',
          message: 'I was present in the last Data Structures class but my attendance shows as absent. Please verify and correct it.',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          status: 'resolved'
        },
        'query3': {
          name: 'Rahul Kumar',
          email: 'rahul@example.com',
          rollNo: 'R003',
          message: 'Can you provide me with my overall attendance percentage for this semester?',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          status: 'pending'
        }
      };
      
      // Save to database
      await set(ref(db, 'students'), students);
      await set(ref(db, 'teachers'), teachers);
      await set(ref(db, 'admin'), admin);
      await set(ref(db, 'queries'), queries);
      
      console.log('Sample data initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}

// Save attendance function
export async function saveAttendance(dateKey, branch, data) {
  try {
    const attendanceRef = ref(db, `attendance/${dateKey}/${branch}`);
    const newRecordRef = push(attendanceRef);
    await set(newRecordRef, data);
    return true;
  } catch (error) {
    console.error('Error saving attendance:', error);
    return false;
  }
}

// Save query function
export async function saveQuery(queryData) {
  try {
    const queriesRef = ref(db, 'queries');
    const newQueryRef = push(queriesRef);
    await set(newQueryRef, {
      ...queryData,
      timestamp: new Date().toISOString(),
      status: 'pending'
    });
    return true;
  } catch (error) {
    console.error('Error saving query:', error);
    return false;
  }
}

// Get queries function
export async function getQueries() {
  try {
    const snapshot = await get(ref(db, 'queries'));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log('No queries found in database');
      return {};
    }
  } catch (error) {
    console.error('Error getting queries:', error);
    return {};
  }
}

export { db, ref, set, get, push, remove, query, orderByChild, equalTo };

// Initialize sample data when module loads
initializeSampleData();