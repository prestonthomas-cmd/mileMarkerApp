# Mile Marker 👟

Log the miles you walk or run each day, and watch yourself travel the world.

- **Pick a start and a heading.** Choose a starting city (or use your location) and a faraway destination or compass direction.
- **Log your miles.** Each day's miles add to your running total and move you along the shortest path around the globe.
- **See where you are.** The map shows your route, and the app looks up real places near your current spot on Wikipedia, with short summaries.
- **Distance milestones.** About 75 cities around the world, each with fun facts. Once your total miles pass a city's distance from home (in any direction), you've "walked as far as" home → that city. These are distance comparisons, separate from the map route.
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
