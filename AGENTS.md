# DEFLOCK NWA — Project Rules & Guidelines

This document defines operational rules, security constraints, and architectural standards for the DEFLOCK NWA repository. All automated agents and contributors must adhere to these directives.

---

## 1. Privacy, Security & Anti-Surveillance Standards

- **Strict Zero-Telemetry Policy**:
  - The project is 100% static. **Never** introduce cookies, analytics SDKs (e.g. Google Analytics, Mixpanel, Plausible), tracking pixels, remote logging scripts, or canvas fingerprinting.
  - External script inclusions must remain strictly minimal and limited to CDNs with public integrity hashes (Leaflet.js, Tailwind CDN, Google Fonts).

- **PII & Identifier Protection**:
  - **Never** hardcode personal names, personal email addresses, phone numbers, home addresses, or local OS paths (e.g., `C:\Users\...`).
  - Maintain public contact endpoints using only project aliases (`deflocknwa@proton.me`, `news@deflocknwa.org`).
  - Keep FOIA generators populated solely with bracketed placeholders (`[YOUR NAME]`, `[YOUR EMAIL]`, `[YOUR MAILING ADDRESS]`).
  - In git operations, always ensure author and committer emails use the GitHub anonymized no-reply proxy (`Steve-Madden-Commits@users.noreply.github.com`).

---

## 2. Data Schemas & Pipeline Integrity

### Camera Nodes (`assets/js/map-data.js`)
All camera markers in `NWA_ALPR_MARKERS` must adhere to this exact schema:
```javascript
{
  id: "NWA-XXX",                 // Unique sequential ID
  lat: 36.XXXX,                  // Latitude (float)
  lng: -94.XXXX,                 // Longitude (float)
  agency: "Rogers Police Dept",  // Responsible public entity
  operator: "Municipal PD",      // Operator category
  vendor: "Flock Safety",        // Hardware/service provider
  location: "Intersection description",
  corridor: "Travel corridor / arterial",
  status: "active",              // active | inactive | removed
  notes: "Contextual surveillance field notes"
}
```

### News Feed & Scorer (`data/news.json` & `scripts/curate_news.py`)
- News entries must include: `type` (`"win"` | `"flag"`), `scope` (`"local"` | `"national"`), `headline`, `excerpt`, `source`, `date`, `url`, `score` (0–100), and `pinned` (boolean).
- Automated news ingestion via `scripts/curate_news.py` must maintain zero external dependencies (Python standard library only: `urllib`, `xml.etree`, `json`, `re`).
- Never overwrite manually pinned articles (`pinned: true`) during automated ingestion.

---

## 3. Frontend & Design Language

- **Visual Aesthetic**:
  - Maintain the dark-mode terminal/cyberpunk aesthetic (`#09090b` base, `#0d0d10` elevated surfaces, `#10b981` / `#ef4444` indicator accents).
  - Use `JetBrains Mono` for data tables, metrics, badges, coordinates, and system readouts; use `Inter` for long-form editorial copy.
- **Client Performance**:
  - Pure vanilla JavaScript with event delegation and zero unnecessary libraries.
  - Always clean up event listeners and provide graceful fallbacks (e.g. `document.execCommand('copy')` fallback when `navigator.clipboard` is restricted).

---

## 4. SEO & Verification

- Whenever new sections or major content updates are introduced:
  - Update `sitemap.xml` with appropriate URL paths and `lastmod` dates.
  - Ensure Schema.org JSON-LD structured data in `index.html` remains synchronized.
  - Validate that all anchor navigation targets (`#scope`, `#foia`, `#action`, `#blog`, etc.) resolve properly without layout shifts.
