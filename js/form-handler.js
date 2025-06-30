/**
 * Project CTRL Form Handler
 * Provides multiple submission methods with automatic fallbacks
 */

class FormHandler {
  constructor(formId, options = {}) {
    this.form = document.getElementById(formId);
    this.options = {
      formspreeEndpoint: '',
      emailFallback: 'contact.projectctrl@gmail.com',
      successRedirect: '',
      successMessage: 'Form submitted successfully!',
      ...options
    };
    
    this.init();
  }

  init() {
    if (!this.form) {
      console.error('Form not found:', formId);
      return;
    }

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    const submitButton = this.form.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Show loading state
    this.setLoadingState(submitButton, true);
    
    try {
      // Try Formspree first
      if (this.options.formspreeEndpoint) {
        const success = await this.submitToFormspree();
        if (success) {
          this.handleSuccess();
          return;
        }
      }
      
      // Fallback to email
      await this.submitViaEmail();
      this.handleSuccess();
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.handleError(error);
    } finally {
      this.setLoadingState(submitButton, false, originalText);
    }
  }

  async submitToFormspree() {
    try {
      const formData = new FormData(this.form);
      
      const response = await fetch(this.options.formspreeEndpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log('Formspree response:', response.status, response.statusText);
      
      if (response.ok) {
        return true;
      } else {
        console.warn('Formspree returned error:', response.status);
        return false;
      }
    } catch (error) {
      console.warn('Formspree submission failed:', error);
      return false;
    }
  }

  async submitViaEmail() {
    const formData = new FormData(this.form);
    let emailBody = this.getEmailBody(formData);
    
    const emailSubject = encodeURIComponent(this.getEmailSubject(formData));
    const emailBodyEncoded = encodeURIComponent(emailBody);
    const mailtoLink = `mailto:${this.options.emailFallback}?subject=${emailSubject}&body=${emailBodyEncoded}`;
    
    // Open email client
    window.open(mailtoLink);
    
    // Show success message
    this.showMessage('Email client opened! Please send the email to complete your submission.', 'info');
  }

  getEmailBody(formData) {
    let body = "Form Submission\n\n";
    
    for (let [key, value] of formData.entries()) {
      if (value && value !== '') {
        // Format the field name nicely
        const fieldName = key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        body += `${fieldName}: ${value}\n`;
      }
    }
    
    body += `\nSubmitted on: ${new Date().toLocaleString()}`;
    return body;
  }

  getEmailSubject(formData) {
    // Try to get a meaningful subject from form data
    const title = formData.get('project-name') || 
                  formData.get('title') || 
                  formData.get('product-name') || 
                  'Form Submission';
    return `${title} - Project CTRL`;
  }

  handleSuccess() {
    if (this.options.successRedirect) {
      window.location.href = this.options.successRedirect;
    } else {
      this.showMessage(this.options.successMessage, 'success');
    }
  }

  handleError(error) {
    let message = 'An error occurred while submitting your form.';
    
    if (error.message.includes('Network')) {
      message = 'Network connection error. Please check your internet connection.';
    } else if (error.message.includes('429')) {
      message = 'Too many requests. Please try again in a few minutes.';
    }
    
    this.showMessage(message, 'error');
  }

  setLoadingState(button, loading, originalText = null) {
    if (loading) {
      button.disabled = true;
      button.innerHTML = 'Submitting... <span class="button-icon">↻</span>';
    } else {
      button.disabled = false;
      if (originalText) {
        button.innerHTML = originalText;
      }
    }
  }

  showMessage(message, type = 'info') {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message form-message-${type}`;
    messageDiv.innerHTML = `
      <div class="message-content">
        <span class="message-icon">${this.getMessageIcon(type)}</span>
        <p>${message}</p>
      </div>
    `;
    
    // Insert before form
    this.form.parentNode.insertBefore(messageDiv, this.form);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.parentNode.removeChild(messageDiv);
      }
    }, 10000);
  }

  getMessageIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      info: '💡',
      warning: '⚠️'
    };
    return icons[type] || icons.info;
  }
}

// Add CSS for messages
const style = document.createElement('style');
style.textContent = `
  .form-message {
    margin: 1rem 0;
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .form-message-success {
    background: rgba(0, 200, 83, 0.1);
    border: 1px solid rgba(0, 200, 83, 0.2);
    color: #00c853;
  }
  
  .form-message-error {
    background: rgba(244, 67, 54, 0.1);
    border: 1px solid rgba(244, 67, 54, 0.2);
    color: #f44336;
  }
  
  .form-message-info {
    background: rgba(33, 150, 243, 0.1);
    border: 1px solid rgba(33, 150, 243, 0.2);
    color: #2196f3;
  }
  
  .form-message-warning {
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.2);
    color: #ff9800;
  }
  
  .message-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }
  
  .message-content p {
    margin: 0;
    font-weight: 500;
  }
`;
document.head.appendChild(style); 