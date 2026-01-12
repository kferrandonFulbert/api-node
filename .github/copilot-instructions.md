# Copilot Instructions for api-node

Purpose
- Short summary: lightweight Express API with ESM modules, file uploads, JWT-auth middleware, and OpenAPI (Swagger) docs.

Big picture (what matters)
- Server is in `src/app.js` and `src/server.js` — Express app configured and exported from `app.js` (used by tests), server created in `server.js`.
- Routes live in `src/routes/*` and map to `src/controllers/*`. `services/` contains small utility functions (e.g., JWT in `src/services/jwt.service.js`).
- File uploads are handled with `multer` in `src/routes/upload.routes.js` and the upload logic is in `src/controllers/upload.controller.js`. Uploaded files are served statically from `/${UPLOAD_DIR}` (configurable via env).
- Logging uses `pino` via `src/utils/logger.js` and middleware attaches `req.log` to requests. Use `req.log?.info/warn/error` (optional chaining is used consistently).
- OpenAPI comments in `src/routes/*.js` and `src/controllers/*.js` are picked up by `src/swagger.js` to generate `/docs` and `/docs.json`.

How to run & test (developer workflows) ⚙️
- Dev server: `npm run dev` (uses `nodemon src/server.js`).
- Production: `npm start` (runs `node src/server.js`).
- Tests: `npm test` runs `jest --runInBand` (important to avoid parallel file conflicts); `npm run test:watch` for iterative work.
- Integration tests use `supertest` and `app` is imported from `src/app.js` so tests don't start a separate server process.

Important conventions & project specifics 🔧
- ESM (ECMAScript modules) with `.js` files and `import`/`export` syntax. Jest is configured to treat `.js` as ESM (`src/jest.config.cjs`).
- Environment variables drive behavior: `JWT_SECRET`, `JWT_EXPIRE`, `PORT`, `API_VERSION`, `UPLOAD_DIR`, `UPLOAD_MAX_SIZE`, `LOG_DIR`, `LOG_FILE`, `LOG_LEVEL`. `dotenv` is loaded in `src/app.js`.
- Uploads: active endpoint is `POST /api/<version>/uploads/:name` — accepts field names `file` or `image` and normalizes to `req.file`. Files are stored on disk with sanitized names. See `src/routes/upload.routes.js` and `src/controllers/upload.controller.js` for examples.
- Error handling: app-level error handler normalizes `MulterError` and returns sensible statuses (e.g., 413 for `LIMIT_FILE_SIZE`). See the error middleware in `src/app.js`.
- Logging: prefer `req.log` over `console.log`. `src/utils/logger.js` ensures log folder exists and writes to file.
- Tests create files under `uploads/` — tests clean up files with names containing `test-image` or `test-`. Keep `jest` running `--runInBand` to avoid race conditions.

Common tasks examples (copy/paste friendly)
- Add a new route: create `src/routes/xyz.routes.js` that `import`s a controller from `src/controllers/xyz.controller.js` and register it in `src/app.js` under `${API_PREFIX}`.
- Add an OpenAPI doc: add JSDoc `@openapi` block above a route or controller method; `src/swagger.js` reads `src/routes/*.js` and `src/controllers/*.js`.
- Handle auth: `authMiddleware` expects `Authorization: Bearer <token>` and decodes with `process.env.JWT_SECRET` (`src/middlewares/auth.middleware.js`).

Notes & gotchas ⚠️
- No DB layer exists yet — registration/login endpoints are placeholders. Do not expect persistent user storage.
- Because files are stored on disk, CI or test runners must have filesystem access and permission to create `uploads/` and `logs/` directories.
- If you need Node ESM behavior locally, ensure your Node version supports ESM (the project uses ESM + Jest ESM settings).

Where to look first
- `src/app.js` — app wiring and middleware
- `src/routes/upload.routes.js` and `src/controllers/upload.controller.js` — detailed upload logic and examples
- `src/utils/logger.js` — logging conventions
- `src/swagger.js` — how docs are generated
- `src/__tests__/` — unit and integration test patterns

If anything here is unclear or you want more examples (e.g., adding a new endpoint + test), tell me which task to expand and I will update this file. ✅
