// Mock Backend Data for Alerts
const mockAlerts = [
  { id: 1, time: "02:43:18 AM", name: "Suspicious Vehicle Activity", severity: "High", status: "Open", date: "2025-04-27", camera: "Camera 01", rule: "Person-Vehicle Proximity" },
  { id: 2, time: "02:37:05 AM", name: "Person in Restricted Area", severity: "Medium", status: "Open", date: "2025-04-27", camera: "Camera 03", rule: "Restricted Zone Entry" },
  { id: 3, time: "01:12:16 AM", name: "Vehicle Loitering", severity: "Medium", status: "Resolved", date: "2025-04-27", camera: "Camera 02", rule: "Loitering Duration Exceeded" },
  { id: 4, time: "12:05:34 AM", name: "Multiple People Gathering", severity: "Low", status: "Open", date: "2025-04-27", camera: "Camera 04", rule: "Unusual Crowd Density" },
  { id: 5, time: "11:42:11 PM", name: "Night Activity", severity: "Medium", status: "Open", date: "2025-04-26", camera: "Camera 01", rule: "Off-Hours Movement" }
];

let selectedAlertId = null;

// DOM Elements
const tableBody = document.getElementById("alerts-table-body");
const severitySelect = document.getElementById("severity-filter");
const statusSelect = document.getElementById("status-filter");
const dateInput = document.getElementById("date-filter");
const applyBtn = document.getElementById("btn-apply-filters");
const resetBtn = document.getElementById("btn-reset-filters");
const sidebarBadge = document.getElementById("sidebar-alert-badge");

// Modal Elements
const alertModal = document.getElementById("alert-modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body-content");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalCancelBtn = document.getElementById("modal-cancel-btn");
const modalResolveBtn = document.getElementById("modal-resolve-btn");

// Initialize Table
document.addEventListener("DOMContentLoaded", () => {
  renderTable(mockAlerts);
  updateBadgeCount();
});

// Render Function
function renderTable(data) {
  tableBody.innerHTML = "";

  if (data.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 2rem;">
          No alerts match the selected criteria.
        </td>
      </tr>
    `;
    return;
  }

  data.forEach((item) => {
    const row = document.createElement("tr");

    const severityClass = item.severity.toLowerCase();
    const statusClass = item.status.toLowerCase();

    row.innerHTML = `
      <td>${item.time}</td>
      <td><strong>${item.name}</strong></td>
      <td><span class="tag-severity tag-${severityClass}">${item.severity}</span></td>
      <td><span class="tag-status tag-${statusClass}">${item.status}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="openAlertModal(${item.id})">
          <i class="fa-regular fa-eye"></i> View
        </button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

// Filter Action
applyBtn.addEventListener("click", () => {
  const selectedSeverity = severitySelect.value;
  const selectedStatus = statusSelect.value;
  const selectedDate = dateInput.value;

  const filtered = mockAlerts.filter((item) => {
    const matchSeverity = selectedSeverity === "ALL" || item.severity === selectedSeverity;
    const matchStatus = selectedStatus === "ALL" || item.status === selectedStatus;
    const matchDate = !selectedDate || item.date === selectedDate;
    return matchSeverity && matchStatus && matchDate;
  });

  renderTable(filtered);
});

// Reset Action
resetBtn.addEventListener("click", () => {
  severitySelect.value = "ALL";
  statusSelect.value = "ALL";
  dateInput.value = "2025-04-27";
  renderTable(mockAlerts);
});

// Open View Modal
window.openAlertModal = function (id) {
  selectedAlertId = id;
  const alertItem = mockAlerts.find((a) => a.id === id);

  if (!alertItem) return;

  modalTitle.innerText = alertItem.name;
  modalBody.innerHTML = `
    <p><strong>Time:</strong> ${alertItem.time} (${alertItem.date})</p>
    <p><strong>Camera:</strong> ${alertItem.camera}</p>
    <p><strong>Triggered Rule:</strong> ${alertItem.rule}</p>
    <p><strong>Severity:</strong> <span class="tag-severity tag-${alertItem.severity.toLowerCase()}">${alertItem.severity}</span></p>
    <p><strong>Current Status:</strong> <span class="tag-status tag-${alertItem.status.toLowerCase()}">${alertItem.status}</span></p>
  `;

  modalResolveBtn.innerText = alertItem.status === "Open" ? "Mark as Resolved" : "Reopen Alert";
  alertModal.classList.add("active");
};

// Close Modal Controls
function closeModal() {
  alertModal.classList.remove("active");
  selectedAlertId = null;
}

modalCloseBtn.addEventListener("click", closeModal);
modalCancelBtn.addEventListener("click", closeModal);

// Toggle Alert Status
modalResolveBtn.addEventListener("click", () => {
  if (selectedAlertId !== null) {
    const alertItem = mockAlerts.find((a) => a.id === selectedAlertId);
    if (alertItem) {
      alertItem.status = alertItem.status === "Open" ? "Resolved" : "Open";
      renderTable(mockAlerts);
      updateBadgeCount();
      closeModal();
    }
  }
});

// Update Badge Count for Active Open Alerts
function updateBadgeCount() {
  const openCount = mockAlerts.filter((a) => a.status === "Open").length;
  sidebarBadge.innerText = openCount;
}