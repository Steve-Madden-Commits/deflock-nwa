/**
 * app.js — DEFLOCK NWA
 * Initializes Leaflet map, renders ALPR markers, handles
 * smooth anchor scrolling, FOIA template generation, and clipboard copy.
 */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────────────────────────
     1. LEAFLET MAP
     ────────────────────────────────────────────────────────────────── */
  function initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    const map = L.map('map', {
      center: [36.25, -94.15],
      zoom: 10,
      zoomControl: true,
      scrollWheelZoom: true,
      attributionControl: true
    });

    // CartoDB Dark Matter tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Custom marker icon
    const cameraIcon = L.divIcon({
      className: 'custom-marker',
      html: '<div style="width:12px;height:12px;background:#ef4444;border:2px solid #fca5a5;border-radius:50%;box-shadow:0 0 8px rgba(239,68,68,0.6);"></div>',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
      popupAnchor: [0, -10]
    });

    // Render markers from map-data.js
    if (typeof NWA_ALPR_MARKERS !== 'undefined') {
      NWA_ALPR_MARKERS.forEach(function (cam) {
        const popupContent = buildPopup(cam);
        L.marker([cam.lat, cam.lng], { icon: cameraIcon })
          .addTo(map)
          .bindPopup(popupContent, { maxWidth: 320, minWidth: 240 });
      });
    }

    // Invalidate map size after a slight delay (handles hidden containers)
    setTimeout(function () { map.invalidateSize(); }, 200);
  }

  function buildPopup(cam) {
    return '<div>' +
      '<div class="popup-header">' + escapeHtml(cam.id) + '</div>' +
      '<div class="popup-row"><span class="popup-key">Location</span><span class="popup-val">' + escapeHtml(cam.location) + '</span></div>' +
      '<div class="popup-row"><span class="popup-key">Agency</span><span class="popup-val">' + escapeHtml(cam.agency) + '</span></div>' +
      '<div class="popup-row"><span class="popup-key">Operator</span><span class="popup-val">' + escapeHtml(cam.operator) + '</span></div>' +
      '<div class="popup-row"><span class="popup-key">Vendor</span><span class="popup-val">' + escapeHtml(cam.vendor) + '</span></div>' +
      '<div class="popup-row"><span class="popup-key">Coords</span><span class="popup-val">' + cam.lat.toFixed(4) + ', ' + cam.lng.toFixed(4) + '</span></div>' +
      '<div class="popup-row"><span class="popup-key">Status</span><span class="popup-val" style="color:#10b981;">● ' + escapeHtml(cam.status) + '</span></div>' +
      '<a class="popup-link" href="https://deflock.org" target="_blank" rel="noopener noreferrer">→ Submit corrections on DeFlock.org</a>' +
      '</div>';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ──────────────────────────────────────────────────────────────────
     2. SMOOTH ANCHOR SCROLLING
     ────────────────────────────────────────────────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Update URL hash without jumping
          history.pushState(null, '', this.getAttribute('href'));
        }
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     3. FOIA TEMPLATE GENERATOR
     ────────────────────────────────────────────────────────────────── */
  var foiaTemplates = {
    'City of Rogers': {
      recipient: 'City Clerk, City of Rogers',
      address: '301 W Chestnut St, Rogers, AR 72756',
      body: generateFoiaBody('City of Rogers', 'Rogers Police Department')
    },
    'City of Fayetteville': {
      recipient: 'City Clerk, City of Fayetteville',
      address: '113 W Mountain St, Fayetteville, AR 72701',
      body: generateFoiaBody('City of Fayetteville', 'Fayetteville Police Department')
    },
    'City of Bentonville': {
      recipient: 'City Clerk, City of Bentonville',
      address: '117 W Central Ave, Bentonville, AR 72712',
      body: generateFoiaBody('City of Bentonville', 'Bentonville Police Department')
    },
    'Benton County Sheriff\'s Office': {
      recipient: 'Benton County Sheriff\'s Office, FOIA Custodian',
      address: '1300 SW 14th St, Bentonville, AR 72712',
      body: generateFoiaBody('Benton County Sheriff\'s Office', 'Benton County Sheriff\'s Office')
    },
    'City of Springdale': {
      recipient: 'City Clerk, City of Springdale',
      address: '201 Spring St, Springdale, AR 72764',
      body: generateFoiaBody('City of Springdale', 'Springdale Police Department')
    },
    'Washington County Sheriff\'s Office': {
      recipient: 'Washington County Sheriff\'s Office, FOIA Custodian',
      address: '1155 W Clydesdale Dr, Fayetteville, AR 72701',
      body: generateFoiaBody('Washington County Sheriff\'s Office', 'Washington County Sheriff\'s Office')
    }
  };

  function generateFoiaBody(entityName, agencyName) {
    var today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return 'Date: ' + today + '\n\n' +
      'To: ' + entityName + '\n' +
      'Re: Arkansas Freedom of Information Act Request (A.C.A. § 25-19-101 et seq.)\n\n' +
      'To Whom It May Concern:\n\n' +
      'Pursuant to the Arkansas Freedom of Information Act (FOIA), A.C.A. § 25-19-101 et seq., ' +
      'I am requesting access to and copies of the following public records held by or on behalf of ' +
      agencyName + ':\n\n' +
      '1. All contracts, memoranda of understanding (MOUs), service agreements, purchase orders, ' +
      'and invoices between ' + entityName + ' and Flock Safety, Inc. (or any subsidiary or affiliate) ' +
      'related to automated license plate reader (ALPR) cameras, surveillance technology, or ' +
      '"Flock Safety Falcon" camera systems.\n\n' +
      '2. All policies, standard operating procedures (SOPs), and guidelines governing the deployment, ' +
      'use, access, data retention, and data sharing of ALPR/LPR camera systems operated by or ' +
      'accessible to ' + agencyName + '.\n\n' +
      '3. Records identifying the number of ALPR cameras currently deployed by ' + agencyName + ', ' +
      'including their general locations (intersection, corridor, or GPS coordinates), installation dates, ' +
      'and whether each unit is owned, leased, or provided under a subscription/SaaS model.\n\n' +
      '4. Data-sharing agreements, fusion center participation records, or any documentation authorizing ' +
      'law enforcement agencies outside ' + entityName + '\'s jurisdiction to query, access, or receive ' +
      'ALPR data collected within your jurisdiction.\n\n' +
      '5. Any audits, reviews, or internal assessments of ALPR data access logs, including the number ' +
      'of queries performed, officers or agencies accessing the system, and any documented instances ' +
      'of misuse or unauthorized access.\n\n' +
      '6. Any communications (emails, memos, letters) between ' + entityName + ' officials and Flock Safety, Inc. ' +
      'regarding data retention periods, data deletion schedules, or law enforcement access protocols.\n\n' +
      '7. Records of any public hearings, city council votes, quorum court votes, or public comment ' +
      'periods held prior to the acquisition or deployment of ALPR technology by ' + agencyName + '.\n\n' +
      'I request that responsive documents be provided in electronic format (PDF preferred) to the ' +
      'email address below. If any portion of this request is denied, please cite the specific statutory ' +
      'exemption and provide a redacted version of the withheld records where applicable, as required ' +
      'under A.C.A. § 25-19-105(d).\n\n' +
      'As required by the FOIA, I expect a response within three (3) business days acknowledging ' +
      'receipt and providing an estimated timeline for production.\n\n' +
      'Thank you for your prompt attention to this request.\n\n' +
      'Sincerely,\n' +
      '[YOUR NAME]\n' +
      '[YOUR EMAIL]\n' +
      '[YOUR MAILING ADDRESS]';
  }

  function initFoia() {
    var select = document.getElementById('foia-target');
    var textarea = document.getElementById('foia-text');
    var copyBtn = document.getElementById('foia-copy');

    if (!select || !textarea || !copyBtn) return;

    // Set initial template
    updateFoiaText(select.value);

    select.addEventListener('change', function () {
      updateFoiaText(this.value);
    });

    copyBtn.addEventListener('click', function () {
      navigator.clipboard.writeText(textarea.value).then(function () {
        copyBtn.classList.add('copied');
        setTimeout(function () {
          copyBtn.classList.remove('copied');
        }, 2000);
      }).catch(function () {
        // Fallback for older browsers
        textarea.select();
        document.execCommand('copy');
        copyBtn.classList.add('copied');
        setTimeout(function () {
          copyBtn.classList.remove('copied');
        }, 2000);
      });
    });
  }

  function updateFoiaText(targetName) {
    var textarea = document.getElementById('foia-text');
    if (!textarea) return;

    var template = foiaTemplates[targetName];
    if (template) {
      textarea.value = template.body;
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     4. EMAIL FORM VALIDATION
     ────────────────────────────────────────────────────────────────── */
  function initEmailForm() {
    var form = document.getElementById('alert-form');
    var input = document.getElementById('alert-email');
    var feedback = document.getElementById('alert-feedback');

    if (!form || !input || !feedback) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = input.value.trim();
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        feedback.textContent = 'INVALID EMAIL FORMAT';
        feedback.style.color = '#ef4444';
        feedback.style.display = 'block';
        return;
      }

      // Simulate subscription (static site — no backend)
      feedback.textContent = '✓ REGISTERED — You will receive alerts at ' + escapeHtml(email);
      feedback.style.color = '#10b981';
      feedback.style.display = 'block';
      input.value = '';
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     5. LIVE CLOCK (system bar)
     ────────────────────────────────────────────────────────────────── */
  function initClock() {
    var clockEl = document.getElementById('system-clock');
    if (!clockEl) return;

    function tick() {
      var now = new Date();
      clockEl.textContent = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ──────────────────────────────────────────────────────────────────
     6. MOBILE NAV TOGGLE
     ────────────────────────────────────────────────────────────────── */
  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      menu.classList.toggle('hidden');
    });

    // Close menu on link click
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────────
     INIT
     ────────────────────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initMap();
    initSmoothScroll();
    initFoia();
    initEmailForm();
    initClock();
    initMobileNav();
  });

})();
