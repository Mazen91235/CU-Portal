// enrolled_courses_api.js - API functions for enrolled courses page

// Define the API domain (same as in script.js)
const domain = "https://cu-portal.com/api/v1";

// Function to fetch enrolled courses from the API
async function fetchEnrolledCourses() {
    if (!(await IsLoggedIn())) {
        window.location.href = "/login.html?error=true&message=Invalid Login Session. Please log in to access this resource.";
        return null;
    }

    try {
        const url = `${domain}/user/enrolled-courses`;
        console.log('Fetching enrolled courses from:', url);
        const token = GetCookie("access_token");

        const response = await axios.get(url, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true"
            },
            withCredentials: true
        });

        console.log("Enrolled courses API response:", response.data);

        if (response.data && response.data.status === "success") {
            return response.data.data || [];
        } else if (Array.isArray(response.data)) {
            return response.data;
        } else {
            console.error("Unexpected response format for enrolled courses:", response.data);
            showToast("error", "Error", response.data?.message || "Failed to fetch enrolled courses", "");
            return [];
        }
    } catch (error) {
        console.error("Error fetching enrolled courses:", error);

        // Handle token refresh if unauthorized
        if (error.response?.status === 401) {
            try {
                await refreshToken();
                return fetchEnrolledCourses(); // Retry after token refresh
            } catch (refreshError) {
                showToast("error", "Session expired", "Please login again", "");
                window.location.href = "/login.html";
                return null;
            }
        }

        showToast("error", "Error", error.response?.data?.message || "Failed to fetch enrolled courses", "");
        return [];
    }
}

// Function to fetch available courses (for search if needed)
async function fetchAvailableCourses(query = "") {
    if (!(await IsLoggedIn())) {
        window.location.href = "/login.html?error=true&message=Invalid Login Session. Please log in to access this resource.";
        return null;
    }

    try {
        const url = `${domain}/user/courses`;
        const params = query ? { query } : {};
        console.log('Fetching available courses from:', url, 'with params:', params);
        const token = GetCookie("access_token");

        const response = await axios.get(url, {
            params: params,
            headers: {
                "Authorization": `Bearer ${token}`,
                "ngrok-skip-browser-warning": "true"
            },
            withCredentials: true
        });

        console.log("Available courses API response:", response.data);

        if (response.data && response.data.status === "success") {
            return response.data.data || [];
        } else if (Array.isArray(response.data)) {
            return response.data;
        } else {
            console.error("Unexpected response format for available courses:", response.data);
            showToast("error", "Error", response.data?.message || "Failed to fetch available courses", "");
            return [];
        }
    } catch (error) {
        console.error("Error fetching available courses:", error);

        // Handle token refresh if unauthorized
        if (error.response?.status === 401) {
            try {
                await refreshToken();
                return fetchAvailableCourses(query); // Retry after token refresh
            } catch (refreshError) {
                showToast("error", "Session expired", "Please login again", "");
                window.location.href = "/login.html";
                return null;
            }
        }

        showToast("error", "Error", error.response?.data?.message || "Failed to fetch available courses", "");
        return [];
    }
}

// Function to render enrolled courses in the current semester section
function renderEnrolledCourses(courses) {
    const container = document.getElementById('current-semester-courses');
    const courseCountElement = document.getElementById('c-num');

    if (!container) return;

    if (!courses || courses.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No enrolled courses found.</p>
            </div>
        `;
        if (courseCountElement) courseCountElement.textContent = '0 Courses';
        return;
    }

    // Assuming all fetched courses are current semester
    container.innerHTML = courses.map(course => `
        <div class="col-lg-4 col-md-6 col-sm-12">
            <div class="card p-3 shadow rounded-4 course-card">
                <div class="d-flex justify-content-between align-items-start">
                    <h5 class="card-title">${course.name || course.title || 'Course Title'}</h5>
                    <span class="course-badge">${course.code || 'CODE'}</span>
                </div>
                <p class="mb-1 text-muted">
                    <span class="icon-wrapper me-2">
                        <img src="./assets/SVG (13).svg" alt="person" style="width: 20px;">
                    </span>
                    <span class="course-instructor">${course.instructor || course.teacher || 'Instructor'}</span>
                </p>
                <p class="mb-1 text-muted">
                    <span class="icon-wrapper me-2">
                        <img src="./assets/SVG (14).svg" alt="clock" style="width: 20px;">
                    </span>
                    <span class="course-time">${course.schedule || course.time || 'Time'}</span>
                </p>
                <p class="mb-1 text-muted">
                    <span class="icon-wrapper me-2">
                        <img src="./assets/SVG (15).svg" alt="credits" style="width: 20px;">
                    </span>
                    <span class="course-credits">${course.credits || 'N/A'} Credits</span>
                </p>
                <p class="mb-3 text-muted">
                    <span class="icon-wrapper me-2">
                        <img src="./assets/SVG (16).svg" alt="location" style="width: 20px;">
                    </span>
                    <span class="course-location">${course.location || course.room || 'Location'}</span>
                </p>
                <button class="view-course">View Course</button>
            </div>
        </div>
    `).join('');

    // Update course count
    if (courseCountElement) {
        courseCountElement.textContent = `${courses.length} Courses`;
    }
}

// Function to render past courses (for now, empty or placeholder)
function renderPastCourses(courses) {
    const container = document.getElementById('past-courses');

    if (!container) return;

    // For now, since API is enrolled, assume no past courses or filter if needed
    // Placeholder
    container.innerHTML = `
        <div class="col-12 text-center py-5">
            <p class="text-muted">Past courses will be displayed here.</p>
        </div>
    `;
}

// Function to populate user data
function populateUserData(user) {
    if (!user) return;

    const welcomeMessage = document.getElementById('welcome-message');
    const userElement = document.getElementById('user');
    const semesterElement = document.getElementById('semester');

    if (welcomeMessage) {
        welcomeMessage.textContent = `My Enrolled Courses`;
    }

    if (userElement) {
        userElement.textContent = user.name || user.full_name || 'User';
    }

    if (semesterElement) {
        // Assume current semester based on date or from user
        const currentDate = new Date();
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const semester = month <= 6 ? 'Spring' : 'Fall';
        const department = user.department || user.faculty || 'Department';
        semesterElement.textContent = `${semester} ${year} • ${department}`;
    }
}

// Main function to initialize the enrolled courses page
async function initEnrolledCoursesPage() {
    showLoading();

    try {
        // Fetch user data
        const user = await GetUser();
        if (user) {
            populateUserData(user);
        }

        // Fetch enrolled courses
        const courses = await fetchEnrolledCourses();
        if (courses !== null) {
            renderEnrolledCourses(courses);
            renderPastCourses([]); // For now, empty
        }
    } catch (error) {
        console.error('Error initializing enrolled courses page:', error);
        showToast("error", "Error", "Failed to load page data", "");
    } finally {
        hideLoading();
    }
}
