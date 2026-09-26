/* =========================================================
   dashboard.js
   Logic for dashboard.html:
   - builds the 7-day bar chart from plain data (no chart library)
   - keeps the top-bar date/time display live
   - toggles play/pause, syncs video player, mute, playback speed, and fullscreen
   - row selection & interactive modal for Recent Events table
   - live functional navigation for Quick Action buttons
======================================== */

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Sample data for the Event Activity chart ---
  const days = ["Apr 21", "Apr 22", "Apr 23", "Apr 24", "Apr 25", "Apr 26", "Apr 27"];
  const totalEvents = [30, 26, 42, 44, 58, 64, 55];
  const relevantEvents = [18, 12, 24, 26, 30, 42, 48];
  const maxValue = 80; // matches the 0–80 axis in the design

  const chartEl = document.getElementById("barChart");
  if (chartEl) {
    chartEl.innerHTML = ""; // Clear existing content
    days.forEach((day, i) => {
      const group = document.createElement("div");
      group.className = "bar-group";

      const totalBar = document.createElement("div");
      totalBar.className = "bar bar-total";
      totalBar.style.height = `${(totalEvents[i] / maxValue) * 100}%`;
      totalBar.title = `${day} - Total Events: ${totalEvents[i]}`;

      const relevantBar = document.createElement("div");
      relevantBar.className = "bar bar-relevant";
      relevantBar.style.height = `${(relevantEvents[i] / maxValue) * 100}%`;
      relevantBar.title = `${day} - Relevant Events: ${relevantEvents[i]}`;

      group.appendChild(totalBar);
      group.appendChild(relevantBar);
      chartEl.appendChild(group);
    });

    const labelsRow = document.createElement("div");
    labelsRow.className = "bar-labels";
    days.forEach((day) => {
      const label = document.createElement("span");
      label.textContent = day;
      labelsRow.appendChild(label);
    });
    chartEl.after(labelsRow);
  }

  // --- 2. Live date/time in the page heading ---
  const dateEl = document.getElementById("currentDate");
  const timeEl = document.getElementById("currentTime");

  function updateClock() {
    const now = new Date();
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    }
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    }
  }

  updateClock();
  setInterval(updateClock, 1000);

  // --- 3. CCTV Feed Controls (Video Player Integration) ---
  const video = document.getElementById("cctvVideo");
  const feedPlayBtn = document.getElementById("feedPlayBtn") || document.querySelector(".feed-control-btn");
  const feedTimeEl = document.querySelector(".feed-time");
  const progressFill = document.querySelector(".feed-progress-fill");
  const progressBar = document.querySelector(".feed-progress");
  
  // Locate control icons
  const controlIcons = document.querySelectorAll(".feed-controls .feed-control-icon");
  let volumeBtn = null;
  let speedBtn = null;
  let fullscreenBtn = null;

  controlIcons.forEach((el) => {
    if (el.querySelector(".fa-volume-high") || el.querySelector(".fa-volume-xmark")) {
      volumeBtn = el;
    } else if (el.textContent.includes("1x") || el.textContent.includes("x")) {
      speedBtn = el;
    } else if (el.querySelector(".fa-expand")) {
      fullscreenBtn = el;
    }
  });

  // Play / Pause Toggle
  if (feedPlayBtn && video) {
    feedPlayBtn.addEventListener("click", () => {
      if (video.paused) {
        video.play().catch((err) => console.log("Video play error:", err));
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", () => {
      const icon = feedPlayBtn.querySelector("i");
      if (icon) {
        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");
      }
    });

    video.addEventListener("pause", () => {
      const icon = feedPlayBtn.querySelector("i");
      if (icon) {
        icon.classList.remove("fa-pause");
        icon.classList.add("fa-play");
      }
    });
  }

  // Update Time Display and Progress Bar
  function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  if (video) {
    video.addEventListener("timeupdate", () => {
      if (feedTimeEl) {
        const current = formatTime(video.currentTime);
        const total = formatTime(video.duration || 0);
        feedTimeEl.textContent = `${current} / ${total}`;
      }
      if (progressFill && video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        progressFill.style.width = `${percent}%`;
      }
    });

    // Seekable progress bar
    if (progressBar) {
      progressBar.style.cursor = "pointer";
      progressBar.addEventListener("click", (e) => {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        if (video.duration) {
          video.currentTime = pos * video.duration;
        }
      });
    }
  }

  // Mute / Unmute Toggle
  if (volumeBtn && video) {
    volumeBtn.style.cursor = "pointer";
    volumeBtn.addEventListener("click", () => {
      video.muted = !video.muted;
      const icon = volumeBtn.querySelector("i");
      if (icon) {
        if (video.muted) {
          icon.className = "fa-solid fa-volume-xmark feed-control-icon";
        } else {
          icon.className = "fa-solid fa-volume-high feed-control-icon";
        }
      }
    });
  }

  // Playback Speed Toggle (1x -> 1.5x -> 2x -> 0.5x -> 1x)
  if (speedBtn && video) {
    const speeds = [1, 1.5, 2, 0.5];
    let currentSpeedIdx = 0;
    speedBtn.style.cursor = "pointer";
    speedBtn.addEventListener("click", () => {
      currentSpeedIdx = (currentSpeedIdx + 1) % speeds.length;
      const speed = speeds[currentSpeedIdx];
      video.playbackRate = speed;
      speedBtn.textContent = `${speed}x`;
    });
  }

  // Fullscreen Toggle
  if (fullscreenBtn) {
    fullscreenBtn.style.cursor = "pointer";
    fullscreenBtn.addEventListener("click", () => {
      const container = document.querySelector(".feed-thumb");
      if (!container) return;
      if (!document.fullscreenElement) {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
      }
    });
  }

  // --- 4. Recent Events Interactivity (Table Selection) ---
  const recentTable = document.querySelector(".recent-events-table");
  if (recentTable) {
    const rows = recentTable.querySelectorAll("tbody tr");
    rows.forEach((row) => {
      row.style.cursor = "pointer";
      row.addEventListener("click", () => {
        rows.forEach((r) => (r.style.background = "transparent"));
        row.style.background = "rgba(255, 255, 255, 0.08)";
        
        const time = row.cells[0]?.textContent.trim();
        const eventName = row.cells[1]?.textContent.trim();
        const camera = row.cells[2]?.textContent.trim();
        const status = row.cells[3]?.textContent.trim();

        console.log(`Event Selected: [${time}] ${eventName} - ${camera} (${status})`);
      });
    });
  }

  // --- 5. Quick Action Buttons Navigation ---
  const actionRoutes = {
    "View All Events": "cctv-events.html",
    "Search Events": "video-search.html",
    "Export Report": "reports.html",
    "Manage Rules": "settings.html"
  };

  document.querySelectorAll(".quick-actions .btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const btnText = btn.textContent.trim();
      const targetUrl = actionRoutes[btnText];
      
      if (targetUrl) {
        window.location.href = targetUrl;
      } else {
        console.log(`Quick action trigger: ${btnText}`);
      }
    });
  });
});