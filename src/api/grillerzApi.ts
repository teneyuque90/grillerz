import { http } from './client';
import { Booking, BookingStatus, Chef, ChefPackage, ChefReview, ChefSpecialDate, ChefVideo, GrillerEvent, GrillerEventReservation, GrillerEventStatus, User } from '../types/domain';

type LoginPayload = {
  email: string;
  password: string;
};

type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

type VerifyPayload = {
  email: string;
  code: string;
};

type AuthResponse = {
  user: User;
  token: string;
};

type CreateBookingPayload = Omit<Booking, 'id' | 'createdAt'>;
type SaveChefVideosPayload = {
  videos: Array<Pick<ChefVideo, 'title' | 'subtitle' | 'youtubeUrl'>>;
};
type SaveChefPackagesPayload = {
  packages: Array<Pick<ChefPackage, 'name' | 'details' | 'price' | 'isActive'>>;
};
type UpdateChefProfilePayload = {
  name?: string;
  title?: string;
  city?: string;
  basePrice?: number;
  specialties?: string[];
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  gallery?: string[];
};
type UpdateChefAvailabilityPayload = {
  weekdays: number[];
  times: string[];
  blockedDates?: string[];
  specialDates?: ChefSpecialDate[];
};
type CreateGrillerEventPayload = {
  chefId?: string;
  title: string;
  description: string;
  city: string;
  venueName: string;
  address: string;
  dateKey: string;
  timeLabel: string;
  capacityTotal: number;
  pricePerPerson: number;
  minSeatsPerReservation?: number;
  maxSeatsPerReservation?: number;
  menu: string[];
  status?: GrillerEventStatus;
};
type ReserveEventSeatsPayload = {
  seats: number;
  paymentStatus?: 'Pagado' | 'Pendiente';
};

export const grillerzApi = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    return http.post<AuthResponse>('/auth/login', payload);
  },

  async signup(payload: SignupPayload): Promise<{ ok: boolean }> {
    return http.post<{ ok: boolean }>('/auth/signup', payload);
  },

  async verify(payload: VerifyPayload): Promise<AuthResponse> {
    return http.post<AuthResponse>('/auth/verify', payload);
  },

  async getCurrentUser(): Promise<User> {
    const response = await http.get<{ user: User }>('/auth/me');
    return response.user;
  },

  async logout(): Promise<void> {
    await http.post<{ ok: boolean }>('/auth/logout');
  },

  async getChefs(): Promise<Chef[]> {
    const response = await http.get<{ chefs: Chef[] }>('/chefs');
    return response.chefs;
  },

  async getChefReviews(chefId: string): Promise<ChefReview[]> {
    const response = await http.get<{ reviews: ChefReview[] }>(`/chefs/${encodeURIComponent(chefId)}/reviews`);
    return response.reviews;
  },

  async getChefVideos(chefId: string): Promise<ChefVideo[]> {
    const response = await http.get<{ videos: ChefVideo[] }>(`/chefs/${encodeURIComponent(chefId)}/videos`);
    return response.videos;
  },

  async getChefPackages(chefId: string): Promise<ChefPackage[]> {
    const response = await http.get<{ packages: ChefPackage[] }>(`/chefs/${encodeURIComponent(chefId)}/packages`);
    return response.packages;
  },

  async updateChefVideos(chefId: string, payload: SaveChefVideosPayload): Promise<ChefVideo[]> {
    const response = await http.put<{ videos: ChefVideo[] }>(`/chefs/${encodeURIComponent(chefId)}/videos`, payload);
    return response.videos;
  },

  async updateChefPackages(chefId: string, payload: SaveChefPackagesPayload): Promise<ChefPackage[]> {
    const response = await http.put<{ packages: ChefPackage[] }>(`/chefs/${encodeURIComponent(chefId)}/packages`, payload);
    return response.packages;
  },

  async updateChefProfile(chefId: string, payload: UpdateChefProfilePayload): Promise<Chef> {
    const response = await http.put<{ chef: Chef }>(`/chefs/${encodeURIComponent(chefId)}/profile`, payload);
    return response.chef;
  },

  async updateChefAvailability(chefId: string, payload: UpdateChefAvailabilityPayload): Promise<Chef> {
    const response = await http.put<{ chef: Chef }>(`/chefs/${encodeURIComponent(chefId)}/availability`, payload);
    return response.chef;
  },

  async getBookings(userId?: string): Promise<Booking[]> {
    const path = userId ? `/bookings?userId=${encodeURIComponent(userId)}` : '/bookings';
    const response = await http.get<{ bookings: Booking[] }>(path);
    return response.bookings;
  },

  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    const response = await http.post<{ booking: Booking }>('/bookings', payload);
    return response.booking;
  },

  async getBookingById(bookingId: string): Promise<Booking> {
    const response = await http.get<{ booking: Booking }>(`/bookings/${encodeURIComponent(bookingId)}`);
    return response.booking;
  },

  async getGrillerBookings(chefId?: string): Promise<Booking[]> {
    const path = chefId ? `/bookings/griller/me?chefId=${encodeURIComponent(chefId)}` : '/bookings/griller/me';
    const response = await http.get<{ bookings: Booking[] }>(path);
    return response.bookings;
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    const response = await http.put<{ booking: Booking }>(`/bookings/${encodeURIComponent(bookingId)}/status`, { status });
    return response.booking;
  },

  async getEvents(filters?: { city?: string; chefId?: string; status?: GrillerEventStatus }): Promise<GrillerEvent[]> {
    const search = new URLSearchParams();
    if (filters?.city) {
      search.set('city', filters.city);
    }
    if (filters?.chefId) {
      search.set('chefId', filters.chefId);
    }
    if (filters?.status) {
      search.set('status', filters.status);
    }

    const path = search.size > 0 ? `/events?${search.toString()}` : '/events';
    const response = await http.get<{ events: GrillerEvent[] }>(path);
    return response.events;
  },

  async getMyGrillerEvents(chefId?: string): Promise<GrillerEvent[]> {
    const path = chefId ? `/events/chef/me?chefId=${encodeURIComponent(chefId)}` : '/events/chef/me';
    const response = await http.get<{ events: GrillerEvent[] }>(path);
    return response.events;
  },

  async createGrillerEvent(payload: CreateGrillerEventPayload): Promise<GrillerEvent> {
    const response = await http.post<{ event: GrillerEvent }>('/events', payload);
    return response.event;
  },

  async reserveEventSeats(eventId: string, payload: ReserveEventSeatsPayload): Promise<{ event: GrillerEvent; reservation: GrillerEventReservation }> {
    return http.post<{ event: GrillerEvent; reservation: GrillerEventReservation }>(`/events/${encodeURIComponent(eventId)}/reservations`, payload);
  },

  async getEventReservations(eventId: string): Promise<GrillerEventReservation[]> {
    const response = await http.get<{ reservations: GrillerEventReservation[] }>(`/events/${encodeURIComponent(eventId)}/reservations`);
    return response.reservations;
  },

  async updateEventStatus(eventId: string, status: GrillerEventStatus): Promise<GrillerEvent> {
    const response = await http.put<{ event: GrillerEvent }>(`/events/${encodeURIComponent(eventId)}/status`, { status });
    return response.event;
  }
};
