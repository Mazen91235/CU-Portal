//users
async function getUsersData() {
  try {
    const res = await axios.get(`${domain}/admin/get-users-data`, {
      headers: {
        Authorization: `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        await refreshToken();
        return getUsersData(); // retry
      } catch {
        showToast("error", "Session expired", "Please login again", "");
        return null;
      }
    }
    if (error.response?.status === 403) {
      showToast(
        "error",
        "Forbidden",
        "You don’t have permission to access users data.",
        ""
      );
      return null;
    }
    showToast(
      "error",
      "Error",
      error.response?.data?.message || "Failed to load users data",
      ""
    );
    return null;
  }
}
async function getUsers({
  search_query = "",
  faculty_id = "",
  department_id = "",
  year_id = "",
  is_active = "",
  page = 1,
  limit = 10,
} = {}) {
  try {
    const res = await axios.get(`${domain}/admin/users`, {
      params: {
        search_query,
        faculty_id,
        department_id,
        year_id,
        is_active,
        page,
        limit,
      },
      headers: {
        Authorization: `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });

    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return getUsers({
        search_query,
        faculty_id,
        department_id,
        year_id,
        is_active,
        page,
        limit,
      });
    }
    if (error.response?.status === 403) {
      showToast(
        "error",
        "Forbidden",
        "You don’t have permission to access users.",
        ""
      );
      return null;
    }
    showToast(
      "error",
      "Error",
      error.response?.data?.message || "Failed to load users",
      ""
    );
    return null;
  }
}
async function getUser(id) {
  try {
    const res = await axios.get(`${domain}/admin/users/${id}`, {
      headers: {
        Authorization: `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });

    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return getUser(id); // retry
    }
    if (error.response?.status === 403) {
      showToast(
        "error",
        "Forbidden",
        "You don’t have permission to access this user.",
        ""
      );
      return null;
    }
    showToast(
      "error",
      "Error",
      error.response?.data?.message || "Failed to load user",
      ""
    );
    return null;
  }
}
async function updateUsers(dataToUpdate) {
  try {
    const res = await axios.patch(
      `${domain}/admin/users/update`,
      {
        data_to_update: dataToUpdate,
      },
      {
        headers: {
          Authorization: `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return updateUsers(dataToUpdate);
    }
    if (error.response?.status === 403) {
      showToast(
        "error",
        "Forbidden",
        "You don’t have permission to update users.",
        ""
      );
      return null;
    }
    console.error(
      "Error in updateUsers:",
      error.response?.data || error.message
    );
    showToast(
      "error",
      "Error",
      error.response?.data?.message || "Failed to update users",
      ""
    );
    return null;
  }
}

// The Above code should be working

// ----------------------------
// User Management Handlers (GET /admin/users with filters + search)
// ----------------------------
const facultyFilter = document.getElementById("customFacultyFilter");
const facultyDropdown = document.getElementById("customFacultyDropdown");
const facultyValue = document.getElementById("customFacultyValue");
const facultyHidden = document.getElementById("faculty_hidden");

const departmentFilter = document.getElementById("customDepartmentFilter");
const departmentDropdown = document.getElementById("customDepartmentDropdown");
const departmentValue = document.getElementById("customDepartmentValue");
const departmentHidden = document.getElementById("department_hidden");

const yearFilter = document.getElementById("customYearFilter");
const yearDropdown = document.getElementById("customYearDropdown");
const yearValue = document.getElementById("customYearValue");
const yearHidden = document.getElementById("year_hidden");

const usersTableBody = document.querySelector("#um-table tbody");

const searchInput = document.getElementById("searchInput");
const searchDemoDropdown = document.getElementById("searchDemoDropdown");

document.addEventListener("DOMContentLoaded", async () => {


  // --- state ---
  let selectedFaculty = "";
  let selectedDepartment = "";
  let selectedYear = "";
  let searchQuery = "";
});
// --- Load Faculties ---
async function loadFaculties() {
  await IsLoggedIn();
  showLoading();
  try {
    const faculties = await searchFaculties("");
    hideLoading();
    facultyDropdown.innerHTML = "";
    const liAll = document.createElement("li");
    liAll.textContent = "All Faculties";
    liAll.dataset.value = "";
    liAll.classList.add("active");
    facultyDropdown.appendChild(liAll);

    faculties.data.forEach((faculty) => {
      const li = document.createElement("li");
      li.textContent = faculty.name;
      li.dataset.value = faculty.id;
      facultyDropdown.appendChild(li);
    });

    facultyDropdown.addEventListener("click", async (e) => {
      const li = e.target.closest("li");
      if (!li) return;

      facultyDropdown
        .querySelectorAll("li")
        .forEach((x) => x.classList.remove("active"));
      li.classList.add("active");
      facultyFilter.classList.remove("open");
      selectedFaculty = li.dataset.value;
      facultyHidden.value = selectedFaculty;
      facultyValue.textContent = li.textContent;

      // reset department + search
      selectedDepartment = "";
      departmentHidden.value = "";
      departmentValue.textContent = "All Departments";
      searchQuery = "";
      searchInput.value = "";

      await loadDepartments(selectedFaculty);
      if(window.location.pathname.includes("/admin/pending_users")){
        await fetchAndRenderPendingUsers();
      }
      if(window.location.pathname.includes("/admin/users")){
        await fetchAndRenderUsers();
      }
    });
  } catch (err) {
    hideLoading();
    showToast(
      "error",
      "Error",
      err.response?.data?.message || "Failed to load faculties",
      ""
    );
  }
}

// --- Load Departments ---
async function loadDepartments(facultyId) {
  await IsLoggedIn();
  showLoading();
  try {
    if (!facultyId) {
      departmentDropdown.innerHTML = "";
      const liAll = document.createElement("li");
      liAll.textContent = "All Departments";
      liAll.dataset.value = "";
      liAll.classList.add("active");
      departmentDropdown.appendChild(liAll);
      return;
    }

    const departments = await searchDepartments("", facultyId, "");

    departmentDropdown.innerHTML = "";
    const liAll = document.createElement("li");
    liAll.textContent = "All Departments";
    liAll.dataset.value = "";
    liAll.classList.add("active");
    departmentDropdown.appendChild(liAll);
    console.log(departments);

    departments.data.forEach((dep) => {
      const li = document.createElement("li");
      li.textContent = dep.name;
      li.dataset.value = dep.id;
      departmentDropdown.appendChild(li);
    });
    hideLoading();
    departmentDropdown.addEventListener("click", async (e) => {
      const li = e.target.closest("li");
      if (!li) return;

      departmentDropdown
        .querySelectorAll("li")
        .forEach((x) => x.classList.remove("active"));
      li.classList.add("active");
      departmentFilter.classList.remove("open");
      selectedDepartment = li.dataset.value;
      departmentHidden.value = selectedDepartment;
      departmentValue.textContent = li.textContent;
      searchQuery = "";
      searchInput.value = "";
      if(window.location.pathname.includes("/admin/pending_users")){
        await fetchAndRenderPendingUsers();
      }
      if(window.location.pathname.includes("/admin/users")){
        await fetchAndRenderUsers();
      }
    });
  } catch (err) {
    hideLoading();
    showToast(
      "error",
      "Error",
      err.response?.data?.message || "Failed to load departments",
      ""
    );
  }
}

// --- Load Years ---
async function loadYears() {
  await IsLoggedIn();
  showLoading();
  try {
    const url = `${domain}/admin/search-years?query=`;
    const headers = { "ngrok-skip-browser-warning": "true" };

    if (typeof GetCookie === "function") {
      const token = GetCookie("access_token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await axios.get(url, { headers, withCredentials: true });
    const list = Array.isArray(response?.data?.data) ? response.data.data : [];
    hideLoading();
    yearDropdown.innerHTML = "";
    const liAll = document.createElement("li");
    liAll.dataset.value = "";
    liAll.textContent = "All Years";
    liAll.classList.add("active");
    yearDropdown.appendChild(liAll);

    list.forEach((item) => {
      const li = document.createElement("li");
      li.dataset.value = item.id ?? "";
      li.textContent =
        typeof item.year === "number"
          ? `${item.year}`
          : String(item.year ?? "");
      yearDropdown.appendChild(li);
    });

    if (!yearDropdown._handlerAttached) {
      yearDropdown.addEventListener("click", async (e) => {
        const li = e.target.closest("li");
        if (!li) return;

        yearDropdown
          .querySelectorAll("li")
          .forEach((x) => x.classList.remove("active"));
        li.classList.add("active");
        yearFilter.classList.remove("open");
        selectedYear = li.dataset.value ?? "";
        yearHidden.value = selectedYear;
        yearValue.textContent = li.textContent ?? "All Years";

        searchQuery = "";
        searchInput.value = "";
        if(window.location.pathname.includes("/admin/pending_users")){
          await fetchAndRenderPendingUsers();
        }
        if(window.location.pathname.includes("/admin/users")){
          await fetchAndRenderUsers();
        }
      });
      yearDropdown._handlerAttached = true;
    }
  } catch (err) {
    hideLoading();
    showToast(
      "error",
      "Error",
      err.response?.data?.message || "Failed to load years",
      ""
    );
  }
}

// --- Fetch and render users ---
async function fetchAndRenderUsers() {
  try {
    usersTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:16px">Loading...</td></tr>`;
    await IsLoggedIn();
    showLoading();
    const params = {
      query: searchQuery,
      page: 1,
      limit: 20,
    };

    if (selectedFaculty)
      params.faculty_id = selectedFaculty.isNaN
        ? selectedFaculty
        : Number(selectedFaculty);
    if (selectedDepartment)
      params.department_id = selectedDepartment.isNaN
        ? selectedDepartment
        : Number(selectedDepartment);
    if (selectedYear)
      params.year_id = selectedYear.isNaN ? selectedYear : Number(selectedYear);

    const headers = { "ngrok-skip-browser-warning": "true" };
    const token = GetCookie("access_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const url = `${domain}/admin/users`;
    const response = await axios.get(url, {
      params,
      headers,
      withCredentials: true,
    });
    hideLoading();
    const users = Array.isArray(response.data?.data) ? response.data.data : [];

    usersTableBody.innerHTML = "";
    if (users.length === 0) {
      usersTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:16px">No users found</td></tr>`;
      return;
    }

    users.forEach((user) => {
      const row = document.createElement("tr");
      const yearCell = user.year?.year ? `${user.year.year}` : "";
      const facultyName = user.faculty?.name ?? "";
      const departmentName = user.department?.name ?? "";
      const roleName = user.role?.name ?? "";

      row.innerHTML = `
          <td>${user.name ?? "-"}</td>
          <td>${user.phone ?? "-"}</td>
          <td class="um-table-email">${user.email ?? "-"}</td>
          <td>${facultyName}</td>
          <td>${departmentName}</td>
          <td>${yearCell}</td>
          <td><span class="um-role-student">${capitalize(roleName || "-")}</span></td>
          <td><span class="um-table-action">
          <a href="/admin/user_details.html?id=${user.id}">
            <i class="fa fa-eye"></i>
          </a>
          </i></span></td>
        `;
      usersTableBody.appendChild(row);
    });
  } catch (err) {
    hideLoading();
    showToast(
      "error",
      "Error",
      err.response?.data?.message || "Failed to load users",
      ""
    );
    usersTableBody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:16px">Error loading users</td></tr>`;
  }
}

async function getUsersDetails() {
  await IsLoggedIn();
  showLoading();
  try {
    const response = await axios.get(`${domain}/admin/get-users-data`, {
      headers: {
        Authorization: `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });
    hideLoading();
    return response.data;
  } catch (error) {
    hideLoading();
    showToast(
      "error",
      "Error",
      error.response?.data?.message || "Failed to get users details",
      ""
    );
    return null;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  if(window.location.pathname.includes("/admin/users")){
    try {
      const usersDetails = await getUsersDetails();
      let imgSrc = "";
      if (usersDetails) {
        const totalUsers = document.getElementById("totalUsers");
        const activeUsers = document.getElementById("activeUsers");
        const pendingUsers = document.getElementById("pendingUsers");
        const totalUsersGrowth = document.getElementById("totalUsersGrowth");
        const activeUsersAvatarsContainer = document.getElementById(
          "activeUsersAvatarsContainer"
        );
        totalUsers.textContent = usersDetails.data.users_count;
        activeUsers.textContent = usersDetails.data.active_now;
        pendingUsers.textContent = usersDetails.data.pending_users_count;
        totalUsersGrowth.textContent = `${usersDetails.data.percentage_increase}% This Month`;
        activeUsersAvatarsContainer.innerHTML = "";
        usersDetails.data.last_five_users_active.forEach(async (img) => {
          if(img.includes("drive")){
            imgSrc = `https://drive.google.com/thumbnail?id=${await GetFileId(img)}&sz=w1000`;
          }else{imgSrc = img;}
          activeUsersAvatarsContainer.innerHTML += `<img style="width: 32px; height: 32px; border-radius: 50%;" src="${imgSrc}" alt="img">`;
        });
      } else {
        showToast("error", "Error", "Failed to get users details", "");
        return null;
      }
    } catch (error) {
      showToast(
        "error",
        "Error",
        error.response?.data?.message || "Failed to get users details",
        ""
      );
      return null;
    }
  }
});

function changeDateFormat(date){
  const [day, month, year] = date.split("-");
  // Convert month number to month name
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  // Convert month to zero-based index for array lookup
  const monthIndex = parseInt(month) - 1;
  const monthName = monthNames[monthIndex];

  // Format as "month day, year"
  return `${parseInt(day)} ${monthName}, ${year}`;

}

function changeDateFormat2(date){
  // 18-09-2025 03:27:52 to 18 Sep, 2025
  const[datePart, time] = date.split(" ");
  const[day, month, year] = datePart.split("-");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const monthName = monthNames[parseInt(month) - 1];
  return `${parseInt(day)} ${monthName}, ${year}`;
}

function dateToDaysAgo(date){
  // time example: "17 Sep, 2025"
  const[part1, part2] = date.split(",");
  const[day, month] = part1.split(" ");
  const year = part2.trim();
  const today = new Date();
  // month to number
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const monthNumber = monthNames.indexOf(month) + 1;
  const dateObj = new Date(year, monthNumber - 1, day);
  const diffTime = Math.abs(today - dateObj);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

//get user details using getParams function
async function getUserDetails() {
  const id = GetParams("id");
  await IsLoggedIn();
  showLoading();
  try {
    const response = await axios.get(`${domain}/admin/users/${id}`, {
      headers: {
        Authorization: `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true",
      },
      withCredentials: true,
    });
    hideLoading();
    if (Math.floor(response.status / 100) != 2) {
      showToast("error", "Error", "Failed to get user details", "");
      return null;
    }
    return response.data;
  } catch (error) {
    hideLoading();
    showToast(
      "error",
      "Error",
      error.response?.data?.message || "Failed to get user details",
      ""
    );
    return null;
  }
}
let currentRole = null;

async function getAndFetchUserDetails() {
  await IsLoggedIn();
  showLoading();
  try {

    // user info
    const userNameValue = document.getElementById("user_name_value");
    const userEmailValue = document.getElementById("user_email_value");
    const userPhoneValue = document.getElementById("user_phone_value");
    const userFacultyValue = document.getElementById("user_faculty_value");
    const userDepartmentValue = document.getElementById("user_department_value");
    const userYearValue = document.getElementById("user_year_value");
    const userNationalIdValue = document.getElementById("user_national_id_value");
    const userAvatarValue = document.getElementById("user_avatar_value");
    const userRoleValue = document.getElementById("user_role_value");

    const userEarlyAccessBadge = document.getElementById("user_early_access_badge");
    const userExamsPublished = document.getElementById("user-exams-published");
    const userExams = document.getElementById("user-exams");
    const userTasksPublished = document.getElementById("user-tasks-published");
    const userTasks = document.getElementById("user-tasks");
    const userAnnouncements = document.getElementById("user-announcements");
    const userMaterials = document.getElementById("user-materials");
    const userGrades = document.getElementById("user-grades");
    const userSubjects = document.getElementById("user-subjects");
    const userActivityLogs = document.getElementById("user-activity-logs");
    

    const userDetails = await getUserDetails();
    hideLoading();
    if(userDetails){
      currentRole = userDetails.data.role.id;

    // user info
    userNameValue.textContent = userDetails.data.name;
    userEmailValue.textContent = userDetails.data.email;
    userPhoneValue.textContent = userDetails.data.phone;
    userFacultyValue.textContent = userDetails.data.faculty?.name ?? "-";
    userDepartmentValue.textContent = userDetails.data.department?.name ?? "-";
    userYearValue.textContent = userDetails.data.year?.year ?? "-";
    userNationalIdValue.textContent = userDetails.data.national_id ?? "-";
    userAvatarValue.src = userDetails.data.google_avatar ?? "../assets/user-default-avatar.png";
if(userRoleValue){
    userRoleValue.textContent = `${capitalize(userDetails.data.role.name)}` ?? "-";
}
    if(userDetails.data.is_early_access === true && userEarlyAccessBadge){
      userEarlyAccessBadge.classList.remove("d-none");
    }
    
    
    // exams published
    userExamsPublished.innerHTML = "";
    if(userDetails.data.exams_published && userDetails.data.exams_published.length > 0){
    userDetails.data.exams_published.forEach((exam) => {
      userExamsPublished.innerHTML += `
      <div class="exam-card exam-card-white-bg">
                <div class="exam-card-icon">
                  <img
                    src="../assets/bookicon.png"
                    alt="Exam"
                    class="exam-circle-icon"
                  />
                </div>
                <div class="exam-card-info">
                  <div class="exam-card-title">${exam.name}</div>
                  <div class="exam-card-subject exam-card-link">
                    ${exam.subject.name}
                  </div>
                  <div class="exam-card-date">Due: ${changeDateFormat(exam.due_date)}</div>
                </div>
                <div class="exam-card-badges">
                  <span class="exam-badge exam-badge-publisher">Publisher</span>
                </div>
              </div>

      `
    })}else{
      userExamsPublished.innerHTML +=`<div class="exam-card exam-card-white-bg">
        <div class="exam-card-icon">
          <img src="../assets/bookicon.png" alt="Exam" class="exam-circle-icon">
        </div>
        <div class="exam-card-info">
          <div class="exam-card-title">No exams published</div>
        </div>
      </div>`
    }
    userExamsPublished.innerHTML +=`<a href="../admin/exams.html?user_id=${userDetails.data.id}" class="exams-link" style="padding-left: 20px" >View All Exams Published By User<i class="fa fa-chevron-right"></i></a>`


    // exams
    userExams.innerHTML = "";
    if(userDetails.data.exams && userDetails.data.exams.length > 0){
    userDetails.data.exams.forEach((exam) => {
      userExams.innerHTML += `
      <div class="exam-card exam-card-white-bg">
                <div class="exam-card-icon">
                  <img
                    src="../assets/bookicon.png"
                    alt="Exam"
                    class="exam-circle-icon"
                  />
                </div>
                <div class="exam-card-info">
                  <div class="exam-card-title">${exam.name}</div>
                  <div class="exam-card-subject exam-card-link">
                    ${exam.subject.name}
                  </div>
                  <div class="exam-card-date">Due: ${changeDateFormat(exam.due_date)}</div>
                </div>
                <div class="exam-card-badges">
                </div>
              </div>

      `
    })}else{
      userExams.innerHTML +=`<div class="exam-card exam-card-white-bg">
        <div class="exam-card-icon">
          <img src="../assets/bookicon.png" alt="Exam" class="exam-circle-icon">
        </div>
        <div class="exam-card-info">
          <div class="exam-card-title">No exams</div>
        </div>
      </div>`
    }
    userExams.innerHTML +=`<a href="../admin/exams.html?user_id=${userDetails.data.id}" class="exams-link" style="padding-left: 20px"
    >View All Exams Related To This User
    <i class="fa fa-chevron-right"></i
  ></a>`


    // tasks published
    userTasksPublished.innerHTML = "";
    if(userDetails.data.tasks_published && userDetails.data.tasks_published.length > 0){
    userDetails.data.tasks_published.forEach((task) => {
      userTasksPublished.innerHTML += `
      <div class="task-card task-card-white-bg">
        <div class="task-card-icon">
          <img src="../assets/tasksicon.png" alt="Task" class="task-circle-icon">
        </div>
        <div class="task-card-info">
          <div class="task-card-title">${task.name}</div>
          <div class="task-card-subject task-card-link">
            ${task.subject.name}
          </div>
          <div class="task-card-date">Due: ${changeDateFormat(task.due_date)}</div>
        </div>
        <div class="task-card-badges">
          <span class="task-badge task-badge-publisher">Publisher</span>
        </div>
      </div>

      `
    })}else{
      userTasksPublished.innerHTML +=`<div class="task-card task-card-white-bg">
        <div class="task-card-icon">
          <img src="../assets/tasksicon.png" alt="Task" class="task-circle-icon">
        </div>
        <div class="task-card-info">
          <div class="task-card-title">No tasks published</div>
        </div>
      </div>`
    }
    userTasksPublished.innerHTML +=`<a href="../admin/tasks.html?user_id=${userDetails.data.id}" class="tasks-link" style="padding-left: 20px" >View All Tasks Published By User<i class="fa fa-chevron-right"></i></a>`
    

    // tasks
    userTasks.innerHTML = "";
    if(userDetails.data.tasks && userDetails.data.tasks.length > 0){
    userDetails.data.tasks.forEach((task) => {
      userTasks.innerHTML += `
      <div class="task-card task-card-white-bg">
        <div class="task-card-icon">
          <img src="../assets/tasksicon.png" alt="Task" class="task-circle-icon">
        </div>
        <div class="task-card-info">
          <div class="task-card-title">${task.name}</div>
          <div class="task-card-subject task-card-link">
            ${task.subject.name}
          </div>
          <div class="task-card-date">Due: ${changeDateFormat(task.due_date)}</div>
        </div>
        <div class="task-card-badges">
        </div>
      </div>

      `
    })}else{
      userTasks.innerHTML +=`<div class="task-card task-card-white-bg">
        <div class="task-card-icon">
          <img src="../assets/tasksicon.png" alt="Task" class="task-circle-icon">
        </div>
        <div class="task-card-info">
          <div class="task-card-title">No tasks</div>
        </div>
      </div>`
    }
    userTasks.innerHTML +=`<a href="../admin/tasks.html?user_id=${userDetails.data.id}" class="tasks-link" style="padding-left: 20px" >View All Tasks Related To This User<i class="fa fa-chevron-right"></i></a>`


    //announcements
    userAnnouncements.innerHTML = "";
    if(userDetails.data.announcements_published && userDetails.data.announcements_published.length > 0){
    userDetails.data.announcements_published.forEach((announcement, i) => {
      let color = i % 2 === 0 ? "announcement-border-blue" : "announcement-border-red";

      userAnnouncements.innerHTML += `
      
      <div class="announcement-card">
                <div
                  class="announcement-card-border ${color}"
                ></div>
                <div class="announcement-card-content">
                  <div class="announcement-card-title-row">
                    <span class="announcement-card-title"
                      >${announcement.title}</span
                    >
                    <span class="announcement-badge">Publisher</span>
                  </div>
                  <div class="announcement-card-desc">
                    ${announcement.content}
                  </div>
                  <div class="announcement-card-date">Posted ${dateToDaysAgo(announcement.created_at)} Days Ago</div>
                </div>
              </div>

      `
    })}else{
      userAnnouncements.innerHTML +=`<div class="announcement-card">
        <div class="announcement-card-border announcement-border-blue">
        </div>
        <div class="announcement-card-content">
          <div class="announcement-card-title-row">
            <span class="announcement-card-title">No announcements published</span>
          </div>
        </div>
      </div>`
    }
    userAnnouncements.innerHTML +=`<a href="../admin/announcements.html?user_id=${userDetails.data.id}" class="announcement-link" style="padding-left: 20px"
              >View All Announcement Related To This User
              <i class="fa fa-chevron-right"></i
            ></a>`


    // materials
    userMaterials.innerHTML = "";
    if(userDetails.data.materials_uploaded && userDetails.data.materials_uploaded.length > 0){
    userDetails.data.materials_uploaded.forEach((material) => {
      userMaterials.innerHTML += `
      <div class="materials-card">
                <div class="materials-card-icon">
                  <img
                    src="../assets/openbookicon.png"
                    alt="Material"
                    class="materials-circle-icon"
                  />
                </div>
                <div class="materials-card-info">
                  <div class="materials-card-title">${material.name}</div>
                  <div class="materials-card-subject materials-card-link">
                    ${material.subject.name}
                  </div>
                  <div class="materials-card-date-row">
                    <span class="materials-card-date"
                      >Uploaded On: ${material.created_at}</span
                    >
                  </div>
                </div>
                <div class="materials-card-badges">
                  <span class="materials-badge materials-badge-publisher"
                    >Publisher</span
                  >
                  <span class="materials-card-type">${material.type}</span>
                </div>
              </div>
      `
    })}else{
      userMaterials.innerHTML +=`<div class="materials-card">
        <div class="materials-card-icon">
          <img src="../assets/openbookicon.png" alt="Material" class="materials-circle-icon">
        </div>
        <div class="materials-card-info">
          <div class="materials-card-title">No materials published</div>
        </div>
      </div>`
    }
    userMaterials.innerHTML +=`<a href="../admin/materials.html?user_id=${userDetails.data.id}" class="materials-link" style="padding-left: 20px"
              >View All Materials Related To This User
              <i class="fa fa-chevron-right"></i
            ></a>`
    

    //grades
    userGrades.innerHTML = "";
    if(userDetails.data.grades_uploaded && userDetails.data.grades_uploaded.length > 0){
    userDetails.data.grades_uploaded.forEach((grade) => {
      userGrades.innerHTML += `
      <div class="grades-card">
                <div class="grades-card-icon">
                  <img
                    src="../assets/attachicon.png"
                    alt="Grade"
                    class="grades-circle-icon"
                  />
                </div>
                <div class="grades-card-info">
                  <div class="grades-card-title">${grade.name}</div>
                  <div class="grades-card-subject grades-card-link">
                    ${grade.subject.name}
                  </div>
                  <div class="grades-card-date-row">
                    <span class="grades-card-date"
                      >Uploaded On: ${grade.created_at}</span
                    >
                  </div>
                </div>
                <div class="grades-card-badges">
                  <span class="grades-badge grades-badge-publisher"
                    >Publisher</span
                  >
                </div>
              </div>
      `
    })}else{
      userGrades.innerHTML +=`<div class="grades-card">
        <div class="grades-card-icon">
          <img src="../assets/attachicon.png" alt="Grade" class="grades-circle-icon">
        </div>
        <div class="grades-card-info">
          <div class="grades-card-title">No grades</div>
        </div>
      </div>`
    }
    userGrades.innerHTML +=`<a href="../admin/grades.html?user_id=${userDetails.data.id}" class="grades-link" style="padding-left: 20px"
    >View All Grades Related To This User
    <i class="fa fa-chevron-right"></i
  ></a>`


  //subjects
  userSubjects.innerHTML = "";
    if(userDetails.data.subjects && userDetails.data.subjects.length > 0){
    userDetails.data.subjects.forEach((subject) => {
      userSubjects.innerHTML += `
      <div class="subjects-card">
                <div class="subjects-card-icon">
                  <img
                    src="../assets/bookcover.png"
                    alt="Subject"
                    class="subjects-circle-icon"
                  />
                </div>
                <div class="subjects-card-info">
                  <div class="subjects-card-title">${subject.name}</div>
                  <div class="subjects-card-code">${subject.code}</div>
                  <div class="subjects-card-credit">Credit Hour :${subject.credits}</div>
                </div>
              </div>
      `
    })}else{
      userSubjects.innerHTML +=`<div class="subjects-card">
        <div class="subjects-card-icon">
          <img src="../assets/bookcover.png" alt="Subject" class="subjects-circle-icon">
        </div>
        <div class="subjects-card-info">
          <div class="subjects-card-title">No subjects</div>
        </div>
      </div>`
    }
    userSubjects.innerHTML +=` <a href="../admin/courses.html?user_id=${userDetails.data.id}" class="subjects-link" style="padding-left: 20px"
              >View All Subject Related To This User
              <i class="fa fa-chevron-right"></i
            ></a>`


    //activity logs
    userActivityLogs.innerHTML = "";
    if(userDetails.data.logs && userDetails.data.logs.length > 0){
    userDetails.data.logs.forEach((activity) => {
      userActivityLogs.innerHTML += `
      <div class="activity-log-card">
              <div class="activity-log-card-info">
                <div class="activity-log-card-title">
                  ${activity.action}
                </div>
                <div class="activity-log-card-date">${changeDateFormat2(activity.created_at)}</div>
              </div>
            </div>
      `
    })}else{
      userActivityLogs.innerHTML +=`<div class="activity-log-card">
        <div class="activity-log-card-info">
          <div class="activity-log-card-title">No activity logs</div>
        </div>
      </div>`
    }
    userActivityLogs.innerHTML +=`<a href="../admin/logs.html?user_id=${userDetails.data.id}" class="activity-logs-link" style="padding-left: 20px"
            >View All Activity Logs Related To This User
            <i class="fa fa-chevron-right"></i
          ></a>`


    console.log(userDetails);

    }
    else{
      hideLoading();
      showToast("error", "Error", "Failed to get user details", "");
      return null;
    }
    }
    catch (error) {
      hideLoading();
      showToast(
        "error",
        "Error",
        error.response?.data?.message || "Failed to get user details",
        ""
      );
    }
}

const editRoleBtn = document.getElementById("edit-role-btn");
const userRoleContainer = document.getElementById("user-role-container");
const roleFormContainer = document.getElementById("role-form-container");

const roleForm = document.getElementById("role-form");
const roleSelect = document.getElementById("role-select");
const cancelRoleBtn = document.getElementById("cancel-role-btn")
const updateRoleBtn = document.getElementById("update-role-btn");

const customRolesDropdown = document.getElementById("customRolesDropdown");
const customRolesValue = document.getElementById("customRolesValue");
const roleHidden = document.getElementById("role_hidden");

async function updateUserRole(roleId){
  showLoading();
  try {
    const userDetails = await getUserDetails();
    console.log(userDetails);
    console.log(roleSelect.value);
    const res = await axios.patch(`${domain}/admin/users/update`, {
      data_to_update: [{
        id: userDetails.data.id,
        approved :true,
        role_id : roleSelect.value
      }]
    }, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json"
      },
      withCredentials: true
    });
    hideLoading();
      showToast("success", "Success", "Role updated successfully", "");
      userRoleContainer.classList.remove("d-none");
      roleFormContainer.classList.add("d-none");
      getAndFetchUserDetails();
  } catch (error) {
    hideLoading();
    showToast("error", "Error", error.response?.data?.message || "Failed to update role", "");
  }
}

updateRoleBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  await updateUserRole(roleSelect.value);
});

editRoleBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  userRoleContainer.classList.add("d-none");
  roleFormContainer.classList.remove("d-none");
  roleSelect.value = currentRole;
});
cancelRoleBtn?.addEventListener("click", async (e) => {
  e.preventDefault();
  userRoleContainer.classList.remove("d-none");
  roleFormContainer.classList.add("d-none");
});
;
async function loadRoles(){
  await IsLoggedIn();
  showLoading();
  try {
    const roles = await searchRoles("");
    const userDetails = await getUserDetails();
    roleSelect.innerHTML = "";
    const option = document.createElement("option");
    option.value = userDetails.data.role.id;
    option.textContent = userDetails.data.role.name;
    roleSelect.appendChild(option);
    roles.data.forEach(role => {
      if(role.id !== userDetails.data.role.id){
      const option = document.createElement("option");
        option.value = role.id;
        option.textContent = role.name;
        roleSelect.appendChild(option);
      }
    });
    hideLoading();
  } catch (error) {
    hideLoading();
    showToast("error", "Error", error.response?.data?.message || "Failed to load roles", "");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  
  if (window.location.pathname.includes("/admin/user_details")) {
    await getAndFetchUserDetails();
    await loadRoles();
  }

});

//  Pending Users

const pendingUsersContainer = document.getElementById("pendingUsersContainer");
const pendingUsersTitle = document.getElementById("pendingUsersTitle");
const approvePendingBtn = document.getElementById("approve-pending-btn");
const rejectPendingBtn = document.getElementById("reject-pending-btn");
const approveAllPendingBtn = document.getElementById("approveAllPendingBtn");
const rejectAllPendingBtn = document.getElementById("rejectAllPendingBtn");

async function getPendingUsers(){
  try {
    await IsLoggedIn();
    showLoading();
    const params = {
      query: searchQuery,
      page: 1,
      limit: 20,
    };

    if (selectedFaculty)
      params.faculty_id = selectedFaculty.isNaN
        ? selectedFaculty
        : Number(selectedFaculty);
    if (selectedDepartment)
      params.department_id = selectedDepartment.isNaN
        ? selectedDepartment
        : Number(selectedDepartment);
    if (selectedYear)
      params.year_id = selectedYear.isNaN ? selectedYear : Number(selectedYear);

    const response = await axios.get(`${domain}/admin/users?is_active=false`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json"
      },
      params,
      withCredentials: true
    });
    hideLoading();
    return response.data;
  } catch (error) {
    hideLoading();
    showToast("error", "Error", error.response?.data?.message || "Failed to get pending users", "");
    return null;
  }
}
async function getAllPendingUsers(){
  try {
    await IsLoggedIn();
    showLoading();

    const params = {
      query: searchQuery,
      page: 1,
      limit: 100,
      is_active: false,
    };

    if (selectedFaculty)
      params.faculty_id = selectedFaculty.isNaN
        ? selectedFaculty
        : Number(selectedFaculty);
    if (selectedDepartment)
      params.department_id = selectedDepartment.isNaN
        ? selectedDepartment
        : Number(selectedDepartment);
    if (selectedYear)
      params.year_id = selectedYear.isNaN ? selectedYear : Number(selectedYear);
    const response = await axios.get(`${domain}/admin/search-users`, {
      params,
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      },    withCredentials: true
    });
    console.log(response);
    hideLoading();
    return response;
  } catch (error) {
    hideLoading();
    showToast("error", "Error", error.response?.data?.message || "Failed to get all pending users", "");
    return null;
  }
}

  async function fetchAndRenderPendingUsers() {
    approvePendingBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      await approvePendingUser(e.target.getAttribute("data-id"));
    });
    rejectPendingBtn?.addEventListener("click", async (e) => {
      e.preventDefault();
      await rejectPendingUser(e.target.getAttribute("data-id"));
    });
    try {
    pendingUsersContainer.innerHTML = "";
    pendingUsersTitle.innerHTML = "Pending Applications (-)";
    pendingUsersContainer.innerHTML = `<div class="pending-mini-card page-1 mb-0">
                <div class="pending-mini-content flex-row justify-content-center">
                  <div class="pending-mini-row pending-mini-name m-0 ">
                    loading...
                  </div>
                </div>
              </div>`;
    
    await IsLoggedIn();
    const response = await getPendingUsers();
    const users = Array.isArray(response?.data) ? response.data : [];
    pendingUsersContainer.innerHTML = "";
    if (users.length === 0) {
      pendingUsersContainer.innerHTML = `<div class="pending-mini-card page-1 mb-0">
        <div class="pending-mini-content flex-row justify-content-center">
          <div class="pending-mini-row pending-mini-name m-0 ">
            No pending users found
          </div>
        </div>
      </div>`;
    }
    pendingUsersTitle.innerHTML = `Pending Applications (${users.length})`;
    let imgSrc = "";
    users.forEach(async (user) => {
      imgSrc = user?.details?.avatar || user?.google_avatar || "../assets/user-default-avatar.png" ;
      if(imgSrc.includes("drive")){
        imgSrc = `https://drive.google.com/thumbnail?id=${await GetFileId(imgSrc)}&sz=w1000`;
      }
      console.log(user, imgSrc);
      
      pendingUsersContainer.innerHTML += `
<div class="pending-mini-card page-1">
                <img class="pending-mini-avatar" src="${imgSrc}" alt="Avatar">
                <div class="pending-mini-content">
                  <div class="pending-mini-row pending-mini-name">${user.name}</div>
                  <div class="pending-mini-row pending-mini-email-phone">
                    <span><i class="fa fa-envelope"></i> ${user.email}</span>
                    <span><i class="fa fa-phone"></i> ${user.phone}</span>
                  </div>
                  <div class="pending-mini-row pending-mini-badges">
                    <span class="pending-mini-badge-engineering">
                      <img src="../assets/m1.png" alt="Engineering" style="width:20px;height:20px;">
                      <span class="pending-mini-badge-engineering-text">${user.faculty.name}</span>
                    </span>
                    <span class="pending-mini-badge pending-mini-badge-secondary">
                      <img src="../assets/m2.png" alt="Electrical" style="width:20px;height:20px;">
                      ${user.department.name}
                    </span>
                    <span class="pending-mini-badge pending-mini-badge-year">
                      <img src="../assets/m3.png" alt="Year" style="width:20px;height:20px;">
                      ${user.year.year}
                    </span>
                  </div>
                  <div class="pending-mini-id-row">
                    <span class="pending-mini-id-label">
                      <img src="../assets/m4.png" alt="ID Card" style="width:20px;height:20px;">
                      Approval Image
                    </span>
                    <button class="pending-mini-id-btn btn btn-outline-secondary btn-sm" data-img="${user?.pending_user?.url}">
                      <img src="../assets/m5.png" alt="View" style="width:20px;height:20px;">
                      View Image
                    </button>
                  </div>
                  <div class="pending-mini-actions-row">
                    <button class="btn btn-success" id="approve-pending-btn" data-id="${user.id}"><i class="fa fa-check"></i> Approve</button>
                    <button class="btn btn-danger" id="reject-pending-btn" data-id="${user.id}"><i class="fa fa-times"></i> Reject</button>
                  </div>
                </div>
            </div>
      `;
    });


    hideLoading();
  } catch (err) {
    hideLoading();
    showToast(
      "error",
      "Error",
      err.response?.data?.message || "Failed to load pending users",
      ""
    );
  }
  }

  // approve pending user
  async function approvePendingUser(userId){
    try {
      await IsLoggedIn();
      showLoading();
      const res = await axios.patch(`${domain}/admin/users/update`, {
        "data_to_update": [
        {"id": userId, "approved": true}
    ]
      }, {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json"
        },
        withCredentials: true
      });
      hideLoading();
      showToast("success", "Success", "Pending user approved successfully", "");
      fetchAndRenderPendingUsers();
    } catch (error) {
      hideLoading();
      showToast("error", "Error", error.response?.data?.message || "Failed to approve pending user", "");
    }
  }


  // reject pending user
  async function rejectPendingUser(userId){
    try {
      await IsLoggedIn();
      showLoading();
      const res = await axios.patch(`${domain}/admin/users/update`, {
        "data_to_update": [
        {"id": userId, "approved": false}
      ]
    }, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json"
      },
      withCredentials: true
    });
    hideLoading();
    showToast("success", "Success", "Pending user rejected successfully", "");
    fetchAndRenderPendingUsers();
    } catch (error) {
      hideLoading();
    showToast("error", "Error", error.response?.data?.message || "Failed to reject pending user", "");
  }}
  
  pendingUsersContainer?.addEventListener("click", async (e) => {
    if(e.target.closest("#approve-pending-btn")){
      e.preventDefault();
      await approvePendingUser(e.target.getAttribute("data-id"));
    }
    if(e.target.closest("#reject-pending-btn")){
      e.preventDefault();
      await rejectPendingUser(e.target.getAttribute("data-id"));
    }
  });

  //approve all pending users

  async function approveAllPendingUsers(){
    try {
      await IsLoggedIn();
      showLoading();
      const users = await getAllPendingUsers();
      users.data.data.forEach(async (user) => {
        const res = await axios.patch(`${domain}/admin/users/update`, {
          "data_to_update": [
          {"id": user.id, "approved": true}
      ]
        }, {
          headers: {
            "Authorization": `Bearer ${GetCookie("access_token")}`,
            "ngrok-skip-browser-warning": "true",
            "Content-Type": "application/json"
          },
          withCredentials: true
        });
        console.log(res);
      });
    hideLoading();
    showToast("success", "Success", "All pending users approved successfully", "");
    fetchAndRenderPendingUsers();
  } catch (error) {
    hideLoading();
    showToast("error", "Error", error.response?.data?.message || "Failed to approve all pending users", "");
  }
  }
  
  approveAllPendingBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const users = await getAllPendingUsers();
    if(users.data.data.length > 0){
      showPopup('confirm', 'Approve All Users', `Are you sure you want to approve all these (${users.data.length}) Users?`, async() => {await approveAllPendingUsers(); closePopup(); });
    }else{
      showToast("error", "Error", "No pending users found", "");
    }
  });

  //reject all pending users
  async function rejectAllPendingUsers(){
    try {
      await IsLoggedIn();
      showLoading();
      const users = await getAllPendingUsers();
      users.data.data.forEach(async (user) => {
        const res = await axios.patch(`${domain}/admin/users/update`, {
          "data_to_update": [
          {"id": user.id, "approved": false}
        ]
      }, {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json"
        },
        withCredentials: true
      });
      });
      
    hideLoading();
    showToast("success", "Success", "All pending users rejected successfully", "");
    fetchAndRenderPendingUsers();
  } catch (error) {
    hideLoading();
    showToast("error", "Error", error.response?.data?.message || "Failed to reject all pending users", "");
  }
  }
  
  rejectAllPendingBtn?.addEventListener("click", async (e) => {
    e.preventDefault();
    const users = await getAllPendingUsers();
    if(users.data.data.length > 0){
      showPopup('confirm', 'Reject All Users', `Are you sure you want to reject all these (${users.data.length}) Users?`, async() => {await rejectAllPendingUsers(); closePopup(); });
    }else{
      showToast("error", "Error", "No pending users found", "");
    }
  });