const domain = "https://f5e23c67fc47.ngrok-free.app"; // Update with your actual domain


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
                console.log("a2");
                console.log(response);
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
    showLoading();
    event.preventDefault();
    const formData = new FormData(form);
    const fileInput = document.getElementById("file");
    const file = fileInput?.files[0];
    let googleDetailsToken = GetCookie("google_details_token");
    if (!googleDetailsToken) {
        console.log("a1");
        window.location.href = `/login.html?error=true&message=You Must Authorize Google First before Proceeding to SignUp.`;
        return;
    }
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
        if (!url) {
            hideLoading();
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
            hideLoading();
            window.location.href = `/login.html?success=true&message=${data.message}`;
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
            window.location.href = `/login.html?success=true&message=Successfully logged out`;

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
  return axios.post(`${domain}/api/v1/auth/refresh`, {
    refresh_token: GetCookie("refresh_token")
  }, {
    headers: { "ngrok-skip-browser-warning": "true" }
  })
  .then(response => {
    const data = response.data.data;
    SetCookie("access_token", data.access_token, data.access_expires_in);
    SetCookie("refresh_token", data.refresh_token, data.refresh_expires_in);
  })
  .catch(err => {
    showToast("error", "Session expired", "Please login again", "");
    throw err;
  });
}
// years
async function getYears() {
  try {
    const res = await axios.get(`${domain}/api/v1/admin/years`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      }
    });

    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        await refreshToken();
        return getYears(year); // retry
      } catch {
        showToast("error", "Session expired", "Please login again", "");
        return null;
      }
    }
    if (error.response?.status === 403) {
      showToast("error", "Forbidden", "You don’t have permission to access years.", "");
      return null;
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load years", "");
    return null;
  }
}

async function getYear(id) {
  try {
    const res = await axios.get(`${domain}/api/v1/admin/years/${id}`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      }
    });
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return getYear(id);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to retrieve year", "");
  }
}


async function addYear(year) {
  const formData = new FormData();
  formData.append("year", year);

  try {
    const res = await axios.post(
      `${domain}/api/v1/admin/years`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return addYear(year);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to add year", "");
  }
}
async function editYear(id, year) {
  const formData = new FormData();
  formData.append("year", year);

  try {
    const res = await axios.patch(
      `${domain}/api/v1/admin/years/${id}`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return editYear(id, year);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to edit year", "");
  }
}
async function deleteYear(id) {
  try {
    const res = await axios.delete(
      `${domain}/api/v1/admin/years/${id}`,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true"
        }
      }
    );
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return deleteYear(id);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to delete year", "");
  }
}
// Department

async function getDepartments() {
  try {
    const res = await axios.get(`${domain}/api/v1/admin/departments?name&faculty_id&study_type`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      }
    });

    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        await refreshToken();
        return getDepartments(); // retry
      } catch {
        showToast("error", "Session expired", "Please login again", "");
        return null;
      }
    }
    if (error.response?.status === 403) {
      showToast("error", "Forbidden", "You don’t have permission to access departments.", "");
      return null;
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load departments", "");
    return null;
  }
}

async function getDepartment(id) {
  try {
    const res = await axios.get(`${domain}/api/v1/admin/departments/${id}`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      }
    });
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return getDepartment(id);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to retrieve department", "");
  }
}


async function addDepartment(name, faculty_id, study_type, code) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("faculty_id", faculty_id);
  formData.append("study_type", study_type);
  formData.append("code", code);

  try {
    const res = await axios.post(
      `${domain}/api/v1/admin/departments`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return addDepartment(name, faculty_id, study_type, code);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to add department", "");
  }
}
async function editDepartment(id, name, faculty_id, study_type, code) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("faculty_id", faculty_id);
  formData.append("study_type", study_type);
  formData.append("code", code);

  try {
    const res = await axios.patch(
      `${domain}/api/v1/admin/departments/${id}`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return editDepartment(id, name, faculty_id, study_type, code);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to edit department", "");
  }
}
async function deleteDepartment(id) {
  try {
    const res = await axios.delete(
      `${domain}/api/v1/admin/departments/${id}`,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true"
        }
      }
    );
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return deleteDepartment(id);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to delete department", "");
  }
}

// Faculty

async function getFaculties(name = "") {
  try {
    const res = await axios.get(`${domain}/api/v1/admin/faculties`, { params: { name },
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      }
    });

    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        await refreshToken();
        return getFaculties(name); // retry
      } catch {
        showToast("error", "Session expired", "Please login again", "");
        return null;
      }
    }
    if (error.response?.status === 403) {
      showToast("error", "Forbidden", "You don’t have permission to access faculties.", "");
      return null;
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load faculties", "");
    return null;
  }
}

async function getFaculty(id) {
  try {
    const res = await axios.get(`${domain}/api/v1/admin/faculties/${id}`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      }
    });
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return getFaculty(id);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to retrieve faculty", "");
  }
}


async function addFaculty(name) {
  const formData = new FormData();
  formData.append("name", name);

  try {
    const res = await axios.post(
      `${domain}/api/v1/admin/faculties`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return addFaculty(name);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to add faculty", "");
  }
}
async function editFaculty(id, name) {
  const formData = new FormData();
  formData.append("name", name);

  try {
    const res = await axios.patch(
      `${domain}/api/v1/admin/faculties/${id}`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return editFaculty(id, name);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to edit faculty", "");
  }
}
async function deleteFaculty(id) {
  try {
    const res = await axios.delete(
      `${domain}/api/v1/admin/faculties/${id}`,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true"
        }
      }
    );
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return deleteFaculty(id);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to delete faculty", "");
  }
}
//user
async function getUsersData() {
  try {
    const res = await axios.get(`${domain}/api/v1/admin/get-users-data`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      }
    });
    return res.data; 
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        await refreshToken();
        return getUsersData(); // retry
      } catch {
        showToast("error", "Session expired", "Please login again", "");
        return null;
      }
    }
    if (error.response?.status === 403) {
      showToast("error", "Forbidden", "You don’t have permission to access users data.", "");
      return null;
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load users data", "");
    return null;
  }
}
async function getUsers({
  search_query = "",
  faculty_id = "",
  department_id = "",
  year_id = "",
  is_active = "",
  page = 1,
  limit = 10
} = {}) {
  try {
    const res = await axios.get(`${domain}/api/v1/admin/users`, {
      params: {
        search_query,
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
      }
    });

    return res.data;  
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return getUsers({ search_query, faculty_id, department_id, year_id, is_active, page, limit });
    }
    if (error.response?.status === 403) {
      showToast("error", "Forbidden", "You don’t have permission to access users.", "");
      return null;
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load users", "");
    return null;
  }
}
async function getUser(id) {
  try {
    const res = await axios.get(`${domain}/api/v1/admin/users/${id}`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      }
    });

    return res.data; 
  } catch (error) {
      console.error("Error in getUser:", error);

    if (error.response?.status === 401) {
      await refreshToken();
      return getUser(id); // retry
    }
    if (error.response?.status === 403) {
      showToast("error", "Forbidden", "You don’t have permission to access this user.", "");
      return null;
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load user", "");
    return null;
  }
}
async function updateUsers(dataToUpdate) {
  try {
    const res = await axios.patch(`${domain}/api/v1/admin/users/update`, {
      data_to_update: dataToUpdate
    }, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true",
        "Content-Type": "application/json"
      }
    });

    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return updateUsers(dataToUpdate); 
    }
    if (error.response?.status === 403) {
      showToast("error", "Forbidden", "You don’t have permission to update users.", "");
      return null;
    }
    console.error("Error in updateUsers:", error.response?.data || error.message);
    showToast("error", "Error", error.response?.data?.message || "Failed to update users", "");
    return null;
  }
}



