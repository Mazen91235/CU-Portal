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

// // Time Slot Selection
// class TimeSlotSelector {
//     constructor() {
//     this.timeSlots = document.querySelectorAll('.time-slot');
//     this.selectedDays = new Set();
    
//     this.init();
//     }
    
//     init() {
//     this.timeSlots.forEach(slot => {
//         slot.addEventListener('click', () => {
//         this.toggleSlot(slot);
//         this.updateSchedulePreview();
//         });
//     });
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
let departmentSelect;
// Initialize components
document.addEventListener('DOMContentLoaded', async() => {
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
    departmentSelect = new CustomSelect(document.getElementById('department-select'));
    const yearSelect = new CustomSelect(document.getElementById('year-select'));
    
    // Form submission
    const courseForm = document.getElementById('course-form');
    courseForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        const formData = new FormData(courseForm);
        formData.append('faculty_id', facultySelect.getId());
        formData.append('department_id', departmentSelect.getId());
        formData.append('year_id', yearSelect.getId());
        // In a real application, this would submit the form data to the server
        const res = await addCourse(formData);
        
        if (res?.status === 'success') {
            // Show success message (in a real app, this would be more sophisticated)
            showToast("success", "Success", "Course created successfully", "");
            // Redirect back to courses management page
            window.location.href = 'courses.html';
        }
        else {
            showToast("error", "Error", "Failed to create courses", "");
        }
        
        // const levelSelect = new CustomSelect(document.getElementById('level-select'));
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
    });
    
        
        // Cancel button
        // document.getElementById('cancel-btn').addEventListener('click', () => {
        // In a real application, this would navigate back without saving
        // if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
        //     window.location.href = 'courses-management.html';
        // }
    // });
});

async function showDepartments(facultyId) {
  document.querySelector("#department-select .custom-select-dropdown").innerHTML=''; 
  const {data} = await getDepartments({faculty_id: facultyId});
  data.map(data=> 
    document.querySelector("#department-select .custom-select-dropdown").innerHTML += `
        <div class="custom-select-option" data-id="${data.id}">${data.name}</div>
    `
  )
  departmentSelect.destroy();
  // Recreate department select after rendering departments
  departmentSelect = new CustomSelect(document.getElementById('department-select'));
}