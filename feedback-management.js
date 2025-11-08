// feedback-management.js
import { db, ref, get, set, remove, getQueries } from './firebase.js';

let allFeedback = {};
let currentFeedbackId = '';

// Load feedback from database
window.loadFeedback = async function() {
  try {
    console.log('Loading feedback from database...');
    
    // Use the getQueries function to fetch data
    allFeedback = await getQueries();
    
    console.log('Feedback data loaded:', allFeedback);
    
    if (!allFeedback || Object.keys(allFeedback).length === 0) {
      console.log('No feedback data found');
      const feedbackList = document.getElementById('feedbackList');
      feedbackList.innerHTML = `
        <div class="no-feedback">
          <i class="fas fa-inbox"></i>
          <p>No feedback or queries found</p>
          <p style="font-size: 14px; margin-top: 10px; color: #999;">
            Feedback and queries submitted through the contact form will appear here.
          </p>
        </div>
      `;
      return;
    }
    
    filterFeedback();
  } catch (error) {
    console.error('Error loading feedback:', error);
    const feedbackList = document.getElementById('feedbackList');
    feedbackList.innerHTML = `
      <div class="no-feedback">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Error loading feedback data</p>
        <p style="font-size: 14px; margin-top: 10px; color: #999;">
          Error: ${error.message}
        </p>
      </div>
    `;
  }
};

// Filter feedback based on selected criteria
window.filterFeedback = function() {
  const statusFilter = document.getElementById('feedbackStatusFilter').value;
  const searchTerm = document.getElementById('feedbackSearch').value.toLowerCase();
  
  const feedbackList = document.getElementById('feedbackList');
  feedbackList.innerHTML = '';

  if (!allFeedback || Object.keys(allFeedback).length === 0) {
    feedbackList.innerHTML = `
      <div class="no-feedback">
        <i class="fas fa-inbox"></i>
        <p>No feedback or queries found</p>
      </div>
    `;
    return;
  }

  let filteredCount = 0;

  // Convert to array and sort by timestamp (newest first)
  const feedbackArray = Object.entries(allFeedback)
    .map(([id, feedback]) => ({ id, ...feedback }))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  for (const feedback of feedbackArray) {
    // Apply filters
    if (statusFilter !== 'all' && feedback.status !== statusFilter) continue;
    if (searchTerm && 
        !feedback.name.toLowerCase().includes(searchTerm) && 
        !feedback.email.toLowerCase().includes(searchTerm) &&
        !feedback.message.toLowerCase().includes(searchTerm)) {
      continue;
    }

    filteredCount++;
    
    const feedbackItem = document.createElement('div');
    feedbackItem.className = `feedback-item ${feedback.status}`;
    
    const date = new Date(feedback.timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    feedbackItem.innerHTML = `
      <div class="feedback-header">
        <div class="feedback-meta">
          <h3>${feedback.name}</h3>
          <span class="feedback-email">${feedback.email}</span>
          <span class="feedback-date">${date}</span>
        </div>
        <div class="feedback-status-badge ${feedback.status}">
          ${feedback.status === 'pending' ? 'Pending' : 'Resolved'}
        </div>
      </div>
      <div class="feedback-content">
        <p class="feedback-message">${feedback.message}</p>
        ${feedback.rollNo && feedback.rollNo !== 'Not provided' ? 
          `<div class="feedback-rollno">Roll No: ${feedback.rollNo}</div>` : ''}
      </div>
      <div class="feedback-actions">
        <button class="btn-secondary" onclick="viewFeedbackDetails('${feedback.id}')">
          <i class="fas fa-eye"></i> View Details
        </button>
        <button class="btn-danger" onclick="deleteFeedback('${feedback.id}')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    `;
    
    feedbackList.appendChild(feedbackItem);
  }

  if (filteredCount === 0) {
    feedbackList.innerHTML = `
      <div class="no-feedback">
        <i class="fas fa-search"></i>
        <p>No feedback matches the selected filters</p>
      </div>
    `;
  }
};

// View feedback details
window.viewFeedbackDetails = function(feedbackId) {
  const feedback = allFeedback[feedbackId];
  if (!feedback) {
    alert('Feedback not found!');
    return;
  }

  currentFeedbackId = feedbackId;

  // Populate modal with feedback data
  document.getElementById('feedbackName').textContent = feedback.name;
  document.getElementById('feedbackEmail').textContent = feedback.email;
  document.getElementById('feedbackRollNo').textContent = feedback.rollNo || 'Not provided';
  document.getElementById('feedbackMessage').textContent = feedback.message;
  
  // Format date
  const date = new Date(feedback.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  document.getElementById('feedbackDate').textContent = date;
  
  // Set status
  document.getElementById('feedbackStatus').value = feedback.status;

  // Show modal
  document.getElementById('feedbackModal').style.display = 'flex';
};

// Update feedback status
window.updateFeedbackStatus = async function() {
  if (!currentFeedbackId) return;
  
  const newStatus = document.getElementById('feedbackStatus').value;
  
  try {
    await set(ref(db, `queries/${currentFeedbackId}/status`), newStatus);
    
    // Update local data
    allFeedback[currentFeedbackId].status = newStatus;
    
    // Refresh the display
    filterFeedback();
    closeFeedbackModal();
    
    // Show success message
    alert(`Feedback status updated to ${newStatus}`);
  } catch (error) {
    console.error('Error updating feedback status:', error);
    alert('Error updating feedback status');
  }
};

// Delete feedback
window.deleteFeedback = async function(feedbackId) {
  if (confirm('Are you sure you want to delete this feedback?')) {
    try {
      await remove(ref(db, `queries/${feedbackId}`));
      
      // Remove from local data
      delete allFeedback[feedbackId];
      
      // Refresh the display
      filterFeedback();
      
      alert('Feedback deleted successfully');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      alert('Error deleting feedback');
    }
  }
};

// Close feedback modal
window.closeFeedbackModal = function() {
  document.getElementById('feedbackModal').style.display = 'none';
  currentFeedbackId = '';
};

// Close modal when clicking outside
document.getElementById('feedbackModal').addEventListener('click', function(e) {
  if (e.target === this) {
    closeFeedbackModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeFeedbackModal();
  }
});

// Auto-load feedback when page loads
document.addEventListener('DOMContentLoaded', function() {
  loadFeedback();
});