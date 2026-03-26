# Code Genius — Development Progress

## Status Overview

| Phase | Name | Status |
|-------|------|--------|
| 1 | Scaffolding & Config | ✅ Done |
| 2 | Authentication | ✅ Done |
| 3 | Code Editor Interface | ✅ Done |
| 4 | AI Integration (Groq) | ✅ Done |
| 5 | Code History | ✅ Done |
| 6 | Security Hardening | ✅ Done |
| 7 | Polish & Performance | ✅ Done |

---

## ✅ Phase 1 — Scaffolding & Config (DONE)

### What was built
- `code-genius/` monorepo with `client/` and `server/` subdirectories
- **Client**: Vite + React (manually scaffolded), `@monaco-editor/react`, `axios`, `react-router-dom` installed
- **Server**: Express, Mongoose, `groq-sdk`, `jsonwebtoken`, `bcryptjs`, `cors`, `helmet`, `express-rate-limit`, `express-mongo-sanitize`, `joi`, `nodemon` installed
- `server/config/db.js` — Mongoose connection with error handling and `process.exit(1)` on failure
- `server/app.js` — Express setup: Helmet, CORS (origin-whitelist), JSON body parser (10kb limit), mongo-sanitize, global rate limiter (100 req/15min), routes, error handler
- `server/server.js` — entry point: loads `.env`, connects DB, starts listening
- `server/.env.example` — template with all required env vars

### Env vars required
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/code-genius
JWT_SECRET=<strong secret>
JWT_EXPIRES_IN=7d
GROQ_API_KEY=<your groq key>
GROQ_MODEL=llama3-70b-8192
CLIENT_ORIGIN=http://localhost:3000
```

### Decisions / Notes
- Vite used instead of CRA (faster dev server, no ejecting needed)
- All CSS uses CSS custom properties defined in `index.css` (:root) for consistent theming
- Vite dev server proxy configured: `/api` → `http://localhost:5000` (no CORS in dev)

---

## ✅ Phase 2 — Authentication (DONE)

### What was built

#### Backend
- `server/models/User.js` — Mongoose schema: `{ username, email, passwordHash, createdAt }`
  - `passwordHash` excluded from queries by default (`select: false`)
  - bcrypt pre-save hook (salt rounds: 12)
  - `comparePassword()` instance method
  - Username regex validation: alphanumeric + underscore only
- `server/controllers/authController.js` — `register()` + `login()`
  - Joi validation with `stripUnknown: true` (rejects extra fields)
  - Generic "Invalid email or password" on login failure (no user enumeration)
  - JWT signed with 7d expiry
- `server/routes/authRoutes.js` — `POST /api/auth/register`, `POST /api/auth/login`
- `server/middleware/authMiddleware.js` — `verifyToken`: validates Bearer token, attaches `req.user = { id, iat, exp }`
- `server/middleware/errorHandler.js` — centralised error handler; strips stack traces in production

#### Frontend
- `client/src/utils/token.js` — `getToken`, `setToken`, `removeToken`, `decodeToken`, `isTokenExpired`
- `client/src/services/api.js` — Axios instance (`baseURL: /api`); request interceptor injects JWT; response interceptor auto-redirects on 401
- `client/src/context/AuthContext.jsx` — `AuthProvider` with `user`, `login()`, `logout()`, `isAuthenticated`, `loading`; token restored from localStorage on mount
- `client/src/pages/Login.jsx` — validated login form; navigates to `/dashboard` on success
- `client/src/pages/Register.jsx` — validated register form (username, email, password, confirm password)
- `client/src/pages/Auth.css` — shared dark-theme styles for both auth forms
- `client/src/components/Layout/Header.jsx` — sticky nav bar with logo, Editor/History links, Sign Out button
- `client/src/components/Layout/Header.css` — header styles + global spinner utility
- `client/src/components/Layout/ProtectedRoute.jsx` — redirects to `/login` if not authenticated; shows spinner while auth state loads
- `client/src/App.jsx` — full React Router v6 setup: public routes (`/login`, `/register`), protected routes (`/dashboard`, `/history`), root redirect

### Decisions / Notes
- JWT stored in `localStorage` (acceptable for this scope; HttpOnly cookie migration is a future enhancement)
- `select: false` on `passwordHash` ensures it's never accidentally returned in API responses
- Generic login error message prevents user enumeration attacks
- `stripUnknown: true` in Joi removes unexpected request body fields before processing

---

## ✅ Phase 3 — Code Editor Interface (DONE)

### What was built
- `client/src/components/Editor/CodeEditor.jsx` + `client/src/components/Editor/CodeEditor.css` — Monaco wrapper with language/value/onChange props
- `client/src/pages/Dashboard.jsx` + `client/src/pages/Dashboard.css` — split editor layout with language selector and Analyze/Save controls
- `client/src/components/AIPanel/AIPanel.jsx` + `client/src/components/AIPanel/AIPanel.css` — tabbed AI panel (Errors/Suggestions/Explain) with loading skeletons

---

## ✅ Phase 4 — AI Integration (DONE)

### What was built
- `server/services/aiService.js` — Groq calls for detect/suggest/explain with beginner-focused prompts
- `server/controllers/aiController.js` — Joi-validated handlers with `stripUnknown: true`
- `server/routes/aiRoutes.js` — protected AI endpoints
- `server/models/Log.js` — per-request AI audit logging
- `client/src/services/api.js` — AI API helpers with AbortController signal support
- `client/src/pages/Dashboard.jsx` — `Promise.all` analyze flow to populate all AIPanel tabs
- `client/src/hooks/useDebounce.js` — 300ms debounced auto-detect trigger

---

## ✅ Phase 5 — Code History (DONE)

### What was built
- `server/models/CodeHistory.js` — user-scoped saved code and AI response snapshots
- `server/controllers/historyController.js` — save/list/delete with Joi validation and 20-item pagination
- `server/routes/historyRoutes.js` — protected history CRUD endpoints
- `client/src/pages/History.jsx` + `client/src/pages/History.css` — history list with pagination, delete, and open-in-editor flow
- `client/src/pages/Dashboard.jsx` — Save button posts to `/api/history`

---

## ✅ Phase 6 — Security Hardening (DONE)

### What was completed
- `express-mongo-sanitize` remains active globally in `server/app.js`
- Added AI-specific limiter in `server/app.js`: 10 requests/minute on `/api/ai/*`
- New AI/history controllers use Joi with `stripUnknown: true`
- CORS remains whitelist-based through `CLIENT_ORIGIN`
- `server/middleware/errorHandler.js` keeps production-safe 500 messaging

---

## ✅ Phase 7 — Polish & Performance (DONE)

### What was completed
- Dashboard uses AbortController for AI requests plus timeout guard for stale calls
- Added Error Boundary component around editor and AI panel sections
- Responsive dashboard layout stacks on widths below 1024px
- Added root `README.md` with setup, env references, and run commands
