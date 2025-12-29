let departmentSelect;
// Initialize components
document.addEventListener('DOMContentLoaded', async() => {
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("id");
  const {data: course} = await getCourse(courseId);
  const container = document.querySelector('.container');
  container.innerHTML = `
  <form id="course-form">
  <!-- Basic Information Section -->
  <section class="form-section">
  <h2 class="section-title">Basic Information</h2>
  
  <!-- First row: Title & Code -->
  <div class="form-row">
  <div class="form-group">
  <label for="name" class="required">Course Title</label>
  <input type="text" id="name" name="name" required placeholder="Enter course title" value="${course.name}">
  </div>
  <div class="form-group">
  <label for="code" class="required">Course Code</label>
  <input type="text" id="code" name="code" required placeholder="e.g., CS101" value="${course.code}">
  </div>
  </div>
  
  <!-- Second row: Description -->
  <div class="form-group">
  <label for="description">Course Description</label>
  <textarea id="description" name="description" placeholder="Enter a detailed description of the course">${course.details.description}</textarea>
  <div class="help-text">A clear description helps students understand what to expect from the course.</div>
  </div>
  
  <!-- Third row: Faculty & Department dropdowns side by side -->
  <div class="form-row">
  <div class="form-group">
  <label for="course-faculty" class="required">Faculty</label>
  <div class="custom-select" id="faculty-select">
  <div class="custom-select-trigger">
  <span class="custom-select-placeholder">${course.faculty.name || 'Select Faculty'}</span>
  <i class="far fa-chevron-down"></i>
  </div>
  <div class="custom-select-dropdown">
  </div>
  </div>
  </div>
  <div class="form-group">
  <label for="course-department" class="required">Department</label>
  <div class="custom-select" id="department-select">
  <div class="custom-select-trigger">
  <span class="custom-select-placeholder">${course.department.name || 'Select Department'}</span>
  <i class="far fa-chevron-down"></i>
  </div>fdom
  <div class="custom-select-dropdown">
  </div>
  </div>
  </div>
  </div>
  
  <!-- Fourth row: Year & Credits side by side -->
  <div class="form-row">
  <div class="form-group">
  <label for="course-year" class="required">Academic Year</label>
  <div class="custom-select" id="year-select">
  <div class="custom-select-trigger">
  <span class="custom-select-placeholder">${course.year.year || 'Select Year'}</span>
  <i class="far fa-chevron-down"></i>
  </div>
  <div class="custom-select-dropdown">
  </div>
  </div>
  </div>
  <div class="form-group">
  <label for="course-credits" class="required">Credits</label>
  <input type="number" id="credits" name="credits" required min="1" max="6" value="${course.credits || 3}">
  </div>
  </div>
  </section>
  
  <div class="form-actions">
  <div class="right-buttons">
  <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
  <button type="submit" class="btn btn-primary">Update Course</button>
  </div>
  </div>
  </form>`

  const {data} = await getFaculties();
  data.map(data=> 
    document.querySelector("#faculty-select .custom-select-dropdown").innerHTML += `
    <div class="custom-select-option" data-id="${data.id}" onclick="showDepartments(${data.id})">${data.name}</div>
    `
  )

  const {data: departments} = await getDepartments({faculty_id: course.faculty.id});
  departments.map(data=> 
    document.querySelector("#department-select .custom-select-dropdown").innerHTML += `
        <div class="custom-select-option" data-id="${data.id}">${data.name}</div>
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
  // const levelSelect = new CustomSelect(document.getElementById('level-select'));
  const yearSelect = new CustomSelect(document.getElementById('year-select'));
  departmentSelect = new CustomSelect(document.getElementById('department-select'));
  // const semesterSelect = new CustomSelect(document.getElementById('semester-select'));
  
  // Initialize time slot selector
  // const timeSlotSelector = new TimeSlotSelector();
  
  // Update schedule preview when time changes
  // const startTimeInput = document.getElementById('start-time');
  // if (startTimeInput) {
    // startTimeInput.addEventListener('change', () => {
      //     timeSlotSelector.updateSchedulePreview();
  // });
  // }

  // Form submission
  const courseForm = document.getElementById('course-form');
  courseForm.addEventListener('submit', async(e) => {      
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get("id");

    const formData = new FormData(courseForm);
    formData.append('faculty_id', facultySelect.getId());
    formData.append('year_id', yearSelect.getId());
    formData.append('department_id', departmentSelect.getId());
    console.log(yearSelect.getId());
    
    const res = await editCourse(formData, courseId);
    if (res?.status === 'success') {
      showToast("success", "Success", "Course updated successfully", "");
      window.location.href = 'courses.html';          
    }
    else {
      showToast("error", "Error", "Failed to edit course", "");
    }
  });

  // Cancel button
  document.getElementById('cancel-btn').addEventListener('click', () => {
    window.location.href = 'courses.html';
  });
});
// Custom Select Class
class CustomSelect {
  constructor(selectElement) {
    this.selectElement = selectElement;
    this.trigger = selectElement.querySelector('.custom-select-trigger');
    this.placeholder = selectElement.querySelector('.custom-select-placeholder');
    this.dropdown = selectElement.querySelector('.custom-select-dropdown');
    this.options = selectElement.querySelectorAll('.custom-select-option');
    this.selectedValue = '';
    this.selectedId = '';
    this.toggleDropdown = this.toggleDropdown.bind(this);

    // Find the initially selected option
    const initialSelected = selectElement.querySelector('.custom-select-option.selected');
    if (initialSelected) {
        this.selectedValue = initialSelected.getAttribute('data-value');
        this.selectedId = initialSelected.getAttribute('data-id');
    }

    this.init();
  }

  init() {
    // Toggle dropdown
    this.trigger.addEventListener('click', this.toggleDropdown);

    // Handle option clicks
    this.options.forEach(option => {
        option.addEventListener('click', () => {
        this.selectOption(option);
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!this.selectElement.contains(e.target)) {
        this.closeDropdown();
        }
    });
  }

  toggleDropdown() {
  this.selectElement.classList.toggle('open');
  }

  closeDropdown() {
  this.selectElement.classList.remove('open');
  }

  selectOption(option) {
    // Update selected value
    this.selectedValue = option.getAttribute('data-value');
    this.selectedId = option.getAttribute('data-id');

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
  getId() {
    return this.selectedId;
  }
  destroy() {
    this.trigger?.removeEventListener("click", this.toggleDropdown);
    this.options?.forEach(option => {
      option.removeEventListener('click', () => {
        this.selectOption(option);
      });
    });
  }
}

async function showDepartments(facultyId) {
  document.querySelector("#department-select .custom-select-dropdown").innerHTML=''; 
  const {data} = await getDepartments({faculty_id: facultyId});
  data.map(data=> 
    document.querySelector("#department-select .custom-select-dropdown").innerHTML += `
        <div class="custom-select-option" data-id="${data.id}">${data.name}</div>
    `
  )
  departmentSelect.destroy();
  departmentSelect = new CustomSelect(document.getElementById('department-select'));
}

// Time Slot Selection
// class TimeSlotSelector {
//     constructor() {
//     this.timeSlots = document.querySelectorAll('.time-slot');
//     this.selectedDays = new Set();

//     this.init();
//     }

//     init() {
//     this.timeSlots.forEach(slot => {
//         // Initialize selected days
//         if (slot.classList.contains('selected')) {
//         this.selectedDays.add(slot.getAttribute('data-day'));
//         }

//         slot.addEventListener('click', () => {
//         this.toggleSlot(slot);
//         this.updateSchedulePreview();
//         });
//     });

//     // Initialize schedule preview
//     this.updateSchedulePreview();
//     }

//     toggleSlot(slot) {
//     const day = slot.getAttribute('data-day');

//     if (this.selectedDays.has(day)) {
//         this.selectedDays.delete(day);
//         slot.classList.remove('selected');
//         slot.querySelector('.time-slot-time').textContent = 'Select';
//     } else {
//         this.selectedDays.add(day);
//         slot.classList.add('selected');
//         slot.querySelector('.time-slot-time').textContent = 'Selected';
//     }
//     }

//     getSelectedDays() {
//     return Array.from(this.selectedDays);
//     }

//     updateSchedulePreview() {
//     const startTimeInput = document.getElementById('start-time');
//     const previewElement = document.getElementById('schedule-preview');

//     if (!previewElement || !startTimeInput) return;

//     const dayNames = {
//         'mon': 'Monday',
//         'tue': 'Tuesday',
//         'wed': 'Wednesday',
//         'thu': 'Thursday',
//         'fri': 'Friday',
//         'sat': 'Saturday',
//         'sun': 'Sunday'
//     };

//     // Get selected day names
//     const selectedDayNames = Array.from(this.selectedDays).map(day => dayNames[day]);

//     // Format days text
//     let daysText = '';
//     if (selectedDayNames.length === 0) {
//         daysText = 'No days selected';
//     } else if (selectedDayNames.length === 1) {
//         daysText = selectedDayNames[0];
//     } else {
//         const last = selectedDayNames.pop();
//         daysText = selectedDayNames.join(', ') + ' & ' + last;
//     }

//     // Format time
//     const timeValue = startTimeInput.value;
//     let timeText = 'No time selected';

//     if (timeValue) {
//         const [hours, minutes] = timeValue.split(':');
//         const hour = parseInt(hours, 10);
//         const ampm = hour >= 12 ? 'PM' : 'AM';
//         const hour12 = hour % 12 || 12; // Convert 0 to 12
//         timeText = `${hour12}:${minutes} ${ampm}`;
//     }

//     // Update preview
//     previewElement.textContent = `${daysText}, ${timeText}`;
//     }
// }
