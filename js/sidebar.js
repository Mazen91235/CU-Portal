function initSidebar() {
    // Example: toggle sidebar on button/icon click
    const sidebar = document.getElementById('sidebar-container');
    const toggleBtn = document.querySelector('.sidebar-toggle, #sidebar-toggle');
    if (toggleBtn && sidebar) {
        toggleBtn.onclick = function() {
            sidebar.classList.toggle('active');
        };
    }
    // Add more logic as needed for your sidebar
}
