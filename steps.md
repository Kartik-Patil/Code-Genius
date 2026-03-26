# Code Genius — Development Steps Log

## Overview
This file documents every step taken so far in building **Code Genius** — an AI-powered web-based coding assistant. It covers folder creation, commands run, and every file written with explanations of what each does.

---

## PHASE 1 — Scaffolding & Configuration

### Step 1: Create Full Folder Structure

**Command run:**
```powershell
New-Item -ItemType Directory -Force -Path "d:\SGT\Client projects\Soujanya Fatima\code-genius\client\src\components\Editor","d:\SGT\Client projects\Soujanya Fatima\code-genius\client\src\components\AIPanel","d:\SGT\Client projects\Soujanya Fatima\code-genius\client\src\components\Layout","d:\SGT\Client projects\Soujanya Fatima\code-genius\client\src\pages","d:\SGT\Client projects\Soujanya Fatima\code-genius\client\src\hooks","d:\SGT\Client projects\Soujanya Fatima\code-genius\client\src\context","d:\SGT\Client projects\Soujanya Fatima\code-genius\client\src\services","d:\SGT\Client projects\Soujanya Fatima\code-genius\client\src\utils","d:\SGT\Client projects\Soujanya Fatima\code-genius\client\public","d:\SGT\Client projects\Soujanya Fatima\code-genius\server\config","d:\SGT\Client projects\Soujanya Fatima\code-genius\server\controllers","d:\SGT\Client projects\Soujanya Fatima\code-genius\server\middleware","d:\SGT\Client projects\Soujanya Fatima\code-genius\server\models","d:\SGT\Client projects\Soujanya Fatima\code-genius\server\routes","d:\SGT\Client projects\Soujanya Fatima\code-genius\server\services","d:\SGT\Client projects\Soujanya Fatima\code-genius\server\utils" | Out-Null ; Write-Host "All directories created."
```

**What it does:**
Creates the complete folder structure for both the React frontend (`client/`) and the Express backend (`server/`) in one shot. This follows the 3-tier architecture — Presentation (client), Application (server logic), and Data (models/database).

---

### Step 2: Create `client/package.json`

**File:** `code-genius/client/package.json`

```json
{
  "name": "code-genius-client",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.6.0",
    "axios": "^1.7.2",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.24.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "vite": "^5.3.1"
  }
}
```

**What it does:**
Declares all frontend dependencies:
- `@monaco-editor/react` — the VS Code-grade code editor component
- `axios` — HTTP client for calling the backend API
- `react` + `react-dom` — core React library
- `react-router-dom` — client-side routing (Login, Register, Dashboard, History pages)
- `vite` — fast development server and build tool (replaces Create React App)

---

### Step 3: Create `client/vite.config.js`

**File:** `code-genius/client/vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

**What it does:**
Configures the Vite dev server:
- Runs on port **3000**
- All requests starting with `/api` are **proxied** to `http://localhost:5000` (the Express backend). This avoids CORS issues in development — the browser thinks everything is on the same origin.

---

### Step 4: Create `client/index.html`

**File:** `code-genius/client/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Code Genius</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**What it does:**
The single HTML page that hosts the entire React app. React mounts into the `<div id="root">` element. Vite injects the compiled JavaScript bundle here.

---

### Step 5: Create `client/src/main.jsx`

**File:** `code-genius/client/src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**What it does:**
The JavaScript entry point. It:
1. Finds the `<div id="root">` in `index.html`
2. Renders the `<App />` component inside it
3. `StrictMode` helps catch bugs by running extra checks in development

---

### Step 6: Create `client/src/index.css`

**File:** `code-genius/client/src/index.css`

**What it does:**
Global CSS file with:
- A **CSS reset** (removes default browser padding and margins)
- **CSS custom properties (variables)** for the dark theme: `--color-bg`, `--color-primary`, `--color-error`, etc. These are reused across all components so the theme can be changed in one place.
- Base styles for `body`, `button`, `a`, `input` elements

---

### Step 7: Create `server/package.json`

**File:** `code-genius/server/package.json`

```json
{
  "name": "code-genius-server",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-mongo-sanitize": "^2.2.0",
    "express-rate-limit": "^7.3.1",
    "groq-sdk": "^0.5.0",
    "helmet": "^7.1.0",
    "joi": "^17.13.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.5.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

**What each package does:**
| Package | Purpose |
|---------|---------|
| `express` | Web framework — handles routes, middleware, HTTP |
| `mongoose` | ODM (Object Document Mapper) for MongoDB |
| `dotenv` | Loads environment variables from `.env` file |
| `jsonwebtoken` | Creates and verifies JWTs for user sessions |
| `bcryptjs` | Hashes passwords securely before storing in DB |
| `cors` | Allows the React frontend to call the API |
| `helmet` | Sets security HTTP headers automatically |
| `express-rate-limit` | Limits repeated requests to prevent abuse/DDoS |
| `express-mongo-sanitize` | Strips `$` and `.` from inputs to prevent NoSQL injection |
| `joi` | Schema validation for all incoming request data |
| `groq-sdk` | Official Groq AI SDK for calling Llama3 AI model |
| `nodemon` | Auto-restarts server when files change during development |

---

### Step 8: Create `server/.env.example`

**File:** `code-genius/server/.env.example`

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/code-genius
JWT_SECRET=your_strong_jwt_secret_here_change_in_production
JWT_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama3-70b-8192
CLIENT_ORIGIN=http://localhost:3000
```

**What it does:**
A template showing every required environment variable. The actual `.env` file (which is never committed to git) is created by copying this and filling in real values. Variables:
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — secret key used to sign/verify JWTs (must be long and random in production)
- `JWT_EXPIRES_IN` — how long a login session lasts (7 days)
- `GROQ_API_KEY` — API key for Groq AI (get from console.groq.com)
- `GROQ_MODEL` — which Groq AI model to use (`llama3-70b-8192` = fast and capable)
- `CLIENT_ORIGIN` — frontend URL allowed in CORS

---

### Step 9: Create `server/config/db.js`

**File:** `code-genius/server/config/db.js`

```js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

**What it does:**
Connects to MongoDB using the URI from the `.env` file. If connection fails (wrong URI, DB not running), it logs the error and **exits the process** — there's no point running the server without a database.

---

### Step 10: Create `server/app.js`

**File:** `code-genius/server/app.js`

```js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(helmet());                          // Security headers
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10kb' }));   // Body parser (max 10kb to prevent payload attacks)
app.use(mongoSanitize());                   // Strip $ and . from body/params/query

// Global: 100 requests per 15 minutes
const globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(globalLimiter);

app.use('/api/auth', authRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use(errorHandler);  // Must be last

module.exports = app;
```

**What it does:**
The central Express application file. Wires together all middleware and routes in the correct order:
1. **helmet** — adds 11 security HTTP headers (prevents clickjacking, XSS, etc.)
2. **cors** — allows only the React frontend to call the API
3. **express.json** — parses JSON request bodies; capped at 10kb to prevent attack payloads
4. **mongoSanitize** — prevents NoSQL injection attacks
5. **rateLimit** — blocks IPs that send too many requests
6. **routes** — mounts auth routes at `/api/auth`
7. **errorHandler** — must be last; catches all errors and returns clean responses

---

### Step 11: Create `server/server.js`

**File:** `code-genius/server/server.js`

```js
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
```

**What it does:**
The entry point that starts everything:
1. Loads `.env` variables first (must be before anything else)
2. Connects to MongoDB
3. Only starts listening for HTTP requests after DB is connected

---

### Step 12: Install client dependencies

**Command run:**
```powershell
cd "d:\SGT\Client projects\Soujanya Fatima\code-genius\client"
npm install
```

**What it does:**
Downloads all packages listed in `client/package.json` into `client/node_modules/`. Output: **100 packages added, 4 moderate vulnerabilities**.

---

### Step 13: Install server dependencies

**Command run:**
```powershell
cd "d:\SGT\Client projects\Soujanya Fatima\code-genius\server"
npm install
```

**What it does:**
Downloads all packages listed in `server/package.json` into `server/node_modules/`. Output: **165 packages added, 0 vulnerabilities**.

---

### Step 13A: Actual Vite scaffolding attempts (genuine command history)

These commands were run before switching to manual scaffolding:

```powershell
cd "d:\SGT\Client projects\Soujanya Fatima" ; npm create vite@latest code-genius/client -- --template react 2>&1
y
cd "d:\SGT\Client projects\Soujanya Fatima" ; npm create vite@latest code-genius/client --template react --yes 2>&1
npx --yes create-vite@latest "d:\SGT\Client projects\Soujanya Fatima\code-genius\client" --template react 2>&1
```

**What happened:**
- The `npm create vite` runs were cancelled by interactive prompts in this environment.
- The `npx create-vite` absolute-path run failed due to path resolution (`ENOENT` with duplicated absolute path).
- After these failures, project structure and files were created manually (which is what the current codebase reflects).

---

## PHASE 2 — Authentication

### Step 14: Create `server/models/User.js`

**File:** `code-genius/server/models/User.js`

```js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true, minlength: 3, maxlength: 30,
    match: [/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, underscores'] },
  email:    { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true, select: false }, // hidden by default
  createdAt: { type: Date, default: Date.now }
});

// Before saving, auto-hash the password
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

// Method to compare a plain password against the stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
```

**What it does:**
Defines the MongoDB User document structure:
- `username` — only alphanumeric + undersscores (regex prevents script injection)
- `email` — unique, auto-lowercased; used as login identifier
- `passwordHash` — `select: false` means this field is **never returned in queries** unless explicitly asked for (security measure)
- **Pre-save hook** — automatically bcrypt-hashes the password with salt rounds of 12 before saving to DB. This means plain passwords are never stored.
- **`comparePassword` method** — used during login to safely check if entered password matches the hash

---

### Step 15: Create `server/controllers/authController.js`

**File:** `code-genius/server/controllers/authController.js`

**What it does:**
Contains two controller functions that handle authentication:

**`register(req, res, next)`:**
1. Validates the request body with Joi schema (username, email, password — rejects unknown fields)
2. Checks if the email already exists in DB
3. Creates the user (the pre-save hook auto-hashes the password)
4. Signs a JWT (7 day expiry)
5. Returns the token + safe user data (no passwordHash)

**`login(req, res, next)`:**
1. Validates email + password with Joi
2. Finds the user by email (explicitly selects `passwordHash`)
3. Compares the entered password against the stored hash
4. Returns a generic `"Invalid email or password"` message whether the email or password is wrong — **never reveals which one** (prevents user enumeration attack)
5. Signs and returns a JWT on success

**`signToken(userId)`** — signs a JWT containing only the user's `_id`. The secret comes from `.env`.

---

### Step 16: Create `server/routes/authRoutes.js`

**File:** `code-genius/server/routes/authRoutes.js`

```js
const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;
```

**What it does:**
Maps the HTTP endpoints to controller functions:
- `POST /api/auth/register` → `register()` controller
- `POST /api/auth/login` → `login()` controller

This router is mounted in `app.js` at `/api/auth`.

---

### Step 17: Create `server/middleware/authMiddleware.js`

**File:** `code-genius/server/middleware/authMiddleware.js`

```js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = { verifyToken };
```

**What it does:**
A middleware function that protects routes from unauthenticated access:
1. Reads the `Authorization` header from the request
2. Checks it starts with `"Bearer "` (standard JWT format)
3. Extracts and verifies the token using the `JWT_SECRET`
4. If valid, attaches the decoded payload (`{ id }`) to `req.user` so controllers know who's making the request
5. If expired or invalid, returns 401 — the frontend then auto-redirects to login

This middleware will be added to all AI and History routes in Phase 4 and 5.

---

### Step 18: Create `server/middleware/errorHandler.js`

**File:** `code-genius/server/middleware/errorHandler.js`

```js
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl} — ${err.message}`);

  const statusCode = err.statusCode || err.status || 500;

  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected error occurred.'
      : err.message || 'An unexpected error occurred.';

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
```

**What it does:**
Catches all errors thrown by any controller/middleware and sends a clean JSON response:
- Logs the full error **server-side** for debugging
- In **production**, hides internal 500 error details from the client (prevent info leakage)
- In **development**, shows the actual error message for easier debugging
- Always returns a consistent `{ message: "..." }` shape so the frontend can handle it

---

### Step 19: Create `client/src/utils/token.js`

**File:** `code-genius/client/src/utils/token.js`

```js
const TOKEN_KEY = 'cg_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch { return null; }
};

export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  return decoded.exp * 1000 < Date.now();
};
```

**What it does:**
Utility functions for managing the JWT on the client side:
- `getToken` / `setToken` / `removeToken` — read/write/delete the token from `localStorage`
- `decodeToken` — decodes the JWT payload (base64) to read the user ID and expiry. **Does not verify the signature** — that happens on the server on every request.
- `isTokenExpired` — checks if the token's `exp` timestamp has passed, so the app can log the user out proactively without waiting for the server to reject it

---

### Step 20: Create `client/src/services/api.js`

**File:** `code-genius/client/src/services/api.js`

```js
import axios from 'axios';
import { getToken, removeToken } from '../utils/token';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT to every outgoing request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout if server returns 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

export default api;
```

**What it does:**
A centralized Axios instance that all frontend API calls go through:
- `baseURL: '/api'` — all calls are relative to `/api` (proxied to Express in dev)
- `timeout: 15000` — cancels requests after 15 seconds
- **Request interceptor** — automatically adds `Authorization: Bearer <token>` header to every request so individual call sites don't need to handle it
- **Response interceptor** — if any response returns 401 (Unauthorized), clears the token and redirects to `/login` (handles expired or invalidated sessions)
- Exports `registerUser` and `loginUser` functions — more endpoint functions will be added in Phase 4 for AI calls and Phase 5 for history

---

### Step 21: Create `client/src/context/AuthContext.jsx`

**File:** `code-genius/client/src/context/AuthContext.jsx`

**What it does:**
React Context that provides authentication state across the entire app:
- On mount, checks localStorage for a stored token — if it's valid and not expired, restores the session without requiring re-login
- `login(token, userData)` — stores the token and sets the user in state (called after successful register/login API response)
- `logout()` — clears token and resets user state
- `loading` state — prevents a flash of the login screen while checking the stored token on page load
- `isAuthenticated` — boolean shortcut (`!!user`) used in `ProtectedRoute`
- `useAuth()` hook — lets any component access auth state with `const { user, login, logout } = useAuth()`

---

### Step 22: Create `client/src/pages/Login.jsx`

**File:** `code-genius/client/src/pages/Login.jsx`

**What it does:**
The login page with a dark-themed form:
- **Client-side validation** before sending any API request (checks for empty fields, valid email format)
- Shows field-level error messages (e.g., "Email is required." under the email field)
- Calls `loginUser()` from `api.js` on submit
- On success: calls `login(token, user)` from AuthContext and navigates to `/dashboard`
- On failure: displays the server error message (e.g., "Invalid email or password.")
- Disables all inputs and the button while the request is in flight (prevents double-submit)
- Link to `/register` for new users

---

### Step 23: Create `client/src/pages/Register.jsx`

**File:** `code-genius/client/src/pages/Register.jsx`

**What it does:**
The registration page — same structure as Login but with 4 fields:
- `username` — validates alphanumeric + underscore only (mirrors server-side rule)
- `email` — validates email format
- `password` — minimum 8 characters
- `confirmPassword` — must match `password` exactly (checked client-side only, never sent to server)
- Calls `registerUser()` on submit; on success goes straight to `/dashboard` (user is already logged in)

---

### Step 24: Create `client/src/pages/Auth.css`

**File:** `code-genius/client/src/pages/Auth.css`

**What it does:**
Shared styles for both Login and Register pages:
- `.auth-page` — full viewport height, centered flex layout
- `.auth-card` — dark card with border and shadow where the form sits
- `.form-group` / `input` — dark input fields that highlight in purple on focus, red on error
- `.btn-primary` — full-width purple login/register button
- Error states, disabled states, hover effects
- Uses CSS variables from `index.css` for consistent theming

---

### Step 25: Create `client/src/components/Layout/ProtectedRoute.jsx`

**File:** `code-genius/client/src/components/Layout/ProtectedRoute.jsx`

```jsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="full-page-center"><span className="spinner" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};
```

**What it does:**
A wrapper component that guards any route requiring login:
- While auth state is loading (reading token from localStorage), shows a spinner — prevents a flash-redirect to `/login` on page refresh
- If not authenticated, redirects to `/login` and replaces the history entry (so the back button doesn't return to the protected page)
- If authenticated, renders the actual page (`children`)

---

### Step 26: Create `client/src/components/Layout/Header.jsx` + `Header.css`

**Files:** `code-genius/client/src/components/Layout/Header.jsx` and `Header.css`

**What it does:**
A sticky top navigation bar shown on all authenticated pages:
- **Logo** (⚡ Code Genius) — links to `/dashboard`
- **Nav links** — Editor (Dashboard) and History
- **User info** — shows the logged-in username
- **Sign Out button** — calls `logout()` from AuthContext and redirects to `/login`
- `Header.css` also defines `.spinner` and `.full-page-center` styles used by `ProtectedRoute`

---

### Step 27: Create placeholder pages

**Files:**
- `client/src/pages/Dashboard.jsx` — placeholder saying "Editor coming in Phase 3"
- `client/src/pages/History.jsx` — placeholder saying "History coming in Phase 5"

**What they do:**
Temporary placeholder pages so routing works end-to-end right now. Will be replaced with full implementations in Phase 3 and Phase 5 respectively.

---

### Step 28: Create `client/src/App.jsx`

**File:** `code-genius/client/src/App.jsx`

```jsx
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/history"   element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/"          element={<Navigate to="/login" replace />} />
        <Route path="*"          element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);
```

**What it does:**
The root component that defines the entire app structure:
- Wraps everything in `<BrowserRouter>` for React Router and `<AuthProvider>` for global auth state
- Maps URL paths to page components
- `/dashboard` and `/history` are wrapped in `<ProtectedRoute>` — only accessible when logged in
- Redirects root `/` and unknown paths to `/login`

---

## Current File Tree

```
code-genius/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── node_modules/           ← installed
│   └── src/
│       ├── App.jsx             ← router + auth provider
│       ├── main.jsx            ← entry point
│       ├── index.css           ← global dark theme + CSS variables
│       ├── components/
│       │   └── Layout/
│       │       ├── Header.jsx      ← top nav bar
│       │       ├── Header.css
│       │       └── ProtectedRoute.jsx  ← auth guard
│       ├── context/
│       │   └── AuthContext.jsx     ← global auth state (JWT)
│       ├── pages/
│       │   ├── Auth.css            ← shared login/register styles
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx       ← placeholder (Phase 3)
│       │   └── History.jsx         ← placeholder (Phase 5)
│       ├── services/
│       │   └── api.js              ← axios instance + auth endpoints
│       └── utils/
│           └── token.js            ← localStorage JWT helpers
│
└── server/
    ├── package.json
    ├── server.js               ← entry point
    ├── app.js                  ← express setup + middleware
    ├── node_modules/           ← installed
    ├── .env.example            ← env variable template
    ├── config/
    │   └── db.js               ← mongodb connection
    ├── controllers/
    │   └── authController.js   ← register + login logic
    ├── middleware/
    │   ├── authMiddleware.js   ← JWT verifyToken
    │   └── errorHandler.js     ← centralised error responses
    ├── models/
    │   └── User.js             ← user schema + bcrypt hook
    └── routes/
        └── authRoutes.js       ← POST /register, POST /login
```

---

## What's Still To Do

See `progress.md` for the full remaining phases:
- **Phase 3** — Monaco Code Editor + AI Panel layout
- **Phase 4** — Groq AI integration (error detection, suggestions, explanations)
- **Phase 5** — Code history (save, view, reload, delete)
- **Phase 6** — Security hardening (rate limits on AI routes, Joi on all controllers)
- **Phase 7** — Polish, performance, responsive layout, README

---

## How to Run (once `.env` is set up)

```powershell
# Terminal 1 — Backend
cd server
copy .env.example .env   # then fill in MONGO_URI, JWT_SECRET, GROQ_API_KEY
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health
