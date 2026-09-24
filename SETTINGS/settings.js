// =========================================================
// SENTRA — Settings Page Logic
// Runs after layout.js has injected the shared shell.
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    // Wait for layout.js to finish injecting the shared shell
    // before wiring up anything that depends on it.
    setTimeout(init, 0);

    function init() {
        wireSettingsTabs();
        wireSaveButton();
    }

    function wireSettingsTabs() {
        const tabsWrap = document.getElementById("settings-tabs");
        if (!tabsWrap) return;

        const tabButtons = tabsWrap.querySelectorAll(".tab-btn");
        const panels = document.querySelectorAll(".settings-panel");

        tabButtons.forEach(btn => {
            btn.addEventListener("click", function () {
                tabButtons.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                const target = "panel-" + btn.dataset.panel;
                panels.forEach(panel => {
                    panel.classList.toggle("hidden", panel.id !== target);
                });
            });
        });
    }

    function wireSaveButton() {
        const saveBtn = document.getElementById("save-settings-btn");
        if (!saveBtn) return;

        saveBtn.addEventListener("click", function () {
            const settings = {
                systemName: document.getElementById("system-name").value,
                timezone: document.getElementById("timezone").value,
                retentionPeriod: document.getElementById("retention-period").value,
                enablePersonDetection: document.getElementById("toggle-person").checked,
                enableVehicleDetection: document.getElementById("toggle-vehicle").checked,
                enableTracking: document.getElementById("toggle-tracking").checked,
                enableRuleEngine: document.getElementById("toggle-rule-engine").checked
            };

            // Hook this up to the real settings-save endpoint later
            console.log("Saving settings:", settings);
            alert("Settings saved.");
        });
    }

});
