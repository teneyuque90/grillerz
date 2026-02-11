# Grillerz Local Backend

Backend local simple para pruebas de app antes de tener dominio o despliegue publico.

## Run

```bash
cd backend
npm install
npm run dev
```

Server por defecto en `http://localhost:3000`.

## Endpoints

- `GET /health`
- `POST /auth/login`
- `POST /auth/signup`
- `POST /auth/verify`
- `GET /chefs`
- `GET /chefs/:chefId`
- `GET /bookings?userId=<id>`
- `GET /bookings/:bookingId`
- `POST /bookings`

## Credenciales seed para login

- email: `gabriel@email.com`
- password: `123456`
