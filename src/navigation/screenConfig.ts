export const screenConfig = {
  SplashScreen: {
    title: 'Splash Screen',
    subtitle: 'Entrada inicial de marca con boton Empezar.',
    badge: 'Bienvenido a Grillerz'
  },
  Onboarding01: {
    title: 'Onboarding 01',
    subtitle: 'Presenta el valor principal para contratar grillers.',
    badge: 'Descubre'
  },
  Onboarding02: {
    title: 'Onboarding 02',
    subtitle: 'Muestra facilidad para reservar en pocos pasos.',
    badge: 'Rapido'
  },
  Onboarding03: {
    title: 'Onboarding 03',
    subtitle: 'Invita a activar ubicacion y comenzar la experiencia.',
    badge: 'Personalizado'
  },
  SignIn: {
    title: 'Sign In',
    subtitle: 'Acceso con email y contrasena para clientes y grillers.',
    badge: 'Acceso'
  },
  ForgotPassword: {
    title: 'Forgot Password',
    subtitle: 'Recuperacion de cuenta por correo o telefono.',
    badge: 'Seguridad'
  },
  SignUp: {
    title: 'Sign Up',
    subtitle: 'Registro rapido para nuevos usuarios.',
    badge: 'Crear cuenta'
  },
  VerificationCode: {
    title: 'Verification Code',
    subtitle: 'Verificacion por codigo de 4 o 6 digitos.',
    badge: 'Verifica'
  },
  SetLocation: {
    title: 'Set Location',
    subtitle: 'Primer set de ubicacion actual del usuario.',
    badge: 'Ubicacion'
  },
  ChooseLocation: {
    title: 'Choose Location',
    subtitle: 'Busqueda y seleccion manual de direccion.',
    badge: 'Mapa'
  },
  ChooseLanguage: {
    title: 'Choose Language',
    subtitle: 'Selector de idioma para la app.',
    badge: 'Idioma'
  },
  Browse01: {
    title: 'Browse 01',
    subtitle: 'Home feed principal con grillers populares.',
    badge: 'Inicio'
  },
  Browse02: {
    title: 'Browse 02',
    subtitle: 'Variacion de feed con enfasis en categorias.',
    badge: 'Explorar'
  },
  Browse03: {
    title: 'Browse 03',
    subtitle: 'Feed con cards verticales y destacados.',
    badge: 'Tendencias'
  },
  Map: {
    title: 'Map',
    subtitle: 'Mapa de grillers cercanos y tiempo estimado.',
    badge: 'Cerca de ti'
  },
  Categories: {
    title: 'Categories',
    subtitle: 'Listado de estilos y tipos de cocina.',
    badge: 'Filtros rapidos'
  },
  Search: {
    title: 'Search',
    subtitle: 'Busqueda por griller, platillo o ciudad.',
    badge: 'Buscar'
  },
  Filter: {
    title: 'Filter',
    subtitle: 'Ajustes avanzados de precio, rating y distancia.',
    badge: 'Afinar resultados'
  },
  Profile: {
    title: 'Profile',
    subtitle: 'Perfil completo del griller con metrics.',
    badge: 'Griller profile'
  },
  Schedule: {
    title: 'Schedule',
    subtitle: 'Seleccion de fecha, hora y modalidad de servicio.',
    badge: 'Agenda'
  },
  ReviewBooking: {
    title: 'Review Booking',
    subtitle: 'Resumen de reserva antes del pago.',
    badge: 'Confirmacion'
  },
  Payment: {
    title: 'Payment',
    subtitle: 'Metodo de pago y total de la reserva.',
    badge: 'Pago seguro'
  },
  Success: {
    title: 'Success',
    subtitle: 'Estado de confirmacion de reserva.',
    badge: 'Reserva lista'
  },
  Bookings: {
    title: 'Bookings',
    subtitle: 'Historial y proximas reservas.',
    badge: 'Mis reservas'
  },
  BookingDetails: {
    title: 'Booking Details',
    subtitle: 'Detalle completo de una reserva individual.',
    badge: 'Detalle'
  },
  Connect: {
    title: 'Connect',
    subtitle: 'Listado de contactos y grillers recientes.',
    badge: 'Comunidad'
  },
  Chat: {
    title: 'Chat',
    subtitle: 'Mensajeria directa entre cliente y griller.',
    badge: 'Mensajes'
  },
  Calls: {
    title: 'Calls',
    subtitle: 'Historial de llamadas y contacto rapido.',
    badge: 'Llamadas'
  },
  Notifications: {
    title: 'Notifications',
    subtitle: 'Centro de alertas de actividad y reservas.',
    badge: 'Novedades'
  },
  Account: {
    title: 'Account',
    subtitle: 'Informacion personal y metodos guardados.',
    badge: 'Cuenta'
  },
  Favorites: {
    title: 'Favorites',
    subtitle: 'Favoritos de grillers para acceso rapido.',
    badge: 'Favoritos'
  },
  Settings: {
    title: 'Settings',
    subtitle: 'Preferencias, privacidad y configuracion general.',
    badge: 'Ajustes'
  }
} as const;

export type ScreenName = keyof typeof screenConfig;

export type RootStackParamList = {
  [K in ScreenName]: undefined;
};
