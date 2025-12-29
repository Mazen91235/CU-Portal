async function getDepartments(faculty_id="") {
  if(!(await IsLoggedIn())) {
    window.location.href = "/login.html?error=true&message=Invalid Login Session. Please log in to access this resource.";
  }

  try {
    const res = await axios.get(`${domain}/admin/departments?faculty_id=${faculty_id}`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      },    withCredentials: true

    });

    return res.data;
  } catch (error) {
    console.log(error);
    
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
    const res = await axios.get(`${domain}/admin/departments/${id}`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      },    withCredentials: true

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
  await IsLoggedIn();
  const formData = new FormData();
  formData.append("name", name);
  formData.append("faculty_id", faculty_id);
  formData.append("study_type", study_type);
  formData.append("code", code);

  try {
    const res = await axios.post(
      `${domain}/admin/departments`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

      }
    );
    showToast("success", "Success", "Department added successfully", "");
    return res.data;
    
  } catch (error) {
    showToast("error", "Error", error.response?.data?.message || "Failed to add department", "");
    return null;
  }
}
async function editDepartment(id, data) {
  await IsLoggedIn();
  const formData = new FormData();
 // Only append the keys that exist in data
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  try {
    const res = await axios.patch(
      `${domain}/admin/departments/${id}`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

      }
    );
                        showToast("success", "Success", "Department updated successfully", "");

    return res.data;
  } catch (error) {
    
    showToast("error", "Error", error.response?.data?.message || "Failed to edit department", "");
    return null;
  }
}
async function deleteDepartment(id) {
  try {
    const res = await axios.delete(
      `${domain}/admin/departments/${id}`,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true"
        },    withCredentials: true

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
