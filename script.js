const API_URL = "https://data.cityofnewyork.us/resource/kpav-sd4t.json?$limit=2000";
let jobs = [];

async function fetchJobs() {
  const res = await fetch(API_URL);
  jobs = await res.json();
  renderJobs(jobs);
}

function renderJobs(data) {
  const list = document.getElementById("job-list");
  list.innerHTML = "";

  data.forEach(job => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${job.civil_service_title}</strong><br/>
      <em>${job.agency}</em><br/>
      Posted: ${job.posting_date ? new Date(job.posting_date).toLocaleDateString() : "N/A"}
    `;
    list.appendChild(li);
  });
}

function filterJobs() {
  const query = document.getElementById("search").value.toLowerCase();
  const sortBy = document.getElementById("sort").value;

  let filtered = jobs.filter(job => {
    return (
      job.civil_service_title?.toLowerCase().includes(query) ||
      job.agency?.toLowerCase().includes(query)
    );
  });

  filtered.sort((a, b) => {
    if (sortBy === "posting_date") {
      return new Date(b.posting_date) - new Date(a.posting_date);
    }
    return (a[sortBy] || "").localeCompare(b[sortBy] || "");
  });

  renderJobs(filtered);
}

document.getElementById("search").addEventListener("input", filterJobs);
document.getElementById("sort").addEventListener("change", filterJobs);

fetchJobs();
