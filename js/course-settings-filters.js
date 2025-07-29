// This script enables filtering for the Past Courses section.

document.addEventListener('DOMContentLoaded', function () {
    // Selectors for the Past Courses section
    const filterSearch = document.querySelector('.filter-search');
    const filterTerm = document.querySelector('.filter-select');
    const filterYear = document.querySelector('.filter-year');
    const cards = document.querySelectorAll('.mb-4:last-of-type .course-card');

    function normalize(str) {
        return (str || '')
            .toLowerCase()
            .replace(/[\s.]+/g, ''); // remove spaces and dots
    }

    function filterCourses() {
        const searchVal = normalize(filterSearch.value);
        const termVal = filterTerm.value;
        const yearVal = filterYear.value;

        cards.forEach(card => {
            let show = true;

            // Get course name, prof name, and course code
            const courseName = normalize(card.querySelector('.card-title')?.textContent);
            const profName = normalize(card.querySelector('.mb-2.small.text-muted')?.textContent);
            const courseCode = normalize(card.querySelector('.course-code-badge')?.textContent);

            // Search filter: match any field, ignore spaces and dots
            if (searchVal &&
                !(courseName.includes(searchVal) ||
                  profName.includes(searchVal) ||
                  courseCode.includes(searchVal))) {
                show = false;
            }

            // Term filter
            if (termVal !== 'Filter by Term' && !card.innerText.toLowerCase().includes(termVal.toLowerCase())) {
                show = false;
            }

            // Year filter
            if (yearVal !== 'Academic Year' && !card.innerText.toLowerCase().includes(yearVal.toLowerCase())) {
                show = false;
            }

            card.parentElement.style.display = show ? '' : 'none';
        });
    }

    if (filterSearch) filterSearch.addEventListener('input', filterCourses);
    if (filterTerm) filterTerm.addEventListener('change', filterCourses);
    if (filterYear) filterYear.addEventListener('change', filterCourses);
});
