(function () {
  "use strict";

  const STORAGE_KEY = "milemarker.state.v1";
  const HEADINGS = [
    ["North", 0], ["Northeast", 45], ["East", 90], ["Southeast", 135],
    ["South", 180], ["Southwest", 225], ["West", 270], ["Northwest", 315],
  ];

  const $ = (id) => document.getElementById(id);
  const fmt = (n, digits = 1) =>
    Number(n).toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: 0 });
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const placeLabel = (p) => `${p.name}, ${p.country}`;

  // ---------- State ----------
  function loadState() {
    try {
      const s = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (s && Array.isArray(s.entries)) return s;
    } catch { /* fall through */ }
    return { home: null, goal: null, entries: [] };
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { $("log-message").textContent = "Couldn't save. Your browser may be blocking storage."; }
  }
  let state = loadState();

  const totalMiles = () => state.entries.reduce((sum, e) => sum + e.miles, 0);

  function localDateString(d = new Date()) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  function prettyDate(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  }

  function streak() {
    const dates = new Set(state.entries.filter((e) => e.miles > 0).map((e) => e.date));
    const day = new Date();
    if (!dates.has(localDateString(day))) day.setDate(day.getDate() - 1); // today not logged yet is okay
    let count = 0;
    while (dates.has(localDateString(day))) { count++; day.setDate(day.getDate() - 1); }
    return count;
  }

  // ---------- Route ----------
  function routeBearing() {
    if (state.goal.kind === "heading") return state.goal.deg;
    return Geo.bearing(state.home, state.goal);
  }
  function goalDistance() {
    return state.goal.kind === "place" ? Geo.distance(state.home, state.goal) : null;
  }
  function currentPosition(miles = totalMiles()) {
    return Geo.destination(state.home, routeBearing(), miles);
  }

  // Curated places sorted by distance from home (excluding home itself).
  function placesByDistance() {
    return PLACES
      .map((p) => ({ ...p, dist: Geo.distance(state.home, p) }))
      .filter((p) => p.dist >= 1)
      .sort((a, b) => a.dist - b.dist);
  }

  // ---------- Setup ----------
  let pendingHome = null; // set when "Use my location" succeeds

  function fillSetupOptions() {
    $("city-list").innerHTML = PLACES.map((p) => `<option value="${escapeHtml(placeLabel(p))}"></option>`).join("");
    const placeOpts = [...PLACES]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => `<option value="place:${escapeHtml(placeLabel(p))}">${escapeHtml(placeLabel(p))}</option>`).join("");
    const headingOpts = HEADINGS.map(([n, d]) => `<option value="heading:${d}">Due ${n}</option>`).join("");
    $("goal-select").innerHTML =
      `<option value="" disabled selected>Choose a destination…</option>` +
      `<optgroup label="A faraway place">${placeOpts}</optgroup>` +
      `<optgroup label="A compass direction">${headingOpts}</optgroup>`;
  }

  function showSetup(editing) {
    $("setup").hidden = false;
    $("dashboard").hidden = true;
    $("settings-btn").hidden = true;
    $("setup-cancel").hidden = !editing;
    $("home-status").textContent = "";
    pendingHome = null;
    if (editing && state.home) {
      $("home-input").value = state.home.name;
      pendingHome = state.home;
      $("goal-select").value = state.goal.kind === "heading" ? `heading:${state.goal.deg}` : `place:${state.goal.name}`;
      $("home-status").textContent = "Changing your start or heading keeps your miles but moves your route.";
    }
  }

  function resolveHome(text) {
    if (pendingHome && text === pendingHome.name) return pendingHome;
    const t = text.trim().toLowerCase();
    const match = PLACES.find((p) => placeLabel(p).toLowerCase() === t) ||
      PLACES.find((p) => p.name.toLowerCase() === t) ||
      PLACES.find((p) => p.name.toLowerCase().startsWith(t));
    return match ? { name: placeLabel(match), lat: match.lat, lng: match.lng } : null;
  }

  $("locate-btn").addEventListener("click", () => {
    if (!navigator.geolocation) { $("home-status").textContent = "Your browser doesn't support location."; return; }
    $("home-status").textContent = "Finding you…";
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        pendingHome = { name: "My location", lat: pos.coords.latitude, lng: pos.coords.longitude };
        $("home-input").value = pendingHome.name;
        $("home-status").textContent = `Got it: ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`;
      },
      () => { $("home-status").textContent = "Couldn't get your location. Pick a city from the list instead."; },
      { timeout: 10000 }
    );
  });

  $("setup-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const home = resolveHome($("home-input").value);
    if (!home) { $("home-status").textContent = "Pick a city from the list, or use your location."; return; }
    const [kind, value] = $("goal-select").value.split(/:(.*)/s);
    let goal;
    if (kind === "heading") {
      const deg = Number(value);
      goal = { kind, deg, name: `Due ${HEADINGS.find(([, d]) => d === deg)[0]}` };
    } else {
      const p = PLACES.find((pl) => placeLabel(pl) === value);
      if (!p) return;
      goal = { kind: "place", name: placeLabel(p), lat: p.lat, lng: p.lng };
      if (Geo.distance(home, goal) < 1) { $("home-status").textContent = "Pick a destination that isn't where you start!"; return; }
    }
    state.home = home;
    state.goal = goal;
    saveState();
    showDashboard();
  });

  $("setup-cancel").addEventListener("click", showDashboard);
  $("settings-btn").addEventListener("click", () => showSetup(true));

  // ---------- Logging ----------
  $("log-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const date = $("log-date").value;
    const miles = Math.round(parseFloat($("log-miles").value) * 100) / 100;
    if (!date || !(miles > 0)) return;

    const before = totalMiles();
    const existing = state.entries.find((x) => x.date === date);
    if (existing) existing.miles = Math.round((existing.miles + miles) * 100) / 100;
    else state.entries.push({ date, miles });
    saveState();

    const after = totalMiles();
    const newlyUnlocked = placesByDistance().filter((p) => p.dist > before && p.dist <= after);
    let msg = `+${fmt(miles, 2)} mi${existing ? ` (now ${fmt(existing.miles, 2)} mi that day)` : ""}. You've moved ${fmt(miles, 2)} miles further along your route!`;
    if (newlyUnlocked.length) {
      msg += ` 🎉 You've now walked as far as ${homeShort()} to ${newlyUnlocked.map((p) => p.name).join(", ").replace(/, ([^,]*)$/, " and $1")}!`;
    }
    const gd = goalDistance();
    if (gd && before < gd && after >= gd) msg += ` 🏁 You've reached ${state.goal.name}!`;
    $("log-message").textContent = msg;
    $("log-miles").value = "";
    render({ highlight: newlyUnlocked.map((p) => p.name) });
  });

  $("history").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-date]");
    if (!btn) return;
    const date = btn.dataset.date;
    if (!confirm(`Delete your miles for ${prettyDate(date)}?`)) return;
    state.entries = state.entries.filter((x) => x.date !== date);
    saveState();
    $("log-message").textContent = "";
    render();
  });

  $("reset-btn").addEventListener("click", () => {
    if (!confirm("Erase your whole journey and start over?")) return;
    state = { home: null, goal: null, entries: [] };
    saveState();
    $("log-message").textContent = "";
    $("setup-form").reset();
    showSetup(false);
  });

  // ---------- Map ----------
  let map = null, layers = null;
  function renderMap(total) {
    if (typeof L === "undefined") { $("map").classList.add("map-offline"); $("map").textContent = "Map unavailable offline."; return; }
    if (!map) {
      map = L.map("map", { worldCopyJump: true, scrollWheelZoom: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18, attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      layers = L.layerGroup().addTo(map);
    }
    layers.clearLayers();
    const bearing = routeBearing();
    const traveled = Geo.pathPoints(state.home, bearing, total);
    const here = traveled[traveled.length - 1];

    const gd = goalDistance();
    const aheadMiles = gd && gd > total ? gd - total : Math.max(total * 0.25, 50);
    // Dashed line for the road ahead, unwrapped to continue from `here`.
    const aheadAligned = [here];
    for (let i = 1, prev = here[1]; i <= 48; i++) {
      const p = Geo.destination(state.home, bearing, total + (aheadMiles * i) / 48);
      let lng = p.lng;
      while (lng - prev > 180) lng -= 360;
      while (lng - prev < -180) lng += 360;
      aheadAligned.push([p.lat, lng]);
      prev = lng;
    }

    L.polyline(aheadAligned, { color: "#8a94a6", weight: 3, dashArray: "6 8" }).addTo(layers);
    L.polyline(traveled, { color: "#e4572e", weight: 5 }).addTo(layers);
    L.circleMarker(traveled[0], { radius: 7, color: "#1f6feb", fillColor: "#1f6feb", fillOpacity: 1 })
      .bindTooltip(`Home: ${escapeHtml(state.home.name)}`).addTo(layers);
    L.circleMarker(here, { radius: 9, color: "#ffffff", weight: 3, fillColor: "#e4572e", fillOpacity: 1 })
      .bindTooltip("You are here").addTo(layers);

    map.invalidateSize();
    if (total < 0.05) map.setView(here, 12);
    else map.fitBounds(L.latLngBounds(traveled), { padding: [30, 30], maxZoom: 14, animate: false });
  }

  // ---------- "Where you are" ----------
  let lookupToken = 0;
  async function renderHere(total) {
    const pos = currentPosition(total);
    const nearest = PLACES.map((p) => ({ ...p, d: Geo.distance(pos, p) })).sort((a, b) => a.d - b.d)[0];
    const coordText = `${Math.abs(pos.lat).toFixed(3)}°${pos.lat >= 0 ? "N" : "S"}, ${Math.abs(pos.lng).toFixed(3)}°${pos.lng >= 0 ? "E" : "W"}`;
    const nearestText = `Nearest big destination: <strong>${escapeHtml(nearest.name)}</strong>, ${fmt(nearest.d, 0)} mi away.`;
    const box = $("here");

    if (total === 0) {
      box.innerHTML = `<p class="muted">You're at home in <strong>${escapeHtml(state.home.name)}</strong>. Log some miles to start moving!</p>`;
      return;
    }
    box.innerHTML = `<p class="muted">Looking around ${coordText}…</p>`;
    const token = ++lookupToken;
    let places;
    try { places = await Wiki.placesNear(pos); }
    catch {
      if (token !== lookupToken) return;
      box.innerHTML = `<p class="here-title">📍 ${coordText}</p><p class="muted">Couldn't reach Wikipedia to look around. Check your connection.</p><p class="small">${nearestText}</p>`;
      return;
    }
    if (token !== lookupToken) return;

    if (!places.length) {
      box.innerHTML = `<p class="here-title">🌊 Somewhere remote: ${coordText}</p>
        <p class="muted">No landmarks nearby. You may be crossing open water, desert or wilderness. Keep going!</p>
        <p class="small">${nearestText}</p>`;
      return;
    }
    const [first] = places;
    box.innerHTML = `
      <p class="here-title">📍 Near <strong>${escapeHtml(first.title)}</strong></p>
      <p class="small muted">${coordText} · ${fmt(total)} mi from ${escapeHtml(state.home.name)}</p>
      <ul class="facts">${places.map((p) => `
        <li class="fact">
          ${p.thumb ? `<img src="${escapeHtml(p.thumb)}" alt="" loading="lazy">` : ""}
          <div>
            <a href="${escapeHtml(p.url)}" target="_blank" rel="noopener"><strong>${escapeHtml(p.title)}</strong></a>
            ${p.description ? `<span class="small muted"> · ${escapeHtml(p.description)}</span>` : ""}
            <p>${escapeHtml(p.extract)}</p>
          </div>
        </li>`).join("")}
      </ul>
      <p class="small">${nearestText}</p>`;
  }

  // ---------- Destinations ----------
  function renderDestinations(total, highlight) {
    const all = placesByDistance();
    const unlocked = all.filter((p) => p.dist <= total).reverse();
    const next = all.find((p) => p.dist > total);

    const home = escapeHtml(homeShort());

    if (next) {
      const prevDist = unlocked.length ? unlocked[0].dist : 0;
      const pct = Math.min(100, ((total - prevDist) / (next.dist - prevDist)) * 100);
      $("next-up").innerHTML = `
        <div class="next-head"><span>Next milestone: ${home} → <strong>${escapeHtml(next.name)}</strong> (${fmt(next.dist, 0)} mi)</span>
        <span class="small muted">${fmt(next.dist - total)} mi to go</span></div>
        <div class="progress"><div class="progress-bar" style="width:${pct}%"></div></div>`;
    } else {
      $("next-up").innerHTML = `<p>🌍 You've walked farther than the distance from home to every place on the list. Incredible!</p>`;
    }

    $("unlocked").innerHTML = unlocked.length
      ? unlocked.map((p) => `
        <li class="${highlight.includes(p.name) ? "new" : ""}">
          <details ${highlight.includes(p.name) ? "open" : ""}>
            <summary><span><span class="muted">${home} →</span> <strong>${escapeHtml(p.name)}</strong> <span class="muted">${escapeHtml(p.country)}</span>${highlight.includes(p.name) ? ' <span class="badge">New!</span>' : ""}</span>
            <span class="small muted">${fmt(p.dist, 0)} mi ✓</span></summary>
            <ul class="fun-facts">${p.facts.map((f) => `<li>${escapeHtml(f)}</li>`).join("")}</ul>
          </details>
        </li>`).join("")
      : `<li class="empty muted">Nothing yet. Your first milestone is the distance from ${home} to ${next ? `${escapeHtml(next.name)}: ${fmt(next.dist, 0)} miles` : "the nearest city"}. Every mile counts!</li>`;
  }

  // Short name for home, e.g. "Chicago" from "Chicago, USA".
  function homeShort() {
    return state.home.name === "My location" ? "Home" : state.home.name.replace(/, [^,]+$/, "");
  }

  // ---------- Render ----------
  function render({ highlight = [] } = {}) {
    const total = totalMiles();
    $("total-miles").textContent = fmt(total);
    $("days-logged").textContent = state.entries.length;
    $("streak").textContent = streak();

    const gd = goalDistance();
    $("route-label").textContent = `${state.home.name} → ${state.goal.name}`;
    if (gd) {
      const pct = Math.min(100, (total / gd) * 100);
      $("goal-progress").style.width = `${pct}%`;
      $("goal-text").textContent = total >= gd
        ? `🏁 You reached ${state.goal.name} (${fmt(gd, 0)} mi) and kept going! ${fmt(total - gd)} mi past it.`
        : `${fmt(pct, 1)}% of the way to ${state.goal.name}: ${fmt(gd - total)} of ${fmt(gd, 0)} mi to go.`;
    } else {
      const lap = Geo.EARTH_RADIUS_MI * 2 * Math.PI;
      $("goal-progress").style.width = `${Math.min(100, ((total % lap) / lap) * 100)}%`;
      $("goal-text").textContent = `Heading ${state.goal.name.replace("Due ", "").toLowerCase()}. ${fmt((total / lap) * 100, 2)}% of the way around the world.`;
    }

    const sorted = [...state.entries].sort((a, b) => b.date.localeCompare(a.date));
    $("history").innerHTML = sorted.length
      ? sorted.map((e) => `<li><span>${prettyDate(e.date)}</span><span><strong>${fmt(e.miles, 2)}</strong> mi
          <button type="button" class="icon" data-date="${e.date}" aria-label="Delete ${prettyDate(e.date)}">✕</button></span></li>`).join("")
      : `<li class="empty muted">Nothing logged yet.</li>`;

    renderMap(total);
    renderDestinations(total, highlight);
    renderHere(total);
  }

  function showDashboard() {
    $("setup").hidden = true;
    $("dashboard").hidden = false;
    $("settings-btn").hidden = false;
    $("log-date").value = localDateString();
    $("log-date").max = localDateString();
    render();
  }

  // ---------- Boot ----------
  fillSetupOptions();
  if (state.home && state.goal) showDashboard();
  else showSetup(false);
})();
