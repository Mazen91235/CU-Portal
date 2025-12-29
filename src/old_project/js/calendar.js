async function fetchCalendar(year = new Date().getFullYear(), month = new Date().getMonth()) {
    await IsLoggedIn();
    try {
        showLoading();
        const response = await axios.get(`${domain}/user/calendar`, {
            params: { 
                month: month + 1, // Months are 0-indexed in JS
                year: year 
            },
            headers: {
                "Authorization": `Bearer ${GetCookie("access_token")}`,
                "ngrok-skip-browser-warning": "true"
            },
            withCredentials: true
        });
        if (Math.floor(response?.status / 100) != 2) {
            showToast("error", "Error", response?.data?.message || "Failed to load calendar data", "");
            hideLoading();
            return null;
        }
        hideLoading();
        console.log(response.data, year, month);
        return response.data;
    } catch (error) {
        hideLoading();
        showToast("error", "Error", error.response?.data?.message || "Failed to load calendar data", "");
        return null;
    }
}
let selectedDate = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
const eventsData = {};
// Dynamically load navbar and sidebar components with error handling
document.addEventListener("DOMContentLoaded", async function () {
    let calendarEvents = await fetchCalendar();
    if (!calendarEvents) return;
    calendarEvents = calendarEvents.data;
    // --- Calendar & Details Logic ---
    Object.entries(calendarEvents).forEach(([dateStr, eventsObj]) => {
        eventsData[dateStr] = [];
                    eventsObj.exams.forEach(exam => {
                let start_time = null;
                if(exam.deadline && exam.deadline.includes(' ')){
                    start_time = exam.deadline.split(' ')[1].split(':').slice(0, 2).join(':');
                    start_hour = parseInt(start_time.split(':')[0]);
                    start_mins = parseInt(start_time.split(':')[1]);
                    end_hour = start_hour + (exam.details?.duration ? Math.floor(exam.details.duration) : 2);
                    end_mins = start_mins + (exam.details?.duration ? (exam.details.duration % 1) * 60 : 0);
                    if (end_mins >= 60) {
                        end_hour += Math.floor(end_mins / 60);
                        end_mins = end_mins % 60;
                    }
                }
                eventsData[dateStr].push({
                    type: "exam",
                    title: exam.name,
                    due: formatDueDate(exam.deadline),
                    time: (start_time) ? start_time + (exam.details?.duration ? " - " + String(end_hour).padStart(2, '0') + ":" + String(end_mins).padStart(2, '0') : "") : "",
                    location: exam.location,
                    id: exam.id,
                });
            });
        eventsObj.tasks.forEach(task => {
                eventsData[dateStr].push({
                    type: "assignment",
                    title: task.name,
                    description: task.description,
                    due: formatDueDate(task.deadline),
                    id: task.id,
                });
            });
    });
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    // Select today's date if in current month/year
    const today = new Date();
    if (today.getFullYear() === currentYear && today.getMonth() === currentMonth) {
        selectedDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }

    if (!(window.location.pathname.replace("index.html", "") == "/user/" || window.location.pathname.replace("index.html", "") == "/user")){
        renderCalendar(currentYear, currentMonth);
        renderDetails();
    }else{
        selectedDate = null;
        renderCalendar(currentYear, currentMonth);
    }
});
function renderCalendar(year, month) {
    const today = new Date();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay(); // 0=Sun
    const daysInMonth = lastDay.getDate();

    let html = `
<div class="calendar-nav d-flex justify-content-center align-items-center mb-3">
    <button class="calendar-nav-btn" id="prev-month"><i class="fa fa-chevron-left"></i></button>
    <span class="calendar-nav-label mx-3">${monthNames[month]} ${year}</span>
    <button class="calendar-nav-btn" id="next-month"><i class="fa fa-chevron-right"></i></button>
</div>
<div class="calendar-table-outer">
<table class="table table-borderless text-center mb-0 calendar-table">
    <thead>
        <tr>
            <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th>
            <th>Thu</th><th>Fri</th><th>Sat</th>
        </tr>
    </thead>
    <tbody>
`;

    let day = 1;
    for (let i = 0; i < 6; i++) {
        html += '<tr class="calendar-row-gap">';
        for (let j = 0; j < 7; j++) {
            if ((i === 0 && j < startDay) || day > daysInMonth) {
                html += "<td></td>";
            } else {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const events = eventsData[dateStr] || [];
                let dots = "";
                if (events.length) {
                    // Show up to 3 dots, one per type
                    const types = {};
                    let countExtra = 0;
                    events.forEach(ev => {
                        if (types[ev.type]) countExtra++;
                        types[ev.type] = true;
                    });
                    if (types.assignment) dots += '<span class="event-dot event-dot-assignment"></span>';
                    if (types.event) dots += '<span class="event-dot event-dot-event"></span>';
                    if (types.exam) dots += '<span class="event-dot event-dot-exam"></span>';
                    if (countExtra > 0) dots += `<span class="event-dot event-dot-more">+${countExtra}</span>`;
                }
                const isSelected = selectedDate === dateStr;
                html += `<td>
            <button class="calendar-day-btn${isSelected ? ' selected' : ''}" data-date="${dateStr}">
                <span class="calendar-day-number">${day}</span>
                <div class="calendar-day-dots">${dots}</div>
            </button>
        </td>`;
                day++;
            }
        }
        html += "</tr>";
        if (day > daysInMonth) break;
    }
    html += "</tbody></table></div>";
    document.getElementById("calendar-section").innerHTML = html;

    // Month navigation
    document.getElementById("prev-month").onclick = async () => {
        if (currentMonth === 0) {
            currentMonth = 11;
            currentYear--;
        } else {
            currentMonth--;
        }
        const response = await fetchCalendar(currentYear, currentMonth);
        if (!response) {
            showToast("error", "Error", "Failed to load calendar data", "");
            return;
        }
        Object.keys(eventsData).forEach(key => delete eventsData[key]);
        Object.entries(response.data).forEach(([dateStr, eventsObj]) => {
            eventsData[dateStr] = [];
                        eventsObj.exams.forEach(exam => {
                let start_time = null;
                if(exam.deadline && exam.deadline.includes(' ')){
                    start_time = exam.deadline.split(' ')[1].split(':').slice(0, 2).join(':');
                    start_hour = parseInt(start_time.split(':')[0]);
                    start_mins = parseInt(start_time.split(':')[1]);
                    end_hour = start_hour + (exam.details?.duration ? Math.floor(exam.details.duration) : 2);
                    end_mins = start_mins + (exam.details?.duration ? (exam.details.duration % 1) * 60 : 0);
                    if (end_mins >= 60) {
                        end_hour += Math.floor(end_mins / 60);
                        end_mins = end_mins % 60;
                    }
                }
                eventsData[dateStr].push({
                    type: "exam",
                    title: exam.name,
                    due: formatDueDate(exam.deadline),
                    time: (start_time) ? start_time + (exam.details?.duration ? " - " + String(end_hour).padStart(2, '0') + ":" + String(end_mins).padStart(2, '0') : "") : "",
                    location: exam.location,
                    id: exam.id,
                });
            });
            eventsObj.tasks.forEach(task => {
                eventsData[dateStr].push({
                    type: "assignment",
                    title: task.name,
                    description: task.description,
                    due: formatDueDate(task.deadline),
                    id: task.id,
                });
            });
        });
        renderCalendar(currentYear, currentMonth);
        if (!(window.location.pathname.replace("index.html", "") == "/user/" || window.location.pathname.replace("index.html", "") == "/user"))
            renderDetails();
    };
    document.getElementById("next-month").onclick = async () => {
        if (currentMonth === 11) {
            currentMonth = 0;
            currentYear++;
        } else {
            currentMonth++;
        }
        const response = await fetchCalendar(currentYear, currentMonth);
        if (!response) {
            showToast("error", "Error", "Failed to load calendar data", "");
            return;
        }
        Object.keys(eventsData).forEach(key => delete eventsData[key]);
        Object.entries(response.data).forEach(([dateStr, eventsObj]) => {
            eventsData[dateStr] = [];
            eventsObj.tasks.forEach(task => {
                eventsData[dateStr].push({
                    type: "assignment",
                    title: task.name,
                    description: task.description,
                    due: formatDueDate(task.deadline),
                    id: task.id,
                });
            });
            eventsObj.exams.forEach(exam => {
                let start_time = null;
                if(exam.deadline && exam.deadline.includes(' ')){
                    start_time = exam.deadline.split(' ')[1].split(':').slice(0, 2).join(':');
                    start_hour = parseInt(start_time.split(':')[0]);
                    start_mins = parseInt(start_time.split(':')[1]);
                    end_hour = start_hour + (exam.details?.duration ? Math.floor(exam.details.duration) : 2);
                    end_mins = start_mins + (exam.details?.duration ? (exam.details.duration % 1) * 60 : 0);
                    if (end_mins >= 60) {
                        end_hour += Math.floor(end_mins / 60);
                        end_mins = end_mins % 60;
                    }
                }
                eventsData[dateStr].push({
                    type: "exam",
                    title: exam.name,
                    due: formatDueDate(exam.deadline),
                    time: (start_time) ? start_time + (exam.details?.duration ? " - " + String(end_hour).padStart(2, '0') + ":" + String(end_mins).padStart(2, '0') : "") : "",
                    location: exam.location,
                    id: exam.id,
                });
            });
        });
        renderCalendar(currentYear, currentMonth);
        if (!(window.location.pathname.replace("index.html", "") == "/user/" || window.location.pathname.replace("index.html", "") == "/user"))
            renderDetails();
    };

    // Day selection
    document.querySelectorAll(".calendar-day-btn").forEach(btn => {
        btn.onclick = () => {
            selectedDate = btn.getAttribute("data-date");
            renderCalendar(currentYear, currentMonth);
            renderDetails();
        };
    });
}

function renderDetails() {
    if (window.location.pathname.replace("index.html", "") == "/user/" || window.location.pathname.replace("index.html", "") == "/user"){
        document.getElementById('calendar-day-popup').style.display = 'flex';
        const events = eventsData[selectedDate] || [];
        const dateObj = new Date(selectedDate);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = dateObj.toLocaleDateString(undefined, options);
        document.querySelector('.card-title span').textContent = dateStr;
        if(!events?.length){
            imgSrc = "../assets/nothing.jpg";
                    imgAlt = "nothing";
                    title = `Nothing scheduled for ${dateStr}`;
                    desc = "You're all clear. Enjoy your day off! 🎉";
                    content = `
                <div class="card p-4 text-center" style="background:#fff;border:none;">
                    <div class="details-img-wrapper mb-3" style="justify-content:center;">
                        <img src="${imgSrc}" alt="${imgAlt}" class="details-img" style="width:192px;height:192px;">
                    </div>
                    <h5 class="mb-2">${title}</h5>
                    <p class="mb-3" style="color:#888;">${desc}</p>
                </div>
            `;
        }else{
            // Events for selected day
                    imgSrc = ""; // No image, use icon
                    imgAlt = "calendar";
                    title = dateStr;
                    eventList = events.map(ev => {
                        if (ev.type === "event") {
                            return `
                        <div class="event-detail-card mb-3">
                            <div class="fw-semibold">${ev.title} <span class="badge badge-event ms-1">Event</span></div>
                            <div class="small text-muted mt-1"><i class="far fa-clock me-1"></i>${ev.time || ""} <i class="fa-solid fa-location-dot ms-2 me-1"></i>${ev.location || ""}</div>
                            <button class="btn btn-view btn-event"><div class="d-flex align-items-center justify-content-center w-100">
                            ><i class="far fa-eye me-1"></i>View Event</div></button>
                        </div>
                    `;
                        }
                        if (ev.type == "assignment") {
                            return `
                        <div class="event-detail-card mb-3">
                            <div class="fw-semibold">${ev.title} 
                                <span class="badge badge-assignment ms-1">Assignment</span>
                            </div>
                            <div class="small text-muted mt-1"><i class="far fa-clock me-1"></i>${ev.due ? "Due: " + ev.due : ""}</div>
                            <button class="btn btn-view btn-assignment" onclick="window.location.href='/user/task_details.html?id=${ev.id}'"><div class="w-100 d-flex align-items-center justify-content-center">
                            <i class="far fa-eye me-1"></i>View Assignment</div></button>
                        </div>
                    `;
                        }
                        if (ev.type == "exam") {
                            return `
                        <div class="event-detail-card mb-3">
                            <div class="fw-semibold">${ev.title} 
                                <span class="badge badge-exam ms-1">Exam</span>
                            </div>
                            <div class="small text-muted mt-1"><i class="far fa-clock me-1"></i>${ev.due ? "Due: " + ev.due : ""}</div>
                            <div class="small text-muted mt-1"><!--<i class="far fa-clock me-1"></i>${ev.time || ""}--> ${ev.location ? '<i class="fa-solid fa-location-dot ms-2 me-1"></i>'+ ev.location : ""}</div>
                            <button class="btn btn-view btn-exam" onclick="window.location.href='/user/exam_details.html?id=${ev.id}'"><div class="w-100 d-flex align-items-center justify-content-center">
                            <i class="far fa-eye me-1"></i>View Exam</div></button>
                        </div>
                    `;
                }
        }).join("");
        content = eventList;
        }
        document.querySelector(".calendar-day-popup-content").innerHTML = content;
        selectedDate = null;
        renderCalendar(currentYear, currentMonth);
    }else{        
            const details = document.getElementById("details-section");
            let imgSrc = "../assets/select.jpg";
            let imgAlt = "select";
            let title = "";
            let desc = "";
            let eventList = "";
            let content = "";
            if (!selectedDate) {
                // No day selected
                title = "Select a day to see what's happening 🚀";
                desc = "Click on any date to view your events, assignments, and exams";
                content = `
            <div class="card p-4 text-center" style="background:#fff;border:none;box-shadow:0 2px 16px 0 rgba(44,44,44,0.08);">
                <div class="details-img-wrapper mb-3" style="justify-content:center;">
                    <img src="${imgSrc}" alt="${imgAlt}" class="details-img" style="width:192px;height:192px;">
                </div>
                <h5 class="mb-2">${title}</h5>
                <p class="mb-3" style="color:#888;">${desc}</p>
            </div>
        `;
            } else {
                const events = eventsData[selectedDate] || [];
                const dateObj = new Date(selectedDate);
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                const dateStr = dateObj.toLocaleDateString(undefined, options);
        
                if (!events.length) {
                    // No events for selected day
                    imgSrc = "../assets/nothing.jpg";
                    imgAlt = "nothing";
                    title = `Nothing scheduled for ${dateStr}`;
                    desc = "You're all clear. Enjoy your day off! 🎉";
                    content = `
                <div class="card p-4 text-center" style="background:#fff;border:none;box-shadow:0 2px 16px 0 rgba(44,44,44,0.08);">
                    <div class="details-img-wrapper mb-3" style="justify-content:center;">
                        <img src="${imgSrc}" alt="${imgAlt}" class="details-img" style="width:192px;height:192px;">
                    </div>
                    <h5 class="mb-2">${title}</h5>
                    <p class="mb-3" style="color:#888;">${desc}</p>
                </div>
            `;
                } else {
                    // Events for selected day
                    imgSrc = ""; // No image, use icon
                    imgAlt = "calendar";
                    title = dateStr;
                    eventList = events.map(ev => {
                        if (ev.type === "event") {
                            return `
                        <div class="event-detail-card mb-3">
                            <div class="fw-semibold">${ev.title} <span class="badge badge-event ms-1">Event</span></div>
                            <div class="small text-muted mt-1"><i class="far fa-clock me-1"></i>${ev.time || ""} <i class="fa-solid fa-location-dot ms-2 me-1"></i>${ev.location || ""}</div>
                            <button class="btn btn-view btn-event"><div class="d-flex align-items-center justify-content-center w-100">
                            ><i class="far fa-eye me-1"></i>View Event</div></button>
                        </div>
                    `;
                        }
                        if (ev.type == "assignment") {
                            return `
                        <div class="event-detail-card mb-3">
                            <div class="fw-semibold">${ev.title} 
                                <span class="badge badge-assignment ms-1">Assignment</span>
                            </div>
                            <div class="small text-muted mt-1"><i class="far fa-clock me-1"></i>${ev.due ? "Due: " + ev.due : ""}</div>
                            <button class="btn btn-view btn-assignment" onclick="window.location.href='/user/task_details.html?id=${ev.id}'"><div class="w-100 d-flex align-items-center justify-content-center">
                            <i class="far fa-eye me-1"></i>View Assignment</div></button>
                        </div>
                    `;
                        }
                        if (ev.type == "exam") {
                            return `
                        <div class="event-detail-card mb-3">
                            <div class="fw-semibold">${ev.title} 
                                <span class="badge badge-exam ms-1">Exam</span>
                            </div>
                            <div class="small text-muted mt-1"><i class="far fa-clock me-1"></i>${ev.due ? "Due: " + ev.due : ""}</div>
                            <div class="small text-muted mt-1"><!--<i class="far fa-clock me-1"></i>${ev.time || ""}--> ${ev.location ? '<i class="fa-solid fa-location-dot ms-2 me-1"></i>'+ ev.location : ""}</div>
                            <button class="btn btn-view btn-exam" onclick="window.location.href='/user/exam_details.html?id=${ev.id}'"><div class="w-100 d-flex align-items-center justify-content-center">
                            <i class="far fa-eye me-1"></i>View Exam</div></button>
                        </div>
                    `;
                        }
                        return "";
                    }).join("");
                    content = `
                <div class="event-details-card card p-4" style="background:#fff;border:none;box-shadow:0 2px 16px 0 rgba(44,44,44,0.08);">
                    <div class="d-flex align-items-center mb-4" style="gap:16px;">
                        <i class="far fa-calendar"></i>
                        <span style="color:rgba(54, 61, 73, 1);font-size:1.1rem;font-weight:600;vertical-align:middle;">${title}</span>
                    </div>
                    ${eventList}
                </div>
            `;
                }
            }
        
            details.innerHTML = content;
          }
}