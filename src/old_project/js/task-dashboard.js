        // Tab filtering functionality
        const tabs = document.querySelectorAll('.tab');
        const assignmentCards = document.querySelectorAll('.assignment-card');
        let activeFilters = new Set(['all']); // Track active filters
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const filter = tab.getAttribute('data-filter');
                
                // Toggle the filter
                if (activeFilters.has(filter)) {
                    // If clicking the same filter again and it's not "all", remove it
                    if (filter !== 'all') {
                        activeFilters.delete(filter);
                        tab.classList.remove('active');
                        
                        // If no filters are active, activate "all"
                        if (activeFilters.size === 0) {
                            activeFilters.add('all');
                            document.querySelector('[data-filter="all"]').classList.add('active');
                        }
                    }
                    // If clicking "all" again, keep it active
                } else {
                    // If activating a new filter
                    if (filter === 'all') {
                        // If "all" is clicked, clear all other filters
                        activeFilters.clear();
                        activeFilters.add('all');
                        tabs.forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                    } else {
                        // If a specific filter is clicked, remove "all" if active
                        if (activeFilters.has('all')) {
                            activeFilters.delete('all');
                            document.querySelector('[data-filter="all"]').classList.remove('active');
                        }
                        activeFilters.add(filter);
                        tab.classList.add('active');
                    }
                }
                
                // Apply filters
                applyFilters();
            });
        });
        
        // Multi-select status filter functionality
        const statusFilter = document.getElementById('status-filter');
        const statusDisplay = document.getElementById('status-display');
        const statusDropdown = statusFilter.querySelector('.multi-select-dropdown');
        const statusOptions = statusFilter.querySelectorAll('.multi-select-option');
        const statusClearBtn = document.getElementById('status-clear-btn');
        const statusApplyBtn = document.getElementById('status-apply-btn');
        
        let selectedStatuses = []; // This will hold the selected status values
        let tempSelectedStatuses = []; // Temporary selection before applying
        
        // Toggle dropdown
        statusFilter.addEventListener('click', (e) => {
            // Don't toggle if clicking on the dropdown itself
            if (!statusDropdown.contains(e.target)) {
                statusFilter.classList.toggle('open');
                // When opening, sync the temporary selections with the actual selections
                if (statusFilter.classList.contains('open')) {
                    tempSelectedStatuses = [...selectedStatuses];
                    updateCheckboxes();
                }
            }
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!statusFilter.contains(e.target)) {
                statusFilter.classList.remove('open');
            }
        });
        
        // Handle option clicks
        statusOptions.forEach(option => {
            const checkbox = option.querySelector('input[type="checkbox"]');
            const value = option.getAttribute('data-value');
            
            option.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent the dropdown from closing
                
                // Toggle the checkbox
                checkbox.checked = !checkbox.checked;
                
                // Update tempSelectedStatuses array
                if (checkbox.checked) {
                    if (!tempSelectedStatuses.includes(value)) {
                        tempSelectedStatuses.push(value);
                    }
                } else {
                    tempSelectedStatuses = tempSelectedStatuses.filter(status => status !== value);
                }
            });
        });
        
        // Clear button functionality
        statusClearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            tempSelectedStatuses = [];
            updateCheckboxes();
        });
        
        // Apply button functionality
        statusApplyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedStatuses = [...tempSelectedStatuses];
            updateStatusDisplay();
            statusFilter.classList.remove('open');
            applyFilters();
        });
        
        function updateCheckboxes() {
            statusOptions.forEach(option => {
                const checkbox = option.querySelector('input[type="checkbox"]');
                const value = option.getAttribute('data-value');
                checkbox.checked = tempSelectedStatuses.includes(value);
            });
        }
        
        function updateStatusDisplay() {
            if (selectedStatuses.length === 0) {
                statusDisplay.textContent = 'All Statuses';
            } else if (selectedStatuses.length === 1) {
                // If only one status is selected, show its name
                let displayText = selectedStatuses[0].replace('-', ' ');
                displayText = displayText.replace(/\b\w/g, l => l.toUpperCase());
                statusDisplay.textContent = displayText;
            } else {
                // If multiple statuses are selected, show a count
                statusDisplay.innerHTML = `
                    <span>${selectedStatuses.length} Statuses Selected</span>
                    <span style="margin-left: auto; color: var(--primary-purple); font-size: 12px;">
                        (${selectedStatuses.map(s => {
                            let text = s.replace('-', ' ');
                            return text.replace(/\b\w/g, l => l.toUpperCase());
                        }).join(', ')})
                    </span>
                `;
            }
        }
        
        // Search functionality
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', applyFilters);
        
        // New Subject Select functionality
        const subjectInput = document.getElementById('subject_input');
        const subjectDropdown = document.getElementById('subject-dropdown');
        const subjectGroup = document.getElementById('subject-select-group');
        const subjectHidden = document.getElementById('subject_hidden');
        const subjectArrow = subjectGroup.querySelector('.subject-select-arrow i');
        
        function toggleSubjectDropdown() {
            subjectGroup.classList.toggle('open');
            subjectDropdown.classList.toggle('open');
            if (subjectDropdown.classList.contains('open')) {
                subjectArrow.style.transform = 'rotate(180deg)';
            } else {
                subjectArrow.style.transform = 'rotate(0deg)';
            }
        }
        
        function closeSubjectDropdown(e) {
            if (!subjectGroup.contains(e.target)) {
                subjectGroup.classList.remove('open');
                subjectDropdown.classList.remove('open');
                subjectArrow.style.transform = 'rotate(0deg)';
            }
        }
        
        subjectInput.addEventListener('click', toggleSubjectDropdown);
        
        subjectDropdown.querySelectorAll('li').forEach(li => {
            li.addEventListener('click', function() {
                subjectInput.value = li.textContent;
                subjectHidden.value = li.getAttribute('data-value');
                // Remove active from all, add to selected
                subjectDropdown.querySelectorAll('li').forEach(item => item.classList.remove('active'));
                li.classList.add('active');
                subjectDropdown.classList.remove('open');
                subjectGroup.classList.remove('open');
                subjectArrow.style.transform = 'rotate(0deg)';
                applyFilters();
            });
        });
        
        document.addEventListener('mousedown', closeSubjectDropdown);
        
        // Calendar functionality
        class Calendar {
            constructor(calendarId, displayId, onChange) {
                this.calendar = document.getElementById(calendarId);
                this.display = document.getElementById(displayId);
                this.currentDate = new Date();
                this.selectedDate = null;
                this.isOpen = false;
                this.onChange = onChange; // Callback function
                
                this.init();
            }
            
            init() {
                this.render();
                this.bindEvents();
            }
            
            bindEvents() {
                // Toggle calendar
                this.display.parentElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggle();
                });
                
                // Navigation
                const prevBtn = this.calendar.querySelector('[id$="prev-month"]');
                const nextBtn = this.calendar.querySelector('[id$="next-month"]');
                
                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.previousMonth();
                });
                
                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.nextMonth();
                });
                
                // Clear and Today buttons
                const clearBtn = this.calendar.querySelector('[id$="clear-btn"]');
                const todayBtn = this.calendar.querySelector('[id$="today-btn"]');
                
                clearBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.clearDate();
                });
                
                todayBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectToday();
                });
                
                // Close on outside click
                document.addEventListener('click', (e) => {
                    if (!this.calendar.contains(e.target) && !this.display.parentElement.contains(e.target)) {
                        this.close();
                    }
                });
                
                // Prevent calendar from closing when clicking inside
                this.calendar.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
            
            toggle() {
                if (this.isOpen) {
                    this.close();
                } else {
                    this.open();
                }
            }
            
            open() {
                this.calendar.classList.add('show');
                this.display.parentElement.classList.add('active');
                document.getElementById('calendar-overlay').classList.add('show');
                this.isOpen = true;
            }
            
            close() {
                this.calendar.classList.remove('show');
                this.display.parentElement.classList.remove('active');
                document.getElementById('calendar-overlay').classList.remove('show');
                this.isOpen = false;
            }
            
            render() {
                const title = this.calendar.querySelector('[id$="calendar-title"]');
                const grid = this.calendar.querySelector('[id$="calendar-grid"]');
                
                // Set title
                title.textContent = this.currentDate.toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                });
                
                // Clear grid
                grid.innerHTML = '';
                
                // Add day headers
                const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                dayHeaders.forEach(day => {
                    const header = document.createElement('div');
                    header.className = 'calendar-day-header';
                    header.textContent = day;
                    grid.appendChild(header);
                });
                
                // Get first day of month and number of days
                const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
                const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
                const startDate = new Date(firstDay);
                startDate.setDate(startDate.getDate() - firstDay.getDay());
                
                // Generate calendar days
                for (let i = 0; i < 42; i++) {
                    const date = new Date(startDate);
                    date.setDate(startDate.getDate() + i);
                    
                    const dayElement = document.createElement('div');
                    dayElement.className = 'calendar-day';
                    dayElement.textContent = date.getDate();
                    
                    // Add classes
                    if (date.getMonth() !== this.currentDate.getMonth()) {
                        dayElement.classList.add('other-month');
                    }
                    
                    if (this.isToday(date)) {
                        dayElement.classList.add('today');
                    }
                    
                    if (this.selectedDate && this.isSameDay(date, this.selectedDate)) {
                        dayElement.classList.add('selected');
                    }
                    
                    // Add click event
                    dayElement.addEventListener('click', () => {
                        this.selectDate(date);
                    });
                    
                    grid.appendChild(dayElement);
                }
            }
            
            selectDate(date) {
                this.selectedDate = new Date(date);
                this.updateDisplay();
                this.render();
                this.close();
                if (this.onChange) {
                    this.onChange();
                }
            }
            
            clearDate() {
                this.selectedDate = null;
                this.updateDisplay();
                this.render();
                this.close();
                if (this.onChange) {
                    this.onChange();
                }
            }
            
            selectToday() {
                this.selectDate(new Date());
            }
            
            updateDisplay() {
                if (this.selectedDate) {
                    this.display.textContent = this.selectedDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    });
                    this.display.classList.remove('placeholder');
                } else {
                    this.display.innerHTML = this.display.id.includes('start') ? 'Start Date' : 'End Date';
                    this.display.classList.add('placeholder');
                }
            }
            
            previousMonth() {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.render();
            }
            
            nextMonth() {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.render();
            }
            
            isToday(date) {
                const today = new Date();
                return this.isSameDay(date, today);
            }
            
            isSameDay(date1, date2) {
                return date1.getDate() === date2.getDate() &&
                       date1.getMonth() === date2.getMonth() &&
                       date1.getFullYear() === date2.getFullYear();
            }
        }
        
        // Initialize calendars with callback
        const startCalendar = new Calendar('start-calendar', 'start-date-display', applyFilters);
        const endCalendar = new Calendar('end-calendar', 'end-date-display', applyFilters);
        
        // Apply filters function
        function applyFilters() {
            const searchTerm = document.getElementById('search-input').value.toLowerCase();
            const selectedSubject = document.getElementById('subject_hidden').value;
            const startDate = startCalendar.selectedDate;
            const endDate = endCalendar.selectedDate;
            
            assignmentCards.forEach(card => {
                // Check search
                const title = card.querySelector('.assignment-title').textContent.toLowerCase();
                const subject = card.getAttribute('data-subject').toLowerCase();
                const description = card.querySelector('.assignment-description').textContent.toLowerCase();
                const matchesSearch = !searchTerm || title.includes(searchTerm) || subject.includes(searchTerm) || description.includes(searchTerm);
                
                // Check subject
                const cardSubject = card.getAttribute('data-subject');
                const matchesSubject = !selectedSubject || cardSubject === selectedSubject;
                
                // Check status from multi-select
                const cardStatus = card.getAttribute('data-status');
                const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(cardStatus);
                
                // Check tabs filter
                const cardStatusForTab = card.getAttribute('data-status');
                let matchesTab = false;
                if (activeFilters.has('all')) {
                    matchesTab = true;
                } else {
                    activeFilters.forEach(filter => {
                        if (filter === cardStatusForTab) {
                            matchesTab = true;
                        }
                    });
                }
                
                // Check date range
                const cardDueDate = new Date(card.getAttribute('data-due'));
                let matchesDate = true;
                if (startDate) {
                    matchesDate = matchesDate && cardDueDate >= startDate;
                }
                if (endDate) {
                    // Set end date to end of day
                    const endOfDay = new Date(endDate);
                    endOfDay.setHours(23, 59, 59, 999);
                    matchesDate = matchesDate && cardDueDate <= endOfDay;
                }
                
                // Show card if all conditions are met
                if (matchesSearch && matchesSubject && matchesStatus && matchesTab && matchesDate) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
        
        // View button functionality
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Add your view task functionality here
                console.log('View task clicked');
            });
        });
        
        // Initialize the page
        applyFilters();
