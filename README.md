# ekupi.ba Automated Tests (Playwright + POM, TypeScript)

This repo contains **stable, public-site** UI tests for https://www.ekupi.ba/bs/ built with Playwright and a Page Object Model (POM).

## Quick start
1. Install dependencies:
   - `npm install`
2. Install Playwright browsers:
   - `npx playwright install`

## Run tests
- Smoke tests:
  - `npm run test:smoke`
- Functional tests:
  - `npm run test:functional`
- All tests:
  - `npm run test:all`

## Notes
- The suite intentionally avoids payment / checkout and account creation flows.
- Tests are written to be deterministic and resilient (prefer HTML5 validation and navigation assertions over inventory-dependent checks).
- POM is used so specs contain no raw selectors.
