async function getFaculties(name = "") {
  try {
    const res = await axios.get(`${domain}/admin/faculties`, { params: { name },
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      },    withCredentials: true

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
  if (!id) {
    showToast("error", "Invalid Faculty ID", "No faculty id provided");
    return null;
  }
  try {
    const res = await axios.get(`${domain}/admin/faculties/${id}`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      },    withCredentials: true

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
      `${domain}/admin/faculties`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

      }
    );
        showToast("success", "Success", "Faculty added successfully", "");

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
      `${domain}/admin/faculties/${id}`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

      }
    );
    showToast("success", "Success", "Faculty edited successfully", "");
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
      `${domain}/admin/faculties/${id}`,
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
      return deleteFaculty(id);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to delete faculty", "");
  }
}