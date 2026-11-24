// Great-circle helpers. Distances are in miles.
(function (root) {
  const EARTH_RADIUS_MI = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const toDeg = (r) => (r * 180) / Math.PI;

  // Distance between two {lat, lng} points.
  function distance(a, b) {
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 2 * EARTH_RADIUS_MI * Math.asin(Math.min(1, Math.sqrt(h)));
  }

  // Initial compass bearing (degrees) from a toward b.
  function bearing(a, b) {
    const φ1 = toRad(a.lat), φ2 = toRad(b.lat), Δλ = toRad(b.lng - a.lng);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return (toDeg(Math.atan2(y, x)) + 360) % 360;
  }

  // Point reached by travelling `miles` from `start` along a great circle
  // with the given initial bearing.
  function destination(start, bearingDeg, miles) {
    const δ = miles / EARTH_RADIUS_MI;
    const θ = toRad(bearingDeg);
    const φ1 = toRad(start.lat), λ1 = toRad(start.lng);
    const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
    const λ2 = λ1 + Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2)
    );
    return { lat: toDeg(φ2), lng: ((toDeg(λ2) + 540) % 360) - 180 };
  }

  // Points along the path, with longitudes unwrapped so a map line
  // doesn't jump across the whole world at the antimeridian.
  function pathPoints(start, bearingDeg, miles, steps = 64) {
    const pts = [];
    let prevLng = null, offset = 0;
    for (let i = 0; i <= steps; i++) {
      const p = destination(start, bearingDeg, (miles * i) / steps);
      if (prevLng !== null) {
        const diff = p.lng - prevLng;
        if (diff > 180) offset -= 360;
        else if (diff < -180) offset += 360;
      }
      prevLng = p.lng;
      pts.push([p.lat, p.lng + offset]);
    }
    return pts;
  }

  const api = { EARTH_RADIUS_MI, distance, bearing, destination, pathPoints };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Geo = api;
})(this);
