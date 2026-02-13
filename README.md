# Grillerz v2

App mobile estilo Grillerz (white + fire red) con 32 pantallas, flujo de reserva conectado y backend local para pruebas.

## Pantallas incluidas (32)

- SplashScreen
- Onboarding01
- Onboarding02
- Onboarding03
- SignIn
- ForgotPassword
- SignUp
- VerificationCode
- SetLocation
- ChooseLocation
- ChooseLanguage
- Browse01
- Browse02
- Browse03
- Map
- Categories
- Search
- Filter
- Profile
- Schedule
- ReviewBooking
- Payment
- Success
- Bookings
- BookingDetails
- Connect
- Chat
- Calls
- Notifications
- Account
- Favorites
- Settings

## Estado actual

- UI implementada para las 32 pantallas.
- Flujo conectado con estado global y persistencia local (`AsyncStorage`):
  - auth
  - seleccion de chef
  - draft de reserva
  - creacion de reservas
- API client listo para backend real (`src/api/*`).
- Backend local de pruebas en `backend/`.

## Estructura relevante

- `src/state/AppStateContext.tsx`: estado global de la app.
- `src/api/grillerzApi.ts`: llamadas HTTP al backend.
- `src/config/api.ts`: `BASE_URL` por entorno.
- `backend/src/server.js`: backend local Express.

## Variables de entorno app

1. Copia `.env.example` a `.env`.
2. Ajusta `EXPO_PUBLIC_API_URL` segun donde corra tu backend.

Valores comunes:

- iOS simulator: `http://localhost:3000`
- Android emulator: `http://10.0.2.2:3000`
- Celular fisico: `http://TU_IP_LOCAL:3000`

## Ejecutar backend local

```bash
cd backend
npm install
npm run dev
```

## Usar imagenes locales (sin dominio)

No necesitas comprar dominio para pruebas. Puedes usar archivos locales desde tu backend:

1. Coloca imagenes en:
   - `backend/public/media/chefs/<chef-id>/avatar.jpg`
   - `backend/public/media/chefs/<chef-id>/cover.jpg`
   - `backend/public/media/chefs/<chef-id>/gallery-1.jpg` (opcional)
2. Inicia backend con `npm run dev` en `backend/`.
3. La API `/chefs` detecta esos archivos automaticamente y responde rutas `/media/...`.
4. La app convierte esas rutas a URL completa usando tu `EXPO_PUBLIC_API_URL`.
5. Validacion rapida (opcional):

```bash
cd backend
npm run media:check
```

Guia detallada: `backend/public/media/README.md`

## Ejecutar app

```bash
# raiz del proyecto
npm install
npm run start
```

## Release Android (EAS + GitHub Actions)

Archivos:

- `.github/workflows/eas-android-release.yml`
- `eas.json`

Prerequisitos (una sola vez):

1. Inicia sesion y vincula el proyecto con EAS desde local:

```bash
npx eas login
npx eas init
```

2. Crea el secret en GitHub:
`EXPO_TOKEN` (token de tu cuenta Expo/EAS).

3. En GitHub: `Actions` -> `EAS Android Release` -> `Run workflow`
   - `preview` genera APK interno
   - `production` genera AAB (Play Store)

## Credenciales seed (backend local)

- email: `gabriel@email.com`
- password: `123456`

## Idea producto Grillerz (sugerencia)

- App dual: cliente + parrillero (roles).
- Booking por paquetes: Basico, Familiar, Premium.
- Match por ciudad + disponibilidad + rating + especialidad.
- Video corto estilo feed para descubrir parrilleros.
- Confirmacion con pago parcial y chat previo al evento.
