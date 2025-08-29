   let toastDuration = 6000; // Default duration in milliseconds
        document.addEventListener("DOMContentLoaded", () => {
            document.body.style.setProperty('--toast-duration', `${toastDuration / 1000}s`);
        });
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
      }).finally(async () => {
       if (typeof handleAfterFetching === "function") {
  await handleAfterFetching();
}

      });
  });
});
        function showToast(type, headerText = "", messageText = "", redirectUrl = "") {
            const toast = document.getElementById(`toast-${type}`);
            if (!toast) return;

            // Hide all other toasts first
            document.querySelectorAll(".custom-toast").forEach(t => {
                t.classList.add("hidden", "tw-hidden");;
            });
               if (headerText) {
                const header = toast.querySelector(".toast-header");
                if (header) header.textContent = headerText;
            }

            if (messageText) {
                const text = toast.querySelector(".toast-text");
                if (text) text.textContent = messageText;
            }

            // Restart bar animation
            const bar = toast.querySelector(".toast-bar");
            toast.style.animation = "none";
toast.offsetHeight;


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
    if (redirectUrl) {
                        window.location.href = redirectUrl;
                    }
  }, 100); 
}, toastDuration);
}
function hideToast(type) {
    const toast = document.getElementById(`toast-${type}`);
    if (!toast) return;

    toast.classList.add("fade-out");

    setTimeout(() => {
        toast.classList.add("tw-hidden", "hidden");
        toast.classList.remove("fade-out", "block");
    }, 10); 
}



//btn function

        toastReady.then(() => {
  const btn = document.getElementById("showToastBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      showToast("warning","New message","New message waiting for you! It might be important","check.html");
    });
  }
});
