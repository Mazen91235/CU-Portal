async function addRole(name) {
    if(!(await IsLoggedIn())) {
    window.location.href = "/login.html?error=true&message=Invalid Login Session. Please log in to access this resource.";
  }

  try {
    const res = await axios.post(
      `${domain}/admin/roles`,
      { name }, 
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json"
        },
        withCredentials: true

      }
    );
    showToast("success", "Success", "Role added successfully", "");
    return res.data ;
  } catch (error) {
    if (error.response?.status === 401) {
      await refreshToken();
      return addRole(name); // retry
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to add role", "");
    return null;
  }
}


async function getRoles(name = "") {
  if(!(await IsLoggedIn())) {
    window.location.href = "/login.html?error=true&message=Invalid Login Session. Please log in to access this resource.";
}
  try {
    const res = await axios.get(`${domain}/admin/roles`, { params: { name },
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      },
      withCredentials: true
    });

    return res.data;
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        await refreshToken();
        return getRoles(name); // retry
      } catch {
        showToast("error", "Session expired", "Please login again", "");
        return null;
      }
    }
    if (error.response?.status === 403) {
      showToast("error", "Forbidden", "You don’t have permission to access roles.", "");
      return null;
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to load roles", "");
    return null;
  }
}

async function editRole(roleId, name, permissions = []) {
  if (!(await IsLoggedIn())) {
    window.location.href = "/login.html?error=true&message=Invalid Login Session. Please log in to access this resource.";
    return;
  }

  try {
    const res = await axios.patch(
      `${domain}/admin/roles/${roleId}`,
      { name, permissions },  
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json"
        },
        withCredentials: true

      }
    );

    showToast("success", "Success", "Role updated successfully", "");
    return res.data;
  } catch (error) {
    console.error("Edit role error:", error);
    if (error.response?.status === 401) {
      await refreshToken();
      return editRole(roleId, name, permissions); // retry
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to edit role", "");
    return null;
  }
}
async function getRole(roleId) {
  if (!(await IsLoggedIn())) {
    window.location.href = "/login.html?error=true&message=Invalid Login Session. Please log in to access this resource.";
    return;
  }

  try {
    const res = await axios.get(
      `${domain}/admin/roles/${roleId}`,
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
      return getRole(roleId); // retry
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to fetch role details", "");
    return null;
  }
}
async function deleteRole(roleId) {
  if (!(await IsLoggedIn())) {
    window.location.href = "/login.html?error=true&message=Invalid Login Session. Please log in to access this resource.";
    return;
  }

  try {
    const res = await axios.delete(
      `${domain}/admin/roles/${roleId}`,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true"
        },    withCredentials: true

      }
    );

    showToast("success", "Deleted", "Role deleted successfully", "");
    return res.data;
  } catch (error) {
    console.error("Delete role error:", error);
    if (error.response?.status === 401) {
      await refreshToken();
      return deleteRole(roleId); // retry
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to delete role", "");
    return null;
  }
}
async function getRolesCountPermissions() {
  if (!(await IsLoggedIn())) {
    window.location.href = "/login.html?error=true&message=Invalid Login Session. Please log in to access this resource.";
    return;
  }

  try {
    const res = await axios.get(
      `${domain}/admin/roles/count-permissions`,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true"
        }, withCredentials: true

      }
    );

    return res.data.data;
  } catch (error) {
    console.error("Roles count permissions error:", error);
    if (error.response?.status === 401) {
      await refreshToken();
      return getRolesCountPermissions(); // retry
    }
    showToast("error", "Error", error.response?.data?.message || "Failed to fetch role permissions count", "");
    return null;
  }
}