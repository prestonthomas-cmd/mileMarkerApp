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
      if (s && Array.isArray(s.entries)) {
        // Older saves had a single `goal`; turn it into the first leg.
        if (!Array.isArray(s.legs)) {
          s.legs = s.home && s.goal ? [{ from: s.home, goal: s.goal, startMiles: 0 }] : [];
          delete s.goal;
        }
        return s;
      }
    } catch { /* fall through */ }
    return emptyState();
  }
  function emptyState() { return { home: null, legs: [], entries: [] }; }
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
  // The journey is a chain of legs. Each leg starts where the previous one
  // ended, at the mile mark where you arrived (`startMiles`).
  const shortName = (name) => (name === "My location" ? "Home" : name.replace(/, [^,]+$/, ""));
  const lastLeg = () => state.legs[state.legs.length - 1];
  const legBearing = (leg) => (leg.goal.kind === "heading" ? leg.goal.deg : Geo.bearing(leg.from, leg.goal));
  const legLength = (leg) => (leg.goal.kind === "place" ? Geo.distance(leg.from, leg.goal) : null);
  const legEndMiles = (leg) => (leg.goal.kind === "place" ? leg.startMiles + legLength(leg) : Infinity);

  // Index of the leg you're on for a given total (deleting log entries can
  // move you back onto an earlier leg).
  function activeLegIndex(total) {
    let i = 0;
    while (i + 1 < state.legs.length && state.legs[i + 1].startMiles <= total) i++;
    return i;
  }

  // Miles traveled on a leg, capped at its length. Once you reach the final
  // destination you wait there; extra miles carry over to the next leg.
  function milesOnLeg(leg, total) {
    const m = Math.max(0, total - leg.startMiles);
    const len = legLength(leg);
    return len === null ? m : Math.min(m, len);
  }

  function currentPosition(total = totalMiles()) {
    const leg = state.legs[activeLegIndex(total)];
    return Geo.destination(leg.from, legBearing(leg), milesOnLeg(leg, total));
  }

  // True when you've reached the final leg's destination and need a new one.
  const awaitingNextLeg = (total = totalMiles()) => total >= legEndMiles(lastLeg());

  function parseGoal(value) {
    const [kind, rest] = String(value).split(/:(.*)/s);
    if (kind === "heading") {
      const h = HEADINGS.find(([, d]) => d === Number(rest));
      return h ? { kind, deg: h[1], name: `Due ${h[0]}` } : null;
    }
    const p = PLACES.find((pl) => placeLabel(pl) === rest);
    return p ? { kind: "place", name: placeLabel(p), lat: p.lat, lng: p.lng } : null;
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

  function goalOptionsHtml(excludeName) {
    const placeOpts = [...PLACES]
      .filter((p) => placeLabel(p) !== excludeName)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => `<option value="place:${escapeHtml(placeLabel(p))}">${escapeHtml(placeLabel(p))}</option>`).join("");
    const headingOpts = HEADINGS.map(([n, d]) => `<option value="heading:${d}">Due ${n}</option>`).join("");
    return `<option value="" disabled selected>Choose a destination…</option>` +
      `<optgroup label="A faraway place">${placeOpts}</optgroup>` +
      `<optgroup label="A compass direction">${headingOpts}</optgroup>`;
  }

  function fillSetupOptions() {
    $("city-list").innerHTML = PLACES.map((p) => `<option value="${escapeHtml(placeLabel(p))}"></option>`).join("");
    $("goal-select").innerHTML = goalOptionsHtml();
  }

  function showSetup(editing) {
    $("setup").hidden = false;
    $("dashboard").hidden = true;
    $("settings-btn").hidden = true;
    $("setup-cancel").hidden = !editing;
    $("home-status").textContent = "";
    pendingHome = null;
    if (editing && state.home) {
      const goal = state.legs[0].goal;
      $("home-input").value = state.home.name;
      pendingHome = state.home;
      $("goal-select").value = goal.kind === "heading" ? `heading:${goal.deg}` : `place:${goal.name}`;
      $("home-status").textContent = state.legs.length > 1
        ? `Saving replaces your ${state.legs.length}-leg journey with one leg from this start. Your miles are kept.`
        : "Changing your start or heading keeps your miles but moves your route.";
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
    const goal = parseGoal($("goal-select").value);
    if (!goal) return;
    if (goal.kind === "place" && Geo.distance(home, goal) < 1) {
      $("home-status").textContent = "Pick a destination that isn't where you start!";
      return;
    }
    state.home = home;
    state.legs = [{ from: home, goal, startMiles: 0 }];
    saveState();
    showDashboard();
  });

  // ---------- Next leg ----------
  $("next-leg").addEventListener("submit", (e) => {
    e.preventDefault();
    const prev = lastLeg();
    const goal = parseGoal($("next-goal").value);
    if (!goal || !awaitingNextLeg()) return;
    const from = { name: prev.goal.name, lat: prev.goal.lat, lng: prev.goal.lng };
    if (goal.kind === "place" && Geo.distance(from, goal) < 1) return;
    state.legs.push({ from, goal, startMiles: legEndMiles(prev) });
    saveState();
    const banked = totalMiles() - legEndMiles(prev);
    $("log-message").textContent = `New leg: ${shortName(from.name)} → ${shortName(goal.name)}.` +
      (banked > 0.05 ? ` Your ${fmt(banked, 2)} extra miles already count toward it!` : "");
    render();
  });

  $("legs").addEventListener("click", (e) => {
    if (!e.target.closest("button[data-undo-leg]") || state.legs.length < 2) return;
    if (!confirm(`Remove the leg to ${lastLeg().goal.name}? Your miles are kept.`)) return;
    state.legs.pop();
    saveState();
    render();
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
    const arrival = legEndMiles(lastLeg());
    if (before < arrival && after >= arrival) msg += ` 🏁 You've reached ${lastLeg().goal.name}! Pick your next destination below.`;
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
    state = emptyState();
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

    // Shift a run of [lat, lng] points by whole turns of 360° so it starts
    // next to `prevLng`. This keeps a multi-leg line continuous on the map.
    const align = (pts, prevLng) => {
      if (prevLng === null) return pts;
      const shift = Math.round((prevLng - pts[0][1]) / 360) * 360;
      return pts.map(([la, ln]) => [la, ln + shift]);
    };

    const active = activeLegIndex(total);
    const traveled = [];
    const waypoints = [];
    for (let i = 0; i <= active; i++) {
      const leg = state.legs[i];
      const pts = align(Geo.pathPoints(leg.from, legBearing(leg), milesOnLeg(leg, total)),
        traveled.length ? traveled[traveled.length - 1][1] : null);
      waypoints.push([pts[0], leg.from.name]);
      traveled.push(...(traveled.length ? pts.slice(1) : pts));
    }
    const here = traveled[traveled.length - 1];

    // Dashed line for the road ahead on the current leg.
    const leg = state.legs[active];
    const len = legLength(leg);
    const done = milesOnLeg(leg, total);
    const aheadMiles = len === null ? Math.max(done * 0.25, 50) : len - done;
    if (aheadMiles > 0.05) {
      const ahead = [here];
      for (let i = 1, prev = here[1]; i <= 48; i++) {
        const p = Geo.destination(leg.from, legBearing(leg), done + (aheadMiles * i) / 48);
        let lng = p.lng;
        while (lng - prev > 180) lng -= 360;
        while (lng - prev < -180) lng += 360;
        ahead.push([p.lat, lng]);
        prev = lng;
      }
      L.polyline(ahead, { color: "#8a94a6", weight: 3, dashArray: "6 8" }).addTo(layers);
      if (len !== null) {
        L.circleMarker(ahead[ahead.length - 1], { radius: 7, color: "#e4572e", weight: 3, fillColor: "#ffffff", fillOpacity: 1 })
          .bindTooltip(`Destination: ${escapeHtml(leg.goal.name)}`).addTo(layers);
      }
    }

    L.polyline(traveled, { color: "#e4572e", weight: 5 }).addTo(layers);
    waypoints.forEach(([pt, name], i) => {
      L.circleMarker(pt, { radius: i === 0 ? 7 : 6, color: "#1f6feb", fillColor: "#1f6feb", fillOpacity: 1 })
        .bindTooltip(`${i === 0 ? "Home" : "Stop"}: ${escapeHtml(name)}`).addTo(layers);
    });
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
    const nearestText = nearest.d < 5
      ? `You're right in <strong>${escapeHtml(nearest.name)}</strong>!`
      : `Nearest big destination: <strong>${escapeHtml(nearest.name)}</strong>, ${fmt(nearest.d, 0)} mi away.`;
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
      <p class="small muted">${coordText} · ${fmt(Geo.distance(state.home, pos), 0)} mi from ${escapeHtml(shortName(state.home.name))} as the crow flies</p>
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
  const homeShort = () => shortName(state.home.name);

  // ---------- Journey legs ----------
  function renderJourney(total) {
    const active = activeLegIndex(total);
    const leg = state.legs[active];
    const len = legLength(leg);
    const done = milesOnLeg(leg, total);
    const waiting = active === state.legs.length - 1 && awaitingNextLeg(total);

    $("route-label").textContent = [state.home.name, ...state.legs.map((l) => l.goal.name)].map(shortName).join(" → ");

    if (len !== null) {
      $("goal-progress").style.width = `${Math.min(100, (done / len) * 100)}%`;
      const banked = total - legEndMiles(leg);
      $("goal-text").textContent = waiting
        ? `🏁 You made it to ${leg.goal.name}!` + (banked > 0.05 ? ` ${fmt(banked, 2)} extra miles are saved for your next leg.` : "")
        : `${fmt((done / len) * 100, 1)}% of the way to ${leg.goal.name}: ${fmt(len - done)} of ${fmt(len, 0)} mi to go.`;
    } else {
      const lap = Geo.EARTH_RADIUS_MI * 2 * Math.PI;
      $("goal-progress").style.width = `${Math.min(100, ((done % lap) / lap) * 100)}%`;
      $("goal-text").textContent = `Heading ${leg.goal.name.replace("Due ", "").toLowerCase()}: ${fmt(done)} mi on this leg, ${fmt((done / lap) * 100, 2)}% of the way around the world.`;
    }

    // "Where to next?" picker, shown once you arrive.
    const form = $("next-leg");
    form.hidden = !waiting;
    if (waiting && form.dataset.for !== leg.goal.name) {
      form.dataset.for = leg.goal.name;
      $("next-goal").innerHTML = goalOptionsHtml(leg.goal.name);
      $("next-leg-title").textContent = `Where to next from ${shortName(leg.goal.name)}?`;
    }
    if (!waiting) delete form.dataset.for;

    // Leg list (only worth showing once there's more than one leg).
    $("legs").hidden = state.legs.length < 2;
    $("legs").innerHTML = state.legs.map((l, i) => {
      const lLen = legLength(l);
      const lDone = milesOnLeg(l, total);
      const status = lLen === null
        ? `${fmt(lDone, 0)} mi so far`
        : lDone >= lLen ? `${fmt(lLen, 0)} mi ✓`
        : i > active ? `${fmt(lLen, 0)} mi · not started`
        : `${fmt(lDone, 0)} of ${fmt(lLen, 0)} mi`;
      const undo = i === state.legs.length - 1 && i > 0
        ? ` <button type="button" class="icon" data-undo-leg aria-label="Remove this leg">✕</button>` : "";
      return `<li class="${i === active ? "current" : ""}"><span>${escapeHtml(shortName(l.from.name))} → <strong>${escapeHtml(shortName(l.goal.name))}</strong></span>
        <span class="small muted">${status}${undo}</span></li>`;
    }).join("");
  }

  // ---------- Render ----------
  function render({ highlight = [] } = {}) {
    const total = totalMiles();
    $("total-miles").textContent = fmt(total);
    $("days-logged").textContent = state.entries.length;
    $("streak").textContent = streak();

    renderJourney(total);

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
  if (state.home && state.legs.length) showDashboard();
  else showSetup(false);
})();
