document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("id");
    
    const {data: course} = await getCourse(courseId);
    console.log(course);

    function getInitials(name) {
        return name.split(' ').map(n => n[0]).join('');
    }
    const container = document.querySelector("#content-wrapper");
    container.innerHTML = `
            <div id="content-wrapper" class="sidebar-hidden">
        <div id="navbar-container" class="fixed-top"></div>
        <div class="course-banner" style="margin-top: 72px;">
            <div class="course-banner-left">
                <a href="../admin/courses.html" class="course-banner-back mb-3">
                    <i class="far fa-arrow-left" style="margin-right:0.5rem;"></i> Back to Courses
                    <span class="course-banner-badge hidden">${course.code}</span>
                    <span class="course-banner-credits hidden">${course.credits} Credits</span>
                </a>
                <div>
                <div class="course-banner-title-row">
                        <img src="../assets/t10.svg" alt="Course Icon" class="course-banner-icon">
                        <span class="course-banner-title">${course.name}</span>
                        <span class="course-banner-badge hidden2">${course.code}</span>
                        <span class="course-banner-credits hidden2">${course.credits} Credits</span>
                    </div>
                </div>
            </div>
            <button class="course-banner-edit" onclick='window.location.href="edit_course.html?id=${course.id}"'>
                <i class="far fa-edit"></i> Edit Course
            </button>
        </div>
            <div class="container py-4">
                <!-- Tabs row -->
                <div class="course-tabs-row" id="courseTabs">
                    <button class="course-tab-btn active" id="tabOverview">Overview</button>
                    <button class="course-tab-btn" id="tabStudents">Students (${course.users_count})</button>
                </div>
    <!-- Stats row (shown only for Overview) -->
    <div class="course-stats-row" id="courseStatsRow">
        <div class="course-stat-card">
            <div class="course-stat-imgbox" style="background-color: rgba(37, 99, 235, 0.10);">
                <img src="../assets/t11.png" alt="Enrolled">
            </div>
            <div class="course-stat-texts">
                <div class="course-stat-title">Enrolled</div>
                <div class="course-stat-value">${course.users_count}</div>
            </div>
        </div>
        <div class="course-stat-card">
            <div class="course-stat-imgbox" style="background-color: rgba(147, 51, 234, .1);">
                <img src="../assets/t13.png" alt="Credits">
            </div>
            <div class="course-stat-texts">
                <div class="course-stat-title">Credits</div>
                <div class="course-stat-value">${course.credits}</div>
            </div>
        </div>
    </div>
    <!-- Info row (shown only for Overview) -->
    <div class="course-info-row" id="courseInfoRow">
        <div class="course-info-card">
            <h4>Course Information</h4>
            <ul class="course-info-list">
                <li>
                    <span class="ci-icon"><i class="far fa-graduation-cap"></i></span>
                    <span>
                        <span class="ci-label">Faculty</span>
                        <span class="ci-value">${course.faculty.name}</span>
                    </span>
                </li>
                <li>
                    <span class="ci-icon"><i class="far fa-sitemap"></i></span>
                    <span>
                        <span class="ci-label">Department</span>
                        <span class="ci-value">${course.department.name}</span>
                    </span>
                </li>
                <li>
                    <span class="ci-icon"><i class="far fa-calendar-alt"></i></span>
                    <span>
                        <span class="ci-label">Academic year</span>
                        <span class="ci-value">${course.year.year}</span>
                    </span>
                </li>
            </ul>
        </div>
        <div class="course-info-card">
            <h4>Course Description</h4>
            <div class="course-info-desc">
                ${course.details.description}
            </div>
        </div>
    </div>
    <!-- Students table section (hidden by default, shown for Students tab) -->
    <div id="std-table" style="display:none;">
        <div class="students-card">
            <div class="students-card-header">
                <span class="students-card-title">Enrolled Students</span>
                <span class="students-card-count">${course.users_count} students</span>
            </div>
            <ul class="students-list">
                ${course.users.map(student => `
                    <li class="student-list-item">
                        <span class="student-initials-icon">${getInitials(student.name)}</span>
                        <div class="student-info">
                            <span class="student-name">${student.name}</span>
                            <span class="student-email">${student.email}</span>
                        </div>
                    </li>
                `).join('')}
            </ul>
        </div>
    </div>
    <!-- ...existing code... -->
    </div>`;

    // Tab switching logic
    const tabOverview = document.getElementById('tabOverview');
    const tabStudents = document.getElementById('tabStudents');
    const courseStatsRow = document.getElementById('courseStatsRow');
    const courseInfoRow = document.getElementById('courseInfoRow');
    const stdTable = document.getElementById('std-table');
    
    tabOverview.addEventListener('click', function () {
        tabOverview.classList.add('active');
        tabStudents.classList.remove('active');
        courseStatsRow.style.display = '';
        courseInfoRow.style.display = '';
        stdTable.style.display = 'none';
    });
    tabStudents.addEventListener('click', function () {
        tabStudents.classList.add('active');
        tabOverview.classList.remove('active');
        courseStatsRow.style.display = 'none';
        courseInfoRow.style.display = 'none';
        stdTable.style.display = '';
    });
});