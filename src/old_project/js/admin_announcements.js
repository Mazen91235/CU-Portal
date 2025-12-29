async function getAnnouncements({
  query = "",
  faculty_id = "",
  department_id = "",
  year_id = "",
  subject_id = "",
  author_id = "",
  page = 1,
  limit = 100} = {}) { if (!(await IsLoggedIn())) return;
  try {
    const res = await axios.get(`${domain}/admin/announcements`, {
      params: {
        query,
        faculty_id,
        department_id,
        year_id,
        subject_id,
        author_id,
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
      return getAnnouncements({query, faculty_id, department_id, year_id, subject_id,author_id,page, limit });
    }
    if (error.response?.status === 403) {
      showToast("error", "Forbidden", "You don’t have permission to access Announcements.", "");
      return null;
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load Announcements", "");
  }
}
async function getAnnouncement(id) {if (!(await IsLoggedIn())) return;
  try {
    const res = await axios.get(`${domain}/admin/announcements/${id}`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      }, withCredentials: true

    });

    return res.data; 
  } catch (error) {

    if (error.response?.status === 401) {
      await refreshToken();
      return getAnnouncement(id); // retry
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load Announcement", "");
    return null;
  }
}
async function addAnnouncement(title,content,subject_id,urls, links) {if (!(await IsLoggedIn())) return;
  const formData = new FormData();
    formData.append("title", title);
  
    formData.append("subject_id", subject_id);
      formData.append("urls", urls);  

        formData.append("links", links);    
          formData.append("content", content);

  try {
    const res = await axios.post(
      `${domain}/admin/announcements`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

      }
    );
    showToast("success", "Success", "Announcement added successfully", "");

    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return addAnnouncement(title,content,subject_id,urls, links);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to add Announcement", "");
  }
}
async function editAnnouncement(id,title,content,subject_id,urls, links) { if (!(await IsLoggedIn())) return;
  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);
    formData.append("subject_id", subject_id);
     formData.append("urls", urls);
        formData.append("links", links);

   try {
    const res = await axios.patch(
      `${domain}/admin/announcements/${id}`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

      }
    );
    showToast("success", "Success", "Announcement edited successfully", "");
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return editAnnouncement(id,title,content,subject_id,urls, links);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to edit Announcement", "");
  }
}
async function deleteAnnouncement(id) {if (!(await IsLoggedIn())) return;
  try {
    const res = await axios.delete(
      `${domain}/admin/announcements/${id}`,
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
      return deleteAnnouncement(id);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to delete Announcement  ", "");
  }
}
