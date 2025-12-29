async function getCourseMap() {
    await IsLoggedIn();
    try {
        const res = await axios.get(`${domain}/user/course-map`, {
        headers: {
            "Authorization": `Bearer ${GetCookie("access_token")}`,
            "ngrok-skip-browser-warning": "true"
        },
        withCredentials: true
        });
        if(Math.floor(res?.status / 100) != 2){
            console.error(res);
            showToast("error", "Error", res?.data?.message || "Failed to load course map", "");
            return null;
        }
        return res.data;  
    } catch (error) {
        showToast("error", "Error", error.response?.data?.message || "Failed to load course map", "");
        return null;
    }
}
let cmap;
async function fetchCmap() {
    try{
        showLoading();
        const res = await getCourseMap();
        cmap = res.data;
        await renderCmap(cmap);
    } catch (error) {
        console.error(error);
        showToast("error", "Error", error?.message || "Failed to fetch course map", "");
        hideLoading();
        return;
    }
}

async function renderCmap(cmap = cmap) {
    const cmapfaculty = document.querySelector(".faculty");
    cmapfaculty.innerHTML = ` Faculty Of ${cmap.roadmap.faculty.name || "New Faculty"}`;

    const cmapcode = document.querySelector(".code");
    cmapcode.innerHTML = `${cmap.roadmap.department.code} ${cmap.roadmap.year.year}`;

    const cmapdep = document.querySelector(".dep");
    cmapdep.innerHTML = `${cmap.roadmap.department.name || "New"} Department`;

    const container = document.querySelector(".courses-container");
    container.innerHTML = "";

    let i = 0;
    for (let y of cmap.roadmap.details.years) {
        const maxTerm = cmap.roadmap.details.terms || 2;
        for (let term = 1; term <= maxTerm; term++) {
            let block = `
        <div class="row gap-3 align-items-center mt-5 shadow rounded courses"
            style="padding: 20px; background-color: #FFFFFF;">
            <div class="d-flex justify-content-between align-items-center p-3 rounded"
                style="background: linear-gradient(180deg, ${getTermColor(term)}, ${getTermColor(term)}); color: white;">
                <h5 class="mb-0 fw-bold" id="level-semester">${y}, Semester ${term}</h5>
            </div>
    `;
            const courses = cmap.courses[i] || [];
            for (let c of courses) {
                for (let s of c) {
                    if (s.term === term) {
                        block += renderCourseCard(s, term);
                    }
                }
            }
            if(courses.length < 1 || !courses.some(t => t.length > 0 && courses.indexOf(t) == term - 1)){
                block += `<p class="text-center my-4" style="color: #888;">No courses available for Semester ${term}.</p>`;
            }
            container.innerHTML += block;
        }
        i++;
    }
    hideLoading();
}

function getTermColor(term) {
    const colors = {
        1: "#520E58",
        2: "#F97316",
        3: "#520E58",
        4: "#F97316"
    };
    return colors[term] || "#7B1684";
}

function renderCourseCard(s, term) {
    return `
<div class="card col-md-3 shadow ${term === 2 ? "pending" : ""}">
    <div class="justify-content-between mb-4">
        <span class="px-3 py-1 rounded-pill fw-medium"
            style="background-color: white; color: ${getTermColor(term)}; font-size: 16px; border-color: ${getTermColor(term)}; border: 1px solid;">
            ${s.course.code || "New Code"}
        </span>
    </div>
    <div class="title justify-content-between">
        ${s.course.name || "New Course"}
        <span class="px-3 py-1 rounded-pill fw-medium"
            style="background-color: #DCFCE7; color: #16A34A; font-size: 14px;">
            Active
        </span>
    </div>
    <div class="info" style="background-color: #F7FEE7;">
        <span><img class="me-1 mb-1" src="../assets/Clip path group (14).svg"> Year </span>
        <span class="year">${s.year || "no year"}</span>
    </div>
    <div class="info">
        <span><img class="me-2 mb-1" src="../assets/iconsax-clock.svg">Credit Hour</span>
        <span class="credithour">${s.course.credits || "no credit hour"}</span>
    </div>
    <div class="info" style="background-color: #ECFEFF;">
        <span><img class="me-2 mb-1" src="../assets/iconsax-ranking-2.svg">Rank</span>
        <span class="rank">${s.rank || "no rank"}</span>
    </div>
</div>
`;
}
document.addEventListener("DOMContentLoaded", async () => {
    await fetchCmap();
});
