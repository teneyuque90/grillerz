import { http } from './client';
import { Booking, BookingStatus, Chef, ChefPackage, ChefReview, ChefSpecialDate, ChefVideo, User } from '../types/domain';

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
  }
};
