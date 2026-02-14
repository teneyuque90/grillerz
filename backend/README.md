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

## Deploy VPS (Docker, 24/7)

Este flujo evita depender de tu laptop abierta.

### 1) Preparar variables de produccion

```bash
cd backend
cp .env.production.example .env.production
```

Edita `.env.production` y cambia al menos:

- `JWT_SECRET` (obligatorio)
- `CORS_ORIGIN` (`*` o lista separada por coma)

### 2) Levantar servicio en VPS

```bash
cd backend/deploy
docker compose -f docker-compose.vps.yml up -d --build
```

### 3) Verificar

```bash
curl http://TU_IP_DEL_VPS:3000/health
```

Debe responder `{"ok":true,...}`.

### 4) Actualizar APK (EAS env)

Desde tu maquina local:

```bash
cd /ruta/al/proyecto/Grillerz\ v2
npx eas-cli env:create preview --name EXPO_PUBLIC_API_URL --value http://TU_IP_DEL_VPS:3000 --visibility plaintext --force --non-interactive
npx eas-cli build -p android --profile preview --non-interactive
```

### Notas

- Persistencia SQLite: volumen Docker `grillerz_data`.
- Imagenes locales: carpeta `backend/public/media` se monta dentro del contenedor.
- Para produccion real se recomienda HTTPS con dominio y proxy (Nginx o Caddy).

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
- `CORS_ORIGIN` origen permitido (ejemplo `https://app.tudominio.com` o `*`)
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
