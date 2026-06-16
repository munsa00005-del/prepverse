# Convertly — Universal Document Converter

A full-stack document conversion app: **React + Tailwind** frontend, **FastAPI +
SQLAlchemy** backend, with Google OAuth and email/password authentication.

Upload a document, pick a compatible target format, watch it convert, and download
the result. Every conversion is saved to a per-user history.

```
frontend/   React + Vite + Tailwind  (port 5173)
backend/    FastAPI + SQLAlchemy      (port 8000)
```

---

## Quick start (zero external services)

The app runs with **no Postgres, no Google credentials, and no email provider** —
it falls back to SQLite and prints verification/reset links to the backend console.

### 1. Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # defaults are fine for local dev
uvicorn app.main:app --reload   # http://localhost:8000  (docs at /docs)
```

System binaries used by some converters (install what you need):

```bash
# Debian/Ubuntu
sudo apt-get install libreoffice poppler-utils tesseract-ocr pandoc
# macOS
brew install libreoffice poppler tesseract pandoc
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env             # optional: add VITE_GOOGLE_CLIENT_ID
npm run dev                      # http://localhost:5173
```

The Vite dev server proxies `/api` → `http://localhost:8000`, so auth cookies are
first-party (no CORS/SameSite headaches in dev).

### Or with Docker

```bash
docker compose up --build        # Postgres + backend (with all binaries) + frontend
```

---

## Authentication

| Flow | Endpoint | Notes |
|------|----------|-------|
| Sign up | `POST /auth/signup` | Validates password strength, sends verification email |
| Verify email | `POST /auth/verify-email?token=` | One-time token, 24h TTL |
| Log in | `POST /auth/login` | Requires verified email |
| Google sign-in | `POST /auth/google` | Verifies the Google ID token server-side |
| Forgot password | `POST /auth/forgot-password` | Always 200 (no email enumeration) |
| Reset password | `POST /auth/reset-password` | One-time token, 1h TTL; revokes sessions |
| Refresh | `POST /auth/refresh` | Rotates the refresh token |
| Logout | `POST /auth/logout` | Revokes refresh token in DB |
| Current user | `GET /auth/me` | — |

**Tokens.** A 15-minute JWT access token and a 7-day refresh token are stored in
`httpOnly` cookies. The frontend `api()` wrapper transparently calls `/auth/refresh`
on a 401 and retries once, so sessions persist across reloads. Refresh tokens are
stored hashed and rotated on every use; logout and password changes revoke them.

**Password rules** (enforced on both client and server): ≥8 chars, 1 uppercase,
1 number, 1 special character. Hashed with bcrypt via `passlib`.

### Enabling Google sign-in

1. Create an OAuth 2.0 Client ID at <https://console.cloud.google.com/apis/credentials>
   (Web application, authorized origin `http://localhost:5173`).
2. Put the client ID in **both** `backend/.env` (`GOOGLE_CLIENT_ID`) and
   `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`).

When unset, the Google buttons render a "not configured" placeholder and the rest
of the app works normally.

---

## Conversion matrix

The compatibility map is derived from the backend converter registry
(`GET /convert/formats`), so the frontend dropdown always matches what the server
can actually do.

| Source | Targets | Engine |
|--------|---------|--------|
| **pdf** | docx, txt, xlsx, images, html | pdf2docx, pdfplumber, openpyxl, pdf2image, pdfminer (OCR via pytesseract for scanned PDFs) |
| **docx** | pdf, txt, md, html, xlsx | LibreOffice (pdf), pandoc (txt/md/html), python-docx (tables → xlsx) |
| **doc** | docx | LibreOffice headless pre-step |
| **xlsx** | csv, pdf, docx | pandas, LibreOffice, python-docx |
| **csv** | xlsx, pdf | pandas → openpyxl / LibreOffice |
| **pptx** | pdf, txt, images | LibreOffice, python-pptx, pdf2image |
| **md** | html, docx, txt, pdf | pandoc / reportlab fallback |
| **html** | md, docx, txt, pdf | pandoc / reportlab fallback |
| **txt** | md, html, pdf | reportlab (US-Letter), pandoc |

`images` targets are returned as a `.zip` of per-page PNGs.

### Conversion conventions

- **DOCX generation**: separate `Paragraph` elements (never `\n` inside one),
  US-Letter page size (12240 × 15840 DXA), real list formatting.
- **Spreadsheets**: data is carried across as-is. When *generating* workbooks with
  computed columns, write real Excel formulas and run
  [`scripts/recalc.py`](backend/scripts/recalc.py) to cache results and catch
  `#REF!` / `#DIV/0!` errors.

---

## Project layout

```
backend/
  app/
    main.py              FastAPI app + CORS + lifespan
    config.py            env-driven settings (pydantic-settings)
    database.py          SQLAlchemy engine/session
    models.py            User, RefreshToken, VerificationToken, Conversion
    schemas.py           Pydantic request/response + password validation
    security.py          bcrypt + JWT + opaque-token helpers
    deps.py              get_current_user + cookie helpers
    email_utils.py       SendGrid → SMTP → console
    routers/             auth, convert, history, account
    converters/          registry + pdf/docx/spreadsheet/pptx/text modules
  scripts/recalc.py
frontend/
  src/
    api/client.js        fetch wrapper w/ silent refresh
    context/             AuthContext, ThemeContext
    components/          Navbar, FileDropzone, FormatToken, GoogleSignIn, …
    pages/               Login, Signup, VerifyEmail, ForgotPassword,
                         ResetPassword, AppDashboard, History, Account
```

---

## Production notes

- Set `DATABASE_URL` to Postgres, `ENVIRONMENT=production`, `COOKIE_SECURE=true`,
  and a long random `JWT_SECRET`.
- For a cross-site frontend, set `COOKIE_SAMESITE=none` (requires HTTPS) and adjust
  CORS `FRONTEND_URL`.
- `Base.metadata.create_all` is used for convenience; adopt Alembic migrations for
  real deployments.
- Conversions run synchronously in the request. For large files or heavy load,
  move them to a background worker (e.g. Celery/RQ) and poll the conversion status.
```
