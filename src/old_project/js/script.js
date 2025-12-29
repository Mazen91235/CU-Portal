// const domain = "https://cu-portal.com/api/v1"; // Update with your actual domain
const domain = "https://cu-portal.com/api/v1"; // Update with your actual domain
// const domain = "https://f5e23c67fc47.ngrok-free.app"; // Update with your actual domain


//lets Understand the Code git pull
// This script handles user authentication, image uploads, and session management for the Students Portal CU application.
// It includes functions for signup, login, password reset, and user data retrieval.
// It also provides utility functions for cookie management, error handling, and form validation.
// Importing Axios for HTTP requests
// Helper Functions
function GetCookie(name) {
    const cookieArr = document.cookie.split(";");
    for (let i = 0; i < cookieArr.length; i++) {
        const cookiePair = cookieArr[i].trim();
        if (cookiePair.indexOf(name + "=") === 0) {
            return decodeURIComponent(cookiePair.substring(name.length + 1));
        }
    }
    return null;
}

function SetCookie(name, value, seconds) {
    let expires = "";
    if (seconds) {
        const date = new Date();
        date.setTime(date.getTime() + (seconds * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function GetParams(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function ShowError(msg) {
    const errorDiv = document.getElementById("error-message");
    if (errorDiv) {
        errorDiv.innerText = msg;
        errorDiv.classList.remove("hidden");
        errorDiv.classList.add("show");

        setTimeout(() => {
            errorDiv.classList.remove("show");
            errorDiv.classList.add("hidden");
        }, 5000);
    } else {
        alert(msg);
    }
}
function ShowSuccess(msg) {
    const errorDiv = document.getElementById("error-message");
    if (errorDiv) {
        errorDiv.innerText = msg;
        errorDiv.classList.remove("hidden");
        errorDiv.classList.add("show");

        setTimeout(() => {
            errorDiv.classList.remove("show");
            errorDiv.classList.add("hidden");
        }, 5000);
    } else {
        alert(msg);
    }
}

async function fetchSidebarAndNavbar() {
  if(!document.getElementById("content-wrapper")){
    showToast("error","Error","Content wrapper not found. This page has a great failure.","");
    return;
  }
  let contentWrapper = document.getElementById("content-wrapper");
  if(!document.getElementById("sidebar-container")){
    let sidebar = document.createElement('div');
    sidebar.id = "sidebar-container";
    document.body.insertBefore(sidebar, document.body.firstChild);
  }
  if(!document.getElementById("navbar-container")){
    let navbar = document.createElement('div');
    navbar.id = "navbar-container";
    navbar.classList.add("fixed-top");
    contentWrapper.insertBefore(navbar, contentWrapper.firstChild);
  }
  if(!document.getElementById("toast-container")){
    let toast = document.createElement('div');
    toast.id = "toast-container";
    contentWrapper.appendChild(toast);
  }
  if(!document.getElementById("popup-container")){
    let popup = document.createElement('div');
    popup.id = "popup-container";
    contentWrapper.appendChild(popup);
  }
  if(!document.getElementById("loadingOverlayContainer")){
    let loadingOverlay = document.createElement('div');
    loadingOverlay.id = "loadingOverlayContainer";
    loadingOverlay.classList.add("d-none");
    loadingOverlay.classList.add("w-full");
    loadingOverlay.classList.add("h-full");
    loadingOverlay.style.width = '100vw';
    loadingOverlay.style.height = '100vh';
    loadingOverlay.style.top = '0';
    loadingOverlay.style.left = '0';
    loadingOverlay.style.zIndex = '50';
    contentWrapper.appendChild(loadingOverlay);
  }
  if(![...document.scripts].some(s => s.src.includes("toast.js"))){
    let script = document.createElement('script');
    script.src = "../js/toast.js";
    document.body.appendChild(script);
  }
  if(![...document.scripts].some(s => s.src.includes("popup.js"))){
    let script = document.createElement('script');
    script.src = "../js/popup.js";
    document.body.appendChild(script);
  }
  if(![...document.scripts].some(s => s.src.includes("loading.js"))){
    let script = document.createElement('script');
    script.src = "../js/loading.js";
    document.body.appendChild(script);
  }
  if(!await[...document.scripts].some(s => s.src.includes("loadscreen.js"))){
    let script = document.createElement('script');
    script.src = "../js/loadscreen.js";
    document.body.appendChild(script);
  }
  if(![...document.scripts].some(s => s.src.includes("script.js"))){
    let script = document.createElement('script');
    script.src = "../js/script.js";
    document.body.appendChild(script);
  }
  LoadSidebarAndNavbar();
}

document.addEventListener("DOMContentLoaded", async () => {
  if(GetCookie("success")){
    showToast("success","Success",GetCookie("success"),"");
    SetCookie("success","",-1);
  }
  if(GetCookie("error")){
    showToast("error","Error",GetCookie("error"),"");
    SetCookie("error","",-1);
  }
  await fetchSidebarAndNavbar();
});

//get google Stored token 
//ask if there is 
let GetGoogleStoredToken = new Promise((resolve) => {
  let oauthState = GetCookie("oauth_state");
    if (!oauthState) {
        resolve(null);
        return;
    }
     axios.post(`${domain}/auth/get-google-stored-token`, {
      "google_details_token": GetCookie("google_details_token"),
      "oauth_state": oauthState
    }, {
        headers: {
            "ngrok-skip-browser-warning": "true",
        },
        withCredentials: true
    })
    .then((response) => {
        let data = response.data;
        if(data && data.data && data.data.access_token) {
            resolve(data.data.access_token);
        } else {
            resolve(null);
        }
    })
    .catch((error) => {
        // console.error('Error getting Google stored token:', error);
        resolve(null);
    });
});
let GetGoogleAccessToken = new Promise(async (resolve) => {
    let response = await GetGoogleStoredToken;
    if(response != null) {
      resolve(response);
      return;
    }
    await IsLoggedIn();
    axios.get(`${domain}/auth/get-google-access-token`, {
        headers: {
            "ngrok-skip-browser-warning": "true",
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + GetCookie('access_token')
        },
        withCredentials: true
    })
    .then((response) => {
        let data = response.data;
        if(data && data.data && data.data.access_token) {
            resolve(data.data.access_token);
        } else {
            resolve(null);
        }
    })
    .catch((error) => {
        resolve(null);
    });
});
function capitalize(str) {
    return str.toString().charAt(0).toUpperCase() + str.toString().slice(1);
}
function formatDateIntoPeriod(date){
    const now = new Date();
    const pastDate = new Date(date);
    const diffInSeconds = Math.floor((now.valueOf() - pastDate.valueOf()) / 1000);
    if (diffInSeconds < 60) {
        return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if( diffInSeconds < 2592000 ) { // less than 30 days
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days === 1 ? '' : 's'} ago`;
    } else if( diffInSeconds < 31104000 ) { // less than 365 days
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months} month${months === 1 ? '' : 's'} ago`;
    } else {
        const years = Math.floor(diffInSeconds / 31104000);
        return `${years} year${years === 1 ? '' : 's'} ago`;
    }
}
async function UploadToDrive(file){
    if(!file) return false;
    if(!file.name || !file.type) {
        console.error('Invalid file object provided.');
        return false;
    }
    // if(file.size > 10 * 1024 * 1024) { // 10 MB limit
    //     console.error('File size exceeds the limit of 10 MB.');
    //     return false;
    // }
    let formData = new FormData();
    let metadata = {
        'name': file.name,
        'mimeType': file.type,
        'parents': ['root'] // Change 'root' to the desired folder ID if needed
    };
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);
    let url = null;
    let access_token = await GetGoogleAccessToken;
    if(!access_token) {
        showToast("error", "Error.", "Please Authorize Google Account First to Proceed.", "");
        // console.error('No access token found. Please authorize Google first.');
        return false;
    }
    try{
      let UploadData = await axios.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', formData, {
              headers: {
                  'Content-Type': 'multipart/related ',
                  'Authorization': `Bearer ${access_token}`
              }
          });
      let fileId = UploadData.data.id;
      if(!fileId) {
          console.error('File upload failed. No file ID returned.');
          return false;
      }
      await axios.post(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
                  'role': 'reader',
                  'type': 'anyone'
              }, {
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${access_token}`
                  }
              });
      url = `https://drive.google.com/uc?export=view&id=${fileId}`;
      console.log('File made public:', url);
      return url;
    } catch (error) {
      let errorMsg = error.response?.data?.error?.message || 'File upload failed. Please try again.';
      if(errorMsg.toLowerCase().includes("quota") || errorMsg.toLowerCase().includes("storage")){
        errorMsg = "Not Enough Storage on Your Google Drive. Please try again later after clearing some space.";
      }
      return {"error": errorMsg};
    }
}
async function GetGoogleDriveResumableSession(file, access_token, processId=null) {
    if(!file) return false;
    if(!file.name || !file.type) {
        setFailed(processId, 'Invalid file object provided.');
        return false;
    }
    let metadata = {
        'name': file.name,
        'mimeType': file.type,
        'parents': ['root'] // Change 'root' to the desired folder ID if needed
    };
    try {
        let response = await axios.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable', metadata, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
                'X-Upload-Content-Type': file.type,
                'X-Upload-Content-Length': file.size || 0
            }
        });
        const location = response.headers['location'];
        if (!location) {
            setFailed(processId, 'Error creating resumable session.');
            return false;
        }
        return location;
    } catch (error) {
        setFailed(processId, 'Error creating resumable session.');
        return false;
    }
}
async function UploadToDriveBG(file, processId=null, callback=null){
    if(!file) return false;
    if(!file.name || !file.type) {
        setFailed(processId, 'Invalid file object provided.');
        return false;
    }
    let formData = new FormData();
    let metadata = {
        'name': file.name,
        'mimeType': file.type,
        'parents': ['root'] // Change 'root' to the desired folder ID if needed
    };
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);
    let url = null;
    let access_token = await GetGoogleAccessToken;
    if(!access_token) {
        showToast("error", "Error.", "Please Authorize Google Account First to Proceed.", "");
        return false;
    }
    try{
      // use xhr to track progress and upload in chunks in background
      let resumableSession = await GetGoogleDriveResumableSession(file, access_token, processId);
      if(!resumableSession) return false;
      let chunkSize = 5 * 1024 * 1024; // 5 MB
      let start = 0;
      let end = 0;
      let totalSize = file.size || 0;
      let progress = 0;
      updateProgress(processId, progress);
      while (start < totalSize) {
          end = Math.min(start + chunkSize, totalSize);
          let chunk = file.slice(start, end);
          let uploaded = await UploadChunk(resumableSession, chunk, start, end - 1, totalSize, access_token, processId);
          if (!uploaded) return false;
          progress = Math.min((end / totalSize) * 100, 100);
          updateProgress(processId, progress);
          start = end;
      }
      let fileId = await FinalizeUpload(resumableSession, totalSize, access_token, processId);
      if(!fileId) return false;
      const url = await MakeFilePublic(fileId, access_token, processId);
      if(!url) return false;
      if (callback) await callback(url);
    } catch (error) {
      let errorMsg = error.response?.data?.error?.message || 'File upload failed. Please try again.';
      if(errorMsg.toLowerCase().includes("quota") || errorMsg.toLowerCase().includes("storage")){
        errorMsg = "Not Enough Storage on Your Google Drive. Please try again later after clearing some space.";
      }
      setFailed(processId, errorMsg);
      return false;
    }
}
async function UploadChunk(sessionUrl, chunk, start, end, total, access_token, processId=null, maxRetries=3) {
  let errorMsg = null;
  for(let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      let response = await axios.put(sessionUrl, chunk, {
        headers: {
          'Content-Range': `bytes ${start}-${end}/${total}`,
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/octet-stream'
        }
      });
      if (response && response.status === 308) {
        // Resume upload
        const range = response.headers['Range'];
        if(!range) return true;
        const lastByte = parseInt(range.split('-')[1]);
        if (lastByte > start){
          return await UploadChunk(sessionUrl, chunk, lastByte + 1, end, total, access_token, processId, maxRetries);
        }
        return true;
      }
      return true;
    } catch (error) {
      if (error.response && error.response.status === 308) {
        // Resume upload
        const range = error.response.headers['Range'];
        if(!range) return true;
        const lastByte = parseInt(range.split('-')[1]);
        if (lastByte > start){
          return await UploadChunk(sessionUrl, chunk, lastByte + 1, end, total, access_token, processId, maxRetries);
        }
        return true;
      }
      errorMsg = error.response?.data?.error?.message || 'File upload failed. Please try again.';
      if(errorMsg.toLowerCase().includes("quota") || errorMsg.toLowerCase().includes("storage")){
        errorMsg = "Not Enough Storage on Your Google Drive. Please try again later after clearing some space.";
      }
      if (attempt < maxRetries - 1 && 
        (!error.response || error.response.status >= 500)) {
        await new Promise(res => setTimeout(res, Math.pow(2, attempt+1) * 1000));
        continue;
      }
            
      setFailed(processId, errorMsg);
      return false;
    }
  }
  setFailed(processId, errorMsg);
  return false;
}
async function FinalizeUpload(sessionUrl, totalSize, access_token, processId=null) {
  try{
    setProcessing(processId);
    const response = await axios.put(sessionUrl, null, {
        headers: {
            'Content-Range': `bytes */${totalSize}`,
            'Authorization': `Bearer ${access_token}`
        }
    });
    return response.data.id;
  } catch (error) {
    let errorMsg = error.response?.data?.error?.message || 'File upload failed. Please try again.';
    if(errorMsg.toLowerCase().includes("quota") || errorMsg.toLowerCase().includes("storage")){
      errorMsg = "Not Enough Storage on Your Google Drive. Please try again later after clearing some space.";
    }
    setFailed(processId, errorMsg);
    return false;
  }
}
async function MakeFilePublic(fileId, access_token, processId=null) {
  try{
      await axios.post(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
                  'role': 'reader',
                  'type': 'anyone'
              }, {
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${access_token}`
                  }
              });
      url = `https://drive.google.com/uc?export=view&id=${fileId}`;
      return url;
  } catch(error){
      let errorMsg = error.response?.data?.error?.message || 'File upload failed. Please try again.';
      if(errorMsg.toLowerCase().includes("quota") || errorMsg.toLowerCase().includes("storage")){
        errorMsg = "Not Enough Storage on Your Google Drive. Please try again later after clearing some space.";
      }
      setFailed(processId, errorMsg);
      return false;
  }
}
async function RemoveFromDrive(url) {
    let urlObj = new URLSearchParams(url);
    let fileId = urlObj.get("id");
    if (!fileId) {
        console.error('Invalid URL. Unable to extract file ID.');
        return false;
    }
    let access_token = await GetGoogleAccessToken;
    if (!access_token) {
      showToast("error","No access token found.","Please authorize Google first.","");
        return false;
    }
    try {
        await axios.delete(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                "Content-Type": "application/json"
            }
        });
        console.log('File removed successfully:', url);
        return true;
    } catch (error) {
        console.error('Error removing file:', error);
        return false;
    }
}
function GetDriveId(url){
  try{
      if(!url) return null;
        if(url.includes("id=")){
            let urlObj = new URLSearchParams(url);
            return urlObj.get("id");
        }
        if(url.includes("/folders/")){
            fileId = url.split("/folders/")[1];
            return (fileId.includes("?")) ? fileId.split("?")[0] : fileId;
        }
        if(url.includes("/file/d/")){
            fileId = url.split("/file/d/")[1];
            return (fileId.includes("/")) ? fileId.split("/")[0] : fileId;
        }
        return null;
  } catch (error) {
      console.error('Error extracting Drive ID:', error);
      return null;
  }
}
function GeneratePreviewUrl(url){
    if (!url) return null;
    let id = GetDriveId(url);
    if(!id) return null;
    return `https://drive.google.com/file/d/${id}/preview`;
}
// Authentication Functions
// Signup function to handle user registration
//
async function Signup(form) {
    showLoading();
    event.preventDefault();
    const formData = new FormData(form);
    const fileInput = document.getElementById("file");
    const file = fileInput?.files[0];
    let googleDetailsToken = GetCookie("google_details_token");
    formData.append("google_details_token", googleDetailsToken);
    // Upload image if selected
    if (file) {
        if(file.size > 10 * 1024 * 1024) { // 10 MB limit
            hideLoading();
            showToast("error","File Size Error","File size exceeds the limit of 10 MB.","");
            return;
        }
        if (!file.type.startsWith("image/")) {
            hideLoading();
            showToast("error","Invalid File Type","Please upload a valid image file.","");
            return;
        }
        console.log("Uploading image:", file.name);
        let url = await UploadToDrive(file); // Replace 'file' with the actual file object you want to upload
        if (!url || typeof url != 'string') {
            hideLoading();
            if(url && typeof url != 'string'){
              showToast("error","Error", url.error || "Image upload failed. Please try again.","");
              return;
            }
            showToast("error","Image Upload Failed","Image upload failed. Please try again.","");
            return;
        }
        console.log("Image uploaded successfully:", url);
        formData.append("url", url);
        
    }
    formData.delete("file"); // Remove file input from formData to avoid sending it twice
    // Send signup request
    try {
        const response = await axios.post(`${domain}/auth/signup`, formData, {
            headers: {
                "ngrok-skip-browser-warning": "true",
                "Content-Type": "multipart/form-data"
            },
            withCredentials: true
        });

        const data = response.data;
        if (data.status == "success") {
            hideLoading();
            window.location.href = `/verify_email.html`;
            SetCookie("success", data.message);
        } else {
            hideLoading();
            showToast("error","Signup Failed",data.message,"");
        }
    } catch (error) {
            hideLoading();

        console.error("Signup error:", error);
        showToast("error","Signup Failed",error.response?.data?.message || "Signup failed. Please try again","");
    }
}


async function GetUser(tries=0) {
    showLoading();
    if (tries > 1) return null;
    return axios.get(`${domain}/user/get-user-data`, {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true"
        },
        withCredentials: true
    })
    .then(response => {
        const data = response.data;
        if (data.status == "success") {
            hideLoading();
            return data.data;
        } else {
            hideLoading();
            showToast("error","Error",data.message,"");
            return null;
        }
    })
    .catch(error => {
        console.error("Error retrieving user data:", error);
        if (error.response) {
            return axios.post(`${domain}/auth/refresh`, {
                refresh_token: GetCookie("refresh_token")
            }, {
                headers: { "ngrok-skip-browser-warning": "true" },
                withCredentials: true
            })
            .then(response => {
                let data = response.data;
                if (data.status == "success") {
                    hideLoading();
                    data = data.data;
                    SetCookie("access_token", data.access_token, data.access_expires_in);
                    SetCookie("refresh_token", data.refresh_token, data.refresh_expires_in);
                    return GetUser(tries + 1);
                } else {
                    hideLoading();
                     showToast("error","Error",data.message,"");
                    return null;
                }
            })
            .catch(error => {
                hideLoading();
                showToast("error","Session expired.",error.response?.data?.message || "Session expired. Please login again","");
                return null;
            });
        } else {
            hideLoading();
            showToast("error","Error",error.response?.data?.message || "Error retrieving user data","");
            return null;
        }
    });
}
async function GetPermissions(){
  try{
    let response = await axios.get(`${domain}/user/get-user-permissions`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      },
      withCredentials: true
    });
    if(Math.floor(response.status / 100) != 2 || !response.data || response.data.status != "success"){
      hideLoading();
      showToast("error","Error", response.data.message || "Error retrieving permissions","");
      return null;
    }
    return response.data.data || null;
  } catch(error){
    hideLoading();
    showToast("error","Error",error.response?.data?.message || "Error retrieving permissions","");
    return null;
  }
}
function Logout() {
  console.log(GetCookie("access_token"));
  console.log(GetCookie("refresh_token"));
  axios.get(`${domain}/auth/logout`, {
    headers: {
      "ngrok-skip-browser-warning": "true",
      "Authorization": `Bearer ${GetCookie("access_token")}`
    },
    withCredentials: true
  })
  .then(response => {
    const data = response.data;
    if (data.status == "success") {
      SetCookie("access_token", "", -1);
      SetCookie("refresh_token", "", -1);
      SetCookie("google_details_token", "", -1);
      SetCookie("oauth_state", "", -1);
      window.location.href = `/login.html`;
      return true;
    }else{
      showToast("error","Error",data.message,"");
    }
  })
  .catch(error => {
    showToast("error","Error",error.response?.data?.message || "Logout failed. Please try again.","");
  });
}
async function GetFileId(url){
    let urlObj = new URLSearchParams(url);
    let fileId = urlObj.get("id");
    if (!fileId) {
        console.error('Invalid URL. Unable to extract file ID.');
        return false;
    }
    return fileId;
}
async function refreshToken() {
  return axios.post(`${domain}/auth/refresh`, {
    refresh_token: GetCookie("refresh_token")
  }, {
    headers: {
      "Authorization": `Bearer ${GetCookie("access_token")}`,
      "ngrok-skip-browser-warning": "true"
    },
    withCredentials: true

  })
  .then(response => {
    if(Math.floor(response.status / 100) != 2) throw new Error("Failed to refresh token");
    const data = response.data.data || response.data;
    SetCookie("access_token", data.access_token, data.access_expires_in);
    SetCookie("refresh_token", data.refresh_token, data.refresh_expires_in);
    return data.access_token;
  })
  .catch(err => {
    if(!window.location.pathname.includes("/user") && !window.location.pathname.includes("/admin")) throw err;
    showToast("error", "Session expired", "Please login again", "");
    throw err;
  });
}
async function IsLoggedIn() {
  try{
    let response = await axios.get(`${domain}/auth/is-logged-in`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      },
      withCredentials: true
    });
    if (Math.floor(response.status / 100) != 2 || !response.data || response.data.status != "success") {
      response = await refreshToken();
      if(!response){
        if(response && response.status == 429){
          SetCookie("error","Too many requests. Please try again later.");
          return false;
        }
        if(!window.location.pathname.includes("/user") && !window.location.pathname.includes("/admin")) return false;
        window.location.href = "/login.html";
        SetCookie("error","Invalid Login Session. Please log in to access this resource.");
        return false;
      }
    }
    return true;
  } catch(err){
    if(err.response && err.response.status == 429){
      SetCookie("error","Too many requests. Please try again later.");
      return false;
    }
    if(!window.location.pathname.includes("/user") && !window.location.pathname.includes("/admin")) return false;
    window.location.href = "/login.html";
    if(err.response && err.response.status != 429)
      SetCookie("error","Invalid Login Session. Please log in to access this resource.");
    return false;
  }
}
function formatDueDate(deadline){
  console.log(deadline);
  if(!deadline) return "";
  let dateObj = null;
  let formattedDate = "";
  if(deadline.includes(' ')){
      dateObj = new Date(deadline.split(' ')[0].split('-').reverse().join('-')+'T'+deadline.split(' ')[1]);
      formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) + ' ' + dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }else{
      dateObj = new Date(deadline.split('-').reverse().join('-'));
      formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  return formattedDate;
}

// if(!(await IsLoggedIn())) {
//     window.location.href = "/login.html?error=true&message=Invalid Login Session. Please log in to access this resource.";
// }
// years

async function searchYears(query = "") {
  if (!(await IsLoggedIn())) {
    window.location.href = "/login.html?error=true&message=Invalid Login Session. Please log in to access this resource.";
    return;
  }

  try {
    const res = await axios.get(
      `${domain}/admin/search-years`,
      {
        params: { query }, 

        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true"
        },
        withCredentials: true
      }
    );

    return res.data; 
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return searchYears(query); // retry
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to search years", "");
    return [];
  }
}

// Department


async function searchDepartments( query="", faculty_id="", study_type="" ) {

  if(!(await IsLoggedIn())) {
    window.location.href = "/login.html?error=true&message=Invalid Login Session. Please log in to access this resource.";
  }

  try {
    const res = await axios.get(`${domain}/admin/search-departments`, {
      params: {
        query,
        faculty_id,
        study_type
      },
       

      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      },
      withCredentials: true
    });

    // Make sure to return the array of departments
    return res.data;  

  } catch (error) {
    console.error("Search error:", error);
    showToast("error", "Error", error.response?.data?.message || "Failed to search departments", "");
    return []; 
  }
}



// Faculty


async function searchFaculties(query = "") {
  await IsLoggedIn()

  try {
    const res = await axios.get(
      `${domain}/admin/search-faculties`,
      {  

        params: { query },
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true"
        },
        withCredentials: true
      }
    );

    return res.data; // returns list of matching faculties
  } catch (error) {
    showToast("error", "Error", error.response?.data?.message || "Failed to search faculties", "");
    return [];
  }
}



//Roles

async function searchRoles(query = "") {
  if (!(await IsLoggedIn())) {
    window.location.href = "/login.html?error=true&message=Invalid Login Session. Please log in to access this resource.";
    return;
  }

  try {
    const res = await axios.get(
      `${domain}/admin/search-roles`,
      {
        params: { query },

        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true"
        },
        withCredentials: true
      }
    );

    return res.data; 
  } catch (error) {
    console.error("Search roles error:", error);
    if (error.response?.status === 401) {
      await refreshToken();
      return searchRoles(query); // retry
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to search roles", "");
    return [];
  }
}
async function searchCourses( query="", faculty_id="", department_id="", year_id="", page=1, limit=10 ) {

  if(!(await IsLoggedIn())) {
    window.location.href = "/login.html?error=true&message=Invalid Login Session. Please log in to access this resource.";
  }

  try {
    const res = await axios.get(`${domain}/admin/search-courses`, {
      params: {
        query,
        faculty_id,
        department_id,
        year_id,
        page,
        limit
      },
       

      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      },
      withCredentials: true
    });

    return res.data || [];  

  } catch (error) {
    console.error("Search error:", error);
    showToast("error", "Error", error.response?.data?.message || "Failed to search courses", "");
    return [];
  }
}
async function searchUsers({
  query = "",
  faculty_id = "",
  department_id = "",
  year_id = "",
  is_active = "",
  page = 1,
  limit = 10
} = {}) {
  try {
    const res = await axios.get(`${domain}/admin/search-users?query&faculty_id&department_id&year_id&is_active&page&limit`, {
      params: {
        query,
        faculty_id,
        department_id,
        year_id,
        is_active,
        page,
        limit
      },
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      },    withCredentials: true

    });

    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return getUsers({ query, faculty_id, department_id, year_id, is_active, page, limit });
    }
    if (error.response?.status === 403) {
      showToast("error", "Forbidden", "You don’t have permission to access users.", "");
      return null;
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load users", "");
    return null;
  }
}

// Announcement Details Functions
async function fetchAnnouncementDetails(id) {
  try {
    const response = await axios.get(`${domain}/admin/announcements/${id}`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      },
      withCredentials: true
    });

    return response.data; // Assuming the response has the announcement data
  } catch (error) {
    console.error('Error fetching announcement details:', error);
    showToast("error", "Error", error.response?.data?.message || "Failed to fetch announcement details", "");
    return null;
  }
}

function populateAnnouncementDetails(data) {
  if (!data) return;

  // Title
  const titleElement = document.querySelector('.task-details-title');
  if (titleElement) titleElement.textContent = data.title || 'Announcement Title';

  // Subject
  const subjectElement = document.querySelector('.div1 .card1-value');
  if (subjectElement) subjectElement.textContent = data.subject || 'N/A';

  // Author
  const authorElement = document.querySelector('.div2 .card1-value');
  if (authorElement) authorElement.textContent = data.author || 'N/A';

  // Faculty
  const facultyElement = document.querySelector('.div3 .card1-value');
  if (facultyElement) facultyElement.textContent = data.faculty || 'N/A';

  // Department
  const departmentElement = document.querySelector('.div4 .card1-value');
  if (departmentElement) departmentElement.textContent = data.department || 'N/A';

  // Year
  const yearElement = document.querySelector('.div5 .card1-value');
  if (yearElement) yearElement.textContent = data.year || 'N/A';

  // Content
  const contentElement = document.querySelector('.task-details-desc-body');
  if (contentElement) {
    contentElement.innerHTML = data.content || 'No content available';
    // Append created by info if available
    if (data.created_by) {
      contentElement.innerHTML += `<br>created by: ${data.created_by}`;
    }
    if (data.created_by_department) {
      contentElement.innerHTML += `<br>${data.created_by_department}`;
    }
  }

  // Attachments
  const attachmentsContainer = document.querySelector('.task-details-desc-content');
  // Clear existing attachments except the title and download all button
  const existingAttachments = attachmentsContainer?.querySelectorAll('.task-details-attachment-row');
  existingAttachments?.forEach(att => att.remove());

  if (data.urls && Array.isArray(data.urls)) {
    data.urls.forEach(url => {
      const attachmentRow = document.createElement('div');
      attachmentRow.className = 'task-details-attachment-row';
      attachmentRow.style = 'background-color: #fff; border: none;';
      attachmentRow.innerHTML = `
        <div class="attachment-icon" style="color: #000000;">
          <img src="../assets/task9.png" alt="Attachment" style="width:20px;height:20px;">
        </div>
        <div class="attachment-info">
          <div class="attachment-name" style="color: #000000;">${url.name || 'File'}</div>
          <div class="attachment-size" style="color: #6B7280;">${url.size || 'N/A'}</div>
        </div>
        <a href="${url.url}" class="attachment-download-btn" title="Download" style="color: #000;" target="_blank"><i class="fa fa-download"></i></a>
      `;
      attachmentsContainer.appendChild(attachmentRow);
    });
  }

  // Links
  const linksElement = document.querySelector('.task-details-desc-body:last-child');
  if (linksElement && data.links && Array.isArray(data.links)) {
    linksElement.innerHTML = data.links.map(link => `<a href="${link.url}" target="_blank" style="color: #3b82f6;">${link.title || link.url}</a><br>`).join('');
  }
}

// Initialize announcement details on page load
document.addEventListener('DOMContentLoaded', async function() {
  if (window.location.pathname.includes('announcement_details.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      const data = await fetchAnnouncementDetails(id);
      populateAnnouncementDetails(data);
    } else {
      showToast("error", "Error", "No announcement ID provided", "");
    }
  }
});
async function getNotifications({
 
  seen = true,
  page = 1,
  limit = 4} = {}) { if (!(await IsLoggedIn())) return;
  try {
    const res = await axios.get(`${domain}/user/notifications`, {
      params: {
        seen,
        page,
        limit
      },
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      },
      withCredentials: true

    });

    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return getNotifications({
  seen ,
  page,
  limit });
    }
    if (error.response?.status === 403) {
      showToast("error", "Forbidden", "You don’t have permission to access Notifications.", "");
      return null;
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load Notifications", "");
  }
}
async function markNotificationAsSeen(id) {if (!(await IsLoggedIn())) return;
  try {
    const res = await axios.patch(`${domain}/user/notifications/${id}`, {}, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      }, withCredentials: true

    });

    return res.data; 
  } catch (error) {

    if (error.response?.status === 401) {
      await refreshToken();
      return markNotificationAsSeen(id); // retry
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to mark Notification as seen", "");
  }
}
