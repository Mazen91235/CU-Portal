// Calendar Application JavaScript
class ExamCalendar {
  constructor() {
    this.currentDates = {
      start: new Date(),
      end: new Date()
    };
    this.selectedDates = {
      start: null,
      end: null
    };
    this.activeCalendar = null;
    this.selectedStatuses = []; // Initialize selectedStatuses array
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupCalendars();
    this.setupFilters();
    this.setupMultiSelectFilter(); // Call the multi-select setup
    this.setupResponsiveHandlers();
  }

  setupEventListeners() {
    // Date filter clicks
    document.getElementById('start-date-filter').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleCalendar('start');
    });

    document.getElementById('end-date-filter').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleCalendar('end');
    });

    // Calendar overlay
    document.getElementById('calendar-overlay').addEventListener('click', () => {
      this.closeAllCalendars();
    });

    // Prevent calendar dropdown from closing when clicked
    document.querySelectorAll('.calendar-dropdown').forEach(dropdown => {
      dropdown.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });

    // Close calendars when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.date-filter') && !e.target.closest('.calendar-dropdown') && !e.target.closest('.multi-select-filter')) {
        this.closeAllCalendars();
        this.closeMultiSelectDropdown(); // Close multi-select dropdown as well
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllCalendars();
        this.closeMultiSelectDropdown(); // Close multi-select dropdown as well
      }
    });
  }

  setupCalendars() {
    // Setup start calendar
    this.setupCalendarNavigation('start');
    this.setupCalendarActions('start');
    this.renderCalendar('start');

    // Setup end calendar
    this.setupCalendarNavigation('end');
    this.setupCalendarActions('end');
    this.renderCalendar('end');
  }

  setupCalendarNavigation(type) {
    document.getElementById(`${type}-prev-month`).addEventListener('click', () => {
      this.currentDates[type].setMonth(this.currentDates[type].getMonth() - 1);
      this.renderCalendar(type);
    });

    document.getElementById(`${type}-next-month`).addEventListener('click', () => {
      this.currentDates[type].setMonth(this.currentDates[type].getMonth() + 1);
      this.renderCalendar(type);
    });
  }

  setupCalendarActions(type) {
    document.getElementById(`${type}-clear-btn`).addEventListener('click', () => {
      this.selectedDates[type] = null;
      this.updateDateDisplay(type);
      this.renderCalendar(type);
      this.filterExams();
    });

    document.getElementById(`${type}-today-btn`).addEventListener('click', () => {
      const today = new Date();
      this.selectedDates[type] = today;
      this.updateDateDisplay(type);
      this.renderCalendar(type);
      this.closeAllCalendars();
      this.filterExams();
    });
  }

  toggleCalendar(type) {
    const calendar = document.getElementById(`${type}-calendar`);
    const overlay = document.getElementById('calendar-overlay');
    const filter = document.getElementById(`${type}-date-filter`);

    if (this.activeCalendar === type) {
      this.closeAllCalendars();
    } else {
      this.closeAllCalendars();
      this.closeMultiSelectDropdown(); // Close multi-select dropdown when opening calendar
      calendar.classList.add('show');
      overlay.classList.add('show');
      filter.classList.add('active');
      this.activeCalendar = type;
      
      // Focus management for accessibility
      calendar.focus();
    }
  }

  closeAllCalendars() {
    document.querySelectorAll('.calendar-dropdown').forEach(dropdown => {
      dropdown.classList.remove('show');
    });
    document.querySelectorAll('.date-filter').forEach(filter => {
      filter.classList.remove('active');
    });
    document.getElementById('calendar-overlay').classList.remove('show');
    this.activeCalendar = null;
  }

  renderCalendar(type) {
    const currentDate = this.currentDates[type];
    const selectedDate = this.selectedDates[type];
    const grid = document.getElementById(`${type}-calendar-grid`);
    const title = document.getElementById(`${type}-calendar-title`);

    // Set title
    title.textContent = currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });

    // Clear grid
    grid.innerHTML = '';

    // Get first day of month and number of days
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    // Generate calendar days
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayElement = document.createElement('div');
      dayElement.className = 'calendar-day';
      dayElement.textContent = date.getDate();
      dayElement.tabIndex = 0;

      // Add classes
      if (date.getMonth() !== currentDate.getMonth()) {
        dayElement.classList.add('other-month');
      }

      if (this.isSameDay(date, new Date())) {
        dayElement.classList.add('today');
      }

      if (selectedDate && this.isSameDay(date, selectedDate)) {
        dayElement.classList.add('selected');
      }

      // Add click handler
      dayElement.addEventListener('click', () => {
        this.selectDate(type, date);
      });

      // Add keyboard handler
      dayElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectDate(type, date);
        }
      });

      grid.appendChild(dayElement);
    }
  }

  selectDate(type, date) {
    this.selectedDates[type] = new Date(date);
    this.updateDateDisplay(type);
    this.renderCalendar(type);
    this.closeAllCalendars();
    this.filterExams();
  }

  updateDateDisplay(type) {
    const display = document.getElementById(`${type}-date-display`);
    const selectedDate = this.selectedDates[type];

    if (selectedDate) {
      display.textContent = selectedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      display.classList.remove('placeholder');
    } else {
      display.textContent = type === 'start' ? 'Start Date' : 'End Date';
      display.classList.add('placeholder');
    }
  }

  isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  setupFilters() {
    // Search filter
    const searchInput = document.querySelector('.search-box input');
    searchInput.addEventListener('input', () => {
      this.filterExams();
    });

    // Subject filter
    const subjectSelect = document.querySelector('.filter-select[aria-label="Select subject"]');
    subjectSelect.addEventListener('change', () => {
      this.filterExams();
    });

    // The status filter is now handled by setupMultiSelectFilter
  }

  filterExams() {
    const searchTerm = document.querySelector('.search-box input').value.toLowerCase();
    const selectedSubject = document.querySelector('.filter-select[aria-label="Select subject"]').value;
    const startDate = this.selectedDates.start;
    const endDate = this.selectedDates.end;

    const examCards = document.querySelectorAll('.exam-card');
    let visibleCount = 0;

    examCards.forEach(card => {
      const title = card.querySelector('.exam-title').textContent.toLowerCase();
      const code = card.querySelector('.exam-code').textContent;
      const status = card.querySelector('.exam-status').textContent;
      const dateStr = card.getAttribute('data-date');
      const examDate = new Date(dateStr);

      let shouldShow = true;

      // Search filter
      if (searchTerm && !title.includes(searchTerm) && !code.toLowerCase().includes(searchTerm)) {
        shouldShow = false;
      }

      // Subject filter
      if (selectedSubject !== 'All Subjects' && !code.includes(selectedSubject)) {
        shouldShow = false;
      }

      // Status filter (multi-select)
      if (this.selectedStatuses.length > 0 && !this.selectedStatuses.includes(status)) {
        shouldShow = false;
      }

      // Date range filter
      if (startDate && examDate < startDate) {
        shouldShow = false;
      }
      if (endDate && examDate > endDate) {
        shouldShow = false;
      }

      if (shouldShow) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    // Show/hide no results message
    this.toggleNoResultsMessage(visibleCount === 0);
  }

  toggleNoResultsMessage(show) {
    let noResultsElement = document.querySelector('.no-results');
    
    if (show && !noResultsElement) {
      noResultsElement = document.createElement('div');
      noResultsElement.className = 'no-results';
      noResultsElement.innerHTML = `
        <i class="far fa-search"></i>
        <h3>No exams found</h3>
        <p>Try adjusting your search criteria or filters</p>
      `;
      document.querySelector('.exam-grid').appendChild(noResultsElement);
    } else if (!show && noResultsElement) {
      noResultsElement.remove();
    }
  }

  setupResponsiveHandlers() {
    // Handle window resize
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    // Handle orientation change on mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleResize();
      }, 100);
    });
  }

  handleResize() {
    // Close calendars on resize to prevent positioning issues
    if (this.activeCalendar) {
      this.closeAllCalendars();
    }
    this.closeMultiSelectDropdown(); // Close multi-select dropdown on resize

    // Adjust calendar positioning for mobile
    this.adjustCalendarPositioning();
  }

  adjustCalendarPositioning() {
    const isMobile = window.innerWidth <= 768;
    const calendars = document.querySelectorAll('.calendar-dropdown');
    
    calendars.forEach((calendar, index) => {
      const dateFilter = calendar.closest('.date-filter');
      
      if (isMobile) {
        calendar.style.position = 'fixed';
        calendar.style.top = '50%';
        calendar.style.left = '50%';
        calendar.style.transform = 'translate(-50%, -50%)';
        calendar.style.width = 'calc(100vw - 32px)';
        calendar.style.maxWidth = '280px';
        calendar.style.right = 'auto';
      } else {
        calendar.style.position = 'absolute';
        calendar.style.top = 'calc(100% + 8px)';
        calendar.style.transform = 'none';
        calendar.style.width = '280px';
        calendar.style.maxWidth = 'calc(100vw - 32px)';
        
        // Position end date calendar to the right to prevent overflow
        if (dateFilter && dateFilter.id === 'end-date-filter') {
          calendar.style.left = 'auto';
          calendar.style.right = '0';
        } else {
          calendar.style.left = '0';
          calendar.style.right = 'auto';
        }
      }
    });
  }

  setupMultiSelectFilter() {
    const statusFilter = document.getElementById('status-filter');
    const trigger = statusFilter.querySelector('.multi-select-trigger');
    const dropdown = statusFilter.querySelector('.multi-select-dropdown');
    const applyBtn = document.getElementById('status-apply-btn');
    const clearBtn = document.getElementById('status-clear-btn');
    const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]');
    const placeholder = trigger.querySelector('.multi-select-placeholder');
    
    // Create container for selected options display
    const selectedContainer = document.createElement('div');
    selectedContainer.className = 'selected-options';
    trigger.insertBefore(selectedContainer, trigger.querySelector('i'));
    
    // Update selected options display
    const updateSelectedDisplay = () => {
      selectedContainer.innerHTML = '';
      
      if (this.selectedStatuses.length === 0) {
        placeholder.textContent = 'All Statuses';
        placeholder.style.display = 'block';
        return;
      }
      
      placeholder.style.display = 'none';
      
      this.selectedStatuses.forEach(option => {
        const tag = document.createElement('span');
        tag.className = 'selected-option';
        tag.setAttribute('data-status', option.toLowerCase());
        tag.textContent = option;
        tag.innerHTML += '<i class="far fa-times"></i>';
        
        tag.querySelector('i').addEventListener('click', (e) => {
          e.stopPropagation();
          const checkbox = dropdown.querySelector(`input[data-value="${option.toLowerCase()}"]`);
          if (checkbox) {
            checkbox.checked = false;
          }
          this.selectedStatuses = this.selectedStatuses.filter(opt => opt !== option);
          updateSelectedDisplay();
          this.filterExams(); // Re-filter exams when an option is removed
        });
        
        selectedContainer.appendChild(tag);
      });
    };
    
    // Toggle dropdown
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeAllCalendars(); // Close calendars when opening multi-select
      dropdown.classList.toggle('show');
      statusFilter.classList.toggle('open');
      
      if (dropdown.classList.contains('show')) {
        dropdown.style.display = 'block';
        setTimeout(() => {
          dropdown.style.opacity = '1';
          dropdown.style.transform = 'translateY(0)';
        }, 10);
      } else {
        dropdown.style.opacity = '0';
        dropdown.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          dropdown.style.display = 'none';
        }, 200);
      }
    });

    this.closeMultiSelectDropdown = () => {
      dropdown.classList.remove('show');
      statusFilter.classList.remove('open');
      dropdown.style.opacity = '0';
      dropdown.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        dropdown.style.display = 'none';
      }, 200);
    };
    
    // Handle checkbox changes
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const value = checkbox.dataset.value;
        const label = checkbox.nextElementSibling.textContent;
        
        if (checkbox.checked) {
          if (!this.selectedStatuses.includes(label)) {
            this.selectedStatuses.push(label);
          }
        } else {
          this.selectedStatuses = this.selectedStatuses.filter(opt => opt !== label);
        }
        updateSelectedDisplay();
      });
    });
    
    // Apply button
    applyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.filterExams();
      this.closeMultiSelectDropdown();
    });

    // Clear button
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
      this.selectedStatuses = [];
      updateSelectedDisplay();
      this.filterExams();
      this.closeMultiSelectDropdown();
    });

    // Initial display update
    updateSelectedDisplay();
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ExamCalendar();
});

// Handle exam card interactions
document.addEventListener('DOMContentLoaded', () => {
  // Add click handlers to exam cards for better accessibility
  document.querySelectorAll('.exam-card').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const button = card.querySelector('.btn-view');
        if (button) {
          button.click();
        }
      }
    });
  });

  // Add click handlers to view buttons
  document.querySelectorAll('.btn-view').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = button.closest('.exam-card');
      const title = card.querySelector('.exam-title').textContent.trim();
      
      // Simple alert for demo purposes - in real app this would open a modal or navigate
      alert(`Opening details for: ${title}`);
    });
  });
});

// Add smooth scrolling for better UX
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll to top when clicking header
  document.querySelector('header').addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
});

// Performance optimization: Debounce search input
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Apply debouncing to search
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.search-box input');
  if (searchInput) {
    const debouncedFilter = debounce(() => {
      // Trigger filter update
      const event = new Event('input');
      searchInput.dispatchEvent(event);
    }, 300);
    
    searchInput.addEventListener('input', debouncedFilter);
  }
});

