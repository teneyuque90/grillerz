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
    avatarUrl: 'https://i.pravatar.cc/300?img=11',
    coverUrl: 'https://loremflickr.com/1200/800/grill,steak?lock=201',
    gallery: [
      'https://loremflickr.com/1200/800/bbq,ribs?lock=202',
      'https://loremflickr.com/1200/800/tomahawk,steak?lock=203',
      'https://loremflickr.com/1200/800/meat,smoke?lock=204'
    ],
    bio: 'Especialista en eventos familiares y corporativos. Manejo cortes premium y menu personalizado.',
    availability: {
      weekdays: [3, 4, 5, 6, 0],
      times: ['2:00 PM', '5:00 PM', '7:30 PM', '9:00 PM'],
      blockedDates: ['2026-04-26', '2026-05-03'],
      specialDates: [
        { date: '2026-04-24', times: ['1:00 PM', '3:30 PM', '6:00 PM'] },
        { date: '2026-05-01', times: ['12:00 PM', '2:00 PM'] }
      ]
    },
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
    avatarUrl: 'https://i.pravatar.cc/300?img=12',
    coverUrl: 'https://loremflickr.com/1200/800/bbq,brisket?lock=205',
    gallery: [
      'https://loremflickr.com/1200/800/grill,fire?lock=206',
      'https://loremflickr.com/1200/800/costillas,bbq?lock=207',
      'https://loremflickr.com/1200/800/barbecue,table?lock=208'
    ],
    bio: 'Griller de parrilla para grupos grandes con enfoque en sabor ahumado y servicio premium.',
    availability: {
      weekdays: [2, 4, 5, 6, 0],
      times: ['1:00 PM', '3:00 PM', '6:00 PM', '8:00 PM'],
      blockedDates: [],
      specialDates: []
    },
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
    avatarUrl: 'https://i.pravatar.cc/300?img=15',
    coverUrl: 'https://loremflickr.com/1200/800/smoked,meat?lock=209',
    gallery: [
      'https://loremflickr.com/1200/800/brisket,knife?lock=210',
      'https://loremflickr.com/1200/800/parrilla,carbon?lock=211',
      'https://loremflickr.com/1200/800/bbq,slowcook?lock=212'
    ],
    bio: 'Especializado en cocciones lentas y parrilla de alto volumen para eventos sociales.',
    availability: {
      weekdays: [1, 3, 4, 5, 6],
      times: ['2:00 PM', '5:00 PM', '7:30 PM'],
      blockedDates: [],
      specialDates: []
    },
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
    avatarUrl: 'https://i.pravatar.cc/300?img=16',
    coverUrl: 'https://loremflickr.com/1200/800/asado,regio?lock=213',
    gallery: [
      'https://loremflickr.com/1200/800/steak,grill?lock=214',
      'https://loremflickr.com/1200/800/arrachera,bbq?lock=215',
      'https://loremflickr.com/1200/800/grilling,party?lock=216'
    ],
    bio: 'Servicio rapido y menu flexible para reuniones de tamano medio.',
    availability: {
      weekdays: [2, 4, 5, 6, 0],
      times: ['12:00 PM', '2:00 PM', '4:00 PM', '7:00 PM'],
      blockedDates: [],
      specialDates: []
    },
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
    avatarUrl: 'https://i.pravatar.cc/300?img=17',
    coverUrl: 'https://loremflickr.com/1200/800/ribeye,grill?lock=217',
    gallery: [
      'https://loremflickr.com/1200/800/ribeye,meat?lock=218',
      'https://loremflickr.com/1200/800/carne,asada?lock=219',
      'https://loremflickr.com/1200/800/flame,barbecue?lock=220'
    ],
    bio: 'Enfoque en cortes jugosos y presentacion profesional para eventos en casa.',
    availability: {
      weekdays: [3, 5, 6, 0],
      times: ['2:00 PM', '5:00 PM', '8:00 PM'],
      blockedDates: [],
      specialDates: []
    },
    stats: { services: 76, clients: 210, years: 5 }
  }
];

export const defaultUser: User = {
  id: 'guest-user',
  name: 'Invitado Grillerz',
  email: 'guest@grillerz.app',
  phone: '+52 000 000 0000',
  city: 'Nuevo Laredo',
  role: 'client',
  managedChefId: null
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
  transferFee: 300,
  customServiceFee: null
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
  },
  {
    id: 'GRZ-4730',
    userId,
    chefId: 'erick-martinez',
    chefName: 'Erick Martinez',
    status: 'Pendiente',
    dateLabel: '22 Abril 2026',
    timeLabel: '7:30 PM',
    mode: 'A domicilio',
    address: 'Lago de Chapala 804, Nuevo Laredo',
    packageName: 'Parrilla Mixta',
    guests: 10,
    durationHours: 4,
    serviceFee: 2800,
    transferFee: 300,
    total: 3100,
    paymentMethod: 'Transferencia',
    createdAt: '2026-02-12T14:30:00.000Z'
  }
];
