// Meetings Component for TimeBridge
export default class MeetingsComponent {
    constructor(database) {
        this.database = database;
        this.mainContainer = document.getElementById('main-content');
        this.allMeetings = this.database.meetings || []; // Store all meetings for filtering
    }

    // Render the meetings view
    render(filteredMeetings = null) { // Accept optional filtered list
        // console.log('[MeetingsComponent.render] Using this.database.meetings:', this.database ? this.database.meetings : 'database not found'); // LOG 5
        if (!this.mainContainer) {
             console.error('[MeetingsComponent.render] Main container not found');
             return;
        }

        // Determine which meetings to display
        let meetingsToDisplay;
        let laterMeetingsToDisplay = [];
        let upcomingTitle = 'This Week'; // Default title
        let showLaterSection = true;
        
        const selectedFilter = document.getElementById('meeting-filter-select')?.value || 'all';

        if (filteredMeetings) {
            // If a pre-filtered list is provided (e.g., from dropdown change)
            meetingsToDisplay = filteredMeetings;
            showLaterSection = false; // Hide later section when specific filter is active
            // Update title based on filter
            switch (selectedFilter) {
                case 'today': upcomingTitle = "Today's Meetings"; break;
                case 'week': upcomingTitle = "This Week's Meetings"; break;
                case 'month': upcomingTitle = "This Month's Meetings"; break;
                default: upcomingTitle = "Filtered Meetings"; break;
            }
        } else {
            // Default view: Use getUpcomingMeetings and getLaterMeetings
            meetingsToDisplay = this.database.getUpcomingMeetings();
            laterMeetingsToDisplay = this.database.getLaterMeetings();
            // console.log('[MeetingsComponent.render] Filtered meetings (upcoming, later):', meetingsToDisplay, laterMeetingsToDisplay); // LOG 6
        }

        this.mainContainer.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 class="text-3xl font-bold tracking-tight">Upcoming Meetings</h1>
                        <p class="text-gray-500">View and manage your scheduled meetings</p>
                    </div>
                </div>

                <!-- Upcoming Meetings Section -->
                <div class="rounded-lg border bg-white p-6 shadow-sm">
                    <div class="mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <h2 id="upcoming-meetings-title" class="text-xl font-semibold">${upcomingTitle}</h2> 
                        
                        <div class="flex items-center gap-2">
                            <select id="meeting-filter-select" class="h-10 rounded-md border px-3 py-2 text-sm">
                                <option value="all" ${selectedFilter === 'all' ? 'selected' : ''}>All Meetings</option>
                                <option value="today" ${selectedFilter === 'today' ? 'selected' : ''}>Today</option>
                                <option value="week" ${selectedFilter === 'week' ? 'selected' : ''}>This Week</option>
                                <option value="month" ${selectedFilter === 'month' ? 'selected' : ''}>This Month</option>
                            </select>
                            
                            <button class="flex h-10 items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-filter"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                                Filter
                            </button>
                        </div>
                    </div>
                    
                    <div class="space-y-4" id="upcoming-meetings-container">
                        ${this.renderMeetingsList(meetingsToDisplay)} 
                    </div>
                </div>
                
                <!-- Later Meetings Section -->
                <div id="later-meetings-section" class="mt-8 rounded-lg border bg-white p-6 shadow-sm ${showLaterSection ? '' : 'hidden'}">
                    <h2 class="mb-4 text-xl font-semibold">Later Meetings</h2> 
                    
                    <div class="space-y-4" id="later-meetings-container">
                        ${this.renderMeetingsList(laterMeetingsToDisplay)} 
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
                        <button class="rounded-md border px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 cancel-meeting-btn">Cancel</button>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // Filter meetings based on selected dropdown value
    _filterMeetingsBySelection(filter) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const allUserMeetings = this.database.meetings || []; // Use the full list

        switch (filter) {
            case 'today':
                const endOfToday = new Date(now);
                endOfToday.setHours(23, 59, 59, 999);
                return allUserMeetings.filter(m => m.start >= now && m.start <= endOfToday && m.status !== 'canceled');
            case 'week':
                const endOfWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                endOfWeek.setHours(23, 59, 59, 999);
                return allUserMeetings.filter(m => m.start >= now && m.start <= endOfWeek && m.status !== 'canceled');
            case 'month':
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                endOfMonth.setHours(23, 59, 59, 999);
                return allUserMeetings.filter(m => m.start >= now && m.start <= endOfMonth && m.status !== 'canceled');
            case 'all':
            default:
                return null; // Indicate no filter, so render uses default sections
        }
    }

    // Setup event listeners for the meetings component
    setupEventListeners() {
        // --- Add Filter Dropdown Listener ---
        const filterSelect = document.getElementById('meeting-filter-select');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                const selectedFilter = e.target.value;
                if (selectedFilter === 'all') {
                    // Re-render with default sections
                    this.render(); 
                } else {
                    // Filter the meetings and re-render with the filtered list
                    const filtered = this._filterMeetingsBySelection(selectedFilter);
                    this.render(filtered); 
                }
            });
        }
        // --- End Filter Dropdown Listener ---

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

        // Cancel meeting button click handlers (Update status)
        document.querySelectorAll('.cancel-meeting-btn').forEach(btn => {
            // Make the listener async
            btn.addEventListener('click', async (e) => { 
                e.stopPropagation();
                const meetingCard = btn.closest('.meeting-card');
                if (!meetingCard) return;
                const meetingId = parseInt(meetingCard.dataset.meetingId);
                
                if (meetingId) {
                    console.log(`[MeetingsComponent] Cancel button clicked for ID: ${meetingId}`);
                    
                    // Call the async updateMeeting function and wait for it
                    const updatedMeeting = await this.database.updateMeeting(meetingId, { status: 'canceled' });
                    
                    // Check if the update was successful (updateMeeting returns the updated meeting or null)
                    if (updatedMeeting) { 
                        window.showToast('Meeting cancelled successfully', 'success');
                        // Re-render this component's view AFTER the update is complete
                        console.log('[MeetingsComponent] Re-rendering meetings view after cancellation.');
                        this.render(); 
                    } else {
                        // updateMeeting handles its own errors/toasts, but we can add one here if needed
                        console.error('[MeetingsComponent] Failed to cancel meeting via updateMeeting.');
                        // Optionally show a generic error toast here if updateMeeting failed silently
                        // window.showToast('Failed to cancel meeting.', 'error');
                    }
                }
            });
        });
    }
} 