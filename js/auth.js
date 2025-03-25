// Authentication utilities for TimeBridge
import supabase from "./supabaseClient.js";

// Check if the user is authenticated using Supabase
export async function isAuthenticated() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Error checking authentication:", error);
        return false;
    }
    return data.session !== null;
}

// Get the authenticated user's email
export async function getUserEmail() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
        console.error("Error getting user:", error);
        return null;
    }
    return data.user.email;
}

// Get user initials from email
export async function getUserInitials(email) {
    if (!email) {
        email = await getUserEmail();
    }
    
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
export async function signIn(email, password, rememberMe = false) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });
        
        if (error) {
            console.error("Sign in error:", error);
            throw error;
        }
        
        if (rememberMe) {
            localStorage.setItem('rememberedUser', email);
        }
        
        return data;
    } catch (err) {
        console.error("Sign in error:", err);
        throw err;
    }
}

// Sign up a new user
export async function signUp(email, password) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
        });
        
        if (error) {
            console.error("Sign up error:", error);
            throw error;
        }
        
        return data;
    } catch (err) {
        console.error("Sign up error:", err);
        throw err;
    }
}

// Sign out a user
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error("Sign out error:", error);
            throw error;
        }
        
        // Redirect to login page
        window.location.href = 'index.html';
    } catch (err) {
        console.error("Sign out error:", err);
        throw err;
    }
}

// Setup user menu functionality
export async function setupUserMenu() {
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');
    const signOutButton = document.getElementById('sign-out');
    
    if (userMenuButton && userMenu) {
        // Update user initials
        const userInitials = document.getElementById('user-initials');
        if (userInitials) {
            const initials = await getUserInitials();
            userInitials.textContent = initials;
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
export async function checkAuth(requireAuth = true) {
    const auth = await isAuthenticated();
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
export async function initAuth() {
    // Check authentication
    if (!await checkAuth()) return;
    
    // Setup user menu
    await setupUserMenu();
    
    // Setup toast notifications
    setupToast();
} 