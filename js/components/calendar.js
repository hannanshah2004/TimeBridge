import supabase from "../supabaseClient.js";

export default class CalendarComponent {
    constructor(database) {
        this.database = database;
        this.mainContainer = document.getElementById('main-content');
        this.selectedDate = new Date(); 
        this.currentMonthView = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), 1);
        this.selectedTime = null;
        this.submitHandler = null; 
        this.meetingForm = null;   
        
        this._boundHandlePrevClick = this._handlePrevClick.bind(this);
        this._boundHandleNextClick = this._handleNextClick.bind(this);
        this._boundHandleMonthSelect = this._handleMonthSelect.bind(this);
    }

    render() {
        if (!this.mainContainer) return;
        const monthOptions = this.generateMonthOptions(this.currentMonthView);
        
        this.mainContainer.innerHTML = `
            <div class="container mx-auto px-4 py-8">
            <div class="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <div>
                <h1 class="text-3xl font-bold tracking-tight">Calendar</h1>
                <p class="text-gray-500">Schedule new meetings and manage your availability</p>
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
                    
                    <select id="month-selector" class="h-10 rounded-md border px-3 py-2">${monthOptions}</select>
                    
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
                    ${this.renderCalendarDays(this.currentMonthView)}
                    </div>
                </div>
                
                <!-- Time slots -->
                <div class="rounded-lg border p-4">
                    <h3 id="available-times-header" class="mb-4 text-lg font-medium">Available Times (${this.formatSelectedDate(this.selectedDate)})</h3>
                    
                    <div class="grid grid-cols-2 gap-2 sm:grid-cols-3" id="time-slots">
                    ${this.renderTimeSlots(this.selectedDate)}
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
                    <label for="location" class="mb-1 block text-sm font-medium">Location</label>
                    <div class="relative">
                        <input 
                        type="text" 
                        id="location" 
                        class="w-full rounded-md border px-3 py-2"
                        placeholder="Enter meeting location"
                        autocomplete="off"
                        />
                        <!-- suggestions dropdown -->
                        <div id="location-suggestions" 
                        class="absolute bg-white z-10 w-full max-h-48 overflow-y-auto border rounded-md mt-1 hidden"
                        ></div>
                    </div>
                    </div>
                               
                    <div>
                    <label for="purpose" class="mb-1 block text-sm font-medium">Meeting Purpose</label>
                    <div class="flex gap-2">
                        <textarea 
                        id="purpose" 
                        rows="3"
                        class="w-full rounded-md border px-3 py-2"
                        placeholder="Briefly describe the purpose of this meeting"
                        ></textarea>
                        <!-- AI generate button -->
                        <button
                        type="button"
                        id="generate-purpose-btn"
                        class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                        >
                        Generate with AI
                        </button>
                        <!-- status for the AI generation -->
                        <p id="purpose-status" class="mt-1 text-sm status"></p>
                    </div>
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
        `;
        this.setupEventListeners();
    }
    
    generateMonthOptions(viewDate) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        const viewYear = viewDate.getFullYear();
        const viewMonth = viewDate.getMonth();

        let options = '';
        for (let i = -6; i <= 6; i++) {
            const targetDate = new Date(viewYear, viewMonth + i, 1);
            const monthIndex = targetDate.getMonth();
            const year = targetDate.getFullYear();
            const value = `${monthIndex},${year}`;
            const selected = monthIndex === viewMonth && year === viewYear ? 'selected' : '';
            
            options += `<option value="${value}" ${selected}>${months[monthIndex]} ${year}</option>`;
        }
        
        return options;
    }

    renderCalendarDays(viewDate) {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const busyDays = this.getBusyDays(year, month);

        let calendarHTML = '';

        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarHTML += '<div class="h-10 rounded-md p-1"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDate = new Date(year, month, day);
            currentDate.setHours(0, 0, 0, 0);

            const isSelected = this.isSelectedDay(year, month, day);
            const isBusy = busyDays.includes(day);
            const isPast = currentDate < today;

            const classes = ['calendar-day', 'flex h-10 items-center justify-center rounded-md p-1 text-sm'];

            if (isPast) {
                classes.push('opacity-50', 'pointer-events-none', 'past-day');
            } else {
                classes.push('cursor-pointer');
                if (isSelected) {
                    classes.push('bg-indigo-600', 'text-white');
                } else {
                    classes.push('hover:bg-gray-100');
                }
                if (isBusy) {
                    classes.push('busy', 'relative', 'opacity-50', 'pointer-events-none');
                }
            }

            calendarHTML += `<div class="${classes.join(' ')}" data-date="${year}-${month + 1}-${day}">${day}</div>`;
        }

        return calendarHTML;
    }

    renderTimeSlots(selectedDate) {
        const busyTimes = [];
        const timeSlots = [];
        const startHour = 9;
        const endHour = 17;
        
        const now = new Date();
        const isSelectedDateToday = selectedDate.getFullYear() === now.getFullYear() &&
                                 selectedDate.getMonth() === now.getMonth() &&
                                 selectedDate.getDate() === now.getDate();

        for (let hour = startHour; hour < endHour; hour++) {
            for (let minute of [0, 30]) {
                const time = new Date();
                time.setHours(hour, minute, 0, 0);
                const formattedTime = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                
                const slotDateTime = new Date(selectedDate);
                slotDateTime.setHours(hour, minute, 0, 0);

                const isBusy = busyTimes.includes(formattedTime);
                const isSelected = this.selectedTime === formattedTime;
                const isPastTime = isSelectedDateToday && slotDateTime < now;
                
                timeSlots.push({ 
                    time: formattedTime, 
                    isBusy, 
                    isSelected, 
                    isPast: isPastTime
                });
            }
        }
        
        return timeSlots.map(slot => {
            const isNonInteractive = slot.isBusy || slot.isPast;
            const classes = [
                'time-slot-btn', 
                'flex justify-start rounded-md', 
                'px-3 py-2 text-sm',
                slot.isSelected ? 'bg-blue-600 text-white' : 'border',
                isNonInteractive ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:bg-gray-100'
            ];
            if (slot.isSelected && !isNonInteractive) {
                const hoverIndex = classes.indexOf('hover:bg-gray-100');
                if (hoverIndex > -1) classes.splice(hoverIndex, 1);
                 const borderIndex = classes.indexOf('border');
                if (borderIndex > -1) classes.splice(borderIndex, 1);
            }
            
            return `<button class="${classes.join(' ')}" data-time="${slot.time}" ${isNonInteractive ? 'disabled' : ''}>${slot.time}</button>`;
        }).join('');
    }

    formatSelectedDate(date) {
        return date.toLocaleDateString('en-US', {
            month: 'long', day: 'numeric', year: 'numeric'
        });
    }

    isSelectedDay(year, month, day) {
        return this.selectedDate.getFullYear() === year && 
               this.selectedDate.getMonth() === month && 
               this.selectedDate.getDate() === day;
    }
    
    _updateCalendarView() {
        console.log(`Updating view for month: ${this.currentMonthView.toISOString()}`);
        
        const monthSelector = document.getElementById('month-selector');
        if (monthSelector) {
            monthSelector.removeEventListener('change', this._boundHandleMonthSelect);
            monthSelector.innerHTML = this.generateMonthOptions(this.currentMonthView);
            monthSelector.value = `${this.currentMonthView.getMonth()},${this.currentMonthView.getFullYear()}`;
            monthSelector.addEventListener('change', this._boundHandleMonthSelect);
        }

        const calendarDays = document.getElementById('calendar-days');
        if (calendarDays) {
            calendarDays.innerHTML = this.renderCalendarDays(this.currentMonthView);
            this._setupDayListeners(); 
        }

        const availableTimesHeader = document.getElementById('available-times-header');
        if (availableTimesHeader) {
            availableTimesHeader.textContent = `Available Times (${this.formatSelectedDate(this.selectedDate)})`;
        }

        const timeSlotsContainer = document.getElementById('time-slots');
        if (timeSlotsContainer) {
            timeSlotsContainer.innerHTML = this.renderTimeSlots(this.selectedDate);
            this._setupTimeSlotListeners(); 
        }
    }

    _setupDayListeners() {
        document.querySelectorAll('.calendar-day').forEach(dayEl => {
            if (dayEl.classList.contains('past-day') || 
                dayEl.classList.contains('pointer-events-none')) { 
                return; 
            }

            dayEl.addEventListener('click', (e) => {
                const dateStr = dayEl.dataset.date;
                if (!dateStr) return;

                const [year, month, day] = dateStr.split('-').map(Number);
                this.selectedDate = new Date(year, month - 1, day); 
                this.selectedTime = null; 

                document.querySelectorAll('.calendar-day').forEach(el => el.classList.remove('bg-indigo-600', 'text-white'));
                dayEl.classList.add('bg-indigo-600', 'text-white');
                dayEl.classList.remove('hover:bg-gray-100');

                const availableTimesHeader = document.getElementById('available-times-header');
                if (availableTimesHeader) {
                     availableTimesHeader.textContent = `Available Times (${this.formatSelectedDate(this.selectedDate)})`;
                }
                const timeSlotsContainer = document.getElementById('time-slots');
                if (timeSlotsContainer) {
                    timeSlotsContainer.innerHTML = this.renderTimeSlots(this.selectedDate);
                    this._setupTimeSlotListeners(); 
                }
            });
        });
    }

    _setupTimeSlotListeners() {
        document.querySelectorAll('.time-slot-btn').forEach(timeEl => {
            if (timeEl.disabled) return;
            
            timeEl.addEventListener('click', () => {
                this.selectedTime = timeEl.dataset.time;
                
                document.querySelectorAll('.time-slot-btn').forEach(el => {
                    el.classList.remove('bg-blue-600', 'text-white');
                    el.classList.add('border', 'hover:bg-gray-100');
                });
                timeEl.classList.add('bg-blue-600', 'text-white');
                timeEl.classList.remove('border', 'hover:bg-gray-100');
            });
        });
    }
    
    _handlePrevClick() {
        console.log('Previous month button clicked.'); 
        this.currentMonthView.setMonth(this.currentMonthView.getMonth() - 1);
        if (this.selectedDate.getMonth() !== this.currentMonthView.getMonth() || this.selectedDate.getFullYear() !== this.currentMonthView.getFullYear()) {
             this.selectedDate = new Date(this.currentMonthView.getFullYear(), this.currentMonthView.getMonth(), 1);
             this.selectedTime = null; 
        }
        this._updateCalendarView(); 
    }

    _handleNextClick() {
        console.log('Next month button clicked.'); 
        this.currentMonthView.setMonth(this.currentMonthView.getMonth() + 1);
        if (this.selectedDate.getMonth() !== this.currentMonthView.getMonth() || this.selectedDate.getFullYear() !== this.currentMonthView.getFullYear()) {
             this.selectedDate = new Date(this.currentMonthView.getFullYear(), this.currentMonthView.getMonth(), 1);
             this.selectedTime = null; 
        }
        this._updateCalendarView(); 
    }

    _handleMonthSelect(e) {
        console.log('Month selector changed by user.');
        const [month, year] = e.target.value.split(',').map(Number);
        if (this.currentMonthView.getMonth() !== month || this.currentMonthView.getFullYear() !== year) {
            this.currentMonthView = new Date(year, month, 1);
            if (this.selectedDate.getMonth() !== month || this.selectedDate.getFullYear() !== year) {
                 this.selectedDate = new Date(year, month, 1);
                 this.selectedTime = null; 
            }
            this._updateCalendarView(); 
        } else {
            console.log('Dropdown value matches current view, no update needed.');
        }
    }
    
    setupEventListeners() {
        console.log('[CalendarComponent] Setting up initial event listeners...'); 

        document.getElementById('prev-month')?.removeEventListener('click', this._boundHandlePrevClick);
        document.getElementById('next-month')?.removeEventListener('click', this._boundHandleNextClick);
        document.getElementById('month-selector')?.removeEventListener('change', this._boundHandleMonthSelect);

        const prevMonthBtn = document.getElementById('prev-month');
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', this._boundHandlePrevClick);
        }
        
        const nextMonthBtn = document.getElementById('next-month');
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', this._boundHandleNextClick);
        }

        const monthSelector = document.getElementById('month-selector');
        if (monthSelector) {
            monthSelector.addEventListener('change', this._boundHandleMonthSelect);
        }

        this._setupDayListeners();
        this._setupTimeSlotListeners();
        
        this.meetingForm = document.getElementById('meeting-form'); 
        if (this.meetingForm) {
            if (this.submitHandler) {
                this.meetingForm.removeEventListener('submit', this.submitHandler);
            }
            this.submitHandler = this._handleFormSubmit.bind(this);
            this.meetingForm.addEventListener('submit', this.submitHandler);
        }

        const generateBtn = document.getElementById('generate-purpose-btn');
        const purposeInput = document.getElementById('purpose');
        const purposeStatus = document.getElementById('purpose-status');
        const locationInput = document.getElementById('location'); // Ensure locationInput is defined here too
        const attendeesInput = document.getElementById('attendees-email'); // Ensure attendeesInput is defined
        const nameInput = document.getElementById('name'); // Ensure nameInput is defined

        generateBtn.addEventListener('click', async () => {
            purposeStatus.textContent = 'Generating…';
            purposeStatus.className = 'status';

            const location = locationInput.value.trim();
            const prompt = purposeInput.value.trim()
            ? `Refine the following meeting purpose without in plain text and no formatting, keep it short: "${purposeInput.value.trim()}".`
            : 'Write a concise meeting purpose.';

            try {
            const res = await fetch('/generate', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ prompt })
            });

            if (!res.ok) {
                const err = await res.text();
                throw new Error(err || res.statusText);
            }

            const { text } = await res.json();

            purposeInput.value = text.replace(/\s+$/, ''); 
            purposeStatus.textContent = '✅ Generated!';
            purposeStatus.classList.add('success');

            } catch (err) {
            console.error('AI generation failed:', err);
            purposeStatus.textContent = '❌ Generation failed.';
            purposeStatus.classList.add('error');
            }
        });
        

        const suggBox = document.getElementById('location-suggestions');
        if (locationInput && suggBox) { // Ensure locationInput exists
            let debounceTimer = null;
            locationInput.addEventListener('input', () => {
                clearTimeout(debounceTimer);
                const q = locationInput.value.trim();
                if (!q) { suggBox.innerHTML = ''; suggBox.classList.add('hidden'); return; }
                debounceTimer = setTimeout(() => {
                    fetch(`/api/autocomplete?input=${encodeURIComponent(q)}`).then(res => res.json()).then(data => {
                        if (!data.predictions?.length) { suggBox.innerHTML = ''; suggBox.classList.add('hidden'); return; }
                        suggBox.innerHTML = data.predictions.map(p => `<div class="px-3 py-2 hover:bg-gray-100 cursor-pointer" data-place-id="${p.place_id}">${p.description}</div>`).join('');
                        suggBox.classList.remove('hidden');
                    }).catch(console.error);
                }, 300);
            });
            suggBox.addEventListener('click', e => {
                const item = e.target.closest('[data-place-id]');
                if (!item) return;
                locationInput.value = item.textContent;
                locationInput.dataset.placeId = item.dataset.placeId;
                suggBox.innerHTML = '';
                suggBox.classList.add('hidden');
            });
            document.addEventListener('click', e => {
                if (!locationInput.contains(e.target) && !suggBox.contains(e.target)) { suggBox.classList.add('hidden'); }
            });
        }

        const form = this.meetingForm;
        if(form && nameInput && attendeesInput && locationInput && purposeInput) { 
            form.addEventListener('submit', async e => {
                console.log('Secondary form submission triggered (for email?).'); 

                const message = `Meeting Request:\nLocation: ${locationInput.value}\nPurpose: ${purposeInput.value}`;
                const name = nameInput.value;
                const email = attendeesInput.value;
                const payload = { name, email, message };

                console.log('Email Payload:', payload); 

                try {
                    const res = await fetch('/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                    if (!res.ok) { const err = await res.text(); throw new Error(err || res.statusText); }
                } catch (err) {
                    console.error('Send failed:', err);
                }
            });
        }
    }

    async _handleFormSubmit(e) {
        e.preventDefault();
        console.log('Form submit handler triggered (_handleFormSubmit).'); 
        
        const submitButton = this.meetingForm ? this.meetingForm.querySelector('button[type="submit"]') : null;
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const purposeInput = document.getElementById('purpose');
        const attendeesInput = document.getElementById('attendees-email');
        const locationInput = document.getElementById('location');
        
        if (!this.selectedTime) { window.showToast('Please select a time slot first', 'warning'); return; }
        if (!nameInput.value || !emailInput.value) { window.showToast('Please fill out your name and email', 'warning'); return; }
        
        if (submitButton) { submitButton.disabled = true; submitButton.textContent = 'Submitting...'; }
        
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) {
                console.error("Error fetching user or user not logged in:", userError);
                window.showToast('You must be logged in to create a meeting.', 'error');
                if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'Confirm Meeting Request'; }
                return;
            }
            const userUuid = user.id;
            console.log('User UUID fetched:', userUuid);

            const [hours, minutes] = this.selectedTime.match(/(\d+):(\d+)/).slice(1);
            const isPM = this.selectedTime.includes('PM');
            const meetingDate = new Date(this.selectedDate);
            meetingDate.setHours(isPM && hours !== '12' ? parseInt(hours) + 12 : hours === '12' && !isPM ? 0 : parseInt(hours), parseInt(minutes), 0, 0 );
            const meetingStartISO = meetingDate.toISOString();
            
            console.log(`Checking for existing meetings for user ${userUuid} at ${meetingStartISO}`);
            const { data: existingMeetings, error: checkError } = await supabase
                .from('Meetings')
                .select('id, start, status') 
                .eq('uuid', userUuid)
                .eq('start', meetingStartISO)

            if (checkError) {
                console.error('Error checking for duplicate meetings:', checkError);
                window.showToast(`Error checking schedule: ${checkError.message}`, 'error');
                if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'Confirm Meeting Request'; }
                return;
            }

            const activeExistingMeetings = existingMeetings.filter(m => m.status !== 'canceled');

            if (activeExistingMeetings.length > 0) {
                console.warn('Duplicate meeting detected:', activeExistingMeetings);
                window.showToast('This time slot is already booked.', 'warning');
                if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'Confirm Meeting Request'; }
                return;
            }
            console.log('No duplicate meetings found for this time slot.');
            
            const endDate = new Date(meetingDate);
            endDate.setMinutes(endDate.getMinutes() + 30); 
            
            const newMeetingData = {
                title: purposeInput.value || 'Meeting', 
                start: meetingStartISO, 
                end: endDate.toISOString(), 
                requesterName: nameInput.value, 
                requesterEmail: emailInput.value,
                attendees: attendeesInput.value ? attendeesInput.value.split(',').map(email => email.trim()) : [],
                meetingLocation: locationInput.value, 
                description: purposeInput.value,
                status: 'pending', 
                color: '#f59e0b', 
                uuid: userUuid
            };
            
            const { data: insertedMeetings, error: insertError } = await supabase.from('Meetings').insert([newMeetingData]).select();
            if (insertError) throw insertError; 

            if (insertedMeetings && insertedMeetings.length > 0) {
                const newMeetingForMockDb = { ...insertedMeetings[0], start: new Date(insertedMeetings[0].start), end: new Date(insertedMeetings[0].end) };
                if (window.mockDatabase?.meetings) { window.mockDatabase.meetings.push(newMeetingForMockDb); }
                
                window.showToast('Meeting request submitted successfully!', 'success');
                this.meetingForm.reset(); 
                this.selectedTime = null;
                const timeSlotsContainer = document.getElementById('time-slots');
                if (timeSlotsContainer) {
                     timeSlotsContainer.innerHTML = this.renderTimeSlots(this.selectedDate);
                     this._setupTimeSlotListeners();
                }
            } else {
                 window.showToast('Failed to submit meeting request.', 'error');
            }
        } catch (error) {
            console.error('Error submitting meeting:', error);
            window.showToast(`Error: ${error.message || 'Failed to submit meeting request.'}`, 'error');
        } finally {
            if (submitButton) { submitButton.disabled = false; submitButton.textContent = 'Confirm Meeting Request'; }
        }
    }

    getDayName(dayOffset) { const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; const today = new Date(); const futureDate = new Date(today); futureDate.setDate(today.getDate() + dayOffset); return days[futureDate.getDay()]; }
    getBusyDays(year, month) { return []; }
    isToday(year, month, day) { const today = new Date(); return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day; }
} 