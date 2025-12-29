async function fetchEnrolledCourses() {
    await IsLoggedIn();
    try {
        const url = `${domain}/user/enrolled-courses`;

        const response = await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${GetCookie("access_token")}`,
                "ngrok-skip-browser-warning": "true"
            },
            withCredentials: true
        });

        if (response.data && response.data.status == "success") {
            return response.data.data || [];
        } else {
            if(window.location.pathname.replace("index.html", "").endsWith("/user") || window.location.pathname.replace("index.html", "").endsWith("/user/")) return [];
            showToast("error", "Error", response.data?.message || "Failed to fetch enrolled courses", "");
            return [];
        }
    } catch (error) {
        if(window.location.pathname.replace("index.html", "").endsWith("/user") || window.location.pathname.replace("index.html", "").endsWith("/user/")) return [];
        showToast("error", "Error", error.response?.data?.message || "Failed to fetch enrolled courses", "");
        return [];
    }
}


async function fetchAvailableCourses(query = '') {
    await IsLoggedIn();
    try {
        const url = `${domain}/user/courses`;

        const params = query ? { "query": query } : {};
        const response = await axios.get(url, {
            params: params,
            headers: {
                "Authorization": `Bearer ${GetCookie("access_token")}`,
                "ngrok-skip-browser-warning": "true"
            },
            withCredentials: true
        });

        if (response.data && response.data.status == "success") {
            return response.data.data || [];
        } else {
            showToast("error", "Error", response.data?.message || "Failed to fetch available courses", "");
            return [];
        }
    } catch (error) {
        showToast("error", "Error", error.response?.data?.message || "Failed to fetch available courses", "");
        return [];
    }
}

// Populate filter options from courses data
function populateFilterOptions(courses) {
    const termSelect = document.querySelectorAll('.form-select')[0];
    const yearSelect = document.querySelectorAll('.form-select')[1];

    if (!termSelect || !yearSelect) return;

    // Extract unique terms and years
    const terms = new Set();
    const years = new Set();

    courses.forEach(course => {
        if (course.term) terms.add(course.term);
        if (course.year) years.add(course.year);
    });

    // Clear existing options except the default
    const defaultTermOption = termSelect.querySelector('option[value=""]');
    const defaultYearOption = yearSelect.querySelector('option[value=""]');

    termSelect.innerHTML = '';
    yearSelect.innerHTML = '';

    // Add default options
    if (defaultTermOption) termSelect.appendChild(defaultTermOption.cloneNode(true));
    else termSelect.innerHTML = '<option selected value="">Filter by Term</option>';

    if (defaultYearOption) yearSelect.appendChild(defaultYearOption.cloneNode(true));
    else yearSelect.innerHTML = '<option selected value="">Academic Year</option>';

    // Add term options
    Array.from(terms).sort().forEach(term => {
        const option = document.createElement('option');
        option.value = term;
        option.textContent = term === '1' ? 'First Term' : term === '2' ? 'Second Term' : term;
        termSelect.appendChild(option);
    });

    // Add year options
    Array.from(years).sort().forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
}

// Render enrolled courses in the HTML, separating current and past courses
function renderEnrolledCourses(courses) {
    const currentContainer = document.querySelector('.courses');
    const courseCountElement = document.getElementById('c-num');
    if (!currentContainer) return;

    if (!courses || courses.length < 1) {
        currentContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No enrolled courses found.</p>
            </div>
        `;
        if (courseCountElement) courseCountElement.textContent = '0 Courses';
        return;
    }

    // Populate filter options from courses data
    populateFilterOptions(courses);

    // Separate courses into current and past
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // 1-12

    // Assume current semester is Spring if month <=6, Fall if >6, or based on term field
    const currentSemester = currentMonth <= 6 ? 'Spring' : 'Fall';

    const currentCourses = courses;

    // Render current semester courses
    if (currentCourses.length > 0) {
        currentContainer.innerHTML = currentCourses.map(course => `
            <div class="col-12 col-sm-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0 course-card" data-term="${course.term || ''}" data-year="${course.year || ''}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="card-title mb-0 fw-semibold">${course.name || course.title}</h6>
                            <span class="badge bg-light text-dark border course-code-badge">${course.code}</span>
                        </div>
                        <div class="mb-2 small course-meta">
                        <img src="../assets/reg(1).svg" alt="Prof" class="me-1" style="width:16px; height:16px;">
                            ${course.faculty?.name || course.instructor || course.teacher || 'TBA'}
                        </div>
                        <div class="mb-1 small course-meta">
                            <img src="../assets/reg(2).svg" alt="Schedule" class="me-1" style="width:16px; height:16px;">
                            ${course.schedule || course.time || 'TBA'}
                        </div>
                        <div class="mb-1 small course-meta">
                            <img src="="../assets/reg(3).svg" alt="Credits" class="me-1" style="width:16px; height:16px;">
                            ${course.credits || 'N/A'} Credits
                        </div>
                        <div class="mb-3 small course-meta">
                            <img src="="../assets/reg(4).svg" alt="Location" class="me-1" style="width:16px; height:16px;">
                            ${course.location || course.room || 'TBA'}
                        </div>
                        
                        <button class="btn w-100 remove-btn" onclick="showPopup('confirm', 'Remove Course', 'Are you sure you want to remove this course?', () => {
            removeCourse(course.id); closePopup();
        });">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
        
    } else {
        currentContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No current semester courses found.</p>
            </div>
        `;
    }

    // Render past courses
    if (pastCourses.length > 0) {
        pastContainer.innerHTML = pastCourses.map(course => `
            <div class="col-12 col-sm-6 col-lg-4">
                <div class="card h-100 shadow-sm border-0 course-card" data-term="${course.term || ''}" data-year="${course.year || ''}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h6 class="card-title mb-0 fw-semibold">${course.name || course.title}</h6>
                            <span class="badge bg-light text-dark border course-code-badge">${course.code}</span>
                        </div>
                        <div class="mb-2 small course-meta">
                            <img src="="../assets/reg(1).svg" alt="Prof" class="me-1">
                            ${course.instructor || course.teacher}
                        </div>
                        <div class="mb-1 small course-meta">
                            <img src="="../assets/reg(2).svg" alt="Schedule" class="me-1">
                            ${course.schedule || course.time}
                        </div>
                        <div class="mb-1 small course-meta">
                            <img src="="../assets/reg(3).svg" alt="Credits" class="me-1">
                            ${course.credits} Credits
                        </div>
                        <div class="mb-3 small course-meta">
                            <img src="="../assets/reg(4).svg" alt="Location" class="me-1">
                            ${course.location || course.room}
                        </div>
                        <button class="btn w-100" onclick="viewCourseDetails('${course.id}')">Add</button>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        pastContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No past courses found.</p>
            </div>
        `;
    }

    // Update course count
    if (courseCountElement) {
        courseCountElement.textContent = `${currentCourses.length} Courses`;
    }
}

// Render available courses for course registration
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

    // Render all courses in one container
    container.innerHTML = courses.map(course => `
        <div class="col-lg-4 col-md-6 col-sm-12">
            <div class="card p-3 shadow rounded-4 course-card" data-term="${course.term || ''}" data-year="${course.year || ''}">
                <div class="d-flex justify-content-between align-items-start">
                    <h5 class="card-title">${course.name || course.title}</h5>
                    <span class="course-badge">${course.code}</span>
                </div>
                    <p class="mb-1 text-muted">
                    <span class="icon-wrapper me-2">
                        <img src="="../assets/reg(1).svg" alt="person" style="width: 20px;">
                    </span>
                    <span class="course-instructor">${course.faculty?.name || course.instructor || course.teacher || 'TBA'}</span>
                </p>
                <p class="mb-1 text-muted">
                    <span class="icon-wrapper me-2">
                        <img src="../assets/reg(2).svg" alt="clock" style="width: 20px;">
                    </span>
                    <span class="course-time">${course.schedule || course.time || 'TBA'}</span>
                </p>
                <p class="mb-1 text-muted">
                    <span class="icon-wrapper me-2">
                        <img src="="../assets/reg(3).svg" alt="credits" style="width: 20px;">
                    </span>
                    <span class="course-credits">${course.credits || 'N/A'} Credits</span>
                </p>
                <p class="mb-3 text-muted">
                    <span class="icon-wrapper me-2">
                        <img src="="../assets/reg(4).svg" alt="location" style="width: 20px;">
                    </span>
                    <span class="course-location">${course.location || course.room || 'TBA'}</span>
                </p>
                <button class="btn btn-purple w-100" onclick="addCourse('${course.id}')">Add Course</button>
            </div>
        </div>
    `).join('');
}

// Placeholder functions for course actions (to be implemented based on API)
function viewCourseDetails(courseId) {
    // Navigate to course details page or show modal
    console.log('View course details for:', courseId);
    // You can implement navigation to course details page here
}

async function addCourse(courseId) {
    await IsLoggedIn();
    showLoading();
    // Implement course registration logic
    try{
        let response = await axios.post(`${domain}/user/register-course`, {
            course_id: parseInt(courseId)
        }, {
            headers: {
                "Authorization": `Bearer ${GetCookie("access_token")}`,
                "ngrok-skip-browser-warning": "true"
            },
            withCredentials: true
        });
        if(Math.floor(response.status / 100) != 2){
            hideLoading();
            showToast("error", "Error", response.data?.message || "Failed to register course", "");
            return;
        }
        showToast("success", "Success", "Course registered successfully", "");
        // Refresh the available courses list
        let availableCourses = await fetchAvailableCourses();
        renderAvailableCourses(availableCourses);
        updateAvailableCount(availableCourses.length);
        // Refresh the enrolled courses list
        let enrolledCourses = await fetchEnrolledCourses();
        renderRegisteredCourses(enrolledCourses);
        updateRegisteredCount(enrolledCourses.length);
    }catch(error){
        hideLoading();
        showToast("error", "Error", error, "");
    }finally{
        hideLoading();
    }
}

async function removeCourse(courseId) {
    await IsLoggedIn();
    showLoading();
    try {
        const response = await axios.post(`${domain}/user/unregister-course`, {
            course_id: parseInt(courseId)
        }, {
            headers: {
                "Authorization": `Bearer ${GetCookie("access_token")}`,
                "ngrok-skip-browser-warning": "true"
            }
        });

        // API doesn't return response body, so check response status
        if(response.status != 200){
            hideLoading();
            showToast("error", "Error", response.data?.message || "Failed to unregister course", "");
            return;
        }
        showToast("success", "Success", "Course unregistered successfully", "");
        // Refresh the available courses list
        let availableCourses = await fetchAvailableCourses();
        renderAvailableCourses(availableCourses);
        updateAvailableCount(availableCourses.length);
        // Refresh the enrolled courses list
        let enrolledCourses = await fetchEnrolledCourses();
        renderRegisteredCourses(enrolledCourses);
        updateRegisteredCount(enrolledCourses.length);
    } catch (error) {
        hideLoading();
        showToast("error", "Error", error.response?.data?.message || "Failed to unregister course", "");
    } finally {
        hideLoading();
    }
}

// Initialize enrolled courses page
async function initEnrolledCoursesPage() {
    showLoading();
    const courses = await fetchEnrolledCourses();
    renderEnrolledCourses(courses);
    initPastCoursesFiltering();
    hideLoading();
}

// Initialize available courses page
async function initAvailableCoursesPage() {
    showLoading();
    const courses = await fetchAvailableCourses();
    renderAvailableCourses(courses);
    hideLoading();
}

// Search available courses
async function searchAvailableCourses(query) {
    showLoading();
    const courses = await fetchAvailableCourses(query);
    if (courses !== null) {
        renderAvailableCourses(courses);
        updateAvailableCount(courses.length);
    }
    hideLoading();
}

async function searchEnrolledCourses(query) {
    showLoading();
    let response = await axios.get(`${domain}/user/search-registered-courses`, {
        headers: {
            "Authorization": `Bearer ${GetCookie("access_token")}`,
            "ngrok-skip-browser-warning": "true"
        },
        withCredentials: true,
        params: {
            query: query
        }
    });
    if(Math.floor(response.status / 100) != 2){
        hideLoading();
        showToast("error", "Error", response.data?.message || "Failed to search courses", "");
        return;
    }
    hideLoading();
    return response.data.data ?? response.data ?? [];
}

// Initialize filtering for past courses
function initPastCoursesFiltering() {
    const searchInput = document.querySelector('input[placeholder="Search by subject name, instructor, or code"]');
    const termSelect = document.querySelectorAll('.form-select')[0];
    const yearSelect = document.querySelectorAll('.form-select')[1];
    const termButtons = document.querySelectorAll('#term-buttons .term-btn');

    // Search functionality
    function filterPastCourses() {
        const searchValue = searchInput?.value.trim().toLowerCase().replace(/\s+/g, '') || '';
        const selectedTerm = termSelect?.value || '';
        const selectedYear = yearSelect?.value || '';

        const container = document.getElementById('past-courses');
        if (!container) return;

        const cards = container.querySelectorAll('.course-card');
        cards.forEach(card => {
            const title = card.querySelector('.card-title')?.textContent?.toLowerCase().replace(/\s+/g, '') || '';
            const metas = card.querySelectorAll('.course-meta');
            const instructor = metas[0]?.textContent?.toLowerCase().replace(/\s+/g, '') || '';
            const code = card.querySelector('.course-code-badge')?.textContent?.toLowerCase().replace(/\s+/g, '') || '';
            const cardTerm = card.getAttribute('data-term') || '';
            const cardYear = card.getAttribute('data-year') || '';

            const matchSearch = searchValue === "" ||
                               title.includes(searchValue) ||
                               instructor.includes(searchValue) ||
                               code.includes(searchValue);

            const matchTerm = selectedTerm === "" || cardTerm === selectedTerm;
            const matchYear = selectedYear === "" || cardYear === selectedYear;

            const match = matchSearch && matchTerm && matchYear;

            card.closest('.col-12, .col-sm-6, .col-lg-4').style.display = match ? "" : "none";
        });
    }

    // Term button functionality
    function filterByTermButton(term) {
        const container = document.getElementById('past-courses');
        if (!container) return;

        const cards = container.querySelectorAll('.course-card');
        cards.forEach(card => {
            const cardTerm = card.getAttribute('data-term') || '';
            const match = term === 'all' || cardTerm.toLowerCase().includes(term.toLowerCase());
            card.closest('.col-12, .col-sm-6, .col-lg-4').style.display = match ? "" : "none";
        });

        // Update active button
        termButtons.forEach(btn => btn.classList.remove('active'));
        if (term !== 'all') {
            const activeBtn = Array.from(termButtons).find(btn => btn.textContent.toLowerCase().includes(term.toLowerCase()));
            if (activeBtn) activeBtn.classList.add('active');
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', filterPastCourses);
    }

    if (termSelect) {
        termSelect.addEventListener('change', filterPastCourses);
    }

    if (yearSelect) {
        yearSelect.addEventListener('change', filterPastCourses);
    }

    if (termButtons.length > 0) {
        termButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const term = btn.textContent.toLowerCase().includes('first') ? 'first' : 'second';
                filterByTermButton(term);
            });
        });
    }
}
