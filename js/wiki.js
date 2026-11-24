// Finds real places (with short summaries) near a coordinate using
// Wikipedia's geosearch API. Results are cached in localStorage.
(function (root) {
  const API = "https://en.wikipedia.org/w/api.php";
  const CACHE_KEY = "milemarker.wikiCache.v1";
  const MAX_CACHE = 200;

  function loadCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch { return {}; }
  }
  function saveCache(cache) {
    try {
      const keys = Object.keys(cache);
      if (keys.length > MAX_CACHE) keys.slice(0, keys.length - MAX_CACHE).forEach((k) => delete cache[k]);
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch { /* storage full or blocked: skip caching */ }
  }

  async function queryAt(lat, lng, limit) {
    const params = new URLSearchParams({
      action: "query", format: "json", origin: "*",
      generator: "geosearch", ggscoord: `${lat}|${lng}`, ggsradius: "10000", ggslimit: String(limit),
      prop: "extracts|pageimages|description|coordinates",
      exintro: "1", explaintext: "1", exsentences: "3", exlimit: String(limit),
      piprop: "thumbnail", pithumbsize: "320",
    });
    const res = await fetch(`${API}?${params}`);
    if (!res.ok) throw new Error(`Wikipedia returned ${res.status}`);
    const data = await res.json();
    const pages = Object.values((data.query && data.query.pages) || {});
    return pages
      .filter((p) => p.extract && p.extract.trim())
      .sort((a, b) => (a.index || 0) - (b.index || 0))
      .map((p) => ({
        title: p.title,
        description: p.description || "",
        extract: p.extract.trim(),
        thumb: p.thumbnail ? p.thumbnail.source : null,
        url: `https://en.wikipedia.org/?curid=${p.pageid}`,
        lat: p.coordinates ? p.coordinates[0].lat : null,
        lng: p.coordinates ? p.coordinates[0].lon : null,
      }));
  }

  // Returns up to `limit` places near the point. If nothing is within 10 km
  // (open water, wilderness), looks a little further out in four directions.
  async function placesNear(point, limit = 4) {
    const key = `${point.lat.toFixed(2)},${point.lng.toFixed(2)}`;
    const cache = loadCache();
    if (cache[key]) return cache[key];

    let places = await queryAt(point.lat, point.lng, limit + 4);
    if (!places.length && root.Geo) {
      const rings = [0, 90, 180, 270].map((b) => root.Geo.destination(point, b, 15));
      const results = await Promise.all(rings.map((p) => queryAt(p.lat, p.lng, 3).catch(() => [])));
      const seen = new Set();
      places = results.flat().filter((p) => !seen.has(p.title) && seen.add(p.title));
    }
    places = places.slice(0, limit);
    cache[key] = places;
    saveCache(cache);
    return places;
  }

  root.Wiki = { placesNear };
})(this);
