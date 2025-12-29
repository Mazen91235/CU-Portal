async function loadComponents() {
  try {
    const [loadingScreenHtml, loadingOverlayHtml] = await Promise.all([
      fetch("../components/loadinscreen.html").then(res => res.text()),
      fetch("../components/loading-overlay.html").then(res => res.text())
    ]);

    // Insert screen only if container exists
    const screenContainer = document.getElementById("loadingScreenContainer");
    if (screenContainer) {
      screenContainer.innerHTML = loadingScreenHtml;

    
    }

    // Insert overlay only if container exists
    const overlayContainer = document.getElementById("loadingOverlayContainer");
    if (overlayContainer) {
      overlayContainer.innerHTML = loadingOverlayHtml;

      
    }

    window.loadingReady = true; // flag if needed
  } catch (error) {
    console.error("Failed to load loading components:", error);
  }
}


function hideLoadingScreen() {

  const screen = document.getElementById("loadingScreen");
  const container = document.getElementById("loadingScreenContainer");

  if (!screen || !container) {
    console.error(" Elements not found during hide");
    return;
  }

  console.log(" Fading out screen...");

  screen.classList.add("fade-out");

  setTimeout(() => {
    screen.style.display = "none";
    container.style.display = "none";
    container.style.visibility = "hidden";
    container.style.pointerEvents = "none";
    console.log(" Loading screen and container hidden");
  }, 1000);
}



function showLoading() {
  document.getElementById("loadingOverlayContainer")?.classList.remove("d-none");
}

function hideLoading() {
  document.getElementById("loadingOverlayContainer").classList.add("d-none");
}

document.addEventListener("DOMContentLoaded", function () {
  loadComponents();
});
