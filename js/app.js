import supabase from "./supabaseClient.js";
import * as auth from "./auth.js";

async function fetchMeetings() {
    let { data: Meetings, error } = await supabase.from('Meetings').select('*');

    if (error) {
        console.error("Error fetching meetings:", error);
        return [];
    }

    console.log(Meetings);
    return Meetings;
}

async function fetchUser(){
    let { data: user, error } = await supabase.auth.getUser()

    if (error) {
        console.error("Error fetching user:", error);
        return null;
    }
    return user;
}

document.addEventListener('DOMContentLoaded', async function () {
    // Check if the user is authenticated using Supabase
    const isAuthenticated = await auth.isAuthenticated();
    
    // If on login page, don't continue with app initialization
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        if (isAuthenticated) {
            // If already authenticated and on login page, redirect to dashboard
            window.location.href = 'dashboard.html';
        }
        return; // Don't continue with app initialization on login page
    }
    
    // If not authenticated and not on login page, redirect to login
    if (!isAuthenticated) {
        window.location.href = 'index.html';
        return;
    }
    
    // Fetch meetings before initializing the database
    const meetings = await fetchMeetings();
    const user = await fetchUser();

    const mockDatabase = {
        meetings: meetings || [],

        addMeeting(meeting) {
            const newId = this.meetings.length > 0 ? Math.max(...this.meetings.map(m => m.id)) + 1 : 1;
            const newMeeting = {
                id: newId,
                ...meeting,
                status: 'pending',
                color: '#f59e0b'
            };
            this.meetings.push(newMeeting);
            return newMeeting;
        },

        updateMeeting(id, updates) {
            const index = this.meetings.findIndex(m => m.id === id);
            if (index !== -1) {
                if (updates.status === 'approved') {
                    updates.color = '#10b981';
                } else if (updates.status === 'canceled') {
                    updates.color = '#ef4444';
                }
                this.meetings[index] = { ...this.meetings[index], ...updates };
                return this.meetings[index];
            }
            return null;
        },

        getUpcomingMeetings() {
            const now = new Date();
            return this.meetings
                .filter(m => new Date(m.start) >= now && m.status !== 'canceled')
                .sort((a, b) => new Date(a.start) - new Date(b.start));
        },

        getLaterMeetings() {
            const now = new Date();
            const nextWeek = new Date(now);
            nextWeek.setDate(now.getDate() + 7);

            return this.meetings
                .filter(m => {
                    const meetingDate = new Date(m.start);
                    return meetingDate >= nextWeek && m.status !== 'canceled';
                })
                .sort((a, b) => new Date(a.start) - new Date(b.start));
        },

        getMeetingById(id) {
            return this.meetings.find(m => m.id === id);
        }
    };

    // Initialize application only after `mockDatabase` is ready
    await initApplication(mockDatabase);
    console.log('TimeBridge app initialized!');
});

// Modify `initApplication` to accept `mockDatabase`
async function initApplication(mockDatabase) {
    window.mockDatabase = mockDatabase; // Make it globally accessible if needed
    
    // Get user email from Supabase auth
    const userEmail = await auth.getUserEmail();
    
    // Check if we're on the dashboard page
    if (window.location.pathname.includes('dashboard.html')) {
        setupMainContainer();
        setupNavigation();
        loadView('dashboard');
        setupGlobalEventListeners();
        
        // Update user initials in the UI if needed
        if (userEmail) {
            const userInitials = document.getElementById('user-initials');
            if (userInitials) {
                const initials = await auth.getUserInitials(userEmail);
                userInitials.textContent = initials;
            }
        }
    }
}

// Setup the main container for dynamic content
function setupMainContainer() {
    // Check if main content container exists, if not create it
    if (!document.getElementById('main-content')) {
        const mainContent = document.createElement('div');
        mainContent.id = 'main-content';
        mainContent.className = 'flex-grow';
        
        // Find where to insert it (after nav, before footer)
        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = '';
            main.appendChild(mainContent);
        } else {
            // If no main element exists, create one
            const newMain = document.createElement('main');
            newMain.className = 'flex-grow';
            newMain.appendChild(mainContent);
            
            // Insert after nav
            const nav = document.querySelector('nav');
            if (nav) {
                nav.after(newMain);
            } else {
                // If no nav, insert as first child of body
                document.body.prepend(newMain);
            }
        }
    }
}

// Setup navigation event listeners
function setupNavigation() {
    // Dashboard link
    const dashboardLinks = document.querySelectorAll('a[href="#dashboard"]');
    dashboardLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadView('dashboard');
        });
    });
    
    // Calendar/Schedule link
    const scheduleLinks = document.querySelectorAll('a[href="#schedule"], #schedule-nav-link');
    scheduleLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadView('calendar');
        });
    });
    
    // Meetings link
    const meetingsLinks = document.querySelectorAll('a[href="#meetings"]');
    meetingsLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadView('meetings');
        });
    });
}

// Load the requested view
function loadView(viewName) {
    // Update active nav link
    updateActiveNavLink(viewName);
    
    // Load the appropriate view
    switch(viewName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'calendar':
            loadCalendar();
            break;
        case 'meetings':
            loadMeetings();
            break;
        default:
            loadDashboard();
    }
}

// Update active nav link
function updateActiveNavLink(viewName) {
    // Remove active class from all links
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('nav-active');
        link.classList.remove('border-indigo-500', 'text-gray-900');
        link.classList.add('border-transparent', 'text-gray-500', 'hover:border-gray-300', 'hover:text-gray-700');
    });
    
    // Add active class to current view link
    let selector;
    switch(viewName) {
        case 'dashboard':
            selector = 'a[href="#dashboard"]';
            break;
        case 'calendar':
            selector = 'a[href="#schedule"], #schedule-nav-link';
            break;
        case 'meetings':
            selector = 'a[href="#meetings"]';
            break;
    }
    
    if (selector) {
        document.querySelectorAll(selector).forEach(link => {
            link.classList.add('border-indigo-500', 'text-gray-900');
            link.classList.remove('border-transparent', 'text-gray-500', 'hover:border-gray-300', 'hover:text-gray-700');
        });
    }
}

// Load dashboard view
function loadDashboard() {
    // In a real app, this would be a component
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    // For now, use original dashboard content
    mainContent.innerHTML = `
        <div id="dashboard-view" class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h2>
                
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Upcoming Meetings Card -->
                    <div class="bg-white overflow-hidden shadow rounded-lg col-span-2">
                        <div class="px-4 py-5 sm:p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h3 class="text-lg font-medium text-gray-900">Upcoming Meetings</h3>
                                <span class="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                                    3 upcoming
                                </span>
                            </div>
                            <div class="space-y-3" id="upcoming-meetings-list">
                                <!-- Meetings will be loaded here -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Share Schedule Card -->
                    <div class="bg-white overflow-hidden shadow rounded-lg">
                        <div class="px-4 py-5 sm:p-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">Share Your Schedule</h3>
                            <p class="text-sm text-gray-500 mb-4">Allow others to book time with you by sharing your schedule link.</p>
                            <div class="relative mt-1 flex items-center">
                                <input type="text" disabled class="form-input block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" value="https://TimeBridge.example/u/johndoe">
                                <button id="copy-schedule-link" class="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    <i class="fa-regular fa-copy mr-2"></i> Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Load meetings data
    loadUpcomingMeetings();
    setupCopyScheduleLink();
}

// Load calendar view using the Calendar component
function loadCalendar() {
    // Create and render the Calendar component
    const calendarComponent = new CalendarComponent(mockDatabase);
    calendarComponent.render();
}

// Load meetings view using the Meetings component
function loadMeetings() {
    // Create and render the Meetings component
    const meetingsComponent = new MeetingsComponent(mockDatabase);
    meetingsComponent.render();
}

// Setup global event listeners
function setupGlobalEventListeners() {
    // Modal close buttons
    document.getElementById('close-modal')?.addEventListener('click', hideModal);
    document.getElementById('approve-meeting')?.addEventListener('click', approveMeeting);
    document.getElementById('reschedule-meeting')?.addEventListener('click', rescheduleMeeting);
    document.getElementById('cancel-meeting')?.addEventListener('click', cancelMeeting);
    
    // Toast close button
    document.getElementById('close-toast')?.addEventListener('click', hideToast);
}

// Initialize FullCalendar
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        slotMinTime: '08:00:00',
        slotMaxTime: '20:00:00',
        allDaySlot: false,
        height: '700px',
        events: mockDatabase.meetings,
        eventClick: function(info) {
            showMeetingModal(info.event.extendedProps.id || parseInt(info.event.id));
        },
        dateClick: function(info) {
            // Could open a "create meeting" modal here
            console.log('Clicked on date:', info.dateStr);
        },
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
        }
    });

    calendar.render();
    
    // Store calendar instance for later use
    window.calendar = calendar;
}

// Load upcoming meetings in the dashboard
function loadUpcomingMeetings() {
    const meetingsList = document.getElementById('upcoming-meetings-list');
    if (!meetingsList) return;
    
    const upcomingMeetings = mockDatabase.getUpcomingMeetings();
    
    if (upcomingMeetings.length === 0) {
        meetingsList.innerHTML = '<p class="text-gray-500 text-center py-4">No upcoming meetings</p>';
        return;
    }
    
    meetingsList.innerHTML = upcomingMeetings.map(meeting => {
        const meetingDate = new Date(meeting.start);
        const formattedDate = meetingDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        const formattedTime = meetingDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit'
        });
        
        return `
            <div class="meeting-card ${meeting.status} bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-medium text-gray-900">${meeting.title}</h4>
                        <p class="text-sm text-gray-500 mt-1">
                            <i class="far fa-clock mr-1"></i> ${formattedDate}, ${formattedTime}
                        </p>
                        <p class="text-sm text-gray-500 mt-1">
                            <i class="far fa-user mr-1"></i> ${meeting.requesterName}
                        </p>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        meeting.status === 'approved' ? 'bg-green-100 text-green-800' : 
                        meeting.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                    }">
                        ${meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                    </span>
                </div>
                <div class="mt-3 flex justify-end space-x-2">
                    <button class="text-xs text-indigo-600 hover:text-indigo-500" 
                            onclick="showMeetingModal(${meeting.id})">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Update counter
    const counter = document.querySelector('.bg-indigo-100.text-indigo-800');
    if (counter) {
        counter.textContent = `${upcomingMeetings.length} upcoming`;
    }
}

// Setup copy schedule link functionality
function setupCopyScheduleLink() {
    const copyButton = document.getElementById('copy-schedule-link');
    if (!copyButton) return;
    
    copyButton.addEventListener('click', function() {
        const linkInput = this.parentElement.querySelector('input');
        if (!linkInput) return;
        
        // Copy to clipboard
        navigator.clipboard.writeText(linkInput.value).then(function() {
            showToast('Schedule link copied to clipboard!', 'success');
        }).catch(function() {
            showToast('Failed to copy link. Please try again.', 'error');
        });
    });
}

// Show meeting details modal
function showMeetingModal(meetingId) {
    const meeting = mockDatabase.meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    const modal = document.getElementById('meeting-modal');
    const meetingDetails = document.getElementById('meeting-details');
    const modalTitle = document.getElementById('modal-title');
    
    if (!modal || !meetingDetails || !modalTitle) return;
    
    // Set modal title based on meeting status
    if (meeting.status === 'pending') {
        modalTitle.textContent = 'Meeting Request';
    } else {
        modalTitle.textContent = 'Meeting Details';
    }
    
    // Format dates
    const startDate = new Date(meeting.start);
    const endDate = new Date(meeting.end);
    const formattedDate = startDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const formattedStartTime = startDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
    const formattedEndTime = endDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit'
    });
    
    // Set meeting details content
    meetingDetails.innerHTML = `
        <div class="space-y-4">
            <div>
                <p class="text-sm font-medium text-gray-500">Title</p>
                <p class="mt-1 text-sm text-gray-900">${meeting.title}</p>
            </div>
            <div>
                <p class="text-sm font-medium text-gray-500">Date & Time</p>
                <p class="mt-1 text-sm text-gray-900">${formattedDate}</p>
                <p class="mt-1 text-sm text-gray-900">${formattedStartTime} - ${formattedEndTime}</p>
            </div>
            <div>
                <p class="text-sm font-medium text-gray-500">Requested by</p>
                <p class="mt-1 text-sm text-gray-900">${meeting.requesterName}</p>
                <p class="mt-1 text-sm text-gray-900">${meeting.requesterEmail}</p>
            </div>
            ${meeting.description ? `
            <div>
                <p class="text-sm font-medium text-gray-500">Description</p>
                <p class="mt-1 text-sm text-gray-900">${meeting.description}</p>
            </div>` : ''}
            <div>
                <p class="text-sm font-medium text-gray-500">Status</p>
                <p class="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    meeting.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    meeting.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                }">
                    ${meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                </p>
            </div>
        </div>
    `;
    
    // Show/hide action buttons based on status
    const approveBtn = document.getElementById('approve-meeting');
    const rescheduleBtn = document.getElementById('reschedule-meeting');
    const cancelBtn = document.getElementById('cancel-meeting');
    
    if (approveBtn && rescheduleBtn && cancelBtn) {
        if (meeting.status === 'pending') {
            approveBtn.style.display = 'block';
            rescheduleBtn.style.display = 'block';
            cancelBtn.style.display = 'block';
            
            // Store the meeting ID on the buttons for the action handlers
            approveBtn.dataset.meetingId = meeting.id;
            rescheduleBtn.dataset.meetingId = meeting.id;
            cancelBtn.dataset.meetingId = meeting.id;
        } else {
            approveBtn.style.display = 'none';
            rescheduleBtn.style.display = 'none';
            cancelBtn.style.display = meeting.status !== 'canceled' ? 'block' : 'none';
            
            if (meeting.status !== 'canceled') {
                cancelBtn.dataset.meetingId = meeting.id;
            }
        }
    }
    
    // Show the modal
    modal.classList.remove('hidden');
    modal.classList.add('fade-in');
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideModal();
        }
    });
}

// Hide meeting modal
function hideModal() {
    const modal = document.getElementById('meeting-modal');
    if (!modal) return;
    
    modal.classList.add('hidden');
    modal.classList.remove('fade-in');
}

// Approve meeting
function approveMeeting() {
    const approveBtn = document.getElementById('approve-meeting');
    if (!approveBtn || !approveBtn.dataset.meetingId) return;
    
    const meetingId = parseInt(approveBtn.dataset.meetingId);
    const updatedMeeting = mockDatabase.updateMeeting(meetingId, { status: 'approved' });
    
    if (updatedMeeting) {
        // Simulate sending email notification
        sendEmailNotification(updatedMeeting, 'approved');
        
        // Update UI
        hideModal();
        refreshCalendar();
        loadUpcomingMeetings();
        showToast('Meeting approved successfully!', 'success');
    }
}

// Reschedule meeting
function rescheduleMeeting() {
    // In a real app, this would open a reschedule dialog
    // For this demo, we'll just show a toast message
    hideModal();
    showToast('Reschedule functionality would open a dialog', 'info');
}

// Cancel meeting
function cancelMeeting() {
    const cancelBtn = document.getElementById('cancel-meeting');
    if (!cancelBtn || !cancelBtn.dataset.meetingId) return;
    
    const meetingId = parseInt(cancelBtn.dataset.meetingId);
    const updatedMeeting = mockDatabase.updateMeeting(meetingId, { status: 'canceled' });
    
    if (updatedMeeting) {
        // Simulate sending email notification
        sendEmailNotification(updatedMeeting, 'canceled');
        
        // Update UI
        hideModal();
        refreshCalendar();
        loadUpcomingMeetings();
        showToast('Meeting canceled successfully!', 'success');
    }
}

// Simulated email notification
function sendEmailNotification(meeting, action) {
    console.log(`[EMAIL NOTIFICATION] Meeting "${meeting.title}" has been ${action}.`);
    console.log(`To: ${meeting.requesterEmail}`);
    console.log(`Subject: Meeting ${action.charAt(0).toUpperCase() + action.slice(1)}: ${meeting.title}`);
    
    // In a real app, this would call an API endpoint to send emails
}

// Refresh calendar events
function refreshCalendar() {
    if (!window.calendar) return;
    
    // Remove all events
    window.calendar.getEvents().forEach(event => event.remove());
    
    // Add updated events
    mockDatabase.meetings.forEach(meeting => {
        window.calendar.addEvent({
            id: meeting.id,
            title: meeting.title,
            start: meeting.start,
            end: meeting.end,
            color: meeting.color,
            extendedProps: {
                id: meeting.id,
                requesterName: meeting.requesterName,
                requesterEmail: meeting.requesterEmail,
                description: meeting.description,
                status: meeting.status
            }
        });
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    
    if (!toast || !toastMessage || !toastIcon) return;
    
    // Set message
    toastMessage.textContent = message;
    
    // Set appropriate icon and color based on type
    if (type === 'success') {
        toastIcon.className = 'fa-solid fa-check-circle text-green-500 text-xl';
    } else if (type === 'error') {
        toastIcon.className = 'fa-solid fa-times-circle text-red-500 text-xl';
    } else if (type === 'info') {
        toastIcon.className = 'fa-solid fa-info-circle text-blue-500 text-xl';
    } else if (type === 'warning') {
        toastIcon.className = 'fa-solid fa-exclamation-circle text-yellow-500 text-xl';
    }
    
    // Show toast
    toast.classList.remove('hidden');
    toast.classList.add('toast-enter');
    
    // Auto-hide after 5 seconds
    setTimeout(hideToast, 5000);
}

// Hide toast notification
function hideToast() {
    const toast = document.getElementById('toast-notification');
    if (!toast || toast.classList.contains('hidden')) return;
    
    toast.classList.add('toast-leave');
    
    // Wait for animation to complete before hiding
    setTimeout(() => {
        toast.classList.add('hidden');
        toast.classList.remove('toast-enter', 'toast-leave');
    }, 300);
}

// Expose necessary functions to the global scope
window.showMeetingModal = showMeetingModal;
window.hideModal = hideModal;
window.approveMeeting = approveMeeting;
window.rescheduleMeeting = rescheduleMeeting;
window.cancelMeeting = cancelMeeting;
window.showToast = showToast; 