const test = require("node:test");
const assert = require("node:assert");
const Geo = require("../js/geo.js");
const PLACES = require("../js/places.js");

const chicago = { lat: 41.8781, lng: -87.6298 };
const nyc = { lat: 40.7128, lng: -74.006 };

test("distance Chicago to NYC is about 711 miles", () => {
  assert.ok(Math.abs(Geo.distance(chicago, nyc) - 711) < 5);
});

test("travelling the full distance toward a place arrives there", () => {
  const d = Geo.distance(chicago, nyc);
  const p = Geo.destination(chicago, Geo.bearing(chicago, nyc), d);
  assert.ok(Geo.distance(p, nyc) < 0.01);
});

test("destination with zero miles stays put", () => {
  const p = Geo.destination(chicago, 123, 0);
  assert.ok(Geo.distance(p, chicago) < 1e-6);
});

test("path across the antimeridian has no big jumps", () => {
  const tokyo = { lat: 35.68, lng: 139.65 };
  const sf = { lat: 37.77, lng: -122.42 };
  const pts = Geo.pathPoints(tokyo, Geo.bearing(tokyo, sf), Geo.distance(tokyo, sf));
  for (let i = 1; i < pts.length; i++) assert.ok(Math.abs(pts[i][1] - pts[i - 1][1]) < 30);
});

test("every place has valid coordinates and three facts", () => {
  const names = new Set();
  for (const p of PLACES) {
    assert.ok(p.lat >= -90 && p.lat <= 90 && p.lng >= -180 && p.lng <= 180, p.name);
    assert.strictEqual(p.facts.length, 3, p.name);
    assert.ok(!names.has(p.name), `duplicate ${p.name}`);
    names.add(p.name);
  }
});
