import { http } from './client';
import { Booking, Chef, User } from '../types/domain';

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

  async getBookings(userId?: string): Promise<Booking[]> {
    const path = userId ? `/bookings?userId=${encodeURIComponent(userId)}` : '/bookings';
    const response = await http.get<{ bookings: Booking[] }>(path);
    return response.bookings;
  },

  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    const response = await http.post<{ booking: Booking }>('/bookings', payload);
    return response.booking;
  }
};
