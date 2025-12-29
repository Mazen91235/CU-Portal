async function getCourses({
  query = "",
  faculty_id = "",
  department_id = "",
  year_id = "",
  page = 1,
  limit = 10
} = {}) {
  try {
    const res = await axios.get(`${domain}/admin/courses`, {
      params: {
        query,
        faculty_id,
        department_id,
        year_id,
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
      return getCourses({query, faculty_id, department_id, year_id, page, limit});
    }
    if (error.response?.status === 403) {
      showToast("error", "Forbidden", "You don’t have permission to access courses.", "");
      return null;
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load courses", "");
  }
}
async function getCourse(id) {
  const courseId = parseInt(id);
  try {
    const res = await axios.get(`${domain}/admin/courses/${courseId}`, {
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
      return getCourse(id); // retry
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load course", "");
    return null;
  }
}
async function addCourse(courseData) {
  try {
    const res = await axios.post(
      `${domain}/admin/courses`,
      courseData, // Send data as formData
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
        },    
        withCredentials: true
      }
    );
    
    showToast("success", "Success", "Course added successfully", "");
    return res.data;
  } catch (error) {
    console.log('not created', error);
    // Handle specific error cases
    if (error.response?.status === 401) {
      await refreshToken();
      return addCourse(courseData); // Retry with same data object
    }

    if (error.response?.status === 422) {
      showToast("error", "Validation Error", error.response.data.message || "Invalid course data", "");
      return null;
    }

    showToast("error", "Error", error.response?.data?.message || "Failed to add course", "");
    return null;
  }
}
async function editCourse(courseData, id) { 
  try {
    const res = await axios.patch(
      `${domain}/admin/courses/${id}`,
      courseData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    
        withCredentials: true
      }
    );
    showToast("success", "Success", "Course edited successfully", "");
    return res.data;
  } catch (error) {
    console.log(error);
    if (error.response?.status === 401) {
      await refreshToken();
      return editCourse(courseData);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to edit course", "");
  }
}
async function deleteCourse(id) {
  const courseId = parseInt(id);
  try {
    const res = await axios.delete(
      `${domain}/admin/courses/${courseId}`,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true"
        },    
        withCredentials: true
      }
    );
    console.log('course is deleted');
    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return deleteCourse(id);
    }
    console.log(error);
    showToast("error", "Error", error.response?.data?.message || "Failed to delete course  ", "");
  }
}