//user
async function updateUserAcademic(data) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    
  });

  try {
    const res = await axios.patch(
      `${domain}/user/update-user-academic-data`,
      formData,
      {
        headers: {
          "Authorization": `Bearer ${GetCookie("access_token")}`,
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "multipart/form-data"
        }, withCredentials: true

      }
    );
    showToast("success", "Updated", "Your academic information has been updated successfully", "");
    return res.data;
  } catch (error) {
    showToast("error", "Error", error.response?.data?.message || "Failed to update your academic information", "");
  }
}


// Verify Email Functions
async function fetchUserEmail() {
  try {
    showLoading();
    const response = await axios.get(`${domain}/auth/get-verification-details`, {
      headers: {
        "ngrok-skip-browser-warning": "true",
        "Authorization": `Bearer ${GetCookie("access_token")}`
      }, withCredentials: true
    });
    hideLoading();
    if(Math.floor(response.status / 100) != 2){
      SetCookie("error", response.data?.message || "Failed to fetch your email");
      window.location.href = "/login.html";
      return;
    }
    const data = response.data?.data ?? response.data ?? {};
    userDetails.name = data.name || "";
    userDetails.email = data.email || "";
    userDetails.canResendAfter = data.can_resend_after ?? 0;
    renderUserDetails();
    return;
  } catch (error) {
    hideLoading();
    SetCookie("error", error.response?.data?.message || "Failed to fetch your email");
    window.location.href = "/login.html";
    return;
  }
}
function startResendCounter() {
  if(userDetails.canResendAfter < 1) return;
  const resendLink = document.getElementById('resend-code');
  resendLink.classList.add('disabled');
  resendLink.textContent = `Resend Code (${userDetails.canResendAfter}s)`; 
  const interval = setInterval(() => {
    userDetails.canResendAfter -= 1;
    resendLink.textContent = `Resend Code (${userDetails.canResendAfter}s)`;
    if (userDetails.canResendAfter < 1) {
      clearInterval(interval);
      resendLink.classList.remove('disabled');
      resendLink.textContent = `Resend Code`;
    }
  }, 1000);
}
function renderUserDetails(){
  document.getElementById('email_container').textContent = userDetails.email;
  startResendCounter();
}
if(document.querySelector('.vertify-btn')){
  document.querySelector('.vertify-btn').addEventListener('click', async () => {
    const inputs = document.querySelectorAll('.inp1');
    let code = '';
    inputs.forEach(input => {
      code += input.value;
    });
    if(code.length < inputs.length){
      showToast("error", "Error", "Please enter the complete verification code", "");
      return;
    }
    try {
      showLoading();
      const response = await axios.post(`${domain}/auth/verify-email`, { code: code }, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${GetCookie("access_token")}`
        }, withCredentials: true
      });
      hideLoading();
      if(Math.floor(response.status / 100) != 2){
        showToast("error", "Error", response.data?.message || "Failed to verify your email", "");
        return;
      }
      const data = response.data?.data ?? response.data ?? {};
      SetCookie("access_token", data.access_token || "", data.access_expires_in || 30*60);
      SetCookie("refresh_token", data.refresh_token || "", data.refresh_expires_in || 30*24*60*60);
      window.location.href = "/user/index.html";
      return;
    } catch (error) {
      hideLoading();
      showToast("error", "Error", error.response?.data?.message || "Failed to verify your email", "");
    }
  });
}
if(document.getElementById('resend-code')){
  document.getElementById('resend-code').addEventListener('click', async (e) => {
    e.preventDefault();
    if(userDetails.canResendAfter > 0){
      showToast("error", "Error", `You can resend the code after ${userDetails.canResendAfter} seconds`, "");
      return;
    }
    try {
      showLoading();
      const response = await axios.post(`${domain}/auth/resend-verification-code`, {}, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Authorization": `Bearer ${GetCookie("access_token")}`
        }, withCredentials: true
      });
      hideLoading();
      if(Math.floor(response.status / 100) != 2){
        showToast("error", "Error", response.data?.message || "Failed to resend verification code", "");
        return;
      }
      showToast("success", "Success", "Verification code resent successfully", "");
      const data = response.data?.data ?? response.data ?? {};
      userDetails.canResendAfter = data.can_resend_after ?? 60;
      startResendCounter();
      return;
    } catch (error) {
      hideLoading();
      showToast("error", "Error", error.response?.data?.message || "Failed to resend verification code", "");
    }
  });
}