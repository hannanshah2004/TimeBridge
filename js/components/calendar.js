// Calendar Component for TimeBridge
class CalendarComponent {
    constructor(database) {
        this.database = database;
        this.mainContainer = document.getElementById('main-content');
        this.selectedDate = new Date();
        this.selectedTime = null;
    }

    render() {
        if (!this.mainContainer) return;

        this.mainContainer.innerHTML = `
            <div class="container mx-auto px-4 py-8">
                <div class="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 class="text-3xl font-bold tracking-tight">Calendar</h1>
                        <p class="text-gray-500">Schedule new meetings and manage your availability</p>
                    </div>

                    <div class="flex items-center gap-2">
                        <div class="relative">
                            <button class="copy-link group relative flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                <span>Share My Schedule</span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c0-1.1.9-2 2-2h2"/><path d="M4 12c0-1.1.9-2 2-2h2"/><path d="M4 8c0-1.1.9-2 2-2h2"/></svg>
                                
                                <span class="copy-tooltip absolute -bottom-8 left-1/2 -translate-x-1/2 transform rounded bg-black px-2 py-1 text-xs text-white">
                                    Link copied!
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Calendar Section -->
                <div class="rounded-lg border bg-white p-6 shadow-sm">
                    <div class="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <h2 class="text-xl font-semibold">Select Date & Time</h2>
                        
                        <div class="flex items-center gap-2">
                            <button id="prev-month" class="flex h-8 items-center justify-center rounded-md border px-3 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
                                <span class="sr-only">Previous Month</span>
                            </button>
                            
                            <select id="month-selector" class="h-10 rounded-md border px-3 py-2">
                                ${this.generateMonthOptions()}
                            </select>
                            
                            <button id="next-month" class="flex h-8 items-center justify-center rounded-md border px-3 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
                                <span class="sr-only">Next Month</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <!-- Calendar -->
                        <div class="rounded-lg border p-4">
                            <div class="mb-4 grid grid-cols-7 gap-1 text-center text-sm font-medium">
                                <div>Sun</div>
                                <div>Mon</div>
                                <div>Tue</div>
                                <div>Wed</div>
                                <div>Thu</div>
                                <div>Fri</div>
                                <div>Sat</div>
                            </div>
                            
                            <div class="grid grid-cols-7 gap-1" id="calendar-days">
                                ${this.renderCalendarDays()}
                            </div>
                        </div>
                        
                        <!-- Time slots -->
                        <div class="rounded-lg border p-4">
                            <h3 class="mb-4 text-lg font-medium">Available Times (${this.formatSelectedDate()})</h3>
                            
                            <div class="grid grid-cols-2 gap-2 sm:grid-cols-3" id="time-slots">
                                ${this.renderTimeSlots()}
                            </div>
                            
                            <div class="mt-6">
                                <button id="schedule-btn" class="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                    Schedule Meeting
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Meeting details form -->
                    <div class="mt-6 rounded-lg border p-6" id="meeting-details-form">
                        <h3 class="mb-4 text-lg font-medium">Meeting Details</h3>
                        
                        <form class="space-y-4" id="meeting-form">
                            <div>
                                <label for="name" class="mb-1 block text-sm font-medium">Your Name</label>
                                <input 
                                    type="text" 
                                    id="name" 
                                    class="w-full rounded-md border px-3 py-2"
                                    placeholder="Enter your name"
                                />
                            </div>
                            
                            <div>
                                <label for="email" class="mb-1 block text-sm font-medium">Email Address</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    class="w-full rounded-md border px-3 py-2"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label for="attendees-email" class="mb-1 block text-sm font-medium">Attendee Email(s)</label>
                                <input 
                                    type="text" 
                                    id="attendees-email" 
                                    class="w-full rounded-md border px-3 py-2"
                                    placeholder="a@example.com, b@example.com"
                                />
                            </div>
                            
                            <div>
                                <label for="purpose" class="mb-1 block text-sm font-medium">Meeting Purpose</label>
                                <textarea 
                                    id="purpose" 
                                    rows="3"
                                    class="w-full rounded-md border px-3 py-2"
                                    placeholder="Briefly describe the purpose of this meeting"
                                ></textarea>
                            </div>
                            
                            <div class="pt-2">
                                <button type="submit" class="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                    Confirm Meeting Request
                                </button>
                                <p class="mt-2 text-center text-sm text-gray-500">
                                    You'll receive an email confirmation once the host approves
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;}
    
    getDayName(dayOffset) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + dayOffset);
        return days[futureDate.getDay()];
    }
    // Generate month options for the dropdown
    generateMonthOptions() {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        
        // Generate options for the current month and next 11 months
        let options = '';
        for (let i = 0; i < 12; i++) {
            const monthIndex = (currentDate.getMonth() + i) % 12;
            const year = currentYear + Math.floor((currentDate.getMonth() + i) / 12);
            const selected = monthIndex === this.selectedDate.getMonth() && year === this.selectedDate.getFullYear() ? 'selected' : '';
            
            options += `<option value="${monthIndex},${year}" ${selected}>${months[monthIndex]} ${year}</option>`;
        }
        
        return options;
    }

    // Render calendar days for the selected month
    renderCalendarDays() {
        const year = this.selectedDate.getFullYear();
        const month = this.selectedDate.getMonth();
        
        // Get the first day of the month and the total days in the month
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        // Get busy days from the database
        const busyDays = this.getBusyDays(year, month);
        
        let calendarHTML = '';
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            calendarHTML += '<div class="h-10 rounded-md p-1"></div>';
        }
        
        // Add calendar days
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = this.isToday(year, month, day);
            const isSelected = this.isSelectedDay(year, month, day);
            const isBusy = busyDays.includes(day);
            
            const classes = [
                'calendar-day',
                'flex h-10 cursor-pointer items-center justify-center rounded-md p-1 text-sm',
                isSelected ? 'selected' : 'hover:bg-gray-100',
                isBusy ? 'busy relative' : ''
            ].join(' ');
            
            calendarHTML += `<div class="${classes}" data-date="${year}-${month+1}-${day}">${day}</div>`;
        }
        
        return calendarHTML;
    }

    // Render time slots for the selected date
    renderTimeSlots() {
        // In a real app, available times would come from the database
        // Here we'll simulate some busy times
        const busyTimes = ['10:00 AM', '2:00 PM', '3:30 PM'];
        
        // Generate time slots from 9 AM to 5 PM in 30-minute increments
        const timeSlots = [];
        const startHour = 9;
        const endHour = 17;
        
        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute of [0, 30]) {
                const time = new Date();
                time.setHours(hour, minute, 0, 0);
                
                const formattedTime = time.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                
                const isBusy = busyTimes.includes(formattedTime);
                const isSelected = this.selectedTime === formattedTime;
                
                timeSlots.push({
                    time: formattedTime,
                    isBusy,
                    isSelected
                });
            }
        }
        
        // Generate HTML for time slots
        return timeSlots.map(slot => {
            const classes = [
                'flex justify-start rounded-md',
                'px-3 py-2 text-sm',
                slot.isSelected ? 'bg-blue-600 text-white' : 'border hover:bg-gray-100',
                slot.isBusy ? 'opacity-50' : ''
            ].join(' ');
            
            return `
                <button 
                    class="${classes}" 
                    data-time="${slot.time}" 
                    ${slot.isBusy ? 'disabled' : ''}
                >
                    ${slot.time}
                </button>
            `;
        }).join('');
    }

    // Format the selected date for display
    formatSelectedDate() {
        return this.selectedDate.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Check if a date is today
    isToday(year, month, day) {
        const today = new Date();
        return today.getFullYear() === year && 
               today.getMonth() === month && 
               today.getDate() === day;
    }

    // Check if a date is the selected date
    isSelectedDay(year, month, day) {
        return this.selectedDate.getFullYear() === year && 
               this.selectedDate.getMonth() === month && 
               this.selectedDate.getDate() === day;
    }

    // Get busy days from the database
    getBusyDays(year, month) {
        // In a real app, this would query the database for days with meetings
        // For this example, we'll simulate some busy days
        return [4, 10, 15, 22, 28];
    }

    // Setup event listeners for the calendar component
    setupEventListeners() {
        const copyBtn = this.mainContainer.querySelector('.copy-link')
        const tooltip = this.mainContainer.querySelector('.copy-tooltip')
        if (copyBtn && tooltip) {
            copyBtn.addEventListener('click', async () => {
            // 1) get current user
            const { data:{ user }, error:userErr } = await supabase.auth.getUser()
            if (userErr || !user) {
                window.showToast('Please sign in first','error')
                return
            }
            // 2) upsert a slug in your new table
            const slug = user.id      // or generate e.g. nanoid()
            await supabase
                .from('schedule_links')
                .upsert({ user_id: user.id, slug })
            // 3) build & copy the share URL
            const shareUrl = `${location.origin}/schedule/${slug}`
            try {
                await navigator.clipboard.writeText(shareUrl)
                tooltip.classList.add('opacity-100')
                setTimeout(() => tooltip.classList.remove('opacity-100'), 2000)
            } catch {
                window.showToast('Copy failed','error')
            }
            })
        }

        // Calendar day click
        document.querySelectorAll('.calendar-day').forEach(dayEl => {
            dayEl.addEventListener('click', (e) => {
                // Update selected date
                const dateStr = dayEl.dataset.date;
                if (dateStr) {
                    const [year, month, day] = dateStr.split('-').map(Number);
                    this.selectedDate = new Date(year, month - 1, day);
                    
                    // Update UI
                    document.querySelectorAll('.calendar-day').forEach(el => {
                        el.classList.remove('selected');
                        el.classList.add('hover:bg-gray-100');
                    });
                    
                    dayEl.classList.add('selected');
                    dayEl.classList.remove('hover:bg-gray-100');
                    
                    // Update time slots
                    const timeSlotsContainer = document.getElementById('time-slots');
                    if (timeSlotsContainer) {
                        timeSlotsContainer.innerHTML = this.renderTimeSlots();
                        this.setupTimeSlotListeners();
                    }
                    
                    // Update the displayed date
                    const dateHeader = document.querySelector('h3');
                    if (dateHeader) {
                        dateHeader.textContent = `Available Times (${this.formatSelectedDate()})`;
                    }
                }
            });
        });
        
        // Setup time slot listeners
        this.setupTimeSlotListeners();
        
        // Month selector change
        const monthSelector = document.getElementById('month-selector');
        if (monthSelector) {
            monthSelector.addEventListener('change', (e) => {
                const [month, year] = e.target.value.split(',').map(Number);
                this.selectedDate = new Date(year, month, 1);
                
                // Update calendar days
                const calendarDays = document.getElementById('calendar-days');
                if (calendarDays) {
                    calendarDays.innerHTML = this.renderCalendarDays();
                    // Re-attach event listeners to new elements
                    this.setupEventListeners();
                }
            });
        }
        
        // Previous month button
        const prevMonthBtn = document.getElementById('prev-month');
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', () => {
                const currentMonth = this.selectedDate.getMonth();
                const currentYear = this.selectedDate.getFullYear();
                
                this.selectedDate = new Date(currentYear, currentMonth - 1, 1);
                
                // Update month selector
                const monthSelector = document.getElementById('month-selector');
                if (monthSelector) {
                    monthSelector.value = `${this.selectedDate.getMonth()},${this.selectedDate.getFullYear()}`;
                }
                
                // Update calendar days
                const calendarDays = document.getElementById('calendar-days');
                if (calendarDays) {
                    calendarDays.innerHTML = this.renderCalendarDays();
                    // Re-attach event listeners to new elements
                    this.setupEventListeners();
                }
            });
        }
        
        // Next month button
        const nextMonthBtn = document.getElementById('next-month');
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', () => {
                const currentMonth = this.selectedDate.getMonth();
                const currentYear = this.selectedDate.getFullYear();
                
                this.selectedDate = new Date(currentYear, currentMonth + 1, 1);
                
                // Update month selector
                const monthSelector = document.getElementById('month-selector');
                if (monthSelector) {
                    monthSelector.value = `${this.selectedDate.getMonth()},${this.selectedDate.getFullYear()}`;
                }
                
                // Update calendar days
                const calendarDays = document.getElementById('calendar-days');
                if (calendarDays) {
                    calendarDays.innerHTML = this.renderCalendarDays();
                    // Re-attach event listeners to new elements
                    this.setupEventListeners();
                }
            });
        }
        
        // Schedule button click
        const scheduleBtn = document.getElementById('schedule-btn');
        if (scheduleBtn) {
            scheduleBtn.addEventListener('click', () => {
                if (!this.selectedTime) {
                    window.showToast('Please select a time slot first', 'warning');
                    return;
                }
                
                // Scroll to meeting details form
                const meetingForm = document.getElementById('meeting-details-form');
                if (meetingForm) {
                    meetingForm.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
        
        // Meeting form submission
        const meetingForm = document.getElementById('meeting-form');
        if (meetingForm) {
            meetingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const nameInput = document.getElementById('name');
                const emailInput = document.getElementById('email');
                const purposeInput = document.getElementById('purpose');
                const attendeesInput = document.getElementById('attendees-email');
                
                if (!nameInput.value || !emailInput.value) {
                    window.showToast('Please fill out all required fields', 'warning');
                    return;
                }
                
                // Create a new meeting request
                const [hours, minutes] = this.selectedTime.match(/(\d+):(\d+)/).slice(1);
                const isPM = this.selectedTime.includes('PM');
                
                const meetingDate = new Date(this.selectedDate);
                meetingDate.setHours(
                    isPM && hours !== '12' ? parseInt(hours) + 12 : hours === '12' && !isPM ? 0 : parseInt(hours),
                    parseInt(minutes),
                    0,
                    0
                );
                
                const endDate = new Date(meetingDate);
                endDate.setMinutes(endDate.getMinutes() + 30); // 30 min meeting by default
                
                const newMeeting = {
                    title: purposeInput.value || 'Meeting',
                    start: meetingDate,
                    end: endDate,
                    requesterName: nameInput.value,
                    requesterEmail: emailInput.value,
                    attendees: attendeesInput.value.split(',').map(email => email.trim()),
                    description: purposeInput.value
                };
                
                // Add to database and show confirmation
                const added = this.database.addMeeting(newMeeting);
                if (added) {
                    window.showToast('Meeting request submitted successfully!', 'success');
                    meetingForm.reset();
                                    }
            });
        }
        
        // Copy schedule link functionality
        const copyB = document.querySelector('.copy-link');
        if (copyB) {
            copyB.addEventListener('click', () => {
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
    
    // Setup time slot click listeners (separate method because we need to reattach after updating)
    setupTimeSlotListeners() {
        document.querySelectorAll('[data-time]').forEach(timeEl => {
            if (timeEl.disabled) return;
            
            timeEl.addEventListener('click', () => {
                // Update selected time
                this.selectedTime = timeEl.dataset.time;
                
                // Update UI
                document.querySelectorAll('[data-time]').forEach(el => {
                    if (el.dataset.time === this.selectedTime) {
                        el.classList.remove('border', 'hover:bg-gray-100');
                        el.classList.add('bg-blue-600', 'text-white');
                    } else {
                        el.classList.remove('bg-blue-600', 'text-white');
                        el.classList.add('border', 'hover:bg-gray-100');
                    }
                });
            });
        });
    }
}

// Export the component
window.CalendarComponent = CalendarComponent; 