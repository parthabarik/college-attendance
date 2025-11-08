// admin.js
import { 
  addStudent, getStudents, deleteStudent, checkRegistrationNumber,
  addTeacher, getTeachers, deleteTeacher
} from './firebase.js';

// Global variables to store functions
window.addStudent = async function() {
  const name = document.getElementById('studentName').value.trim();
  const rollNo = document.getElementById('studentRoll').value.trim().toUpperCase();
  const email = document.getElementById('studentEmail').value.trim();
  const password = document.getElementById('studentPassword').value;
  const regNo = document.getElementById('studentReg').value.trim().toUpperCase();
  const branch = document.getElementById('studentBranch').value;
  const section = document.getElementById('studentSection').value;
  const semester = document.getElementById('studentSemester').value;
  const phone = document.getElementById('studentPhone').value.trim();
  const parentPhone = document.getElementById('studentParentPhone').value.trim();
  const address = document.getElementById('studentAddress').value.trim();

  // Validation
  if (!name || !rollNo || !email || !password || !regNo || !branch || !section || !semester) {
    showStatus('student', 'Please fill all required fields', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showStatus('student', 'Please enter a valid email address', 'error');
    return;
  }

  // Check if registration number is unique
  const isRegNoUnique = await checkRegistrationNumber(regNo);
  if (!isRegNoUnique) {
    showStatus('student', 'Registration number already exists. Please use a unique registration number.', 'error');
    return;
  }

  const addStudentBtn = document.getElementById('addStudentBtn');
  const studentBtnText = document.getElementById('studentBtnText');
  const studentLoadingSpinner = document.getElementById('studentLoadingSpinner');

  // Show loading state
  studentBtnText.textContent = 'Adding Student...';
  studentLoadingSpinner.style.display = 'inline-block';
  addStudentBtn.disabled = true;

  try {
    const studentData = {
      name,
      rollNo,
      email,
      password,
      regNo,
      branch,
      section,
      semester,
      phone: phone || 'Not provided',
      parentPhone: parentPhone || 'Not provided',
      address: address || 'Not provided',
      createdAt: new Date().toISOString(),
      fullRollNo: `${branch}-${section}-${rollNo}` // Combined roll number for uniqueness
    };

    const success = await addStudent(studentData);

    if (success) {
      showStatus('student', 'Student added successfully!', 'success');
      // Clear form
      document.getElementById('studentName').value = '';
      document.getElementById('studentRoll').value = '';
      document.getElementById('studentEmail').value = '';
      document.getElementById('studentPassword').value = '';
      document.getElementById('studentReg').value = '';
      document.getElementById('studentBranch').value = '';
      document.getElementById('studentSection').value = '';
      document.getElementById('studentSemester').value = '';
      document.getElementById('studentPhone').value = '';
      document.getElementById('studentParentPhone').value = '';
      document.getElementById('studentAddress').value = '';
      
      // Reload student list
      loadStudents();
    } else {
      throw new Error('Failed to add student');
    }
  } catch (error) {
    showStatus('student', error.message, 'error');
  } finally {
    // Reset button state
    studentBtnText.textContent = 'Add Student';
    studentLoadingSpinner.style.display = 'none';
    addStudentBtn.disabled = false;
  }
};

window.addTeacher = async function() {
  const name = document.getElementById('teacherName').value.trim();
  const email = document.getElementById('teacherEmail').value.trim();
  const password = document.getElementById('teacherPassword').value;
  const subject = document.getElementById('teacherSubject').value.trim();
  const department = document.getElementById('teacherDepartment').value;
  const phone = document.getElementById('teacherPhone').value.trim();
  const qualification = document.getElementById('teacherQualification').value.trim();
  const experience = document.getElementById('teacherExperience').value;

  // Validation
  if (!name || !email || !password || !subject || !department || !qualification) {
    showStatus('teacher', 'Please fill all required fields', 'error');
    return;
  }

  if (!isValidEmail(email)) {
    showStatus('teacher', 'Please enter a valid email address', 'error');
    return;
  }

  const addTeacherBtn = document.getElementById('addTeacherBtn');
  const teacherBtnText = document.getElementById('teacherBtnText');
  const teacherLoadingSpinner = document.getElementById('teacherLoadingSpinner');

  // Show loading state
  teacherBtnText.textContent = 'Adding Teacher...';
  teacherLoadingSpinner.style.display = 'inline-block';
  addTeacherBtn.disabled = true;

  try {
    const teacherData = {
      name,
      email,
      password,
      subject,
      department,
      phone: phone || 'Not provided',
      qualification,
      experience: experience || '0',
      createdAt: new Date().toISOString()
    };

    const success = await addTeacher(teacherData);

    if (success) {
      showStatus('teacher', 'Teacher added successfully!', 'success');
      // Clear form
      document.getElementById('teacherName').value = '';
      document.getElementById('teacherEmail').value = '';
      document.getElementById('teacherPassword').value = '';
      document.getElementById('teacherSubject').value = '';
      document.getElementById('teacherDepartment').value = '';
      document.getElementById('teacherPhone').value = '';
      document.getElementById('teacherQualification').value = '';
      document.getElementById('teacherExperience').value = '';
      
      // Reload teacher list
      loadTeachers();
    } else {
      throw new Error('Failed to add teacher');
    }
  } catch (error) {
    showStatus('teacher', error.message, 'error');
  } finally {
    // Reset button state
    teacherBtnText.textContent = 'Add Teacher';
    teacherLoadingSpinner.style.display = 'none';
    addTeacherBtn.disabled = false;
  }
};

// Check if admin is logged in
function checkAdminAuth() {
  const admin = sessionStorage.getItem('admin');
  if (!admin) {
    window.location.href = 'admin-login.html';
    return null;
  }
  return JSON.parse(admin);
}

// Logout function
window.logout = function() {
  sessionStorage.removeItem('admin');
  window.location.href = 'index.html';
};

// Set current date
function updateDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
}

// Tab switching function
window.switchTab = function(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show selected tab
  document.getElementById(tabName).classList.add('active');
  
  // Update active tab style
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  event.currentTarget.classList.add('active');
  
  // Load data for the selected tab
  if (tabName === 'students') {
    loadStudents();
  } else if (tabName === 'teachers') {
    loadTeachers();
  } else if (tabName === 'feedback') {
    if (typeof loadFeedback === 'function') {
      loadFeedback();
    }
  }
};

// Load students list
window.loadStudents = async function() {
  try {
    const students = await getStudents();
    window.allStudents = students; // Store for filtering
    filterStudents();
  } catch (error) {
    console.error('Error loading students:', error);
    const studentList = document.getElementById('studentList');
    studentList.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #ff6b6b;">Error loading students</td></tr>';
  }
};

// Filter students based on selected criteria
window.filterStudents = function() {
  const branchFilter = document.getElementById('filterBranch').value;
  const sectionFilter = document.getElementById('filterSection').value;
  const semesterFilter = document.getElementById('filterSemester').value;
  const searchTerm = document.getElementById('searchStudent').value.toLowerCase();
  
  const studentList = document.getElementById('studentList');
  studentList.innerHTML = '';

  if (!window.allStudents || Object.keys(window.allStudents).length === 0) {
    studentList.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #777;">No students found</td></tr>';
    return;
  }

  let filteredCount = 0;

  for (const [studentId, student] of Object.entries(window.allStudents)) {
    // Apply filters
    if (branchFilter && student.branch !== branchFilter) continue;
    if (sectionFilter && student.section !== sectionFilter) continue;
    if (semesterFilter && student.semester !== semesterFilter) continue;
    if (searchTerm && 
        !student.name.toLowerCase().includes(searchTerm) && 
        !student.rollNo.toLowerCase().includes(searchTerm) &&
        !student.regNo.toLowerCase().includes(searchTerm)) {
      continue;
    }

    filteredCount++;
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.rollNo}</td>
      <td>${student.name}</td>
      <td>${student.regNo}</td>
      <td>${student.branch}</td>
      <td>Section ${student.section}</td>
      <td>${student.semester} Semester</td>
      <td>${student.email}</td>
      <td>
        <div class="student-actions">
          <button class="btn-secondary" onclick="viewStudentDetails('${studentId}')" style="padding: 6px 12px;">
            <i class="fas fa-eye"></i> View
          </button>
          <button class="btn-danger" onclick="deleteStudentRecord('${studentId}')" style="padding: 6px 12px;">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </td>
    `;
    studentList.appendChild(row);
  }

  if (filteredCount === 0) {
    studentList.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: #777;">No students match the selected filters</td></tr>';
  }
};

// Load teachers list
window.loadTeachers = async function() {
  try {
    const teachers = await getTeachers();
    const teacherList = document.getElementById('teacherList');
    teacherList.innerHTML = '';

    if (Object.keys(teachers).length === 0) {
      teacherList.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #777;">No teachers found</td></tr>';
      return;
    }

    for (const [teacherId, teacher] of Object.entries(teachers)) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${teacher.name}</td>
        <td>${teacher.email}</td>
        <td>${teacher.subject}</td>
        <td>${teacher.department}</td>
        <td>${teacher.qualification}</td>
        <td>
          <button class="btn-danger" onclick="deleteTeacherRecord('${teacherId}')" style="padding: 8px 15px;">Delete</button>
        </td>
      `;
      teacherList.appendChild(row);
    }
  } catch (error) {
    console.error('Error loading teachers:', error);
    const teacherList = document.getElementById('teacherList');
    teacherList.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #ff6b6b;">Error loading teachers</td></tr>';
  }
};

// Delete student record
window.deleteStudentRecord = async function(studentId) {
  if (confirm(`Are you sure you want to delete this student?`)) {
    try {
      const success = await deleteStudent(studentId);
      if (success) {
        showStatus('student', 'Student deleted successfully!', 'success');
        loadStudents();
      } else {
        throw new Error('Failed to delete student');
      }
    } catch (error) {
      showStatus('student', error.message, 'error');
    }
  }
};

// Delete teacher record
window.deleteTeacherRecord = async function(teacherId) {
  if (confirm('Are you sure you want to delete this teacher?')) {
    try {
      const success = await deleteTeacher(teacherId);
      if (success) {
        showStatus('teacher', 'Teacher deleted successfully!', 'success');
        loadTeachers();
      } else {
        throw new Error('Failed to delete teacher');
      }
    } catch (error) {
      showStatus('teacher', error.message, 'error');
    }
  }
};

// Utility functions
function showStatus(type, message, statusType) {
  const statusMessage = document.getElementById(`${type}StatusMessage`);
  statusMessage.textContent = message;
  statusMessage.className = `status-message status-${statusType}`;
  statusMessage.style.display = 'block';
  
  // Auto hide after 3 seconds
  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 3000);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  const admin = checkAdminAuth();
  if (!admin) return;
  
  console.log('Admin logged in:', admin.username);
  
  // Initialize page
  updateDate();
  loadStudents();
  loadTeachers();
});