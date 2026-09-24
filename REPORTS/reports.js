// =========================================================
// SENTRA — Reports Page Logic
// Runs after layout.js has injected the shared shell.
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // Mock report data — swap this for a real API call later
    const reportsData = [
        {
            id: "RPT-001",
            name: "Daily Event Report - Apr 27, 2025",
            type: "Event",
            typeFilter: "event",
            dateCreated: "27 Apr 2025 04:12 PM"
        },
        {
            id: "RPT-002",
            name: "Investigation Report - INV-001",
            type: "Investigation",
            typeFilter: "investigation",
            dateCreated: "27 Apr 2025 01:45 PM"
        },
        {
            id: "RPT-003",
            name: "Alert Summary - Apr 26, 2025",
            type: "Alert",
            typeFilter: "event",
            dateCreated: "26 Apr 2025 11:20 PM"
        },
        {
            id: "RPT-004",
            name: "Weekly Summary - Apr 21-27 2025",
            type: "Summary",
            typeFilter: "event",
            dateCreated: "27 Apr 2025 09:15 AM"
        }
    ];

    const tableBody = document.getElementById("reports-table-body");
    const emptyState = document.getElementById("reports-empty");
    const tabsWrap = document.getElementById("reports-tabs");

    // Wait for layout.js to finish injecting the shared shell
    // before wiring up anything that depends on it.
    setTimeout(init, 0);

    function init() {
        renderTable("all");
        wireTabs();
        wireGenerateButton();
    }

    function renderTable(filter) {
        const rows = filter === "all"
            ? reportsData
            : reportsData.filter(r => r.typeFilter === filter);

        if (rows.length === 0) {
            tableBody.innerHTML = "";
            emptyState.classList.remove("hidden");
            return;
        }

        emptyState.classList.add("hidden");

        tableBody.innerHTML = rows.map(r => `
            <tr>
                <td>${r.name}</td>
                <td class="report-type-cell">${r.type}</td>
                <td class="report-date-cell">${r.dateCreated}</td>
                <td>
                    <button class="download-btn" data-report-id="${r.id}">
                        <i class="fa-solid fa-download"></i>
                        Download
                    </button>
                </td>
            </tr>
        `).join("");

        // Wire the download buttons for this render
        tableBody.querySelectorAll(".download-btn").forEach(btn => {
            btn.addEventListener("click", function () {
                const report = reportsData.find(r => r.id === btn.dataset.reportId);
                if (report) downloadReport(report);
            });
        });
    }

    function wireTabs() {
        const tabButtons = tabsWrap.querySelectorAll(".tab-btn");

        tabButtons.forEach(btn => {
            btn.addEventListener("click", function () {
                tabButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                renderTable(btn.dataset.filter);
            });
        });
    }

    function wireGenerateButton() {
        const generateBtn = document.getElementById("generate-report-btn");
        if (!generateBtn) return;

        generateBtn.addEventListener("click", function () {
            // Hook this up to the real report-generation flow later
            alert("Report generation started.");
        });
    }

    function downloadReport(report) {
        // Hook this up to the real file download endpoint later
        alert(`Downloading "${report.name}"...`);
    }

});
