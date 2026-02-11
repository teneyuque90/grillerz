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

type CreateBookingPayload = Omit<Booking, 'id' | 'createdAt'>;

export const grillerzApi = {
  async login(payload: LoginPayload): Promise<User> {
    const response = await http.post<{ user: User }>('/auth/login', payload);
    return response.user;
  },

  async signup(payload: SignupPayload): Promise<{ ok: boolean }> {
    return http.post<{ ok: boolean }>('/auth/signup', payload);
  },

  async verify(payload: VerifyPayload): Promise<User> {
    const response = await http.post<{ user: User }>('/auth/verify', payload);
    return response.user;
  },

  async getChefs(): Promise<Chef[]> {
    const response = await http.get<{ chefs: Chef[] }>('/chefs');
    return response.chefs;
  },

  async getBookings(userId: string): Promise<Booking[]> {
    const response = await http.get<{ bookings: Booking[] }>(`/bookings?userId=${encodeURIComponent(userId)}`);
    return response.bookings;
  },

  async createBooking(payload: CreateBookingPayload): Promise<Booking> {
    const response = await http.post<{ booking: Booking }>('/bookings', payload);
    return response.booking;
  }
};
