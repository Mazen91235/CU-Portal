// user_announcement_details.js - Fetch and display announcement details for user

// Function to get announcement details by ID
async function fetchUserAnnouncementDetails(id) {
  try {
    const response = await axios.get(`${domain}/user/announcements/${id}`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      },
      withCredentials: true
    });
    return response.data?.data;
  } catch (error) {
    console.error("Error fetching user announcement details:", error);
    showToast("error", "Error", error.response?.data?.message || "Failed to create courses", "");
    return null;
  }
}

// Function to populate the page with announcement data
function populateUserAnnouncementDetails(announcement) {  
  if (!announcement) {
    console.error("No announcement data to display");
    return;
  }

  // Populate title
  const titleElement = document.querySelector(".announcement-details-title");
  if (titleElement) titleElement.textContent = announcement.title || "Untitled Announcement";

  // Populate subject
  const subjectElement = document.querySelector("#announcementSubject");
  if (subjectElement) subjectElement.textContent = announcement.subject.name || "N/A";

  // Populate author
  const authorElement = document.querySelector("#announcementAuthor");
  if (authorElement) authorElement.textContent = announcement.author.name || "Unknown";

  // Populate content
  const contentElement = document.querySelector(".card-content pre");
  if (contentElement) contentElement.innerHTML = announcement.content || "No content available";

  if(announcement.urls && announcement.urls.length > 0){
            document.querySelector('.attachments-list').innerHTML = '';
            announcement.details?.files_data?.forEach(file => {
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
          <button class="download-button" onclick="downloadFile('${file.id}', '${getDownloadName(file.name, file.name, file.mimeType)}')">
            <img src="../assets/y5.svg" width="20px">            Download
          </button>
          <button class="preview-button" onclick="previewFile('${file.id}', '${file.name}', '${file.name}', '${file.mimeType}')">
            <img src="../assets/y4.svg" width="20px">
            Preview
          </button>
        </div>
      </div>
                `;
            });
        }else{
            document.querySelector('.attachments-list').innerHTML = '<p>No files provided.</p>';
        }
        if(announcement.links && announcement.links.length > 0){
            document.querySelector('.links-list').innerHTML = '';
            announcement.links.forEach(link => {
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
                            <i class="far fa-arrow-up-right_from_square"></i>
                            Open
                        </a>
                        </div>
                    </div>
                `;
            });
        }else{
            document.querySelector('.links-list').innerHTML = '<p>No links provided.</p>';
        }
}

// Main function to initialize on page load
document.addEventListener("DOMContentLoaded", async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const announcementId = urlParams.get("id");

  if (!announcementId) {
    console.error("No announcement ID provided in URL");
    return;
  }

  const announcement = await fetchUserAnnouncementDetails(announcementId);
  populateUserAnnouncementDetails(announcement);
});

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