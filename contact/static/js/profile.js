// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    loadProfilePageData();
});

function loadProfilePageData() {
    const username = localStorage.getItem('username') || 'User';
    const password = localStorage.getItem('password') || '';
    const loginTime = localStorage.getItem('loginTime') || 'Just now';
    
    // Update profile display elements
    const profileDisplayName = document.getElementById('profileDisplayName');
    const profileEmail = document.getElementById('profileEmail');
    const profileUsername = document.getElementById('profileUsername');
    const profilePassword = document.getElementById('profilePassword');
    const loginTimeElement = document.getElementById('loginTime');
    const memberSince = document.getElementById('memberSince');
    
    if (profileDisplayName) profileDisplayName.textContent = username;
    if (profileEmail) profileEmail.textContent = `Active member since ${new Date().toLocaleDateString()}`;
    if (profileUsername) profileUsername.textContent = username;
    if (profilePassword) {
        profilePassword.textContent = '••••••••';
        profilePassword.setAttribute('data-password', password);
    }
    if (loginTimeElement) loginTimeElement.textContent = loginTime;
    if (memberSince) memberSince.textContent = new Date().toLocaleDateString();
}

function editField(fieldType) {
    const currentValue = fieldType === 'username' 
        ? localStorage.getItem('username') 
        : localStorage.getItem('password');
    
    const newValue = prompt(`Enter new ${fieldType}:`, currentValue);
    
    if (newValue && newValue.trim()) {
        localStorage.setItem(fieldType, newValue.trim());
        
        // Update display
        loadProfilePageData();
        
        // Update navigation
        if (typeof loadProfileData === 'function') {
            loadProfileData();
        }
        
        showProfileNotification(`${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} updated successfully!`, 'success');
    }
}

function goBack() {
    window.history.back();
}

function showProfileNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `profile-notification notification-${type}`;
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
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
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