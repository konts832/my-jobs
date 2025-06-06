const API_URL = "https://data.cityofnewyork.us/resource/kpav-sd4t.json?$limit=2000";
let jobs = [];

async function fetchJobs() {
  try {
    const res = await fetch(API_URL);
    jobs = await res.json();
    console.log("Jobs fetched:", jobs.length);
    renderJobs(jobs);
    populateAgencies(jobs);
  } catch (err) {
    console.error("Failed to fetch jobs:", err);
  }
}

function populateAgencies(data) {
  const agencySet = new Set(data.map(job => job.agency).filter(Boolean));
  const agencySelect = document.getElementById("agency-filter");
  agencySet.forEach(agency => {
    const option = document.createElement("option");
    option.value = agency;
    option.textContent = agency;
    agencySelect.appendChild(option);
  });
}

function renderJobs(data) {
  const list = document.getElementById("job-list");
  list.innerHTML = "";

  const grouped = data.reduce((acc, job) => {
    const dateKey = job.posting_date ? new Date(job.posting_date).toLocaleDateString() : "Unknown Date";
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(job);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => {
    const aDate = new Date(a);
    const bDate = new Date(b);
    return bDate - aDate;
  });

  sortedDates.forEach(date => {
    const header = document.createElement("h2");
    header.textContent = date;
    list.appendChild(header);

    grouped[date].forEach(job => {
      const li = document.createElement("li");
      const jobLink = job.job_id ? `https://cityjobs.nyc.gov/job/${job.job_id}` : "#";
      li.innerHTML = `
        <a href="${jobLink}" target="_blank"><strong>${job.civil_service_title || "Untitled"}</strong></a><br/>
        <em>${job.agency || "Unknown Agency"}</em><br/>
        <ul>
          <li><strong>Job ID:</strong> ${job.job_id || "N/A"}</li>
          <li><strong>Title Code:</strong> ${job.title_code_no || "N/A"}</li>
          <li><strong>Title Classification:</strong> ${job.title_classification || "N/A"}</li>
          <li><strong>Experience Level:</strong> ${job.level || "N/A"}</li>
          <li><strong>Work Location:</strong> ${job.work_location || "N/A"}</li>
        </ul>
      `;
      list.appendChild(li);
    });
  });
}

function filterJobs() {
  const query = document.getElementById("search").value.toLowerCase();
  const agencyFilter = document.getElementById("agency-filter").value;

  const filtered = jobs.filter(job => {
    const matchesQuery =
      (job.civil_service_title || "").toLowerCase().includes(query) ||
      (job.agency || "").toLowerCase().includes(query);
    const matchesAgency = !agencyFilter || job.agency === agencyFilter;
    return matchesQuery && matchesAgency;
  });

  renderJobs(filtered);
}

document.getElementById("search").addEventListener("input", filterJobs);
document.getElementById("agency-filter").addEventListener("change", filterJobs);

fetchJobs();
