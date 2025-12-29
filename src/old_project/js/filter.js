// Faculty filter dropdown logic
(function() {
    const filter = document.getElementById('customFacultyFilter1');
    const dropdown = document.getElementById('customFacultyDropdown');
    const valueSpan = document.getElementById('customFacultyValue');
    const hiddenInput = document.getElementById('faculty_hidden');

    filter.addEventListener('click', function(e) {
        filter.classList.toggle('open');
        dropdown.style.display = filter.classList.contains('open') ? 'block' : 'none';
        e.stopPropagation();
    });

    dropdown.addEventListener('mousedown', function(e) {
        if (e.target.tagName === 'LI') {
            dropdown.querySelectorAll('li').forEach(li => li.classList.remove('active'));
            e.target.classList.add('active');
            valueSpan.textContent = e.target.textContent;
            hiddenInput.value = e.target.getAttribute('data-value');
            filter.classList.remove('open');
            dropdown.style.display = 'none';
        }
    });

    document.addEventListener('click', function(e) {
        if (!filter.contains(e.target) && !dropdown.contains(e.target)) {
            filter.classList.remove('open');
            dropdown.style.display = 'none';
        }
    });
})();
