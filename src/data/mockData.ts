import { Booking, BookingDraft, Chef, User } from '../types/domain';

export const mockChefs: Chef[] = [
  {
    id: 'erick-martinez',
    name: 'Erick Martinez',
    title: 'Griller Master',
    city: 'Nuevo Laredo',
    rating: 4.9,
    reviews: 126,
    basePrice: 2800,
    specialties: ['Costillas a la Parrilla', 'Tomahawk al Carbon', 'Parrilla Mixta'],
    bio: 'Especialista en eventos familiares y corporativos. Manejo cortes premium y menu personalizado.',
    stats: { services: 85, clients: 240, years: 5 }
  },
  {
    id: 'carlos-bbq',
    name: 'Carlos BBQ',
    title: 'Pitmaster',
    city: 'Monterrey',
    rating: 4.8,
    reviews: 102,
    basePrice: 3200,
    specialties: ['Parrilla Mixta', 'Costillas Ahumadas', 'Asado Norte'],
    bio: 'Chef de parrilla para grupos grandes con enfoque en sabor ahumado y servicio premium.',
    stats: { services: 70, clients: 190, years: 6 }
  },
  {
    id: 'martin-asador',
    name: 'Martin Asador',
    title: 'Smoke Expert',
    city: 'Saltillo',
    rating: 4.7,
    reviews: 94,
    basePrice: 3600,
    specialties: ['Brisket', 'Costillas', 'Tomahawk'],
    bio: 'Especializado en cocciones lentas y parrilla de alto volumen para eventos sociales.',
    stats: { services: 65, clients: 168, years: 5 }
  },
  {
    id: 'luis-bbq',
    name: 'Luis BBQ',
    title: 'Asador Pro',
    city: 'Nuevo Laredo',
    rating: 4.6,
    reviews: 80,
    basePrice: 3000,
    specialties: ['Asado Regio', 'Arrachera', 'Parrilla Mixta'],
    bio: 'Servicio rapido y menu flexible para reuniones de tamano medio.',
    stats: { services: 52, clients: 140, years: 4 }
  },
  {
    id: 'cories-bbq',
    name: 'Cories BBQ',
    title: 'Grill Specialist',
    city: 'Nuevo Laredo',
    rating: 4.8,
    reviews: 112,
    basePrice: 2500,
    specialties: ['Ribeye', 'Costillas', 'Tomahawk'],
    bio: 'Enfoque en cortes jugosos y presentacion profesional para eventos en casa.',
    stats: { services: 76, clients: 210, years: 5 }
  }
];

export const defaultUser: User = {
  id: 'guest-user',
  name: 'Invitado Grillerz',
  email: 'guest@grillerz.app',
  phone: '+52 000 000 0000',
  city: 'Nuevo Laredo'
};

export const createInitialDraft = (chefId: string): BookingDraft => ({
  chefId,
  dateLabel: 'Viernes 12 Abril 2026',
  timeLabel: '7:00 PM',
  mode: 'A domicilio',
  address: 'Guanajuato 254, Nuevo Laredo',
  packageName: 'Basico',
  guests: 10,
  durationHours: 4,
  transferFee: 300
});

export const seedBookings = (userId: string): Booking[] => [
  {
    id: 'GRZ-4729',
    userId,
    chefId: 'carlos-bbq',
    chefName: 'Carlos BBQ',
    status: 'Pendiente',
    dateLabel: '19 Abril 2026',
    timeLabel: '8:00 PM',
    mode: 'A domicilio',
    address: 'Centro 405, Monterrey',
    packageName: 'Familiar',
    guests: 12,
    durationHours: 4,
    serviceFee: 3200,
    transferFee: 300,
    total: 3500,
    paymentMethod: 'Tarjeta',
    createdAt: '2026-02-11T10:00:00.000Z'
  }
];
