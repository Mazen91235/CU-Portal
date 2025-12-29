async function getCourseMaps({
  faculty_id = "",
  department_id = "",
  year_id = "",
  page = 1,
  limit = 1,
} = {}) {  if (!(await IsLoggedIn())) return;
  try {
    const res = await axios.get(`${domain}/admin/course-maps`, {
      params: {
        faculty_id,
        department_id,
        year_id,
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
      return getCourseMaps({ faculty_id, department_id, year_id, page, limit });
    }

    showToast("error", "Error", error.response?.data?.message || "Failed to load course maps", "");
    return null;
  }
}
async function getCourseMap(id) {
  try {
    const res = await axios.get(`${domain}/admin/course-maps/${id}`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      }, withCredentials: true

    });

    return res.data; 
  } catch (error) {

    if (error.response?.status === 401) {
      await refreshToken();
      return getCourseMap(id); // retry
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load course map", "");
    return null;
  }
}
async function addCourseMap(faculty_id, department_id, year_id, years, terms) {
  const formData = new FormData();
  formData.append("faculty_id", faculty_id);
  formData.append("department_id", department_id);
  formData.append("year_id", year_id);
  formData.append("years", years);
  formData.append("terms", terms);

  try {
    const res = await axios.post(
      `${domain}/admin/course-maps`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

      }
    );
    showToast("success", "Success", "Course map added successfully", "");

    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return addCourseMap(faculty_id, department_id, year_id, years, terms);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to add course map", "");
  }
}
async function editCourseMap(id, faculty_id, department_id, year_id, years, terms) {
  const formData = new FormData();
  formData.append("faculty_id", faculty_id);
  formData.append("department_id", department_id);
  formData.append("year_id", year_id);
  formData.append("years", years);
  formData.append("terms", terms);

  try {
    const res = await axios.patch(
      `${domain}/admin/course-maps/${id}`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

      }
    );
    showToast("success", "Success", "Course map edited successfully", "");
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return editCourseMap(id, faculty_id, department_id, year_id, years, terms);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to edit course map", "");
  }
}
async function deleteCourseMap(id) {
  try {
    const res = await axios.delete(
      `${domain}/admin/course-maps/${id}`,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true"
        },    withCredentials: true

      }
    );
    showToast("success", "Success", "Course map deleted successfully", "");
    return res.data;

  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return deleteCourseMap(id);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to delete course map", "");
  }
}
async function editCourseMap_year(id, year_index, year_name) {
  const formData = new FormData();
  formData.append("year_index", year_index);
  formData.append("year_name", year_name);
  
  
  try {
    const res = await axios.patch(
      `${domain}/admin/course-maps/${id}/years`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

      }
    );
    showToast("success", "Success", "Course map year edited successfully", "");
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return editCourseMap_year(id, year_index, year_name);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to edit course map year", "");
  }
}
async function addCourseMap_course(id, subject_id, year_index, term, rank) {
  await IsLoggedIn();
  const formData = new FormData();
  formData.append("subject_id", subject_id);
  formData.append("year_index", year_index);
  formData.append("term", term);
  formData.append("rank", rank);

  try {
    const res = await axios.post(
      `${domain}/admin/course-maps/${id}/courses`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

      }
    );
    showToast("success", "Success", "Course added successfully", "");

    return res.data;
  } catch (error) {
   
    showToast("error", "Error", error.response?.data?.message || "Failed to add course", "");
    return null;
  }
}
async function editCourseMap_course(id, course_id, year_index, term, rank) {
  await IsLoggedIn();
  const formData = new FormData();
  formData.append("year_index", year_index);
  formData.append("term", term);
  formData.append("rank", rank);

  try {
    const res = await axios.patch(
      `${domain}/admin/course-maps/${id}/courses/${course_id}`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

      }
    );
    showToast("success", "Success", "Course edited successfully", "");
    return res.data;
  } catch (error) {
    
    showToast("error", "Error", error.response?.data?.message || "Failed to edit course", "");
    return null;
  }
}

 async function deleteCourseMap_course(id, course_id) {
  try {
    const res = await axios.delete(
      `${domain}/admin/course-maps/${id}/courses/${course_id}`,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true"
        },    withCredentials: true

      }
    );
    showToast("success", "Success", "Course map course deleted successfully", "");
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return deleteCourseMap_course(id, course_id);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to delete course map course", "");
  }
}
