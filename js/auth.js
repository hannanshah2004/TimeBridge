// Authentication utilities for TimeBridge

// Check if the user is authenticated
export function isAuthenticated() {
    return sessionStorage.getItem('isAuthenticated') === 'true';
}

// Get the authenticated user's email
export function getUserEmail() {
    return sessionStorage.getItem('userEmail');
}

// Get user initials from email
export function getUserInitials(email) {
    if (!email) email = getUserEmail();
    if (!email) return 'TB'; // Default fallback
    
    // Extract initials from the email username (before @)
    const username = email.split('@')[0];
    if (username.length >= 2) {
        return username.substring(0, 2).toUpperCase();
    } else {
        return (username[0] + 'T').toUpperCase(); // Fallback if username is too short
    }
}

// Sign in a user
export function signIn(email, rememberMe = false) {
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userEmail', email);
    
    if (rememberMe) {
        localStorage.setItem('rememberedUser', email);
    }
}

// Sign out a user
export function signOut() {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userEmail');
    // We don't remove rememberedUser to maintain "remember me" functionality
    
    // Redirect to login page
    window.location.href = 'index.html';
}

// Setup user menu functionality
export function setupUserMenu() {
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');
    const signOutButton = document.getElementById('sign-out');
    
    if (userMenuButton && userMenu) {
        // Update user initials
        const userInitials = document.getElementById('user-initials');
        if (userInitials) {
            userInitials.textContent = getUserInitials();
        }
        
        // Toggle user menu
        userMenuButton.addEventListener('click', function() {
            userMenu.classList.toggle('hidden');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!userMenuButton.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.classList.add('hidden');
            }
        });
    }
    
    // Sign out functionality
    if (signOutButton) {
        signOutButton.addEventListener('click', function(e) {
            e.preventDefault();
            signOut();
        });
    }
}

// Check authentication and redirect if needed
export function checkAuth(requireAuth = true) {
    const auth = isAuthenticated();
    const onLoginPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    
    if (requireAuth && !auth && !onLoginPage) {
        // Redirect to login page if authentication is required but user is not authenticated
        window.location.href = 'index.html';
        return false;
    } else if (auth && onLoginPage) {
        // Redirect to dashboard if user is already authenticated and on login page
        window.location.href = 'dashboard.html';
        return false;
    }
    
    return true;
}

// Get remembered user, if any
export function getRememberedUser() {
    return localStorage.getItem('rememberedUser');
}

// Show a toast notification
export function showToast(message, type = 'success') {
    const toastNotification = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    
    if (!toastNotification || !toastMessage || !toastIcon) return;
    
    toastMessage.textContent = message;
    
    if (type === 'error') {
        toastIcon.className = 'fa-solid fa-exclamation-circle text-red-500 text-xl';
    } else if (type === 'info') {
        toastIcon.className = 'fa-solid fa-info-circle text-blue-500 text-xl';
    } else {
        toastIcon.className = 'fa-solid fa-check-circle text-green-500 text-xl';
    }
    
    toastNotification.classList.remove('hidden');
    toastNotification.classList.add('toast-enter');
    
    // Auto-hide toast after 5 seconds
    setTimeout(hideToast, 5000);
}

// Hide a toast notification
export function hideToast() {
    const toastNotification = document.getElementById('toast-notification');
    if (!toastNotification) return;
    
    toastNotification.classList.add('toast-leave');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
        toastNotification.classList.add('hidden');
        toastNotification.classList.remove('toast-enter', 'toast-leave');
    }, 300);
}

// Setup toast notification
export function setupToast() {
    const closeToastButton = document.getElementById('close-toast');
    if (closeToastButton) {
        closeToastButton.addEventListener('click', hideToast);
    }
    
    // Make showToast globally available
    window.showToast = showToast;
}

// Initialize authentication features
export function initAuth() {
    // Check authentication
    if (!checkAuth()) return;
    
    // Setup user menu
    setupUserMenu();
    
    // Setup toast notifications
    setupToast();
} 