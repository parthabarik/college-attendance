// auth.js - Add this to your dashboard pages

// Check if user is logged in
function checkAuth(requiredRole) {
  const userData = sessionStorage.getItem(requiredRole);
  
  if (!userData) {
    // Redirect to login page if not authenticated
    window.location.href = `${requiredRole}-login.html`;
    return null;
  }
  
  return JSON.parse(userData);
}

// Logout function
function logout() {
  sessionStorage.clear();
  window.location.href = 'index.html';
}

// Add this to your dashboard pages
document.addEventListener('DOMContentLoaded', function() {
  // Check which dashboard we're on and verify authentication
  const currentPage = window.location.pathname;
  
  if (currentPage.includes('student-dashboard')) {
    const student = checkAuth('student');
    if (student) {
      document.getElementById('studentName').textContent = student.name;
      document.getElementById('studentRollNo').textContent = student.rollNo;
    }
  } else if (currentPage.includes('teacher-dashboard')) {
    const teacher = checkAuth('teacher');
    if (teacher) {
      document.getElementById('teacherName').textContent = teacher.name;
    }
  } else if (currentPage.includes('admin-dashboard')) {
    const admin = checkAuth('admin');
    if (admin) {
      document.getElementById('adminName').textContent = admin.username;
    }
  }
  
  // Add logout event listeners
  const logoutButtons = document.querySelectorAll('.btn-logout, [onclick="logout()"]');
  logoutButtons.forEach(button => {
    button.addEventListener('click', logout);
  });
});

export { checkAuth, logout };