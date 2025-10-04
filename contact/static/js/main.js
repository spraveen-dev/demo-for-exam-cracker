// Main JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkLoginStatus();
    
    // Initialize page animations
    initPageAnimations();
    
    // Handle navigation highlighting
    highlightActiveNav();
    
    // Load user profile data
    loadProfileData();
});

function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentPage = window.location.pathname;
    
    // Redirect to login if not logged in and not on intro/login page
    if (!isLoggedIn && !currentPage.includes('login') && !currentPage.includes('intro')) {
        window.location.href = '/login';
    }
}

function initPageAnimations() {
    // Add fade-in animation to main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.classList.add('fade-in');
    }
    
    // Add slide-up animation to cards
    const cards = document.querySelectorAll('.dashboard-card, .accordion-item');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('slide-up');
        }, index * 100);
    });
}

function highlightActiveNav() {
    const currentPage = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .nav-item');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        const href = link.getAttribute('href');
        if (href && currentPage.includes(href.split('/').pop())) {
            link.classList.add('active');
        }
    });
}

// Download file function
function downloadFile(filename) {
    // Create a temporary download link
    const link = document.createElement('a');
    link.href = '#';
    link.download = filename;
    
    // Show download notification
    showNotification(`Downloading ${filename}...`, 'info');
    
    // Simulate download delay
    setTimeout(() => {
        showNotification(`${filename} downloaded successfully!`, 'success');
    }, 1500);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? 'var(--primary-red)' : 'var(--dark-gray)',
        color: 'var(--white)',
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease'
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
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-triangle';
        case 'warning': return 'exclamation-circle';
        default: return 'info-circle';
    }
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        document.title = 'Come back! - Exam Cracker';
    } else {
        document.title = document.title.replace('Come back! - ', '');
    }
});

// Profile functionality
function loadProfileData() {
    const username = localStorage.getItem('username') || 'User';
    const password = localStorage.getItem('password') || '';
    const loginTime = localStorage.getItem('loginTime') || 'Just now';
    
    // Update navigation profile
    const navUsername = document.getElementById('navUsername');
    const bottomUsername = document.getElementById('bottomUsername');
    
    if (navUsername) navUsername.textContent = username;
    if (bottomUsername) bottomUsername.textContent = username;
    
    // Update profile section (if on home page)
    const profileUsername = document.getElementById('profileUsername');
    const profilePassword = document.getElementById('profilePassword');
    const loginTimeElement = document.getElementById('loginTime');
    
    if (profileUsername) profileUsername.textContent = username;
    if (profilePassword) {
        profilePassword.textContent = '••••••••';
        profilePassword.setAttribute('data-password', password);
    }
    if (loginTimeElement) loginTimeElement.textContent = loginTime;
}

function togglePassword() {
    const passwordElement = document.getElementById('profilePassword');
    const passwordIcon = document.getElementById('passwordIcon');
    const actualPassword = passwordElement.getAttribute('data-password');
    
    if (passwordElement.textContent === '••••••••') {
        passwordElement.textContent = actualPassword;
        passwordIcon.className = 'fas fa-eye-slash';
    } else {
        passwordElement.textContent = '••••••••';
        passwordIcon.className = 'fas fa-eye';
    }
}

function logout() {
    // Clear all stored data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    localStorage.removeItem('loginTime');
    
    // Show logout message
    showNotification('Logged out successfully!', 'info');
    
    // Redirect to intro after short delay
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}

// Hamburger Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mainNav = document.getElementById('mainNav');
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (hamburgerMenu && mainNav && mobileOverlay) {
        // Toggle menu function
        function toggleMenu() {
            const isActive = hamburgerMenu.classList.contains('active');
            
            if (isActive) {
                // Close menu
                hamburgerMenu.classList.remove('active');
                mainNav.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            } else {
                // Open menu
                hamburgerMenu.classList.add('active');
                mainNav.classList.add('active');
                mobileOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
        
        // Event listeners
        hamburgerMenu.addEventListener('click', toggleMenu);
        mobileOverlay.addEventListener('click', toggleMenu);
        
        // Debug: Log navigation structure
        console.log('Navigation structure:', {
            hamburgerMenu: hamburgerMenu,
            mainNav: mainNav,
            mobileOverlay: mobileOverlay,
            navLinks: mainNav.querySelectorAll('a, .nav-profile')
        });
        
        // Close menu when clicking on nav links
        const navLinks = mainNav.querySelectorAll('a, .nav-profile');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Allow the link to work normally
                console.log('Navigation link clicked:', link.href);
                
                // Ensure the link can navigate
                if (link.href && link.href !== window.location.href) {
                    console.log('Navigating to:', link.href);
                    
                    // Only close menu on mobile
                    if (window.innerWidth <= 768) {
                        // Small delay to ensure navigation happens
                        setTimeout(() => {
                            toggleMenu();
                        }, 100);
                    }
                }
            });
        });
        
        // Close menu on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                hamburgerMenu.classList.remove('active');
                mainNav.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
        
        // Add smooth scroll behavior for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Test navigation functionality
        function testNavigation() {
            const testLinks = mainNav.querySelectorAll('a[href$=".html"]');
            testLinks.forEach(link => {
                console.log('Navigation link found:', {
                    href: link.href,
                    text: link.textContent.trim(),
                    element: link
                });
                
                // Add a test click handler
                link.addEventListener('click', function(e) {
                    console.log('Link clicked:', this.href);
                    // Don't prevent default - let it navigate
                });
            });
        }
        
        // Run navigation test
        testNavigation();
    }
    
    // Add loading animation for page transitions
    const pageLinks = document.querySelectorAll('a[href$=".html"]');
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.href !== window.location.href) {
                // Add loading effect
                document.body.style.opacity = '0.7';
                document.body.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    document.body.style.opacity = '1';
                }, 100);
            }
        });
    });
    
    
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const fileName = this.getAttribute('data-file');
            if (fileName) {
                // Simulate download (you can replace this with actual download logic)
                console.log(`Downloading: ${fileName}`);
                
                // Add download animation
                this.innerHTML = '<i class="fas fa-check"></i>';
                this.style.background = 'var(--primary-red)';
                this.style.color = 'white';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-download"></i>';
                    this.style.background = '';
                    this.style.color = '';
                }, 2000);
            }
        });
    });
    
    // Notification Banner Functionality
    function initNotificationBanner() {
        const notificationBanner = document.getElementById('notificationBanner');
        const notificationClose = document.getElementById('notificationClose');
        
        if (notificationBanner && notificationClose) {
            // Show notification banner after a short delay
            setTimeout(() => {
                notificationBanner.classList.add('show');
                
                // Auto-hide after 8 seconds
                setTimeout(() => {
                    hideNotification();
                }, 8000);
            }, 1000);
            
            // Close button functionality
            notificationClose.addEventListener('click', hideNotification);
            
            // Function to hide notification
            function hideNotification() {
                notificationBanner.classList.remove('show');
                
                // Store in localStorage to remember user dismissed it
                localStorage.setItem('notificationDismissed', 'true');
                localStorage.setItem('notificationDismissedTime', Date.now());
            }
            
            // Check if user has already dismissed the notification
            const isDismissed = localStorage.getItem('notificationDismissed');
            const dismissedTime = localStorage.getItem('notificationDismissedTime');
            const currentTime = Date.now();
            const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            
            // If dismissed more than 24 hours ago, show again
            if (isDismissed && dismissedTime && (currentTime - dismissedTime) < oneDay) {
                notificationBanner.style.display = 'none';
            }
        }
    }
    
    // Initialize notification banner
    initNotificationBanner();
    });
// ...existing code...

document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mainNav = document.getElementById('mainNav');
    const mobileOverlay = document.getElementById('mobileOverlay');

    // Hamburger menu toggle
    if (hamburgerMenu && mainNav && mobileOverlay) {
        hamburgerMenu.addEventListener('click', function() {
            mainNav.classList.toggle('open');
            mobileOverlay.classList.toggle('active');
        });

        // Close menu when overlay is clicked
        mobileOverlay.addEventListener('click', function() {
            mainNav.classList.remove('open');
            mobileOverlay.classList.remove('active');
        });

        // Close menu when a nav-link is clicked
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mainNav.classList.remove('open');
                mobileOverlay.classList.remove('active');
            });
        });
    }
});
