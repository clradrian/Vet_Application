
# Vet App (local)

This repository contains a small full-stack veterinary app.

Core pieces
- Backend: `vet-app-backend/src/index.js` (Express API) and `vet-app-backend/src/petModel.js` (DB access)
- Frontend: `vet-app-frontend/src/*` (React + MUI)
- DB migrations: `vet-app-backend/db/migrations` (run with `node src/migrate.js`)

New features (recent changes)
- Pets now return advanced details: `GET /api/pets/:owner_id` returns each pet with `vaccines`, `dewormingInternal` and `dewormingExternal` arrays populated.
- New helper endpoints: `GET /api/pets/:pet_id/vaccines` and `GET /api/pets/:pet_id/dewormings` for per-pet queries.
- Vaccine and deworming records now include an `expirydate` column (migration added).
- Frontend advanced pet modal (`StaffManager.js`) displays vaccine/deworming entries and shows expiry dates with visual cues for "expiring soon" and "expired".
- Migration runner: `vet-app-backend/src/migrate.js` applies SQL files in `db/migrations`.
- Tests: simple backend test for `petModel` and frontend unit test for expiry calculations were added.
- CI workflow: `.github/workflows/ci.yml` runs migrations and both backend/frontend tests on push/PR.

Why these changes
- Displaying vaccines/dewormings together with pets improves the admin user experience and eliminates extra round-trips from the UI.
- Storing expiry dates lets staff see and act on soon-to-expire or expired protections.

How to run locally

Apply migrations (adds `expirydate` columns if missing):

```bash
cd vet-app-backend
npm install
npm run migrate
```

Start backend:

```bash
npm start
```

Start frontend in another shell:

```bash
cd vet-app-frontend
npm install
npm start
```

Testing
- Backend: `cd vet-app-backend && npm test` (runs a small script that prints pets for a sample owner)
- Frontend: `cd vet-app-frontend && npm test -- --watchAll=false`

Changelog (high level)
- Added: pet details attachment (vaccines/dewormings) to `getPetsByOwner` (backend)
- Added: `expirydate` columns via migration
- Added: UI display and expiry badges for vaccine/deworming entries (frontend)
- Added: migration runner, tests, and CI workflow

UI polish notes
- Advanced pet modal (Staff Manager)
	- Vaccines and dewormings are listed with administration date and expiry date.
	- Items expiring within 30 days are flagged with a yellow "(X zile)" caption.
	- Expired items are shown with a red "(expirat)" caption.
	- Editing an animal's advanced details allows adding/removing vaccine and deworming entries, including expiry dates.

Security / audit notes
- `npm audit fix` was run on the backend. The frontend reported transitive vulnerabilities that require a breaking upgrade (react-scripts). To avoid breaking changes we did *not* force-upgrade react-scripts; instead we installed the needed testing libraries and left upgrading react-scripts for a separate task.

Next recommended steps
- (Optional) Upgrade `react-scripts` and related build deps in a separate PR and run CI to validate.
- Add more unit/integration tests for pet-create and vaccine/deworming flows.
- Add an automated migration check in CI (already implemented in the workflow).
