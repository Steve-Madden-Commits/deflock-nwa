# DEFLOCK NWA — ALPR Surveillance Tracker

[![Website](https://img.shields.io/badge/Website-deflocknwa.org-0ea5e9?style=flat-square)](https://deflocknwa.org/)
[![License: Unlicense](https://img.shields.io/badge/License-Unlicense-green?style=flat-square)](LICENSE)
[![Nightly Intelligence](https://github.com/Steve-Madden-Commits/deflock-nwa/actions/workflows/nightly-curator.yml/badge.svg)](https://github.com/Steve-Madden-Commits/deflock-nwa/actions/workflows/nightly-curator.yml)
[![Stack](https://img.shields.io/badge/Stack-Vanilla%20JS%20%7C%20Leaflet%20%7C%20Python-informational?style=flat-square)](#tech-stack)

**Automated License Plate Reader (ALPR) surveillance accountability for Northwest Arkansas.**

Tracking Flock Safety camera deployments across Benton and Washington counties. Over 120+ warrantless vehicular surveillance cameras monitor daily travel across Fayetteville, Springdale, Rogers, Bentonville, and surrounding municipalities. No public referendum was held. No warrant is required.

Visit the live production site at **[deflocknwa.org](https://deflocknwa.org/)**.

---

## Key Features

- **Interactive ALPR Map**: Leaflet.js map with CartoDB Dark Matter styling visualizing verified Flock Safety camera installations, operating agencies, and coordinates.
- **Automated Intelligence & News Feed**: Scrapes and analyzes national and local ALPR reporting, classifying stories into community victories ("Wins") and documented abuses/leaks ("Flags").
- **Nightly Curator Pipeline**: Headless Python script (`scripts/curate_news.py`) running daily via GitHub Actions to ingest RSS feeds, score articles by locality and source authority, and update `data/news.json`.
- **Arkansas FOIA Request Generator**: Interactive generator calibrated for Arkansas Freedom of Information Act (A.C.A. § 25-19-101 et seq.) requests with 3-day turnaround notices and 1-click clipboard copying. Includes municipal presets for:
  - City of Rogers
  - City of Fayetteville
  - City of Bentonville
  - City of Springdale
  - Benton County Sheriff's Office
  - Washington County Sheriff's Office
- **Direct Municipal Action**: Pre-formatted mailto triggers and talking point guides for engaging city council members and county quorums.
- **Research & Deep Dives**: Editorial essays covering the 30-day retention loophole, inter-agency network sharing, and First/Fourth Amendment concerns.
- **Dual-Panel Threat Tracker**: Interactive categorization of nationwide contract cancellations alongside constitutional lawsuits and officer misuses.
- **Zero-Tracking Privacy Pledge**: Completely static with zero telemetry, zero cookies, zero analytics, and no third-party trackers.

---

## Project Structure

```
deflock-nwa/
├── .github/
│   └── workflows/
│       └── nightly-curator.yml  # Automated nightly news ingestion workflow
├── assets/
│   ├── css/
│   │   └── custom.css           # Terminal/cyberpunk UI theme, responsive tweaks
│   └── js/
│       ├── app.js               # Map logic, FOIA generator, intelligence feeds, modals
│       └── map-data.js          # ALPR node coordinates, agencies, and metadata
├── data/
│   └── news.json                # Curated, scored, and categorized news dataset
├── scripts/
│   └── curate_news.py           # RSS scraper & heuristic importance scoring engine
├── CNAME                        # Custom domain pointer (deflocknwa.org)
├── index.html                   # Core single-page application & SEO metadata
├── LICENSE                      # Public domain dedication (The Unlicense)
├── README.md                    # Project documentation & maintainer guide
├── robots.txt                   # Search crawler directives
└── sitemap.xml                  # Search index sitemap with deep links
```

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend UI** | HTML5 + Tailwind CSS (CDN) | Semantic structure and rapid utility styling |
| **Styling & Theme** | Custom CSS (`assets/css/custom.css`) | Dark-mode terminal theme, custom scanline effects |
| **Typography** | Google Fonts (`JetBrains Mono`, `Inter`) | Modern monospace and clean readability |
| **Interactive Map** | Leaflet.js 1.9.4 + CartoDB Dark Matter | High-contrast geospatial visualization |
| **Client Logic** | Vanilla JavaScript ES6+ (`app.js`) | State management, FOIA generation, DOM manipulation |
| **News Automation** | Python 3 + `urllib` / `xml.etree` | Zero-dependency RSS parser & heuristic scorer |
| **CI/CD** | GitHub Actions (`nightly-curator.yml`) | Nightly cron to curate and commit fresh intelligence |
| **Hosting** | GitHub Pages | Static hosting with custom domain and HTTPS |

---

## Quick Start (Local Preview)

The web client is 100% static and requires no compilation, bundler, or package manager.

### 1. Serve the Website Locally

```bash
# Clone the repository
git clone https://github.com/Steve-Madden-Commits/deflock-nwa.git
cd deflock-nwa

# Serve with Python 3
python3 -m http.server 8080

# Or serve with Node.js
npx serve .
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### 2. Run the News Ingestion Pipeline

To test or manually trigger the automated news curation engine:

```bash
python scripts/curate_news.py
```

The script will:
1. Query Google News RSS for Flock Safety and Arkansas ALPR surveillance keywords.
2. Filter and score articles from 0–100 based on:
   - **Locality (+40 pts)**: Detects Arkansas and NWA cities (Fayetteville, Bentonville, Rogers, Springdale, etc.).
   - **Source Authority (+25 pts)**: High-trust outlets (EFF, ACLU, Institute for Justice, 404 Media, Wired, AP, etc.).
   - **Category Match (+8–25 pts)**: Evaluates whether the event is a contract termination ("win") or abuse/leak ("flag").
3. Deduplicate against existing entries in `data/news.json`.
4. Write out the updated dataset for immediate consumption by `index.html`.

---

## Automation & Intelligence Pipeline

The news intelligence feed updates automatically without manual intervention:

- **Schedule**: The GitHub Actions workflow ([`.github/workflows/nightly-curator.yml`](.github/workflows/nightly-curator.yml)) runs every morning at **06:00 UTC (1:00 AM CST)**.
- **Workflow Steps**:
  1. Checks out repository.
  2. Configures Python 3.11 environment.
  3. Executes `python scripts/curate_news.py`.
  4. Commits and pushes any modifications to `data/news.json` with `[skip ci]`.
- **Manual Trigger**: Can also be triggered on demand via the GitHub Actions **Run workflow** button (`workflow_dispatch`).

---

## Deployment

### GitHub Pages (Active Production)

This project is deployed to GitHub Pages with the custom domain `deflocknwa.org`:

1. Under repository **Settings → Pages**:
   - Source: Deploy from branch `main` / root (`/`).
   - Custom domain: `deflocknwa.org`.
   - Enforce HTTPS: Enabled.
2. The [`CNAME`](CNAME) file in the root ensures DNS resolution for apex and `www` domains.

### Alternate Static Hosts

Because there is no build step, you can also deploy immediately to:

- **Cloudflare Pages**: `npx wrangler pages deploy .`
- **Vercel**: `vercel --prod`
- **Netlify**: Drag-and-drop the directory or connect repository.

---

## Data Sources & Contributing

Camera installations and intelligence updates rely on public records and open-source intelligence:

- **Physical Observations**: Volunteer field logging and photo verification across Benton and Washington counties.
- **OpenStreetMap & DeFlock**: Upstream submissions to [deflock.org](https://deflock.org).
- **Public Disclosures**: City council meeting minutes, purchasing requisitions, police department budget requests, and municipal contracts.
- **FOIA Disclosures**: Responsive records obtained under the Arkansas Freedom of Information Act.

> [!TIP]
> **Submitting Verified Cameras**: To contribute to the statewide and global dataset, submit locations directly at [deflock.org](https://deflock.org).

### Adding Camera Nodes Directly

To add or update a verified camera marker directly on this site:
1. Open [`assets/js/map-data.js`](assets/js/map-data.js).
2. Append or edit an object in `NWA_ALPR_MARKERS`:
   ```javascript
   {
     id: "NWA-031",
     lat: 36.3341,
     lng: -94.1288,
     location: "Intersection description / Mile marker",
     agency: "Rogers Police Dept",
     operator: "Flock Safety",
     vendor: "Flock Falcon",
     status: "Active"
   }
   ```
3. Submit a pull request.

---

## Privacy Policy

DEFLOCK NWA adheres to strict anti-surveillance privacy principles:

- **No Cookies**: No session, persistent, or third-party cookies.
- **No Analytics**: Zero Google Analytics, Plausible, Mixpanel, or telemetry scripts.
- **No Third-Party Loggers**: No remote database logging of visitor IP addresses or locations.
- **Open Code**: Every asset, script, and stylesheet is client-visible and auditable.

---

## Resources & Coalitions

- [DeFlock.org](https://deflock.org) — Global open-source map of ALPR cameras.
- [EFF Atlas of Surveillance](https://atlasofsurveillance.org/) — Documenting police surveillance technology.
- [ACLU of Arkansas](https://www.acluarkansas.org/) — Defending civil liberties and privacy rights statewide.
- [Institute for Justice (IJ)](https://ij.org/) — Challenging warrantless dragnet surveillance nationwide.
- [404 Media ALPR Reporting](https://www.404media.co/) — Investigative coverage of surveillance tech and data brokering.

---

## License

Dedicated to the public domain under the [Unlicense](LICENSE) / Creative Commons Zero. Share, mirror, fork, and adapt freely.
