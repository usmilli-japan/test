// ===== CONTENT PROTECTION & ANTI-TAMPERING =====
// Disable right-click context menu
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

function clearClipboardIfPossible() {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('').catch(function() {
            // Ignore clipboard permission errors.
        });
    }
}

// Disable keyboard shortcuts for viewing source and developer tools
document.addEventListener('keydown', function(e) {
    const key = (e.key || '').toLowerCase();
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;

    // Ctrl+U (View Source)
    if (isCtrlOrMeta && key === 'u') {
        e.preventDefault();
        return false;
    }

    // F12 (Developer Tools)
    if (e.keyCode === 123 || key === 'f12') {
        e.preventDefault();
        return false;
    }

    // Ctrl+Shift+I (Inspect Element)
    if (isCtrlOrMeta && e.shiftKey && key === 'i') {
        e.preventDefault();
        return false;
    }

    // Ctrl+Shift+C (Inspect Element Alternative)
    if (isCtrlOrMeta && e.shiftKey && key === 'c') {
        e.preventDefault();
        return false;
    }

    // Ctrl+Shift+K (Developer Console)
    if (isCtrlOrMeta && e.shiftKey && (key === 'k' || key === 'j')) {
        e.preventDefault();
        return false;
    }

    // PrintScreen key (best-effort deterrent; OS-level screenshots cannot be fully blocked)
    if (key === 'printscreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        clearClipboardIfPossible();
        return false;
    }

    // macOS screenshot shortcuts (best-effort deterrent)
    if (e.metaKey && e.shiftKey && (key === '3' || key === '4' || key === '5')) {
        e.preventDefault();
        clearClipboardIfPossible();
        return false;
    }
});

// Extra screenshot-key listener for browsers that fire only keyup
document.addEventListener('keyup', function(e) {
    const key = (e.key || '').toLowerCase();
    if (key === 'printscreen' || e.code === 'PrintScreen') {
        clearClipboardIfPossible();
    }
});

// Disable text selection
document.body.style.userSelect = 'none';
document.body.style.webkitUserSelect = 'none';
document.body.style.mozUserSelect = 'none';
document.body.style.msUserSelect = 'none';

// Disable drag functionality (prevents dragging to save images)
document.addEventListener('drag', function(e) {
    e.preventDefault();
    return false;
});

// Disable copy functionality
document.addEventListener('copy', function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
});

// Disable cut functionality
document.addEventListener('cut', function(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
});

// Detect developer tools opening
let devToolsOpen = false;
const threshold = 160;
setInterval(function() {
    if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
        if (!devToolsOpen) {
            devToolsOpen = true;
            // Optional: redirect or show message
            console.warn('Developer tools detected');
        }
    } else {
        devToolsOpen = false;
    }
}, 500);

// Disable F5 refresh (optional, uncomment if needed)
// document.addEventListener('keydown', function(e) {
//     if (e.keyCode === 116) { // F5
//         e.preventDefault();
//         return false;
//     }
// });

// ===== LANGUAGE MANAGEMENT =====
// Language Management
let currentLanguage = 'ja';

function switchLanguage(lang) {
    currentLanguage = lang;
    
    // Update all elements with translation data
    document.querySelectorAll('[data-ja][data-en]').forEach(element => {
        const text = lang === 'ja' ? element.getAttribute('data-ja') : element.getAttribute('data-en');
        element.textContent = text;
    });

    document.querySelectorAll('[data-ja][data-en][data-ko]').forEach(element => {
        const text = lang === 'ja'
            ? element.getAttribute('data-ja')
            : lang === 'ko'
                ? element.getAttribute('data-ko')
                : element.getAttribute('data-en');
        element.textContent = text;
    });

    // Update button states
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });

    // Store preference
    localStorage.setItem('preferredLanguage', lang);
}

// Language button functionality
document.addEventListener('DOMContentLoaded', function() {
    const langButtons = document.querySelectorAll('.lang-btn');
    
    // Force default language to Japanese on each page load
    switchLanguage('ja');
    
    // Button click handlers
    langButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });

    // Allow touch scrolling within main-content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.addEventListener('touchmove', function(e) {
            e.stopPropagation();
        }, false);
    }

    // Login button - show floating modal
    const loginBtn = document.getElementById('loginBtn');
    const loginModalOverlay = document.getElementById('loginModalOverlay');
    const modalLoginForm = document.getElementById('modalLoginForm');
    const passwordToggleBtn = document.getElementById('passwordToggleBtn');
    const modalLoginPassword = document.getElementById('modalLoginPassword');

    // Show login modal by default on page load if not logged in
    window.addEventListener('load', function() {
        const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
        if (!isLoggedIn && loginModalOverlay) {
            loginModalOverlay.classList.add('active');
        }
    });

    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const isLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
            if (isLoggedIn) {
                // Redirect to profile page
                const userProfile = localStorage.getItem('userProfile') || 'profile.html';
                window.location.href = userProfile;
            } else {
                // Show floating login modal
                if (loginModalOverlay) {
                    loginModalOverlay.classList.add('active');
                }
            }
        });
    }

    // Close modal when clicking close button
    // REMOVED - Close button is no longer available

    // Close modal when clicking outside (on overlay)
    // REMOVED - Users should not be able to close the modal

    // Password reveal/hide functionality
    if (passwordToggleBtn) {
        passwordToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const type = modalLoginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            modalLoginPassword.setAttribute('type', type);
        });
    }

    // Modal language switching
    let modalCurrentLanguage = 'ja';
    const modalLangBtn = document.getElementById('modalLangBtn');

    function switchModalLanguage(lang) {
        modalCurrentLanguage = lang;

        // Update all modal elements with translation data
        document.querySelectorAll('.floating-login-modal [data-ja][data-en]').forEach(element => {
            const text = lang === 'ja' ? element.getAttribute('data-ja') : element.getAttribute('data-en');
            element.textContent = text;
        });

        // Update input placeholders
        const emailInput = document.getElementById('modalLoginEmail');
        if (emailInput) {
            const placeholder = lang === 'ja' 
                ? emailInput.getAttribute('data-ja-placeholder') 
                : emailInput.getAttribute('data-en-placeholder');
            emailInput.setAttribute('placeholder', placeholder);
        }

        const passwordInput = document.getElementById('modalLoginPassword');
        if (passwordInput) {
            const placeholder = lang === 'ja' 
                ? passwordInput.getAttribute('data-ja-placeholder') 
                : passwordInput.getAttribute('data-en-placeholder');
            passwordInput.setAttribute('placeholder', placeholder);
        }

        // Update button state
        if (modalLangBtn) {
            if (lang === 'ja') {
                modalLangBtn.textContent = 'Eng';
                modalLangBtn.setAttribute('data-lang', 'en');
                modalLangBtn.classList.remove('active');
            } else {
                modalLangBtn.textContent = '日本語';
                modalLangBtn.setAttribute('data-lang', 'ja');
                modalLangBtn.classList.add('active');
            }
        }
    }

    if (modalLangBtn) {
        // Set default to Japanese on modal open
        modalLangBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const nextLang = modalCurrentLanguage === 'ja' ? 'en' : 'ja';
            switchModalLanguage(nextLang);
        });
    }

    // Initialize modal language to Japanese when showing
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            if (e.target === this) {
                // Reset modal language to Japanese on each open
                switchModalLanguage('ja');
            }
        });
    }

    // Modal login form submission
    if (modalLoginForm) {
        modalLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = document.getElementById('modalLoginEmail').value.trim();
            const password = document.getElementById('modalLoginPassword').value;
            const modalLoginError = document.getElementById('modalLoginError');

            // Valid credentials for multiple users
            const users = [
                { email: 'k44685030@gmail.com', password: '4t0hfp1kA', profile: 'profile.html' },
                { email: 'shellys625@icloud.com', password: 'gIA650', profile: 'profile2.html' }
            ];

            // Validate credentials
            const validUser = users.find(user => user.email === email && user.password === password);
            
            if (validUser) {
                // Successful login
                modalLoginError.classList.remove('show');
                localStorage.setItem('userLoggedIn', 'true');
                localStorage.setItem('userProfile', validUser.profile);
                
                // Close modal and redirect to profile
                if (loginModalOverlay) {
                    loginModalOverlay.classList.remove('active');
                }
                
                // Small delay before redirect for smooth transition
                setTimeout(function() {
                    window.location.href = validUser.profile;
                }, 300);
            } else {
                // Failed login
                modalLoginError.classList.add('show');
                modalLoginError.textContent = modalCurrentLanguage === 'ja' 
                    ? 'メールまたはパスワードが正しくありません' 
                    : 'Invalid email or password';
            }
        });
    }

    // Hamburger Menu Functionality
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navDropdown = document.getElementById('navDropdown');

    if (hamburgerBtn && navDropdown) {
        // Toggle dropdown on hamburger click
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            hamburgerBtn.classList.toggle('active');
            navDropdown.classList.toggle('active');
        });

        // Close dropdown when clicking on buttons inside it
        const dropdownButtons = navDropdown.querySelectorAll('button');
        dropdownButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Close dropdown after clicking (except for language buttons with active state)
                if (!this.classList.contains('lang-btn') || this.classList.contains('login-btn')) {
                    hamburgerBtn.classList.remove('active');
                    navDropdown.classList.remove('active');
                }
            });
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.hamburger-btn') && !e.target.closest('.nav-dropdown')) {
                hamburgerBtn.classList.remove('active');
                navDropdown.classList.remove('active');
            }
        });
    }

    // Update login button text on page load if user is logged in
    window.addEventListener('load', function() {
        const loginBtn = document.getElementById('loginBtn');
        const isUserLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
        if (isUserLoggedIn && loginBtn) {
            // User is logged in - show profile button
            const profileText = currentLanguage === 'ja' ? '👤 プロフィール' : '👤 Profile';
            loginBtn.textContent = profileText;
        } else if (loginBtn) {
            // User is NOT logged in - show login button
            const loginText = currentLanguage === 'ja' 
                ? (loginBtn.getAttribute('data-ja') || 'ログイン')
                : (loginBtn.getAttribute('data-en') || 'Login');
            loginBtn.textContent = loginText;
        }
    });
});

// Enhanced flag animation with wind effect
window.addEventListener('load', function() {
    const flagImage = document.querySelector('.flag-image');
    
    if (flagImage) {
        // Add random subtle variations to animation
        const randomOffset = Math.random() * 2;
        flagImage.style.animationDelay = `-${randomOffset}s`;
        
        // Add subtle filter effects for depth
        flagImage.style.filter = 'brightness(0.95) contrast(1.05)';
    }
});

// Prevent double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Handle orientation changes
window.addEventListener('orientationchange', function() {
    setTimeout(function() {
        window.scrollTo(0, 0);
    }, 100);
});

console.log('🇯🇵 US Army Garrison Okinawa Japan - Ready');
console.log('Default Language: 日本語 (Japanese)');
console.log('Language switching enabled');
console.log('Login system active');

// Scroll-hide header functionality
const headerLogoContainer = document.querySelector('.logo-container');
const headerHamburgerBtn = document.querySelector('.hamburger-btn');
const headerElement = document.querySelector('.header');

if (headerLogoContainer && headerHamburgerBtn && headerElement) {
    window.addEventListener('scroll', function() {
        const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;
        
        // Get header height to know when to hide
        const headerHeight = headerElement.offsetHeight + 100;
        
        if (currentScrollPosition > headerHeight) {
            // User has scrolled past header - hide logo and hamburger
            headerLogoContainer.classList.add('hide-on-scroll');
            headerHamburgerBtn.classList.add('hide-on-scroll');
        } else {
            // User is back at top - show logo and hamburger
            headerLogoContainer.classList.remove('hide-on-scroll');
            headerHamburgerBtn.classList.remove('hide-on-scroll');
        }
        
    }, false);
}
