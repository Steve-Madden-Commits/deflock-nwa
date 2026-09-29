/**
 * app.js: DEFLOCK NWA
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
    // Map section is hidden pending tile/API source resolution.
    // Remove this guard (and the `hidden` attribute on #map-section) to re-enable.
    const mapSection = document.getElementById('map-section');
    if (!mapEl || !mapSection || mapSection.hasAttribute('hidden')) return;

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
     4. EMAIL FORM VALIDATION & BUTTONDOWN INTEGRATION
     ────────────────────────────────────────────────────────────────── */
  function initEmailForm() {
    var form = document.getElementById('alert-form');
    var input = document.getElementById('alert-email');
    var feedback = document.getElementById('alert-feedback');

    if (!form || !input || !feedback) return;

    form.addEventListener('submit', function (e) {
      var email = input.value.trim();
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        e.preventDefault();
        feedback.textContent = 'INVALID EMAIL FORMAT';
        feedback.style.color = '#ef4444';
        feedback.style.display = 'block';
        return;
      }

      // Valid email: allow browser to POST to Buttondown in new tab
      feedback.textContent = 'CHECK INBOX: Confirmation sent to ' + escapeHtml(email);
      feedback.style.color = '#10b981';
      feedback.style.display = 'block';

      setTimeout(function () {
        input.value = '';
      }, 400);
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
     7. NEWS FEED
     ────────────────────────────────────────────────────────────────── */

  // type: 'win'  → community win, removal, ban, pushback (green)
  // type: 'flag' → documented abuse, misuse, civil-rights concern (red)
  // scope: 'local' | 'national'
  // live articles fetched from RSS; merged with static curated articles
  var liveArticles = [];
  var renderNewsFeed = null; // set by initNewsFeed, called by initLiveFeed

  var NEWS_ARTICLES = [
    {
      type: 'win',
      scope: 'local',
      headline: 'Pea Ridge Police Department Discontinues Flock Safety License Plate Reader Program',
      excerpt: 'After community feedback on privacy and public trust, Pea Ridge PD announced it would end its Flock Safety contract — joining Centerton, Farmington, and other NWA cities that have walked away from the system.',
      source: '5NEWS / KUAF Public Radio',
      date: 'Jul 2026',
      url: 'https://www.5newsonline.com/article/news/local/pea-ridge-police-discontinues-flock-safety-license-plate-reader-program/527-e9bb35de-efee-4239-9594-5a780db5060a'
    },
    {
      type: 'win',
      scope: 'local',
      headline: 'Washington County Quorum Court Votes 13–2 to Ban ALPR Spending',
      excerpt: 'On September 17, 2026, the Washington County Quorum Court passed an ordinance prohibiting county funds from being spent on automated license plate reader systems like Flock Safety, citing privacy risks and surveillance concerns.',
      source: 'Conduit News / 5NEWS',
      date: 'Sep 2026',
      url: 'https://conduitnews.com/2026/09/17/washington-county-quorum-court-bans-use-of-county-funds-for-license-plate-readers/'
    },
    {
      type: 'win',
      scope: 'local',
      headline: 'Centerton City Council Unanimously Votes to Terminate Flock Safety Contract',
      excerpt: 'The Centerton City Council voted unanimously on August 11, 2026 to end its Flock Safety agreement after residents raised sustained concerns about data privacy, access controls, and the lack of local oversight.',
      source: 'Delta-Plex News',
      date: 'Aug 2026',
      url: 'https://deltaplexnews.com/2026/08/centerton-city-council-votes-to-terminate-flock-safety-contract/'
    },
    {
      type: 'win',
      scope: 'local',
      headline: 'Farmington PD Lets Flock Safety Contract Expire, Citing False Alerts and Reduced Data Access',
      excerpt: 'The Farmington Police Department did not renew its Flock Safety contract after it expired August 10, 2026 — citing technical issues including false stolen-plate alerts and Flock cutting the department\'s data window from 30 days to just 7.',
      source: 'NWA Report',
      date: 'Aug 2026',
      url: 'https://neareport.com/2026/08/farmington-police-flock-safety-contract-not-renewed/'
    },
    {
      type: 'flag',
      scope: 'national',
      headline: 'Texas Sheriff Used 83,000 Flock Cameras to Track Woman Suspected of Self-Managing an Abortion',
      excerpt: 'EFF reporting confirmed Johnson County, TX deputies queried Flock\'s nationwide ALPR network specifically noting "had an abortion, search for female" — directly contradicting the department\'s claim it was a welfare check.',
      source: 'Electronic Frontier Foundation',
      date: 'May 2025',
      url: 'https://www.eff.org/deeplinks/2025/05/she-got-abortion-so-texas-cop-used-83000-cameras-track-her-down'
    },
    {
      type: 'flag',
      scope: 'national',
      headline: 'Flock Safety and Texas Sheriff Lied: Abortion Search Was Not a Missing Person Case',
      excerpt: 'Follow-up EFF investigation using court documents proved that both Flock Safety and the Johnson County Sheriff\'s Office misrepresented the 2025 abortion-related ALPR search as a "missing person" case when internal logs said otherwise.',
      source: 'Electronic Frontier Foundation',
      date: 'Oct 2025',
      url: 'https://www.eff.org/deeplinks/2025/10/flock-safety-and-texas-sheriff-claimed-license-plate-search-was-missing-person-it-was'
    },
    {
      type: 'flag',
      scope: 'national',
      headline: 'At Least 100 Police Officers Disciplined, Charged, or Fired for Misusing Flock ALPR Systems',
      excerpt: 'The Washington Post and Institute for Justice documented over 100 law enforcement personnel accused of misusing Flock cameras for personal stalking — often of romantic interests — with many departments lacking any proactive audit systems.',
      source: 'The Washington Post / Institute for Justice',
      date: 'Aug–Sep 2026',
      url: 'https://www.washingtonpost.com/technology/2026/08/flock-safety-police-stalking-license-plate/'
    },
    {
      type: 'flag',
      scope: 'national',
      headline: 'Five Albany, Georgia Officers Fired and Arrested for Using Flock for Personal Surveillance',
      excerpt: 'A Flock Safety internal audit revealed five Albany PD officers had used the ALPR system for non-law enforcement purposes. All five were terminated and arrested; the Georgia Bureau of Investigation took over the cases.',
      source: 'CBS News',
      date: 'Jul 2026',
      url: 'https://www.cbsnews.com/news/georgia-officers-arrested-flock-safety-license-plate-misuse/'
    },
    {
      type: 'flag',
      scope: 'national',
      headline: 'Five Indianapolis Officers Criminally Charged for Misusing Flock Cameras to Stalk Women',
      excerpt: 'Indianapolis IMPD officer Jonathan Schultz faced 26 criminal charges — including stalking — after conducting 1,396 unauthorized Flock searches on women he met off-duty. Four other officers were also charged or forced out.',
      source: 'Gizmodo / Newsweek',
      date: 'Sep 2026',
      url: 'https://gizmodo.com/five-indianapolis-cops-charged-with-misusing-flock-cameras-including-one-case-of-stalking/'
    },
    {
      type: 'flag',
      scope: 'national',
      headline: 'ACLU: Flock Safety\'s Network Is Being Used by ICE for Immigration Enforcement',
      excerpt: 'ACLU research and audit logs from Denver and other cities confirmed that ICE accessed Flock\'s national data-sharing portal to track vehicles for deportation operations — often without the knowledge of local departments whose data was queried.',
      source: 'ACLU',
      date: '2025–2026',
      url: 'https://www.aclu.org/fighting-creepy-alpr-cameras'
    },
    {
      type: 'flag',
      scope: 'national',
      headline: 'Florida Woman Jailed 13 Days After Flock Camera Misidentified Her Vehicle in Fatal Hit-and-Run',
      excerpt: 'Lindsey Isaacs spent 13 days in jail — including 86 hours in isolation — after Florida Highway Patrol relied on a Flock ALPR hit that misidentified her black SUV as the maroon Durango involved in a triple-fatal crash. She later testified before the U.S. Senate.',
      source: 'FOX 13 Tampa Bay',
      date: 'Oct 2025',
      url: 'https://www.fox13news.com/news/florida-woman-wrongfully-jailed-flock-safety-license-plate-hit-run'
    },
    {
      type: 'flag',
      scope: 'national',
      headline: 'Senate Hearing "Always Watching" Puts Flock Safety\'s Nationwide AI Surveillance Under Federal Scrutiny',
      excerpt: 'The U.S. Senate Judiciary Subcommittee on Crime and Counterterrorism held a September 2026 hearing into Flock\'s 120,000-camera network, with ACLU testimony and wrongful-arrest victims describing a system with no meaningful federal oversight.',
      source: 'U.S. Senate Judiciary Committee',
      date: 'Sep 2026',
      url: 'https://www.judiciary.senate.gov/committee-activity/hearings/always-watching-flocks-nationwide-ai-surveillance-network'
    },
    {
      type: 'flag',
      scope: 'local',
      headline: 'Rogers PD ALPR Query Logs Show Hundreds of Searches With No Case Reference',
      excerpt: 'FOIA responses obtained by community researchers revealed Rogers Police Department officers ran hundreds of Flock Safety plate queries over a six-month period with no associated incident number or documented investigative purpose.',
      source: 'DEFLOCK NWA / FOIA Records',
      date: '2024',
      url: '#foia'
    },
    {
      type: 'win',
      scope: 'national',
      headline: 'Maine\'s 21-Day ALPR Retention Limit Remains the Strictest Protective Law in the Nation',
      excerpt: 'Maine\'s statute (29-A M.R.S. § 2117-A) mandates deletion of non-investigative plate data within 21 days and bans all private ALPR use — the only law of its kind in the U.S., and a model advocates are pushing other states to adopt.',
      source: 'Maine Legislature / ACLU of Maine',
      date: '2009 / ongoing',
      url: 'https://www.aclumaine.org/en/legislation/sb-3-act-protect-maine-citizens-use-automated-license-plate-readers'
    },
    {
      type: 'win',
      scope: 'national',
      headline: 'Institute for Justice Launches ALPR Abuse Tracker: 140+ Documented Incidents Nationwide',
      excerpt: 'The Institute for Justice published a searchable database of over 140 confirmed ALPR abuse cases by law enforcement, including romantic stalking, wrongful stops, and unauthorized personal surveillance — most discovered only through victim reports rather than internal audits.',
      source: 'Institute for Justice',
      date: 'Aug 2026',
      url: 'https://ij.org/issues/privacy/plate-privacy/'
    },
    {
      type: 'flag',
      scope: 'national',
      headline: 'ACLU Campaign: Flock\'s Network Tracks Where You Pray, Protest, and Seek Medical Care',
      excerpt: 'The ACLU\'s national campaign against ALPR "creep" documents how Flock\'s vehicle-journey maps can reveal attendance at mosques, abortion providers, union halls, and political protests — with no warrant requirement at any point.',
      source: 'ACLU',
      date: '2025–2026',
      url: 'https://www.aclu.org/fighting-creepy-alpr-cameras'
    }
  ];

  var PANEL_INIT = 2; // articles shown before "view more"

  function buildCompactRow(article) {
    var typeClass  = article.type === 'win' ? 'win' : 'flag';
    var scopeLabel = article.scope === 'local' ? 'Local \u00b7 NWA' : 'National';
    var liveChip   = article.live
      ? '<span class="news-row__live">LIVE</span>'
      : '';

    var row = document.createElement('a');
    row.className = 'news-row news-row--' + typeClass;
    row.href      = article.url;
    row.target    = article.url.startsWith('#') ? '_self' : '_blank';
    row.rel       = article.url.startsWith('#') ? '' : 'noopener noreferrer';
    row.setAttribute('role', 'listitem');
    row.title     = article.excerpt || '';

    row.innerHTML =
      '<div class="news-row__accent" aria-hidden="true"></div>' +
      '<div class="news-row__content">' +
        '<p class="news-row__title">' + liveChip + escapeHtml(article.headline) + '</p>' +
        '<div class="news-row__meta">' +
          '<span class="news-row__source">' +
            escapeHtml(article.source) + ' \u00b7 ' + escapeHtml(article.date) +
          '</span>' +
          '<span class="news-row__scope">' + scopeLabel + '</span>' +
        '</div>' +
      '</div>' +
      '<svg class="news-row__arrow" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>';

    return row;
  }

  function renderPanel(listEl, moreBtn, countEl, articles, expanded) {
    if (!listEl) return;
    listEl.innerHTML = '';
    var visible = expanded ? articles : articles.slice(0, PANEL_INIT);
    visible.forEach(function (a) { listEl.appendChild(buildCompactRow(a)); });

    if (countEl) countEl.textContent = articles.length;

    if (moreBtn) {
      var remaining = articles.length - PANEL_INIT;
      if (remaining > 0 && !expanded) {
        moreBtn.textContent = '+ ' + remaining + ' more ' + (remaining === 1 ? 'story' : 'stories');
        moreBtn.hidden = false;
      } else {
        moreBtn.hidden = true;
      }
    }
  }

  function initDualPanel() {
    var winList   = document.getElementById('news-win-list');
    var flagList  = document.getElementById('news-flag-list');
    var winMore   = document.getElementById('news-win-more');
    var flagMore  = document.getElementById('news-flag-more');
    var winCount  = document.getElementById('news-win-count');
    var flagCount = document.getElementById('news-flag-count');

    if (!winList && !flagList) return;

    var winExpanded  = false;
    var flagExpanded = false;

    function allArticles() { return liveArticles.concat(NEWS_ARTICLES); }

    function doRender() {
      var wins  = allArticles().filter(function (a) { return a.type === 'win';  });
      var flags = allArticles().filter(function (a) { return a.type === 'flag'; });
      renderPanel(winList,  winMore,  winCount,  wins,  winExpanded);
      renderPanel(flagList, flagMore, flagCount, flags, flagExpanded);
    }

    // Expose for initLiveFeed to call after RSS fetch
    renderNewsFeed = doRender;

    if (winMore)  winMore.addEventListener('click',  function () { winExpanded  = true; doRender(); });
    if (flagMore) flagMore.addEventListener('click', function () { flagExpanded = true; doRender(); });

    // Attempt to load nightly-scored articles from data/news.json
    fetch('data/news.json')
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (Array.isArray(data) && data.length > 0) {
          NEWS_ARTICLES = data;
          doRender();
        }
      })
      .catch(function () {});

    doRender();
  }


  /* ──────────────────────────────────────────────────────────────────
     8. LIVE RSS FEED
     Fetches Google News RSS for "Flock Safety" via rss2json.com proxy.
     Results are cached in sessionStorage for 1 hour to avoid API abuse.
     Articles are auto-classified win/flag by keyword scoring.
     ────────────────────────────────────────────────────────────────── */

  var LIVE_CACHE_KEY = 'deflock_live_v1';
  var LIVE_CACHE_TTL = 60 * 60 * 1000; // 1 hour
  var RSS_PROXY     = 'https://api.rss2json.com/v1/api.json?count=12&rss_url=';
  var RSS_FEEDS     = [
    'https://news.google.com/rss/search?q=%22flock+safety%22+license+plate&hl=en-US&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=ALPR+%22license+plate+reader%22+police+privacy&hl=en-US&gl=US&ceid=US:en'
  ];

  var WIN_KW  = ['remov', 'terminat', 'cancel', 'discontinu', 'ban', 'banned', 'drop', 'reject', 'vote against', 'end contract', 'no renewal', 'legislation', 'privacy law', 'protection', 'reform', 'victory', 'overturned'];
  var FLAG_KW = ['misuse', 'abus', 'stalk', 'wrongful arrest', 'false arrest', 'ICE', 'immigrat', 'deport', 'protest', 'fired', 'charged', 'indicted', 'lawsuit', 'sued', 'unconstitution', 'warrantless', 'surveillance', 'data breach', 'hack', 'dossier'];

  function scoreLive(text) {
    var t = text.toLowerCase();
    var w = WIN_KW.reduce(function (n, kw) { return n + (t.indexOf(kw) !== -1 ? 1 : 0); }, 0);
    var f = FLAG_KW.reduce(function (n, kw) { return n + (t.indexOf(kw) !== -1 ? 1 : 0); }, 0);
    return f >= w ? 'flag' : 'win';
  }

  function stripTags(html) {
    var d = document.createElement('div');
    d.innerHTML = html || '';
    return (d.textContent || d.innerText || '').trim();
  }

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); }
    catch (e) { return 'News'; }
  }

  function shortDate(str) {
    try {
      return new Date(str).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) { return ''; }
  }

  function dedupeByTitle(arr) {
    var seen = {};
    return arr.filter(function (a) {
      var key = a.headline.toLowerCase().substring(0, 60);
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function parseItems(items) {
    return (items || []).map(function (item) {
      var title   = stripTags(item.title || '');
      var desc    = stripTags(item.description || '').substring(0, 220);
      var srcHost = item.author ? item.author : hostOf(item.link || '');
      return {
        type:    scoreLive(title + ' ' + desc),
        scope:   'national',
        headline: title,
        excerpt:  desc + (desc.length >= 220 ? '…' : ''),
        source:   srcHost,
        date:     shortDate(item.pubDate || ''),
        url:      item.link || '#',
        live:     true
      };
    });
  }

  function setLiveStatus(state, ts) {
    var el    = document.getElementById('news-live-status');
    var tsEl  = document.getElementById('news-live-ts');
    var label = document.getElementById('news-live-label');
    if (!el) return;
    el.className = 'news-live-indicator news-live-indicator--' + state;
    if (label) {
      label.textContent = state === 'ok' ? 'Live' : state === 'loading' ? 'Fetching…' : 'Offline';
    }
    if (tsEl && ts) {
      tsEl.textContent = 'Updated ' + new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
  }

  function fetchFeed(url, callback) {
    fetch(RSS_PROXY + encodeURIComponent(url))
      .then(function (r) { return r.json(); })
      .then(function (d) { callback(null, d.status === 'ok' ? d.items : []); })
      .catch(function (e) { callback(e, []); });
  }

  function initLiveFeed() {
    var refreshBtn = document.getElementById('news-refresh');

    function doFetch(bustCache) {
      // Serve from cache if fresh
      if (!bustCache) {
        try {
          var raw = sessionStorage.getItem(LIVE_CACHE_KEY);
          if (raw) {
            var cached = JSON.parse(raw);
            if (Date.now() - cached.ts < LIVE_CACHE_TTL) {
              liveArticles = cached.articles;
              if (renderNewsFeed) renderNewsFeed();
              setLiveStatus('ok', cached.ts);
              return;
            }
          }
        } catch (e) { /* ignore */ }
      }

      setLiveStatus('loading', null);
      if (refreshBtn) { refreshBtn.disabled = true; refreshBtn.classList.add('spinning'); }

      var results = [];
      var pending = RSS_FEEDS.length;

      RSS_FEEDS.forEach(function (feedUrl) {
        fetchFeed(feedUrl, function (err, items) {
          if (!err && items && items.length) {
            results = results.concat(parseItems(items));
          }
          pending--;
          if (pending === 0) {
            // Dedupe, cap at 9 live cards
            liveArticles = dedupeByTitle(results).slice(0, 9);
            var ts = Date.now();
            try {
              sessionStorage.setItem(LIVE_CACHE_KEY, JSON.stringify({ articles: liveArticles, ts: ts }));
            } catch (e) { /* quota exceeded — skip caching */ }

            if (renderNewsFeed) renderNewsFeed();
            setLiveStatus(liveArticles.length > 0 ? 'ok' : 'error', ts);
            if (refreshBtn) { refreshBtn.disabled = false; refreshBtn.classList.remove('spinning'); }
          }
        });
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', function () {
        try { sessionStorage.removeItem(LIVE_CACHE_KEY); } catch (e) {}
        doFetch(true);
      });
    }

    doFetch(false);
  }

  /* ──────────────────────────────────────────────────────────────────
     7. CRYPTO WALLET COPY & AGGREGATOR
     ────────────────────────────────────────────────────────────────── */
  window.copyCryptoAddress = function (elementId, btnElement) {
    var input = document.getElementById(elementId);
    if (!input) return;
    input.select();
    var val = input.value;

    function handleSuccess() {
      var orig = btnElement.textContent;
      btnElement.textContent = 'Copied!';
      btnElement.classList.add('success');
      setTimeout(function () {
        btnElement.textContent = orig;
        btnElement.classList.remove('success');
      }, 2000);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(val).then(handleSuccess).catch(function () {
        fallbackCopyVal(val, handleSuccess);
      });
    } else {
      fallbackCopyVal(val, handleSuccess);
    }
  };

  function fallbackCopyVal(text, onSuccess) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      if (onSuccess) onSuccess();
    } catch (err) {}
    document.body.removeChild(ta);
  }

  function initCryptoAggregator() {
    var tabs = document.querySelectorAll('.crypto-tab');
    tabs.forEach(function (button) {
      button.addEventListener('click', function () {
        tabs.forEach(function (btn) {
          btn.classList.remove('active');
          btn.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.crypto-panel').forEach(function (panel) {
          panel.classList.remove('active');
        });

        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
        var targetId = button.getAttribute('data-target');
        var target = document.getElementById(targetId);
        if (target) {
          target.classList.add('active');
        }
      });
    });
  }

  function initWalletCopy() {
    initCryptoAggregator();
    var copyButtons = document.querySelectorAll('.wallet-copy-btn');
    copyButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-target');
        var addressEl = document.getElementById(targetId);
        if (!addressEl) return;
        var address = addressEl.getAttribute('data-wallet') || addressEl.textContent.trim();

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(address).then(function () {
            var orig = btn.textContent;
            btn.textContent = 'COPIED TO CLIPBOARD!';
            btn.style.borderColor = '#10b981';
            btn.style.color = '#10b981';
            setTimeout(function () {
              btn.textContent = orig;
              btn.style.borderColor = '';
              btn.style.color = '';
            }, 2000);
          }).catch(function () {
            fallbackCopy(address, btn);
          });
        } else {
          fallbackCopy(address, btn);
        }
      });
    });

    function fallbackCopy(text, btn) {
      fallbackCopyVal(text, function () {
        var orig = btn.textContent;
        btn.textContent = 'COPIED!';
        setTimeout(function () { btn.textContent = orig; }, 2000);
      });
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     8. BUTTONDOWN BLOG RSS AUTO-SYNC
     Fetches https://buttondown.com/DeFlockNWA/rss via rss2json proxy.
     Dynamically renders published newsletter dispatches into #blog-posts-grid.
     If no newsletters have been published yet, retains starter field notes.
     ────────────────────────────────────────────────────────────────── */
  function initBlogFeed() {
    var grid = document.getElementById('blog-posts-grid');
    if (!grid) return;

    var buttondownRss = 'https://buttondown.com/DeFlockNWA/rss';
    var proxyUrl = 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(buttondownRss);

    fetch(proxyUrl)
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (!data || !Array.isArray(data.items) || data.items.length === 0) return;

        // Clean out fallback cards if live dispatches exist
        grid.innerHTML = '';

        data.items.slice(0, 4).forEach(function (item, idx) {
          var article = document.createElement('article');
          article.className = 'border border-neutral-800 bg-[#0d0d10] p-6 hover:border-neutral-700 transition-colors flex flex-col justify-between';

          var cleanDesc = stripTags(item.description || item.content || '');
          if (cleanDesc.length > 200) {
            cleanDesc = cleanDesc.substring(0, 197) + '...';
          }

          var dateStr = shortDate(item.pubDate || '');

          article.innerHTML =
            '<div>' +
              '<div class="flex items-center justify-between text-neutral-500 font-mono text-xs mb-3">' +
                '<span class="flex items-center gap-1.5"><span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>NEWSLETTER #' + (data.items.length - idx) + '</span>' +
                '<span>' + escapeHtml(dateStr) + '</span>' +
              '</div>' +
              '<h3 class="font-mono text-base font-bold text-neutral-100 mb-2">' +
                escapeHtml(item.title || 'Untitled Dispatch') +
              '</h3>' +
              '<p class="text-neutral-400 text-xs leading-relaxed mb-4">' +
                escapeHtml(cleanDesc) +
              '</p>' +
            '</div>' +
            '<div class="flex items-center justify-between text-xs font-mono pt-3 border-t border-neutral-800">' +
              '<span class="text-emerald-400">DISPATCH</span>' +
              '<a href="' + escapeHtml(item.link || 'https://buttondown.com/DeFlockNWA/archive') + '" target="_blank" rel="noopener noreferrer" class="text-neutral-400 hover:text-neutral-200">Read Full Issue &rarr;</a>' +
            '</div>';

          grid.appendChild(article);
        });
      })
      .catch(function () {
        // Keep fallback field notes in place silently
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
    initDualPanel();   // sets renderNewsFeed
    initLiveFeed();   // fetches RSS, then calls renderNewsFeed
    initWalletCopy();
    initBlogFeed();
  });

})();
