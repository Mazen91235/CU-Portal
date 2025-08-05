async function loadComponents() {
  try {
    const loadingScreenHtml = await fetch("./components/loadinscreen.html").then(function (res) {
      return res.text();
    });

    const loadingOverlayHtml = await fetch("./components/loading-overlay.html").then(function (res) {
      return res.text();
    });

    document.getElementById("loadingScreenContainer").innerHTML = loadingScreenHtml;
    
    document.getElementById("loadingOverlayContainer").innerHTML = loadingOverlayHtml;
  const container = document.getElementById("loadingScreenContainer");

    // hide when click just to check the functions will be removed
    container.addEventListener("click", hideLoadingScreen);

    document.getElementById("loadingScreen").addEventListener("click", hideLoadingScreen);
    document.getElementById("loadingOverlay").addEventListener("click", hideLoading);

    window.loadingReady = true; // optional flag if needed elsewhere
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
  document.getElementById("loadingOverlay").classList.remove("hidden");
    document.getElementById("loadingOverlayContainer").classList.remove("hidden");

}

function hideLoading() {
  document.getElementById("loadingOverlay").classList.add("hidden");
    document.getElementById("loadingOverlayContainer").classList.add("hidden");

}

document.addEventListener("DOMContentLoaded", function () {
  loadComponents();
});
