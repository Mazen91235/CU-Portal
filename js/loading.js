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
    document.addEventListener("DOMContentLoaded", () => {
      // Load navbar
      fetch("/components/navbar.html")
        .then(res => res.text())
        .then(navbarHtml => {
          document.getElementById("navbar-container").innerHTML = navbarHtml;

          // Load sidebar
          fetch("/components/sidebar.html")
            .then(res => res.text())
            .then(sidebarHtml => {
              document.getElementById("sidebar-container").innerHTML = sidebarHtml;

              const toggleButton = document.getElementById("menu-toggle");
              const sidebar = document.getElementById("sidebar");
              const contentWrapper = document.getElementById("content-wrapper");
              const navbar = document.getElementById('navbar-container');


              if (toggleButton && sidebar && contentWrapper) {
                toggleButton.addEventListener("click", () => {
                  sidebar.classList.toggle("visible");
                  sidebar.classList.toggle("hidden");
                  contentWrapper.classList.toggle("sidebar-hidden");
                    navbar.classList.toggle('navbar-shrink');

                });
              } else {
                console.warn("Toggle failed. Elements missing:", { toggleButton, sidebar, contentWrapper });
              }

          // ✅ HIGHLIGHT ACTIVE NAV ITEM HERE
          const navItems = document.querySelectorAll('.nav-item');
          const currentPage = window.location.pathname.split('/').pop();

          navItems.forEach(item => {
            const link = item.querySelector('a.nav-link');
            if (!link) return;

            const linkPage = link.getAttribute('href').split('/').pop();
            if (linkPage === currentPage) {
              navItems.forEach(i => i.classList.remove('active'));
              item.classList.add('active');
            }
          });
            });
        });
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
    document.getElementById("prev-month").addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });

    document.getElementById("next-month").addEventListener("click", () => {
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