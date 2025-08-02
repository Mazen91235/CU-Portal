// Global variables
let currentFilters = new Set(['all']); // Changed to support multiple filters
let assignments = [];
let selectedStartDate = null;
let selectedEndDate = null;
let currentCalendar = null;

// Calendar state
const calendarState = {
    start: { currentMonth: 6, currentYear: 2025 }, // July 2025 (0-indexed)
    end: { currentMonth: 6, currentYear: 2025 }
};

// Touch and gesture support
let touchStartX = 0;
let touchStartY = 0;
let isSwiping = false;

// Month names
const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Day names
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeAssignments();
    setupEventListeners();
    updateTabCounts();
    initializeCalendars();
    setupTouchGestures();
});

// Initialize assignments array from DOM
function initializeAssignments() {
    const assignmentCards = document.querySelectorAll('.assignment-card');
    assignments = Array.from(assignmentCards).map(card => ({
        element: card,
        title: card.querySelector('.assignment-title').textContent.toLowerCase(),
        description: card.querySelector('.assignment-description').textContent.toLowerCase(),
        subject: card.dataset.subject,
        status: card.dataset.status,
        dueDate: card.dataset.due
    }));
}

// Setup all event listeners
function setupEventListeners() {
    // Tab functionality - Updated for multiple selection
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const filter = this.dataset.filter;
            handleTabClick(filter, this);
            applyFilters();
        });
    });

    // Search functionality
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', debounce(applyFilters, 300));

    // Filter dropdowns
    const subjectFilter = document.getElementById('subject-filter');
    const statusFilter = document.getElementById('status-filter');
    subjectFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);

    // Enhanced date filter clicks with better mobile support
    const startDateFilter = document.getElementById('start-date-filter');
    const endDateFilter = document.getElementById('end-date-filter');
    
    startDateFilter.addEventListener('click', function(e) {
        e.stopPropagation();
        showCalendar('start', this);
    });
    
    endDateFilter.addEventListener('click', function(e) {
        e.stopPropagation();
        showCalendar('end', this);
    });

    // Calendar overlay click
    const overlay = document.getElementById('calendar-overlay');
    overlay.addEventListener('click', hideCalendar);

    // View assignment buttons
    const viewButtons = document.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const assignmentTitle = this.closest('.assignment-card').querySelector('.assignment-title').textContent;
            alert(`Opening assignment: ${assignmentTitle}`);
        });
    });

    // Close calendar on outside click
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.date-filter') && !e.target.closest('.calendar-dropdown')) {
            hideCalendar();
        }
    });

    // Enhanced keyboard support
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// Handle tab click for multiple selection
function handleTabClick(filter, tabElement) {
    if (filter === 'all') {
        // If "All Tasks" is clicked, clear all other filters and set only "all"
        currentFilters.clear();
        currentFilters.add('all');
        updateTabStates();
    } else {
        // Remove "all" filter if it exists when selecting specific filters
        if (currentFilters.has('all')) {
            currentFilters.delete('all');
        }
        
        // Toggle the clicked filter
        if (currentFilters.has(filter)) {
            currentFilters.delete(filter);
        } else {
            currentFilters.add(filter);
        }
        
        // If no filters are selected, automatically select "all"
        if (currentFilters.size === 0) {
            currentFilters.add('all');
        }
        
        updateTabStates();
    }
}

// Update tab visual states based on current filters
function updateTabStates() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        const filter = tab.dataset.filter;
        if (currentFilters.has(filter)) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

// Setup touch gestures for calendar navigation
function setupTouchGestures() {
    const calendars = document.querySelectorAll('.calendar-dropdown');
    
    calendars.forEach(calendar => {
        calendar.addEventListener('touchstart', handleTouchStart, { passive: true });
        calendar.addEventListener('touchmove', handleTouchMove, { passive: true });
        calendar.addEventListener('touchend', handleTouchEnd, { passive: true });
    });
}

// Touch event handlers for swipe gestures
function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isSwiping = false;
}

function handleTouchMove(e) {
    if (!touchStartX || !touchStartY) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    
    const diffX = touchStartX - touchX;
    const diffY = touchStartY - touchY;
    
    // Check if horizontal swipe is more significant than vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        isSwiping = true;
    }
}

function handleTouchEnd(e) {
    if (!isSwiping || !currentCalendar) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;
    
    // Swipe left (next month) or right (previous month)
    if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
            navigateMonth(currentCalendar, 1); // Next month
        } else {
            navigateMonth(currentCalendar, -1); // Previous month
        }
    }
    
    // Reset touch variables
    touchStartX = 0;
    touchStartY = 0;
    isSwiping = false;
}

// Enhanced keyboard navigation
function handleKeyboardNavigation(e) {
    if (!currentCalendar) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            navigateMonth(currentCalendar, -1);
            break;
        case 'ArrowRight':
            e.preventDefault();
            navigateMonth(currentCalendar, 1);
            break;
        case 'Escape':
            hideCalendar();
            break;
        case 'Enter':
        case ' ':
            if (e.target.classList.contains('calendar-day') && !e.target.classList.contains('other-month')) {
                e.preventDefault();
                e.target.click();
            }
            break;
    }
}

// Initialize calendars
function initializeCalendars() {
    setupCalendarNavigation('start');
    setupCalendarNavigation('end');
    generateCalendar('start');
    generateCalendar('end');
}

// Setup calendar navigation
function setupCalendarNavigation(type) {
    const prevBtn = document.getElementById(`${type}-prev-month`);
    const nextBtn = document.getElementById(`${type}-next-month`);
    const clearBtn = document.getElementById(`${type}-clear-btn`);
    const todayBtn = document.getElementById(`${type}-today-btn`);

    prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        navigateMonth(type, -1);
    });

    nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        navigateMonth(type, 1);
    });

    clearBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        clearDate(type);
    });

    todayBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        selectToday(type);
    });
}

// Navigate calendar month
function navigateMonth(type, direction) {
    const state = calendarState[type];
    state.currentMonth += direction;
    
    if (state.currentMonth < 0) {
        state.currentMonth = 11;
        state.currentYear--;
    } else if (state.currentMonth > 11) {
        state.currentMonth = 0;
        state.currentYear++;
    }
    
    generateCalendar(type);
}

// Enhanced calendar generation with better accessibility
function generateCalendar(type) {
    const state = calendarState[type];
    const grid = document.getElementById(`${type}-calendar-grid`);
    const title = document.getElementById(`${type}-calendar-title`);
    
    // Update title
    title.textContent = `${monthNames[state.currentMonth]} ${state.currentYear}`;
    
    // Clear grid
    grid.innerHTML = '';
    
    // Add day headers
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-day-header';
        dayHeader.textContent = day;
        dayHeader.setAttribute('aria-label', day);
        grid.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(state.currentYear, state.currentMonth, 1).getDay();
    const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(state.currentYear, state.currentMonth, 0).getDate();
    
    // Add previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayElement = createDayElement(day, true, type, state.currentMonth - 1, state.currentYear);
        grid.appendChild(dayElement);
    }
    
    // Add current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = createDayElement(day, false, type, state.currentMonth, state.currentYear);
        grid.appendChild(dayElement);
    }
    
    // Add next month's leading days
    const totalCells = grid.children.length - 7; // Subtract day headers
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayElement = createDayElement(day, true, type, state.currentMonth + 1, state.currentYear);
        grid.appendChild(dayElement);
    }
}

// Enhanced day element creation with better accessibility
function createDayElement(day, isOtherMonth, type, month, year) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    dayElement.setAttribute('role', 'button');
    dayElement.setAttribute('tabindex', isOtherMonth ? '-1' : '0');
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
        dayElement.setAttribute('aria-hidden', 'true');
    }
    
    // Check if it's today
    const today = new Date();
    const dayDate = new Date(year, month, day);
    if (dayDate.toDateString() === today.toDateString()) {
        dayElement.classList.add('today');
        dayElement.setAttribute('aria-label', `Today, ${dayDate.toLocaleDateString()}`);
    } else {
        dayElement.setAttribute('aria-label', dayDate.toLocaleDateString());
    }
    
    // Check if it's selected
    const selectedDate = type === 'start' ? selectedStartDate : selectedEndDate;
    if (selectedDate && dayDate.toDateString() === selectedDate.toDateString()) {
        dayElement.classList.add('selected');
        dayElement.setAttribute('aria-selected', 'true');
    }
    
    // Add click handler
    if (!isOtherMonth) {
        dayElement.addEventListener('click', function(e) {
            e.stopPropagation();
            selectDate(type, new Date(year, month, day));
        });
    }
    
    return dayElement;
}

// Enhanced show calendar with better positioning
function showCalendar(type, trigger) {
    hideCalendar(); // Hide any open calendar first
    
    const calendar = document.getElementById(`${type}-calendar`);
    const overlay = document.getElementById('calendar-overlay');
    const filter = document.getElementById(`${type}-date-filter`);
    
    currentCalendar = type;
    filter.classList.add('active');
    calendar.classList.add('show');
    overlay.classList.add('show');
    
    // Generate calendar for current month
    generateCalendar(type);
    
    // Focus first available day for keyboard navigation
    setTimeout(() => {
        const firstDay = calendar.querySelector('.calendar-day:not(.other-month)');
        if (firstDay) {
            firstDay.focus();
        }
    }, 100);
}

// Hide calendar
function hideCalendar() {
    const calendars = document.querySelectorAll('.calendar-dropdown');
    const overlay = document.getElementById('calendar-overlay');
    const filters = document.querySelectorAll('.date-filter');
    
    calendars.forEach(cal => cal.classList.remove('show'));
    overlay.classList.remove('show');
    filters.forEach(filter => filter.classList.remove('active'));
    
    currentCalendar = null;
}

// Select date
function selectDate(type, date) {
    if (type === 'start') {
        selectedStartDate = date;
        updateDateDisplay('start', date);
    } else {
        selectedEndDate = date;
        updateDateDisplay('end', date);
    }
    
    hideCalendar();
    applyFilters();
}

// Clear date
function clearDate(type) {
    if (type === 'start') {
        selectedStartDate = null;
        updateDateDisplay('start', null);
    } else {
        selectedEndDate = null;
        updateDateDisplay('end', null);
    }
    
    hideCalendar();
    applyFilters();
}

// Select today
function selectToday(type) {
    const today = new Date();
    selectDate(type, today);
}

// Enhanced date display with responsive formatting
function updateDateDisplay(type, date) {
    const display = document.getElementById(`${type}-date-display`);
    
    if (date) {
        const options = { 
            month: 'short', 
            day: 'numeric',
            year: window.innerWidth > 768 ? 'numeric' : '2-digit'
        };
        display.textContent = date.toLocaleDateString('en-US', options);
        display.classList.remove('placeholder');
    } else {
        display.textContent = type === 'start' ? 'Start Date' : 'End Date';
        display.classList.add('placeholder');
    }
}

// Enhanced filtering with multiple status support
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const subjectFilter = document.getElementById('subject-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    
    let visibleCount = 0;
    
    assignments.forEach(assignment => {
        let isVisible = true;
        
        // Search filter
        if (searchTerm && !assignment.title.includes(searchTerm) && !assignment.description.includes(searchTerm)) {
            isVisible = false;
        }
        
        // Subject filter
        if (subjectFilter && assignment.subject !== subjectFilter) {
            isVisible = false;
        }
        
        // Status filter from dropdown
        if (statusFilter && assignment.status !== statusFilter) {
            isVisible = false;
        }
        
        // Multiple status filters from tabs
        if (!currentFilters.has('all') && !currentFilters.has(assignment.status)) {
            isVisible = false;
        }
        
        // Date filters
        if (selectedStartDate || selectedEndDate) {
            const assignmentDate = new Date(assignment.dueDate);
            
            if (selectedStartDate && assignmentDate < selectedStartDate) {
                isVisible = false;
            }
            
            if (selectedEndDate && assignmentDate > selectedEndDate) {
                isVisible = false;
            }
        }
        
        // Show/hide assignment
        if (isVisible) {
            assignment.element.style.display = 'block';
            visibleCount++;
        } else {
            assignment.element.style.display = 'none';
        }
    });
    
    // Show/hide no results message
    const noResults = document.getElementById('no-results');
    if (visibleCount === 0) {
        noResults.style.display = 'block';
    } else {
        noResults.style.display = 'none';
    }
    
    updateTabCounts();
}

// Update tab counts
function updateTabCounts() {
    const counts = {
        all: 0,
        active: 0,
        submitted: 0,
        'submitted-later': 0,
        due: 0,
        finished: 0
    };
    
    assignments.forEach(assignment => {
        if (assignment.element.style.display !== 'none') {
            counts.all++;
            counts[assignment.status]++;
        }
    });
    
    // Update badge counts
    Object.keys(counts).forEach(status => {
        const badge = document.getElementById(`${status}-count`);
        if (badge) {
            badge.textContent = counts[status];
        }
    });
}

// Debounce function for search
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

