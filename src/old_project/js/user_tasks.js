// User Functions
async function initFilters(){
    await IsLoggedIn();
    const searchInput = document.getElementById('search_tasks_input');
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
        tasks = [];
        await fetchAndRenderTasks();
    });
}
async function fetchAndRenderTasks() {
    try{
        await IsLoggedIn();
        showLoading();
        const response = await axios.get(`${domain}/user/tasks`, {
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
            showToast("error", "Error", response.data?.message || "Failed to load tasks", "");
            return;
        }
        hideLoading();
        filters.next = response.data.next;
        tasks.push(...response.data.data);
        document.querySelector(".task-grid").innerHTML = "";
        tasks.forEach(task => {
        document.querySelector(".task-grid").innerHTML += `
        <article class="task-card">
        <div class="task-title">${task.name.length > 30? task.name.slice(0, 30)+"...":task.name}</div>
        <div class="task-row task-row-subject">
          <span class="task-label">
            <img src="../assets/m110.svg" class="task-icon" alt="Subject icon" />
            Subject
          </span>
          <span class="task-value">${task.subject.name.length > 20? task.subject.name.slice(0, 20) + "...":task.subject.name}</span>
        </div>
        <div class="task-row task-row-deadline">
          <span class="task-label">
            <img src="../assets/m100.svg" class="task-icon" alt="Deadline icon" />
            Deadline
          </span>
          <span class="task-value">${formatDueDate(task.deadline)}</span>
        </div>
        <button class="btn-view" type="button" aria-label="View details for ${task.name}" onclick="window.location.href='/user/task_details.html?id=${task.id}'">
          <i class="far fa-eye"></i> View Details
        </button>
      </article>
        `;
        });
    } catch (error) {
        hideLoading();
        showToast("error", "Error", error.response?.data?.message || "Failed to load tasks", "");
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
            await fetchAndRenderTasks();
        } catch (error) {
            showToast("error", "Error", "Failed to load more tasks", "");
            // Optionally revert the page increment on error
            filters.page--;
        } finally {
            isFetching = false; // Reset flag regardless of success/failure
        }
    }
}
document.body.addEventListener('scroll', scrolled);
const elements = {
    previewer: document.getElementById('previewer'),
    previewerCloseBtn: document.getElementById('closePreviewerBtn'),
    previewerIframe: document.getElementById('filePreviewFrame'),
};
const materialBeingPreviewed = {
    id: null,
    name: null,
    real_name: null,
    mime_type: null
};
function getDownloadName(fileName, realFileName, mimeType) {
    if (!fileName) return realFileName;

    const mimeToExt = {
        // images
        'image/png': '.png',
        'image/jpeg': '.jpg',
        'image/webp': '.webp',
        'image/gif': '.gif',
        'image/bmp': '.bmp',
        'image/svg+xml': '.svg',
        'image/tiff': '.tiff',
        'image/heic': '.heic',

        // docs
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
        'application/vnd.google-apps.document': '.docx',

        // sheets
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
        'application/vnd.google-apps.spreadsheet': '.xlsx',

        // presentations
        'application/vnd.ms-powerpoint': '.ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
        'application/vnd.google-apps.presentation': '.pptx',

        // pdf
        'application/pdf': '.pdf',

        // video
        'video/mp4': '.mp4',
        'video/mpeg': '.mpeg',
        'video/quicktime': '.mov',
        'video/x-msvideo': '.avi',
        'video/x-ms-wmv': '.wmv',
        'video/webm': '.webm',
        'video/ogg': '.ogv',
        'video/3gpp': '.3gp',
        'video/3gpp2': '.3g2',

        // audio
        'audio/mpeg': '.mp3',
        'audio/mp3': '.mp3',
        'audio/wav': '.wav',
        'audio/ogg': '.ogg',
        'audio/aac': '.aac',
        'audio/flac': '.flac',
        'audio/webm': '.weba',
        'audio/3gpp': '.3gp',

        // text
        'text/plain': '.txt',
        'text/csv': '.csv',
        'text/html': '.html',
        'text/css': '.css',
        'text/javascript': '.js',
        'application/json': '.json',
        'application/xml': '.xml',

        // archive
        'application/zip': '.zip',
        'application/x-rar-compressed': '.rar',
        'application/x-7z-compressed': '.7z',
        'application/gzip': '.gz',
        'application/x-tar': '.tar',
        'application/x-bzip2': '.bz2'
    };

    const ext = mimeToExt[mimeType?.toLowerCase()];
    return ext ? `${fileName}${ext}` : realFileName;
}
function closePreviewer(){
    elements.previewerIframe.src = "";
    elements.previewer.querySelector(".previewer-title").textContent = "File Preview";
    elements.previewer.classList.add("d-none");
    materialBeingPreviewed.id = null;
    materialBeingPreviewed.name = null;
    materialBeingPreviewed.real_name = null;
    materialBeingPreviewed.mime_type = null;
}
function previewFile(file_id, file_name, file_real_name, mime_type){
    materialBeingPreviewed.id = file_id;
    materialBeingPreviewed.name = file_name;
    materialBeingPreviewed.real_name = file_real_name;
    materialBeingPreviewed.mime_type = mime_type;
    if(Object.values(materialBeingPreviewed).some(v => !v)){
        showToast("error", "Error", "Invalid file data", "");
        closePreviewer();
        return;
    }
    let nameShortened = materialBeingPreviewed.name ?? materialBeingPreviewed.real_name ?? "File Preview";
    if(nameShortened.length > 40){
        nameShortened = nameShortened.substring(0, 30) + "..." + nameShortened.substring(nameShortened.length - 5);
    }
    elements.previewer.querySelector(".previewer-title").textContent = nameShortened;
    if(elements.previewer.querySelector(".previewer-title").textContent == "File Preview"){
        showToast("error", "Error", "Invalid file name", "");
        closePreviewer();
        return;
    }
    elements.previewer.classList.remove("d-none");
    elements.previewerIframe.src = `https://drive.google.com/file/d/${materialBeingPreviewed.id}/preview`;
}
function downloadFileFromPreviewer(){
    if(Object.values(materialBeingPreviewed).some(v => !v)){
        showToast("error", "Error", "No file is being previewed", "");
        return;
    }
    downloadFile(materialBeingPreviewed.id, getDownloadName(materialBeingPreviewed.name, materialBeingPreviewed.real_name, materialBeingPreviewed.mime_type));
}
function downloadFile(file_id, file_name){
    if(!file_id || !file_name) return;
    const link = document.createElement('a');
    link.href = `https://drive.google.com/uc?export=download&id=${file_id}`;
    link.download = file_name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
async function fetchAndRenderTaskDetails() {
    try{
        await IsLoggedIn();
        showLoading();
        const urlParams = new URLSearchParams(window.location.search);
        const taskId = urlParams.get('id');
        if(!taskId){
            hideLoading();
            showToast("error", "Error", "No task ID provided", "");
            return;
        }
        const response = await axios.get(`${domain}/user/tasks/${taskId}`, {
            headers: {
                "Authorization": `Bearer ${GetCookie("access_token")}`,
                "ngrok-skip-browser-warning": "true"
            },
            withCredentials: true
        });
        if(Math.floor(response.status / 100) != 2){
            hideLoading();
            showToast("error", "Error", response.data?.message || "Failed to load task details", "");
            return;
        }
        hideLoading();
        const task = response.data.data;
        document.querySelector(".title-section").querySelector('h1').textContent = task.name;
        let subjectName = document.createTextNode(task.subject.name);
        document.querySelector(".title-section").querySelectorAll('.meta-item')[0].appendChild(subjectName);
        let dueDate = document.createTextNode(formatDueDate(task.deadline));
        let dueTime = null;
        if (dueDate.textContent.includes('PM') || dueDate.textContent.includes('AM')) {
            dueTime = document.createTextNode('Due: ' + dueDate.textContent.split(' ').slice(-2).join(' ')); // Extract time
            dueDate.textContent = dueDate.textContent.split(' ').slice(0, -2).join(' '); // Remove AM/PM
        }
        document.querySelector(".title-section").querySelectorAll('.meta-item')[1].appendChild(dueDate);
        if(dueTime){
            document.querySelector(".title-section").querySelector('.meta-info').innerHTML += `
            <div class="meta-item">
                <i class="far fa-clock"></i>
            </div>
            `;
            document.querySelector(".title-section").querySelectorAll('.meta-item')[2].appendChild(dueTime);
        }
        document.querySelector('.card-content pre').textContent = task.description || 'No description provided.';
        if(task.url){
            document.querySelector('.submission-content').innerHTML = `
            <a href="${task.url}" class="submission-button submission-link">
                Go To Submission URL
            </a>
            `;
        }else{
            document.querySelector('.submission-content').innerHTML = `
            <span>No submission URL provided.</span>
            `;
        }
        if(task.urls && task.urls.length > 0){
            document.querySelector('.attachments-list').innerHTML = '';
            task.details?.files_data?.forEach(file => {
                document.querySelector('.attachments-list').innerHTML += `
                    <div class="attachment-row" style="margin-bottom: 10px;">
        <div class="attachment-info" >
          <div class="attachment-icon-box">
            <img src="../assets/y2.svg" width="30px">
          </div>
          <div class="attachment-details">
            <h4>${file.name.length > 40 ? file.name.substring(0, 30) + "..." + file.name.substring(file.name.length - 5) : file.name}</h4>
            <div class="attachment-size">${file.size}</div>
          </div>
        </div>
        <div class="attachment-actions">
        <button class="open-link-btn" onclick="previewFile('${file.id}', '${file.name}', '${file.name}', '${file.mimeType}')">
            <img src="../assets/y4.svg" width="20px">
            Preview
          </button>
          <button class="download-button" onclick="downloadFile('${file.id}', '${getDownloadName(file.name, file.name, file.mimeType)}')">
            <img src="../assets/y5.svg" width="20px">            Download
          </button>
          
        </div>
      </div>
                `;
            });
        }else{
            document.querySelector('.attachments-list').innerHTML = '<p>No files provided.</p>';
        }
        if(task.links && task.links.length > 0){
            document.querySelector('.links-list').innerHTML = '';
            task.links.forEach(link => {
                document.querySelector('.links-list').innerHTML += `
                    <div class="link-row " style="margin-bottom: 10px;">
                        <div class="link-info" style="color: black;">
                        <div class="link-icon-box">
                            <img src="../assets/y3.svg" width="25px">
                        </div>
                        ${link.title.length > 40 ? link.title.substring(0, 30) + "..." + link.title.substring(link.title.length - 5) : link.title}
                        </div>
                        <div class="link-actions">
                        <a href="${link.link}" class="open-link-btn" target="_blank">
                            <i class="fas fa-arrow-up-right-from-square"></i>
                            Open
                        </a>
                        </div>
                    </div>
                `;
            });
        }else{
            document.querySelector('.links-list').innerHTML = '<p>No links provided.</p>';
        }
    } catch (error) {
        console.error("Error loading task details:", error);
        hideLoading();
        showToast("error", "Error", error.response?.data?.message || "Failed to load task details", "");
        return;
    }
}