document.addEventListener('DOMContentLoaded', function() {
    // --- Existing scroll event logic ---
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- Corrected hamburger menu logic ---
    const hamburger = document.querySelector('.hamburger'); // Select by class
    const navMenu = document.querySelector('.nav');         // Select by class
    const navClose = document.querySelector('.nav-close');  // Select close button

    hamburger.addEventListener('click', function() {
        navMenu.classList.add('active');
    });

    navClose.addEventListener('click', function() {
        navMenu.classList.remove('active');
    });

    // Close menu when clicking on navigation links
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
        });
    });

    // --- Email Validation Function ---
    function validateGmail(email) {
        const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        return gmailRegex.test(email);
    }

    function showEmailValidation(message, isValid) {
        const emailInput = document.getElementById('email');
        const validationDiv = document.getElementById('email-validation');
        
        emailInput.classList.remove('email-error', 'email-success');
        validationDiv.classList.remove('error', 'success');
        
        if (message) {
            emailInput.classList.add(isValid ? 'email-success' : 'email-error');
            validationDiv.textContent = message;
            validationDiv.classList.add(isValid ? 'success' : 'error');
        }
    }

    // --- Email Validation Event Listener ---
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const email = this.value.trim();
            if (email) {
                if (validateGmail(email)) {
                    showEmailValidation('✓ Valid Gmail address', true);
                } else {
                    showEmailValidation('Please enter a valid Gmail address (example@gmail.com)', false);
                }
            } else {
                showEmailValidation('', false);
            }
        });
    }

    // --- Contact Form Submission ---
    const contactForm = document.querySelector('.contact-form form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const countryCode = document.getElementById('country-code').value;
            const phoneNumber = document.getElementById('phone').value;
            const fullPhone = phoneNumber ? `${countryCode} ${phoneNumber}` : '';
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: fullPhone,
                country_code: countryCode,
                company: document.getElementById('company').value,
                project_type: document.getElementById('project-type').value,
                budget_range: document.getElementById('budget-range').value,
                timeline: document.getElementById('timeline').value,
                project_details: document.getElementById('project-details').value
            };

            // Validate required fields
            if (!formData.name || !formData.email || !formData.project_type || !formData.project_details) {
                showMessage('Please fill in all required fields.', 'error');
                return;
            }

            // Validate Gmail
            if (!validateGmail(formData.email)) {
                showMessage('Please enter a valid Gmail address.', 'error');
                return;
            }

            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            try {
                const response = await fetch('http://82.29.165.109/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    showMessage('Thank you! Your message has been sent successfully. We\'ll get back to you within 24 hours.', 'success');
                    contactForm.reset(); // Clear the form
                } else {
                    showMessage(result.error || 'Something went wrong. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Network error. Please check your connection and try again.', 'error');
            } finally {
                // Reset button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }

    // --- Newsletter Subscription Form ---
    const subscribeForm = document.querySelector('.subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const emailInput = subscribeForm.querySelector('input[type="email"]');
            const email = emailInput.value.trim();

            if (!email) {
                showMessage('Please enter your email address.', 'error');
                return;
            }

            // Show loading state
            const submitButton = subscribeForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Subscribing...';
            submitButton.disabled = true;

            try {
                const response = await fetch('http://82.29.165.109/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: email })
                });

                const result = await response.json();

                if (response.ok) {
                    showMessage('Successfully subscribed to our newsletter!', 'success');
                    emailInput.value = ''; // Clear the input
                } else {
                    showMessage(result.error || 'Subscription failed. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Network error. Please check your connection and try again.', 'error');
            } finally {
                // Reset button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        });
    }

    // --- Message Display Function ---
    function showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.message-popup');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message-popup ${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <span class="message-text">${message}</span>
                <button class="message-close">&times;</button>
            </div>
        `;

        // Add styles
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        messageDiv.querySelector('.message-content').style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
        `;

        messageDiv.querySelector('.message-close').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            padding: 0;
            margin: 0;
        `;

        // Add close functionality
        messageDiv.querySelector('.message-close').addEventListener('click', () => {
            messageDiv.remove();
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);

        // Add to page
        document.body.appendChild(messageDiv);

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // --- Add timeline options dynamically ---
    const timelineSelect = document.getElementById('timeline');
    if (timelineSelect) {
        const timelineOptions = [
            'Within 1 week',
            'Within 2 weeks',
            'Within 1 month',
            'Within 2 months',
            'Within 3 months',
            'No specific timeline'
        ];

        timelineOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            timelineSelect.appendChild(optionElement);
        });
    }

});
