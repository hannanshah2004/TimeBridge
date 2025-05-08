import supabase from "./supabaseClient.js";
import * as auth from "./auth.js";
import WeatherComponent from './components/weather.js';
import CalendarComponent from './components/calendar.js';
import MeetingsComponent from './components/meetings.js';

async function fetchMeetings() {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("Error fetching user or no user logged in for fetching meetings:", userError);
        return []; 
    }
    const userUuid = user.id;
    console.log(`Fetching meetings for user UUID: ${userUuid}`);

    let { data: meetingsData, error: meetingsError } = await supabase
        .from('Meetings')
        .select('*')
        .eq('uuid', userUuid);

    if (meetingsError) {
        console.error("Error fetching meetings:", meetingsError);
        return [];
    }

    const meetings = meetingsData.map(meeting => ({
        ...meeting,
        start: new Date(meeting.start),
        end: new Date(meeting.end)
    }));

    console.log("Fetched and processed meetings for user:", meetings);
    return meetings;
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
    const isAuthenticated = await auth.isAuthenticated();
    
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        if (isAuthenticated) {
            window.location.href = 'dashboard.html';
        }
        return; 
    }
    
    if (!isAuthenticated) {
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Attempting to fetch meetings...');
    const meetings = await fetchMeetings();
    console.log('Meetings fetched in DOMContentLoaded:', meetings);
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

        async updateMeeting(id, updates) {
            const supabaseUpdates = { ...updates };
            if (updates.status === 'approved') {
                supabaseUpdates.color = '#10b981';
            } else if (updates.status === 'canceled') {
                supabaseUpdates.color = '#ef4444';
            }
            
            try {
                const { data, error } = await supabase
                    .from('Meetings')
                    .update(supabaseUpdates)
                    .eq('id', id)
                    .select();

                if (error) {
                    console.error('Error updating meeting in Supabase:', error);
                    throw error;
                }

                const index = this.meetings.findIndex(m => m.id === id);
                if (index !== -1 && data && data.length > 0) {
                    this.meetings[index] = {
                         ...data[0],
                         start: new Date(data[0].start),
                         end: new Date(data[0].end)
                    };
                    console.log('Updated meeting locally:', this.meetings[index]);
                    return this.meetings[index];
                } else {
                     console.warn('Meeting not found locally after Supabase update, or no data returned', id);
                     return null;
                }
            } catch (error) {
                console.error('Failed to update meeting:', error);
                return null;
            }
        },

        getUpcomingMeetings() {
            const now = new Date();
            const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            sevenDaysFromNow.setHours(23, 59, 59, 999);
            now.setHours(0, 0, 0, 0);

            console.log(`[getUpcomingMeetings] Filtering between ${now.toISOString()} and ${sevenDaysFromNow.toISOString()}`);
            return this.meetings
                .filter(m => {
                    const isUpcoming = m.start >= now && m.start <= sevenDaysFromNow;
                    const isNotCanceled = m.status !== 'canceled';
                    return isUpcoming && isNotCanceled;
                })
                .sort((a, b) => a.start - b.start);
        },

        getLaterMeetings() {
            const now = new Date();
            const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            sevenDaysFromNow.setHours(0, 0, 0, 0);

            console.log(`[getLaterMeetings] Filtering for dates after ${sevenDaysFromNow.toISOString()}`);
            return this.meetings
                .filter(m => {
                    const isLater = m.start > sevenDaysFromNow;
                    const isNotCanceled = m.status !== 'canceled';
                    return isLater && isNotCanceled;
                })
                .sort((a, b) => a.start - b.start);
        },

        getMeetingById(id) {
            return this.meetings.find(m => m.id === id);
        }
    };
    console.log('mockDatabase initialized with meetings:', mockDatabase.meetings);

    await initApplication(mockDatabase);
    console.log('TimeBridge app initialized!');
});

async function initApplication(mockDatabase) {
    window.mockDatabase = mockDatabase;
    
    const userEmail = await auth.getUserEmail();
    
    if (window.location.pathname.includes('dashboard.html')) {
        setupMainContainer();
        setupNavigation();
        
        await auth.setupUserMenu();
        
        loadView('dashboard');
        setupGlobalEventListeners();
    }
}

// Setup the main container for dynamic content
function setupMainContainer() {
    if (!document.getElementById('main-content')) {
        const mainContent = document.createElement('div');
        mainContent.id = 'main-content';
        mainContent.className = 'flex-grow';
        
        const main = document.querySelector('main');
        if (main) {
            main.innerHTML = '';
            main.appendChild(mainContent);
        } else {
            const newMain = document.createElement('main');
            newMain.className = 'flex-grow';
            newMain.appendChild(mainContent);
            
            const nav = document.querySelector('nav');
            if (nav) {
                nav.after(newMain);
            } else {
                document.body.prepend(newMain);
            }
        }
    }
}

// Setup navigation event listeners
function setupNavigation() {
    const dashboardLinks = document.querySelectorAll('a[href="#dashboard"]');
    dashboardLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadView('dashboard');
        });
    });
    
    const scheduleLinks = document.querySelectorAll('a[href="#schedule"], #schedule-nav-link');
    scheduleLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            loadView('calendar');
        });
    });
    
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
    updateActiveNavLink(viewName);
    
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
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('nav-active');
        link.classList.remove('border-indigo-500', 'text-gray-900');
        link.classList.add('border-transparent', 'text-gray-500', 'hover:border-gray-300', 'hover:text-gray-700');
    });
    
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

function loadDashboard() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <div id="dashboard-view" class="py-6">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 class="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h2>
                
                <!-- Weather Widget Container -->
                <div id="weather-container" class="mb-6">
                    <!-- Weather content will be loaded here by JS -->
                </div>
                
                <!-- Upcoming Meetings Card (Full Width) -->
                <div class="bg-white overflow-hidden shadow rounded-lg">
                    <div class="px-4 py-5 sm:p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="text-lg font-medium text-gray-900">Upcoming Meetings</h3>
                            <span class="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800" id="upcoming-meetings-count">
                                Loading...
                            </span>
                        </div>
                        <div class="space-y-3" id="upcoming-meetings-list">
                            <!-- Meetings will be loaded here -->
                        </div>
                    </div>
                </div>
                
                <!-- REMOVED Share Schedule Card -->
                
            </div>
        </div>
    `;
    
    const weatherContainer = document.getElementById('weather-container');
    if (weatherContainer) {
        const weatherWidget = new WeatherComponent(weatherContainer);
        weatherWidget.init();
    } else {
        console.error('Weather container not found after loading dashboard view.');
    }
    
    loadUpcomingMeetings();
}

function loadCalendar() {
    const calendarComponent = new CalendarComponent(mockDatabase);
    calendarComponent.render();
    calendarComponent.setupEventListeners();
}

function loadMeetings() {
    const meetingsComponent = new MeetingsComponent(mockDatabase);
    meetingsComponent.render();
    if (typeof meetingsComponent.setupEventListeners === 'function') {
        meetingsComponent.setupEventListeners();
    }
}

function setupGlobalEventListeners() {
    document.getElementById('close-modal')?.addEventListener('click', hideModal);
    document.getElementById('approve-meeting')?.addEventListener('click', approveMeeting);
    document.getElementById('reschedule-meeting')?.addEventListener('click', rescheduleMeeting);
    document.getElementById('cancel-meeting')?.addEventListener('click', cancelMeeting);
    
    document.getElementById('close-toast')?.addEventListener('click', hideToast);
}

function loadUpcomingMeetings() {
    console.log('[loadUpcomingMeetings] Using mockDatabase.meetings:', window.mockDatabase ? window.mockDatabase.meetings : 'mockDatabase not found'); // LOG 3
    const meetingsList = document.getElementById('upcoming-meetings-list');
    const countSpan = document.getElementById('upcoming-meetings-count');
    
    if (!meetingsList || !countSpan) {
        console.error('[loadUpcomingMeetings] UI elements not found');
        return;
    }
    
    const upcomingMeetings = window.mockDatabase.getUpcomingMeetings();
    console.log('[loadUpcomingMeetings] Filtered upcoming meetings:', upcomingMeetings);
    
    if (upcomingMeetings.length === 0) {
        meetingsList.innerHTML = '<p class="text-gray-500 text-center py-4">No upcoming meetings</p>';
        countSpan.textContent = '0 upcoming';
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
    
    countSpan.textContent = `${upcomingMeetings.length} upcoming`;
}

function showMeetingModal(meetingId) {
    const meeting = mockDatabase.meetings.find(m => m.id === meetingId);
    if (!meeting) return;
    
    const modal = document.getElementById('meeting-modal');
    const meetingDetails = document.getElementById('meeting-details');
    const modalTitle = document.getElementById('modal-title');
    
    if (!modal || !meetingDetails || !modalTitle) return;
    
    if (meeting.status === 'pending') {
        modalTitle.textContent = 'Meeting Request';
    } else {
        modalTitle.textContent = 'Meeting Details';
    }
    
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
    
    const approveBtn = document.getElementById('approve-meeting');
    const rescheduleBtn = document.getElementById('reschedule-meeting');
    const cancelBtn = document.getElementById('cancel-meeting');
    
    if (approveBtn && rescheduleBtn && cancelBtn) {
        if (meeting.status === 'pending') {
            approveBtn.style.display = 'block';
            rescheduleBtn.style.display = 'block';
            cancelBtn.style.display = 'block';
            
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
    
    modal.classList.remove('hidden');
    modal.classList.add('fade-in');
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hideModal();
        }
    });
}

function hideModal() {
    const modal = document.getElementById('meeting-modal');
    if (!modal) return;
    
    modal.classList.add('hidden');
    modal.classList.remove('fade-in');
}

async function approveMeeting() {
    const approveBtn = document.getElementById('approve-meeting');
    if (!approveBtn || !approveBtn.dataset.meetingId) return;
    
    const meetingId = parseInt(approveBtn.dataset.meetingId);
    try {
        const updatedMeeting = await mockDatabase.updateMeeting(meetingId, { status: 'approved' });
        
        if (updatedMeeting) {
            sendEmailNotification(updatedMeeting, 'approved');
            
            hideModal();
            refreshCalendar();
            loadUpcomingMeetings();
            showToast('Meeting approved successfully!', 'success');
        } else {
             showToast('Failed to approve meeting. Please try again.', 'error');
        }
    } catch (error) {
         showToast(`Error approving meeting: ${error.message}`, 'error');
    }
}

function rescheduleMeeting() {
    hideModal();
    showToast('Reschedule functionality would open a dialog', 'info');
}

async function cancelMeeting() {
    const cancelBtn = document.getElementById('cancel-meeting');
    if (!cancelBtn || !cancelBtn.dataset.meetingId) return;
    
    const meetingId = parseInt(cancelBtn.dataset.meetingId);
    console.log(`Attempting to delete meeting with ID: ${meetingId}`);

    try {
        const { error } = await supabase
            .from('Meetings')
            .delete()
            .eq('id', meetingId);

        if (error) {
            console.error('Supabase delete error:', error);
            throw error;
        }

        console.log(`Successfully deleted meeting ID: ${meetingId} from Supabase.`);
        
        const index = window.mockDatabase.meetings.findIndex(m => m.id === meetingId);
        if (index !== -1) {
            const deletedMeeting = window.mockDatabase.meetings.splice(index, 1)[0];
            console.log('Removed meeting from local cache:', deletedMeeting);
        } else {
            console.warn(`Meeting ID: ${meetingId} not found in local cache after deletion.`);
        }
        
        hideModal();
        refreshCalendar();
        loadUpcomingMeetings();
        showToast('Meeting deleted successfully!', 'success');

    } catch (error) {
         console.error('Error deleting meeting:', error);
         showToast(`Error deleting meeting: ${error.message || 'Unknown error'}`, 'error');
    }
}

function refreshCalendar() {
    if (!window.calendar) return;
    
    window.calendar.getEvents().forEach(event => event.remove());
    
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

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    const toastMessage = document.getElementById('toast-message');
    const toastIcon = document.getElementById('toast-icon');
    
    if (!toast || !toastMessage || !toastIcon) return;
    
    toastMessage.textContent = message;
    
    if (type === 'success') {
        toastIcon.className = 'fa-solid fa-check-circle text-green-500 text-xl';
    } else if (type === 'error') {
        toastIcon.className = 'fa-solid fa-times-circle text-red-500 text-xl';
    } else if (type === 'info') {
        toastIcon.className = 'fa-solid fa-info-circle text-blue-500 text-xl';
    } else if (type === 'warning') {
        toastIcon.className = 'fa-solid fa-exclamation-circle text-yellow-500 text-xl';
    }
    
    toast.classList.remove('hidden');
    toast.classList.add('toast-enter');
    
    setTimeout(hideToast, 5000);
}

function hideToast() {
    const toast = document.getElementById('toast-notification');
    if (!toast || toast.classList.contains('hidden')) return;
    
    toast.classList.add('toast-leave');
    
    setTimeout(() => {
        toast.classList.add('hidden');
        toast.classList.remove('toast-enter', 'toast-leave');
    }, 300);
}

window.showMeetingModal = showMeetingModal;
window.hideModal = hideModal;
window.approveMeeting = approveMeeting;
window.rescheduleMeeting = rescheduleMeeting;
window.cancelMeeting = cancelMeeting;
window.showToast = showToast; 