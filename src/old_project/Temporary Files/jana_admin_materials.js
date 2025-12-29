// Show main page
function showMainPage() {
    document.getElementById('mainPage').classList.add('active');
    document.getElementById('finalPage').classList.remove('active');
}
        
        // Show final page
        function showFinalPage(folderName) {
            // Update title and breadcrumb
            document.getElementById('finalPageBreadcrumb').textContent = folderName;
            document.getElementById('modalTitle').textContent = folderName;
            
            // Show final page and hide main page
            document.getElementById('mainPage').classList.remove('active');
            document.getElementById('finalPage').classList.add('active');
        }
        
        // Get DOM elements
        const modal = document.getElementById('cardDetailsModal');
        const closeModalBtn = document.getElementById('closeModal');
        const modalFileName = document.getElementById('modalFileName');
        const modalDate = document.getElementById('modalDate');
        const modalFileIcon = document.getElementById('modalFileIcon');
        
        // Add Folder Modal elements
        const addFolderModal = document.getElementById('addFolderModal');
        const addFolderBtn = document.getElementById('addFolderBtn');
        const addFolderBtn2 = document.getElementById('addFolderBtn2');
        const closeAddFolderModal = document.getElementById('closeAddFolderModal');
        const cancelAddFolder = document.getElementById('cancelAddFolder');
        const confirmAddFolder = document.getElementById('confirmAddFolder');
        const folderNameInput = document.getElementById('folderName');
        
        // Add File Modal elements
        const addFileModal = document.getElementById('addFileModal');
        const addFileBtn = document.getElementById('addFileBtn');
        const addFileBtn2 = document.getElementById('addFileBtn2');
        const closeAddFileModal = document.getElementById('closeAddFileModal');
        const cancelAddFile = document.getElementById('cancelAddFile');
        const confirmAddFile = document.getElementById('confirmAddFile');
        const fileNameInput = document.getElementById('fileName');
        const fileTypeSelect = document.getElementById('fileType');
        const fileUploadArea = document.getElementById('fileUploadArea');
        const browseBtn = document.getElementById('browseBtn');
        const fileInput = document.getElementById('fileInput');
        const fileList = document.getElementById('fileList');
        const fileCount = document.getElementById('fileCount');
        
        // Selected files array
        let selectedFiles = [];
        
        // Add event listeners to all file cards
        document.querySelectorAll('.file-card').forEach(card => {
            card.addEventListener('click', function() {
                // Get file data
                const fileName = this.getAttribute('data-filename');
                const fileDate = this.getAttribute('data-date');
                
                // Determine file type and icon
                let fileIcon = '';
                if (fileName.endsWith('.pdf')) {
                    fileIcon = 'far fa-file-pdf text-red-500';
                } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
                    fileIcon = 'far fa-file-excel text-green-500';
                } else if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) {
                    fileIcon = 'far fa-file-word text-blue-500';
                } else if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt')) {
                    fileIcon = 'far fa-file-powerpoint text-orange-500';
                }
                
                // Update modal content
                modalFileName.textContent = fileName;
                modalDate.innerHTML = `<i class="far fa-calendar-alt mr-1"></i>${fileDate}`;
                modalFileIcon.className = `${fileIcon} text-2xl mr-3`;
                
                // Show modal
                modal.classList.add('active');
            });
        });
        
        // Close modal when clicking close button
        closeModalBtn.addEventListener('click', function(e) {
            e.preventDefault();
            modal.classList.remove('active');
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
        
        // Show Add Folder Modal when clicking Add Folder buttons
        addFolderBtn.addEventListener('click', function() {
            addFolderModal.classList.add('active');
            folderNameInput.focus();
        });
        
        addFolderBtn2.addEventListener('click', function() {
            addFolderModal.classList.add('active');
            folderNameInput.focus();
        });
        
        // Close Add Folder Modal
        closeAddFolderModal.addEventListener('click', function() {
            addFolderModal.classList.remove('active');
            folderNameInput.value = '';
        });
        
        cancelAddFolder.addEventListener('click', function() {
            addFolderModal.classList.remove('active');
            folderNameInput.value = '';
        });
        
        // Close Add Folder Modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target === addFolderModal) {
                addFolderModal.classList.remove('active');
                folderNameInput.value = '';
            }
        });
        
        // Handle Add Folder confirmation
        confirmAddFolder.addEventListener('click', function() {
            const folderName = folderNameInput.value.trim();
            
            if (folderName) {
                // Here you would typically send the folder name to the server
                // For demonstration, we'll just show a success message and close the modal
                alert(`Folder "${folderName}" has been created successfully!`);
                addFolderModal.classList.remove('active');
                folderNameInput.value = '';
                
                // In a real application, you would refresh the folder list
                // or add the new folder to the DOM dynamically
            } else {
                // Highlight the input field if empty
                folderNameInput.style.borderColor = '#EF4444';
                setTimeout(() => {
                    folderNameInput.style.borderColor = '';
                }, 2000);
            }
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
            fileNameInput.focus();
        });
        
        addFileBtn2.addEventListener('click', function() {
            addFileModal.classList.add('active');
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
        window.addEventListener('click', function(e) {
            if (e.target === addFileModal) {
                addFileModal.classList.remove('active');
                resetAddFileModal();
            }
        });
        
        // Handle Browse button click
        browseBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        // Handle file selection
        fileInput.addEventListener('change', function() {
            handleFileSelection(this.files);
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
            handleFileSelection(e.dataTransfer.files);
        });
        
        // Handle file selection
        function handleFileSelection(files) {
            // Add new files to the selectedFiles array
            for (let i = 0; i < files.length; i++) {
                selectedFiles.push(files[i]);
            }
            
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
            
            selectedFiles.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                
                // Determine file icon
                let fileIcon = 'fa-file';
                if (file.type.includes('pdf')) {
                    fileIcon = 'fa-file-pdf text-red-500';
                } else if (file.type.includes('word') || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
                    fileIcon = 'fa-file-word text-blue-500';
                } else if (file.type.includes('excel') || file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
                    fileIcon = 'fa-file-excel text-green-500';
                } else if (file.type.includes('powerpoint') || file.name.endsWith('.ppt') || file.name.endsWith('.pptx')) {
                    fileIcon = 'fa-file-powerpoint text-orange-500';
                }
                
                fileItem.innerHTML = `
                    <i class="far ${fileIcon} file-item-icon"></i>
                    <span class="file-item-name">${file.name}</span>
                    <button class="file-item-remove" data-index="${index}">Remove</button>
                `;
                
                fileList.appendChild(fileItem);
            });
            
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
        }
        
        // Update the file count
        function updateFileCount() {
            const count = selectedFiles.length;
            fileCount.textContent = `+ Add ${count} File${count !== 1 ? 's' : ''}`;
            confirmAddFile.textContent = `+ Add ${count} File${count !== 1 ? 's' : ''}`;
            confirmAddFile.disabled = count === 0;
        }
        
        // Reset the Add File Modal
        function resetAddFileModal() {
            selectedFiles = [];
            fileNameInput.value = '';
            fileTypeSelect.value = 'PDF';
            fileInput.value = '';
            fileList.innerHTML = '';
            updateFileCount();
            fileUploadArea.querySelector('.file-upload-text').textContent = 'No file selected';
        }
        
        // Handle Add File confirmation
        confirmAddFile.addEventListener('click', function() {
            const fileName = fileNameInput.value.trim();
            const fileType = fileTypeSelect.value;
            
            if (selectedFiles.length > 0) {
                // Here you would typically send the files to the server
                // For demonstration, we'll just show a success message and close the modal
                const fileNames = selectedFiles.map(file => file.name).join(', ');
                alert(`${selectedFiles.length} file(s) (${fileNames}) have been uploaded successfully!`);
                addFileModal.classList.remove('active');
                resetAddFileModal();
                
                // In a real application, you would refresh the file list
                // or add the new files to the DOM dynamically
            }
        });
        
        // Handle Enter key in file name input
        fileNameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !confirmAddFile.disabled) {
                confirmAddFile.click();
            }
        });