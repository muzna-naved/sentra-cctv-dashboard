// =========================================================
// ALERTS DATA
// =========================================================

const mockAlerts = [
    {
        id: 1,
        time: "02:43:18 AM",
        name: "Suspicious Vehicle Activity",
        severity: "High",
        status: "Open",
        date: "2025-04-27",
        camera: "Camera 01",
        rule: "Person-Vehicle Proximity"
    },
    {
        id: 2,
        time: "02:37:05 AM",
        name: "Person in Restricted Area",
        severity: "Medium",
        status: "Open",
        date: "2025-04-27",
        camera: "Camera 03",
        rule: "Restricted Zone Entry"
    },
    {
        id: 3,
        time: "01:12:16 AM",
        name: "Vehicle Loitering",
        severity: "Medium",
        status: "Resolved",
        date: "2025-04-27",
        camera: "Camera 02",
        rule: "Loitering Duration Exceeded"
    },
    {
        id: 4,
        time: "12:05:34 AM",
        name: "Multiple People Gathering",
        severity: "Low",
        status: "Open",
        date: "2025-04-27",
        camera: "Camera 04",
        rule: "Unusual Crowd Density"
    },
    {
        id: 5,
        time: "11:42:11 PM",
        name: "Night Activity",
        severity: "Medium",
        status: "Open",
        date: "2025-04-26",
        camera: "Camera 01",
        rule: "Off-Hours Movement"
    }
];

let selectedAlertId = null;


// =========================================================
// HELPER: APPLY ACTIVE FILTERS & UPDATE BADGES
// =========================================================

function applyFilters() {
    const severityElem = document.getElementById("severity-filter");
    const statusElem = document.getElementById("status-filter");
    const dateElem = document.getElementById("date-filter");
    const timeElem = document.getElementById("time-filter");

    const severity = severityElem ? severityElem.value : "ALL";
    const status = statusElem ? statusElem.value : "ALL";
    const date = dateElem ? dateElem.value : "";
    const time = timeElem ? timeElem.value : "";

    const filteredAlerts = mockAlerts.filter(function (item) {
        const severityMatch = severity === "ALL" || item.severity === severity;
        const statusMatch = status === "ALL" || item.status === status;
        const dateMatch = !date || item.date === date;
        const timeMatch = !time || item.time.includes(time);

        return severityMatch && statusMatch && dateMatch && timeMatch;
    });

    renderTable(filteredAlerts);
    updateBadgeCount();
}


// =========================================================
// LOAD PAGE & BIND ALL LISTENERS
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // Initial filter run
    applyFilters();

    // Live dropdown/date/time filter listener bindings
    const severityFilter = document.getElementById("severity-filter");
    if (severityFilter) severityFilter.addEventListener("change", applyFilters);

    const statusFilter = document.getElementById("status-filter");
    if (statusFilter) statusFilter.addEventListener("change", applyFilters);

    const dateFilter = document.getElementById("date-filter");
    if (dateFilter) dateFilter.addEventListener("change", applyFilters);

    const timeFilter = document.getElementById("time-filter");
    if (timeFilter) timeFilter.addEventListener("change", applyFilters);

    // Apply button binding
    const applyBtn = document.getElementById("btn-apply-filters");
    if (applyBtn) {
        applyBtn.addEventListener("click", applyFilters);
    }

    // Reset button binding
    const resetBtn = document.getElementById("btn-reset-filters");
    if (resetBtn) {
        resetBtn.addEventListener("click", function () {
            const severityFilter = document.getElementById("severity-filter");
            const statusFilter = document.getElementById("status-filter");
            const dateFilter = document.getElementById("date-filter");
            const timeFilter = document.getElementById("time-filter");

            if (severityFilter) severityFilter.value = "ALL";
            if (statusFilter) statusFilter.value = "ALL";
            if (dateFilter) dateFilter.value = "";
            if (timeFilter) timeFilter.value = "";

            applyFilters();
        });
    }

    // ---------------------------------------------------------
    // VIEW BUTTON — Event delegation (survives table re-render)
    // ---------------------------------------------------------
    const tableBody = document.getElementById("alerts-table-body");
    if (tableBody) {
        tableBody.addEventListener("click", function (e) {
            const btn = e.target.closest(".view-alert-btn");
            if (!btn) return;

            const id = parseInt(btn.dataset.alertId, 10);
            if (!isNaN(id)) openAlertModal(id);
        });
    }

    // Modal Close bindings
    const closeBtn = document.getElementById("modal-close-btn");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);

    const cancelBtn = document.getElementById("modal-cancel-btn");
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    // Overlay click & Escape key listeners for modal closure
    const modalOverlay = document.getElementById("alert-modal");
    if (modalOverlay) {
        modalOverlay.addEventListener("click", function (e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            closeModal();
        }
    });

    // Modal Resolve binding
    const resolveBtn = document.getElementById("modal-resolve-btn");
    if (resolveBtn) {
        resolveBtn.addEventListener("click", function () {
            if (selectedAlertId === null) return;

            const alertItem = mockAlerts.find(function (item) {
                return item.id === selectedAlertId;
            });

            if (!alertItem) return;

            if (alertItem.status === "Open") {
                alertItem.status = "Resolved";
            } else {
                alertItem.status = "Open";
            }

            applyFilters();
            closeModal();
        });
    }

});


// =========================================================
// RENDER TABLE
// =========================================================

function renderTable(data) {

    const tableBody = document.getElementById("alerts-table-body");

    if (!tableBody) {
        console.error("alerts-table-body was not found.");
        return;
    }

    tableBody.innerHTML = "";

    // No results
    if (data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="no-alerts">
                    No alerts match the selected criteria.
                </td>
            </tr>
        `;
        return;
    }

    // Create rows
    data.forEach(function (item) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${item.date}</td>

            <td>${item.time}</td>

            <td>
                <strong>${item.name}</strong>
            </td>

            <td>
                <span class="tag-severity tag-${item.severity.toLowerCase()}">
                    ${item.severity}
                </span>
            </td>

            <td>
                <span class="tag-status tag-${item.status.toLowerCase()}">
                    ${item.status}
                </span>
            </td>

            <td>
                <button
                    type="button"
                    class="btn btn-secondary btn-sm view-alert-btn"
                    data-alert-id="${item.id}">

                    <i class="fa-regular fa-eye"></i>
                    View

                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// =========================================================
// OPEN ALERT MODAL 
// =========================================================

window.openAlertModal = function (id) {

    selectedAlertId = id;

    const alertItem = mockAlerts.find(function (item) {
        return item.id === id;
    });

    if (!alertItem) return;

    const alertCode = "ALERT-" + String(alertItem.id).padStart(3, "0");

    // Header title
    const titleElem = document.getElementById("modal-title");
    if (titleElem) {
        titleElem.innerText = alertItem.name + " — " + alertCode;
    }

    // Body
    const bodyElem = document.getElementById("modal-body-content");
    if (bodyElem) {
        bodyElem.innerHTML = `
            <p><strong>Alert ID:</strong> ${alertCode}</p>

            <p><strong>Event Title:</strong> ${alertItem.name}</p>

            <p><strong>Recorded Time:</strong> ${alertItem.time} (${alertItem.date})</p>

            <p><strong>Source Feed:</strong> ${alertItem.camera}</p>

            <p><strong>Triggered Rule:</strong> ${alertItem.rule}</p>

            <p><strong>Severity:</strong>
                <span class="tag-severity tag-${alertItem.severity.toLowerCase()}">
                    ${alertItem.severity}
                </span>
            </p>

            <p><strong>Current Status:</strong>
                <span class="tag-status tag-${alertItem.status.toLowerCase()}">
                    ${alertItem.status}
                </span>
            </p>
        `;
    }

    // Resolve button label
    const resolveButton = document.getElementById("modal-resolve-btn");
    if (resolveButton) {
        resolveButton.innerText =
            alertItem.status === "Open"
                ? "Mark as Resolved"
                : "Reopen Alert";
    }

    // Show modal
    const modal = document.getElementById("alert-modal");
    if (modal) {
        modal.classList.add("active");
        modal.style.removeProperty("display");
    }
};


// =========================================================
// CLOSE MODAL
// =========================================================

function closeModal() {
    const modal = document.getElementById("alert-modal");
    if (modal) {
        modal.classList.remove("active");
        modal.style.removeProperty("display");
    }
    selectedAlertId = null;
}


// =========================================================
// UPDATE BADGES DYNAMICALLY (System-Wide Open Alerts Count)
// =========================================================

function updateBadgeCount() {

    const openAlerts = mockAlerts.filter(function (item) {
        return item.status === "Open";
    }).length;

    const sidebarBadge = document.getElementById("sidebar-alert-badge");
    if (sidebarBadge) {
        sidebarBadge.innerText = openAlerts;
    }

    const topbarBadge = document.getElementById("topbar-bell-badge");
    if (topbarBadge) {
        topbarBadge.innerText = openAlerts;
    }
}