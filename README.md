# habit-tracker

a simple habit tracking app made in partnership with AI.

## Structure

- Root-level entrypoint: [index.html](index.html)
- Shared frontend behavior: [static/js/app.js](static/js/app.js)
- Styles: [static/css/styles.css](static/css/styles.css)
- Backend app logic: [app.py](app.py)

## Notes

The app now uses a single canonical HTML entrypoint at the repository root so tests and local previews can find the UI reliably. The frontend script is also tolerant of legacy paths such as the old frontend directory and form page locations.
