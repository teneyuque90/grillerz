export type ServiceMode = 'A domicilio' | 'En terraza del griller';
export type PaymentMethod = 'Tarjeta' | 'Transferencia' | 'Efectivo';
export type BookingStatus = 'Pendiente' | 'Confirmada' | 'Cancelada';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
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
  stats: {
    services: number;
    clients: number;
    years: number;
  };
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
