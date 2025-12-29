  document.addEventListener('DOMContentLoaded', function() {
    
      const navLinks = document.querySelectorAll('.header-center a');
      
      navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
          e.preventDefault(); // Prevents page reload (remove if using real links)
          
          // Remove 'active' class from all links
          navLinks.forEach(item => item.classList.remove('active'));
          
          // Add 'active' class to clicked link
          this.classList.add('active');
        });
      });
    });
    async function LoadSidebarAndNavbar(){
      if(window.location.pathname.trim() == '' || window.location.pathname.trim().replace('#','') == '/index.html' || window.location.pathname.trim().replace('#!') == '/index.html') return;
      let user = await GetUser();
      if(!user){
        window.location.href = "/login.html";
        SetCookie("error","Please login to access this resource.");
        return;
      }
      let img = user.details?.avatar ?? user.google_avatar ?? "../assets/user-default-avatar.png";
      if (img.includes("drive")){
        img = `https://drive.google.com/thumbnail?id=${await GetFileId(img)}&sz=w1000`;
      }else if(img.trim() == ""){
        img = "../assets/user-default-avatar.png";
      }
      let name = user.name ?? user.google_name ?? "User";
      let user_sacademic = `${user.department?.code ?? ''} ${user.year?.year ?? ''}`;
      let user_role = user.role.name ?? "Student";
      user_role = capitalize(user_role);
      // Load navbar
      fetch("../components/navbar.html")
        .then(res => res.text())
        .then(navbarHtml => {
          document.getElementById("navbar-container").innerHTML = navbarHtml;
          if (window.location.pathname.replace("index.html", "") == "/user/" || window.location.pathname.replace("index.html", "") == "/user"){
            document.getElementById("profile-link").style.display = "none"; 
            document.getElementById("notification-icon").style.display = "none"; 
          }
          // Set current date in navbar
          const currentDateElem = document.getElementById("current-date");
          if (currentDateElem) {
            const now = new Date();
            const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const monthNames = [
              "January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"
            ];
            const dayName = dayNames[now.getDay()];
            const monthName = monthNames[now.getMonth()];
            const dayNumber = now.getDate();
            const year = now.getFullYear();
            currentDateElem.textContent = `${dayName}, ${monthName} ${dayNumber}, ${year}`;
          }

//     // ======================
// // ✅ Notification logic
// // ======================
// const notifIcon = document.getElementById("notification-icon");
// const notifDropdown = document.getElementById("notifications-dropdown");
// const notifBadge = document.getElementById("badge");
// const notifList = document.getElementById("notifications-list");
// // const notifnumb=document.getElementById("badge");

// let unreadNotifications = [];
// let readNotifications = [];

// async function fetchNotifications() {
//   try {
//     // Fetch unread
//     const unreadRes = await getNotifications({ seen: false, page: 1, limit: 10 });
//     unreadNotifications = unreadRes?.data?.map(n => ({
//       id: n.id,
//       type: n.type,
//       title: n.content,
//       url: n.url,
//       date: n.created_at,
//       unread: true
//     })) || [];

//     // Fetch read
//     const readRes = await getNotifications({ seen: true, page: 1, limit: 10 });
//     readNotifications = readRes?.data?.map(n => ({
//       id: n.id,
//       type: n.type,
//       title: n.content,
//       url: n.url,
//       date: n.created_at,
//       unread: false
//     })) || [];

//     renderNotifications();
//   } catch (err) {
//     console.error("Error fetching notifications:", err);
//   }
// }


// function renderNotifications() {
//   // Badge
//   if (notifBadge) {
//     if (unreadNotifications.length > 0) {
//       console.log("Unread notifications:", unreadNotifications.length);
//       notifBadge.textContent = unreadNotifications.length;
//       notifBadge.classList.remove("d-none");
//     } else {
//       notifBadge.classList.add("d-none");
//     }
//   }

//   // List
//   if (!notifList) return;

//   notifList.innerHTML = "";

//   // Combine unread first, then read
//   [...unreadNotifications, ...readNotifications].forEach(n => {
//     const item = document.createElement("div");
//     item.className = `notification-item ${n.type} ${n.unread ? "unread" : ""}`;

//     // Pick icon based on type
//     let iconSrc = "../assets/Margin.svg"; // fallback
//     switch (n.type) {
//       case "grade": iconSrc = "../assets/Margin.svg"; break;
//       case "due": iconSrc = "../assets/Margin (3).svg"; break;
//       case "material": iconSrc = "../assets/Margin (2).svg"; break;
//       case "reminder": iconSrc = "../assets/Margin (1).svg"; break;
//     }

//     item.innerHTML = `
//       <div class="notification-icon">
//         <img src="${iconSrc}" alt="${n.type}" style="width:24px; height:24px;" />
//       </div>
//       <a href="${n.url}" target="_blank">
//         <div class="notification-content">
//           <div class="notification-title">${n.title}</div>
//           <div class="notification-meta">
//             ${n.course ?? ""}<br>
//             <small>${n.date}</small>
//           </div>
//         </div>
//       </a>
//     `;

//     notifList.appendChild(item);
//   });
// }


function getIcon(type) {
    switch (type) {
      case "grade": return "Margin.svg";
      case "due": return "Margin (3).svg";
      case "material": return "Margin (2).svg";
      case "reminder": return "Margin (1).svg";
      default: return "y8.svg"; // fallback
    }
  }
// async function markAllNotificationsAsSeen() {
//   try {
//     if (!Array.isArray(unreadNotifications) || unreadNotifications.length === 0) {
//       return;
//     }

//     await Promise.all(unreadNotifications.map(n => markNotificationAsSeen(n.id)));

//     // Update state
//     unreadNotifications.forEach(n => n.unread = false);
//     readNotifications = [...unreadNotifications, ...readNotifications];
//     unreadNotifications = [];

//     renderNotifications();
//   } catch (err) {
//     showToast("error","error","Error marking notifications as seen", "");
//   }
// }
// // Open dropdown → mark all as read
// if (notifIcon && notifDropdown) {
//   notifIcon.addEventListener("click", async (e) => {
//     e.preventDefault();
//     notifDropdown.classList.toggle("d-none");

//     if (!notifDropdown.classList.contains("d-none")) {
//       // ✅ Call API to mark all as seen
//       await markAllNotificationsAsSeen();

//       // Update state
//       unreadNotifications.forEach(n => (n.unread = false));
//       readNotifications = [...unreadNotifications, ...readNotifications];
//       unreadNotifications = [];

//       renderNotifications();
//     }
//   });
// }

// // ✅ fetch notifications initially
// fetchNotifications();






    // ======================
// ✅ Notification logic
// ======================
const notifIcon = document.getElementById("notification-icon");
const notifDropdown = document.getElementById("notifications-dropdown");
const notifBadge = document.getElementById("badge");
const notifList = document.getElementById("notifications-list");
// const notifnumb=document.getElementById("badge");
  
let unreadNotifications = [];
let readNotifications = [];

async function fetchNotifications() {
  try {
    // Fetch unread
    const unreadRes = await getNotifications({ seen: false, page: 1, limit: 10 });
    unreadNotifications = unreadRes?.data?.map(n => ({
      id: n.id,
      type: n.type,
      title: n.content,
      url: n.url,
      date: n.created_at,
      unread: true
    })) || [];

    // Fetch read
    const readRes = await getNotifications({ seen: true, page: 1, limit: 10 });
    readNotifications = readRes?.data?.map(n => ({
      id: n.id,
      type: n.type,
      title: n.content,
      url: n.url,
      date: n.created_at,
      unread: false
    })) || [];

    renderNotifications();
  } catch (err) {
    console.error("Error fetching notifications:", err);
  }
}


function renderNotifications() {
  // Badge
  if (notifBadge) {
    if (unreadNotifications.length > 0) {
      console.log("Unread notifications:", unreadNotifications.length);
      notifBadge.textContent = unreadNotifications.length;
      notifBadge.classList.remove("d-none");
    } else {
      notifBadge.classList.add("d-none");
    }
  }

  // List
  if (!notifList) return;

  notifList.innerHTML = "";
  // Combine unread first, then read
  if(unreadNotifications.length > 0){
  unreadNotifications.forEach(n => {
    const item = document.createElement("div");
    item.className = `notification-item ${n.type} ${n.unread ? "unread" : ""}`;
    // Pick icon based on type
    let iconSrc = "../assets/Margin.svg"; // fallback
    switch (n.type) {
      case "grade": iconSrc = "../assets/Margin.svg"; break;
      case "due": iconSrc = "../assets/Margin (3).svg"; break;
      case "material": iconSrc = "../assets/Margin (2).svg"; break;
      case "reminder": iconSrc = "../assets/Margin (1).svg"; break;
    }    
      item.innerHTML = `
        <div class="notification-icon">
          <img src="${iconSrc}" alt="${n.type}" style="width:24px; height:24px;" />
        </div>
        <a href="${n.url}" target="_blank">
          <div class="notification-content">
            <div class="notification-title">${n.title}</div>
            <div class="notification-meta">
              ${n.course ?? ""}<br>
              <small>${n.date}</small>
            </div>
          </div>
        </a>
      `;

    notifList.appendChild(item);
  });
  }else{
    notifList.innerHTML = `
      <div class="notification-item">
        <div class="notification-content">No notifications</div>
      </div>
    `;
  }
}


function getIcon(type) {
    switch (type) {
      case "grade": return "Margin.svg";
      case "due": return "Margin (3).svg";
      case "material": return "Margin (2).svg";
      case "reminder": return "Margin (1).svg";
      default: return "y8.svg"; // fallback
    }
  }
async function markAllNotificationsAsSeen() {
  try {
    if (!Array.isArray(unreadNotifications) || unreadNotifications.length === 0) {
      return;
    }

    await Promise.all(unreadNotifications.map(n => markNotificationAsSeen(n.id)));

    // Update state
    unreadNotifications.forEach(n => n.unread = false);
    readNotifications = [...unreadNotifications, ...readNotifications];
    unreadNotifications = [];

    renderNotifications();
  } catch (err) {
    showToast("error","error","Error marking notifications as seen", "");
  }
}
// Open dropdown → mark all as read
if (notifIcon && notifDropdown) {
  notifIcon.addEventListener("click", async (e) => {
    e.preventDefault();
    notifDropdown.classList.toggle("d-none");

    if (!notifDropdown.classList.contains("d-none")) {
      await markAllNotificationsAsSeen();

      // Update state
      unreadNotifications.forEach(n => (n.unread = false));
      readNotifications = [...unreadNotifications, ...readNotifications];
      unreadNotifications = [];

      renderNotifications();
    }
  });
}

// ✅ fetch notifications initially
fetchNotifications();







// Load sidebar
fetch("../components/sidebar.html")
  .then(res => res.text())
  .then(async (sidebarHtml) => {
    document.getElementById("sidebar-container").innerHTML = sidebarHtml;

const toggleButton = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const contentWrapper = document.getElementById("content-wrapper");
const navbar = document.getElementById("navbar-container");

    if (window.innerWidth > 768) {
      // Desktop: show sidebar
      sidebar.classList.add("visible");
      sidebar.classList.remove("hidden");
      contentWrapper.classList.remove("sidebar-hidden");
      navbar.classList.add("navbar-shrink");
    } else {
      // Mobile: hide sidebar
      sidebar.classList.remove("visible");
      sidebar.classList.add("hidden");
      contentWrapper.classList.add("sidebar-hidden");
      navbar.classList.remove("navbar-shrink");
    }

if (toggleButton && sidebar && contentWrapper) {
  toggleButton.onclick = () => {
    console.log(contentWrapper.classList.contains("sidebar-hidden"))
    sidebar.classList.toggle("visible");
    sidebar.classList.toggle("hidden");
    contentWrapper.classList.toggle("sidebar-hidden");
    navbar.classList.toggle("navbar-shrink");
  };
}
 else {
                console.warn("Toggle failed. Elements missing:", { toggleButton, sidebar, contentWrapper });
              }

              // HIGHLIGHT ACTIVE NAV ITEM HERE
              const navItems = document.querySelectorAll('.nav a');
              const currentPage = window.location.pathname;
              navItems.forEach(link => {
                const linkPage = link.getAttribute('href');
                if (linkPage.replace("index.html", "") == currentPage.replace("index.html", "") || link.getAttribute('activates') && link.getAttribute('activates').replace("index.html", "") == currentPage.replace("index.html", "")) {
                  navItems.forEach(i => {
                    i.classList.remove('active');
                    if (i.parentNode && i.parentNode.parentNode && i.parentNode.parentNode.parentNode){
                      i.parentNode.parentNode.parentNode.classList.remove('active');
                      i.parentNode.parentNode.parentNode.classList.remove('has_active');
                    }
                link.classList.add('active');
                if (link.parentNode && link.parentNode.parentNode && link.parentNode.parentNode.parentNode){
                  link.parentNode.parentNode.parentNode.classList.add('active');
                  link.parentNode.parentNode.parentNode.classList.add('has_active');
                }
              });
                }
              });
              const navLis = document.querySelectorAll('#sidebar > ul > li');
              navLis.forEach(li => {
                li.addEventListener('click', function() {
                  // Close other open sub-menus
                  if(!li.classList.contains('active') && !li.classList.contains('has_active'))
                    navLis.forEach(otherLi => {
                      if (otherLi !== li && !otherLi.querySelector('ul li a.active')) {
                        otherLi.classList.remove('active');
                      }
                    });
                  // Toggle current sub-menu
                  li.classList.toggle('active');
                });
              });
    // Set user info in sidebar and navbar
    document.getElementById("navbar-container").querySelector(".profile-img").src = img;
    document.getElementById("user-name-sidebar").textContent = name;
    document.getElementById("user-academic-sidebar").textContent = user_sacademic;
    document.getElementById("sidebar").querySelector(".user-card img").src = img;
    document.getElementById("user-role-sidebar").textContent = user_role;

    // Put User Name if Exists
    if (document.getElementById("user") && (window.location.pathname.endsWith("/user/enrolled_courses.html" || window.location.pathname.endsWith("/user/enrolled_courses")))){
      document.getElementById("user").textContent = name.split(" ")[0];
    }

    // Handle Showing and Hiding Admin Links Based on Roles
    let permissions = await GetPermissions();
    const adminLinks = {
      adminPage: {
        element: document.getElementById("adminPageLink"),
        requiredPermission: "View Admin Panel"
      },
      facultiesLinkAdmin: {
        element: document.getElementById("facultiesLinkAdmin"),
        requiredPermission: "View Faculties"
      },
      departmentsLinkAdmin: {
        element: document.getElementById("departmentsLinkAdmin"),
        requiredPermission: "View Departments"
      },
      yearsLinkAdmin: {
        element: document.getElementById("yearsLinkAdmin"),
        requiredPermission: "View Years"
      },
      usersLinkAdmin: {
        element: document.getElementById("usersLinkAdmin"),
        requiredPermission: "View Users"
      },
      courseMapsLinkAdmin: {
        element: document.getElementById("courseMapsLinkAdmin"),
        requiredPermission: "View Course Maps"
      },
      rolesLinkAdmin: {
        element: document.getElementById("rolesLinkAdmin"),
        requiredPermission: "View Roles"
      },
      coursesLinkAdmin: {
        element: document.getElementById("coursesLinkAdmin"),
        requiredPermission: "View Courses"
      },
      materialsLinkAdmin: {
        element: document.getElementById("materialsLinkAdmin"),
        requiredPermission: "View Materials"
      },
      gradesLinkAdmin: {
        element: document.getElementById("gradesLinkAdmin"),
        requiredPermission: "View Grades"
      },
      tasksLinkAdmin: {
        element: document.getElementById("tasksLinkAdmin"),
        requiredPermission: "View Tasks"
      },
      examsLinkAdmin: {
        element: document.getElementById("examsLinkAdmin"),
        requiredPermission: "View Exams"
      },
      announcementsLinkAdmin: {
        element: document.getElementById("announcementsLinkAdmin"),
        requiredPermission: "View Announcements"
      },
      logsLinkAdmin: {
        element: document.getElementById("logsLinkAdmin"),
        requiredPermission: "View Logs"
      },
    };
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      document.getElementById("adminPagesLink").classList.remove("d-none");
      Object.keys(adminLinks).forEach(key => {
        const link = adminLinks[key];
        if (link.element && link.requiredPermission && permissions.includes(link.requiredPermission)) {
          link.element.classList.remove("d-none");
        } else {
          link.element.classList.add("d-none");
        }
      });
    }

  });
        });
    }
    document.addEventListener("DOMContentLoaded", () => {
      LoadSidebarAndNavbar();        
    });
          



    document.addEventListener("DOMContentLoaded", function () {
      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
      });
    });

const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const eventTypeToColor = new Map([
      ["Exams", "danger"],
      ["Assignments", "warning"],
      ["Events", "success"]
    ]);

    let currentDate = new Date();

    async function renderCalendar() {
      const calendarGrid = document.getElementById("calendar-grid");
      if (!calendarGrid) return;
      calendarGrid.innerHTML = "";

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      document.getElementById("current-month").textContent =
        `${monthNames[month]} ${year}`;

      const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
      const totalDays = new Date(year, month + 1, 0).getDate();

      for (let i = 0; i < firstDay; i++) {
        calendarGrid.innerHTML += `<div class="calendar-cell empty"></div>`;
      }

      let events = [];
      try {
        // ✅ Replace this with your actual API
        const response = await axios.get(`https://your-api.com/events?year=${year}&month=${month + 1}`);
        events = response.data;
      } catch (error) {
        console.error("Error fetching events:", error);
      }

      for (let day = 1; day <= totalDays; day++) {
        const fullDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const dayEvents = events.filter(e => e.date === fullDate);

        let tooltipHTML = "";
        let dotsHTML = "";

        dayEvents.forEach(event => {
          const color = eventTypeToColor.get(event.type) || "secondary";
          tooltipHTML += `
            <div class='mb-2 d-flex align-items-start'>
              <span class='dot bg-${color} me-2 mt-1'></span>
              <div>
                <div><strong>${event.title}</strong></div>
                <div class='text-muted small'>${event.time}</div>
              </div>
            </div>`;
          dotsHTML += `<span class="dot bg-${color}"></span>`;
        });

        const tooltipAttr = dayEvents.length
          ? `data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-html="true" title="${tooltipHTML.replace(/"/g, '&quot;')}"`
          : "";

        const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
        const todayClass = isToday ? "today" : "";

        calendarGrid.innerHTML += `
          <div class="calendar-cell ${todayClass}" ${tooltipAttr}>
            <span class="day-number">${day}</span>
            <div class="dots">${dotsHTML}</div>
          </div>`;
      }

      const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
      tooltipTriggerList.map(el => new bootstrap.Tooltip(el, {
        delay: { show: 200, hide: 50 },
        animation: true
      }));
    }

    // Navigation buttons
    document.getElementById("prev-month")?.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });

    document.getElementById("next-month")?.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });

    // Initial load
    window.onload = renderCalendar;
document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function() {
      this.classList.toggle('active');
      mobileMenu.classList.toggle('active');
      
      // Toggle body overflow when menu is open
      if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!mobileMenu.contains(e.target) && !toggle.contains(e.target)) {
        toggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
});

// let unreadNotifications = [];
// let readNotifications = [];

// async function loadNotifications() {
//   try {
//     // Fetch unread (seen=false)
//     const unreadRes = await getNotifications({ seen: false, page: 1, limit: 10 });
//     unreadNotifications = (unreadRes?.data || []).map(n => ({
//       id: n.id,
//       type: n.type,
//       title: n.content,
//       url: n.url,
//       date: n.created_at,
//       unread: true
//     }));

//     // Fetch read (seen=true)
//     const readRes = await getNotifications({ seen: true, page: 1, limit: 10 });
//     readNotifications = (readRes?.data || []).map(n => ({
//       id: n.id,
//       type: n.type,
//       title: n.content,
//       url: n.url,
//       date: n.created_at,
//       unread: false
//     }));

//     renderNotificationsDropdown();
//   } catch (err) {
//     console.error("Failed to load notifications:", err);
//   }
// }
// function renderNotificationsDropdown() {
//   const list = document.getElementById("notifications-list");
//   const badge = document.getElementById("notification-badge");

//   list.innerHTML = "";

//   // Show unread first, then read (limit to 4 latest)
//   const latest = [...unreadNotifications, ...readNotifications]
//     .sort((a, b) => new Date(b.date) - new Date(a.date))
//     .slice(0, 4);

//   latest.forEach(n => {
//     list.innerHTML += `
//       <div class="notification-item ${n.type}">
//         <div class="notification-icon">
//           <img src="../assets/${getIcon(n.type)}" alt="${n.type}" style="width:24px;height:24px;" />
//         </div>
//         <a href="${n.url}" target="_blank">
//           <div class="notification-content">
//             <div class="notification-title">${n.title}</div>
//             <div class="notification-meta"><small>${formatAgo(n.date)}</small></div>
//           </div>
//         </a>
//       </div>`;
//   });

//   // Update badge
//   const unreadCount = unreadNotifications.length;
//   if (unreadCount > 0) {
//     badge.textContent = unreadCount;
//     badge.classList.remove("d-none");
//   } else {
//     badge.classList.add("d-none");
//     badge.textContent = "";
//   }
// }
// const notifIcon = document.getElementById("notification-icon");
// const notifDropdown = document.getElementById("notifications-dropdown");
// const notifBadge = document.getElementById("notification-badge");

// notifIcon.addEventListener("click", async (e) => {
//   e.preventDefault();

//   notifDropdown.classList.toggle("d-none");

//   if (!notifDropdown.classList.contains("d-none")) {
//     if (unreadNotifications.length > 0) {
//       try {
//         // Mark all as seen (backend)
//         await markAllNotificationsAsSeen();

//         // Move unread → read
//         unreadNotifications.forEach(n => n.unread = false);
//         readNotifications = [...unreadNotifications, ...readNotifications];
//         unreadNotifications = [];

//         // Update UI
//         renderNotificationsDropdown();
//       } catch (err) {
//         console.error("Failed to mark all as read:", err);
//       }
//     }
//   }
// });
// document.addEventListener("DOMContentLoaded", loadNotifications);
document.addEventListener("click", (e) => {
  if (e.target && e.target.id === "view-allnotif-btn") {
    console.log("✅ View All button clicked");
    window.location.href = "/user/notification.html";
  }
});

