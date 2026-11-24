# Mile Marker 👟

Log the miles you walk or run each day, and watch yourself travel the world.

- **Pick a start and a heading.** Choose a starting city (or use your location) and a faraway destination or compass direction.
- **Log your miles.** Each day's miles add to your running total and move you along the shortest path around the globe.
- **See where you are.** The map shows your route, and the app looks up real places near your current spot on Wikipedia, with short summaries.
- **Unlock destinations.** About 75 cities around the world, each with fun facts, unlock when your total miles reach their distance from home.
- Tracks total miles, days logged, your day streak, and progress toward your goal.

Your log is saved in your browser (localStorage). Nothing is sent anywhere except the Wikipedia lookups and map tiles.

## Run it

It's a static site with no build step:

```bash
npm start        # or: python3 -m http.server 8000
```

Then open http://localhost:8000. It also works on any static host, such as GitHub Pages.

## Test

```bash
npm test
```

## Files

- `index.html`, `css/styles.css`: page and styles (light and dark mode)
- `js/geo.js`: great-circle distance, bearing and route math
- `js/places.js`: curated destinations and fun facts (add your own here)
- `js/wiki.js`: Wikipedia lookup for places near your current position
- `js/app.js`: app state, logging and rendering
