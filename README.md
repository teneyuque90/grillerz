# Grillerz v2 - Base Scaffold

Base inicial para construir la app completa estilo Grillerz (fondo blanco, acentos rojos, cards limpias, enfoque mobile).

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

## Estructura

- `App.tsx`: entrada principal con NavigationContainer.
- `src/navigation/AppNavigator.tsx`: stack con las 32 pantallas.
- `src/navigation/screenConfig.ts`: metadata por pantalla (titulo, subtitulo, badge).
- `src/components/ScreenTemplate.tsx`: layout base tipo Grillerz (white + fire red).
- `src/screens/<ScreenName>/index.tsx`: carpeta individual por pantalla.
- `src/theme/*`: colores y espaciado base.

## Arranque

```bash
npm install
npm run start
```

## Siguiente fase recomendada

1. Crear navegacion real por flujos: Auth, Explore, Booking, Account.
2. Convertir Browse/Map/Profile en pantallas funcionales con data mock.
3. Agregar TabBar custom con iconografia Grillerz.
4. Integrar backend (auth, reservas, chat, pagos).
5. Pulir UI 1:1 con el diseno final.

## Idea producto Grillerz (sugerencia)

- App dual: cliente + parrillero (roles).
- Booking por paquetes: Basico, Familiar, Premium.
- Match por ciudad + disponibilidad + rating + especialidad.
- Video corto estilo feed para descubrir parrilleros.
- Confirmacion con pago parcial y chat previo al evento.
