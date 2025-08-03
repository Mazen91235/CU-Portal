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

    // Bind click events after DOM injection
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

function showInitialLoading() {
  const loading = document.getElementById("loadingScreen");
  const content = document.getElementById("pageContent");



  loading.style.display = "flex";
  loading.classList.remove("hidden");
  loading.classList.remove("fade-out");
}

function showLoading() {
  document.getElementById("loadingOverlay").classList.remove("hidden");
}

function hideLoading() {
  document.getElementById("loadingOverlay").classList.add("hidden");
}

// ✅ DOMContentLoaded with traditional function expression
document.addEventListener("DOMContentLoaded", function () {
  loadComponents();
});
