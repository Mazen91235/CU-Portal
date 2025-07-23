  // Calendar state
    const calendarState = {
      start: { currentMonth: 2, currentYear: 2024, selectedDate: null }, // March 2024 (0-indexed)
      end: { currentMonth: 2, currentYear: 2024, selectedDate: null }
    };

    // Month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Current calendar being shown
    let currentCalendar = null;

    // Initialize the application
    document.addEventListener('DOMContentLoaded', function() {
      initializeCalendars();
      setupEventListeners();
    });

    // Initialize calendars
    function initializeCalendars() {
      renderCalendar('start');
      renderCalendar('end');
    }

    // Setup all event listeners
    function setupEventListeners() {
      // Date filter click handlers
      document.getElementById('start-date-filter').addEventListener('click', function(e) {
        e.stopPropagation();
        showCalendar('start', this);
      });

      document.getElementById('end-date-filter').addEventListener('click', function(e) {
        e.stopPropagation();
        showCalendar('end', this);
      });

      // Calendar navigation
      document.getElementById('start-prev-month').addEventListener('click', function(e) {
        e.stopPropagation();
        navigateMonth('start', -1);
      });

      document.getElementById('start-next-month').addEventListener('click', function(e) {
        e.stopPropagation();
        navigateMonth('start', 1);
      });

      document.getElementById('end-prev-month').addEventListener('click', function(e) {
        e.stopPropagation();
        navigateMonth('end', -1);
      });

      document.getElementById('end-next-month').addEventListener('click', function(e) {
        e.stopPropagation();
        navigateMonth('end', 1);
      });

      // Calendar actions
      document.getElementById('start-today-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        setToday('start');
      });

      document.getElementById('end-today-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        setToday('end');
      });

      document.getElementById('start-clear-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        clearDate('start');
      });

      document.getElementById('end-clear-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        clearDate('end');
      });

      // Close calendar when clicking outside
      document.addEventListener('click', function() {
        hideCalendar();
      });

      // Overlay click
      document.getElementById('calendar-overlay').addEventListener('click', hideCalendar);

      // Search and filter functionality
      const searchInput = document.querySelector('.search-box input');
      const subjectFilter = document.querySelectorAll('.filter-select')[0];
      const statusFilter = document.querySelectorAll('.filter-select')[1];
      
      searchInput.addEventListener('input', debounce(applyFilters, 300));
      subjectFilter.addEventListener('change', applyFilters);
      statusFilter.addEventListener('change', applyFilters);

      // View buttons
      document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
          const examTitle = this.closest('.exam-card').querySelector('.exam-title').textContent;
          alert(`Viewing details for: ${examTitle}`);
        });
      });
    }

    // Render calendar for start or end date
    function renderCalendar(type) {
      const state = calendarState[type];
      const calendarGrid = document.getElementById(`${type}-calendar-grid`);
      const calendarTitle = document.getElementById(`${type}-calendar-title`);
      
      // Set calendar title
      calendarTitle.textContent = `${monthNames[state.currentMonth]} ${state.currentYear}`;
      
      // Clear previous days
      calendarGrid.innerHTML = '';
      
      // Get first day of month and total days in month
      const firstDay = new Date(state.currentYear, state.currentMonth, 1).getDay();
      const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
      const daysInPrevMonth = new Date(state.currentYear, state.currentMonth, 0).getDate();
      
      // Get today's date for comparison
      const today = new Date();
      const isToday = (day) => {
        return state.currentYear === today.getFullYear() && 
               state.currentMonth === today.getMonth() && 
               day === today.getDate();
      };
      
      // Add days from previous month
      for (let i = 0; i < firstDay; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = daysInPrevMonth - firstDay + i + 1;
        calendarGrid.appendChild(dayElement);
      }
      
      // Add days for current month
      for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Check if this is today
        if (isToday(day)) {
          dayElement.classList.add('today');
        }
        
        // Check if this date is selected
        if (state.selectedDate && 
            state.selectedDate.getDate() === day && 
            state.selectedDate.getMonth() === state.currentMonth && 
            state.selectedDate.getFullYear() === state.currentYear) {
          dayElement.classList.add('selected');
        }
        
        // Add click handler
        dayElement.addEventListener('click', function(e) {
          e.stopPropagation();
          selectDate(type, day);
        });
        
        calendarGrid.appendChild(dayElement);
      }
      
      // Calculate days needed from next month
      const totalCells = firstDay + daysInMonth;
      const rowsNeeded = Math.ceil(totalCells / 7);
      const nextMonthDays = rowsNeeded * 7 - totalCells;
      
      // Add days from next month
      for (let i = 1; i <= nextMonthDays; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day other-month';
        dayElement.textContent = i;
        calendarGrid.appendChild(dayElement);
      }
    }

    // Navigate to previous or next month
    function navigateMonth(type, direction) {
      const state = calendarState[type];
      
      // Calculate new month and year
      let newMonth = state.currentMonth + direction;
      let newYear = state.currentYear;
      
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      
      // Update state and re-render
      state.currentMonth = newMonth;
      state.currentYear = newYear;
      renderCalendar(type);
    }

    // Select a date
    function selectDate(type, day) {
      const state = calendarState[type];
      state.selectedDate = new Date(state.currentYear, state.currentMonth, day);
      
      // Update display
      const dateDisplay = document.getElementById(`${type}-date-display`);
      dateDisplay.textContent = formatDate(state.selectedDate);
      dateDisplay.classList.remove('placeholder');
      
      // Re-render calendar to show selected date
      renderCalendar(type);
      
      // Apply filters
      applyFilters();
      
      // Hide calendar
      hideCalendar();
    }

    // Set to today's date
    function setToday(type) {
      const today = new Date();
      calendarState[type].currentMonth = today.getMonth();
      calendarState[type].currentYear = today.getFullYear();
            selectDate(type, today.getDate());
    }

    // Clear selected date
    function clearDate(type) {
      calendarState[type].selectedDate = null;
      const dateDisplay = document.getElementById(`${type}-date-display`);
      dateDisplay.textContent = type === 'start' ? 'Start Date' : 'End Date';
      dateDisplay.classList.add('placeholder');
      
      // Re-render calendar
      renderCalendar(type);
      
      // Apply filters
      applyFilters();
      
      // Hide calendar
      hideCalendar();
    }

    // Show calendar dropdown
    function showCalendar(type, button) {
      // Hide any currently shown calendar
      hideCalendar();
      
      // Set current calendar
      currentCalendar = type;
      
      // Show the calendar
      const calendar = document.getElementById(`${type}-calendar`);
      calendar.classList.add('show');
      
      // Show overlay
      document.getElementById('calendar-overlay').classList.add('show');
      
      // Position the calendar
      positionCalendar(button, calendar);
      
      // Highlight selected date if exists
      // Highlight selected date if exists
  if (calendarState[type].selectedDate) {
    const selectedDate = calendarState[type].selectedDate;
    if (selectedDate.getMonth() !== calendarState[type].currentMonth || 
        selectedDate.getFullYear() !== calendarState[type].currentYear) {
      // Navigate to selected date's month
      calendarState[type].currentMonth = selectedDate.getMonth();
      calendarState[type].currentYear = selectedDate.getFullYear();
      renderCalendar(type);
    }
      }
    }

    // Position calendar relative to button


    // Hide calendar dropdown
    function hideCalendar() {
      if (currentCalendar) {
        document.getElementById(`${currentCalendar}-calendar`).classList.remove('show');
        document.getElementById('calendar-overlay').classList.remove('show');
        currentCalendar = null;
      }
    }

    // Format date as MM/DD/YYYY
    function formatDate(date) {
      if (!date) return '';
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }

    // Debounce function to limit how often a function is called
    function debounce(func, wait) {
      let timeout;
      return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          func.apply(context, args);
        }, wait);
      };
    }

    // Apply all filters to exam cards
    function applyFilters() {
      const searchTerm = document.querySelector('.search-box input').value.toLowerCase();
      const subjectFilter = document.querySelectorAll('.filter-select')[0].value;
      const statusFilter = document.querySelectorAll('.filter-select')[1].value;
      const startDate = calendarState.start.selectedDate;
      const endDate = calendarState.end.selectedDate;
      
      const examCards = document.querySelectorAll('.exam-card');
      let hasVisibleCards = false;
      
      examCards.forEach(card => {
        const title = card.querySelector('.exam-title').textContent.toLowerCase();
        const code = card.querySelector('.exam-code').textContent;
        const status = card.querySelector('.exam-status').textContent;
        const examDateStr = card.getAttribute('data-date');
        const examDate = new Date(examDateStr);
        
        // Check search term
        const matchesSearch = !searchTerm || 
                              title.includes(searchTerm) || 
                              code.toLowerCase().includes(searchTerm);
        
        // Check subject filter
        const matchesSubject = subjectFilter === 'All Subjects' || 
                              code.includes(subjectFilter);
        
        // Check status filter
        const matchesStatus = statusFilter === 'All Statuses' || 
                             status === statusFilter;
        
        // Check date range
        let matchesDateRange = true;
        if (startDate && examDate < startDate) {
          matchesDateRange = false;
        }
        if (endDate && examDate > endDate) {
          matchesDateRange = false;
        }
        
        // Show or hide card based on filters
        if (matchesSearch && matchesSubject && matchesStatus && matchesDateRange) {
          card.style.display = 'flex';
          hasVisibleCards = true;
        } else {
          card.style.display = 'none';
        }
      });
      
      // Show no results message if no cards are visible
      const noResults = document.querySelector('.no-results');
      if (!noResults) {
        // Create no results message if it doesn't exist
        const examGrid = document.querySelector('.exam-grid');
        const message = document.createElement('div');
        message.className = 'no-results';
        message.innerHTML = `
          <i class="fas fa-search"></i>
          <h3>No exams found</h3>
          <p>Try adjusting your search or filter criteria</p>
        `;
        examGrid.appendChild(message);
      } else {
        noResults.style.display = hasVisibleCards ? 'none' : 'block';
      }
    }

    // Handle window resize
    window.addEventListener('resize', function() {
      if (currentCalendar) {
        const button = document.getElementById(`${currentCalendar}-date-filter`);
        const calendar = document.getElementById(`${currentCalendar}-calendar`);
        positionCalendar(button, calendar);
      }
    });
  