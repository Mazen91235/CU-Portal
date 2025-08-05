  
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
            document.querySelectorAll(".custom-toast").forEach(t => {
                t.classList.add("hidden", "tw-hidden");;
            });

            // Restart bar animation
            const bar = toast.querySelector(".toast-bar");
            toast.style.animation = "none";
toast.offsetHeight;
toast.style.animation = "fadeInto 0.5s ease forwards";


            // Show the toast
            toast.classList.remove("hidden", "tw-hidden");;
           toast.classList.add("block");
    toast.onclick = () => hideToast(type);// hide toast when click

            // Auto-hide after 2.5 seconds
           setTimeout(() => {
  toast.classList.add("fade-out");
  setTimeout(() => {
    toast.classList.add("tw-hidden");
    toast.classList.remove("fade-out");
  }, 500); 
}, 2500);
}
function hideToast(type) {
    const toast = document.getElementById(`toast-${type}`);
    if (!toast) return;

    toast.classList.add("fade-out");

    setTimeout(() => {
        toast.classList.add("tw-hidden", "hidden");
        toast.classList.remove("fade-out", "block");
    }, 100); 
}



//btn function

        toastReady.then(() => {
  const btn = document.getElementById("showToastBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      showToast("info");
    });
  }
});
