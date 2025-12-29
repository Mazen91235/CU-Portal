let selectedMaterialIds = [];

document.addEventListener('DOMContentLoaded', async function() {
    await IsLoggedIn();
    await initFilters();
    await checkForSharedMaterial();
});

async function searchCourses(faculty_id="", department_id="", year_id="") {
    showLoading();
    let response = await axios.get(`${domain}/user/search-courses`, {
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
        showLoading();
        const courses = await fetchEnrolledCourses();
        const subjectDropdown = document.getElementById('customCourseDropdown');
        document.getElementById('customCourseDropdown').innerHTML = '<li class="active" data-value="">All Courses</li>';
        document.getElementById('subject_hidden').value = '';
        document.getElementById('customCourseValue').textContent = 'All Courses';
        if (courses && courses.length > 0) {
            courses.forEach(course => {
                const li = document.createElement('li');
                li.setAttribute('data-value', course.id);
                li.textContent = course.name;
                subjectDropdown.appendChild(li);
            });
        }
        hideLoading();
    // Department and Course will be fetched on filter change
    // Add listeners to custom dropdowns
    setupCustomFilterListeners();
    // Initial fetch for departments/subjects if needed
    handleCustomFiltersChange();
}
async function handleCustomFiltersChange() {
    any_filter_changed_including_subject = !document.getElementById('subject_hidden').value || !filters.subject_id || (document.getElementById('subject_hidden').value != filters.subject_id);
    filters.parent_id = any_filter_changed_including_subject ? null : filters.parent_id;
    filters.subject_id = document.getElementById('subject_hidden').value;
    filters.name = any_filter_changed_including_subject ? null : filters.name;
    document.querySelector(".search-input").value = any_filter_changed_including_subject ? "" : filters.name;
    // If all filters are selected, fetch materials
    if (filters.subject_id) {
        await fetchMaterials();
    } else {
        clearMaterials();
    }
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
    // Course
    setupCustomDropdown('customCourseFilter', 'customCourseDropdown', 'customCourseValue', 'subject_hidden');
}
const filters = {
    subject_id: null,
    parent_id: null,
    name: null
}
function clearMaterials() {
    elements.filteredPage.classList.add("d-none");
    elements.emptyPage.classList.add("d-none");
    elements.filterPage.classList.remove("d-none");
}
async function fetchMaterials(render=true) {    
    try{
        await IsLoggedIn();
        showLoading();
        const response = await axios.get(`${domain}/user/materials`, {
            headers: {
                Authorization: `Bearer ${GetCookie("access_token")}`,
                "ngrok-skip-browser-warning": "true",
            },
            withCredentials: true,
            params: {
                subject_id: filters.subject_id,
                parent_id: filters.parent_id,
                query: filters.name
            }
        });
        if(Math.floor(response.status / 100) != 2){
            hideLoading();
            showToast("error", "Error", response.data?.message || "Failed to fetch materials", "");
            return;
        }
        const materials = response.data.data ?? response.data ?? [];
        if(render){
            await renderMaterials(materials);
        }
        hideLoading();
        return materials;
    }catch(error){
        showToast("error", "Error", error?.response?.data?.message || error.message || "Failed to fetch materials", "");
        // clearMaterials();
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
async function fetchParents(material_id, render=true) {
    await IsLoggedIn();
    showLoading();
    try{
        if(!material_id || material_id == -1) {
            hideLoading();
            if(render)
                await renderBreadcrumbs([]);
            return [];
        }
        const response = await axios.get(`${domain}/user/materials/${material_id}/parents`, {
            headers: {
                Authorization: `Bearer ${GetCookie("access_token")}`,
                "ngrok-skip-browser-warning": "true",
            },
            withCredentials: true
        });
        if(Math.floor(response.status / 100) != 2){
            hideLoading();
            showToast("error", "Error", response.data?.message || "Failed to fetch parent materials", "");
            return [];
        }
        let parents = response.data.data ?? response.data ?? [];
        hideLoading();
        if(render)
            await renderBreadcrumbs(parents);
        return parents;
    }catch(error){
        hideLoading();
        showToast("error", "Error", error?.response?.data?.message || error.message || "Failed to fetch parent materials", "");
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
            Materials
        </span>
        <span class="separator">></span>
        <a href="#!" onclick="filters.subject_id='${subjectHidden.value}'; clearSearch(); filters.parent_id=null; fetchMaterials();" id="subject_breadcrumb_link">${subjectValue}</a>
    `;
    if(!parents || parents.length == 0) {
        breadcrumb.querySelectorAll('a')[breadcrumb.querySelectorAll('a').length - 1].classList.add('active');
        return;
    }
    for(parent of parents){
        breadcrumb.innerHTML += `
            <span class="separator">></span>
            <a href="#!" data-id="${parent.id}" onclick="filters.parent_id='${parent.id}'; clearSearch(); fetchMaterials();" class="breadcrumb-link">${parent.name}</a>
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
const materialBeingPreviewed = {
    id: null,
    name: null,
    real_name: null,
    mime_type: null,
};
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
function goToLink(url){
    if(!url) return;
    window.open(url, '_blank');
}
async function viewFolder(folder_id){
    if(event.target.closest(".dropdown")) return;
    filters.parent_id=folder_id; 
    clearSearch(); 
    await fetchMaterials();
}
let isItemsDragging = false;
const initialPosition = {
    x: 0,
    y: 0,
    card: null,
    clickCount: 0,
    dragTimeout: null
}
async function renderMaterials(materials) {
    if(!materials || materials.length == 0){
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
        materials.forEach(material => {
        if (!material) return;
        if(material.type == 'folder'){
            contentGrid.innerHTML += `
            <div class="folder-card" id="material-${material.id}" ondblclick="viewFolder('${material.id}')" data-foldername="${material.name}" data-date="${material.modified_at}">
            <span class="material-selected-icon">
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="0.400391" width="23.4839" height="24" rx="11.7419" fill="#5A0F61"/>
                    <rect x="6.5" y="6.90039" width="11" height="11" rx="5.5" stroke="white"/>
                    <path d="M10.9789 13.7129L14.5102 10.1816C14.5935 10.0983 14.6907 10.0566 14.8018 10.0566C14.9129 10.0566 15.0102 10.0983 15.0935 10.1816C15.1768 10.265 15.2185 10.364 15.2185 10.4787C15.2185 10.5934 15.1768 10.6923 15.0935 10.7754L11.2706 14.6087C11.1872 14.6921 11.09 14.7337 10.9789 14.7337C10.8678 14.7337 10.7706 14.6921 10.6872 14.6087L8.89558 12.8171C8.81225 12.7337 8.77225 12.6348 8.77558 12.5204C8.77892 12.4059 8.82239 12.3069 8.906 12.2233C8.98961 12.1397 9.08864 12.098 9.20308 12.0983C9.31753 12.0986 9.41642 12.1403 9.49975 12.2233L10.9789 13.7129Z" fill="white"/>
                </svg>
            </span>
        <div class="folder-header">
            <div class="dropdown d-flex align-items-center justify-content-center">
            <button class="btn btn-light btn-sm dropbtn" type="button" style="width:35px;height:35px;" onclick="shareMaterial('${material.id}', 'folder')">
            <i class="fa-solid fa-share-nodes"></i>
            </button>
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
                <span class="folder-name">${material.name.length > 30 ? material.name.substring(0, 25) + "..." + material.name.substring(material.name.length - 5) : material.name}</span>
                <span class="folder-tag">${material.subject?.code}</span>
                <span class="folder-date">${formatDateIntoPeriod(material.modified_at_iso)}</span>
            </div>
            <div class="folder-info">
                <span>
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="12" height="12" viewBox="0 0 50 50">
                        <path d="M 3 4 C 1.355469 4 0 5.355469 0 7 L 0 43.90625 C -0.0625 44.136719 -0.0390625 44.378906 0.0625 44.59375 C 0.34375 45.957031 1.5625 47 3 47 L 42 47 C 43.492188 47 44.71875 45.875 44.9375 44.4375 C 44.945313 44.375 44.964844 44.3125 44.96875 44.25 C 44.96875 44.230469 44.96875 44.207031 44.96875 44.1875 L 45 44.03125 C 45 44.019531 45 44.011719 45 44 L 49.96875 17.1875 L 50 17.09375 L 50 17 C 50 15.355469 48.644531 14 47 14 L 47 11 C 47 9.355469 45.644531 8 44 8 L 18.03125 8 C 18.035156 8.003906 18.023438 8 18 8 C 17.96875 7.976563 17.878906 7.902344 17.71875 7.71875 C 17.472656 7.4375 17.1875 6.96875 16.875 6.46875 C 16.5625 5.96875 16.226563 5.4375 15.8125 4.96875 C 15.398438 4.5 14.820313 4 14 4 Z M 3 6 L 14 6 C 13.9375 6 14.066406 6 14.3125 6.28125 C 14.558594 6.5625 14.84375 7.03125 15.15625 7.53125 C 15.46875 8.03125 15.8125 8.5625 16.21875 9.03125 C 16.625 9.5 17.179688 10 18 10 L 44 10 C 44.5625 10 45 10.4375 45 11 L 45 14 L 8 14 C 6.425781 14 5.171875 15.265625 5.0625 16.8125 L 5.03125 16.8125 L 5 17 L 2 33.1875 L 2 7 C 2 6.4375 2.4375 6 3 6 Z M 8 16 L 47 16 C 47.5625 16 48 16.4375 48 17 L 43.09375 43.53125 L 43.0625 43.59375 C 43.050781 43.632813 43.039063 43.675781 43.03125 43.71875 C 43.019531 43.757813 43.007813 43.800781 43 43.84375 C 43 43.863281 43 43.886719 43 43.90625 C 43 43.917969 43 43.925781 43 43.9375 C 42.984375 43.988281 42.976563 44.039063 42.96875 44.09375 C 42.964844 44.125 42.972656 44.15625 42.96875 44.1875 C 42.964844 44.230469 42.964844 44.269531 42.96875 44.3125 C 42.84375 44.71875 42.457031 45 42 45 L 3 45 C 2.4375 45 2 44.5625 2 44 L 6.96875 17.1875 L 7 17.09375 L 7 17 C 7 16.4375 7.4375 16 8 16 Z"></path>
                    </svg>
                    ${material.details?.folders_count ?? 0}
                </span>
                <span>
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="12" height="12" viewBox="0 0 50 50">
                        <path d="M 7 2 L 7 48 L 43 48 L 43 14.59375 L 42.71875 14.28125 L 30.71875 2.28125 L 30.40625 2 Z M 9 4 L 29 4 L 29 16 L 41 16 L 41 46 L 9 46 Z M 31 5.4375 L 39.5625 14 L 31 14 Z M 15 22 L 15 24 L 35 24 L 35 22 Z M 15 28 L 15 30 L 31 30 L 31 28 Z M 15 34 L 15 36 L 35 36 L 35 34 Z"></path>
                    </svg>
                    ${material.details?.files_count ?? 0}
                </span>
            </div>
        </div>
    </div>
        `;
        } else if (material.type === "file") {
            contentGrid.innerHTML += `
                <div class="file-card" id="material-${material.id}" data-filename="${material.name}" data-date="${material.modified_at}">
                <span class="material-selected-icon">
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="0.400391" width="23.4839" height="24" rx="11.7419" fill="#5A0F61"/>
                    <rect x="6.5" y="6.90039" width="11" height="11" rx="5.5" stroke="white"/>
                    <path d="M10.9789 13.7129L14.5102 10.1816C14.5935 10.0983 14.6907 10.0566 14.8018 10.0566C14.9129 10.0566 15.0102 10.0983 15.0935 10.1816C15.1768 10.265 15.2185 10.364 15.2185 10.4787C15.2185 10.5934 15.1768 10.6923 15.0935 10.7754L11.2706 14.6087C11.1872 14.6921 11.09 14.7337 10.9789 14.7337C10.8678 14.7337 10.7706 14.6921 10.6872 14.6087L8.89558 12.8171C8.81225 12.7337 8.77225 12.6348 8.77558 12.5204C8.77892 12.4059 8.82239 12.3069 8.906 12.2233C8.98961 12.1397 9.08864 12.098 9.20308 12.0983C9.31753 12.0986 9.41642 12.1403 9.49975 12.2233L10.9789 13.7129Z" fill="white"/>
                </svg>
            </span>
                    <div class="file-header">
            <div class="dropdown d-flex align-items-center justify-content-center">
            <button class="btn btn-light btn-sm dropbtn" type="button" style="width:35px;height:35px;" onclick="shareMaterial('${material.id}', 'file')">
            <i class="fa-solid fa-share-nodes"></i>
            </button>
            </div>
            </div>
                    <div class="file-content">
                        <div class="file-icon">
                            <img src="${getFileIcon(material?.details?.file_data?.type)}" alt="File Icon" style="width: 20px; height: 20px; object-fit: contain;">
                        </div>
                        <div style="display: flex; flex-direction: column; flex: 1;">
                            <div class="file-name" style="margin-bottom: 4px;">${material.name.length > 30 ? material.name.substring(0, 25) + "..." + material.name.substring(material.name.length - 5) : material.name}</div>
                            <span class="file-tag">${material?.subject?.code}</span>
                            <div class="file-date"> ${formatDateIntoPeriod(material.modified_at_iso)}</div>
                        </div>
                    </div>
                    <div class="file-actions">
                        <button class="file-action-btn" onclick="event.stopPropagation(); previewFile('${material?.details?.file_data?.id}', '${material.name}', '${material?.details?.file_data?.name}', '${material?.details?.file_data?.mimeType}')">
                            <i class="fas fa-eye"></i> Preview
                        </button>
                        <button class="file-action-btn" onclick="event.stopPropagation(); downloadFile('${material?.details?.file_data?.id}', '${getDownloadName(material.name, material?.details?.file_data?.name, material?.details?.file_data?.mimeType)}')">
                            <i class="fas fa-download"></i> Download
                        </button>
                    </div>
                </div>
            `;
        } else {
            if (material.type === "drive") {
                contentGrid.innerHTML += `
                    <div class="file-card" id="material-${material.id}" data-filename="${material.name}" data-date="${material.modified_at}">
                    <span class="material-selected-icon">
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="0.400391" width="23.4839" height="24" rx="11.7419" fill="#5A0F61"/>
                    <rect x="6.5" y="6.90039" width="11" height="11" rx="5.5" stroke="white"/>
                    <path d="M10.9789 13.7129L14.5102 10.1816C14.5935 10.0983 14.6907 10.0566 14.8018 10.0566C14.9129 10.0566 15.0102 10.0983 15.0935 10.1816C15.1768 10.265 15.2185 10.364 15.2185 10.4787C15.2185 10.5934 15.1768 10.6923 15.0935 10.7754L11.2706 14.6087C11.1872 14.6921 11.09 14.7337 10.9789 14.7337C10.8678 14.7337 10.7706 14.6921 10.6872 14.6087L8.89558 12.8171C8.81225 12.7337 8.77225 12.6348 8.77558 12.5204C8.77892 12.4059 8.82239 12.3069 8.906 12.2233C8.98961 12.1397 9.08864 12.098 9.20308 12.0983C9.31753 12.0986 9.41642 12.1403 9.49975 12.2233L10.9789 13.7129Z" fill="white"/>
                </svg>
            </span>
                        <div class="file-header">
            <div class="dropdown d-flex align-items-center justify-content-center">
            <button class="btn btn-light btn-sm dropbtn" type="button" style="width:35px;height:35px;" onclick="shareMaterial('${material.id}', 'drive', '${material.url}')">
            <i class="fa-solid fa-share-nodes"></i>
            </button>
            </div>
            </div>
                        <div class="file-content">
                        <div class="file-icon">
                            <img src="${getFileIcon("drive")}" alt="File Icon" style="width: 20px; height: 20px; object-fit: contain;">
                        </div>
                        <div style="display: flex; flex-direction: column; flex: 1;">
                            <div class="file-name" style="margin-bottom: 4px;">${material.name.length > 30 ? material.name.substring(0, 25) + "..." + material.name.substring(material.name.length - 5) : material.name}</div>
                            <span class="file-tag">${material?.subject?.code}</span>
                            <div class="file-date"> ${formatDateIntoPeriod(material.modified_at_iso)}</div>
                        </div>
                        </div>
                        <div class="file-actions">
                            <button class="file-action-btn" onclick="event.stopPropagation(); goToLink('${material.url}')">
                                <i class="fas fa-external-link "></i> Open
                            </button>
                        </div>
                    </div>
                `;
            } else if (material.type === "youtube") {
                contentGrid.innerHTML += `
                    <div class="file-card" id="material-${material.id}" data-filename="${material.name}" data-date="${material.modified_at}">
                    <span class="material-selected-icon">
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="0.400391" width="23.4839" height="24" rx="11.7419" fill="#5A0F61"/>
                    <rect x="6.5" y="6.90039" width="11" height="11" rx="5.5" stroke="white"/>
                    <path d="M10.9789 13.7129L14.5102 10.1816C14.5935 10.0983 14.6907 10.0566 14.8018 10.0566C14.9129 10.0566 15.0102 10.0983 15.0935 10.1816C15.1768 10.265 15.2185 10.364 15.2185 10.4787C15.2185 10.5934 15.1768 10.6923 15.0935 10.7754L11.2706 14.6087C11.1872 14.6921 11.09 14.7337 10.9789 14.7337C10.8678 14.7337 10.7706 14.6921 10.6872 14.6087L8.89558 12.8171C8.81225 12.7337 8.77225 12.6348 8.77558 12.5204C8.77892 12.4059 8.82239 12.3069 8.906 12.2233C8.98961 12.1397 9.08864 12.098 9.20308 12.0983C9.31753 12.0986 9.41642 12.1403 9.49975 12.2233L10.9789 13.7129Z" fill="white"/>
                </svg>
            </span>
                        <div class="file-header">
            <div class="dropdown d-flex align-items-center justify-content-center">
            <button class="btn btn-light btn-sm dropbtn" type="button" style="width:35px;height:35px;" onclick="shareMaterial('${material.id}', 'youtube', '${material.url}')">
            <i class="fa-solid fa-share-nodes"></i>
            </button>
            </div>
            </div>
                        <div class="file-content">
                        <div class="file-icon">
                            <img src="${getFileIcon("youtube")}" alt="File Icon" style="width: 20px; height: 20px; object-fit: contain;">
                        </div>
                        <div style="display: flex; flex-direction: column; flex: 1;">
                            <div class="file-name" style="margin-bottom: 4px;">${material.name.length > 30 ? material.name.substring(0, 25) + "..." + material.name.substring(material.name.length - 5) : material.name}</div>
                            <span class="file-tag">${material?.subject?.code}</span>
                            <div class="file-date"> ${formatDateIntoPeriod(material.modified_at_iso)}</div>
                        </div>
                        </div>
                        <div class="file-actions">
                            <button class="file-action-btn" onclick="event.stopPropagation(); goToLink('${material.url}')">
                                <i class="fas fa-external-link"></i> Open
                            </button>
                        </div>
                    </div>
                `;
            } else {
                contentGrid.innerHTML += `
                    <div class="file-card" id="material-${material.id}" data-filename="${material.name}" data-date="${material.modified_at}">
                    <span class="material-selected-icon">
                <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect y="0.400391" width="23.4839" height="24" rx="11.7419" fill="#5A0F61"/>
                    <rect x="6.5" y="6.90039" width="11" height="11" rx="5.5" stroke="white"/>
                    <path d="M10.9789 13.7129L14.5102 10.1816C14.5935 10.0983 14.6907 10.0566 14.8018 10.0566C14.9129 10.0566 15.0102 10.0983 15.0935 10.1816C15.1768 10.265 15.2185 10.364 15.2185 10.4787C15.2185 10.5934 15.1768 10.6923 15.0935 10.7754L11.2706 14.6087C11.1872 14.6921 11.09 14.7337 10.9789 14.7337C10.8678 14.7337 10.7706 14.6921 10.6872 14.6087L8.89558 12.8171C8.81225 12.7337 8.77225 12.6348 8.77558 12.5204C8.77892 12.4059 8.82239 12.3069 8.906 12.2233C8.98961 12.1397 9.08864 12.098 9.20308 12.0983C9.31753 12.0986 9.41642 12.1403 9.49975 12.2233L10.9789 13.7129Z" fill="white"/>
                </svg>
            </span>
                        <div class="file-header">
            <div class="dropdown d-flex align-items-center justify-content-center">
            <button class="btn btn-light btn-sm dropbtn" type="button" style="width:35px;height:35px;" onclick="shareMaterial('${material.id}', 'external', '${material.url}')">
            <i class="fa-solid fa-share-nodes"></i>
            </button>
            </div>
            </div>
                        <div class="file-content">
                        <div class="file-icon">
                            <img src="${getFileIcon("external")}" alt="File Icon" style="width: 20px; height: 20px; object-fit: contain;">
                        </div>
                        <div style="display: flex; flex-direction: column; flex: 1;">
                            <div class="file-name" style="margin-bottom: 4px;">${material.name.length > 30 ? material.name.substring(0, 25) + "..." + material.name.substring(material.name.length - 5) : material.name}</div>
                            <span class="file-tag">${material?.subject?.code}</span>
                            <div class="file-date"> ${formatDateIntoPeriod(material.modified_at_iso)}</div>
                        </div>
                        </div>
                        <div class="file-actions">
                            <button class="file-action-btn" onclick="event.stopPropagation(); goToLink('${material.url}')">
                                <i class="fas fa-external-link"></i> Open
                            </button>
                        </div>
                    </div>
                `;
            }
        }
    });
}
function shareMaterial(material_id, type, url=null){
    if(!material_id || !type || !filters.subject_id){
        showToast("error", "Error", "Invalid request");
    }
    let shareableString = window.location.origin + "/user/materials.html?subject_id="+filters.subject_id;
    switch(type){
        case "file":
            shareableString += "&parent_id=" + (filters.parent_id ?? "") + "&material_id=" + material_id;
            break;
        case "folder":
            shareableString += "&parent_id=" + material_id;
            break;
        default:
            shareableString = url;
            break;
    }
    try{
        navigator.clipboard.writeText(shareableString).then(() => {
            showToast("success", "Success", "Link copied to clipboard successfully.");
        }, (err) => {
                showToast("error", "Error", "Could not copy the link. Please try again later.");
            });
    } catch(e){
        const textArea = document.createElement("textarea");
        textArea.value = shareableString;
        textArea.style.position = "fixed";  // Prevent scrolling to bottom of page in MS Edge.
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showToast("success", "Success", "Link copied to clipboard successfully.");
        } catch (err) {
            showToast("error", "Error", "Could not copy the link. Please try again later.");
        }
        document.body.removeChild(textArea);
    }
}
async function checkForSharedMaterial(){
    const urlParams = new URLSearchParams(window.location.search);
    let subject_id = urlParams.get('subject_id');
    let parent_id = urlParams.get('parent_id');
    let material_id = urlParams.get('material_id');
    if (!subject_id) return false;
    try{
        subject_id = parseInt(subject_id);
        parent_id = parent_id ? parseInt(parent_id) : null;
        material_id = material_id ? parseInt(material_id) : null;
    } catch(e){
        console.error("Error parsing shared link parameters:", e);
        showToast("error", "Error", "Invalid Shared Link.");
        return false;
    }
    filters.subject_id = subject_id;
    document.querySelectorAll(".custom-filter li.active")?.forEach(li => li.classList.remove("active"));
    document.querySelector(".custom-filter li[data-value='"+subject_id+"']")?.classList.add("active");
    document.getElementById('customCourseValue').innerText = document.querySelector("li[data-value='"+subject_id+"']")?.innerText || "All Courses";
    document.getElementById('subject_hidden').value = subject_id;
    filters.parent_id = parent_id || null;
    await fetchMaterials();
    if(material_id){
        document.getElementById(`material-${material_id}`)?.scrollIntoView({behavior: "smooth", block: "center"});
        document.getElementById(`material-${material_id}`)?.querySelector(".file-actions button")?.click();
    }
    return true;
}