const domain = "https://bfd42b02449c.ngrok-free.app"; // Update with your actual domain


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


//get google Stored token 
//ask if there is 
let GetStoredAccessToken = new Promise((resolve) => {
    axios.get(`${domain}/api/v1/auth/get-google-access-token`, {
        headers: {
            "ngrok-skip-browser-warning": "true",
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + GetCookie('user_token')
        }
    })
    .then((response) => {
        let data = response.data;
        if(data && data.data && data.data.access_token) {
            let accessToken = data.data.access_token;
            let expirein = data.data.expire_at;
            let refresh_token = data.data.refresh_token;
            let refresh_expire_in = data.data.refresh_expire_at;
            SetCookie("access_token", accessToken, expirein);
            SetCookie("refresh_token", refresh_token, refresh_expire_in);
            resolve(data.data.access_token);
        } else {
            resolve(null);
        }
    })
    .catch((error) => {
        resolve(null);
    });
});
let GetGoogleStoredToken = new Promise((resolve) => {
    axios.get(`${domain}/api/v1/auth/get-stored-user`, {
        headers: {
            "ngrok-skip-browser-warning": "true",
            'Content-Type': 'application/json',
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

function UploadToDrive(file){
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
    return GetGoogleStoredToken.then((access_token) => {
        if(!access_token) return false;
        return axios.post('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', formData, {
            headers: {
                'Content-Type': 'multipart/related ',
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then((response) => {
            // console.log('File uploaded successfully:', response.data);
            let fileId = response.data.id;
            // Make the file public
            return axios.patch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
                'role': 'reader',
                'type': 'anyone'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${access_token}`
                }
            })
            .then(() => {
                // console.log('File made public:', url);
                let url = `https://drive.google.com/uc?export=view&id=${fileId}`;
                return url; // Return URL to indicate success
                // Optionally, you can return the URL or do something with it
            })
            .catch((error) => {
                console.error('Error making file public:', error);
                return false;
            });
        })
        .catch((error) => {
            console.error('Error uploading file:', error);
            return false;
        });
    });
}


// Authentication Functions
// Signup function to handle user registration
//
async function Signup(form) {
    event.preventDefault();
    const formData = new FormData(form);
    const fileInput = document.getElementById("file");
    const file = fileInput?.files[0];

    // Upload image if selected
    if (file) {
        UploadToDrive(file) // Replace 'file' with the actual file object you want to upload
            .then((url) => {
                if (url) {
                    formData.append("url", url);
                } else {
                    ShowError("Image upload failed. Please try again.");
                    return;
                }
            })
        
    }
    
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
            window.location.href = `${domain}/login.html?success=true&message=${data.message}`;
        } else {
            ShowError(data.message);
        }
    } catch (error) {
        ShowError(error.response?.data?.message || "Signup failed. Please try again");
    }
}


function GetUser() {
    if (!GetCookie("access_token") || !GetCookie("refresh_token")) return null;

    return axios.get(`${domain}/api/v1/user/get-user-data`, {
        headers: {
            "Authorization": `Bearer ${GetCookie("access_token")}`,
            "ngrok-skip-browser-warning": "true"
        }
    })
    .then(response => {
        const data = response.data;
        if (data.status === "success") {
            return data.data;
        } else {
            ShowError(data.message);
            return null;
        }
    })
    .catch(error => {
        if (error.response && error.response.status === 407) {
            return axios.post(`${domain}/api/v1/auth/refresh`, {
                refresh_token: GetCookie("refresh_token")
            }, {
                headers: { "ngrok-skip-browser-warning": "true" }
            })
            .then(response => {
                const data = response.data;
                if (data.status === "success") {
                    SetCookie("access_token", JSON.stringify(data.access_token), data.expire_at);
                    return GetUser();
                } else {
                    ShowError(data.message);
                    return null;
                }
            })
            .catch(error => {
                ShowError(error.response?.data?.message || "Session expired. Please login again");
                return null;
            });
        } else {
            ShowError(error.response?.data?.message || "Error retrieving user data");
            return null;
        }
    });
}


function HandleGoogleLoginCallback() {
    if (GetParams("google_linked") === "true") {
        // First check if we already have a valid session
        GetUser().then(user => {
            if (user) {
                // User already has a valid session
                window.location.href = `${domain}/dashboard`;
            } else {
                // No valid session, proceed with Google auth callback
                axios.get(`${domain}/api/v1/auth/google-oauth-callback`, {
                    headers: { "ngrok-skip-browser-warning": "true" }
                })
                .then(response => {
                    const data = response.data;
                    if (data.status === "success") {
                        SetCookie("access_token", JSON.stringify(data.access_token), data.expire_at);
                        SetCookie("refresh_token", JSON.stringify(data.refresh_token), data.refresh_expire_at);
                        
                        // Check if user needs to complete profile or go to dashboard
                        if (data.profile_complete) {
                            window.location.href = `${domain}/dashboard`;
                        } else {
                            window.location.href = `${domain}/create-profile`;
                        }
                    } else {
                        ShowError(data.message || "Google authorization failed");
                    }
                })
                .catch(error => {
                    ShowError(error.response?.data?.message || "Error linking Google account");
                });
            }
        });
    }

    if (GetParams("google_linked") === "false" && GetParams("error")) {
        ShowError(GetParams("error"));
    }
}


function Logout() {
    SetCookie("access_token", "", -1);
    SetCookie("refresh_token", "", -1);
    window.location.href = "/";
}
