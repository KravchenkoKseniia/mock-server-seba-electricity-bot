# Mock Server for SEBA Electricity Bot

This project is a mock server built with Express and TypeScript, designed to simulate user and device management for the SEBA Electricity Bot. It provides endpoints for user registration, login, device registration, and device status/history queries.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Clone the Repository
```bash
git clone <repository-url>
cd mock-server-seba-electricity-bot/mock-server
```

### Install Dependencies
```bash
npm install
```

### Run the Server
For development, run:
```bash
npm run dev
```
This will start both the Vite frontend (if present) and the mock Express server on port 8080.

The Express server endpoints will be available at `http://localhost:8080`.

## API Endpoints
- `POST /register` — Register a new user. Required fields: `firstName`, `lastName`, `email`, `password`, `gender`. Returns user info and token.
- `POST /login` — Login with credentials. Required fields: `username` (email), `password`. Returns user info and token.
- `GET /user/me` — Get current user info (requires Bearer token).
- `PUT /user/me` — Update user info (requires Bearer token). Accepts: `firstName`, `lastName`, `gender`, `timeZone`.
- `POST /user/avatar` — Upload user avatar (multipart/form-data, field: `avatar`, requires Bearer token).
- `DELETE /user/avatar` — Remove user avatar (requires Bearer token).
- `POST /devices/register` — Register a device. Required: `uuid`, `name` (requires Bearer token).
- `GET /devices/status?uuid=...` — Get device status (requires Bearer token).
- `GET /devices?uuid=...` — Get device status history (requires Bearer token)
- `GET /devices?email=...` — List all devices for a user (requires Bearer token)
- `DELETE /devices/delete` — Delete a device (requires Bearer token, pass `{ uuid }` in body)

## How to Add or Modify Responses

1. **Open the server file:**
   - Edit `src/mock-server/mockServer.ts`.

2. **Add or modify endpoints:**
   - Use Express route handlers (e.g., `app.get`, `app.post`) to add new endpoints or change existing ones.
   - Example to add a new endpoint:
     ```typescript
     app.get('/new-endpoint', (req, res) => {
         res.json({ message: 'Your custom response' });
     });
     ```

3. **Customize responses:**
   - Change the logic inside the route handlers to return the desired mock data or status codes.

4. **Save and restart the server:**
   - If running in dev mode, changes will reload automatically. Otherwise, restart the server with `npm run dev`.

## Notes
- This server is for development and testing purposes only. Data is stored in memory and will reset on restart.
- You can extend the server with more endpoints or logic as needed for your testing scenarios.

---

Feel free to contribute or modify as needed for your project!


