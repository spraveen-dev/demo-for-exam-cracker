// Accordion functionality for Materials and Questions pages
document.addEventListener('DOMContentLoaded', function() {
    initAccordions();
});

function initAccordions() {
    // Initialize main subject accordions
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', toggleAccordion);
    });
    
    // Initialize subcategory accordions
    const subcategoryHeaders = document.querySelectorAll('.subcategory-header');
    subcategoryHeaders.forEach(header => {
        header.addEventListener('click', toggleSubcategory);
    });
    
    // Add smooth scroll for better UX
    addSmoothScrolling();
}

function toggleAccordion(e) {
    const header = e.currentTarget;
    const content = header.nextElementSibling;
    const toggleIcon = header.querySelector('.toggle-icon');
    const accordionItem = header.parentElement;
    
    // Close other accordions
    const allAccordions = document.querySelectorAll('.accordion-item');
    allAccordions.forEach(item => {
        if (item !== accordionItem) {
            const otherHeader = item.querySelector('.accordion-header');
            const otherContent = item.querySelector('.accordion-content');
            const otherIcon = item.querySelector('.toggle-icon');
            
            otherHeader.classList.remove('active');
            otherContent.classList.remove('active');
            otherContent.style.maxHeight = null;
            
            // Close all subcategories in other accordions
            const subcategories = otherContent.querySelectorAll('.subcategory-content');
            subcategories.forEach(sub => {
                sub.classList.remove('active');
                sub.style.maxHeight = null;
            });
            
            const subHeaders = otherContent.querySelectorAll('.subcategory-header');
            subHeaders.forEach(subHeader => {
                subHeader.classList.remove('active');
            });
        }
    });
    
    // Toggle current accordion
    header.classList.toggle('active');
    content.classList.toggle('active');
    
    if (content.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + 'px';
        
    
    } else {
        content.style.maxHeight = null;
        
        // Close all subcategories
        const subcategories = content.querySelectorAll('.subcategory-content');
        subcategories.forEach(sub => {
            sub.classList.remove('active');
            sub.style.maxHeight = null;
        });
        
        const subHeaders = content.querySelectorAll('.subcategory-header');
        subHeaders.forEach(subHeader => {
            subHeader.classList.remove('active');
        });
    }
    
    // Add animation to the icon
    addIconAnimation(toggleIcon);
}

function toggleSubcategory(e) {
    e.stopPropagation();
    
    const header = e.currentTarget;
    const content = header.nextElementSibling;
    const parentAccordion = header.closest('.accordion-content');
    
    // Toggle subcategory
    header.classList.toggle('active');
    content.classList.toggle('active');
    
    if (content.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + 'px';
    } else {
        content.style.maxHeight = null;
    }
    
    // Recalculate parent accordion height
    setTimeout(() => {
        if (parentAccordion.classList.contains('active')) {
            parentAccordion.style.maxHeight = parentAccordion.scrollHeight + 'px';
        }
    }, 300);
    
    // Add ripple effect
    addRippleEffect(header, e);
}

function addIconAnimation(icon) {
    if (!icon) return;
    
    icon.style.transform = 'scale(0.8)';
    setTimeout(() => {
        icon.style.transform = 'scale(1)';
        icon.style.transition = 'transform 0.2s ease';
    }, 100);
}

function addRippleEffect(element, event) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(220, 38, 38, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        z-index: 1;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

function addSmoothScrolling() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            setTimeout(() => {
                if (header.classList.contains('active')) {
                    header.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 350);
        });
    });
}

// Enhanced download functionality with progress simulation
function downloadFile(filename) {
    const button = event.target.closest('.download-btn');
    const originalIcon = button.innerHTML;
    
    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;
    
    // Simulate download progress
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.background = 'var(--primary-red)';
        
        // Show success notification
        showDownloadNotification(filename);
        
        // Reset button after delay
        setTimeout(() => {
            button.innerHTML = originalIcon;
            button.disabled = false;
            button.style.background = '';
        }, 2000);
        
    }, 1000 + Math.random() * 1000);
}

function showDownloadNotification(filename) {
    const notification = document.createElement('div');
    notification.className = 'download-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-download"></i>
            <div class="notification-text">
                <strong>Download Complete</strong>
                <span>${filename}</span>
            </div>
        </div>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '100px',
        right: '20px',
        background: 'linear-gradient(135deg, var(--primary-red), var(--dark-red))',
        color: 'var(--white)',
        padding: '1rem',
        borderRadius: '10px',
        boxShadow: '0 10px 30px rgba(220, 38, 38, 0.3)',
        zIndex: '9999',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease',
        minWidth: '250px'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS for download notification
const notificationCSS = `
.download-notification .notification-content {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.download-notification .notification-content i {
    font-size: 1.5rem;
}

.download-notification .notification-text {
    display: flex;
    flex-direction: column;
}

.download-notification .notification-text strong {
    margin-bottom: 0.25rem;
}

.download-notification .notification-text span {
    font-size: 0.9rem;
    opacity: 0.9;
}

@keyframes ripple {
    to {
        transform: scale(2);
        opacity: 0;
    }
}
`;

// Inject notification CSS
const notificationStyle = document.createElement('style');
notificationStyle.textContent = notificationCSS;
document.head.appendChild(notificationStyle);
