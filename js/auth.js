import supabase from "./supabaseClient.js";

export async function isAuthenticated() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
        console.error("Error checking authentication:", error);
        return false;
    }
    return data.session !== null;
}

export async function getUserEmail() {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
        console.error("Error getting user:", error);
        return null;
    }
    return data.user.email;
}

export async function getUserInitials(email) {
    if (!email) {
        email = await getUserEmail();
    }
    
    if (!email) return 'TB';
    
    const username = email.split('@')[0];
    if (username.length >= 2) {
        return username.substring(0, 2).toUpperCase();
    } else {
        return (username[0] + 'T').toUpperCase();
    }
}

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
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
        
        return data;
    } catch (err) {
        console.error("Sign in error:", err);
        throw err;
    }
}

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

export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error("Sign out error:", error);
            throw error;
        }
        
        window.location.href = 'index.html';
    } catch (err) {
        console.error("Sign out error:", err);
        throw err;
    }
}

export async function setupUserMenu() {
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');
    const signOutButton = document.getElementById('sign-out');
    
    if (userMenuButton && userMenu) {
        const userInitials = document.getElementById('user-initials');
        if (userInitials) {
            const initials = await getUserInitials();
            userInitials.textContent = initials;
        }
        
        userMenuButton.addEventListener('click', function() {
            userMenu.classList.toggle('hidden');
        });
        
        document.addEventListener('click', function(e) {
            if (!userMenuButton.contains(e.target) && !userMenu.contains(e.target)) {
                userMenu.classList.add('hidden');
            }
        });
    }
    
    if (signOutButton) {
        signOutButton.addEventListener('click', function(e) {
            e.preventDefault();
            signOut();
        });
    }
}

export async function checkAuth(requireAuth = true) {
    const auth = await isAuthenticated();
    const onLoginPage = window.location.pathname.includes('index.html') || window.location.pathname === '/';
    
    if (requireAuth && !auth && !onLoginPage) {
        window.location.href = 'index.html';
        return false;
    } else if (auth && onLoginPage) {
        window.location.href = 'dashboard.html';
        return false;
    }
    
    return true;
}

export function getRememberedEmail() {
    return localStorage.getItem('rememberedEmail');
}

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
    
    setTimeout(hideToast, 5000);
}

export function hideToast() {
    const toastNotification = document.getElementById('toast-notification');
    if (!toastNotification) return;
    
    toastNotification.classList.add('toast-leave');
    
    setTimeout(() => {
        toastNotification.classList.add('hidden');
        toastNotification.classList.remove('toast-enter', 'toast-leave');
    }, 300);
}

export function setupToast() {
    const closeToastButton = document.getElementById('close-toast');
    if (closeToastButton) {
        closeToastButton.addEventListener('click', hideToast);
    }
    
    window.showToast = showToast;
}

export async function initAuth() {
    if (!await checkAuth()) return;
    
    await setupUserMenu();
    
    setupToast();
} 