// Mock Backend Data for Video Search Results
const mockSearchResults = [
  {
    id: 1,
    time: "04:18:19 PM",
    date: "2025-04-27",
    camera: "Camera 01",
    event: "Suspicious Vehicle Activity",
    object: "Vehicle"
  },
  {
    id: 2,
    time: "03:21:05 PM",
    date: "2025-04-27",
    camera: "Camera 03",
    event: "Person in Restricted Area",
    object: "Person"
  },
  {
    id: 3,
    time: "01:17:14 AM",
    date: "2025-04-27",
    camera: "Camera 02",
    event: "Vehicle Loitering",
    object: "Vehicle"
  },
  {
    id: 4,
    time: "12:01:34 AM",
    date: "2025-04-27",
    camera: "Camera 04",
    event: "Multiple People Gathering",
    object: "Person"
  }
];

// DOM Elements
const resultsListContainer = document.getElementById("results-list-container");
const resultsCountTitle = document.getElementById("results-count-title");
const playerTimestamp = document.getElementById("player-timestamp");
const cameraTitleOverlay = document.getElementById("camera-title-overlay");
const jumpTimeInput = document.getElementById("jump-time-input");
const btnJumpGo = document.getElementById("btn-jump-go");
const btnVideoSearch = document.getElementById("btn-video-search");

// Filter Controls
const searchDate = document.getElementById("search-date");
const searchCamera = document.getElementById("search-camera");
const searchOrder = document.getElementById("search-object");

let activeResultId = 1;

// Initialize Frame
document.addEventListener("DOMContentLoaded", () => {
  renderResults(mockSearchResults);
  selectResult(1);
});

// Render Results List
function renderResults(results) {
  resultsListContainer.innerHTML = "";
  resultsCountTitle.innerText = `Search Results (${results.length})`;

  if (results.length === 0) {
    resultsListContainer.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 1.5rem;">No matching footage found.</div>`;
    return;
  }

  results.forEach((item) => {
    const card = document.createElement("div");
    card.className = `result-item ${item.id === activeResultId ? "active" : ""}`;
    card.onclick = () => selectResult(item.id);

    card.innerHTML = `
      <div class="result-thumb-box">
        <i class="fa-solid fa-video"></i>
        <span>${item.camera}</span>
      </div>
      <div class="result-info">
        <span class="result-time">${item.time}</span>
        <span class="result-camera">${item.camera}</span>
        <span class="result-event">${item.event}</span>
      </div>
    `;
    resultsListContainer.appendChild(card);
  });
}

// Select a Video Result Card
function selectResult(id) {
  activeResultId = id;
  const selected = mockSearchResults.find((r) => r.id === id);

  if (!selected) return;

  // Re-render list active state
  renderResults(mockSearchResults);

  // Update Player View Header & Overlay
  playerTimestamp.innerText = `${selected.date} ${selected.time}`;
  if (cameraTitleOverlay) {
    cameraTitleOverlay.innerText = `${selected.camera} - Live CCTV Feed`;
  }
  jumpTimeInput.value = selected.time;
}

// Jump to Time Button Action
btnJumpGo.addEventListener("click", () => {
  const targetTime = jumpTimeInput.value;
  if (targetTime) {
    const currentDate = searchDate.value || "2025-04-27";
    playerTimestamp.innerText = `${currentDate} ${targetTime}`;
  }
});

// Search Filter Trigger
btnVideoSearch.addEventListener("click", () => {
  const selectedCamera = searchCamera.value;
  const selectedObject = searchOrder.value;

  const filtered = mockSearchResults.filter((item) => {
    const matchCam = selectedCamera === "ALL" || item.camera === selectedCamera;
    const matchObj = selectedObject === "ALL" || item.object === selectedObject;
    return matchCam && matchObj;
  });

  renderResults(filtered);
  if (filtered.length > 0) {
    selectResult(filtered[0].id);
  }
});