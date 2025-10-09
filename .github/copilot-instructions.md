# Copilot Instructions for Vet App

This project is a full-stack veterinary web application for Romania, built with Node.js (Express) backend, PostgreSQL database, and React frontend. It manages pet records, medicine administration logs, and reminders for future medicine. The backend is ready for email/SMS notifications.

## Architecture Overview
- **Frontend** (`vet-app-frontend`): React PWA. Main files: `src/App.js`, `src/index.js`.
- **Backend** (`vet-app-backend`): Node.js/Express. Main file: `src/index.js`. Uses PostgreSQL (see `.env`).
- **Database**: PostgreSQL. Connection string in `vet-app-backend/.env`.

## Developer Workflows
- **Frontend**: Run `npm install` and `npm start` in `vet-app-frontend`.
- **Backend**: Run `npm install` and `npm start` in `vet-app-backend`. Update `.env` for database credentials.
- **Database**: Create a PostgreSQL database named `vet_app_db` and update credentials in `.env`.
- **Notifications**: Integrate email (SendGrid/Mailgun) and SMS (Twilio) in backend as needed.

## Project Conventions
- Use environment variables for secrets and configuration (`.env`).
- API endpoints should be defined in `vet-app-backend/src/index.js` and follow RESTful patterns.
- Frontend communicates with backend via HTTP (CORS enabled).
- All new features should be documented in the respective `README.md` files.

## Key Files & Directories
- `vet-app-frontend/src/App.js`: Main React component.
- `vet-app-backend/src/index.js`: Express server entry point.
- `vet-app-backend/.env`: Environment variables for backend.
- `.github/copilot-instructions.md`: This file.

## Example Patterns
- **Express route**:
  ```js
  app.get('/api/pets', (req, res) => { /* ... */ });
  ```
- **React fetch**:
  ```js
  fetch('http://localhost:4000/api/pets')
    .then(res => res.json())
    .then(data => setPets(data));
  ```

## Integration Points
- Backend connects to PostgreSQL using `pg` package.
- Frontend fetches data from backend using REST API.
- Notifications (email/SMS) should be implemented in backend as needed.

---
Update this file as new conventions or workflows are added.
