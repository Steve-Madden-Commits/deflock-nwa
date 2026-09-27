# DEFLOCK NWA — ALPR Surveillance Tracker

**Automated License Plate Reader (ALPR) surveillance accountability for Northwest Arkansas.**

Tracking Flock Safety camera deployments across Benton and Washington counties. No public referendum was held. No warrant is required.

---

## Quick Start

### Local Preview

Serve the static site from the project root:

```bash
# Python 3
cd nwa-deflock
python3 -m http.server 8000

# or Node.js
npx serve nwa-deflock
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

### Project Structure

```
nwa-deflock/
├── index.html              # Single-page application
├── assets/
│   ├── css/
│   │   └── custom.css      # Dark-mode styles, Leaflet overrides, animations
│   └── js/
│       ├── app.js           # Map init, FOIA generator, clipboard, smooth scroll
│       └── map-data.js      # ALPR camera coordinates and metadata
└── README.md
```

---

## Tech Stack

| Layer       | Technology                            |
|-------------|---------------------------------------|
| Markup      | Semantic HTML5                        |
| Styling     | Tailwind CSS (CDN) + Custom CSS       |
| Typography  | JetBrains Mono, Inter (Google Fonts)  |
| Mapping     | Leaflet.js 1.9.4 + CartoDB Dark Matter |
| Runtime     | Vanilla JavaScript (no build step)    |

---

## Deployment

This is a fully static site with no build step, no dependencies, and no server-side logic. Deploy the `nwa-deflock/` directory to any static host.

### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd nwa-deflock
vercel --prod
```

Or connect your GitHub repository and set the root directory to `nwa-deflock/`.

### Netlify

1. Go to [app.netlify.com](https://app.netlify.com)
2. Drag and drop the `nwa-deflock/` folder onto the deploy zone
3. Or connect your Git repo and set the publish directory to `nwa-deflock/`

No build command needed.

### GitHub Pages

1. Push the repository to GitHub
2. Go to **Settings → Pages**
3. Set the source to the branch and folder containing `index.html`
4. Your site will be live at `https://<username>.github.io/<repo>/`

### Cloudflare Pages

```bash
npx wrangler pages deploy nwa-deflock/
```

---

## Data Sources & Contributing

Camera locations are compiled from:
- Community field observations and volunteer mapping
- Benton County Sheriff's Office public records disclosures
- Rogers PD and Fayetteville PD procurement filings
- FOIA responses from NWA municipalities

**To submit verified ALPR camera locations**, visit [deflock.org](https://deflock.org) and contribute to the statewide OpenStreetMap-based dataset.

To add a marker to this site directly, edit `assets/js/map-data.js` and add an entry to the `NWA_ALPR_MARKERS` array.

---

## Privacy

This site:
- Does **not** use analytics, cookies, or tracking pixels
- Does **not** collect, store, or transmit any user data
- Does **not** load third-party scripts beyond Tailwind CSS, Google Fonts, Leaflet.js, and CARTO map tiles
- Is designed to be self-hosted and forked freely

---

## License

No copyright claimed. Public domain. Fork it, remix it, deploy it.

---

## Resources

- [EFF Atlas of Surveillance](https://atlasofsurveillance.org/)
- [ACLU of Arkansas](https://www.acluarkansas.org/)
- [DeFlock.org](https://deflock.org)
- [EFF — Automated License Plate Readers](https://www.eff.org/pages/automated-license-plate-readers-alpr)
