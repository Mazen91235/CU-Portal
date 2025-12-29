// file_upload_module.js - Consolidated file upload and link attachment module

// Global variables for file upload
let uploadedFiles = [];
let fileInput;
let uploadedFilesList;
let uploadedFilesSection;
let fileDropArea;

// Global variables for link attachment
let attachedLinksList;
let addLinkBtn;

// Initialize the module with required DOM elements
function initFileUploadModule(options) {
    // File upload elements
    fileInput = options.fileInput || document.getElementById('fileInput');
    uploadedFilesList = options.uploadedFilesList || document.getElementById('uploadedFilesList');
    uploadedFilesSection = options.uploadedFilesSection || document.getElementById('uploadedFilesSection');
    fileDropArea = options.fileDropArea || document.getElementById('fileDropArea');

    // Link attachment elements
    attachedLinksList = options.attachedLinksList || document.getElementById('attachedLinksList');
    addLinkBtn = options.addLinkBtn || document.getElementById('addLinkBtn');

    // Initialize file upload functionality
    initFileUpload();

    // Initialize link attachment functionality
    initLinkAttachment();
}

// File upload functionality
function initFileUpload() {
    if (!fileInput || !uploadedFilesList || !uploadedFilesSection || !fileDropArea) {
        console.error('Required DOM elements for file upload not found');
        return;
    }

    // File input change event
    fileInput.addEventListener('change', function() {
        for (const file of fileInput.files) {
            if (!uploadedFiles.some(f => f.name == file.name && f.size == file.size)) {
                uploadedFiles.push(file);
            }
        }
        renderUploadedFiles();
        fileInput.value = '';
    });

    // Drag & drop support
    fileDropArea.addEventListener('dragover', e => {
        e.preventDefault();
        fileDropArea.style.borderColor = '#7b2ff2';
    });

    fileDropArea.addEventListener('dragleave', e => {
        fileDropArea.style.borderColor = '#d1c4e9';
    });

    fileDropArea.addEventListener('drop', e => {
        e.preventDefault();
        fileDropArea.style.borderColor = '#d1c4e9';
        const files = Array.from(e.dataTransfer.files);
        for (const file of files) {
            if (!uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
                uploadedFiles.push(file);
            }
        }
        renderUploadedFiles();
    });
}

// Render uploaded files list
function renderUploadedFiles() {
    if (uploadedFiles.length > 0) {
        uploadedFilesSection.style.display = '';
    } else {
        uploadedFilesSection.style.display = 'none';
    }
    uploadedFilesList.innerHTML = '';
    uploadedFiles.forEach((file, idx) => {
        const item = document.createElement('div');
        item.className = 'uploaded-file-item';
        item.innerHTML = `
            <span class="uploaded-file-name" title="${file.name}"><i class='fa fa-file' style='margin-right:8px;'></i>${file.name}</span>
            <button type="button" class="remove-upload-btn" aria-label="Remove file" onclick="removeUploadedFile(${idx})">
                <i class="fa fa-times" style="color:#000;"></i>
            </button>
        `;
        uploadedFilesList.appendChild(item);
    });
}

// Remove uploaded file
function removeUploadedFile(idx) {
    uploadedFiles.splice(idx, 1);
    renderUploadedFiles();
}

// Make removeUploadedFile globally accessible
window.removeUploadedFile = removeUploadedFile;

// Link attachment functionality
function initLinkAttachment() {
    if (!attachedLinksList || !addLinkBtn) {
        console.error('Required DOM elements for link attachment not found');
        return;
    }

    // Add link button event
    addLinkBtn.onclick = function() {
        const newRow = createLinkRow();
        attachedLinksList.appendChild(newRow);
    };
}

// Create link row
function createLinkRow(title = '', url = '') {
    const row = document.createElement('div');
    row.className = 'attached-links-row mb-2';
    row.innerHTML = `
        <input type="text" class="form-control attached-link-title" placeholder="Link title" value="${title}">
        <input type="url" class="form-control attached-link-url" placeholder="https://" value="${url}">
        <button type="button" class="remove-link-btn" tabindex="-1">
            <i class="fa fa-times"></i>
        </button>
    `;
    row.querySelector('.remove-link-btn').onclick = function() {
        row.remove();
    };
    return row;
}

// Get uploaded files
function getUploadedFiles() {
    return uploadedFiles;
}

// Clear uploaded files
function clearUploadedFiles() {
    uploadedFiles = [];
    renderUploadedFiles();
}

// Get attached links
function getAttachedLinks() {
    if (!attachedLinksList) return [];
    const linkRows = attachedLinksList.querySelectorAll('.attached-links-row');
    const linksArr = [];
    linkRows.forEach(row => {
        const linkTitle = row.querySelector('.attached-link-title').value.trim();
        const linkUrl = row.querySelector('.attached-link-url').value.trim();
        if (linkTitle && linkUrl) {
            linksArr.push({ title: linkTitle, url: linkUrl });
        }
    });
    return linksArr;
}

// Clear attached links
function clearAttachedLinks() {
    if (attachedLinksList) {
        attachedLinksList.innerHTML = '';
    }
}

// Export functions for external use
window.FileUploadModule = {
    init: initFileUploadModule,
    getUploadedFiles: getUploadedFiles,
    clearUploadedFiles: clearUploadedFiles,
    getAttachedLinks: getAttachedLinks,
    clearAttachedLinks: clearAttachedLinks
};
