document.addEventListener('DOMContentLoaded', async function() {
    const courses = await fetchEnrolledCourses();
    renderCourses(courses);
    const announcements = await fetchUserAnnouncements();
    renderAnnouncements(announcements);
    const exams = await fetchUserExams();
    renderExams(exams);
    const tasks = await fetchUserTasks();
    renderTasks(tasks);
    const user = await GetUser();
    document.querySelector('.user-home-card').querySelector('.user-role').textContent = user.role.name ?? 'User';
    const avatar = document.querySelector('.user-home-card > img');
    if ("avatar" in user.details) {
      if (user.details.avatar.includes("drive")) {
        avatar.src = `https://drive.google.com/thumbnail?id=${await GetFileId(user.details.avatar)}&sz=w1000`;
      }
      else if(user.details.avatar.trim() == ""){
        avatar.src = "../assets/user-default-avatar.png";
      } else {
        avatar.src = user.google_avatar;
      }
    } else {
      avatar.src = user.google_avatar && user.google_avatar.trim() != "" ? user.google_avatar : "../assets/user-default-avatar.png";
    }
    document.querySelector('.user-home-card > h3').textContent = user.name ?? 'User';
    document.querySelector('.user-home-card .user-academic-details').querySelectorAll('div')[0].querySelectorAll('span')[1].textContent = user.faculty.name ?? '-';
    document.querySelector('.user-home-card .user-academic-details').querySelectorAll('div')[2].querySelectorAll('span')[1].textContent = user.department.name ?? '-';
    document.querySelector('.user-home-card .user-academic-details').querySelectorAll('div')[4].querySelectorAll('span')[1].textContent = user.year.year ?? '-';
    document.querySelector('.user-home-card .user-details').querySelectorAll('h5')[0].querySelector('span').textContent = user.email ?? '-';
    document.querySelector('.user-home-card .user-details').querySelectorAll('h5')[1].querySelector('span').textContent = user.phone ?? '-';
});
async function fetchUserAnnouncements(){
  showLoading();
  try{
      const response = await axios.get(`${domain}/user/announcements`, {
          params: { 
              limit: 3
          },
          headers: {
              "Authorization": `Bearer ${GetCookie("access_token")}`,
              "ngrok-skip-browser-warning": "true"
          },
          withCredentials: true
      });
      if (Math.floor(response?.status / 100) != 2) {
          showToast("error", "Error", response?.data?.message || "Failed to load announcements", "");
          hideLoading();
          return null;
      }
      hideLoading();
      return response.data?.data ?? response.data ?? [];
  } catch(err){
    hideLoading();
    showToast("error", "Error", error.response?.data?.message || "Failed to load announcements", "");
  }
}
async function fetchUserExams(){
  showLoading();
  try{
      const response = await axios.get(`${domain}/user/exams`, {
          params: { 
              limit: 3
          },
          headers: {
              "Authorization": `Bearer ${GetCookie("access_token")}`,
              "ngrok-skip-browser-warning": "true"
          },
          withCredentials: true
      });
      if (Math.floor(response?.status / 100) != 2) {
          showToast("error", "Error", response?.data?.message || "Failed to load exams", "");
          hideLoading();
          return null;
      }
      hideLoading();
      return response.data?.data ?? response.data ?? [];
  } catch(err){
    hideLoading();
    showToast("error", "Error", error.response?.data?.message || "Failed to load exams", "");
  }
}
async function fetchUserTasks(){
  showLoading();
  try{
      const response = await axios.get(`${domain}/user/tasks`, {
          params: { 
              limit: 3
          },
          headers: {
              "Authorization": `Bearer ${GetCookie("access_token")}`,
              "ngrok-skip-browser-warning": "true"
          },
          withCredentials: true
      });
      if (Math.floor(response?.status / 100) != 2) {
          showToast("error", "Error", response?.data?.message || "Failed to load tasks", "");
          hideLoading();
          return null;
      }
      hideLoading();
      return response.data?.data ?? response.data ?? [];
  } catch(err){
    hideLoading();
    showToast("error", "Error", error.response?.data?.message || "Failed to load tasks", "");
  }
}
function renderCourses(courses) {
    document.querySelector('.my-courses').innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3 p-3" style="background: #7B1584;border-radius: 8px;">
              <h5 class="fw-bold m-0 p-0 d-flex align-items-center" style="color: #FFF; "><img src="../assets/courses-white.svg" class="m-0 px-1" alt="book"> My Courses</h5>
              <a href="./enrolled_courses.html" class="btn btn-outline-purple responsive-btn py-2 px-3" style="background: var(--primary-color);background: #FFF;">View All</a>
            </div>
    `;
    if(!courses || courses.length == 0) {
        document.querySelector('.my-courses').innerHTML += `<p class="text-center">You are not enrolled in any courses yet.</p>`;
        return;
    }
    courses.slice(0, 3).forEach(course => {
        document.querySelector('.my-courses').innerHTML += `
        <div class="course-item border-start border-3 ps-3 py-2 px-4 d-flex align-items-center mb-4 purple-border" style="border: 1px solid #8C0DAB33 !important; border-radius: 8px;min-height: 65px;">
              <h6 class="fw-bold m-0 p-0 d-flex align-items-center course-name"><img src="../assets/course-icon.svg" class="me-2" alt="book">${course.name}</h6>
            </div>
        `;
    });
}
function renderAnnouncements(announcements){
    document.querySelector('.user-announcements').innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3 p-3 flex-wrap" style="background: #7B1584;border-radius: 8px;">
              <h5 class="fw-bold m-0 p-0 d-flex align-items-center" style="color: #FFF; "><img src="../assets/announcements-white.svg" class="m-0 px-1" alt="book"> Announcements</h5>
              <a href="/user/announcements.html" class="btn btn-outline-purple responsive-btn py-2 px-3" style="background: var(--primary-color);background: #FFF;">View All</a>
            </div>
    `;
    if(!announcements || announcements.length == 0) {
        document.querySelector('.user-announcements').innerHTML += `<p class="text-center">No announcements available.</p>`;
        return;
    }
    announcements.slice(0, 3).forEach(announcement => {
        document.querySelector('.user-announcements').innerHTML += `
        <div class="announcement-item border-start border-3 ps-3 py-2 px-4 d-flex mb-4 purple-border" style="border: 1px solid #8C0DAB33 !important; border-radius: 8px;min-height: 65px;">
              <img src="../assets/announcements-icon.svg" class="me-2" width="20" height="20" alt="book">
              <div>
                <h6 class="fw-bold p-0 d-flex align-items-center course-name">${announcement.title.length > 30 ? announcement.title.substring(0, 30) + '...' : announcement.title}</h6>
                <p>${announcement.content.length > 100 ? announcement.content.substring(0, 100) + '...' : announcement.content}</p>
                <div>
                  <span><img src="../assets/m100.svg" alt=""class="me-1"> ${announcement.created_at}</span>
                  <span>${announcement.subject.name}</span>
                </div>
              </div>
            </div>
        `;
    });
}
function renderExams(exams){
  document.querySelector('.exam-overview').innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold d-flex align-items-center">
                <img src="../assets/dashboard-exams-icon.svg" alt="exam" class="me-2">
                Exams Overview
              </h5>
              <a href="/user/exams.html" class="btn btn-outline-purple responsive-btn py-2 px-3">Show All</a>
            </div>
    `;
    if(!exams || exams.length == 0) {
        document.querySelector('.exam-overview').innerHTML += `<p class="text-center">No exams available.</p>`;
        return;
    }
    document.querySelector('.exam-overview').innerHTML += `<div class="cards-container"></div>`;
    exams.slice(0, 3).forEach(exam => {
      let dueDate = formatDueDate(exam.deadline);
      let dueTime = null;
      if (dueDate.includes('PM') || dueDate.includes('AM')) {
          dueTime = dueDate.split(' ').slice(-2).join(' ');
          dueDate = dueDate.split(' ').slice(0, -2).join(' '); // Remove AM/PM
      }
      document.querySelector('.exam-overview .cards-container').innerHTML += `
        <div class="exam-card">
                <div class="exam-card-header">
                  <span>${exam.subject.code}</span>
                  <a href="/user/exam_details.html?id=${exam.id}"><img src="../assets/dashboard-arrow-icon.svg" width="20" height="20" alt=""></a>
                </div>
                <div class="exam-card-content">
                  <h6><img src="../assets/dashboard-exams-icon.svg" class="me-2" alt=""> ${exam.name.length > 20 ? exam.name.slice(0, 20) + '...' : exam.name}</h6>
                  <div>
                    <span><img src="../assets/dashboard-course-icon.svg" alt=""> ${exam.subject.name}</span>
                    <span><img src="../assets/dashboard-calendar-icon.svg" alt=""> ${dueDate}</span>
                    <span><img src="../assets/dashboard-clock-icon.svg" alt=""> ${dueTime}</span>
                  </div>
                </div>
              </div>
        `;
    });
}
function renderTasks(tasks){
  document.querySelector('.task-overview').innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold d-flex align-items-center">
                <img src="../assets/dashboard-tasks-icon.svg" alt="task" class="me-2">
                Tasks Overview
              </h5>
              <a href="/user/tasks.html" class="btn btn-outline-purple responsive-btn py-2 px-3">Show All</a>
            </div>
    `;
    if(!tasks || tasks.length == 0) {
        document.querySelector('.task-overview').innerHTML += `<p class="text-center">No tasks available.</p>`;
        return;
    }
    document.querySelector('.task-overview').innerHTML += `<div class="cards-container"></div>`;
    tasks.slice(0, 3).forEach(task => {
      let dueDate = formatDueDate(task.deadline);
      let dueTime = null;
      if (dueDate.includes('PM') || dueDate.includes('AM')) {
          dueTime = dueDate.split(' ').slice(-2).join(' ');
          dueDate = dueDate.split(' ').slice(0, -2).join(' '); // Remove AM/PM
      }
      document.querySelector('.task-overview .cards-container').innerHTML += `
        <div class="task-card">
                <h6><img src="../assets/dashboard-tasks-icon.svg" class="me-2" alt=""> ${task.name.length > 25 ? task.name.slice(0, 25) + '...' : task.name}</h6>
                <span>${task.subject.code}</span>
                <span><img src="../assets/dashboard-course-icon.svg" alt=""> ${task.subject.name}</span>
                <span><img src="../assets/dashboard-calendar-icon.svg" alt=""> ${dueDate}</span>
                <span><img src="../assets/dashboard-clock-icon.svg" alt=""> ${dueTime}</span>
                <a href="/user/task_details.html?id=${task.id}"><img src="../assets/dashboard-arrow-icon.svg" width="20" height="20" alt=""></a>
              </div>
        `;
    });
}