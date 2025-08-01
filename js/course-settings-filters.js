
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

// Custom dropdown logic for Term and Year filters
document.addEventListener('DOMContentLoaded', function () {
  // Term Dropdown
  const termInput = document.getElementById('term_input');
  const termDropdown = document.getElementById('term-dropdown');
  const termGroup = document.getElementById('term-select-group');
  const termHidden = document.getElementById('term_hidden');
  const termArrow = document.getElementById('term-arrow').querySelector('img');

  function toggleTermDropdown() {
    termDropdown.classList.toggle('open');
    termArrow.style.transform = termDropdown.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
  }
  function closeTermDropdown(e) {
    if (!termGroup.contains(e.target)) {
      termDropdown.classList.remove('open');
      termArrow.style.transform = 'rotate(0deg)';
    }
  }
  termInput.addEventListener('click', toggleTermDropdown);
  termDropdown.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', function() {
      termInput.value = li.textContent;
      termHidden.value = li.getAttribute('data-value');
      termDropdown.querySelectorAll('li').forEach(item => item.classList.remove('active'));
      li.classList.add('active');
      termDropdown.classList.remove('open');
      termArrow.style.transform = 'rotate(0deg)';
      filterCourses();
    });
  });
  document.addEventListener('mousedown', closeTermDropdown);

  // Year Dropdown
  const yearInput = document.getElementById('year_input');
  const yearDropdown = document.getElementById('year-dropdown');
  const yearGroup = document.getElementById('year-select-group');
  const yearHidden = document.getElementById('year_hidden');
  const yearArrow = document.getElementById('year-arrow').querySelector('img');

  function toggleYearDropdown() {
    yearDropdown.classList.toggle('open');
    yearArrow.style.transform = yearDropdown.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
  }
  function closeYearDropdown(e) {
    if (!yearGroup.contains(e.target)) {
      yearDropdown.classList.remove('open');
      yearArrow.style.transform = 'rotate(0deg)';
    }
  }
  yearInput.addEventListener('click', toggleYearDropdown);
  yearDropdown.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', function() {
      yearInput.value = li.textContent;
      yearHidden.value = li.getAttribute('data-value');
      yearDropdown.querySelectorAll('li').forEach(item => item.classList.remove('active'));
      li.classList.add('active');
      yearDropdown.classList.remove('open');
      yearArrow.style.transform = 'rotate(0deg)';
      filterCourses();
    });
  });
  document.addEventListener('mousedown', closeYearDropdown);

  // Patch filterCourses to use hidden input values
  function filterCourses() {
    const filterSearch = document.querySelector('.filter-search');
    const termVal = termHidden.value || 'Filter by Term';
    const yearVal = yearHidden.value || 'Academic Year';
    const cards = document.querySelectorAll('.mb-4:last-of-type .course-card');
    function normalize(str) {
      return (str || '').toLowerCase().replace(/[\s.]+/g, '');
    }
    const searchVal = normalize(filterSearch.value);
    cards.forEach(card => {
      let show = true;
      const courseName = normalize(card.querySelector('.card-title')?.textContent);
      const profName = normalize(card.querySelector('.mb-2.small.text-muted')?.textContent);
      const courseCode = normalize(card.querySelector('.course-code-badge')?.textContent);
      if (searchVal && !(courseName.includes(searchVal) || profName.includes(searchVal) || courseCode.includes(searchVal))) {
        show = false;
      }
      if (termVal !== 'Filter by Term' && !card.innerText.toLowerCase().includes(termVal.toLowerCase())) {
        show = false;
      }
      if (yearVal !== 'Academic Year' && !card.innerText.toLowerCase().includes(yearVal.toLowerCase())) {
        show = false;
      }
      card.parentElement.style.display = show ? '' : 'none';
    });
  }
  // Attach search event
  document.querySelector('.filter-search').addEventListener('input', filterCourses);
});
