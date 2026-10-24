# CertiShield — Frontend + Backend (VS Code)

This project is separated into exactly two application folders:

- `frontend/` — React + Vite user interface
- `backend/` — Express API and server-side Gemini certificate analysis

## Requirements
Install Node.js 20.19+ or 22.12+ (Vite 8 requires a recent Node.js version).

## Run in VS Code

Open the extracted `certishield_split` folder in VS Code.

### Terminal 1 — Backend
```bash
cd backend
npm install
```
Copy `.env.example` to `.env` and add your Gemini API key:
```env
GEMINI_API_KEY=your_real_gemini_api_key
PORT=3000
```
Then start the API:
```bash
npm run dev
```
Health check: http://localhost:3000/api/health

### Terminal 2 — Frontend
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the local URL printed by Vite, usually http://localhost:5173.

The Vite development server forwards `/api` requests to the backend at `http://localhost:3000`.
If the backend runs at another address, set `BACKEND_URL` before starting Vite.

## Notes
- Keep the Gemini API key only in `backend/.env`; do not put it in frontend code.
- Certificate and other demo records are currently stored by the existing frontend storage service in the browser's local storage. This split does not convert that demo storage into a database.
- For production deployment, deploy the frontend and backend separately or configure a host to serve the built frontend and proxy `/api` to the backend.
