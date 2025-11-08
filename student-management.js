// student-management.js
import { getStudents } from './firebase.js';

// View student details
window.viewStudentDetails = async function(studentId) {
  try {
    const students = await getStudents();
    const student = students[studentId];
    
    if (!student) {
      alert('Student not found!');
      return;
    }

    // Populate modal with student data
    document.getElementById('modalRollNo').textContent = student.rollNo;
    document.getElementById('modalName').textContent = student.name;
    document.getElementById('modalRegNo').textContent = student.regNo;
    document.getElementById('modalEmail').textContent = student.email;
    document.getElementById('modalBranch').textContent = student.branch;
    document.getElementById('modalSection').textContent = `Section ${student.section}`;
    document.getElementById('modalSemester').textContent = `${student.semester} Semester`;
    document.getElementById('modalPhone').textContent = student.phone;
    document.getElementById('modalParentPhone').textContent = student.parentPhone;
    document.getElementById('modalAddress').textContent = student.address;
    
    // Format date
    const dateAdded = new Date(student.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    document.getElementById('modalDateAdded').textContent = dateAdded;

    // Show modal
    document.getElementById('studentModal').style.display = 'flex';
  } catch (error) {
    console.error('Error loading student details:', error);
    alert('Error loading student details');
  }
};

// Close student modal
window.closeStudentModal = function() {
  document.getElementById('studentModal').style.display = 'none';
};

// Close modal when clicking outside
document.getElementById('studentModal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeStudentModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeStudentModal();
  }
});