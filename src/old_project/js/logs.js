// State management
const state = {
filters: {
query: '',
user_id: '',
type: '',
action: '',
entity: '',
date_from: '',
date_to: ''
},
sort: {
column: '',
direction: 'asc'
},
currentPage: 1,
itemsPerPage: 30,
totalPages: 1,
logs: [],
next: false
};

// DOM elements
const elements = {
searchInput: document.getElementById('searchInput'),
typeFilter: document.getElementById('type_hidden'),
actionFilter: document.getElementById('action_hidden'),
entityFilter: document.getElementById('entity_hidden'),
dateFromFilter: document.getElementById('dateFromFilter'),
dateToFilter: document.getElementById('dateToFilter'),
// activeFilters: document.getElementById('activeFilters'),
tableBody: document.getElementById('tableBody'),
pageInput: document.getElementById('pageInput'),
prevPage: document.getElementById('prevPage'),
nextPage: document.getElementById('nextPage'),
pendingPaginationContainer: document.querySelector('.pending-pagination-container'),
activityLogPage: document.getElementById('activityLogPage'),
};
function initEventListeners() {
elements.searchInput.addEventListener('keyup', debounce(handleSearch, 300));
elements.typeFilter.addEventListener('change', handleFilterChange);
elements.actionFilter.addEventListener('change', handleFilterChange);
elements.entityFilter.addEventListener('change', handleFilterChange);
elements.dateFromFilter.addEventListener('change', handleFilterChange);
elements.dateToFilter.addEventListener('change', handleFilterChange);
elements.prevPage.addEventListener('click', () => changePage(state.currentPage - 1));
elements.nextPage.addEventListener('click', () => changePage(state.currentPage + 1));
}

// Debounce function for search input
function debounce(func, wait) {
let timeout;
return function(...args) {
clearTimeout(timeout);
timeout = setTimeout(() => func.apply(this, args), wait);
};
}

// API call to fetch logs with filters and pagination
async function fetchLogs() {
await IsLoggedIn();
console.log("Fetching logs with filters:", state.filters, "Page:", state.currentPage);
showLoading();
try {
const params = {
query: state.filters.query || null,
user_id: state.filters.user_id || null,
date_from: state.filters.date_from || null,
date_to: state.filters.date_to || null,
type: state.filters.type || null,
action: state.filters.action || null,
entity: state.filters.entity || null,
page: state.currentPage,
limit: state.itemsPerPage
};

const response = await axios.get(`${domain}/admin/logs`, {
params: params,
headers: {
"Authorization": `Bearer ${GetCookie("access_token")}`,
"ngrok-skip-browser-warning": "true"
},
withCredentials: true
});

if (response.data.status == "success") {
// Handle different response structures
let logs = [];
let totalPages = 1;
logs = response.data.data;
state.next = response.data.next || false;
state.logs = logs;
console.log(`Fetched ${logs.length} logs`, logs);
renderLogs();
} else {
showToast("error", "Error", response.data.message || "Failed to fetch logs", "");
}
} catch (error) {
showToast("error", "Error", error.response?.data?.message || "Error fetching logs", "");
} finally {
hideLoading();
}
}

// Render logs in the table
function renderLogs() {
console.log("Rendering logs:", state.logs);

if (!elements.tableBody) {
console.error("Table body element not found!");
return;
}

elements.tableBody.innerHTML = '';

if (!state.logs || !state.logs.length) {
console.log("No logs to display");
elements.tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-4">No logs found.</td></tr>`;
return;
}

console.log(`Rendering ${state.logs.length} logs`);

state.logs.forEach((log, index) => {
console.log(`Rendering log ${index}:`, log);

// Handle different field names that might come from API
const logId = log.id || log.log_id || index + 1;
const logDate = log.created_at?.split(' ')[0]?.split('-')[2] + '/' + log.created_at?.split(' ')[0]?.split('-')[1] + '/' + log.created_at?.split(' ')[0]?.split('-')[0] || log.timestamp || new Date().toISOString();
const userName = log.user?.name || '';
const logType = log.type || log.level || 'Info';
const logAction = log.action || log.activity || '';
const logEntity = log.entity || log.target || '';
const logCode = log.response_code || log.status_code || 200;
const logRoute = log.route || log.endpoint || '';
const row = document.createElement('tr');
row.classList.add('table-row');
try {
row.innerHTML = `
               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${logId}</td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(logDate).toLocaleDateString()}</td>
               <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${userName}</td>
               <td class="px-6 py-4 whitespace-nowrap text-sm">
                   <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full type-${logType.toLowerCase()}">${logType}</span>
               </td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${logAction}</td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${logEntity}</td>
               <td class="px-6 py-4 whitespace-nowrap text-sm">
                   <span class="px-2 py-1 text-xs rounded-full code-${getCodeColor(logCode)}">${logCode}</span>
               </td>
               <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${logRoute}</td>
               <td class="whitespace-nowrap text-sm font-medium">
                   <a class="view-button font-medium" data-id="${logId}" href="/admin/log_details.html?id=${logId}">
                    <i class="fa fa-eye"></i>
                   </a>
               </td>
           `;
elements.tableBody.appendChild(row);
} catch (error) {
console.error("Error rendering log row:", error, log);
}
});
elements.nextPage.disabled = !state.next;
elements.nextPage.classList.toggle('disabled', !state.next);
elements.prevPage.disabled = state.currentPage < 2;
elements.prevPage.classList.toggle('disabled', state.currentPage < 2);
console.log("Finished rendering logs");
}

// Helper to get color class for code
function getCodeColor(code) {
if (code >= 200 && code < 300) return 'green';
if (code >= 400 && code < 500) return 'red';
if (code >= 500) return 'darkred';
return 'gray';
}

// Update pagination info display

// Handle search input
function handleSearch() {
state.filters.query = elements.searchInput.value.trim();
state.currentPage = 1;
fetchLogs();
}

function handleFilterChange() {
    console.log("Filter changed");
state.filters.date_from = elements.dateFromFilter.value || null;
state.filters.date_to = elements.dateToFilter.value || null;
state.filters.type = elements.typeFilter.value || null;
state.filters.action = elements.actionFilter.value || null;
state.filters.entity = elements.entityFilter.value || null;
state.currentPage = 1;
fetchLogs();
// updateActiveFilters();
}

// Update active filters display
// function updateActiveFilters() {
// elements.activeFilters.innerHTML = '';

// Object.entries(state.filters).forEach(([key, value]) => {
// if (value) {
// const filterName = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
// const filterBadge = document.createElement('div');
// filterBadge.className = 'filter-badge';
// filterBadge.innerHTML = `
//                ${filterName}: ${value}
//                <span class="close" data-filter="${key}">×</span>
//            `;
// elements.activeFilters.appendChild(filterBadge);

// filterBadge.querySelector('.close').addEventListener('click', () => {
// removeFilter(key);
// });
// }
// });
// }

// Remove individual filter
function removeFilter(filterKey) {
state.filters[filterKey] = '';
switch(filterKey) {
case 'type':
elements.typeFilter.value = '';
break;
case 'action':
elements.actionFilter.value = '';
break;
case 'date_from':
case 'date_to':
elements.dateFilter.value = '';
break;
case 'query':
elements.searchInput.value = '';
break;
}
// updateActiveFilters();
fetchLogs();
}

// Clear all filters
function clearAllFilters() {
state.filters = {
query: '',
user_id: '',
type: '',
action: '',
entity: '',
date_from: '',
date_to: ''
};
elements.searchInput.value = '';
elements.typeFilter.value = '';
elements.actionFilter.value = '';
elements.dateFilter.value = '';
// updateActiveFilters();
fetchLogs();
showToast('All filters cleared');
}

/*
// Handle sort
function handleSort(column) {
   if (state.sort.column === column) {
       state.sort.direction = state.sort.direction === 'asc' ? 'desc' : 'asc';
   } else {
       state.sort.column = column;
       state.sort.direction = 'asc';
   }
   // Sorting is not implemented server-side, so just show toast
   showToast(`Sorting by ${column} (${state.sort.direction}) - server-side sorting not implemented`);
}
*/

// Pagination handlers
function handlePageChange() {
const page = parseInt(elements.pageInput.textContent);
if (page >= 1 && page <= state.totalPages) {
changePage(page);
} else {
elements.pageInput.textContent = state.currentPage;
}
}

async function changePage(page) {
if (page < 1 || page > state.currentPage && !state.next) return;
state.currentPage = page;
elements.pageInput.textContent = page;
await fetchLogs();
}

// Fetch and populate dynamic filters from logs actions and entities APIs
async function populateDynamicFilters() {
await IsLoggedIn();
showLoading();
try {
// Fetch actions
const actionsResponse = await axios.get(`${domain}/admin/logs/actions`, {
headers: {
"Authorization": `Bearer ${GetCookie("access_token")}`,
"ngrok-skip-browser-warning": "true"
},
withCredentials: true
});

let actions = [];
if (actionsResponse.data.status == "success") {
actions = actionsResponse.data.data || actionsResponse.data || [];
if (!Array.isArray(actions)) actions = [];
console.log("Fetched actions:", actions);
}

// Fetch entities
const entitiesResponse = await axios.get(`${domain}/admin/logs/entities`, {
headers: {
"Authorization": `Bearer ${GetCookie("access_token")}`,
"ngrok-skip-browser-warning": "true"
},
withCredentials: true
});

const facultiesResponse = await axios.get(`${domain}/admin/search-faculties`, {
headers: {
"Authorization": `Bearer ${GetCookie("access_token")}`,
"ngrok-skip-browser-warning": "true"
},
withCredentials: true
});
let faculties = [];
if (facultiesResponse.data.status == "success") {
faculties = facultiesResponse.data.data || facultiesResponse.data || [];
if (!Array.isArray(faculties)) faculties = [];
}
let entities = [];
if (entitiesResponse.data.status == "success") {
entities = entitiesResponse.data.data || entitiesResponse.data || [];
if (!Array.isArray(entities)) entities = [];
}

// Populate action filter
const actionFilter = document.getElementById('customActionDropdown');
actionFilter.innerHTML = '<li class="active" data-value="">All Actions</li>';
actions.forEach(action => {
const option = document.createElement('li');
option.setAttribute('data-value', action);
option.textContent = action;
actionFilter.appendChild(option);
});

// Populate entity filter
const entityFilter = document.getElementById('customEntityDropdown');
entityFilter.innerHTML = '<li class="active" data-value="">All Entities</li>';
entities.forEach(entity => {
const option = document.createElement('li');
option.setAttribute('data-value', entity);
option.textContent = entity;
entityFilter.appendChild(option);
});


console.log("Populated filters with actions:", actions, "and entities:", entities);


} catch (error) {
showToast("error", "Error", error.response?.data?.message || "Failed to fetch filter options", "");
} finally {
hideLoading();
}
}

async function fetchLogDetails(logId) {
await IsLoggedIn();
if (!logId) {
    window.location.href = '/admin/logs.html';
    SetCookie("error", "No log ID provided", 1);
    return false;
}
showLoading();
try {
const response = await axios.get(`${domain}/admin/logs/${logId}`, {
headers: {
"Authorization": `Bearer ${GetCookie("access_token")}`,
"ngrok-skip-browser-warning": "true"
},
withCredentials: true
});
if (response.data.status == "success") {
const log = response.data.data;
if (!log) {
    window.location.href = '/admin/logs.html';
    SetCookie("error", "Log not found", 1);
    hideLoading();
    return false;
}
renderLogDetails(log);
hideLoading();
return true;
} else {
window.location.href = '/admin/logs.html';
SetCookie("error", response.data.message || "Failed to fetch log details", 1);
hideLoading();
return false;
}
} catch (error) {
window.location.href = '/admin/logs.html';
SetCookie("error", error.response?.data?.message || "Error fetching log details", 1);
hideLoading();
} finally {
    hideLoading();
}
}
function renderLogDetails(log) {
    if(!log) return;
    try{
        console.log("Rendering log details:", log);
document.getElementById('log_id_value').textContent = log.id || '';
    document.getElementById('log_date_value').textContent = log.created_at?.split(' ')[0]?.split('-')[2] + '-' + (log.created_at?.split(' ')[0]?.split('-')[1] || '') + '-' + (log.created_at?.split(' ')[0]?.split('-')[0] || '') + 'T' + log.created_at?.split(' ')[1] + '';
    document.getElementById('log_date_value').textContent = new Date(document.getElementById('log_date_value').textContent).toLocaleDateString();
    document.getElementById('log_type_value').textContent = capitalize(log.level) || '';
    document.getElementById('log_action_value').textContent = log.action || '';
    document.getElementById('log_entity_value').textContent = log.entity || '';
    document.getElementById('log_code_value').textContent = log.response_code || '';
    document.getElementById('log_route_value').textContent = log.route || '';
    document.getElementById('log_message_value').textContent = log.message || 'No message';
    document.getElementById('log_details_value').innerHTML = `
    <andypf-json-viewer 
                        indent="4"
                        expanded="2"
                        theme="classic-light"
                        show-data-types="false"
                        show-toolbar="false"
                        expand-icon-type="square"
                        show-copy="false"
                        show-size="true"
                        data='${JSON.stringify(log.details || {}, null, 2).replaceAll("'", "\"")}'>
                    </andypf-json-viewer>
                    `;
    if(log.user){
        document.getElementById('user_avatar_value').src = log.user?.details?.avatar ?? log.user?.google_avatar ?? '../assets/images/default_avatar.png';
        document.getElementById('user_name_value').textContent = capitalize(log.user?.name) || 'Unknown User';
        document.getElementById('user_email_value').textContent = log.user?.email || 'No email';
        document.getElementById('user_role_value').textContent = capitalize(log.user?.role?.name) || 'No role';
        document.getElementById('user_faculty_value').textContent = capitalize(log.user?.faculty?.name) || 'No faculty';
        document.getElementById('user_department_value').textContent = capitalize(log.user?.department?.name) || 'No department';
        document.getElementById('user_year_value').textContent = capitalize(log.user?.year?.year) || 'No year';
        document.getElementById('user_phone_value').textContent = log.user?.phone || 'No phone';
        document.getElementById('user_joined_value').textContent = log.user?.created_at.split(' ')[0]?.split('-')[2] + '-' + (log.user?.created_at.split(' ')[0]?.split('-')[1] || '') + '-' + (log.user?.created_at.split(' ')[0]?.split('-')[0] || '') + 'T' + log.user?.created_at.split(' ')[1] + '';
        document.getElementById('user_joined_value').textContent = new Date(document.getElementById('user_joined_value').textContent).toLocaleDateString();
    }else{
        document.querySelector(".user-info-card").style.display = 'none';
    }
    } catch(error){
        console.error("Error rendering log details:", error, log);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    if(window.location.pathname.includes('log_details.html')) {
        if(!(await fetchLogDetails(GetParams('id')))){
            window.location.href = '/admin/logs.html';
        }
        return;
    }

// Check if required elements exist
if (!elements.tableBody) {
console.error("Required element 'tableBody' not found!");
return;
}

await populateDynamicFilters();
await fetchLogs();
initEventListeners();
// updateActiveFilters();
// showToast('Activity log loaded successfully');
});