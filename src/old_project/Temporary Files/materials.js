async function getMaterials({
  name = "",
  faculty_id = "",
  department_id = "",
  year_id = "",
  parent_id = "",
  subject_id = "",
  author_id = ""
} = {}) {
  try {
    const res = await axios.get(`${domain}admin/materials?name&faculty_id&department_id&year_id&parent_id&subject_id&author_id`, {
      params: {
        name,
        faculty_id,
        department_id,
        year_id,
        parent_id,
        subject_id,
        author_id
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
      return getMaterials({ name, faculty_id, department_id, year_id, parent_id, subject_id, author_id });
    }

    showToast("error", "Error", error.response?.data?.message || "Failed to load materials", "");
    return null;
  }
}
async function getMaterial(id) {
  try {
    const res = await axios.get(`${domain}/admin/materials/${id}`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      }, withCredentials: true

    });

    return res.data; 
  } catch (error) {

    if (error.response?.status === 401) {
      await refreshToken();
      return getMaterial(id); // retry
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load material", "");
    return null;
  }
}
async function addMaterial(name, description, url, type, parent_id, subject_id) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  formData.append("url", url);
  formData.append("type", type);
  formData.append("parent_id", parent_id);
  formData.append("subject_id", subject_id);

  try {
    const res = await axios.post(
      `${domain}/admin/materials`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

      }
    );
    showToast("success", "Success", "Material added successfully", "");

    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return addMaterial(name, description, url, type, parent_id, subject_id);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to add material", "");
  }
}
async function editMaterial(id, name, description, url) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  formData.append("url", url);
  
  try {
    const res = await axios.patch(
      `${domain}/admin/materials/${id}`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

      }
    );
    showToast("success", "Success", "Material edited successfully", "");
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return editMaterial(id, name, description, url);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to edit material", "");
  }
}
async function deleteMaterial(id) {
  try {
    const res = await axios.delete(
      `${domain}/admin/materials/${id}`,
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
      return deleteMaterial(id);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to delete material", "");
  }
}