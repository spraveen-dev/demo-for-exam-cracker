// Intro page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Always show intro on every visit (removed session check)
    startIntroSequence();
});

function startIntroSequence() {
    const loadingProgress = document.getElementById('loadingProgress');
    const introContainer = document.getElementById('introContainer');
    
    // Start loading animation after initial animations
    setTimeout(() => {
        startLoadingAnimation(loadingProgress);
    }, 3000);
    
    // Complete intro after loading
    setTimeout(() => {
        completeIntro(introContainer);
    }, 7000);
}

function startLoadingAnimation(progressBar) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) {
            progress = 100;
            clearInterval(interval);
        }
        progressBar.style.width = progress + '%';
    }, 200);
}

function completeIntro(container) {
    // Fade out intro
    container.style.opacity = '0';
    container.style.transform = 'scale(0.9)';
    container.style.transition = 'all 0.5s ease';
    
    // Redirect to login
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 500);
}

// Prevent accidental navigation during intro
window.addEventListener('beforeunload', function(e) {
    const introShown = sessionStorage.getItem('introShown');
    if (!introShown) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Add typewriter effect to title
function typewriterEffect(element, text, speed = 100) {
    element.textContent = '';
    element.style.opacity = '1';
    
    let i = 0;
    const timer = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(timer);
        }
    }, speed);
}

// Alternative: Initialize typewriter effect if preferred
// setTimeout(() => {
//     const title = document.getElementById('introTitle');
//     if (title) {
//         typewriterEffect(title, 'Exam Cracker', 150);
//     }
// }, 1500);
