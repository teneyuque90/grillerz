export type ServiceMode = 'A domicilio' | 'En terraza del griller';
export type PaymentMethod = 'Tarjeta' | 'Transferencia' | 'Efectivo';
export type BookingStatus = 'Pendiente' | 'Confirmada' | 'En camino' | 'En servicio' | 'Completada' | 'Cancelada';
export type UserRole = 'client' | 'griller' | 'admin';
export type GrillerEventStatus = 'Publicado' | 'Cerrado' | 'Cancelado' | 'Finalizado';
export type ChefSpecialDate = {
  date: string;
  times: string[];
};
export type ChefAvailability = {
  weekdays: number[];
  times: string[];
  blockedDates?: string[];
  specialDates?: ChefSpecialDate[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: UserRole;
  managedChefId: string | null;
};

export type Chef = {
  id: string;
  name: string;
  title: string;
  city: string;
  rating: number;
  reviews: number;
  basePrice: number;
  specialties: string[];
  avatarUrl: string;
  coverUrl: string;
  gallery: string[];
  bio: string;
  availability?: ChefAvailability;
  stats: {
    services: number;
    clients: number;
    years: number;
  };
};

export type ChefReview = {
  id: string;
  chefId: string;
  authorName: string;
  rating: number;
  comment: string;
  dateLabel: string;
  createdAt: string;
};

export type ChefVideo = {
  id: string;
  chefId: string;
  title: string;
  subtitle: string;
  youtubeUrl: string;
  videoId: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ChefPackage = {
  id: string;
  chefId: string;
  name: string;
  details: string;
  price: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type GrillerEvent = {
  id: string;
  chefId: string;
  chefName: string;
  createdByUserId: string;
  title: string;
  description: string;
  city: string;
  venueName: string;
  address: string;
  dateKey: string;
  timeLabel: string;
  capacityTotal: number;
  seatsAvailable: number;
  pricePerPerson: number;
  minSeatsPerReservation: number;
  maxSeatsPerReservation: number;
  menu: string[];
  status: GrillerEventStatus;
  createdAt: string;
  updatedAt: string;
};

export type GrillerEventReservation = {
  id: string;
  eventId: string;
  userId: string;
  seats: number;
  amountTotal: number;
  paymentStatus: 'Pagado' | 'Pendiente';
  status: 'Confirmada' | 'Cancelada';
  createdAt: string;
};

export type BookingDraft = {
  chefId: string;
  dateLabel: string;
  timeLabel: string;
  mode: ServiceMode;
  address: string;
  packageName: string;
  guests: number;
  durationHours: number;
  transferFee: number;
  customServiceFee?: number | null;
};

export type Booking = {
  id: string;
  userId: string;
  chefId: string;
  chefName: string;
  status: BookingStatus;
  dateLabel: string;
  timeLabel: string;
  mode: ServiceMode;
  address: string;
  packageName: string;
  guests: number;
  durationHours: number;
  serviceFee: number;
  transferFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
};

export type BookingSummary = {
  serviceFee: number;
  transferFee: number;
  total: number;
};
