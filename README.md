# Dev Tinder

Tinder-style developer networking app with:

- Backend API in `src/` (Node.js + Express + MongoDB)
- Separate frontend app in `frontend/` (React + Vite + shadcn-style UI)

## Run Backend

```bash
npm install
npm run dev
```

Backend runs on `http://localhost:3000`.

## Run Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Frontend Features

- Authentication (signup/login/logout)
- Tinder-like discover and swipe flow
- Incoming request review (accept/reject)
- Matches list
- Editable profile with password update
