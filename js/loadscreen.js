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

    // hide when click just to check the functions will be removed
    document.getElementById("loadingScreen").addEventListener("click", hideLoadingScreen);
    document.getElementById("loadingOverlay").addEventListener("click", hideLoading);

    window.loadingReady = true; // optional flag if needed elsewhere
  } catch (error) {
    console.error("Failed to load loading components:", error);
  }
}

function hideLoadingScreen() {
  const loading = document.getElementById("loadingScreen");


  loading.classList.add("fade-out");

  setTimeout(function () {
    loading.style.display = "none";
  }, 1000);
}



function showLoading() {
  document.getElementById("loadingOverlay").classList.remove("hidden");
}

function hideLoading() {
  document.getElementById("loadingOverlay").classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", function () {
  loadComponents();
});
