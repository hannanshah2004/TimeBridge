// Meetings Component for TimeBridge
class MeetingsComponent {
    constructor(database) {
        this.database = database;
        this.mainContainer = document.getElementById('main-content');
    }

    // Render the meetings view
    render() {
        if (!this.mainContainer) return;

        const upcomingMeetings = this.database.getUpcomingMeetings();
        const laterMeetings = this.database.getLaterMeetings();
        
        this.mainContainer.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 class="text-3xl font-bold tracking-tight">Upcoming Meetings</h1>
                        <p class="text-gray-500">View and manage your scheduled meetings</p>
                    </div>

                    <div class="flex items-center gap-2">
                        <div class="relative">
                            <button class="copy-link group relative flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                <span>Copy My Schedule Link</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c0-1.1.9-2 2-2h2"/><path d="M4 12c0-1.1.9-2 2-2h2"/><path d="M4 8c0-1.1.9-2 2-2h2"/></svg>
                                
                                <span class="copy-tooltip absolute -bottom-8 left-1/2 -translate-x-1/2 transform rounded bg-black px-2 py-1 text-xs text-white">
                                    Link copied!
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Upcoming Meetings Section -->
                <div class="rounded-lg border bg-white p-6 shadow-sm">
                    <div class="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <h2 class="text-xl font-semibold">This Week</h2>
                        
                        <div class="flex items-center gap-2">
                            <select class="h-10 rounded-md border px-3 py-2 text-sm">
                                <option>All Meetings</option>
                                <option>Today</option>
                                <option>This Week</option>
                                <option>This Month</option>
                            </select>
                            
                            <button class="flex h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-filter"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                                Filter
                            </button>
                        </div>
                    </div>
                    
                    <div class="space-y-4" id="upcoming-meetings-container">
                        ${this.renderMeetingsList(upcomingMeetings)}
                    </div>
                </div>
                
                <!-- Later Meetings Section -->
                <div class="mt-8 rounded-lg border bg-white p-6 shadow-sm">
                    <h2 class="mb-4 text-xl font-semibold">Later This Month</h2>
                    
                    <div class="space-y-4" id="later-meetings-container">
                        ${this.renderMeetingsList(laterMeetings)}
                    </div>
                </div>
            </div>
        `;

        // Setup event listeners after rendering
        this.setupEventListeners();
    }

    // Render meetings list into cards
    renderMeetingsList(meetings) {
        if (!meetings || meetings.length === 0) {
            return '<p class="text-center text-gray-500 py-4">No meetings found</p>';
        }

        return meetings.map(meeting => {
            const startDate = new Date(meeting.start);
            const endDate = new Date(meeting.end);
            
            // Format date display
            let dateDisplay = 'Today';
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            
            if (startDate.toDateString() === tomorrow.toDateString()) {
                dateDisplay = 'Tomorrow';
            } else if (startDate.toDateString() !== today.toDateString()) {
                dateDisplay = startDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                });
            }
            
            // Format time
            const startTime = startDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
            const endTime = endDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
            
            // Format status
            const statusClass = meeting.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              meeting.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800';
            
            // Generate meeting card HTML
            return `
                <div class="rounded-lg border p-4 shadow-sm meeting-card" data-meeting-id="${meeting.id}">
                    <div class="mb-3 flex items-start justify-between">
                        <h3 class="font-medium">${meeting.title}</h3>
                        <span class="rounded-full ${statusClass} px-2 py-1 text-xs font-medium">
                            ${meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                        </span>
                    </div>
                    
                    <div class="mb-3 space-y-1 text-sm">
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                            <span>${dateDisplay}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            <span>${startTime} - ${endTime}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            <span>${meeting.requesterName || "You"}${meeting.attendees ? `, ${meeting.attendees}` : ""}</span>
                        </div>
                    </div>
                    
                    ${meeting.status !== 'canceled' ? `
                    <div class="flex gap-2">
                        <button class="flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 join-meeting-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-video"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>
                            Join Meeting
                        </button>
                        <button class="rounded-md border px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 cancel-meeting-btn">Cancel</button>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // Setup event listeners for the meetings component
    setupEventListeners() {
        // Meeting card click handlers
        document.querySelectorAll('.meeting-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Ignore clicks on buttons
                if (e.target.closest('button')) return;
                
                const meetingId = parseInt(card.dataset.meetingId);
                if (meetingId) {
                    window.showMeetingModal(meetingId);
                }
            });
        });

        // Join meeting button click handlers
        document.querySelectorAll('.join-meeting-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                // In a real app, this would launch the meeting
                window.showToast('Joining meeting...', 'info');
            });
        });

        // Cancel meeting button click handlers
        document.querySelectorAll('.cancel-meeting-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const meetingId = parseInt(btn.closest('.meeting-card').dataset.meetingId);
                if (meetingId) {
                    // Use the existing cancel meeting function
                    const cancelled = this.database.updateMeeting(meetingId, { status: 'canceled' });
                    if (cancelled) {
                        window.showToast('Meeting cancelled successfully', 'success');
                        // Refresh the meetings view
                        this.render();
                    }
                }
            });
        });

        // Copy schedule link functionality
        const copyBtn = document.querySelector('.copy-link');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText('https://TimeBridge.example/u/johndoe')
                    .then(() => {
                        window.showToast('Schedule link copied to clipboard!', 'success');
                    })
                    .catch(() => {
                        window.showToast('Failed to copy link', 'error');
                    });
            });
        }
    }
}

// Export the component
window.MeetingsComponent = MeetingsComponent; 