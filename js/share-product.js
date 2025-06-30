document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('product-form');
  const imageInputs = document.querySelectorAll('.image-upload-box input[type="file"]');

  // Handle image upload previews
  imageInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        const box = input.closest('.image-upload-box');
        
        reader.onload = (e) => {
          // Remove any existing preview
          const existingPreview = box.querySelector('img');
          if (existingPreview) {
            existingPreview.remove();
          }
          
          // Create and add new preview
          const img = document.createElement('img');
          img.src = e.target.result;
          box.appendChild(img);
          box.classList.add('has-image');
          
          // Update label text
          const label = box.querySelector('.upload-text');
          label.textContent = 'Change Image';
        };
        
        reader.readAsDataURL(file);
      }
    });
  });

  // Form validation
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Basic validation
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('error');
      } else {
        field.classList.remove('error');
      }
    });
    
    // Image validation
    const firstImage = document.getElementById('image1');
    if (!firstImage.files[0]) {
      isValid = false;
      firstImage.closest('.image-upload-box').classList.add('error');
    } else {
      firstImage.closest('.image-upload-box').classList.remove('error');
    }
    
    if (isValid) {
      // Here you would typically send the form data to your server
      // For now, we'll just show a success message
      const successMessage = document.createElement('div');
      successMessage.className = 'success-message';
      successMessage.innerHTML = `
        <div class="success-content">
          <span class="success-icon">✅</span>
          <h3>Product Submitted Successfully!</h3>
          <p>Thank you for sharing your product with our community. We'll review it and get back to you soon.</p>
        </div>
      `;
      
      form.innerHTML = '';
      form.appendChild(successMessage);
    }
  });
}); 