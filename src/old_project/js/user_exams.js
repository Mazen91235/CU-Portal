// User Functions
async function initFilters(){
    await IsLoggedIn();
    const searchInput = document.getElementById('search_exams_input');
    const subjectFilter = document.getElementById('customSubjectFilter');
    const subjectDropdown = document.getElementById('customSubjectDropdown');
    const subjectValue = document.getElementById('customSubjectValue');
    const subjectHidden = document.getElementById('subject_hidden');
    const courses = await fetchEnrolledCourses();
    if(!courses){
        showToast("error", "Error", "Failed to load courses", "");
        return;
    }
    subjectDropdown.innerHTML = '<li data-value="">All Subjects</li>';
    courses.forEach(course => {
        const option = document.createElement('li');
        option.setAttribute('data-value', course.id);
        option.textContent = course.name;
        subjectDropdown.appendChild(option);
    });
    searchInput.addEventListener('input', async function(e){
        filters.query = e.target.value || '';
        filters.page = 1;
        exams = [];
        await fetchAndRenderExams();
    });
}
async function fetchAndRenderExams() {
    try{
        await IsLoggedIn();
        showLoading();
        const response = await axios.get(`${domain}/user/exams`, {
            params: {
                subject_id: filters.subject_id,
                start_date: filters.start_date,
                end_date: filters.end_date,
                query: filters.query,
                page: filters.page,
                limit: filters.limit
            },
            headers: {
                "Authorization": `Bearer ${GetCookie("access_token")}`,
                "ngrok-skip-browser-warning": "true"
            },
            withCredentials: true
        });
        if(Math.floor(response.status / 100) != 2){
            hideLoading();
            showToast("error", "Error", response.data?.message || "Failed to load exams", "");
            return;
        }
        hideLoading();
        filters.next = response.data.next;
        exams.push(...response.data.data);
        document.querySelector(".exam-grid").innerHTML = "";
        exams.forEach(exam => {
        let dueDate = formatDueDate(exam.deadline);
        let dueTime = null;
        if (dueDate.includes('PM') || dueDate.includes('AM')) {
            dueTime = dueDate.split(' ').slice(-2).join(' ');
            dueDate = dueDate.split(' ').slice(0, -2).join(' '); // Remove AM/PM
        }
        document.querySelector(".exam-grid").innerHTML += `
        <article class="exam-card" tabindex="0" aria-labelledby="os-title" data-date="${exam.deadline.includes(' ') ? exam.deadline.split(' ')[0].split('-').reverse().join('-') : exam.deadline.split('-').reverse().join('-')}" data-subject="${exam.subject.code}">
        <div class="exam-title" id="os-title">
          ${exam.name.length > 30? exam.name.slice(0, 30) + "...": exam.name}
        </div>
        <div class="exam-badges">
          <span class="exam-badge">${exam.subject.code}</span>
          ${exam.details?.exam_format ? `<span class="exam-badge">${exam.details.exam_format}</span>` : ''}
        </div>
        <div class="exam-info-row exam-info-date">
          <span class="exam-info-label">
            <img src="../assets/m100.svg" class="exam-info-icon" alt="Date icon" />
            Date
          </span>
          <span class="exam-info-value">${dueDate}</span>
        </div>
        <div class="exam-info-row exam-info-time">
          <span class="exam-info-label">
            <img src="../assets/m101.svg" class="exam-info-icon" alt="Time icon" />
            Start Time
          </span>
          <span class="exam-info-value">${dueTime || '-'}</span>
        </div>
        <div class="exam-info-row exam-info-time">
          <span class="exam-info-label">
            <img src="../assets/m101.svg" class="exam-info-icon" alt="Time icon" />
            Duration
          </span>
          <span class="exam-info-value">${exam.details?.duration + ' Hours' || '-'}</span>
        </div>
        <div class="exam-info-row exam-info-location">
          <span class="exam-info-label">
            <img src="../assets/m102.svg" class="exam-info-icon" alt="Location icon" />
            Location
          </span>
          <span class="exam-info-value">${exam.details?.location || '-'}</span>
        </div>
        <a class="btn-view" href="/user/exam_details.html?id=${exam.id}" style="text-decoration: none;" aria-label="View details for Operating Systems exam">
          <i class="far fa-eye"></i> &nbsp; View Exam Details
        </a>
      </article>
        `;
        });
    } catch (error) {
        hideLoading();
        showToast("error", "Error", error.response?.data?.message || "Failed to load exams", "");
        return;
    }
}
let isFetching = false;
async function scrolled() {
    if(!filters.next || isFetching) return; // No more pages to load
    const scrollTop = document.body.scrollTop;
    const scrollHeight = document.body.scrollHeight;
    const clientHeight = document.body.clientHeight;
    console.log({scrollTop, scrollHeight, clientHeight, isFetching});
    // Check if we're near the bottom (within 100px) and not currently fetching
    if (scrollTop + clientHeight >= scrollHeight - 100 && !isFetching) {
        isFetching = true; // Set flag to prevent multiple simultaneous requests
        filters.page++;
        
        try {
            await fetchAndRenderExams();
        } catch (error) {
            showToast("error", "Error", "Failed to load more exams", "");
            // Optionally revert the page increment on error
            filters.page--;
        } finally {
            isFetching = false; // Reset flag regardless of success/failure
        }
    }
}
document.body.addEventListener('scroll', scrolled);
async function fetchAndRenderExamDetails() {
    try{
        await IsLoggedIn();
        showLoading();
        const urlParams = new URLSearchParams(window.location.search);
        const examId = urlParams.get('id');
        if(!examId){
            hideLoading();
            showToast("error", "Error", "No exam ID provided", "");
            return;
        }
        const response = await axios.get(`${domain}/user/exams/${examId}`, {
            headers: {
                "Authorization": `Bearer ${GetCookie("access_token")}`,
                "ngrok-skip-browser-warning": "true"
            },
            withCredentials: true
        });
        if(Math.floor(response.status / 100) != 2){
            hideLoading();
            showToast("error", "Error", response.data?.message || "Failed to load exam details", "");
            return;
        }
        hideLoading();
        const exam = response.data.data;
        document.querySelector(".exam-banner-badge-code").textContent = exam.subject.code;
        document.querySelector(".exam-banner-title").textContent = exam.name;
        document.querySelector(".exam-banner-subtitle").textContent = exam.type;
        document.querySelector(".exam-overview").querySelector('p').textContent = exam.description ?? 'No description provided.';
        document.querySelector(".instruction-list").textContent = exam.details?.instructions ?? 'No instructions provided.';
        let dueDate = document.createTextNode(formatDueDate(exam.deadline));
        let dueTime = null;
        if (dueDate.textContent.includes('PM') || dueDate.textContent.includes('AM')) {
            dueTime = document.createTextNode(dueDate.textContent.split(' ').slice(-2).join(' ')); // Extract time
            dueDate.textContent = dueDate.textContent.split(' ').slice(0, -2).join(' '); // Remove AM/PM
        }
        document.querySelector(".exam-details").querySelectorAll('.detail-content')[0].querySelector('h3').textContent = dueDate.textContent;
        if(dueTime || exam.details?.duration){
            let p = document.createElement('p');
            if(dueTime && exam.details?.duration){
                let dueTimeDate = new Date(`1970-01-01T${dueTime.textContent.split(' ')[0].padStart(5,'0')}:00`);
                let endTimeDate = new Date(dueTimeDate.getTime() + (exam.details.duration * 60 * 60 * 1000));
                let endDateString = endTimeDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
                p.textContent = dueTime.textContent + ' - ' + endDateString;
            } else if(dueTime){
                p.textContent = dueTime.textContent;
            } else if(exam.details?.duration){
                p.textContent = exam.details?.duration + ' Hours';
            }
            document.querySelector(".exam-details").querySelectorAll('.detail-content')[0].appendChild(p);
        }
        document.querySelector(".exam-details").querySelectorAll('.detail-content')[1].querySelector('p').textContent = exam.details?.location || '-';
        document.querySelector(".exam-details").querySelectorAll('.detail-content')[2].querySelector('p').textContent = exam.details?.duration ? exam.details.duration + ' Hours' : '-';
        document.querySelector(".additional-info").querySelectorAll('.info-group')[0].querySelector('p').textContent = exam.details?.exam_format || '-';
        document.querySelector(".additional-info").querySelectorAll('.info-group')[1].querySelector('p').textContent = exam.details?.weight || '-';
    } catch (error) {
        console.error("Error loading exam details:", error);
        hideLoading();
        showToast("error", "Error", error.response?.data?.message || "Failed to load exam details", "");
        return;
    }
}