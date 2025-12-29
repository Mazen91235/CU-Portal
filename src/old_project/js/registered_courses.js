// filepath: d:\Students Portal CU\StudentsPortal-CU\course-settings.html
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize both registered and available courses
    await initRegisteredCoursesPage();
    await initAvailableCoursesPage();

    // Initialize filtering for available courses
    initAvailableCoursesFiltering();
});

// Initialize registered courses page
async function initRegisteredCoursesPage() {
    showLoading();
    try {
        const courses = await fetchEnrolledCourses();
        if (courses !== null) {
            renderRegisteredCourses(courses);
            updateRegisteredCount(courses.length);
        } else {
        }
    } catch (error) {
        console.error('Error initializing registered courses:', error);
        showToast("error", "Error", "Failed to load registered courses", "");
    } finally {
        hideLoading();
    }
}

// Initialize available courses page
async function initAvailableCoursesPage() {
    showLoading();
    try {
        const courses = await fetchAvailableCourses();
        if (courses !== null) {
            renderAvailableCourses(courses);
            updateAvailableCount(courses.length);
        } else {
        }
    } catch (error) {
        console.error('Error initializing available courses:', error);
        showToast("error", "Error", "Failed to load available courses", "");
    } finally {
        hideLoading();
    }
}

// Update registered courses count
function updateRegisteredCount(count) {
    const badge = document.getElementById('registered-count');
    if (badge) {
        badge.textContent = `${count} Course${count !== 1 ? 's' : ''}`;
    }
}

// Update available courses count
function updateAvailableCount(count) {
    const badge = document.getElementById('available-count');
    if (badge) {
        badge.textContent = `${count} Course${count !== 1 ? 's' : ''}`;
    }
}
// Render registered courses
function renderRegisteredCourses(courses) {
    const container = document.getElementById('registered-courses');

    if (!container) return;

    if (!courses || courses.length == 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No registered courses found.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = courses.map(course => `
        <div class="col-lg-4 col-md-6 col-sm-12">
          <div class="card p-3 shadow rounded-4 course-card" data-term="${course.term || ''}" data-year="${course.year || ''}">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="card-title mb-0">${course.name || 'Critical & Creative Thinking'}</h5>
              <span class="course-code-badge">${course.code || 'GEN001'}</span>
            </div>
            <div class="mb-2 px-3 py-2 rounded-3" style="background:rgba(255,0,0,0.05);">
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-semibold " style="color: #64748B;">Faculty</span>
                <span class="fw-semibold" style="color: #64748B;">${course.faculty?.name || 'Mathematics'}</span>
              </div>
            </div>
            <div class="mb-2 px-3 py-2 rounded-3" style="background:rgba(0,128,128,0.05);">
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-semibold" style="color: #64748B;">Department</span>
                <span class="fw-semibold" style="color: #64748B;">${course.department?.name || 'Applied Mathematics'}</span>
              </div>
            </div>
            <div class="mb-2 px-3 py-2 rounded-3" style="background:rgba(0,128,0,0.05);">
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-semibold "style="color: #64748B;">Year</span>
                <span class="fw-semibold"style="color: #64748B;">${course.year?.year || '2024/2025'}</span>
              </div>
            </div>
            <div class="mb-3 px-3 py-2 rounded-3" style="background:rgba(255,255,0,0.05);">
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-semibold" style="color: #64748B;">Credits</span>
                <span class="fw-semibold" style="color: #64748B;">${course.credits || '4'}</span>
              </div>
            </div>
            <button class="btn btn-purple  w-100" onclick="showPopup('confirm', 'Remove Course', 'Are you sure you want to remove this course?', () => { removeCourse('${course.id}'); closePopup(); })" style="background-color: #4a0851;
  color: #fff;">Remove Course</button>
          </div>
        </div>
    `).join('');
}

// Render available courses
function renderAvailableCourses(courses) {
    const container = document.getElementById('available-courses');

    if (!container) return;

    if (!courses || courses.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No available courses found.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = courses.map(course => `
        <div class="col-lg-4 col-md-6 col-sm-12">
          <div class="card p-3 shadow rounded-4 course-card no-hover" data-term="${course.term || ''}" data-year="${course.year || ''}">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="card-title mb-0">${course.name || 'Critical & Creative Thinking'}</h5>
              <span class="course-code-badge">${course.code || 'GEN001'}</span>
            </div>
            <div class="mb-2 px-3 py-2 rounded-3" style="background:rgba(255,0,0,0.05);">
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-semibold " style="color: #64748B;">Faculty</span>
                <span class="fw-semibold" style="color: #64748B;">${course.faculty?.name || 'Mathematics'}</span>
              </div>
            </div>
            <div class="mb-2 px-3 py-2 rounded-3" style="background:rgba(0,128,128,0.05);">
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-semibold" style="color: #64748B;">Department</span>
                <span class="fw-semibold" style="color: #64748B;">${course.department?.name || 'Applied Mathematics'}</span>
              </div>
            </div>
            <div class="mb-2 px-3 py-2 rounded-3" style="background:rgba(0,128,0,0.05);">
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-semibold "style="color: #64748B;">Year</span>
                <span class="fw-semibold"style="color: #64748B;">${course.year?.year || '2024/2025'}</span>
              </div>
            </div>
            <div class="mb-3 px-3 py-2 rounded-3" style="background:rgba(255,255,0,0.05);">
              <div class="d-flex justify-content-between align-items-center">
                <span class="fw-semibold" style="color: #64748B;">Credits</span>
                <span class="fw-semibold" style="color: #64748B;">${course.credits || '4'}</span>
              </div>
            </div>
            <button class="btn btn-purple w-100" onclick="showPopup('confirm', 'Add Course', 'Are you sure you want to add this course?', () => { addCourse('${course.id}'); closePopup(); })" style="background-color: #4a0851;
  color: #fff;">Add Course</button>
          </div>
        </div>
    `).join('');
}

// Initialize filtering for available courses
function initAvailableCoursesFiltering() {
    const searchInput = document.getElementById('available-search');

    // Search functionality
    function filterAvailableCourses() {
        const value = searchInput.value.trim().toLowerCase().replace(/\s+/g, '');
        const container = document.getElementById('available-courses');
        if (!container) return;

        const cards = container.querySelectorAll('.course-card');
        cards.forEach(card => {
            const title = card.querySelector('.card-title')?.textContent?.toLowerCase().replace(/\s+/g, '') || '';
            const instructor = card.querySelector('.course-instructor')?.textContent?.toLowerCase().replace(/\s+/g, '') || '';
            const code = card.querySelector('.course-badge')?.textContent?.toLowerCase().replace(/\s+/g, '') || '';

            const match = value === "" ||
                         title.includes(value) ||
                         instructor.includes(value) ||
                         code.includes(value);

            card.closest('.col-lg-4, .col-md-6, .col-sm-12').style.display = match ? "" : "none";
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterAvailableCourses);
    }
}


// Initialize filtering for available courses
function initAvailableCoursesFiltering() {
    const searchInput = document.getElementById('available-search');

    // Search functionality
    function filterAvailableCourses() {
        const value = searchInput.value.trim().toLowerCase().replace(/\s+/g, '');
        const container = document.getElementById('available-courses');
        if (!container) return;

        const cards = container.querySelectorAll('.course-card');
        cards.forEach(card => {
            const title = card.querySelector('.card-title')?.textContent?.toLowerCase().replace(/\s+/g, '') || '';
            const instructor = card.querySelector('.course-instructor')?.textContent?.toLowerCase().replace(/\s+/g, '') || '';
            const code = card.querySelector('.course-badge')?.textContent?.toLowerCase().replace(/\s+/g, '') || '';

            const match = value === "" ||
                         title.includes(value) ||
                         instructor.includes(value) ||
                         code.includes(value);

            card.closest('.col-lg-4, .col-md-6, .col-sm-12').style.display = match ? "" : "none";
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterAvailableCourses);
    }
}




