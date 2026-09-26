/* =========================================================
   video-search.js
========================================================= */

/* ---------------------------------------------------------
   MOCK BACKEND DATA
--------------------------------------------------------- */
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

let activeResultId = 1;
let isPlaying = false;
let playbackSeconds = 258;          // starting playhead: 04:18
const TOTAL_SECONDS = 600;          // 10:00 mock clip length
let playbackTimer = null;

/* =========================================================
   BOOT
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  renderResults(mockSearchResults);
  attachStaticListeners();
  attachDelegatedListeners();
  syncPlayerForResult(activeResultId);
});

/* =========================================================
   HELPERS
========================================================= */
function timeToMinutes(timeStr) {
  const [time, ampm] = timeStr.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
}
// Does the item's time fall between the user's start and end (inclusive)?
function matchesTimeRange(itemTime, fromHHMM, toHHMM) {
  if (!fromHHMM && !toHHMM) return true;         // no bounds set
  const itemMin = timeToMinutes(itemTime);
  const fromMin = fromHHMM ? hhmmToMinutes(fromHHMM) : 0;
  const toMin   = toHHMM   ? hhmmToMinutes(toHHMM)   : 23 * 60 + 59;

  // Normal range (e.g. 09:00 → 17:00)
  if (fromMin <= toMin) return itemMin >= fromMin && itemMin <= toMin;

  // Wrapped range (e.g. 22:00 → 06:00, crossing midnight)
  return itemMin >= fromMin || itemMin <= toMin;
}

// "14:05" → 845
function hhmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatSeconds(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

/* =========================================================
   RENDER RESULTS LIST
========================================================= */
function renderResults(results) {
  const resultsListContainer = document.getElementById("results-list-container");
  const resultsCountTitle    = document.getElementById("results-count-title");

  if (!resultsListContainer || !resultsCountTitle) {
    console.error("renderResults: missing #results-list-container or #results-count-title.");
    return;
  }

  resultsListContainer.innerHTML = "";
  resultsCountTitle.innerText = `Search Results (${results.length})`;

  if (results.length === 0) {
    resultsListContainer.innerHTML = `
      <div style="color:#ffffff; padding:20px; text-align:center;">
        No matching footage found.
      </div>`;
    return;
  }

  results.forEach((item) => {
    const card = document.createElement("div");
    card.className = "result-item" + (item.id === activeResultId ? " active" : "");
    card.dataset.resultId = item.id;

    card.innerHTML = `
      <div class="result-thumb-box">
        <i class="fa-solid fa-video"></i>
        <span>${item.camera}</span>
      </div>
      <div class="result-info">
        <span class="result-time">${item.time}</span>
        <span class="result-camera">${item.camera}</span>
        <span class="result-event">${item.event}</span>
      </div>`;

    resultsListContainer.appendChild(card);
  });
}

/* =========================================================
   SELECT A RESULT
========================================================= */
function selectResult(id) {
  activeResultId = id;
  const selected = mockSearchResults.find(r => r.id === id);
  if (!selected) return;

  // Re-render so active highlight moves
  const stillVisible = Array.from(
    document.querySelectorAll("#results-list-container .result-item")
  ).map(el => parseInt(el.dataset.resultId, 10));

  if (stillVisible.includes(id)) {
    document.querySelectorAll("#results-list-container .result-item")
      .forEach(el => el.classList.toggle("active", parseInt(el.dataset.resultId, 10) === id));
  } else {
    renderResults(mockSearchResults);
  }

  syncPlayerForResult(id);
}

function syncPlayerForResult(id) {
  const item = mockSearchResults.find(r => r.id === id);
  if (!item) return;

  const playerTimestamp   = document.getElementById("player-timestamp");
  const cameraTitleOverlay = document.getElementById("camera-title-overlay");
  const jumpTimeInput     = document.getElementById("jump-time-input");

  if (playerTimestamp)    playerTimestamp.innerText    = `${item.date} ${item.time}`;
  if (cameraTitleOverlay) cameraTitleOverlay.innerText = `${item.camera} - Live CCTV Feed`;
  if (jumpTimeInput)      jumpTimeInput.value          = item.time;

  // Sync playhead roughly to the result's time-of-day
  const minutes = timeToMinutes(item.time);
  playbackSeconds = Math.round((minutes / (24 * 60)) * TOTAL_SECONDS);
  updateProgressUI();
}

/* =========================================================
   STATIC LISTENERS — filter bar, search, jump-to-time,
   player controls
========================================================= */
function attachStaticListeners() {
  const btnJumpGo       = document.getElementById("btn-jump-go");
  const btnVideoSearch  = document.getElementById("btn-video-search");
  const jumpTimeInput   = document.getElementById("jump-time-input");
  const searchDate      = document.getElementById("search-date");
  const searchTimeFrom  = document.getElementById("search-time-from");
  const searchTimeTo    = document.getElementById("search-time-to");
  const searchCamera    = document.getElementById("search-camera");
  const searchObject    = document.getElementById("search-object");

  /* ---------------- SEARCH BUTTON ---------------- */
  if (btnVideoSearch) {
    btnVideoSearch.addEventListener("click", () => {
      const selectedDate      = searchDate   ? searchDate.value        : "";
      const selectedTimeFrom  = searchTimeFrom ? searchTimeFrom.value : "";
      const selectedTimeTo    = searchTimeTo   ? searchTimeTo.value   : "";
      const selectedCamera    = searchCamera ? searchCamera.value      : "ALL";
      const selectedObject    = searchObject ? searchObject.value      : "ALL";

      const filtered = mockSearchResults.filter(item => {
        const matchDate  = !selectedDate || item.date === selectedDate;
        const matchTime  = matchesTimeRange(item.time, selectedTimeFrom, selectedTimeTo);
        const matchCam   = selectedCamera === "ALL" || item.camera === selectedCamera;
        const matchObj   = selectedObject === "ALL" || item.object === selectedObject;
        return matchDate && matchTime && matchCam && matchObj;
      });

      renderResults(filtered);

      if (filtered.length > 0) {
        activeResultId = filtered[0].id;
        selectResult(filtered[0].id);
      } else {
        // Clear player visuals
        const playerTimestamp = document.getElementById("player-timestamp");
        if (playerTimestamp) playerTimestamp.innerText = "No results";
      }
    });
  } else {
    console.error("attachStaticListeners: #btn-video-search not found.");
  }

  /* ---------------- JUMP TO TIME ---------------- */
  if (btnJumpGo) {
    btnJumpGo.addEventListener("click", () => {
      const targetTime = jumpTimeInput ? jumpTimeInput.value.trim() : "";
      const playerTimestamp = document.getElementById("player-timestamp");
      if (!targetTime || !playerTimestamp) return;

      // Accept "HH:MM" or "HH:MM:SS"
      const match = targetTime.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
      if (!match) {
        playerTimestamp.innerText = "Invalid time format";
        return;
      }

      let hh = parseInt(match[1], 10);
      const mm = parseInt(match[2], 10);
      const ss = match[3] ? parseInt(match[3], 10) : 0;

      if (hh < 0 || hh > 23 || mm < 0 || mm > 59 || ss < 0 || ss > 59) {
        playerTimestamp.innerText = "Invalid time value";
        return;
      }

      // 24h -> 12h am/pm for display
      const ampm = hh >= 12 ? "PM" : "AM";
      let h12 = hh % 12; if (h12 === 0) h12 = 12;
      const pretty =
        String(h12).padStart(2, "0") + ":" +
        String(mm).padStart(2, "0") + ":" +
        String(ss).padStart(2, "0") + " " + ampm;

      const currentDate = (searchDate && searchDate.value) || "2025-04-27";
      playerTimestamp.innerText = `${currentDate} ${pretty}`;

      // Move the progress bar to roughly the matching position
      const minutesOfDay = hh * 60 + mm;
      playbackSeconds = Math.round((minutesOfDay / (24 * 60)) * TOTAL_SECONDS);
      updateProgressUI();
    });
  } else {
    console.error("attachStaticListeners: #btn-jump-go not found.");
  }

  /* ---------------- PLAYER CONTROLS ---------------- */
  const btnPlayPause  = document.getElementById("btn-play-pause");
  const ctrlButtons   = document.querySelectorAll(".player-controls .control-btn");

  // Second control button acts as a dedicated pause button
  const btnPauseOnly  = ctrlButtons[1] || null;

  if (btnPlayPause) {
    btnPlayPause.addEventListener("click", togglePlayPause);
  }
  if (btnPauseOnly) {
    btnPauseOnly.addEventListener("click", () => {
      if (isPlaying) togglePlayPause();
    });
  }

  // Volume button (3rd control) — cycles a small volume label
  const btnVolume = ctrlButtons[2] || null;
  if (btnVolume) {
    btnVolume.addEventListener("click", () => {
      const icon = btnVolume.querySelector("i");
      if (!icon) return;
      const muted = icon.classList.contains("fa-volume-xmark");
      icon.classList.toggle("fa-volume-high", muted);
      icon.classList.toggle("fa-volume-xmark", !muted);
    });
  }

  // Download button (4th control) — writes a small text log
  const btnDownload = ctrlButtons[3] || null;
  if (btnDownload) {
    btnDownload.addEventListener("click", () => {
      const item = mockSearchResults.find(r => r.id === activeResultId) || {};
      const text =
        `SENTRA Video Export Log\n` +
        `Date: ${item.date || ""}\n` +
        `Time: ${item.time || ""}\n` +
        `Camera: ${item.camera || ""}\n` +
        `Event: ${item.event || ""}\n` +
        `Object: ${item.object || ""}\n`;
      const blob = new Blob([text], { type: "text/plain" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href = url;
      a.download = `sentra-export-${item.camera || "clip"}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // Fullscreen (5th control) and player-header expand
  const btnFullscreenCtrl = ctrlButtons[4] || null;
  const btnFullscreenHead = document.querySelector(".player-actions .icon-btn");

  [btnFullscreenCtrl, btnFullscreenHead].forEach(btn => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      const display = document.querySelector(".video-display");
      if (!display) return;
      if (!document.fullscreenElement) {
        if (display.requestFullscreen) display.requestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    });
  });

  // Progress bar click-to-seek
  const progressContainer = document.querySelector(".progress-bar-container");
  if (progressContainer) {
    progressContainer.addEventListener("click", (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
      playbackSeconds = Math.round(ratio * TOTAL_SECONDS);
      updateProgressUI();
    });
  }
}

/* =========================================================
   DELEGATED LISTENERS — resilient to re-renders
========================================================= */
function attachDelegatedListeners() {
  // Click delegation on the results list container
  document.addEventListener("click", (e) => {
    const card = e.target.closest("#results-list-container .result-item");
    if (!card) return;
    const id = parseInt(card.dataset.resultId, 10);
    if (!isNaN(id)) selectResult(id);
  });
}

/* =========================================================
   PLAYER STATE
========================================================= */
function togglePlayPause() {
  isPlaying = !isPlaying;

  const btnPlayPause = document.getElementById("btn-play-pause");
  if (btnPlayPause) {
    const icon = btnPlayPause.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-play", !isPlaying);
      icon.classList.toggle("fa-pause", isPlaying);
    }
  }

  if (isPlaying) {
    playbackTimer = setInterval(() => {
      playbackSeconds = (playbackSeconds + 1) % TOTAL_SECONDS;
      updateProgressUI();
    }, 1000);
  } else if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
}

function updateProgressUI() {
  const fill       = document.getElementById("progress-fill");
  const timeDisplay = document.getElementById("time-display-label");

  const ratio = playbackSeconds / TOTAL_SECONDS;

  if (fill) fill.style.width = (ratio * 100).toFixed(2) + "%";

  if (timeDisplay) {
    timeDisplay.innerText = `${formatSeconds(playbackSeconds)} / ${formatSeconds(TOTAL_SECONDS)}`;
  }
}