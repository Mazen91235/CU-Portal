async function getTasks({
  title = "",
  faculty_id = "",
  department_id = "",
  year_id = "",
  subject_id = "",
  start_date = "",
  end_date = "",
  page = 1,
  limit = 100} = {}) { if (!(await IsLoggedIn())) return;
  try {
    const res = await axios.get(`${domain}/admin/tasks`, {
      params: {
        title,
        faculty_id,
        department_id,
        year_id,
        subject_id,
        start_date,
        end_date,
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
      return getTasks({title, faculty_id, department_id, year_id, subject_id,author_id,start_date,end_date,page, limit });
    }
    if (error.response?.status === 403) {
      showToast("error", "Forbidden", "You don’t have permission to access tasks.", "");
      return null;
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load tasks", "");
  }
}
async function getTask(id) {if (!(await IsLoggedIn())) return;
  try {
    const res = await axios.get(`${domain}/admin/tasks/${id}`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      }, withCredentials: true

    });

    return res.data; 
  } catch (error) {

    if (error.response?.status === 401) {
      await refreshToken();
      return getTask(id); // retry
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load task", "");
    return null;
  }
}
async function addTask(title,description,deadline,subject_id,urls, links,submission_url) {if (!(await IsLoggedIn())) return;
  const formData = new FormData();
    formData.append("title", title);
  formData.append("description", description);
    formData.append("deadline", deadline);
    formData.append("subject_id", subject_id);
      formData.append("urls", urls);  

        formData.append("links", links);    
 formData.append("submission_url", submission_url);


  try {
    const res = await axios.post(
      `${domain}/admin/tasks`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

      }
    );
    showToast("success", "Success", "task added successfully", "");

    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return addTask(title,description,deadline,subject_id,urls, links,submission_url);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to add task", "");
  }
}
async function editTask(id,title,description,deadline,subject_id,urls, links,submission_url) { if (!(await IsLoggedIn())) return;
  const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
    formData.append("deadline", deadline);
    formData.append("subject_id", subject_id);
     formData.append("urls", urls);
        formData.append("links", links);
        formData.append("submission_url", submission_url);

   try {
    const res = await axios.patch(
      `${domain}/admin/tasks/${id}`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

      }
    );
    showToast("success", "Success", "task edited successfully", "");
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return editTask(id,title,description,deadline,subject_id,urls, links,submission_url);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to edit task", "");
  }
}
async function deleteTask(id) {if (!(await IsLoggedIn())) return;
  try {
    const res = await axios.delete(
      `${domain}/admin/tasks/${id}`,
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
      return deleteTask(id);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to delete task  ", "");
  }
}
