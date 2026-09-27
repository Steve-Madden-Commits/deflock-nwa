/**
 * map-data.js
 * ALPR camera coordinate data for Northwest Arkansas.
 * Sources: community mapping, public records requests, and field observations.
 * Submit verified locations: https://deflock.org
 */

const NWA_ALPR_MARKERS = [
  {
    id: "NWA-001",
    lat: 36.3729,
    lng: -94.2088,
    agency: "Rogers Police Department",
    operator: "Municipal PD",
    vendor: "Flock Safety",
    location: "Promenade Blvd & S Promenade Ave, Rogers",
    corridor: "Promenade Commercial District",
    status: "active",
    notes: "High-traffic retail corridor near Pinnacle Hills"
  },
  {
    id: "NWA-002",
    lat: 36.3482,
    lng: -94.2013,
    agency: "Rogers Police Department",
    operator: "Municipal PD",
    vendor: "Flock Safety",
    location: "W Walnut St & S 8th St, Rogers",
    corridor: "Highway 71B / Downtown Rogers",
    status: "active",
    notes: "Major north-south arterial through downtown Rogers"
  },
  {
    id: "NWA-003",
    lat: 36.3386,
    lng: -94.1255,
    agency: "Bentonville Police Department",
    operator: "Municipal PD",
    vendor: "Flock Safety",
    location: "Walton Blvd & S Walton Blvd, Bentonville",
    corridor: "Walton Blvd Commercial Corridor",
    status: "active",
    notes: "Primary east-west commercial corridor in Bentonville"
  },
  {
    id: "NWA-004",
    lat: 36.0726,
    lng: -94.1607,
    agency: "Fayetteville Police Department",
    operator: "Municipal PD",
    vendor: "Flock Safety",
    location: "MLK Jr Blvd & Razorback Rd, Fayetteville",
    corridor: "MLK Jr Blvd / University Area",
    status: "active",
    notes: "Near University of Arkansas campus, high pedestrian and vehicle traffic"
  },
  {
    id: "NWA-005",
    lat: 36.1868,
    lng: -94.1289,
    agency: "Springdale Police Department",
    operator: "Municipal PD",
    vendor: "Flock Safety",
    location: "Sunset Ave & S Thompson St, Springdale",
    corridor: "Sunset Ave / South Springdale",
    status: "active",
    notes: "Major intersection in southern Springdale"
  },
  {
    id: "NWA-006",
    lat: 36.2812,
    lng: -94.1754,
    agency: "Benton County Sheriff's Office",
    operator: "County Sheriff",
    vendor: "Flock Safety",
    location: "I-49 Corridor, Lowell",
    corridor: "Interstate 49 Southbound",
    status: "active",
    notes: "Interstate surveillance — captures all southbound I-49 traffic"
  },
  {
    id: "NWA-007",
    lat: 36.0622,
    lng: -94.1748,
    agency: "Fayetteville Police Department",
    operator: "Municipal PD",
    vendor: "Flock Safety",
    location: "College Ave & Township St, Fayetteville",
    corridor: "Highway 71B / College Ave",
    status: "active",
    notes: "Primary commercial artery through Fayetteville"
  },
  {
    id: "NWA-008",
    lat: 36.3095,
    lng: -94.1372,
    agency: "Centerton Police Department",
    operator: "Municipal PD",
    vendor: "Flock Safety",
    location: "Highway 102 & Centerton Blvd, Centerton",
    corridor: "Highway 102 Corridor",
    status: "active",
    notes: "Rapidly growing suburb — recently deployed"
  },
  {
    id: "NWA-009",
    lat: 36.2345,
    lng: -94.2056,
    agency: "Private HOA",
    operator: "HOA / Private",
    vendor: "Flock Safety",
    location: "Residential Subdivision Entry, Bella Vista",
    corridor: "Bella Vista Residential",
    status: "active",
    notes: "HOA-contracted Flock camera monitoring subdivision entry/exit"
  },
  {
    id: "NWA-010",
    lat: 36.1152,
    lng: -94.1580,
    agency: "Washington County Sheriff's Office",
    operator: "County Sheriff",
    vendor: "Flock Safety",
    location: "Wedington Dr & I-49, Fayetteville",
    corridor: "I-49 / Wedington Interchange",
    status: "active",
    notes: "Major interstate interchange — high daily volume"
  }
];
