// query.js
import { saveQuery } from './firebase.js';

document.addEventListener('DOMContentLoaded', function() {
  const queryForm = document.getElementById('queryForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const statusMessage = document.getElementById('statusMessage');

  if (queryForm) {
    queryForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const rollNo = document.getElementById('rollNo').value.trim();
      const message = document.getElementById('message').value.trim();
      
      // Validate form
      if (!name || !email || !message) {
        showStatus('Please fill in all required fields', 'error');
        return;
      }
      
      // Show loading state
      btnText.textContent = 'Sending...';
      loadingSpinner.style.display = 'inline-block';
      submitBtn.disabled = true;
      
      try {
        const queryData = {
          name,
          email,
          rollNo: rollNo || 'Not provided',
          message
        };
        
        const success = await saveQuery(queryData);
        
        if (success) {
          showStatus('Your message has been sent successfully! We will get back to you soon.', 'success');
          queryForm.reset();
        } else {
          throw new Error('Failed to send message. Please try again.');
        }
      } catch (error) {
        showStatus(error.message, 'error');
      } finally {
        // Reset button state
        btnText.textContent = 'SEND MESSAGE';
        loadingSpinner.style.display = 'none';
        submitBtn.disabled = false;
      }
    });
  }
  
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
    statusMessage.style.display = 'block';
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 5000);
  }
});