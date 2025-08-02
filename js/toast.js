  
  const toastReady = new Promise((resolve, reject) => {
  document.addEventListener("DOMContentLoaded", () => {
    fetch("./components/toasts.html")
      .then(res => res.text())
      .then(html => {
        document.getElementById("toast-container").innerHTML = html;
        resolve();
      })
      .catch(err => {
        console.error("Failed to load toast component:", err);
        reject(err);
      });
  });
});
function showToast(type) {
            const toast = document.getElementById(`toast-${type}`);
            if (!toast) return;

            // Hide all other toasts first
            document.querySelectorAll(".toast").forEach(t => {
                t.classList.add("hidden");
            });

            // Restart bar animation
            const bar = toast.querySelector(".toast-bar");
            bar.style.animation = "none"; // reset
            bar.offsetHeight; // trigger reflow
            bar.style.animation = null;

            // Show the toast
            toast.classList.remove("hidden");

            // Auto-hide after 3 seconds
            setTimeout(() => {
                toast.classList.add("hidden");
            }, 2000);
        }
        toastReady.then(() => {
  const btn = document.getElementById("showToastBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      showToast("success");
    });
  }
});
