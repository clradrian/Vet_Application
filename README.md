# Vet App (local)

This repository contains a small full-stack veterinary app.

Backend:
- `src/index.js` - Express server and API endpoints
- `src/petModel.js` - DB access for pets and related records
- `db/migrations` - SQL migrations (run with `node src/migrate.js`)

New endpoints added:
- `GET /api/pets/:owner_id` - returns pets for an owner with `vaccines`, `dewormingInternal`, `dewormingExternal` attached
- `GET /api/pets/:pet_id/vaccines` - returns vaccines for a pet
- `GET /api/pets/:pet_id/dewormings` - returns dewormings for a pet

To apply migrations:

```bash
cd vet-app-backend
npm install
node src/migrate.js
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
