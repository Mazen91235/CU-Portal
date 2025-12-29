let selectedGradeIds = [];

document.addEventListener('DOMContentLoaded', async function() {
    await IsLoggedIn();
    await initFilters();
});

async function searchCourses(faculty_id="", department_id="", year_id="") {
    showLoading();
    let response = await axios.get(`${domain}/admin/search-courses`, {
        headers: {
            "Authorization": `Bearer ${GetCookie("access_token")}`,
            "ngrok-skip-browser-warning": "true"
        },
        withCredentials: true,
        params: {
            faculty_id: faculty_id,
            department_id: department_id,
            year_id: year_id
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
const elements = {
    filtersSection: document.querySelector('.filters-section'),
    facultySelect: document.querySelectorAll('.filters-section select')[0],
    departmentSelect: document.querySelectorAll('.filters-section select')[1],
    academicYearSelect: document.querySelectorAll('.filters-section select')[2],
    subjectSelect: document.querySelectorAll('.filters-section select')[3],
    filterPage: document.getElementById('filterPage'),
    emptyPage: document.getElementById('emptyPage'),
    filteredPage: document.getElementById('filteredPage'),
    breadcrumb: document.querySelector('.breadcrumb-nav'),
    subject_breadcrumb_link: document.getElementById('subject_breadcrumb_link'),
    contentGrid : document.querySelector('.content-grid'),
    previewer: document.getElementById('previewer'),
    previewerCloseBtn: document.getElementById('closePreviewerBtn'),
    previewerIframe: document.getElementById('filePreviewFrame'),
};
async function initFilters() {
    // Faculties
    const faculties = await searchFaculties();
    const facultyDropdown = document.getElementById('customFacultyDropdown');
    facultyDropdown.innerHTML = '<li class="active" data-value="">All Faculties</li>';
    if (faculties && faculties.data && faculties.data.length > 0) {
        faculties.data.forEach(faculty => {
            const li = document.createElement('li');
            li.setAttribute('data-value', faculty.id);
            li.textContent = faculty.name;
            facultyDropdown.appendChild(li);
        });
    }

    // Years
    const years = await searchYears();
    const yearDropdown = document.getElementById('customYearDropdown');
    yearDropdown.innerHTML = '<li class="active" data-value="">All Years</li>';
    if (years && years.data && years.data.length > 0) {
        years.data.forEach(year => {
            const li = document.createElement('li');
            li.setAttribute('data-value', year.id);
            li.textContent = year.year;
            yearDropdown.appendChild(li);
        });
    }

    // Department and Course will be fetched on filter change
    // Add listeners to custom dropdowns
    setupCustomFilterListeners();
    // Initial fetch for departments/subjects if needed
    handleCustomFiltersChange();
}
function setupCustomDropdown(filterId, dropdownId, valueId, hiddenId) {
  const filter = document.getElementById(filterId);
  const dropdown = document.getElementById(dropdownId);
  const valueSpan = document.getElementById(valueId);
  const hiddenInput = document.getElementById(hiddenId);
  const arrow = filter.querySelector('.custom-filter-arrow svg');

  filter.addEventListener('click', function (e) {
    document.querySelectorAll('.custom-filter').forEach(f => {
      if (f !== filter) {
        f.classList.remove('open');
        const otherArrow = f.querySelector('.custom-filter-arrow svg');
        if (otherArrow) otherArrow.style.transform = '';
      }
    });
    document.querySelectorAll('.custom-dropdown-list').forEach(d => {
      if (d !== dropdown) d.style.display = 'none';
    });

    filter.classList.toggle('open');
    dropdown.style.display = filter.classList.contains('open') ? 'block' : 'none';
    // if (arrow) {
    //   arrow.style.transition = 'transform 0.2s';
    //   arrow.style.transform = filter.classList.contains('open') ? 'rotate(180deg)' : '';
    // }
    e.stopPropagation();
  });

  dropdown.addEventListener('mousedown', function (e) {
    if (e.target.tagName === 'LI') {
      dropdown.querySelectorAll('li').forEach(li => li.classList.remove('active'));
      e.target.classList.add('active');
      valueSpan.textContent = e.target.textContent;
      hiddenInput.value = e.target.dataset.value;
      filter.classList.remove('open');
      dropdown.style.display = 'none';
      if (arrow) arrow.style.transform = '';
      handleCustomFiltersChange();
    }
  });
}
function setupCustomFilterListeners() {
    // Faculty
    setupCustomDropdown('customFacultyFilter', 'customFacultyDropdown', 'customFacultyValue', 'faculty_hidden');
    // Department
    setupCustomDropdown('customDepartmentFilter', 'customDepartmentDropdown', 'customDepartmentValue', 'department_hidden');
    // Year
    setupCustomDropdown('customYearFilter', 'customYearDropdown', 'customYearValue', 'year_hidden');
    // Course
    setupCustomDropdown('customCourseFilter', 'customCourseDropdown', 'customCourseValue', 'subject_hidden');
}

async function handleCustomFiltersChange() {
    // Get values from hidden inputs
    faculty_changed = !document.getElementById('faculty_hidden').value || !filters.faculty_id || (document.getElementById('faculty_hidden').value != filters.faculty_id);
    any_filter_changed = !document.getElementById('faculty_hidden').value || !filters.faculty_id || (document.getElementById('faculty_hidden').value != filters.faculty_id) || !document.getElementById('department_hidden').value || !filters.department_id || (document.getElementById('department_hidden').value != filters.department_id) || !document.getElementById('year_hidden').value || !filters.academic_year_id || (document.getElementById('year_hidden').value != filters.academic_year_id);
    any_filter_changed_including_subject = any_filter_changed || !document.getElementById('subject_hidden').value || !filters.subject_id || (document.getElementById('subject_hidden').value != filters.subject_id);
    filters.faculty_id = document.getElementById('faculty_hidden').value;
    filters.department_id = document.getElementById('department_hidden').value;
    filters.academic_year_id = document.getElementById('year_hidden').value;
    filters.subject_id = document.getElementById('subject_hidden').value;
    filters.parent_id = any_filter_changed_including_subject ? null : filters.parent_id;
    filters.name = any_filter_changed_including_subject ? null : filters.name;
    document.querySelector(".search-input").value = any_filter_changed_including_subject ? "" : filters.name;

    // Departments
    if (faculty_changed && filters.faculty_id) {
        showLoading();
        const departments = await searchDepartments("", filters.faculty_id);
        const departmentDropdown = document.getElementById('customDepartmentDropdown');
        document.getElementById('customDepartmentDropdown').innerHTML = '<li class="active" data-value="">All Departments</li>';
        document.getElementById('department_hidden').value = '';
        if (departments && departments.data && departments.data.length > 0) {
            departments.data.forEach(department => {
                const li = document.createElement('li');
                li.setAttribute('data-value', department.id);
                li.textContent = department.name;
                departmentDropdown.appendChild(li);
            });
        }
        hideLoading();
    } else if (!filters.faculty_id) {
        document.getElementById('customDepartmentDropdown').innerHTML = '<li class="active" data-value="">All Departments</li>';
        document.getElementById('department_hidden').value = '';
        document.getElementById('customDepartmentValue').textContent = 'All Departments';
    }

    // Courses
    if (any_filter_changed && filters.faculty_id && filters.department_id && filters.academic_year_id) {
        showLoading();
        const subjects = await searchCourses(filters.faculty_id, filters.department_id, filters.academic_year_id);
        const subjectDropdown = document.getElementById('customCourseDropdown');
        document.getElementById('customCourseDropdown').innerHTML = '<li class="active" data-value="">All Courses</li>';
        document.getElementById('subject_hidden').value = '';
        document.getElementById('customCourseValue').textContent = 'All Courses';
        if (subjects && subjects.length > 0) {
            subjects.forEach(subject => {
                const li = document.createElement('li');
                li.setAttribute('data-value', subject.id);
                li.textContent = subject.name;
                subjectDropdown.appendChild(li);
            });
        }
        hideLoading();
    } else if(!filters.faculty_id || !filters.department_id || !filters.academic_year_id) {
        document.getElementById('customCourseDropdown').innerHTML = '<li class="active" data-value="">All Courses</li>';
        document.getElementById('subject_hidden').value = '';
        document.getElementById('customCourseValue').textContent = 'All Courses';
    }

    // If all filters are selected, fetch grades
    if (filters.faculty_id && filters.department_id && filters.academic_year_id && filters.subject_id) {
        await fetchGrades();
    } else {
        clearGrades();
    }
}
const filters = {
    faculty_id: null,
    department_id: null,
    academic_year_id: null,
    subject_id: null,
    parent_id: null,
    name: null
}
function clearGrades() {
    elements.filteredPage.classList.add("d-none");
    elements.emptyPage.classList.add("d-none");
    elements.filterPage.classList.remove("d-none");
}
async function fetchGrades(render=true) {    
    try{
        await IsLoggedIn();
        showLoading();
        const response = await axios.get(`${domain}/admin/grades`, {
            headers: {
                Authorization: `Bearer ${GetCookie("access_token")}`,
                "ngrok-skip-browser-warning": "true",
            },
            withCredentials: true,
            params: {
                faculty_id: filters.faculty_id,
                department_id: filters.department_id,
                year_id: filters.academic_year_id,
                subject_id: filters.subject_id,
                parent_id: filters.parent_id,
                name: filters.name
            }
        });
        if(Math.floor(response.status / 100) != 2){
            hideLoading();
            showToast("error", "Error", response.data?.message || "Failed to fetch grades", "");
            return;
        }
        const grades = response.data.data ?? response.data ?? [];
        if(render){
            await renderGrades(grades);
            cancelSelectionMode();
        }
        hideLoading();
        return grades;
    }catch(error){
        showToast("error", "Error", error?.response?.data?.message || error.message || "Failed to fetch grades", "");
        // clearGrades();
        return;
    }
}
function getFileIcon(fileType){
    switch(fileType){
        case 'folder':
            return '../assets/file-icon-folder.svg';
        case 'image':
            return '../assets/file-icon-image.svg';
        case 'video':
            return '../assets/file-icon-video.svg';
        case 'audio':
            return '../assets/file-icon-audio.svg';
        case 'pdf':
            return '../assets/file-icon-pdf.svg';
        case 'doc':
            return '../assets/file-icon-word.svg';
        case 'sheet':
            return '../assets/file-icon-excel.svg';
        case 'ppt':
            return '../assets/file-icon-powerpoint.svg';
        case 'text':
            return '../assets/file-icon-txt.svg';
        case 'archive':
            return '../assets/file-icon-archive.svg';
        case 'gdrive':
            return '../assets/file-icon-drive.svg';
        case 'unknown':
            return '../assets/file-icon-unknown.svg';
        case 'drive':
            return '../assets/file-icon-drive.svg';
        case 'youtube':
            return '../assets/file-icon-youtube.svg';
        case 'external':
            return '../assets/file-icon-external.svg';
        default:
            return '../assets/file-icon-unknown.svg';
    }
}
async function fetchParents(grade_id, render=true) {
    await IsLoggedIn();
    showLoading();
    try{
        if(!grade_id || grade_id == -1) {
            hideLoading();
            if(render)
                await renderBreadcrumbs([]);
            return [];
        }
        const response = await axios.get(`${domain}/admin/grades/${grade_id}/parents`, {
            headers: {
                Authorization: `Bearer ${GetCookie("access_token")}`,
                "ngrok-skip-browser-warning": "true",
            },
            withCredentials: true
        });
        if(Math.floor(response.status / 100) != 2){
            hideLoading();
            showToast("error", "Error", response.data?.message || "Failed to fetch parent grades", "");
            return [];
        }
        let parents = response.data.data ?? response.data ?? [];
        hideLoading();
        if(render)
            await renderBreadcrumbs(parents);
        return parents;
    }catch(error){
        hideLoading();
        showToast("error", "Error", error?.response?.data?.message || error.message || "Failed to fetch parent grades", "");
        return [];
    }
}

async function renderBreadcrumbs(parents) {
    let breadcrumb = elements.breadcrumb;
    // Use hidden input for subject value and text
    const subjectHidden = document.getElementById('subject_hidden');
    const subjectDropdown = document.getElementById('customCourseDropdown');
    const subjectValue = document.getElementById('customCourseValue').textContent;
    if(!filters.subject_id) return;
    breadcrumb.innerHTML = `
        <span style="display: inline-flex; align-items: center;">
            <img src="../assets/home.svg" alt="Home" style="width:18px;height:18px;margin-right:6px;">
            Grades
        </span>
        <span class="separator">></span>
        <a href="#!" onclick="filters.subject_id='${subjectHidden.value}'; clearSearch(); filters.parent_id=null; fetchGrades();" id="subject_breadcrumb_link">${subjectValue}</a>
    `;
    if(!parents || parents.length == 0) {
        breadcrumb.querySelectorAll('a')[breadcrumb.querySelectorAll('a').length - 1].classList.add('active');
        return;
    }
    for(parent of parents){
        breadcrumb.innerHTML += `
            <span class="separator">></span>
            <a href="#!" data-id="${parent.id}" onclick="filters.parent_id='${parent.id}'; clearSearch(); fetchGrades();" class="breadcrumb-link">${parent.name}</a>
        `;
    }
    breadcrumb.querySelectorAll('a')[breadcrumb.querySelectorAll('a').length - 1].classList.add('active');
}
function clearSearch(){
    filters.name = null;
    // Fix: Only set value if search-input exists
    const searchInput = elements.filteredPage.querySelector(".search-input");
    if (searchInput) {
        searchInput.value = "";
    }
}
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
const gradeBeingPreviewed = {
    id: null,
    name: null,
    real_name: null,
    mime_type: null,
};
function closePreviewer(){
    elements.previewerIframe.src = "";
    elements.previewer.querySelector(".previewer-title").textContent = "File Preview";
    elements.previewer.classList.add("d-none");
    gradeBeingPreviewed.id = null;
    gradeBeingPreviewed.name = null;
    gradeBeingPreviewed.real_name = null;
    gradeBeingPreviewed.mime_type = null;
}
function previewFile(file_id, file_name, file_real_name, mime_type){
    gradeBeingPreviewed.id = file_id;
    gradeBeingPreviewed.name = file_name;
    gradeBeingPreviewed.real_name = file_real_name;
    gradeBeingPreviewed.mime_type = mime_type;
    if(Object.values(gradeBeingPreviewed).some(v => !v)){
        showToast("error", "Error", "Invalid file data", "");
        closePreviewer();
        return;
    }
    let nameShortened = gradeBeingPreviewed.name ?? gradeBeingPreviewed.real_name ?? "File Preview";
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
    elements.previewerIframe.src = `https://drive.google.com/file/d/${gradeBeingPreviewed.id}/preview`;
}
function downloadFileFromPreviewer(){
    if(Object.values(gradeBeingPreviewed).some(v => !v)){
        showToast("error", "Error", "No file is being previewed", "");
        return;
    }
    downloadFile(gradeBeingPreviewed.id, getDownloadName(gradeBeingPreviewed.name, gradeBeingPreviewed.real_name, gradeBeingPreviewed.mime_type));
}
async function downloadFile(file_id, file_name){
    try{    
        showLoading();
        await IsLoggedIn();
        if(!file_id || !file_name) return;
        const link = document.createElement('a');
        // link.href = `https://drive.google.com/uc?export=download&id=${file_id}`; 
        const response = await axios.get(`${domain}/user/download/${file_id}`, {
            headers: {
                'Authorization': `Bearer ${GetCookie("access_token")}`,
                'ngrok-skip-browser-warning': 'true',
            },
            withCredentials: true,
            responseType: 'blob' // Important for binary data
        });
        if(Math.floor(response.status / 100) != 2){
            showToast("error", "Error", response.data?.message || "Failed to download file", "");
            return;
        }
        const blob = new Blob([response.data], { type: response.headers['content-type'] });
        link.href = URL.createObjectURL(blob);
        link.download = file_name;
        document.body.appendChild(link);
        hideLoading();
        link.click();
        document.body.removeChild(link);
    } catch(error){
        showToast("error", "Error", error.response?.data?.message || "Failed to download file", "");
    }
}
function goToLink(url){
    if(!url) return;
    window.open(url, '_blank');
}
async function viewFolder(folder_id){
    if(event.target.closest(".dropdown")) return;
    if(elements.contentGrid.classList.contains("selection-mode")) {
        cancelSelectionMode();
    }
    filters.parent_id=folder_id; 
    clearSearch(); 
    await fetchGrades();
}
let isItemsDragging = false;
const initialPosition = {
    x: 0,
    y: 0,
    card: null,
    clickCount: 0,
    dragTimeout: null
}
async function renderGrades(grades) {
    if(!grades || grades.length == 0){
        elements.emptyPage.classList.remove("d-none");
        elements.filterPage.classList.add("d-none");
        elements.filteredPage.classList.remove("d-none");
        await fetchParents(filters.parent_id || null);
        elements.contentGrid.innerHTML = ""; // Clear grid, don't copy emptyPage HTML
        return;
    }
    elements.emptyPage.classList.add("d-none");
    elements.filterPage.classList.add("d-none");
    elements.filteredPage.classList.remove("d-none");
    await fetchParents(filters.parent_id || null);
    let contentGrid = elements.contentGrid;
    contentGrid.innerHTML = "";
        grades.forEach(grade => {
        if (!grade) return;
        if(grade.type == 'folder'){
            contentGrid.innerHTML += `
            <div class="folder-card" id="grade-${grade.id}" data-foldername="${grade.name}" data-date="${grade.modified_at}">
            <span class="grade-selected-icon">
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="0.400391" width="23.4839" height="24" rx="11.7419" fill="#5A0F61"/>
                    <rect x="6.5" y="6.90039" width="11" height="11" rx="5.5" stroke="white"/>
                    <path d="M10.9789 13.7129L14.5102 10.1816C14.5935 10.0983 14.6907 10.0566 14.8018 10.0566C14.9129 10.0566 15.0102 10.0983 15.0935 10.1816C15.1768 10.265 15.2185 10.364 15.2185 10.4787C15.2185 10.5934 15.1768 10.6923 15.0935 10.7754L11.2706 14.6087C11.1872 14.6921 11.09 14.7337 10.9789 14.7337C10.8678 14.7337 10.7706 14.6921 10.6872 14.6087L8.89558 12.8171C8.81225 12.7337 8.77225 12.6348 8.77558 12.5204C8.77892 12.4059 8.82239 12.3069 8.906 12.2233C8.98961 12.1397 9.08864 12.098 9.20308 12.0983C9.31753 12.0986 9.41642 12.1403 9.49975 12.2233L10.9789 13.7129Z" fill="white"/>
                </svg>
            </span>
        <div class="folder-header">
            <div class="dropdown d-flex align-items-center justify-content-center">
            <button class="btn btn-light btn-sm dropbtn" type="button" data-bs-toggle="dropdown"
            aria-expanded="false" style="width:35px;height:35px;">
            <i class="fas fa-ellipsis-v"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-start shadow-sm">
                <a class="dropdown-item text-muted" href="#!" onclick="event.stopPropagation(); toggleGradeSelection(${grade.id}); this.parentElement.classList.remove('show');">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0,0,256,256">
                        <g fill="#7b1fa2" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.69047,0 -23,10.30953 -23,23c0,12.69047 10.30953,23 23,23c12.69047,0 23,-10.30953 23,-23c0,-12.69047 -10.30953,-23 -23,-23zM25,4c11.60953,0 21,9.39047 21,21c0,11.60953 -9.39047,21 -21,21c-11.60953,0 -21,-9.39047 -21,-21c0,-11.60953 9.39047,-21 21,-21zM34.98828,14.98828c-0.3299,0.0065 -0.63536,0.17531 -0.81641,0.45117l-10.20117,15.03711l-7.29102,-6.76562c-0.26069,-0.25084 -0.63652,-0.34135 -0.98281,-0.23667c-0.3463,0.10468 -0.60907,0.38821 -0.68715,0.74145c-0.07809,0.35324 0.04068,0.72112 0.31059,0.96201l8.99609,8.34766l11.51172,-16.96484c0.2153,-0.3085 0.23926,-0.71173 0.06201,-1.04356c-0.17725,-0.33183 -0.52573,-0.53612 -0.90186,-0.5287z"></path></g></g>
                    </svg>
                </a>
                <a class="dropdown-item text-muted" href="#!" onclick="event.stopPropagation(); editFolder('${grade.id}')">
                    <svg id="editSvg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                        <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                    </svg>
                </a>
                <a class="dropdown-item text-muted" href="#!" onclick="event.stopPropagation(); deleteGrade('${grade.id}', '${grade.name}')">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0,0,256,256">
                        <g fill="#ef4343" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(16,16)"><path d="M6.49609,1c-0.82031,0 -1.49609,0.67578 -1.49609,1.49609v0.50391h-3v1h1v8.5c0,0.82813 0.67188,1.5 1.5,1.5h6c0.82813,0 1.5,-0.67187 1.5,-1.5v-8.5h1v-1h-3v-0.50391c0,-0.82031 -0.67578,-1.49609 -1.49609,-1.49609zM6.49609,2h2.00781c0.28125,0 0.49609,0.21484 0.49609,0.49609v0.50391h-3v-0.50391c0,-0.28125 0.21484,-0.49609 0.49609,-0.49609zM5,5h1v7h-1zM7,5h1v7h-1zM9,5h1v7h-1z"></path></g></g>
                    </svg>
                </a>
            </div>
            </div>
            </div>
            <div class="folder-content">
            <div class="svg">
                <svg width="105" height="88" viewBox="0 0 105 88" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g filter="url(#filter0_dd_1720_6769)">
                    <rect x="12.5" y="2" width="80" height="64" rx="12" fill="url(#paint0_linear_1720_6769)"/>
                    <path d="M65.834 47.3333C66.718 47.3333 67.5659 46.9821 68.191 46.357C68.8161 45.7319 69.1673 44.8841 69.1673 44V27.3333C69.1673 26.4493 68.8161 25.6014 68.191 24.9763C67.5659 24.3512 66.718 24 65.834 24H52.6673C52.1098 24.0055 51.5599 23.871 51.0678 23.609C50.5757 23.3469 50.1573 22.9656 49.8507 22.5L48.5007 20.5C48.1971 20.0391 47.7839 19.6608 47.2981 19.399C46.8124 19.1372 46.2692 19.0001 45.7173 19H39.1673C38.2833 19 37.4354 19.3512 36.8103 19.9763C36.1852 20.6014 35.834 21.4493 35.834 22.3333V44C35.834 44.8841 36.1852 45.7319 36.8103 46.357C37.4354 46.9821 38.2833 47.3333 39.1673 47.3333H65.834Z" stroke="white" stroke-width="3.33333" stroke-linecap="round" stroke-linejoin="round"/>
                    </g>
                    <defs>
                    <filter id="filter0_dd_1720_6769" x="0.5" y="0" width="104" height="88" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
                    <feFlood flood-opacity="0" result="BackgroundImageFix"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feMorphology radius="4" operator="erode" in="SourceAlpha" result="effect1_dropShadow_1720_6769"/>
                    <feOffset dy="4"/>
                    <feGaussianBlur stdDeviation="3"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1720_6769"/>
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                    <feMorphology radius="3" operator="erode" in="SourceAlpha" result="effect2_dropShadow_1720_6769"/>
                    <feOffset dy="10"/>
                    <feGaussianBlur stdDeviation="7.5"/>
                    <feComposite in2="hardAlpha" operator="out"/>
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
                    <feBlend mode="normal" in2="effect1_dropShadow_1720_6769" result="effect2_dropShadow_1720_6769"/>
                    <feBlend mode="normal" in="SourceGraphic" in2="effect2_dropShadow_1720_6769" result="shape"/>
                    </filter>
                    <linearGradient id="paint0_linear_1720_6769" x1="16.5" y1="-2" x2="88.5" y2="70" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#5A0F61"/>
                    <stop offset="1" stop-color="#7B1684"/>
                    </linearGradient>
                    </defs>
                </svg>
            </div>
            <div style="display: flex; flex-direction: column; flex: 1;" class="gap-1">
                <span class="folder-name">${grade.name.length > 30 ? grade.name.substring(0, 25) + "..." + grade.name.substring(grade.name.length - 5) : grade.name}</span>
                <span class="folder-tag">${grade.subject?.code}</span>
                <span class="folder-date">${formatDateIntoPeriod(grade.modified_at_iso)}</span>
            </div>
            <div class="folder-info">
                <span>
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="12" height="12" viewBox="0 0 50 50">
                        <path d="M 3 4 C 1.355469 4 0 5.355469 0 7 L 0 43.90625 C -0.0625 44.136719 -0.0390625 44.378906 0.0625 44.59375 C 0.34375 45.957031 1.5625 47 3 47 L 42 47 C 43.492188 47 44.71875 45.875 44.9375 44.4375 C 44.945313 44.375 44.964844 44.3125 44.96875 44.25 C 44.96875 44.230469 44.96875 44.207031 44.96875 44.1875 L 45 44.03125 C 45 44.019531 45 44.011719 45 44 L 49.96875 17.1875 L 50 17.09375 L 50 17 C 50 15.355469 48.644531 14 47 14 L 47 11 C 47 9.355469 45.644531 8 44 8 L 18.03125 8 C 18.035156 8.003906 18.023438 8 18 8 C 17.96875 7.976563 17.878906 7.902344 17.71875 7.71875 C 17.472656 7.4375 17.1875 6.96875 16.875 6.46875 C 16.5625 5.96875 16.226563 5.4375 15.8125 4.96875 C 15.398438 4.5 14.820313 4 14 4 Z M 3 6 L 14 6 C 13.9375 6 14.066406 6 14.3125 6.28125 C 14.558594 6.5625 14.84375 7.03125 15.15625 7.53125 C 15.46875 8.03125 15.8125 8.5625 16.21875 9.03125 C 16.625 9.5 17.179688 10 18 10 L 44 10 C 44.5625 10 45 10.4375 45 11 L 45 14 L 8 14 C 6.425781 14 5.171875 15.265625 5.0625 16.8125 L 5.03125 16.8125 L 5 17 L 2 33.1875 L 2 7 C 2 6.4375 2.4375 6 3 6 Z M 8 16 L 47 16 C 47.5625 16 48 16.4375 48 17 L 43.09375 43.53125 L 43.0625 43.59375 C 43.050781 43.632813 43.039063 43.675781 43.03125 43.71875 C 43.019531 43.757813 43.007813 43.800781 43 43.84375 C 43 43.863281 43 43.886719 43 43.90625 C 43 43.917969 43 43.925781 43 43.9375 C 42.984375 43.988281 42.976563 44.039063 42.96875 44.09375 C 42.964844 44.125 42.972656 44.15625 42.96875 44.1875 C 42.964844 44.230469 42.964844 44.269531 42.96875 44.3125 C 42.84375 44.71875 42.457031 45 42 45 L 3 45 C 2.4375 45 2 44.5625 2 44 L 6.96875 17.1875 L 7 17.09375 L 7 17 C 7 16.4375 7.4375 16 8 16 Z"></path>
                    </svg>
                    ${grade.details?.folders_count ?? 0}
                </span>
                <span>
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="12" height="12" viewBox="0 0 50 50">
                        <path d="M 7 2 L 7 48 L 43 48 L 43 14.59375 L 42.71875 14.28125 L 30.71875 2.28125 L 30.40625 2 Z M 9 4 L 29 4 L 29 16 L 41 16 L 41 46 L 9 46 Z M 31 5.4375 L 39.5625 14 L 31 14 Z M 15 22 L 15 24 L 35 24 L 35 22 Z M 15 28 L 15 30 L 31 30 L 31 28 Z M 15 34 L 15 36 L 35 36 L 35 34 Z"></path>
                    </svg>
                    ${grade.details?.files_count ?? 0}
                </span>
            </div>
        </div>
    </div>
        `;
        } else if (grade.type === "file") {
            contentGrid.innerHTML += `
                <div class="file-card" id="grade-${grade.id}" data-filename="${grade.name}" data-date="${grade.modified_at}">
                <span class="grade-selected-icon">
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="0.400391" width="23.4839" height="24" rx="11.7419" fill="#5A0F61"/>
                    <rect x="6.5" y="6.90039" width="11" height="11" rx="5.5" stroke="white"/>
                    <path d="M10.9789 13.7129L14.5102 10.1816C14.5935 10.0983 14.6907 10.0566 14.8018 10.0566C14.9129 10.0566 15.0102 10.0983 15.0935 10.1816C15.1768 10.265 15.2185 10.364 15.2185 10.4787C15.2185 10.5934 15.1768 10.6923 15.0935 10.7754L11.2706 14.6087C11.1872 14.6921 11.09 14.7337 10.9789 14.7337C10.8678 14.7337 10.7706 14.6921 10.6872 14.6087L8.89558 12.8171C8.81225 12.7337 8.77225 12.6348 8.77558 12.5204C8.77892 12.4059 8.82239 12.3069 8.906 12.2233C8.98961 12.1397 9.08864 12.098 9.20308 12.0983C9.31753 12.0986 9.41642 12.1403 9.49975 12.2233L10.9789 13.7129Z" fill="white"/>
                </svg>
            </span>
                    <div class="file-header">
            <div class="dropdown d-flex align-items-center justify-content-center">
            <button class="btn btn-light btn-sm dropbtn" type="button" data-bs-toggle="dropdown"
            aria-expanded="false" style="width:35px;height:35px;">
            <i class="fas fa-ellipsis-v"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-start shadow-sm">
                <a class="dropdown-item text-muted" href="#!" onclick="event.stopPropagation(); toggleGradeSelection(${grade.id}); this.parentElement.classList.remove('show');">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0,0,256,256">
                        <g fill="#7b1fa2" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.69047,0 -23,10.30953 -23,23c0,12.69047 10.30953,23 23,23c12.69047,0 23,-10.30953 23,-23c0,-12.69047 -10.30953,-23 -23,-23zM25,4c11.60953,0 21,9.39047 21,21c0,11.60953 -9.39047,21 -21,21c-11.60953,0 -21,-9.39047 -21,-21c0,-11.60953 9.39047,-21 21,-21zM34.98828,14.98828c-0.3299,0.0065 -0.63536,0.17531 -0.81641,0.45117l-10.20117,15.03711l-7.29102,-6.76562c-0.26069,-0.25084 -0.63652,-0.34135 -0.98281,-0.23667c-0.3463,0.10468 -0.60907,0.38821 -0.68715,0.74145c-0.07809,0.35324 0.04068,0.72112 0.31059,0.96201l8.99609,8.34766l11.51172,-16.96484c0.2153,-0.3085 0.23926,-0.71173 0.06201,-1.04356c-0.17725,-0.33183 -0.52573,-0.53612 -0.90186,-0.5287z"></path></g></g>
                    </svg>
                </a>
                <a class="dropdown-item text-muted" href="#!" onclick="event.stopPropagation(); editFile('${grade.id}')">
                    <svg id="editSvg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                        <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                    </svg>
                </a>
                <a class="dropdown-item text-muted" href="#!" onclick="event.stopPropagation(); deleteGrade('${grade.id}', '${grade.name}')">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0,0,256,256">
                        <g fill="#ef4343" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(16,16)"><path d="M6.49609,1c-0.82031,0 -1.49609,0.67578 -1.49609,1.49609v0.50391h-3v1h1v8.5c0,0.82813 0.67188,1.5 1.5,1.5h6c0.82813,0 1.5,-0.67187 1.5,-1.5v-8.5h1v-1h-3v-0.50391c0,-0.82031 -0.67578,-1.49609 -1.49609,-1.49609zM6.49609,2h2.00781c0.28125,0 0.49609,0.21484 0.49609,0.49609v0.50391h-3v-0.50391c0,-0.28125 0.21484,-0.49609 0.49609,-0.49609zM5,5h1v7h-1zM7,5h1v7h-1zM9,5h1v7h-1z"></path></g></g>
                    </svg>
                </a>
            </div>
            </div>
            </div>
                    <div class="file-content">
                        <div class="file-icon">
                            <img src="${getFileIcon(grade?.details?.file_data?.type)}" alt="File Icon" style="width: 20px; height: 20px; object-fit: contain;">
                        </div>
                        <div style="display: flex; flex-direction: column; flex: 1;">
                            <div class="file-name" style="margin-bottom: 4px;">${grade.name.length > 30 ? grade.name.substring(0, 25) + "..." + grade.name.substring(grade.name.length - 5) : grade.name}</div>
                            <span class="file-tag">${grade?.subject?.code}</span>
                            <div class="file-date"> ${formatDateIntoPeriod(grade.modified_at_iso)}</div>
                        </div>
                    </div>
                    <div class="file-actions">
                        <button class="file-action-btn" onclick="event.stopPropagation(); cancelSelectionMode(); previewFile('${grade?.details?.file_data?.id}', '${grade.name}', '${grade?.details?.file_data?.name}', '${grade?.details?.file_data?.mimeType}')">
                            <i class="fas fa-eye"></i> Preview
                        </button>
                        <button class="file-action-btn" onclick="event.stopPropagation(); cancelSelectionMode(); downloadFile('${grade?.details?.file_data?.id}', '${getDownloadName(grade.name, grade?.details?.file_data?.name, grade?.details?.file_data?.mimeType)}')">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                </div>
            `;
        } else {
            if (grade.type === "drive") {
                contentGrid.innerHTML += `
                    <div class="file-card" id="grade-${grade.id}" data-filename="${grade.name}" data-date="${grade.modified_at}">
                    <span class="grade-selected-icon">
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="0.400391" width="23.4839" height="24" rx="11.7419" fill="#5A0F61"/>
                    <rect x="6.5" y="6.90039" width="11" height="11" rx="5.5" stroke="white"/>
                    <path d="M10.9789 13.7129L14.5102 10.1816C14.5935 10.0983 14.6907 10.0566 14.8018 10.0566C14.9129 10.0566 15.0102 10.0983 15.0935 10.1816C15.1768 10.265 15.2185 10.364 15.2185 10.4787C15.2185 10.5934 15.1768 10.6923 15.0935 10.7754L11.2706 14.6087C11.1872 14.6921 11.09 14.7337 10.9789 14.7337C10.8678 14.7337 10.7706 14.6921 10.6872 14.6087L8.89558 12.8171C8.81225 12.7337 8.77225 12.6348 8.77558 12.5204C8.77892 12.4059 8.82239 12.3069 8.906 12.2233C8.98961 12.1397 9.08864 12.098 9.20308 12.0983C9.31753 12.0986 9.41642 12.1403 9.49975 12.2233L10.9789 13.7129Z" fill="white"/>
                </svg>
            </span>
                        <div class="file-header">
            <div class="dropdown d-flex align-items-center justify-content-center">
            <button class="btn btn-light btn-sm dropbtn" type="button" data-bs-toggle="dropdown"
            aria-expanded="false" style="width:35px;height:35px;">
            <i class="fas fa-ellipsis-v"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-start shadow-sm">
                <a class="dropdown-item text-muted" href="#!" onclick="event.stopPropagation(); toggleGradeSelection(${grade.id}); this.parentElement.classList.remove('show');">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0,0,256,256">
                        <g fill="#7b1fa2" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.69047,0 -23,10.30953 -23,23c0,12.69047 10.30953,23 23,23c12.69047,0 23,-10.30953 23,-23c0,-12.69047 -10.30953,-23 -23,-23zM25,4c11.60953,0 21,9.39047 21,21c0,11.60953 -9.39047,21 -21,21c-11.60953,0 -21,-9.39047 -21,-21c0,-11.60953 9.39047,-21 21,-21zM34.98828,14.98828c-0.3299,0.0065 -0.63536,0.17531 -0.81641,0.45117l-10.20117,15.03711l-7.29102,-6.76562c-0.26069,-0.25084 -0.63652,-0.34135 -0.98281,-0.23667c-0.3463,0.10468 -0.60907,0.38821 -0.68715,0.74145c-0.07809,0.35324 0.04068,0.72112 0.31059,0.96201l8.99609,8.34766l11.51172,-16.96484c0.2153,-0.3085 0.23926,-0.71173 0.06201,-1.04356c-0.17725,-0.33183 -0.52573,-0.53612 -0.90186,-0.5287z"></path></g></g>
                    </svg>
                </a>
                <a class="dropdown-item text-muted" href="#!" onclick="event.stopPropagation(); editFile('${grade.id}')">
                    <svg id="editSvg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                        <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                    </svg>
                </a>
                <a class="dropdown-item text-muted" href="#!" onclick="event.stopPropagation(); deleteGrade('${grade.id}', '${grade.name}')">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0,0,256,256">
                        <g fill="#ef4343" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(16,16)"><path d="M6.49609,1c-0.82031,0 -1.49609,0.67578 -1.49609,1.49609v0.50391h-3v1h1v8.5c0,0.82813 0.67188,1.5 1.5,1.5h6c0.82813,0 1.5,-0.67187 1.5,-1.5v-8.5h1v-1h-3v-0.50391c0,-0.82031 -0.67578,-1.49609 -1.49609,-1.49609zM6.49609,2h2.00781c0.28125,0 0.49609,0.21484 0.49609,0.49609v0.50391h-3v-0.50391c0,-0.28125 0.21484,-0.49609 0.49609,-0.49609zM5,5h1v7h-1zM7,5h1v7h-1zM9,5h1v7h-1z"></path></g></g>
                    </svg>
                </a>
            </div>
            </div>
            </div>
                        <div class="file-content">
                        <div class="file-icon">
                            <img src="${getFileIcon("drive")}" alt="File Icon" style="width: 20px; height: 20px; object-fit: contain;">
                        </div>
                        <div style="display: flex; flex-direction: column; flex: 1;">
                            <div class="file-name" style="margin-bottom: 4px;">${grade.name.length > 30 ? grade.name.substring(0, 25) + "..." + grade.name.substring(grade.name.length - 5) : grade.name}</div>
                            <span class="file-tag">${grade?.subject?.code}</span>
                            <div class="file-date"> ${formatDateIntoPeriod(grade.modified_at_iso)}</div>
                        </div>
                        </div>
                        <div class="file-actions">
                            <button class="file-action-btn" onclick="event.stopPropagation(); cancelSelectionMode(); goToLink('${grade.url}')">
                                <i class="fas fa-external-link "></i> Open
                            </button>
                        </div>
                    </div>
                `;
            } else if (grade.type === "youtube") {
                contentGrid.innerHTML += `
                    <div class="file-card" id="grade-${grade.id}" data-filename="${grade.name}" data-date="${grade.modified_at}">
                    <span class="grade-selected-icon">
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="0.400391" width="23.4839" height="24" rx="11.7419" fill="#5A0F61"/>
                    <rect x="6.5" y="6.90039" width="11" height="11" rx="5.5" stroke="white"/>
                    <path d="M10.9789 13.7129L14.5102 10.1816C14.5935 10.0983 14.6907 10.0566 14.8018 10.0566C14.9129 10.0566 15.0102 10.0983 15.0935 10.1816C15.1768 10.265 15.2185 10.364 15.2185 10.4787C15.2185 10.5934 15.1768 10.6923 15.0935 10.7754L11.2706 14.6087C11.1872 14.6921 11.09 14.7337 10.9789 14.7337C10.8678 14.7337 10.7706 14.6921 10.6872 14.6087L8.89558 12.8171C8.81225 12.7337 8.77225 12.6348 8.77558 12.5204C8.77892 12.4059 8.82239 12.3069 8.906 12.2233C8.98961 12.1397 9.08864 12.098 9.20308 12.0983C9.31753 12.0986 9.41642 12.1403 9.49975 12.2233L10.9789 13.7129Z" fill="white"/>
                </svg>
            </span>
                        <div class="file-header">
            <div class="dropdown d-flex align-items-center justify-content-center">
            <button class="btn btn-light btn-sm dropbtn" type="button" data-bs-toggle="dropdown"
            aria-expanded="false" style="width:35px;height:35px;">
            <i class="fas fa-ellipsis-v"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-start shadow-sm">
                <a class="dropdown-item text-muted" href="#!" onclick="event.stopPropagation(); toggleGradeSelection(${grade.id}); this.parentElement.classList.remove('show');">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0,0,256,256">
                        <g fill="#7b1fa2" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.69047,0 -23,10.30953 -23,23c0,12.69047 10.30953,23 23,23c12.69047,0 23,-10.30953 23,-23c0,-12.69047 -10.30953,-23 -23,-23zM25,4c11.60953,0 21,9.39047 21,21c0,11.60953 -9.39047,21 -21,21c-11.60953,0 -21,-9.39047 -21,-21c0,-11.60953 9.39047,-21 21,-21zM34.98828,14.98828c-0.3299,0.0065 -0.63536,0.17531 -0.81641,0.45117l-10.20117,15.03711l-7.29102,-6.76562c-0.26069,-0.25084 -0.63652,-0.34135 -0.98281,-0.23667c-0.3463,0.10468 -0.60907,0.38821 -0.68715,0.74145c-0.07809,0.35324 0.04068,0.72112 0.31059,0.96201l8.99609,8.34766l11.51172,-16.96484c0.2153,-0.3085 0.23926,-0.71173 0.06201,-1.04356c-0.17725,-0.33183 -0.52573,-0.53612 -0.90186,-0.5287z"></path></g></g>
                    </svg>
                </a>
                <a class="dropdown-item text-muted" href="#!" onclick="event.stopPropagation(); editFile('${grade.id}')">
                    <svg id="editSvg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                        <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                    </svg>
                </a>
                <a class="dropdown-item text-muted" href="#!" onclick="event.stopPropagation(); deleteGrade('${grade.id}', '${grade.name}')">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0,0,256,256">
                        <g fill="#ef4343" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(16,16)"><path d="M6.49609,1c-0.82031,0 -1.49609,0.67578 -1.49609,1.49609v0.50391h-3v1h1v8.5c0,0.82813 0.67188,1.5 1.5,1.5h6c0.82813,0 1.5,-0.67187 1.5,-1.5v-8.5h1v-1h-3v-0.50391c0,-0.82031 -0.67578,-1.49609 -1.49609,-1.49609zM6.49609,2h2.00781c0.28125,0 0.49609,0.21484 0.49609,0.49609v0.50391h-3v-0.50391c0,-0.28125 0.21484,-0.49609 0.49609,-0.49609zM5,5h1v7h-1zM7,5h1v7h-1zM9,5h1v7h-1z"></path></g></g>
                    </svg>
                </a>
            </div>
            </div>
            </div>
                        <div class="file-content">
                        <div class="file-icon">
                            <img src="${getFileIcon("youtube")}" alt="File Icon" style="width: 20px; height: 20px; object-fit: contain;">
                        </div>
                        <div style="display: flex; flex-direction: column; flex: 1;">
                            <div class="file-name" style="margin-bottom: 4px;">${grade.name.length > 30 ? grade.name.substring(0, 25) + "..." + grade.name.substring(grade.name.length - 5) : grade.name}</div>
                            <span class="file-tag">${grade?.subject?.code}</span>
                            <div class="file-date"> ${formatDateIntoPeriod(grade.modified_at_iso)}</div>
                        </div>
                        </div>
                        <div class="file-actions">
                            <button class="file-action-btn" onclick="event.stopPropagation(); cancelSelectionMode(); goToLink('${grade.url}')">
                                <i class="fas fa-external-link"></i> Open
                            </button>
                        </div>
                    </div>
                `;
            } else {
                contentGrid.innerHTML += `
                    <div class="file-card" id="grade-${grade.id}" data-filename="${grade.name}" data-date="${grade.modified_at}">
                    <span class="grade-selected-icon">
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="0.400391" width="23.4839" height="24" rx="11.7419" fill="#5A0F61"/>
                    <rect x="6.5" y="6.90039" width="11" height="11" rx="5.5" stroke="white"/>
                    <path d="M10.9789 13.7129L14.5102 10.1816C14.5935 10.0983 14.6907 10.0566 14.8018 10.0566C14.9129 10.0566 15.0102 10.0983 15.0935 10.1816C15.1768 10.265 15.2185 10.364 15.2185 10.4787C15.2185 10.5934 15.1768 10.6923 15.0935 10.7754L11.2706 14.6087C11.1872 14.6921 11.09 14.7337 10.9789 14.7337C10.8678 14.7337 10.7706 14.6921 10.6872 14.6087L8.89558 12.8171C8.81225 12.7337 8.77225 12.6348 8.77558 12.5204C8.77892 12.4059 8.82239 12.3069 8.906 12.2233C8.98961 12.1397 9.08864 12.098 9.20308 12.0983C9.31753 12.0986 9.41642 12.1403 9.49975 12.2233L10.9789 13.7129Z" fill="white"/>
                </svg>
            </span>
                        <div class="file-header">
            <div class="dropdown d-flex align-items-center justify-content-center">
            <button class="btn btn-light btn-sm dropbtn" type="button" data-bs-toggle="dropdown"
            aria-expanded="false" style="width:35px;height:35px;">
            <i class="fas fa-ellipsis-v"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-start shadow-sm">
                <a class="dropdown-item text-muted" href="#!" onclick="event.stopPropagation(); toggleGradeSelection(${grade.id}); this.parentElement.classList.remove('show');">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0,0,256,256">
                        <g fill="#7b1fa2" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M25,2c-12.69047,0 -23,10.30953 -23,23c0,12.69047 10.30953,23 23,23c12.69047,0 23,-10.30953 23,-23c0,-12.69047 -10.30953,-23 -23,-23zM25,4c11.60953,0 21,9.39047 21,21c0,11.60953 -9.39047,21 -21,21c-11.60953,0 -21,-9.39047 -21,-21c0,-11.60953 9.39047,-21 21,-21zM34.98828,14.98828c-0.3299,0.0065 -0.63536,0.17531 -0.81641,0.45117l-10.20117,15.03711l-7.29102,-6.76562c-0.26069,-0.25084 -0.63652,-0.34135 -0.98281,-0.23667c-0.3463,0.10468 -0.60907,0.38821 -0.68715,0.74145c-0.07809,0.35324 0.04068,0.72112 0.31059,0.96201l8.99609,8.34766l11.51172,-16.96484c0.2153,-0.3085 0.23926,-0.71173 0.06201,-1.04356c-0.17725,-0.33183 -0.52573,-0.53612 -0.90186,-0.5287z"></path></g></g>
                    </svg>
                </a>
                <a class="dropdown-item text-muted" href="#!" onclick="event.stopPropagation(); editFile('${grade.id}')">
                    <svg id="editSvg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                        <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                    </svg>
                </a>
                <a class="dropdown-item text-muted" href="#!" onclick="event.stopPropagation(); deleteGrade('${grade.id}', '${grade.name}')">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0,0,256,256">
                        <g fill="#ef4343" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(16,16)"><path d="M6.49609,1c-0.82031,0 -1.49609,0.67578 -1.49609,1.49609v0.50391h-3v1h1v8.5c0,0.82813 0.67188,1.5 1.5,1.5h6c0.82813,0 1.5,-0.67187 1.5,-1.5v-8.5h1v-1h-3v-0.50391c0,-0.82031 -0.67578,-1.49609 -1.49609,-1.49609zM6.49609,2h2.00781c0.28125,0 0.49609,0.21484 0.49609,0.49609v0.50391h-3v-0.50391c0,-0.28125 0.21484,-0.49609 0.49609,-0.49609zM5,5h1v7h-1zM7,5h1v7h-1zM9,5h1v7h-1z"></path></g></g>
                    </svg>
                </a>
            </div>
            </div>
            </div>
                        <div class="file-content">
                        <div class="file-icon">
                            <img src="${getFileIcon("external")}" alt="File Icon" style="width: 20px; height: 20px; object-fit: contain;">
                        </div>
                        <div style="display: flex; flex-direction: column; flex: 1;">
                            <div class="file-name" style="margin-bottom: 4px;">${grade.name.length > 30 ? grade.name.substring(0, 25) + "..." + grade.name.substring(grade.name.length - 5) : grade.name}</div>
                            <span class="file-tag">${grade?.subject?.code}</span>
                            <div class="file-date"> ${formatDateIntoPeriod(grade.modified_at_iso)}</div>
                        </div>
                        </div>
                        <div class="file-actions">
                            <button class="file-action-btn" onclick="event.stopPropagation(); cancelSelectionMode(); goToLink('${grade.url}')">
                                <i class="fas fa-external-link"></i> Open
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    });
    contentGrid.querySelectorAll(':scope > div').forEach(card => {
        // card.addEventListener('dblclick', function() {
        //     if(card.classList.contains('folder-card')){
        //         viewFolder(card.id.replace("grade-", ""));
        //     }
        // });
        card.addEventListener('mousedown', function() {
            initialPosition.x = event.clientX;
            initialPosition.y = event.clientY;
            if(!initialPosition.card || initialPosition.card.id != card.id){
                initialPosition.clickCount = 0;
                // clearTimeout(initialPosition.dragTimeout);
                initialPosition.dragTimeout = null;
            }
            initialPosition.card = card;
            isItemsDragging = false;
            if(event.button != 0) return; // Only left mouse button
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('mouseleave', handleMouseUp);
        });
    });
    function handleMouseUp(e){
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mouseleave', handleMouseUp);
        let card = initialPosition.card;
        if(!card) return;
        if(e.button != 0) return;
        if(isItemsDragging || e.target.closest('.dropdown')) {
            initialPosition.clickCount = 0;
            clearTimeout(initialPosition.dragTimeout);
            return;
        }
        if(e.target.closest('.file-action-btn')) {
            initialPosition.clickCount = 0;
            clearTimeout(initialPosition.dragTimeout);
            return;
        }
        if(initialPosition.clickCount > 0 && card.classList.contains('folder-card')){
            initialPosition.clickCount = 0;
            clearTimeout(initialPosition.dragTimeout);
            viewFolder(card.id.replace("grade-", ""));
            return;
        }
        if (card.classList.contains('folder-card')) {
            initialPosition.clickCount++;
            initialPosition.dragTimeout = setTimeout(() => {
                initialPosition.clickCount = 0;
                toggleGradeSelection(card.id.replace("grade-", ""));
            }, 300);
        } else{
            setTimeout(() => {
                toggleGradeSelection(card.id.replace("grade-", ""));
            }, 300);
        }
    }
}
async function handleFiltersChange() {
    fetchDepartments = !elements.facultySelect.value || !filters.faculty_id || elements.facultySelect.value != filters.faculty_id;
    fetchCourses = !elements.facultySelect.value || !filters.faculty_id || elements.facultySelect.value != filters.faculty_id || !elements.departmentSelect.value || !filters.department_id || elements.departmentSelect.value != filters.department_id || !elements.academicYearSelect.value || !filters.academic_year_id || elements.academicYearSelect.value != filters.academic_year_id;
    filters.faculty_id = elements.facultySelect.value;
    filters.department_id = elements.departmentSelect.value;
    filters.academic_year_id = elements.academicYearSelect.value;
    filters.subject_id = elements.subjectSelect.value;
    filters.parent_id = null;
    filters.name = null;
    elements.filteredPage.querySelector(".search-input").value = "";
    console.log(fetchDepartments, fetchCourses, filters);
    if(fetchDepartments){
        elements.departmentSelect.innerHTML = '<option value="">Select Department</option>';
        elements.departmentSelect.value = "";
        filters.department_id = null;
        if(!filters.faculty_id){
            clearGrades();
            return;
        }
        showLoading();
        const departments = await searchDepartments("",filters.faculty_id);
        if(!departments || !departments.data || departments.data.length == 0){
            hideLoading();
            clearGrades();
            return;
        }
        elements.departmentSelect.innerHTML = '<option value="">Select Department</option>';
        departments.data.forEach(department => {
            const option = document.createElement('option');
            option.value = department.id;
            option.textContent = department.name;
            elements.departmentSelect.appendChild(option);
        });
        hideLoading();
    }
    if(fetchCourses){
        elements.subjectSelect.innerHTML = '<option value="">Select Course</option>';
        elements.subjectSelect.value = "";
        filters.subject_id = null;
        if(!filters.faculty_id || !filters.department_id || !filters.academic_year_id){
            clearGrades();
            return;
        }
        showLoading();
        const subjects = await searchCourses(filters.faculty_id, filters.department_id, filters.academic_year_id);
        if(!subjects || subjects.length == 0){
            hideLoading();
            clearGrades();
            return;
        }
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            elements.subjectSelect.appendChild(option);
        });
        hideLoading();
    }
    if (Object.entries(filters).some(([key, value]) => !value && key != "name" && key != "parent_id")) {
        clearGrades();
        return;
    }
    await fetchGrades();
}

// Add Folder Modal elements
const addFolderModal = document.getElementById('addFolderModal');
const addFolderBtn = document.getElementById('addFolderBtn');
const folderNameInput = document.getElementById('folderName');
const closeAddFolderModal = document.getElementById('closeAddFolderModal');
const cancelAddFolder = document.getElementById('cancelAddFolder');
const confirmAddFolder = document.getElementById('confirmAddFolder');
const addFileModal = document.getElementById('addFileModal');
const addFileBtn = document.getElementById('addFileBtn');
const closeAddFileModal = document.getElementById('closeAddFileModal');
const cancelAddFile = document.getElementById('cancelAddFile');
const confirmAddFile = document.getElementById('confirmAddFile');
const fileNameInput = document.getElementById('fileName');
const fileTypeSelect = document.getElementById('file_type_hidden');
const customFileTypeValue = document.getElementById('customFileTypeValue');
const customFileTypeDropdown = document.getElementById('customFileTypeDropdown');
const fileLinkGroup = document.getElementById('fileLinkGroup');
const fileUploadArea = document.getElementById('fileUploadArea');
const browseBtn = document.getElementById('browseBtn');
const fileInput = document.getElementById('fileInput');
let isEdited = false;
let gradeBeingEdited = null;
let selectedFiles = [];

// Show Add Folder Modal when clicking Add Folder buttons
addFolderBtn.addEventListener('click', function() {
    addFolderModal.classList.add('active');
    confirmAddFolder.textContent = "Add Folder";
    folderNameInput.focus();
});
// Close Add Folder Modal
closeAddFolderModal.addEventListener('click', function() {
    addFolderModal.classList.remove('active');
    folderNameInput.value = '';
    addFolderModal.querySelector('.modal-title').textContent = "Add Folder";
    isEdited = false;
    gradeBeingEdited = null;
});
cancelAddFolder.addEventListener('click', function() {
    addFolderModal.classList.remove('active');
    folderNameInput.value = '';
    addFolderModal.querySelector('.modal-title').textContent = "Add Folder";
    isEdited = false;
    gradeBeingEdited = null;
});
// Close Add Folder Modal when clicking outside
window.addEventListener('mousedown', function(e) {
    if (e.target === addFolderModal) {
        cancelAddFolder.click();
    }
});

        
// Handle Add Folder confirmation
confirmAddFolder.addEventListener('click', async function() {
    if(isEdited && gradeBeingEdited){
        await confirmEditFolder();
        return;
    }
    const folderName = folderNameInput.value.trim();
    if(!folderName){
        showToast("error", "Error", "Folder name cannot be empty", "");
        return;
    }
    if(Object.entries(filters).some(([key, value]) => !value && key != "name" && key != "parent_id")){
        showToast("error", "Error", "Please fill apply all filters to be able to proceed.", "");
        return;
    }
    // Proceed to create folder
    showLoading();
    axios.post(`${domain}/admin/grades`, {
        name: folderName,
        type: "folder",
        parent_id: filters.parent_id,
        subject_id: filters.subject_id
    }, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${GetCookie("access_token")}`,
        },
        withCredentials: true
    }).then(async response => {
        hideLoading();
        if (response.data.status == "success") {
            showToast("success", "Success", "Folder created successfully", "");
            cancelAddFolder.click();
            folderNameInput.value = '';
            await fetchGrades();
        } else {
            showToast("error", "Error", response.data.message, "");
        }
    }).catch(error => {
        hideLoading();
        showToast("error", "Error", error?.response?.data?.message || "An error occurred while creating the folder", "");
    });
});

// Handle Enter key in folder name input
folderNameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        confirmAddFolder.click();
    }
});

// Show Add File Modal when clicking Add File buttons
addFileBtn.addEventListener('click', function() {
    addFileModal.classList.add('active');
    addFileModal.querySelector('.modal-title').textContent = "Add files to your course grades";
    confirmAddFile.textContent = "+ Add 0 Files";
    fileTypeSelect.disabled = false;
    fileNameInput.focus();
});

// Close Add File Modal
closeAddFileModal.addEventListener('click', function() {
    addFileModal.classList.remove('active');
    resetAddFileModal();
});

cancelAddFile.addEventListener('click', function() {
    addFileModal.classList.remove('active');
    resetAddFileModal();
});

// Close Add File Modal when clicking outside
window.addEventListener('mousedown', function(e) {
    if (e.target === addFileModal) {
        cancelAddFile.click();
    }
});

// Custom File Type Dropdown for Add File Modal
document.addEventListener('DOMContentLoaded', function () {
    const fileTypeFilter = document.getElementById('customFileTypeFilter');
    const fileTypeDropdown = document.getElementById('customFileTypeDropdown');
    const fileTypeValue = document.getElementById('customFileTypeValue');
    const fileTypeHidden = document.getElementById('file_type_hidden');
    const fileLinkGroup = document.getElementById('fileLinkGroup');
    const fileUploadArea = document.getElementById('fileUploadArea');
    // // Toggle dropdown
    // fileTypeFilter.addEventListener('click', function (e) {
    //     fileTypeFilter.classList.toggle('open');
    //     e.stopPropagation();
    // });
    // Select file type
    fileTypeDropdown.addEventListener('mousedown', function (e) {
        if (e.target.tagName === 'LI') {
            Array.from(fileTypeDropdown.children).forEach(li => li.classList.remove('active'));
            e.target.classList.add('active');
            fileTypeValue.textContent = e.target.textContent;
            fileTypeHidden.value = e.target.getAttribute('data-value');
            fileTypeFilter.classList.remove('open');
            // Show/hide link/file upload area
            if (fileTypeHidden.value === 'file') {
                fileUploadArea.classList.remove('d-none');
                fileLinkGroup.classList.add('d-none');
            } else {
                fileUploadArea.classList.add('d-none');
                fileLinkGroup.classList.remove('d-none');
            }
            // handleFileSelection(null);
        }
    });
    // Close dropdown on outside click
    document.addEventListener('click', function (e) {
        fileTypeFilter.classList.remove('open');
    });
});

fileTypeSelect.addEventListener('change', function() {
    fileLinkGroup.querySelector('input').value = '';
    fileType = fileTypeSelect.value.toLowerCase();
    if (fileType == 'file') {
        fileUploadArea.classList.remove('d-none');
        fileLinkGroup.classList.add('d-none');
        fileIcon = 'fa-file-file text-blue-500';
        if(isEdited && gradeBeingEdited && gradeBeingEdited.type.toLowerCase() == 'file'){
            selectedFiles = [null];
            fileList.innerHTML = '';
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="far ${fileIcon} file-item-icon"></i>
                <span class="file-item-name">${gradeBeingEdited.name}</span>
                <button class="file-item-remove" data-index="0">Remove</button>
            `;
            fileList.appendChild(fileItem);
        }
    } else{
        fileInput.value = '';
        selectedFiles = [];
        fileUploadArea.classList.add('d-none');
        fileLinkGroup.classList.remove('d-none');
        if(isEdited && gradeBeingEdited && gradeBeingEdited.type.toLowerCase() == fileTypeSelect.value.toLowerCase()){
            fileLinkGroup.querySelector('input').value = gradeBeingEdited.url;
        }
    }
    handleFileSelection(null);
});

// Handle Browse button click
browseBtn.addEventListener('click', function() {
    fileInput.click();
});

// Handle file selection
fileInput.addEventListener('change', function() {
    if(this.files.length > 1){
        showToast("error", "Error", "Please select only one file at a time.", "");
        return;
    }
    handleFileSelection(this.files[0]);
});

// Handle drag and drop
fileUploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('dragover');
});

fileUploadArea.addEventListener('dragleave', function() {
    this.classList.remove('dragover');
});

fileUploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('dragover');
    if(e.dataTransfer.files.length > 1){
        showToast("error", "Error", "Please select only one file at a time.", "");
        return;
    }
    handleFileSelection(e.dataTransfer.files[0]);
});
let isDragging = false;
// Handle file selection
function handleFileSelection(file) {
    if(!isDragging)
        selectedFiles = (file) ? [file] : [];
    else
        selectedFiles = (file) ? [...file] : [];
    if(isEdited && gradeBeingEdited && gradeBeingEdited.type.toLowerCase() == 'file' && selectedFiles.length == 0){
        selectedFiles = [null];
    }
    console.log(selectedFiles);
    // Update the UI
    updateFileList();
    updateFileCount();
    
    // Update the upload area text
    if (selectedFiles.length > 0) {
        fileUploadArea.querySelector('.file-upload-text').textContent = `${selectedFiles.length} file(s) selected`;
    } else {
        fileUploadArea.querySelector('.file-upload-text').textContent = 'No file selected';
    }
}

// Update the file list UI
function updateFileList() {
    fileList.innerHTML = '';
    // Determine file icon
    let fileIcon = 'fa-file';
    if(fileTypeSelect.value.toLowerCase() == 'file'){
        selectedFiles.forEach((file, index) => {
            if(!file) return;
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            fileItem.innerHTML = `
                <i class="far ${fileIcon} file-item-icon"></i>
                <span class="file-item-name">${file.name}</span>
                <button class="file-item-remove" data-index="${index}">Remove</button>
            `;
            
            fileList.appendChild(fileItem);
        });
    }
    // Add event listeners to remove buttons
    document.querySelectorAll('.file-item-remove').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            selectedFiles.splice(index, 1);
            updateFileList();
            updateFileCount();
            
            // Update the upload area text
            if (selectedFiles.length > 0) {
                fileUploadArea.querySelector('.file-upload-text').textContent = `${selectedFiles.length} file(s) selected`;
            } else {
                fileUploadArea.querySelector('.file-upload-text').textContent = 'No file selected';
            }
        });
    });
    checkToActivateBtn();
}

function checkToActivateBtn(){
    const fileType = document.getElementById('file_type_hidden').value;
    confirmAddFile.disabled = (fileType == 'file' && selectedFiles.length == 0) || (fileType != 'file' && !fileLinkGroup.querySelector('input').value.trim());
}

// Update the file count
function updateFileCount() {
    if(fileTypeSelect.value.toLowerCase() == 'file'){
        const count = selectedFiles.length;
        fileCount.textContent = `+ Add ${count} File${count !== 1 ? 's' : ''}`;
        if(!isEdited)
            confirmAddFile.textContent = `+ Add ${count} File${count !== 1 ? 's' : ''}`;
        else
            confirmAddFile.textContent = `Save Changes`;
        confirmAddFile.disabled = count === 0;
    }else{
        if(!isEdited)
            confirmAddFile.textContent = `Add Link`;
        else
            confirmAddFile.textContent = `Save Changes`;
        fileCount.textContent = `+ Add 1 Link`;
    }
}

// Reset the Add File Modal
function resetAddFileModal() {
    selectedFiles = [];
    fileNameInput.value = '';
    fileTypeSelect.value = 'file';
    customFileTypeValue.textContent = 'File';
    customFileTypeDropdown.querySelector('li.active').classList.remove('active');
    customFileTypeDropdown.querySelector('li[data-value="file"]').classList.add('active');
    fileUploadArea.classList.remove('d-none');
    fileLinkGroup.classList.add('d-none');
    fileIcon = 'fa-file-file text-blue-500';
    fileInput.value = '';
    fileList.innerHTML = '';
    fileLinkGroup.querySelector('input').value = '';
    isEdited = false;
    gradeBeingEdited = null;
    handleFileSelection(null);
    document.querySelector('.file-upload-area').classList.remove('d-none');
    document.querySelector('.file-input-row').classList.remove('d-none');
    fileUploadArea.querySelector('.file-upload-text').textContent = 'No file selected';
}

// Handle Add File confirmation
confirmAddFile.addEventListener('click', async function() {
    if(isEdited && gradeBeingEdited){
        await confirmEditFile();
        return;
    }
    await IsLoggedIn();
    const fileName = fileNameInput.value.trim();
    const fileType = document.getElementById('file_type_hidden').value;
    if(selectedFiles.length < 1 && fileType == 'file'){
        showToast("error", "Error", "Please select at least one file to upload.", "");
        return;
    }
    if((!fileLinkGroup.querySelector('input').value.trim() || !fileName) && fileType != 'file'){
        showToast("error", "Error", "Please provide a valid Name and Link.", "");
        return;
    }
    if(Object.entries(filters).some(([key, value]) => !value && key != "name" && key != "parent_id")){
        showToast("error", "Error", "Please fill apply all filters to be able to proceed.", "");
        return;
    }
    // Proceed to upload files
    if(selectedFiles.length == 1 || fileType != 'file'){
        if(fileType == 'file'){
            const fileTemp = selectedFiles[0];
            cancelAddFile.click();
            window.addEventListener('beforeunload', beforeUnloadListener);
            const backgroundUploadContainer = document.querySelector('.background-processes-container');
            if(backgroundUploadContainer.classList.contains('d-none')){
                backgroundUploadContainer.classList.remove('d-none');
            }
            let currentProcesses = parseInt(backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent.split(' ')[0]);
            backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent = `${currentProcesses + 1} Process${currentProcesses + 1 !== 1 ? 'es' : ''} in Progress`;
            let processId = `process-upload-${(fileName || fileTemp.name).replaceAll(' ', '-')}-${Date.now()}`;
            const newProcessItem = document.createElement('div');
            newProcessItem.classList.add('process-item');
            newProcessItem.id = processId;
            newProcessItem.innerHTML = `
                <span>${(fileName || fileTemp.name).length > 20 ? (fileName || fileTemp.name).slice(0, 15) + '...' + (fileName || fileTemp.name).slice(-5) : (fileName || fileTemp.name)}</span>
                <div class="circular-progress">
                    <svg class="progress-circle" width="60" height="60" viewBox="0 0 60 60">
                            <circle class="progress-bg" cx="30" cy="30" r="28"></circle>
                            <circle class="progress-bar" cx="30" cy="30" r="28" data-progress="0"></circle>
                        </svg>
                        <div class="spinner-border"></div>
                        <div class="done">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <div class="failed">
                            <i class="fa-solid fa-times"></i>
                        </div>
                        <span class="failed-reason d-none"></span>
                        <span class="progress-text">0%</span>
                    </div>
                </div>
            `;
            backgroundUploadContainer.querySelector('.background-processes-container-content').insertBefore(newProcessItem, backgroundUploadContainer.querySelector('.background-processes-container-content').querySelector('.process-item'));
        UploadToDriveBG(fileTemp, processId, async (url) => {
            if(!url){
                currentProcesses = parseInt(backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent.split(' ')[0]);
                if(currentProcesses < 1) window.removeEventListener('beforeunload', beforeUnloadListener);
            }
            axios.post(`${domain}/admin/grades`, {
                name: fileName || fileTemp.name,
                type: "file",
                parent_id: filters.parent_id,
                subject_id: filters.subject_id,
                url: url,
            },{
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${GetCookie("access_token")}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                withCredentials: true
            }).then(async response => {
                if (response.data.status == "success") {
                    setDone(processId);
                    currentProcesses = parseInt(backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent.split(' ')[0]);
                    backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent = `${currentProcesses - 1} Process${currentProcesses - 1 !== 1 ? 'es' : ''} in Progress`;
                    await fetchGrades();
                } else {
                    setFailed(processId, response.data.message || "An error occurred while creating the grade");
                }
            }).catch(error => {
                setFailed(processId, error?.response?.data?.message || "An error occurred while creating the grade");
            }).finally(() => {
                currentProcesses = parseInt(backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent.split(' ')[0]);
                if(currentProcesses < 1) window.removeEventListener('beforeunload', beforeUnloadListener);
            });
        });
    }else{
        showLoading();
        axios.post(`${domain}/admin/grades`, {
            name: fileName,
            type: fileType,
            parent_id: filters.parent_id,
            subject_id: filters.subject_id,
            url: fileLinkGroup.querySelector('input').value.trim(),
        },{
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${GetCookie("access_token")}`,
                'ngrok-skip-browser-warning': 'true',
            },
            withCredentials: true
        }).then(async response => {
            hideLoading();
            if (response.data.status == "success") {
                showToast("success", "Success", "Grade created successfully", "");
                cancelAddFile.click();
                await fetchGrades();
            } else {
                showToast("error", "Error", response.data.message, "");
            }
        }).catch(error => {
            hideLoading();
            showToast("error", "Error", error?.response?.data?.message || "An error occurred while creating the grade", "");
        });
    }
    }else{
        const SelectedFilesReversed = [...selectedFiles].reverse();
        cancelAddFile.click();
        window.addEventListener('beforeunload', beforeUnloadListener);
        for (const file of SelectedFilesReversed) {
            const fileTemp = file;
            const backgroundUploadContainer = document.querySelector('.background-processes-container');
            if(backgroundUploadContainer.classList.contains('d-none')){
                backgroundUploadContainer.classList.remove('d-none');
            }
            let currentProcesses = parseInt(backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent.split(' ')[0]);
            backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent = `${currentProcesses + 1} Process${currentProcesses + 1 !== 1 ? 'es' : ''} in Progress`;
            let processId = `process-upload-${(fileTemp.name).replaceAll(' ', '-')}-${Date.now()}`;
            const newProcessItem = document.createElement('div');
            newProcessItem.classList.add('process-item');
            newProcessItem.id = processId;
            newProcessItem.innerHTML = `
                <span>${fileTemp.name.length > 20 ? fileTemp.name.slice(0, 15) + '...' + fileTemp.name.slice(-5) : fileTemp.name}</span>
                <div class="circular-progress">
                    <svg class="progress-circle" width="60" height="60" viewBox="0 0 60 60">
                            <circle class="progress-bg" cx="30" cy="30" r="28"></circle>
                            <circle class="progress-bar" cx="30" cy="30" r="28" data-progress="0"></circle>
                        </svg>
                        <div class="spinner-border"></div>
                        <div class="done">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <div class="failed">
                            <i class="fa-solid fa-times"></i>
                        </div>
                        <span class="failed-reason d-none"></span>
                        <span class="progress-text">0%</span>
                    </div>
                </div>
            `;
            backgroundUploadContainer.querySelector('.background-processes-container-content').insertBefore(newProcessItem, backgroundUploadContainer.querySelector('.background-processes-container-content').querySelector('.process-item'));
        UploadToDriveBG(fileTemp, processId, async (url) => {
            if(!url){
                currentProcesses = parseInt(backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent.split(' ')[0]);
                if(currentProcesses < 1) window.removeEventListener('beforeunload', beforeUnloadListener);
            }
            axios.post(`${domain}/admin/grades`, {
                name: fileTemp.name,
                type: "file",
                parent_id: filters.parent_id,
                subject_id: filters.subject_id,
                url: url,
            },{
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${GetCookie("access_token")}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                withCredentials: true
            }).then(async response => {
                if (response.data.status == "success") {
                    setDone(processId);
                    currentProcesses = parseInt(backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent.split(' ')[0]);
                    backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent = `${currentProcesses - 1} Process${currentProcesses - 1 !== 1 ? 'es' : ''} in Progress`;
                    await fetchGrades();
                } else {
                    setFailed(processId, response.data.message || "An error occurred while creating the grade" + (fileTemp.name.length > 20 ? fileTemp.name.slice(0, 15) + '...' + fileTemp.name.slice(-5) : fileTemp.name));
                }
            }).catch(error => {
                setFailed(processId, error?.response?.data?.message || "An error occurred while creating the grade" + (fileTemp.name.length > 20 ? fileTemp.name.slice(0, 15) + '...' + fileTemp.name.slice(-5) : fileTemp.name));
            }).finally(() => {
                currentProcesses = parseInt(backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent.split(' ')[0]);
                if(currentProcesses < 1) window.removeEventListener('beforeunload', beforeUnloadListener);
            });
        });
        }
    }
});

// Handle Enter key in file name input
fileNameInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !confirmAddFile.disabled) {
        confirmAddFile.click();
    }
});
// Handle Enter key in file name input
fileLinkGroup.querySelector('input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !confirmAddFile.disabled) {
        confirmAddFile.click();
    }
});

function deleteGrade(grade_id, grade_name){
    if(!grade_id || !grade_name) return;
    showPopup('confirm', 'Delete Grade', `Are you sure you want to delete grade "${grade_name}"?`, () => { removeGrade(grade_id); closePopup(); });
}
async function removeGrade(grade_id){
    if(!grade_id) return;
    await IsLoggedIn();
    showLoading();
    try{
        const response = await axios.delete(`${domain}/admin/grades/${grade_id}`, {
            headers: {
                Authorization: `Bearer ${GetCookie("access_token")}`,
                "ngrok-skip-browser-warning": "true",
            },
            withCredentials: true
        });
        if(Math.floor(response.status / 100) != 2 || response.data.status != "success"){
            hideLoading();
            showToast("error", "Error", response.data?.message || "Failed to delete grade", "");
            return;
        }
        hideLoading();
        showToast("success", "Success", "Grade deleted successfully", "");
        await fetchGrades();
    }catch(error){
        hideLoading();
        showToast("error", "Error", error?.response?.data?.message || "An error occurred while deleting the grade", "");
    }
}

async function editFile(grade_id){
    if(!grade_id) return;
    await IsLoggedIn();
    showLoading();
    let response = await axios.get(`${domain}/admin/grades/${grade_id}`, {
        headers: {
            Authorization: `Bearer ${GetCookie("access_token")}`,
            "ngrok-skip-browser-warning": "true",
        },
        withCredentials: true
    });
    hideLoading();
    if(Math.floor(response.status / 100) != 2 || response.data.status != "success"){
        showToast("error", "Error", response.data?.message || "Failed to fetch grade details", "");
        return;
    }
    const grade = response.data.data;
    if(!grade) {
        showToast("error", "Error", "Grade not found", "");
        return;
    }
    addFileBtn.click();
    isEdited = true;
    gradeBeingEdited = grade;
    addFileModal.querySelector('.modal-title').textContent = "Edit files in your course grades";
    fileNameInput.value = grade.name;
    fileTypeSelect.value = grade.type;
    fileTypeSelect.disabled = true;
    fileIcon = 'fa-file-file text-blue-500';
    if(grade.type.toLowerCase() == 'file'){
        fileUploadArea.classList.remove('d-none');
        fileLinkGroup.classList.add('d-none');
        selectedFiles = [null];
    }else{
        fileInput.value = '';
        selectedFiles = [];
        fileUploadArea.classList.add('d-none');
        fileLinkGroup.classList.remove('d-none');
        fileLinkGroup.querySelector('input').value = grade.url;
    }
    handleFileSelection(null);
    if(grade.type.toLowerCase() == 'file'){
        fileList.innerHTML = '';
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        fileItem.innerHTML = `
            <i class="far ${fileIcon} file-item-icon"></i>
            <span class="file-item-name">${grade.name}</span>
            <button class="file-item-remove" data-index="0">Remove</button>
        `;
        fileList.appendChild(fileItem);
            document.querySelectorAll('.file-item-remove').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            selectedFiles.splice(index, 1);
            updateFileList();
            updateFileCount();
            
            // Update the upload area text
            if (selectedFiles.length > 0) {
                fileUploadArea.querySelector('.file-upload-text').textContent = `${selectedFiles.length} file(s) selected`;
            } else {
                fileUploadArea.querySelector('.file-upload-text').textContent = 'No file selected';
            }
        });
    });
    checkToActivateBtn();
    }
    confirmAddFile.textContent = "Save Changes";
}

async function editFolder(grade_id){
    if(!grade_id) return;
    await IsLoggedIn();
    showLoading();
    let response = await axios.get(`${domain}/admin/grades/${grade_id}`, {
        headers: {
            Authorization: `Bearer ${GetCookie("access_token")}`,
            "ngrok-skip-browser-warning": "true",
        },
        withCredentials: true
    });
    hideLoading();
    if(Math.floor(response.status / 100) != 2 || response.data.status != "success"){
        showToast("error", "Error", response.data?.message || "Failed to fetch grade details", "");
        return;
    }
    const grade = response.data.data;
    if(!grade) {
        showToast("error", "Error", "Grade not found", "");
        return;
    }
    addFolderBtn.click();
    folderNameInput.value = grade.name;
    addFolderModal.querySelector('.modal-title').textContent = "Edit Folder";
    isEdited = true;
    gradeBeingEdited = grade;
    confirmAddFolder.textContent = "Save Changes";
}

async function confirmEditFile (){
    if(!gradeBeingEdited || !isEdited) return;
    await IsLoggedIn();
    const fileName = fileNameInput.value.trim();
    if(selectedFiles.length < 1 && gradeBeingEdited.type.toLowerCase() == 'file'){
        showToast("error", "Error", "Please select at least one file to upload.", "");
        return;
    }
    if((!fileLinkGroup.querySelector('input').value.trim() || !fileName) && gradeBeingEdited.type.toLowerCase() != 'file'){
        showToast("error", "Error", "Please provide a valid Name and Link.", "");
        return;
    }
    if(Object.entries(filters).some(([key, value]) => !value && key != "name" && key != "parent_id")){
        showToast("error", "Error", "Please fill apply all filters to be able to proceed.", "");
        return;
    }
    // Proceed to upload files
    if(gradeBeingEdited.type == 'file' && selectedFiles[0]){
        const fileTemp = selectedFiles[0];
         const fileId = gradeBeingEdited.id;
            cancelAddFile.click();
            window.addEventListener('beforeunload', beforeUnloadListener);
            const backgroundUploadContainer = document.querySelector('.background-processes-container');
            if(backgroundUploadContainer.classList.contains('d-none')){
                backgroundUploadContainer.classList.remove('d-none');
            }
            let currentProcesses = parseInt(backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent.split(' ')[0]);
            backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent = `${currentProcesses + 1} Process${currentProcesses + 1 !== 1 ? 'es' : ''} in Progress`;
            let processId = `process-upload-${(fileName || fileTemp.name).replaceAll(' ', '-')}-${Date.now()}`;
            const newProcessItem = document.createElement('div');
            newProcessItem.classList.add('process-item');
            newProcessItem.id = processId;
            newProcessItem.innerHTML = `
                <span>${(fileName || fileTemp.name).length > 20 ? (fileName || fileTemp.name).slice(0, 15) + '...' + (fileName || fileTemp.name).slice(-5) : (fileName || fileTemp.name)}</span>
                <div class="circular-progress">
                    <svg class="progress-circle" width="60" height="60" viewBox="0 0 60 60">
                            <circle class="progress-bg" cx="30" cy="30" r="28"></circle>
                            <circle class="progress-bar" cx="30" cy="30" r="28" data-progress="0"></circle>
                        </svg>
                        <div class="spinner-border"></div>
                        <div class="done">
                            <i class="fa-solid fa-check"></i>
                        </div>
                        <div class="failed">
                            <i class="fa-solid fa-times"></i>
                        </div>
                        <span class="failed-reason d-none"></span>
                        <span class="progress-text">0%</span>
                    </div>
                </div>
            `;
            backgroundUploadContainer.querySelector('.background-processes-container-content').insertBefore(newProcessItem, backgroundUploadContainer.querySelector('.background-processes-container-content').querySelector('.process-item'));
        UploadToDriveBG(fileTemp, processId, async (url) => {
            if(!url){
                currentProcesses = parseInt(backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent.split(' ')[0]);
                if(currentProcesses < 1) window.removeEventListener('beforeunload', beforeUnloadListener);
            }
            axios.patch(`${domain}/admin/grades/${fileId}`, {
                name: fileName || fileTemp.name,
                type: "file",
                parent_id: filters.parent_id,
                subject_id: filters.subject_id,
                url: url,
            },{
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${GetCookie("access_token")}`,
                    'ngrok-skip-browser-warning': 'true',
                },
                withCredentials: true
            }).then(async response => {
                if (response.data.status == "success") {
                    setDone(processId);
                    currentProcesses = parseInt(backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent.split(' ')[0]);
                    backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent = `${currentProcesses - 1} Process${currentProcesses - 1 !== 1 ? 'es' : ''} in Progress`;
                    await fetchGrades();
                } else {
                    setFailed(processId, response.data.message || "An error occurred while updating the grade");
                }
            }).catch(error => {
                setFailed(processId, error?.response?.data?.message || "An error occurred while updating the grade");
            }).finally(() => {
                currentProcesses = parseInt(backgroundUploadContainer.querySelector('.background-processes-container-heading span').textContent.split(' ')[0]);
                if(currentProcesses < 1) window.removeEventListener('beforeunload', beforeUnloadListener);
            });
        });
    }else{
        showLoading();
        let url = gradeBeingEdited.url;
        if(gradeBeingEdited.type.toLowerCase() != 'file'){
            url = fileLinkGroup.querySelector('input').value.trim();
        }
        axios.patch(`${domain}/admin/grades/${gradeBeingEdited.id}`, {
            name: fileName,
            type: gradeBeingEdited.type.toLowerCase(),
            parent_id: filters.parent_id,
            subject_id: filters.subject_id,
            url: url,
        },{
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${GetCookie("access_token")}`,
                'ngrok-skip-browser-warning': 'true',
            },
            withCredentials: true
        }).then(async response => {
            hideLoading();
            if (response.data.status == "success") {
                showToast("success", "Success", "Grade updated successfully", "");
                cancelAddFile.click();
                await fetchGrades();
            } else {
                showToast("error", "Error", response.data.message, "");
            }
        }).catch(error => {
            hideLoading();
            showToast("error", "Error", error?.response?.data?.message || "An error occurred while updating the grade", "");
        });
    }
};

async function confirmEditFolder(){
    if(!gradeBeingEdited || !isEdited) return;
    await IsLoggedIn();
    const folderName = folderNameInput.value.trim();
    if(!folderName){
        showToast("error", "Error", "Folder name cannot be empty", "");
        return;
    }
    if(Object.entries(filters).some(([key, value]) => !value && key != "name" && key != "parent_id")){
        showToast("error", "Error", "Please fill apply all filters to be able to proceed.", "");
        return;
    }
    // Proceed to update folder
    showLoading();
    axios.patch(`${domain}/admin/grades/${gradeBeingEdited.id}`, {
        name: folderName,
        type: "folder",
        parent_id: filters.parent_id,
        subject_id: filters.subject_id
    }, {
        headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${GetCookie("access_token")}`,
            'ngrok-skip-browser-warning': 'true',
        },
        withCredentials: true
    }).then(async response => {
        hideLoading();
        if (response.data.status == "success") {
            showToast("success", "Success", "Folder updated successfully", "");
            cancelAddFolder.click();
            folderNameInput.value = '';
            await fetchGrades();
        } else {
            showToast("error", "Error", response.data.message, "");
        }
    }).catch(error => {
        hideLoading();
        showToast("error", "Error", error?.response?.data?.message || "An error occurred while updating the folder", "");
    });
}

// let selectedGradeIds = [];
function toggleGradeSelection(grade_id){
    if(!grade_id) return;
    let index = selectedGradeIds.findIndex(id => id == grade_id);
    if(index == -1){
        selectedGradeIds.push(grade_id);
        document.getElementById(`grade-${grade_id}`).classList.add('selected');
    }else{
        selectedGradeIds.splice(index, 1);
        document.getElementById(`grade-${grade_id}`).classList.remove('selected');
    }
    // Update selection bar count
    const selectedCountElem = document.getElementById('selectedCount');
    if (selectedCountElem) {
        selectedCountElem.textContent = `${selectedGradeIds.length} File${selectedGradeIds.length !== 1 ? 's' : ''} Selected`;
    }
    if(selectedGradeIds.length > 0){
        // Enter Selection Mode
        elements.filteredPage.querySelector('.selection-btns').classList.remove('d-none');
        elements.contentGrid.classList.add('selection-mode');
        // elements.selectionCount.textContent = `${selectedGradeIds.length} Selected`;
    } else {
        // Hide selection bar if none selected
        elements.filteredPage.querySelector('.selection-btns').classList.add('d-none');
        elements.contentGrid.classList.remove('selection-mode');
    }
}
function cancelSelectionMode(){
    selectedGradeIds.forEach(grade_id => {
        document.getElementById(`grade-${grade_id}`)?.classList.remove('selected');
    });
    selectedGradeIds = [];
    // Hide selection bar
    const selectedCountElem = document.getElementById('selectedCount');
    if (selectedCountElem) {
        selectedCountElem.textContent = '';
    }
    elements.filteredPage.querySelector('.selection-btns').classList.add('d-none');
    elements.contentGrid.classList.remove('selection-mode');
}
function selectGrade(grade_id){
    if(!grade_id) return;
    if(selectedGradeIds.includes(grade_id.toString())) return;
    toggleGradeSelection(grade_id);
}
function deselectGrade(grade_id){
    if(!grade_id) return;
    if(!selectedGradeIds.includes(grade_id.toString())) return;
    toggleGradeSelection(grade_id);
}
function selectAllGrades(){
    elements.contentGrid.querySelectorAll(":scope > div").forEach(card => {
        const grade_id = card.id.replace('grade-', '');
        selectGrade(grade_id);
    });
}
async function deleteGrades() {
    if(selectedGradeIds.length == 0){
        showToast("error", "Error", "No grades selected to delete", "");
        cancelSelectionMode();
        return;
    }
    showPopup('confirm', 'Delete Grades', `Are you sure you want to delete the selected ${selectedGradeIds.length} grade(s)?`, async () => { 
        await IsLoggedIn();
        showLoading();
        try{
            const response = await axios.delete(`${domain}/admin/grades/${selectedGradeIds.join(",")}`, {
                headers: {
                    Authorization: `Bearer ${GetCookie("access_token")}`,
                    "ngrok-skip-browser-warning": "true",
                },
                withCredentials: true
            });
            if(Math.floor(response.status / 100) != 2 || response.data.status != "success"){
                hideLoading();
                showToast("error", "Error", response.data?.message || "Failed to delete grades", "");
                return;
            }
            hideLoading();
            closePopup();
            cancelSelectionMode();
            showToast("success", "Success", "Grades deleted successfully", "");
            selectedGradeIds = [];
            await fetchGrades();
        }catch(error){
            hideLoading();
            showToast("error", "Error", error?.response?.data?.message || "An error occurred while deleting the grades", "");
        }
    });
}
const uploadContainer = document.querySelector(".upload-box-container");
const dropArea = document.getElementById("drop-area");
const fileInputMain = document.getElementById("fileInputMain");
document.addEventListener("dragover", (e) => {
    e.preventDefault();
    if (isDragging || addFileModal.classList.contains('active')) return;
    // Check if has files
    if(!e.dataTransfer.items || e.dataTransfer.items.length < 1 || !Array.from(e.dataTransfer.items).some(item => item.kind == "file")) return;
    uploadContainer.classList.remove("d-none");
    isDragging = true;
});
document.addEventListener("dragleave", (e) => {
    e.preventDefault();
    if(e.target && (e.target === dropArea || dropArea.contains(e.target))) return;
    if(e.clientX < 1 || e.clientY < 1 || e.clientX > window.innerWidth - 1 || e.clientY > window.innerHeight - 1){
        uploadContainer.classList.add("d-none");
        isDragging = false;
        if(Object.entries(filters).some(([key, value]) => !value && key != "name" && key != "parent_id")){
            showToast("error", "Error", "Please fill apply all filters to be able to proceed.", "");
            return;
        }
    }
});

// Click to open file picker
dropArea.addEventListener("click", () => fileInputMain.click());

// Handle drag over
dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("dragover");
});

// Handle drag leave
dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("dragover");
});

// Handle drop
dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("dragover");

    const files = e.dataTransfer.files;
    handleFiles(files);
});

// Handle file selection
fileInputMain.addEventListener("change", () => {
    handleFiles(fileInputMain.files);
});

function handleFiles(files) {
    console.log(files);
    uploadContainer.classList.add("d-none");
    if(!files || files.length < 1){
        isDragging = false;
        return;
    }
    if(Object.entries(filters).some(([key, value]) => !value && key != "name" && key != "parent_id")){
        isDragging = false;
        showToast("error", "Error", "Please fill apply all filters to be able to proceed.", "");
        return;
    }
    addFileBtn.click();
    handleFileSelection(files);
    document.querySelector('.file-upload-area').classList.add('d-none');
    document.querySelector('.file-input-row').classList.add('d-none');
    isDragging = false;
}
class CircularProgress {
    constructor(container) {
        this.container = container;
        this.progressBar = container.querySelector('.progress-bar');
        this.progressText = container.querySelector('.progress-text');
        this.radius = 28;
        this.circumference = 2 * Math.PI * this.radius;
        
        // Initialize
        this.progressBar.style.strokeDasharray = this.circumference;
        this.progressBar.style.strokeDashoffset = this.circumference;
        
        const initialProgress = parseInt(this.progressBar.getAttribute('data-progress')) || 0;
        this.setProgress(initialProgress);
    }
    
    setProgress(progress) {
        const progressValue = Math.min(Math.max(progress, 0), 100);
        const offset = this.circumference - (progressValue / 100) * this.circumference;
        
        this.progressBar.style.strokeDashoffset = offset;
        this.progressText.textContent = `${progressValue}%`;
        
        // Optional: Change color based on progress
        // if (progressValue >= 90) {
        //     this.progressBar.style.stroke = '#f44336';
        // } else if (progressValue >= 70) {
        //     this.progressBar.style.stroke = '#ff9800';
        // } else {
        //     this.progressBar.style.stroke = '#4CAF50';
        // }
        this.progressBar.style.stroke = '#16A34A';
    }
}

// Initialize all progress circles
document.addEventListener('DOMContentLoaded', () => {
    const progressContainers = document.querySelectorAll('.circular-progress');
    progressContainers.forEach(container => {
        new CircularProgress(container);
    });
});

// Example usage: Update progress dynamically
function updateProgress(processId, newProgress) {
    const processItem = document.getElementById(processId);
    newProgress = Math.min(Math.max(newProgress.toPrecision(2), 0), 100);
    if (processItem) {
        const progressContainer = processItem.querySelector('.circular-progress');
        const progress = new CircularProgress(progressContainer);
        progress.setProgress(newProgress);
    }
}
// Example usage: Update progress dynamically
function setProcessing(processId) {
    const processItem = document.getElementById(processId);

    if (processItem) {
        const progressContainer = processItem.classList.add('processing');
    }
}
// Example usage: Update progress dynamically
function setDone(processId) {
    const processItem = document.getElementById(processId);

    if (processItem) {
        const progressContainer = processItem.classList.add('done');
    }
}
function setFailed(processId, reason="") {
    const processItem = document.getElementById(processId);
    
    if (processItem) {
        const progressContainer = processItem.classList.add('failed');
        if(reason){
            processItem.querySelector('.failed-reason').textContent = reason;
            processItem.addEventListener('click', function() {
                showToast("error", "Error", reason);
            });
            processItem.style.cursor = "pointer";
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.background-processes-container-heading').addEventListener('click', function() {
        const backgroundProcessesContainer = document.querySelector('.background-processes-container');
        backgroundProcessesContainer.classList.toggle('open');
    });
});
function beforeUnloadListener (event) {
    event.preventDefault();
    return event.returnValue = 'There are background processes running. Are you sure you want to leave and cancel them?';
}