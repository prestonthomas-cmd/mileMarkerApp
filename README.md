# Mile Marker 👟

Log the miles you walk or run each day, and watch yourself travel the world.

**Live app: https://prestonthomas-cmd.github.io/mileMarkerApp/**

## Features

- **Pick a start and a heading.** Choose a starting city (or use your location) and a faraway destination or compass direction.
- **Log your miles.** Each day's miles add to your running total and move you along the shortest path around the globe.
- **See where you are.** The map shows your route, and the app looks up real places near your current spot on Wikipedia, with short summaries.
- **Keep going when you arrive.** Reaching your destination pauses you there and asks "Where to next?" Pick a new place or direction and a new leg starts from that spot. Any extra miles you logged past the destination count toward the new leg. The map draws the whole multi-leg path, and you can remove the latest leg if you change your mind.
- **Distance milestones.** About 75 cities around the world, each with fun facts. Once your total miles pass a city's distance from home (in any direction), you've "walked as far as" home → that city. These are distance comparisons, separate from the map route.
- **Stats.** Total miles, days logged, your day streak, and progress toward your current destination.

Your log is saved in your browser (localStorage), so it stays on the device you use. Nothing is sent anywhere except the Wikipedia lookups and map tiles.

## Development

It's a static site with no build step. To run it locally:

```bash
npm start        # serves at http://localhost:8000
npm test         # runs the unit tests
```

### Files

- `index.html`, `css/styles.css`: page and styles (light and dark mode)
- `js/geo.js`: great-circle distance, bearing and route math
- `js/places.js`: curated destinations and fun facts (add your own here)
- `js/wiki.js`: Wikipedia lookup for places near your current position
- `js/app.js`: app state, journey legs, logging and rendering
- `tests/geo.test.js`: unit tests for the route math and place data

## Deployment

Pushing to `main` deploys automatically. The [GitHub Actions workflow](.github/workflows/pages.yml) runs the tests, then publishes `index.html`, `css/` and `js/` to GitHub Pages. You can follow each run on the [Actions tab](https://github.com/prestonthomas-cmd/mileMarkerApp/actions).
