# SENTRA — AI CCTV Investigation Support System
### Dashboard / Front-End Module

This repository contains the **front-end dashboard** for SENTRA, an AI-assisted CCTV investigation support system. It is the **UI layer only** — all data is mocked for demonstration purposes, and the AI detection pipeline and backend are being developed as separate modules.

---

## Project Overview

SENTRA is designed to help investigators review CCTV footage efficiently by surfacing detected events, alerts, timelines, and searchable footage in a single interface. This repository covers the dashboard that an investigator would interact with; the AI/ML components that generate the underlying events and detections are not part of this repo.

---

## Status

| Component | Status |
|---|---|
| Dashboard, Alerts, CCTV Events, Video Search, Event Timeline, Reports, Settings pages | Complete |
| Shared layout (sidebar, topbar, badges) |  Complete |
| Filters, modals, mock data on every page |  Complete |
| AI detection pipeline | Separate module |
| Real backend / API integration | Not connected |
| Authentication / user accounts | Not implemented |

All data currently displayed is **static mock data** hard-coded into the JavaScript files. The interface is fully interactive, but nothing is persisted or fetched from a server.

---

## Pages

| Page | File | Purpose |
|---|---|---|
| Dashboard | `html/dashboard.html` | System overview and quick stats |
| Investigations | `html/investigations.html` | Case list with view/create modals |
| CCTV Events | `html/cctv-events.html` | Event log with date, time, camera, and status filters |
| Alerts | `html/alerts.html` | Rule-triggered alerts sorted by severity and status |
| Video Search | `html/video-search.html` | Search footage by time range, camera, and object type |
| Event Timeline | `html/event-timeline.html` | Chronological event playback with bounding-box overlays |
| Reports | `html/reports.html` | Summary reports of activity |
| Settings | `html/settings.html` | System preferences and rule configuration |

---

## Tech Stack

- **HTML5** — semantic markup, no templating engine
- **CSS3** — custom properties (variables), flexbox, grid
- **Vanilla JavaScript** — no frameworks, no build step
- **Font Awesome 6** — icons


## Running Locally

### Option 1 — Open directly
Open `html/dashboard.html` in any modern browser (Chrome, Edge, Firefox).

