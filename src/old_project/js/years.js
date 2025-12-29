async function getYears() {
  if(!(await IsLoggedIn())) {
    window.location.href = "/login.html?error=true&message=Invalid Login Session. Please log in to access this resource.";
  }
  try {
    const res = await axios.get(`${domain}/admin/years`, {
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
        return getYears(); // retry
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
    const res = await axios.get(`${domain}/admin/years/${id}`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      },    withCredentials: true

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
      `${domain}/admin/years`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

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
      `${domain}/admin/years/${id}`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        },    withCredentials: true

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
      `${domain}/admin/years/${id}`,
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
      return deleteYear(id);
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to delete year", "");
  }
}


