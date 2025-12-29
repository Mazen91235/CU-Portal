// Combined JS for announcements.html: fetching, populating, and filter handling

// Import search functions from script.js if modularized (assuming global scope here)

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
// Fetch announcements from API
async function fetchAnnouncements(filters = {}) {
  await IsLoggedIn(); // Ensure user is logged in
  showLoading();
  try {
    const params = new URLSearchParams({
      query: filters.query || '',
      subject_id: filters.subject_id || '',
      page: filters.page || 1,
      limit: filters.limit || 50
    });
    
    const response = await axios.get(`${domain}/user/announcements?${params}`, {
      headers: {
        "Authorization": `Bearer ${GetCookie("access_token")}`,
        "ngrok-skip-browser-warning": "true"
      },
      withCredentials: true
    });
    console.log('Fetched announcements:', response.data);
    hideLoading();
    return {data: response.data, filters: filters};
  } catch (error) {
    console.error('Error fetching announcements:', error);
    showToast('toast-error');
    hideLoading();
    return { data: [] };
  }
}

// Populate the announcements grid
function populateAnnouncements(announcements, reset = true) {
  const grid = document.getElementById('announcementsGrid');
  if (!grid) return;

  if(reset) grid.innerHTML = ''; // Clear existing cards
  announcements?.forEach(announcement => {
    grid.innerHTML += `<article class="announcement-card">
        <div class="announcement-title">
          ${announcement.title.length > 30? announcement.title.slice(0, 30) + "...": announcement.title}
        </div>
        <div class="announcment-info-row announcment-info-date">
          <span class="announcment-info-label">
            <img src="../assets/m100.svg" class="announcment-info-icon" alt="Date icon" />
            Published
          </span>
          <span class="announcment-info-value">${announcement.created_at}</span>
        </div>
        <div class="announcment-info-row announcment-info-author">
          <span class="announcment-info-label">
            <img src="../assets/usericon.png" class="announcement-info-icon" alt="User icon" />
            Author
          </span>
          <span class="announcment-info-value">${(announcement.author.name.length > 20 ? announcement.author.name.slice(0, 20)+"...": announcement.author.name ) || 'Unknown'}</span>
        </div>
        <div class="announcment-info-row announcment-info-subject">
          <span class="announcment-info-label">
            <img src="../assets/m110.svg" class="announcement-info-icon" alt="Subject icon" />
            Subject
          </span>
          <span class="announcment-info-value">${(announcement.subject.name.length > 30? announcement.subject.name.slice(0, 30) + "...": announcement.subject.name) || 'Unknown'}</span>
        </div>
        <a class="btn-view" href="/user/announcement_details.html?id=${announcement.id}" style="text-decoration: none;" aria-label="View details for the Announcement">
          <i class="far fa-eye"></i> &nbsp; View Announcment Details
        </a>
      </article>
        `
  });

  // Attach event listeners for view buttons
  document.querySelectorAll('.announcement-view-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      if (id) {
        window.location.href = `announcement_details.html?id=${id}`;
      }
    });
  });

  // Attach event listeners for dropdown items
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', async function(e) {
      e.preventDefault();
      const action = this.getAttribute('data-action');
      const card = this.closest('.announcement-card');
      const announcementId = card.getAttribute('data-announcement-id');
      if (!announcementId) {
        // Removed alert per user request
        return;
      }
      if (action === 'view') {
        window.location.href = `announcement_details.html?id=${announcementId}`;
      } else if (action === 'edit') {
        // Directly navigate to edit_announcement.html with id as query param
        window.location.href = `../user/edit_announcement.html?id=${announcementId}`;
      } else if (action === 'delete') {
        // Custom delete confirmation with View option
        const deleteModal = document.createElement('div');
        deleteModal.innerHTML = `
          <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 24px; border-radius: 12px; max-width: 400px; width: 90%; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
              <h5 style="margin: 0 0 16px 0; color: #333; font-weight: 600;">Delete Announcement</h5>
              <p style="margin: 0 0 24px 0; color: #666; font-size: 14px;">Are you sure you want to delete this announcement? This action cannot be undone.</p>
              <div style="display: flex; gap: 12px; justify-content: flex-end;">
                <button id="viewBtn" style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">View Details</button>
                <button id="cancelBtn" style="background: #f8f9fa; color: #6c757d; border: 1px solid #dee2e6; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">Cancel</button>
                <button id="confirmDeleteBtn" style="background: #dc3545; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">Delete</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(deleteModal);

        // Handle modal buttons
        document.getElementById('viewBtn').onclick = function() {
          document.body.removeChild(deleteModal);
          window.location.href = `announcement_details.html?id=${announcementId}`;
        };

        document.getElementById('cancelBtn').onclick = function() {
          document.body.removeChild(deleteModal);
        };

        document.getElementById('confirmDeleteBtn').onclick = async function() {
          document.body.removeChild(deleteModal);

          // Immediately remove the card from DOM for better UX
          const cardElement = card.closest('.col-lg-4');
          if (cardElement) {
            cardElement.style.display = 'none'; // Hide immediately
          }

          try {
            const res = await axios.delete(`${domain}/admin/announcements/${announcementId}`, {
              headers: {
                'Authorization': 'Bearer ' + GetCookie("access_token"),
                'ngrok-skip-browser-warning': 'true'
              }
            });
            if (res.status === 200) {
              showToast('toast-success');
              // Re-fetch announcements to ensure data consistency
              const announcements = await fetchAnnouncements();
              populateAnnouncements(announcements.data || announcements);
            } else {
              showToast('toast-error');
              // If delete failed, show the card again
              if (cardElement) {
                cardElement.style.display = '';
              }
            }
          } catch (err) {
            showToast('toast-error');
            // If delete failed, show the card again
            if (cardElement) {
              cardElement.style.display = '';
            }
          }
        };
      }
    });
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
  const subjects = await fetchEnrolledCourses();
  subjects.map(subject=> 
    document.querySelector("#subject-select .custom-select-dropdown").innerHTML += `
    <div class="custom-select-option" data-id="${subject.id}" onclick="resetSearchInput()">${subject.name}</div>
    `
  )
  // Set up filter listeners
  const searchInput = document.getElementById('searchInput');
  const subjectSelect = new CustomSelect(document.getElementById('subject-select'));
  
  showLoading();

  // Initial load
  let newFilters = {
    query: searchInput.value || '',
    subject_id: subjectSelect.getId() || '',
    page:1,
    limit: 5
  };
  let announcements = await fetchAnnouncements(newFilters);
  populateAnnouncements(announcements.data?.data);
  let filters = announcements.filters;

  hideLoading();

  async function applyFilters() {    
    showLoading();

    newFilters.query = searchInput.value || '';
    newFilters.subject_id = subjectSelect.getId() || '';
    newFilters.page = 1;
    console.log(newFilters);
    
    announcements = await fetchAnnouncements(newFilters);
    
    populateAnnouncements(announcements.data?.data);

    // Hide loading indicator
    hideLoading();
  }

  searchInput.addEventListener('input', applyFilters);
  subjectSelect.selectElement.addEventListener('change', applyFilters);

  const announcementsObserver = new IntersectionObserver(entries=> {
    entries.forEach(async(entry)=> {
      if (entry.isIntersecting) {
        if (announcements.data.data[0] && announcements.data.next) {
          filters.page++;          
          announcements = await fetchAnnouncements(filters);
          populateAnnouncements(announcements.data?.data, false);          
        }
      }
    });
  }, {rootMargin: "300px"});

  // Make sure element exists before observing
  const hiddenElement = document.querySelector(".announcements-hidden");
  if (hiddenElement) {
    announcementsObserver.observe(hiddenElement);
  }
});

function resetSearchInput() {
  document.getElementById('searchInput').value = '';
}