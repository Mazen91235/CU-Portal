let courses = [];
async function fetchCourses() {
  // await loadFaculties();
  // await loadDepartments();
  // await loadAcademicYears();
  showLoading();

  const res = await getCourses();
  if (res?.status === 'success') {
    courses = res.data;
    noMaps = courses.length === 0;
    hasMaps = !noMaps;
    renderCourses(courses);

  }
  else {
    showToast("error", "Error", "Failed to fetch courses", "");

  }
}
async function renderCourses(list = courses) {
  const container = document.querySelector(".course-grid");
  container.innerHTML = "";
  for (let c of list) {
    container.innerHTML += `
    <article class="course-card" tabindex="0" aria-labelledby="course-title-${c.id}">
      <div class="course-header-row">
        <span class="course-badge">${c.code}</span>
        <span class="course-credits-badge">${c.credits} Credits</span>
      </div>

<div  style = "display:flex; justify-content:space-between; flex-direction:row; hight:50px; ">
      <h3 class="course-title" id="course-title-${c.id}" style="margin: 0; display:flex;  ">${c.name}</h3>
      
     
         
        <div class="dropdown  d-flex align-items-center justify-content-center">
                <button class="btn btn-light btn-sm dropbtn" type="button" data-bs-toggle="dropdown"
                aria-expanded="false" style="width:35px;height:35px;">
                <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-start shadow-sm">
                    <a class="dropdown-item text-muted" href="#!" onclick='window.location.href="edit_course.html?id=${c.id}"'>
                        <svg id="editSvg" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                        </svg>
                    </a>
                    <a class="dropdown-item text-muted" href="#!" onclick="handleDeleteCourse('${c.id}')">
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="18" height="18" viewBox="0,0,256,256">
                            <g fill="#ef4343" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(16,16)"><path d="M6.49609,1c-0.82031,0 -1.49609,0.67578 -1.49609,1.49609v0.50391h-3v1h1v8.5c0,0.82813 0.67188,1.5 1.5,1.5h6c0.82813,0 1.5,-0.67187 1.5,-1.5v-8.5h1v-1h-3v-0.50391c0,-0.82031 -0.67578,-1.49609 -1.49609,-1.49609zM6.49609,2h2.00781c0.28125,0 0.49609,0.21484 0.49609,0.49609v0.50391h-3v-0.50391c0,-0.28125 0.21484,-0.49609 0.49609,-0.49609zM5,5h1v7h-1zM7,5h1v7h-1zM9,5h1v7h-1z"></path></g></g>
                        </svg>
                    </a>
                </div>
                </div>
       
   
    
</div>
       
      
      <!-- ...existing info rows and button... -->
      <div class="course-info-row" style="display: flex; justify-content: space-between; background: #FEF2F2; border-radius: 6px; padding: 6px 10px; margin-bottom: 4px;">
        <span><i class="far fa-graduation-cap"></i> Faculty</span>
        <span style="font-weight:500;">${c.faculty?.name || 'Faculty'}</span>
      </div>
      <div class="course-info-row" style="display: flex; justify-content: space-between; background: #F0FDFA; border-radius: 6px; padding: 6px 10px; margin-bottom: 4px;">
        <span><i class="far fa-sitemap"></i> Department</span>
        <span style="font-weight:500;">${c.department?.name || 'Department'}</span>
      </div>
      <div class="course-info-row" style="display: flex; justify-content: space-between; background: #F7FEE7; border-radius: 6px; padding: 6px 10px;">
        <span><i class="far fa-calendar-alt"></i> Academic Year</span>
        <span style="font-weight:500;">${c.year.year || 'Year'}</span>
      </div>
      <button class="btn-view" type="button" aria-label="View details for ${c.name}" data-course-id="${c.id}" onclick='window.location.href="course_details.html?id=${c.id}"'>
        <i class="far fa-eye"></i> View Course
      </button>
    </article>
    `;
  }

  hideLoading();
}





// Load navbar and sidebar components

// Toggle sidebar visibility

let departmentSelect;
// Initialize components
document.addEventListener('DOMContentLoaded', async() => {
  showLoading();
  await fetchCourses();
  // Initialize Lucide icons
  lucide.createIcons();
  
  const {data} = await getFaculties();
  data.map(data=> 
    document.querySelector("#faculty-select .custom-select-dropdown").innerHTML += `
    <div class="custom-select-option" data-id="${data.id}" onclick="showDepartments(${data.id})">${data.name}</div>
    `
  )
  
  const {data: years} = await getYears();
  years.map(data=>
    document.querySelector("#year-select .custom-select-dropdown").innerHTML += `
    <div class="custom-select-option" data-id="${data.id}">${data.year}</div>
    `
  )
  // Initialize custom selects
  const facultySelect = new CustomSelect(document.getElementById('faculty-select'));
  const yearSelect = new CustomSelect(document.getElementById('year-select'));
  departmentSelect = new CustomSelect(document.getElementById('department-select'));
  
  // Search functionality
  const searchInput = document.querySelector('.search-box input');
  searchInput.addEventListener('input', applyFilters);
  
  // Filter change events
  facultySelect.selectElement.addEventListener('change', applyFilters);
  yearSelect.selectElement.addEventListener('change', applyFilters);
  departmentSelect.selectElement.addEventListener('change', applyFilters);
  
  document.querySelectorAll(".custom-select-option").forEach(select=> {
    select.addEventListener("click", resetSearchInput);
  })
  
  // View button functionality
  // document.addEventListener('click', (e) => {
  //   const viewBtn = e.target.closest('.btn-view');
  //   if (viewBtn) {
  //     const courseId = viewBtn.getAttribute('data-course-id');
  //     console.log(courseId);

  //     if (courseId) {
  //       showCourseDetail(courseId);
  //     } else {
    //       console.warn("No course id found for clicked button");
    //     }
    //   }
    // });
    
    
  // Back to courses button
  document.getElementById('back-to-courses').addEventListener('click', () => {
    showCoursesList();
  });

  // Tab functionality
  document.querySelectorAll('.tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.getAttribute('data-tab');
      switchTab(tabName);
    });
  });

  // Load components
  loadComponents();

  // Initial filter application
  applyFilters();
});
  
// Custom Select Class
class CustomSelect {
  constructor(selectElement) {
    this.selectElement = selectElement;
    this.trigger = selectElement?.querySelector('.custom-select-trigger');
    this.placeholder = selectElement?.querySelector('.custom-select-placeholder');
    this.dropdown = selectElement?.querySelector('.custom-select-dropdown');
    this.options = selectElement?.querySelectorAll('.custom-select-option');
    this.selectedValue = '';
    this.toggleDropdown = this.toggleDropdown.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);

    this.init();
  }

  init() {
    // Toggle dropdown
    this.trigger?.addEventListener('click', this.toggleDropdown);

    // Handle option clicks
    this.options?.forEach(option => {
      option.addEventListener('click', () => {
        this.selectOption(option);
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleClickOutside);
  }

  handleClickOutside(e) {
    if (!this.selectElement.contains(e.target)) {
      this.closeDropdown();
    }
  }

  toggleDropdown() {
    this.selectElement?.classList.toggle('open');
  }

  closeDropdown() {
    this.selectElement.classList.remove('open');
  }

  selectOption(option) {
    // Update selected value
    this.selectedValue = option.getAttribute('data-value');

    // Update placeholder text
    this.placeholder.textContent = option.textContent;

    // Update selected state
    this.options.forEach(opt => opt.classList.remove('selected'));
    option.classList.add('selected');

    // Close dropdown
    this.closeDropdown();

    // Trigger change event
    this.selectElement.dispatchEvent(new Event('change'));
  }

  getValue() {
    return this.selectedValue;
  }

  destroy() {
    this.trigger?.removeEventListener("click", this.toggleDropdown);
    document.removeEventListener('click', this.handleClickOutside);
    this.options?.forEach(option => {
      option.removeEventListener('click', () => {
        this.selectOption(option);
      });
    });
  }
}

async function handleDeleteCourse(courseId) {
  if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
    await deleteCourse(courseId);
    showToast("success", "Success", "Course deleted successfully", "");
    await fetchCourses();

  }
}
// pagination buttons
const prevBtn = document.getElementById('prevPage');
const nextBtn = document.getElementById('nextPage');

// Apply filters function
async function applyFilters() {      
  const searchTerm = document.querySelector('.search-box input').value.toLowerCase();
  const facultyId = document.getElementById('faculty-select').querySelector('.custom-select-option.selected')?.getAttribute('data-id') || '';
  const departmentId = document.getElementById('department-select').querySelector('.custom-select-option.selected')?.getAttribute('data-id') || '';
  const yearId = document.getElementById('year-select').querySelector('.custom-select-option.selected')?.getAttribute('data-id') || '';
  const page = document.getElementById('pageInput').textContent;
  // const semesterValue = document.getElementById('semester-select').querySelector('.custom-select-option.selected')?.getAttribute('data-value') || '';
  // const statusValues = document.getElementById('status-filter').querySelector('.multi-select-placeholder').textContent === 'All Statuses'
  //   ? []
  //   : Array.from(document.querySelectorAll('#status-filter input[type="checkbox"]:checked')).map(cb => cb.getAttribute('data-value'));
  
  if(page <= 1) prevBtn.disabled= true;
  else prevBtn.disabled = false;

  const res = await getCourses({query: searchTerm || '', faculty_id:facultyId || '', year_id: yearId || '', department_id: departmentId || '', page: page || ''});
  
  if(!res.next) nextBtn.disabled = true;
  await renderCourses(res.data);
  // const courseCards = document.querySelectorAll('.course-card');
  // courseCards.forEach(card => {
  //   // Check search
  //   const title = card.querySelector('.course-title').textContent.toLowerCase();
  //   // const code = card.querySelector('.course-code').textContent.toLowerCase();
  //   // const matchesSearch = !searchTerm || title.includes(searchTerm) || code.includes(searchTerm);
    
  //   // Check faculty
  //   const cardFaculty = card.getAttribute('data-faculty');
  //   const matchesFaculty = !facultyValue || cardFaculty === facultyValue;
    
  //   // Check year
  //   const cardYear = card.getAttribute('data-year');
  //   const matchesYear = !yearValue || cardYear === yearValue;
    
  //   // Check semester
  //   // const cardSemester = card.getAttribute('data-semester');
  //   // const matchesSemester = !semesterValue || cardSemester === semesterValue;
    
  //   // Check status
  //   const cardStatus = card.getAttribute('data-status');
  //   const matchesStatus = statusValues.length === 0 || statusValues.includes(cardStatus);
    
  //   // Show card if all conditions are met
  //   if (matchesFaculty && matchesYear && matchesStatus) {
  //     card.style.display = 'block';
  //   } else {
  //     card.style.display = 'none';
  //   }
  // });
}

async function showDepartments(facultyId) {
  document.querySelector("#department-select .custom-select-dropdown").innerHTML='<div class="custom-select-option" data-value="" onclick="resetSearchInput()">All Departments</div>'; 
  const {data} = await getDepartments({faculty_id: facultyId});
  data.map(data=> 
    document.querySelector("#department-select .custom-select-dropdown").innerHTML += `
        <div class="custom-select-option" data-id="${data.id}" onclick="resetSearchInput()">${data.name}</div>
    `
  )
  departmentSelect?.destroy();
  departmentSelect = new CustomSelect(document.getElementById('department-select'));
}

function hideDepartments() {
  departmentSelect.destroy();
  document.querySelector("#department-select .custom-select-dropdown").innerHTML='<div class="custom-select-option" data-value="">All Departments</div>'; 
  departmentSelect = new CustomSelect(document.getElementById('department-select'));
}

function resetSearchInput() {
  document.querySelector('.search-box input').value = '';
}

// pagination
async function prevPage() {
  let page = document.getElementById('pageInput');
  if (nextBtn.disabled) {
    nextBtn.disabled= false;
  }
  
  if (page.textContent > 1) {
    
    page.textContent--;
    const searchTerm = document.querySelector('.search-box input').value.toLowerCase();
    const facultyId = document.getElementById('faculty-select').querySelector('.custom-select-option.selected')?.getAttribute('data-id') || '';
    const departmentId = document.getElementById('department-select').querySelector('.custom-select-option.selected')?.getAttribute('data-id') || '';
    const yearId = document.getElementById('year-select').querySelector('.custom-select-option.selected')?.getAttribute('data-id') || '';
    
    const res = await getCourses({query: searchTerm || '', faculty_id:facultyId || '', year_id: yearId || '', department_id: departmentId || '', page: page.textContent || ''});
    await renderCourses(res.data);
    
    if (page.textContent ==1) {
      prevBtn.disabled = true;
    }
  }
}

async function nextPage() {
  prevBtn.disabled =false
  let page = document.getElementById('pageInput');
  nextBtn.disabled= true; // disable until data arrive

  page.textContent++;
  const searchTerm = document.querySelector('.search-box input').value.toLowerCase();
  const facultyId = document.getElementById('faculty-select').querySelector('.custom-select-option.selected')?.getAttribute('data-id') || '';
  const departmentId = document.getElementById('faculty-select').querySelector('.custom-select-option.selected')?.getAttribute('data-id') || '';
  const yearId = document.getElementById('year-select').querySelector('.custom-select-option.selected')?.getAttribute('data-id') || '';
  const res = await getCourses({query: searchTerm || '', faculty_id:facultyId || '', year_id: yearId || '', department_id: departmentId || '', page: page.textContent || ''});
  
  if(!res.next) nextBtn.disabled= true;
  else nextBtn.disabled= false;

  await renderCourses(res.data);
}
// Show course detail page
// async function showCourseDetail(courseId) {
//   const res = await getCourse(courseId);
//   const course = res.data;
//   console.log(course);
//   if (!course) return;

//   // Update course detail information
//   document.getElementById('detail-title').textContent = course.name;
//   document.getElementById('detail-code').textContent = course.code;
//   document.getElementById('detail-instructor').textContent = "course.instructor";
//   document.getElementById('detail-schedule').textContent = "course.schedule";
//   document.getElementById('detail-location').textContent = "course.location";

//   // Update overview section
//   document.getElementById('stat-enrolled').textContent = "course.enrolled";
//   document.getElementById('stat-capacity').textContent = course.details.max_students;
//   document.getElementById('stat-credits').textContent = course.credits;
//   document.getElementById('stat-full').textContent = "course.fillRate + '%'";

//   document.getElementById('info-instructor').textContent = "course.instructor";
//   document.getElementById('info-schedule').textContent = "course.schedule";
//   document.getElementById('info-location').textContent = "course.location";
//   document.getElementById('info-faculty').textContent = course.faculty.name;

//   document.getElementById('description-text').textContent = course.details.description;

//   // Update objectives
//   // const objectivesList = document.getElementById('detail-objectives');
//   // objectivesList.innerHTML = '';
//   // course.objectives.forEach(objective => {
  //   //   const li = document.createElement('li');
  //   //   li.textContent = objective;
  //   //   objectivesList.appendChild(li);
  //   // });
  
  //   // // Update other details
  //   // document.getElementById('detail-prerequisites').textContent = course.prerequisites;
  
  //   // const assessmentList = document.getElementById('detail-assessment');
  //   // assessmentList.innerHTML = '';
  //   // course.assessment.forEach(item => {
    //   //   const li = document.createElement('li');
    //   //   li.textContent = item;
    //   //   assessmentList.appendChild(li);
    //   // });
    
    //   // document.getElementById('detail-textbook').textContent = course.textbook;
    
    //   // Update students list
    //   const studentsList = document.getElementById('students-list');
    //   studentsList.innerHTML = '';
    //   course.users.forEach(student => {
      //     const tr = document.createElement('tr');
      
      //     const nameCell = document.createElement('td');
      //     const initialsSpan = document.createElement('span');
      //     initialsSpan.className = 'student-initials';
      //     initialsSpan.textContent = student.initials;
      //     nameCell.appendChild(initialsSpan);
      //     nameCell.appendChild(document.createTextNode(student.name));
      
      //     const emailCell = document.createElement('td');
      //     emailCell.textContent = student.email;
      
      //     const gradeCell = document.createElement('td');
      //     if (student.gradeClass) {
        //       const gradeSpan = document.createElement('span');
        //       gradeSpan.className = `grade-badge ${student.gradeClass}`;
        //       gradeSpan.textContent = student.grade;
        //       gradeCell.appendChild(gradeSpan);
        //     } else {
          //       gradeCell.textContent = student.grade;
          //     }
          
          //     tr.appendChild(nameCell);
          //     tr.appendChild(emailCell);
          //     tr.appendChild(gradeCell);
          
          //     studentsList.appendChild(tr);
          //   });
          
//   // Update students tab title
//   const studentsTab = document.querySelector('.tab-btn[data-tab="students"]');
//   studentsTab.textContent = `Students (${course.enrolled})`;

//   // Hide courses list and show course detail
//   document.getElementById('courses-list-page').style.display = 'none';
//   document.getElementById('course-detail-page').style.display = 'block';

//   // Reset to overview tab
//   switchTab('overview');

//   // Reinitialize Lucide icons after DOM update
//   lucide.createIcons();
// }

// Show courses list page
// function showCoursesList() {
//   document.getElementById('courses-list-page').style.display = 'block';
//   document.getElementById('course-detail-page').style.display = 'none';
// }

// // Switch tab
// function switchTab(tabName) {
//   // Update tab buttons
//   document.querySelectorAll('.tab-btn').forEach(tab => {
//     if (tab.getAttribute('data-tab') === tabName) {
//       tab.classList.add('active');
//     } else {
//       tab.classList.remove('active');
//     }
//   });

//   // Update tab panes
//   document.querySelectorAll('.tab-content').forEach(pane => {
//     if (pane.id === tabName) {
//       pane.classList.add('active');
//     } else {
//       pane.classList.remove('active');
//     }
//   });
// }
// Dropdown menu JS






  function handleEditCourse(mapId) {
          
            console.log("hello")
        }

        function handleDeleteCourse(mapId) {
            showPopup(
                'confirm',
                'Delete CourseMap',
                'Are you sure you want to delete this CourseMap?',
                async () => {
                    await deleteCourse(mapId);
                    closePopup();
                    await fetchCourse();
                }
            );
        }