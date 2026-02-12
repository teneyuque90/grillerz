# Grillerz Local Backend

Backend local para pruebas de app antes de tener dominio o despliegue publico.
Ahora usa SQLite persistente (no memoria volatil).

## Estructura (capas)

- `src/routes`: endpoints HTTP
- `src/services`: reglas de negocio
- `src/repositories`: acceso a SQLite
- `src/middleware`: auth y middlewares
- `src/lib`: utilidades compartidas
- `src/migrations`: versionado de esquema SQLite

## Run

```bash
cd backend
npm install
cp .env.example .env
npm run migrate
npm run dev
```

## Tests API

```bash
cd backend
npm test
```

La suite valida auth JWT, proteccion de reservas y permisos por usuario sobre una DB temporal aislada.

Server por defecto en `http://localhost:3000`.
DB por defecto en `backend/data/grillerz.sqlite`.

## Endpoints

- `GET /health`
- `POST /auth/login`
- `POST /auth/signup`
- `POST /auth/verify`
- `GET /auth/me` (requiere bearer token)
- `POST /auth/logout` (requiere bearer token)
- `GET /chefs`
- `GET /chefs/:chefId`
- `GET /bookings` (requiere bearer token)
- `GET /bookings?userId=<id>` (solo tu propio userId)
- `GET /bookings/:bookingId` (requiere bearer token)
- `POST /bookings` (requiere bearer token)

## Credenciales seed para login

- email: `gabriel@email.com`
- password: `123456`

## Variables de entorno

- `PORT` puerto del backend (`3000` por defecto)
- `DATABASE_PATH` ruta SQLite relativa a `backend/` (`./data/grillerz.sqlite`)
- `ALLOW_ANY_VERIFICATION_CODE` para pruebas locales (`true` por defecto fuera de produccion)
- `JWT_SECRET` secreto para firmar tokens JWT
- `JWT_EXPIRES_IN` expiracion JWT (ejemplo `7d`, `12h`)
- `GOOGLE_AI_STUDIO_API_KEY` API key para generacion de imagenes
- `GOOGLE_IMAGE_MODEL` modelo de imagen (`gemini-2.5-flash-image-preview` por defecto)

## Migraciones

Cada cambio de esquema debe agregarse como nueva migracion en `src/migrations/index.js`.
Para ejecutar manualmente:

```bash
cd backend
npm run migrate
```

## Generar imagenes (Google AI Studio)

1. Configura `GOOGLE_AI_STUDIO_API_KEY` en `backend/.env`.
2. Ajusta prompts en `backend/scripts/grillerz-image-prompts.json`.
3. Ejecuta:

```bash
cd backend
npm run generate:images:google
```

Genera imagenes en `assets/images/generated` y un `manifest.json` para mapearlas en la app.
