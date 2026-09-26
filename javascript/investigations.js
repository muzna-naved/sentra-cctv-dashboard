/* =========================================================
   investigations.js
======================================== */

document.addEventListener("DOMContentLoaded", () => {
  const searchBtn = document.getElementById("searchBtn");
  const resetBtn = document.getElementById("resetBtn");
  const newInvestigationBtn = document.getElementById("newInvestigationBtn");
  const mainSearch = document.getElementById("mainSearch");
  const dateRange = document.getElementById("dateRange");
  const eventTypeSelect = document.getElementById("eventType");
  const statusSelect = document.getElementById("statusFilter");
  const table = document.getElementById("investigationsTable");

  // ---------------------------------------------------
  // 1. DYNAMIC MODAL INJECTION
  // Creates modal overlay structure for viewing & adding cases
  // ---------------------------------------------------
  function injectModalHTML() {
    if (document.getElementById("investigationModal")) return;

    const modalHTML = `
      <div id="investigationModal" class="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); z-index:9999; align-items:center; justify-content:center;">
        <div class="modal-content" style="background:#0b1530; border:1px solid #26386d; border-radius:10px; padding:24px; width:100%; max-width:500px; color:#dce5ff; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid #26386d; padding-bottom:12px;">
            <h3 id="modalTitle" style="margin:0; font-size:18px; font-weight:600; color:#fff;">Case Details</h3>
            <button id="closeModalBtn" style="background:none; border:none; color:#8794b8; font-size:18px; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div id="modalBody" style="display:flex; flex-direction:column; gap:12px; font-size:13px;"></div>
          <div style="margin-top:20px; display:flex; justify-content:flex-end; gap:10px;">
            <button id="modalActionBtn" class="btn btn-primary" style="padding:8px 16px;">Close</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", modalHTML);

    document.getElementById("closeModalBtn").addEventListener("click", closeModal);
    document.getElementById("modalActionBtn").addEventListener("click", closeModal);
    document.getElementById("investigationModal").addEventListener("click", (e) => {
      if (e.target.id === "investigationModal") closeModal();
    });
  }

  function openModal(title, contentHTML, actionBtnText = "Close", actionCallback = null) {
    injectModalHTML();
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = contentHTML;
    
    const actionBtn = document.getElementById("modalActionBtn");
    actionBtn.textContent = actionBtnText;
    
    // Reset click listener
    const newBtn = actionBtn.cloneNode(true);
    actionBtn.parentNode.replaceChild(newBtn, actionBtn);
    
    newBtn.addEventListener("click", () => {
      if (actionCallback) actionCallback();
      closeModal();
    });

    document.getElementById("investigationModal").style.display = "flex";
  }

  function closeModal() {
    const modal = document.getElementById("investigationModal");
    if (modal) modal.style.display = "none";
  }

  // Inject modal on load
  injectModalHTML();

  // ---------------------------------------------------
  // 2. FILTERING LOGIC
  // Real-time & Search Button Filtering
  // ---------------------------------------------------
  function applyFilters() {
    if (!table) return;

    const query = (mainSearch?.value || "").trim().toLowerCase();
    const eventType = eventTypeSelect?.value || "All Types";
    const status = statusSelect?.value || "All Status";

    const rows = table.querySelectorAll("tbody tr");
    let visibleCount = 0;

    rows.forEach((row) => {
      if (row.classList.contains("no-results-row")) return;

      const cells = row.children;
      const id = cells[0]?.textContent.trim().toLowerCase() || "";
      const eventName = cells[1]?.textContent.trim() || "";
      const camera = cells[3]?.textContent.trim().toLowerCase() || "";
      const rowStatus = cells[4]?.textContent.trim() || "";

      const matchesQuery =
        query === "" ||
        id.includes(query) ||
        eventName.toLowerCase().includes(query) ||
        camera.includes(query);

      const matchesType = eventType === "All Types" || eventName.includes(eventType) || eventType.includes(eventName);
      const matchesStatus = status === "All Status" || rowStatus.includes(status);

      const isMatch = matchesQuery && matchesType && matchesStatus;
      row.style.display = isMatch ? "" : "none";
      if (isMatch) visibleCount++;
    });

    showNoResultsMessage(visibleCount === 0);
  }

  function showNoResultsMessage(show) {
    if (!table) return;
    const tbody = table.querySelector("tbody");
    let noResultsRow = tbody.querySelector(".no-results-row");

    if (show && !noResultsRow) {
      noResultsRow = document.createElement("tr");
      noResultsRow.className = "no-results-row";
      const td = document.createElement("td");
      td.colSpan = 6;
      td.style.textAlign = "center";
      td.style.padding = "2rem";
      td.style.color = "var(--text-muted)";
      td.textContent = "No investigations match your filters.";
      noResultsRow.appendChild(td);
      tbody.appendChild(noResultsRow);
    } else if (!show && noResultsRow) {
      noResultsRow.remove();
    }
  }

  // Live filter on search typing and drop-down selects
  if (mainSearch) mainSearch.addEventListener("input", applyFilters);
  if (eventTypeSelect) eventTypeSelect.addEventListener("change", applyFilters);
  if (statusSelect) statusSelect.addEventListener("change", applyFilters);
  if (dateRange) dateRange.addEventListener("change", applyFilters);

  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      applyFilters();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (mainSearch) mainSearch.value = "";
      if (eventTypeSelect) eventTypeSelect.selectedIndex = 0;
      if (statusSelect) statusSelect.selectedIndex = 0;
      if (dateRange) dateRange.value = "2025-04-27";
      applyFilters();
    });
  }

  // ---------------------------------------------------
  // 3. NEW INVESTIGATION CREATION MODAL
  // ---------------------------------------------------
  if (newInvestigationBtn) {
    newInvestigationBtn.addEventListener("click", () => {
      const createFormHTML = `
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div>
            <label style="display:block; margin-bottom:4px; font-weight:500;">Event Name</label>
            <input type="text" id="newCaseName" placeholder="e.g. Unscheduled Access" style="width:100%; padding:8px 12px; background:#080f2c; border:1px solid #343da3; border-radius:6px; color:#fff;" />
          </div>
          <div>
            <label style="display:block; margin-bottom:4px; font-weight:500;">Camera Location</label>
            <select id="newCaseCamera" style="width:100%; padding:8px 12px; background:#080f2c; border:1px solid #343da3; border-radius:6px; color:#fff;">
              <option>Camera 01</option>
              <option>Camera 02</option>
              <option>Camera 03</option>
              <option>Camera 04</option>
            </select>
          </div>
          <div>
            <label style="display:block; margin-bottom:4px; font-weight:500;">Initial Status</label>
            <select id="newCaseStatus" style="width:100%; padding:8px 12px; background:#080f2c; border:1px solid #343da3; border-radius:6px; color:#fff;">
              <option value="In Progress">In Progress</option>
              <option value="Open">Open</option>
            </select>
          </div>
        </div>
      `;

      openModal("Create New Investigation", createFormHTML, "Create Case", () => {
        const nameInput = document.getElementById("newCaseName")?.value.trim();
        const cameraVal = document.getElementById("newCaseCamera")?.value;
        const statusVal = document.getElementById("newCaseStatus")?.value;

        if (!nameInput) return;

        const tbody = table.querySelector("tbody");
        const count = tbody.querySelectorAll("tr:not(.no-results-row)").length + 1;
        const newID = `INV-${count.toString().padStart(3, "0")}`;
        const timeNow = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

        let badgeHTML = statusVal === "In Progress" 
          ? `<span class="badge badge-red"><i class="fa-solid fa-triangle-exclamation"></i> In Progress</span>`
          : `<span class="badge badge-orange"><i class="fa-solid fa-clock"></i> Open</span>`;

        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td>${newID}</td>
          <td>${nameInput}</td>
          <td>${timeNow}</td>
          <td>${cameraVal}</td>
          <td>${badgeHTML}</td>
          <td><button class="btn btn-secondary btn-sm"><i class="fa-solid fa-eye"></i> View</button></td>
        `;

        tbody.insertBefore(newRow, tbody.firstChild);
        bindViewButtons();
        applyFilters();
      });
    });
  }

  // ---------------------------------------------------
  // 4. VIEW EVENT DETAILS MODAL
  // ---------------------------------------------------
  function bindViewButtons() {
    document.querySelectorAll(".investigations-table .btn-sm").forEach((btn) => {
      // Remove old listeners to prevent duplicates
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      newBtn.addEventListener("click", (e) => {
        const row = e.target.closest("tr");
        const id = row?.children[0]?.textContent.trim();
        const eventName = row?.children[1]?.textContent.trim();
        const time = row?.children[2]?.textContent.trim();
        const camera = row?.children[3]?.textContent.trim();
        const status = row?.children[4]?.textContent.trim();

        const detailHTML = `
          <div style="line-height: 1.8;">
            <p style="margin:0;"><strong>Case ID:</strong> ${id}</p>
            <p style="margin:0;"><strong>Event Title:</strong> ${eventName}</p>
            <p style="margin:0;"><strong>Recorded Time:</strong> ${time}</p>
            <p style="margin:0;"><strong>Source Feed:</strong> ${camera}</p>
            <p style="margin:0;"><strong>Current Status:</strong> ${status}</p>
          </div>
        `;

        openModal(`Investigation ${id}`, detailHTML, "Close");
      });
    });
  }

  bindViewButtons();
});