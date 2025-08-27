const domain = "https://766f0a3c6660.ngrok-free.app"; // Update with your actual domain


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


//get google Stored token 
//ask if there is 
let GetGoogleStoredToken = new Promise((resolve) => {
    let oauthState = GetCookie("oauth_state");
    if (!oauthState) {
        resolve(null);
        return;
    }
    axios.post(`${domain}/api/v1/auth/get-google-stored-token?state=${oauthState}`, {"google_details_token": GetCookie("google_details_token")}, {
        headers: {
            "ngrok-skip-browser-warning": "true",
            'Content-Type': 'application/json',
            "OAuth-State": oauthState,
        }
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
        resolve(error);
    });
});
let GetGoogleAccessToken = new Promise(async (resolve) => {
    if(!GetCookie("access_token")) {
        let response = await GetGoogleStoredToken;
        resolve(response);
        return;
    }
    axios.get(`${domain}/api/v1/auth/get-google-access-token`, {
        headers: {
            "ngrok-skip-browser-warning": "true",
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + GetCookie('access_token')
        }
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

async function UploadToDrive(file){
    if(!file) return false;
    if(!file.name || !file.type) {
        console.error('Invalid file object provided.');
        return false;
    }
    if(file.size > 10 * 1024 * 1024) { // 10 MB limit
        console.error('File size exceeds the limit of 10 MB.');
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
        console.error('No access token found. Please authorize Google first.');
        return false;
    }
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

// Authentication Functions
// Signup function to handle user registration
//
async function Signup(form) {
    event.preventDefault();
    const formData = new FormData(form);
    const fileInput = document.getElementById("file");
    const file = fileInput?.files[0];
    let googleDetailsToken = GetCookie("google_details_token");
    if (!googleDetailsToken) {
        window.location.href = `/login.html?error=true&message=You Must Authorize Google First before Proceeding to SignUp.`;
        return;
    }
    formData.append("google_details_token", googleDetailsToken);
    // Upload image if selected
    if (file) {
        if(file.size > 10 * 1024 * 1024) { // 10 MB limit
            showToast("error","File Size Error","File size exceeds the limit of 10 MB.","");
            return;
        }
        if (!file.type.startsWith("image/")) {
            showToast("error","Invalid File Type","Please upload a valid image file.","");
            return;
        }
        console.log("Uploading image:", file.name);
        let url = await UploadToDrive(file); // Replace 'file' with the actual file object you want to upload
        if (!url) {
            showToast("error","Image Upload Failed","Image upload failed. Please try again.","");
            return;
        }
        console.log("Image uploaded successfully:", url);
        formData.append("url", url);
        
    }
    formData.delete("file"); // Remove file input from formData to avoid sending it twice
    // Send signup request
    try {
        const response = await axios.post(`${domain}/api/v1/auth/signup`, formData, {
            headers: {
                "ngrok-skip-browser-warning": "true",
                "Content-Type": "multipart/form-data"
            }
        });

        const data = response.data;
        if (data.status == "success") {
            window.location.href = `/login.html?success=true&message=${data.message}`;
        } else {
            showToast("error","Signup Failed",data.message,"");
        }
    } catch (error) {
        console.error("Signup error:", error);
        showToast("error","Signup Failed",error.response?.data?.message || "Signup failed. Please try again","");
    }
}


async function GetUser() {
    if (!GetCookie("refresh_token")) return null;

    return axios.get(`${domain}/api/v1/user/get-user-data`, {
        headers: {
            "Authorization": `Bearer ${GetCookie("access_token")}`,
            "ngrok-skip-browser-warning": "true"
        }
    })
    .then(response => {
        const data = response.data;
        if (data.status == "success") {
            return data.data;
        } else {
            showToast("error","Error",data.message,"");

            return null;
        }
    })
    .catch(error => {
        console.error("Error retrieving user data:", error);
        if (error.response) {
            return axios.post(`${domain}/api/v1/auth/refresh`, {
                refresh_token: GetCookie("refresh_token")
            }, {
                headers: { "ngrok-skip-browser-warning": "true" }
            })
            .then(response => {
                let data = response.data;
                if (data.status == "success") {
                    data = data.data;
                    SetCookie("access_token", data.access_token, data.access_expires_in);
                    SetCookie("refresh_token", data.refresh_token, data.refresh_expires_in);
                    return GetUser();
                } else {
                     showToast("error","Error",data.message,"");

                    return null;
                }
            })
            .catch(error => {
                console.log( error);
                showToast("error","Session expired.",error.response?.data?.message || "Session expired. Please login again","");
                return null;
            });
        } else {
            showToast("error","Error",error.response?.data?.message || "Error retrieving user data","");
            return null;
        }
    });
}

function Logout() {
    SetCookie("access_token", "", -1);
    SetCookie("refresh_token", "", -1);
    SetCookie("google_details_token", "", -1);
    window.location.href = "/login";
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