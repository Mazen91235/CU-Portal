async function getExams({
  title = "",
  faculty_id = "",
  department_id = "",
  year_id = "",
  subject_id = "",
  author_id = "",
  start_date = "",
    end_date = "",
  page = 1,
  limit = 10} = {}) { if (!(await IsLoggedIn())) return;
    showLoading()
  try {
    const res = await axios.get(`${domain}/admin/exams`, {
      params: {
        title,
        faculty_id,
        department_id,
        year_id,
        subject_id,
        author_id,
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
    hideLoading()
    return res.data;
  } catch (error) {
    hideLoading()
    if (error.response?.status === 401) {
      await refreshToken();
      return getExams({title, faculty_id, department_id, year_id, subject_id,author_id,start_date,end_date,page, limit });
    }
    if (error.response?.status === 403) {
      showToast("error", "Forbidden", "You don’t have permission to access exams.", "");
      return null;
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load exams", "");
  }
}
async function getExam(id) {if (!(await IsLoggedIn())) return;
  try {
    const res = await axios.get(`${domain}/admin/exams/${id}`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      }, withCredentials: true

    });

    return res.data; 
  } catch (error) {

    if (error.response?.status === 401) {
      await refreshToken();
      return getExam(id);
    }
    if (error.response?.status === 403) {
      showToast("error", "Forbidden", "You don’t have permission to access this exam.", "");
      return null;
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load exam", "");
    return null;
  }
}
async function addExam(title,description,due_date,subject_id,instructions, start_time,location,duration,exam_type,exam_format,exam_weight) { if (!(await IsLoggedIn())) return;
    const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
    formData.append("due_date", due_date);
    formData.append("subject_id", subject_id);
        formData.append("instructions", instructions);
        formData.append("start_time", start_time);
        formData.append("location", location);
        formData.append("duration", duration);
        formData.append("exam_type", exam_type);
        formData.append("exam_format", exam_format);
        formData.append("exam_weight", exam_weight);

  try {
    const res = await axios.post(
      `${domain}/admin/exams`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true
      }
    );
    showToast("success", "Success", "Exam added successfully", "");
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return addExam(title,description,due_date,subject_id,instructions, start_time,location,duration,exam_type,exam_format,exam_weight) ;
    }       showToast("error", "Error", error.response?.data?.message || "Failed to add exam", "");
    }}
async function editExam(id,title,description,due_date,subject_id,instructions, start_time,location,duration,exam_type,exam_format,exam_weight) { if (!(await IsLoggedIn())) return;

    const formData = new FormData();
  formData.append("title", title);
  formData.append("description", description);
    formData.append("due_date", due_date);
    formData.append("subject_id", subject_id);
        formData.append("instructions", instructions);
        formData.append("start_time", start_time);
        formData.append("location", location);
        formData.append("duration", duration);
        formData.append("exam_type", exam_type);
        formData.append("exam_format", exam_format);
        formData.append("exam_weight", exam_weight);

   try {
    const res = await axios.patch(
      `${domain}/admin/exams/${id}`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

      }
    );   showToast("success", "Success", "exam edited successfully", "");
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return editExam(id,title,description,due_date,subject_id,instructions, start_time,location,duration,exam_type,exam_format,exam_weight) ;
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to edit exam", "");
  }
}
async function deleteExam(id) { if (!(await IsLoggedIn())) return;
  try {
    const res = await axios.delete(
      `${domain}/admin/exams/${id}`,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true"
        }, withCredentials: true

      }
    );
    showToast("success", "Success", "Exam deleted successfully", "");
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return deleteExam(id);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to delete exam", "");
  }
}
