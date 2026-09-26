// Global Mock Data for Badges across all pages
const mockAlertsData = [
    { id: 1, status: "Open" },
    { id: 2, status: "Open" },
    { id: 3, status: "Resolved" },
    { id: 4, status: "Open" },
    { id: 5, status: "Open" }
];

function updateGlobalBadgeCount() {
    const openAlerts = mockAlertsData.filter(item => item.status === "Open").length;

    const sidebarBadge = document.getElementById("sidebar-alert-badge");
    if (sidebarBadge) sidebarBadge.innerText = openAlerts;

    const topbarBadge = document.getElementById("topbar-bell-badge");
    if (topbarBadge) topbarBadge.innerText = openAlerts;
}

document.addEventListener("DOMContentLoaded", function () {

    const pageContent = document.getElementById("page-content");

    if (!pageContent) {
        console.error("page-content element not found.");
        return;
    }

    // Save the page-specific content
    const content = pageContent.innerHTML;

    // Find which page is currently open
    const currentPage = document.body.dataset.page || "dashboard";


    // =====================================================
    // SHARED SENTRA LAYOUT
    // =====================================================

    document.body.innerHTML = `

        <div class="app-shell">

            <!-- ================= GLOBAL TOP BAR ================= -->

            <header class="global-topbar">

                <div class="brand">
                    <span class="logo-mark">
                        <img src="../assets/favicon.svg" alt="SENTRA logo" width="38" height="38">
                    </span>
                    <div>
                        <div class="brand-name">SENTRA</div>
                        <div class="brand-tagline">AI CCTV Investigation Support System</div>
                    </div>
                </div>


                <div class="topbar-system-label">
                    AI CCTV Investigation Support System
                </div>


                <!-- Search -->

                <div class="topbar-search">

                    <i class="fa-solid fa-magnifying-glass"></i>

                    <input
                        type="text"
                        id="global-search-input"
                        placeholder="Search events, people, vehicles..."
                    >

                </div>


                <!-- Right side -->

                <div class="topbar-right">

                    <button
                        class="icon-btn"
                        id="topbar-bell-btn"
                        aria-label="Notifications"
                    >

                        <i class="fa-solid fa-bell"></i>

                        <span class="icon-btn-badge" id="topbar-bell-badge">
                            0
                        </span>

                    </button>


                    <!-- User Profile Dropdown Container -->
                    <div class="user-menu-container" style="position: relative;">

                        <div class="user-chip" id="user-menu-toggle" style="cursor: pointer;">

                            <span class="user-avatar">

                                <i class="fa-solid fa-user"></i>

                            </span>


                            <div>

                                <p class="user-name">
                                    Ahsan Raza
                                </p>

                                <p class="user-role">
                                    Investigator
                                </p>

                            </div>


                            <span class="user-caret">

                                <i class="fa-solid fa-chevron-down"></i>

                            </span>

                        </div>

                        <!-- Dropdown Menu -->
                        <div class="user-dropdown-menu" id="user-dropdown-menu" style="display: none; position: absolute; right: 0; top: 110%; background-color: #1a233a; border: 1px solid #2a3656; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); width: 180px; z-index: 1000; overflow: hidden;">
                            <a href="settings.html" class="dropdown-item" style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; color: #fff; text-decoration: none; font-size: 14px; transition: background 0.2s;">
                                <i class="fa-solid fa-user-gear"></i> Profile & Settings
                            </a>
                            <a href="#" id="dropdown-logout-btn" class="dropdown-item" style="display: flex; align-items: center; gap: 10px; padding: 10px 16px; color: #ff5c5c; text-decoration: none; font-size: 14px; transition: background 0.2s; border-top: 1px solid #2a3656;">
                                <i class="fa-solid fa-right-from-bracket"></i> Log Out
                            </a>
                        </div>

                    </div>

                </div>

            </header>


            <!-- ================= APP BODY ================= -->

            <div class="app-body">


                <!-- ================= SIDEBAR ================= -->

                <aside class="sidebar">

                    <nav class="sidebar-nav">


                        <a
                            href="dashboard.html"
                            class="nav-item"
                            data-page="dashboard"
                        >

                            <span class="nav-icon">
                                <i class="fa-solid fa-house"></i>
                            </span>

                            <span>
                                Dashboard
                            </span>

                        </a>


                        <a
                            href="investigations.html"
                            class="nav-item"
                            data-page="investigations"
                        >

                            <span class="nav-icon">
                                <i class="fa-solid fa-briefcase"></i>
                            </span>

                            <span>
                                Investigations
                            </span>

                        </a>


                        <a
                            href="cctv-events.html"
                            class="nav-item"
                            data-page="cctv-events"
                        >

                            <span class="nav-icon">
                                <i class="fa-solid fa-video"></i>
                            </span>

                            <span>
                                CCTV Events
                            </span>

                        </a>


                        <a
                            href="alerts.html"
                            class="nav-item"
                            data-page="alerts"
                        >

                            <span class="nav-icon">
                                <i class="fa-solid fa-bell"></i>
                            </span>

                            <span>
                                Alerts
                            </span>

                            <span class="nav-badge" id="sidebar-alert-badge">
                                0
                            </span>

                        </a>


                        <a
                            href="video-search.html"
                            class="nav-item"
                            data-page="video-search"
                        >

                            <span class="nav-icon">
                                <i class="fa-solid fa-magnifying-glass"></i>
                            </span>

                            <span>
                                Video Search
                            </span>

                        </a>


                        <a
                            href="event-timeline.html"
                            class="nav-item"
                            data-page="event-timeline"
                        >

                            <span class="nav-icon">
                                <i class="fa-solid fa-timeline"></i>
                            </span>

                            <span>
                                Event Timeline
                            </span>

                        </a>


                        <a
                            href="reports.html"
                            class="nav-item"
                            data-page="reports"
                        >

                            <span class="nav-icon">
                                <i class="fa-solid fa-file-lines"></i>
                            </span>

                            <span>
                                Reports
                            </span>

                        </a>


                        <a
                            href="settings.html"
                            class="nav-item"
                            data-page="settings"
                        >

                            <span class="nav-icon">
                                <i class="fa-solid fa-gear"></i>
                            </span>

                            <span>
                                Settings
                            </span>

                        </a>


                    </nav>


                    <!-- ================= SIDEBAR FOOTER ================= -->

                    <div class="sidebar-footer">

                        <div class="status-pill">

                            <span class="status-dot"></span>

                            <div>

                                <p>
                                    Connected to Database
                                </p>

                                <p class="text-muted">
                                    Local Server
                                </p>

                                <p class="text-muted">
                                    v2.0.0
                                </p>

                            </div>

                        </div>


                        <p class="sidebar-motto">
                            Built for a safer tomorrow
                        </p>

                    </div>

                </aside>


                <!-- ================= PAGE AREA ================= -->

                <main class="main-content">

                    <div id="shared-page-content"></div>

                </main>


            </div>

        </div>

    `;


    // =====================================================
    // PUT ORIGINAL PAGE CONTENT INTO MAIN CONTENT
    // =====================================================

    document.getElementById("shared-page-content").innerHTML = content;


    // =====================================================
    // ACTIVE SIDEBAR ITEM
    // =====================================================

    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(function (item) {

        if (item.dataset.page === currentPage) {

            item.classList.add("active");

        }

    });


    // =====================================================
    // INITIALIZE BADGES FOR ALL PAGES
    // =====================================================

    updateGlobalBadgeCount();


    // =====================================================
    // BELL ICON NAVIGATION HANDLER
    // =====================================================

    const bellBtn = document.getElementById("topbar-bell-btn");

    if (bellBtn) {
        bellBtn.addEventListener("click", function () {
            window.location.href = "alerts.html";
        });
    }


    // =====================================================
    // USER DROPDOWN MENU HANDLER
    // =====================================================

    const userToggle = document.getElementById("user-menu-toggle");
    const userDropdown = document.getElementById("user-dropdown-menu");
    const logoutBtn = document.getElementById("dropdown-logout-btn");

    if (userToggle && userDropdown) {

        userToggle.addEventListener("click", function (e) {
            e.stopPropagation();
            const isVisible = userDropdown.style.display === "block";
            userDropdown.style.display = isVisible ? "none" : "block";
        });

        // Close dropdown when clicking anywhere outside
        document.addEventListener("click", function (e) {
            if (!userToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.style.display = "none";
            }
        });

    }

    // Logout click event
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function (e) {
            e.preventDefault();
            // Clear auth storage if applicable
            localStorage.clear();
            sessionStorage.clear();
            
            // Redirect to login or home page
            window.location.href = "login.html";
        });
    }


    // =====================================================
    // DYNAMIC GLOBAL SEARCH ROUTER
    // =====================================================

    const searchInput = document.getElementById("global-search-input");

    if (searchInput) {
        searchInput.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                const query = searchInput.value.trim();
                if (!query) return;

                const lowerQuery = query.toLowerCase();

                // Route to Alerts page
                if (lowerQuery.includes("alert") || lowerQuery.includes("loitering") || lowerQuery.includes("suspicious")) {
                    window.location.href = `alerts.html?query=${encodeURIComponent(query)}`;
                }
                // Route to CCTV Events page
                else if (lowerQuery.includes("event") || lowerQuery.includes("camera") || lowerQuery.includes("feed")) {
                    window.location.href = `cctv-events.html?query=${encodeURIComponent(query)}`;
                }
                // Route to Video Search for People, Vehicles, or general queries
                else {
                    window.location.href = `video-search.html?query=${encodeURIComponent(query)}`;
                }
            }
        });
    }

});