/* =========================================================
   cctv-events.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Date picker ---------- */
  const dateWrapper = document.querySelector(".cctv-input-icon");
  const dateInput   = document.getElementById("dateRange");

  if (dateWrapper && dateInput) {
    dateWrapper.addEventListener("click", (e) => {
      if (e.target !== dateInput && typeof dateInput.showPicker === "function") {
        dateInput.showPicker();
      }
    });
  }

  /* ---------- Native time picker (click anywhere in field) ---------- */
  ["timeFrom", "timeTo"].forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener("click", () => {
      if (typeof input.showPicker === "function") {
        input.showPicker();
      }
    });
  });

  /* ---------- Parse "HH:MM" (24h) or "hh:mm:ss AM/PM" ---------- */
  function parseTimeToMinutes(str) {
    if (!str) return 0;
    const s = str.trim();

    // 24h "HH:MM" or "HH:MM:SS"
    let m24 = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
    if (m24) {
      return (parseInt(m24[1], 10) || 0) * 60 + (parseInt(m24[2], 10) || 0);
    }

    // 12h "hh:mm:ss AM/PM" or "hh:mm AM/PM"
    const m12 = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
    if (m12) {
      let h = parseInt(m12[1], 10);
      const mm = parseInt(m12[2], 10);
      const ampm = m12[4].toUpperCase();
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      return h * 60 + mm;
    }
    return 0;
  }

  /* ---------- Apply Filters ---------- */
  const applyFiltersBtn = document.getElementById("applyFiltersBtn");

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", () => {
      const timeFromVal = document.getElementById("timeFrom")?.value || "00:00";
      const timeToVal   = document.getElementById("timeTo")?.value   || "23:59";

      const fromMins = parseTimeToMinutes(timeFromVal);
      const toMins   = parseTimeToMinutes(timeToVal);

      const eventType = document.getElementById("eventTypeFilter")?.value.trim() || "";
      const camera    = document.getElementById("cameraFilter")?.value.trim()    || "";
      const status    = document.getElementById("statusFilter")?.value.trim()    || "";

      const rows = document.querySelectorAll("#eventsTable tbody tr");

      rows.forEach(row => {
        const cells = row.children;
        const rowEventName = cells[1]?.textContent.trim() || "";
        const rowStartTime = cells[2]?.textContent.trim() || "";
        const rowCamera    = cells[4]?.textContent.trim() || "";
        const rowStatus    = cells[7]?.textContent.trim() || "";

        const matchType = !eventType || eventType.startsWith("All") ||
          rowEventName.toLowerCase().includes(eventType.toLowerCase());

        const matchCamera = !camera || camera.startsWith("All") ||
          rowCamera === camera;

        const matchStatus = !status || status.startsWith("All") ||
          rowStatus.toLowerCase() === status.toLowerCase();

        const rowStartMins = parseTimeToMinutes(rowStartTime);

        // Normal range (from ≤ to) or wrapped (from > to, crossing midnight)
        let matchTime;
        if (fromMins <= toMins) {
          matchTime = rowStartMins >= fromMins && rowStartMins <= toMins;
        } else {
          matchTime = rowStartMins >= fromMins || rowStartMins <= toMins;
        }

        row.style.display = (matchType && matchCamera && matchStatus && matchTime)
          ? ""
          : "none";
      });
    });
  }

  /* ---------- View button → modal ---------- */
  const modalHTML = `
    <div id="eventModal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:1000; align-items:center; justify-content:center;">
      <div style="background:#101a32; border:1px solid #26375e; border-radius:8px; width:90%; max-width:500px; padding:20px; color:#fff; position:relative;">
        <h3 id="modalTitle" style="margin-top:0; font-size:18px;">Event Details</h3>
        <hr style="border:0; border-top:1px solid #26375e; margin:12px 0;">
        <div id="modalBody" style="font-size:14px; line-height:1.6;"></div>
        <div style="margin-top:20px; text-align:right;">
          <button id="closeModalBtn" class="btn btn-primary" style="background:#2563eb; color:#ffffff; border:none; padding:8px 18px; border-radius:6px; font-weight:600; cursor:pointer;">Close</button>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  const modal         = document.getElementById("eventModal");
  const modalBody     = document.getElementById("modalBody");
  const closeModalBtn = document.getElementById("closeModalBtn");

  if (closeModalBtn) closeModalBtn.addEventListener("click", () => modal.style.display = "none");

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  document.querySelectorAll(".events-table .btn-sm").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      if (!row) return;

      const cells = row.children;
      const eventData = {
        id:        cells[0]?.textContent.trim(),
        name:      cells[1]?.textContent.trim(),
        startTime: cells[2]?.textContent.trim(),
        endTime:   cells[3]?.textContent.trim(),
        camera:    cells[4]?.textContent.trim(),
        personId:  cells[5]?.textContent.trim(),
        vehicleId: cells[6]?.textContent.trim(),
        status:    cells[7]?.textContent.trim()
      };

      modalBody.innerHTML = `
        <p><strong>ID:</strong> ${eventData.id}</p>
        <p><strong>Event Name:</strong> ${eventData.name}</p>
        <p><strong>Start Time:</strong> ${eventData.startTime}</p>
        <p><strong>End Time:</strong> ${eventData.endTime}</p>
        <p><strong>Camera:</strong> ${eventData.camera}</p>
        <p><strong>Person ID:</strong> ${eventData.personId}</p>
        <p><strong>Vehicle ID:</strong> ${eventData.vehicleId}</p>
        <p><strong>Status:</strong> ${eventData.status}</p>
      `;

      modal.style.display = "flex";
    });
  });

});