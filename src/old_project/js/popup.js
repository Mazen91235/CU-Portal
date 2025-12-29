// Load the popup component and make sure it's ready before use
const popupReady = fetch("/components/popup.html")
  .then(res => res.text())
  .then(popupHtml => {
    const container = document.getElementById("popup-container");
    if (container) {
      container.innerHTML = popupHtml;
    } else {
      console.error("Missing #popup-container in HTML");
    }
  })
  .catch(err => console.error("Failed to load popup component:", err));

function showPopup(type, heading, message, action = null, timer = 5000) {
  popupReady.then(() => {
    const overlay = document.getElementById("popupOverlay");
    if (!overlay) return console.error("Popup overlay not found");

    overlay.style.display = "flex";

    // Hide all popup types
    document.querySelectorAll(".popup-box").forEach(el => {
      el.style.display = "none";
    });

    const popup = document.getElementById(`popup-${type}`);
    if (!popup) return console.error(`Popup type '${type}' not found`);

    popup.style.display = "flex";
    popup.querySelector(".popup-heading").innerText = heading;
    popup.querySelector(".popup-message").innerText = message;

    const actionBtn = popup.querySelector("button.popup-btn");
    if (actionBtn) {
      const btnText = actionBtn.querySelector(".popup-btn-text");
      const btnFill = actionBtn.querySelector(".popup-btn-fill");

      if (btnFill) {
        btnFill.style.transition = "none";
        btnFill.style.width = "0%";
        void btnFill.offsetWidth; // Force reflow
        btnFill.style.transition = `width ${timer}ms linear`;
        btnFill.style.width = "100%";
      }
    }

    if (type === "success" || type === "error") {
      const btn = popup.querySelector(".redirect-button");
      if (btn) {
        if (action) {
          btn.style.display = "inline-block";
 const actionBtn = popup.querySelector("button.popup-btn");
    if (actionBtn) {
      const btnText = actionBtn.querySelector(".popup-btn-text");
      const btnFill = actionBtn.querySelector(".popup-btn-fill");

      if (btnFill) {
        btnFill.style.transition = "none";
        btnFill.style.width = "0%";
        void btnFill.offsetWidth; // Force reflow
        btnFill.style.transition = `width ${timer}ms linear`;
        btnFill.style.width = "100%";
      }
    }

          btn.onclick = action;
          if(type != "confirm") {
            if (timer > 0) {
              setTimeout(action, timer);
            }
          }
        } else {
          btn.style.display = "none";
          btn.onclick = null;
        }
      }
    }

    if (type === "loading") {
      if (action && timer > 0) {
        setTimeout(() => {
          action();
        }, timer);
      }
    }

    if (type === "confirm") {
      const btnYes = popup.querySelector(".confirm.yes");
      const btnNo = popup.querySelector(".confirm.no");

      if (btnYes && btnNo) {
        btnYes.onclick = () => {
          if (action) {
            action();
            closePopup();
          } else {
            closePopup();
          }
        };
        btnNo.onclick = () => closePopup();
      }
    }

    // Close on outside click 
    overlay.onclick = (e) => {
        closePopup();
    };
  });
}

function closePopup() {
  const overlay = document.getElementById("popupOverlay");
  if (overlay) {
    overlay.style.display = "none";
    overlay.onclick = null;
  }
}
document.addEventListener("DOMContentLoaded", () => {
  popupReady.then(() => {
    const btn = document.getElementById("testPopupBtn");
    if (btn) {
      btn.addEventListener("click", () => {
        showPopup("success", "Welcome!", "This is a test popup", "check.html", 3000);
      });
    }
  });
});
