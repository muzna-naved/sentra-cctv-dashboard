document.addEventListener("DOMContentLoaded", function () {

    /* =========================================================
       MOCK DATA
       ---------------------------------------------------------
       Each entry now also has:
         - date       (for the Date dropdown)
         - eventType  (for the Event Type dropdown)
       The existing fields are untouched.
    ========================================================= */
    const timelineEventsData = [
        {
            time: "04:33:18",
            date: "Apr 27, 2025",
            eventType: "Person Detected",
            desc: "Person detected near motorcycle",
            camera: "Camera 01",
            tag: "[Person #77]",
            tagClass: "badge-blue",
            previewTime: "04:33:18",
            boxes: [
                { type: "person-box", label: "Person #77", text: "Person #77" }
            ],
            relatedTitle: "Potentially Suspicious Vehicle Activity",
            relatedTime: "04:33:18 - 04:13:46",
            severity: "High",
            metadata: "Person #77 / Motorcycle #94"
        },
        {
            time: "04:32:07",
            date: "Apr 27, 2025",
            eventType: "Vehicle Approach",
            desc: "Motorcycle approaches",
            camera: "Camera 01",
            tag: "[Vehicle #94]",
            tagClass: "badge-purple",
            previewTime: "04:32:07",
            boxes: [
                { type: "moto-box", label: "Vehicle #94", text: "Vehicle #94" }
            ],
            relatedTitle: "Vehicle Approach Sequence",
            relatedTime: "04:32:07 - 04:32:50",
            severity: "Medium",
            metadata: "Vehicle #94 Entry Route"
        },
        {
            time: "04:30:18",
            date: "Apr 27, 2025",
            eventType: "Person Detected",
            desc: "Person-vehicle interaction",
            camera: "Camera 01",
            tag: "[Rule Triggered]",
            tagClass: "badge-orange",
            previewTime: "04:30:18",
            boxes: [
                { type: "person-box", label: "Person #77", text: "Person #77" },
                { type: "moto-box",   label: "Motorcycle #94", text: "Motorcycle #94" }
            ],
            relatedTitle: "Restricted Zone Loitering Rule",
            relatedTime: "04:30:18 - 04:28:46",
            severity: "High",
            metadata: "Person #77 / Motorcycle #94"
        },
        {
            time: "04:28:46",
            date: "Apr 27, 2025",
            eventType: "Person Detected",
            desc: "Interaction ends",
            camera: "Camera 01",
            tag: "",
            tagClass: "",
            previewTime: "04:28:46",
            boxes: [],
            relatedTitle: "Standard Activity Log",
            relatedTime: "04:28:46 - End",
            severity: "Green",
            metadata: "No active threats detected"
        },
        {
            time: "04:35:02",
            date: "Apr 27, 2025",
            eventType: "Vehicle Approach",
            desc: "Motorcycle leaves",
            camera: "Camera 01",
            tag: "",
            tagClass: "",
            previewTime: "04:35:02",
            boxes: [
                { type: "moto-box", label: "Vehicle #94", text: "Vehicle #94 Leaving" }
            ],
            relatedTitle: "Vehicle Departure Sequence",
            relatedTime: "04:35:02 - Exit",
            severity: "Green",
            metadata: "Vehicle #94 Exited Sector C"
        },
        /* ---- extra entries so the Camera / Date filters have
                something real to filter to ---- */
        {
            time: "03:15:22",
            date: "Apr 27, 2025",
            eventType: "Vehicle Approach",
            desc: "Car enters parking zone",
            camera: "Camera 02",
            tag: "[Vehicle #12]",
            tagClass: "badge-purple",
            previewTime: "03:15:22",
            boxes: [
                { type: "car-box", label: "Car #12", text: "Car #12" }
            ],
            relatedTitle: "Unauthorized Parking Detection",
            relatedTime: "03:15:22 - 03:17:10",
            severity: "Medium",
            metadata: "Car #12 Entered Zone B"
        },
        {
            time: "02:41:09",
            date: "Apr 26, 2025",
            eventType: "Person Detected",
            desc: "Person walking near fence",
            camera: "Camera 02",
            tag: "[Person #33]",
            tagClass: "badge-blue",
            previewTime: "02:41:09",
            boxes: [
                { type: "person-box", label: "Person #33", text: "Person #33" }
            ],
            relatedTitle: "Perimeter Walk-By",
            relatedTime: "02:41:09 - 02:42:30",
            severity: "Low",
            metadata: "Person #33 / No interaction"
        }
    ];

    /* =========================================================
       DOM REFERENCES
    ========================================================= */
    const timelineContainer = document.querySelector(".timeline-container");
    const previewScreen     = document.querySelector(".preview-screen");
    const relatedCard       = document.querySelector(".related-event-card");
    const previewHeaderCam  = document.querySelector(".preview-header > span:first-child");

    // Filters (order matches the HTML)
    const filterSelects = document.querySelectorAll(".timeline-filters-row .filter-select");
    const dateFilter    = filterSelects[0];
    const cameraFilter  = filterSelects[1];
    const typeFilter    = filterSelects[2];

    if (!timelineContainer || !previewScreen) return;

    /* =========================================================
       RENDER TIMELINE
       ---------------------------------------------------------
       Rebuilds the timeline items from a (filtered) dataset.
       Preserves the .timeline-line element and rebinds listeners.
    ========================================================= */
    function renderTimeline(data) {
        // Remove existing items, keep the .timeline-line
        timelineContainer.querySelectorAll(".timeline-item").forEach(el => el.remove());

        // Remove any prior empty-state message
        const priorEmpty = timelineContainer.querySelector(".timeline-empty");
        if (priorEmpty) priorEmpty.remove();

        if (data.length === 0) {
            const empty = document.createElement("div");
            empty.className = "timeline-empty";
            empty.textContent = "No events match the selected filters.";
            empty.style.color = "var(--text-secondary)";
            empty.style.padding = "24px 0 24px 32px";
            empty.style.fontSize = "13px";
            timelineContainer.appendChild(empty);
            return;
        }

        data.forEach((item, index) => {
            const el = document.createElement("div");
            el.className = "timeline-item" + (index === 0 ? " active-timeline-item" : "");
            el.dataset.index = index;

            el.innerHTML = `
                <div class="timeline-dot"></div>
                <div class="timeline-time">${item.time}</div>
                <div class="timeline-desc">${item.desc}</div>
                <div class="timeline-cam">${item.camera}</div>
                <div class="timeline-tag ${item.tagClass}">${item.tag}</div>
            `;

            el.addEventListener("click", () => selectTimelineItem(el, item));
            timelineContainer.appendChild(el);
        });

        // Auto-select first item after filter change
        const firstEl = timelineContainer.querySelector(".timeline-item");
        if (firstEl) selectTimelineItem(firstEl, data[0]);
    }

    /* =========================================================
       SELECT / HIGHLIGHT A TIMELINE ITEM
    ========================================================= */
    function selectTimelineItem(el, data) {
        timelineContainer.querySelectorAll(".timeline-item")
            .forEach(i => i.classList.remove("active-timeline-item"));
        el.classList.add("active-timeline-item");

        renderPreview(data);
        renderRelated(data);
    }

    /* =========================================================
       PREVIEW SCREEN
    ========================================================= */
    function renderPreview(data) {
        let boxesHTML = "";
        data.boxes.forEach(box => {
            boxesHTML += `
                <div class="bounding-box ${box.type}">
                    <span class="box-tag">${box.text}</span>
                </div>`;
        });

        previewScreen.innerHTML = `
            ${boxesHTML}
            <div class="preview-timestamp">${data.previewTime}</div>
            <div class="preview-cam-label">${data.camera}</div>
        `;

        // Update the header label ("Camera 01") in the preview card
        if (previewHeaderCam) previewHeaderCam.textContent = data.camera;
    }

    /* =========================================================
       RELATED EVENT CARD
    ========================================================= */
    function renderRelated(data) {
        if (!relatedCard) return;

        let badgeClass = "badge-green";
        if (data.severity === "High")        badgeClass = "badge-red";
        else if (data.severity === "Medium") badgeClass = "badge-orange";

        relatedCard.innerHTML = `
            <h3 class="panel-title" style="margin-bottom: 8px;">Related Event</h3>
            <div class="related-title">${data.relatedTitle}</div>
            <div class="related-info-row">
                <span class="text-muted">${data.relatedTime}</span>
                <span class="badge ${badgeClass}">${data.severity}</span>
            </div>
            <div class="related-metadata text-secondary">
                ${data.metadata}
            </div>
        `;
    }
    /* =========================================================
       DATE HELPERS
    ========================================================= */
    function isoToPretty(pretty) {
        // "Apr 27, 2025" -> "2025-04-27"
        const d = new Date(pretty);
        if (isNaN(d)) return "";
        const yyyy = d.getFullYear();
        const mm   = String(d.getMonth() + 1).padStart(2, "0");
        const dd   = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    }

    /* =========================================================
       FILTER LOGIC
    ========================================================= */
    function applyFilters() {
        const dateISO   = dateFilter   ? dateFilter.value   : "";
        const cameraVal = cameraFilter ? cameraFilter.value : "All Cameras";
        const typeVal   = typeFilter   ? typeFilter.value   : "All Event Types";

        const filtered = timelineEventsData.filter(item => {
            const matchDate   = !dateISO || isoToPretty(item.date) === dateISO;
            const matchCamera = cameraVal === "All Cameras"     || item.camera === cameraVal;
            const matchType   = typeVal   === "All Event Types" || item.eventType === typeVal;
            return matchDate && matchCamera && matchType;
        });

        renderTimeline(filtered);
    }

    if (dateFilter)   dateFilter.addEventListener("change", applyFilters);
    if (cameraFilter) cameraFilter.addEventListener("change", applyFilters);
    if (typeFilter)   typeFilter.addEventListener("change", applyFilters);

    /* =========================================================
       INITIAL RENDER — build the timeline from data
       (uses the values already present in the dropdowns)
    ========================================================= */
    applyFilters();

    /* =========================================================
       KEYBOARD NAVIGATION
       ---------------------------------------------------------
       Up / Down arrows move through timeline items.
       Selecting an item simulates a click.
    ========================================================= */
    document.addEventListener("keydown", (e) => {
        // Only act when the user isn't typing in an input/select
        const tag = (e.target.tagName || "").toLowerCase();
        if (tag === "input" || tag === "select" || tag === "textarea") return;

        const items = Array.from(timelineContainer.querySelectorAll(".timeline-item"));
        if (!items.length) return;

        const currentIndex = items.findIndex(i => i.classList.contains("active-timeline-item"));

        if (e.key === "ArrowDown") {
            e.preventDefault();
            const next = items[Math.min(items.length - 1, currentIndex + 1)];
            if (next) next.click();
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            const prev = items[Math.max(0, currentIndex - 1)];
            if (prev) prev.click();
        }
    });

    /* =========================================================
       PREVIEW FULLSCREEN
       ---------------------------------------------------------
       No expand button exists in the HTML, so double-clicking
       the preview toggles browser fullscreen.
    ========================================================= */
    previewScreen.addEventListener("dblclick", () => {
        if (!document.fullscreenElement) {
            if (previewScreen.requestFullscreen) previewScreen.requestFullscreen();
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    });

});