import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { createInitialDraft, defaultUser, mockChefs, seedBookings } from '../data/mockData';
import { Booking, BookingDraft, BookingSummary, Chef, PaymentMethod, User } from '../types/domain';

type SignInPayload = {
  email: string;
  password: string;
};

type SignUpPayload = {
  name: string;
  email: string;
  password: string;
};

type ActionResult = {
  ok: boolean;
  message?: string;
};

type AppStateContextValue = {
  isHydrated: boolean;
  authUser: User | null;
  chefs: Chef[];
  selectedChef: Chef;
  bookingDraft: BookingDraft;
  bookingSummary: BookingSummary;
  bookings: Booking[];
  selectedBooking: Booking | null;
  signIn: (payload: SignInPayload) => Promise<ActionResult>;
  beginSignUp: (payload: SignUpPayload) => Promise<ActionResult>;
  completeVerification: (code: string) => Promise<ActionResult>;
  signOut: () => Promise<void>;
  selectChef: (chefId: string) => void;
  selectBooking: (bookingId: string) => void;
  updateBookingDraft: (patch: Partial<Omit<BookingDraft, 'chefId'>>) => void;
  confirmBooking: (paymentMethod: PaymentMethod) => Promise<Booking>;
};

type PersistedState = {
  authUser: User | null;
  bookingDraft: BookingDraft;
  selectedChefId: string;
  bookings: Booking[];
  selectedBookingId: string | null;
};

type PendingRegistration = {
  name: string;
  email: string;
};

const STORAGE_KEY = 'grillerz.app.state.v1';
const DEFAULT_CHEF_ID = mockChefs[0].id;
const WAIT_MS = 260;

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function buildBookingId(currentBookings: Booking[]): string {
  const base = 4800 + currentBookings.length + 1;

  return `GRZ-${base}`;
}

function parseStoredState(raw: string | null): PersistedState | null {
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [selectedChefId, setSelectedChefId] = useState<string>(DEFAULT_CHEF_ID);
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>(createInitialDraft(DEFAULT_CHEF_ID));
  const [bookings, setBookings] = useState<Booking[]>(seedBookings(defaultUser.id));
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(null);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = parseStoredState(raw);

      if (!active) {
        return;
      }

      if (parsed) {
        setAuthUser(parsed.authUser);
        setSelectedChefId(parsed.selectedChefId);
        setBookingDraft(parsed.bookingDraft);
        setBookings(parsed.bookings);
        setSelectedBookingId(parsed.selectedBookingId);
      }

      setIsHydrated(true);
    }

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  const selectedChef = useMemo(() => {
    return mockChefs.find((chef) => chef.id === selectedChefId) ?? mockChefs[0];
  }, [selectedChefId]);

  const bookingSummary = useMemo<BookingSummary>(() => {
    const serviceFee = selectedChef.basePrice;
    const transferFee = bookingDraft.transferFee;

    return {
      serviceFee,
      transferFee,
      total: serviceFee + transferFee
    };
  }, [bookingDraft.transferFee, selectedChef.basePrice]);

  const selectedBooking = useMemo(() => {
    if (!selectedBookingId) {
      return bookings[0] ?? null;
    }

    return bookings.find((booking) => booking.id === selectedBookingId) ?? bookings[0] ?? null;
  }, [bookings, selectedBookingId]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const payload: PersistedState = {
      authUser,
      selectedChefId,
      bookingDraft,
      bookings,
      selectedBookingId
    };

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [authUser, bookingDraft, bookings, isHydrated, selectedBookingId, selectedChefId]);

  const signIn = useCallback(async ({ email, password }: SignInPayload): Promise<ActionResult> => {
    if (!email.trim() || !password.trim()) {
      return { ok: false, message: 'Completa correo y contrasena.' };
    }

    await wait(WAIT_MS);

    const normalizedEmail = sanitizeEmail(email);
    const fallbackName = normalizedEmail.split('@')[0] || 'Usuario Grillerz';

    setAuthUser({
      id: normalizedEmail,
      name: fallbackName,
      email: normalizedEmail,
      phone: '+52 867 000 0000',
      city: 'Nuevo Laredo'
    });

    return { ok: true };
  }, []);

  const beginSignUp = useCallback(async ({ name, email, password }: SignUpPayload): Promise<ActionResult> => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return { ok: false, message: 'Completa todos los campos para continuar.' };
    }

    await wait(WAIT_MS);

    setPendingRegistration({
      name: name.trim(),
      email: sanitizeEmail(email)
    });

    return { ok: true };
  }, []);

  const completeVerification = useCallback(async (code: string): Promise<ActionResult> => {
    await wait(WAIT_MS);

    if (code.trim().length < 4) {
      return { ok: false, message: 'Ingresa un codigo valido de 4 digitos.' };
    }

    if (!pendingRegistration) {
      return { ok: false, message: 'No hay registro pendiente. Intenta crear cuenta otra vez.' };
    }

    setAuthUser({
      id: pendingRegistration.email,
      name: pendingRegistration.name,
      email: pendingRegistration.email,
      phone: '+52 867 000 0000',
      city: 'Nuevo Laredo'
    });

    setPendingRegistration(null);

    return { ok: true };
  }, [pendingRegistration]);

  const signOut = useCallback(async () => {
    setAuthUser(null);
    setPendingRegistration(null);
    setSelectedChefId(DEFAULT_CHEF_ID);
    setBookingDraft(createInitialDraft(DEFAULT_CHEF_ID));
    setBookings(seedBookings(defaultUser.id));
    setSelectedBookingId(null);

    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const selectChef = useCallback((chefId: string) => {
    const chef = mockChefs.find((candidate) => candidate.id === chefId);

    if (!chef) {
      return;
    }

    setSelectedChefId(chef.id);
    setBookingDraft((prev) => ({
      ...prev,
      chefId: chef.id
    }));
  }, []);

  const selectBooking = useCallback((bookingId: string) => {
    setSelectedBookingId(bookingId);
  }, []);

  const updateBookingDraft = useCallback((patch: Partial<Omit<BookingDraft, 'chefId'>>) => {
    setBookingDraft((prev) => ({
      ...prev,
      ...patch
    }));
  }, []);

  const confirmBooking = useCallback(
    async (paymentMethod: PaymentMethod): Promise<Booking> => {
      await wait(WAIT_MS);

      const user = authUser ?? defaultUser;

      const nextBooking: Booking = {
        id: buildBookingId(bookings),
        userId: user.id,
        chefId: selectedChef.id,
        chefName: selectedChef.name,
        status: 'Confirmada',
        dateLabel: bookingDraft.dateLabel,
        timeLabel: bookingDraft.timeLabel,
        mode: bookingDraft.mode,
        address: bookingDraft.address,
        packageName: bookingDraft.packageName,
        guests: bookingDraft.guests,
        durationHours: bookingDraft.durationHours,
        serviceFee: bookingSummary.serviceFee,
        transferFee: bookingSummary.transferFee,
        total: bookingSummary.total,
        paymentMethod,
        createdAt: new Date().toISOString()
      };

      setBookings((prev) => [nextBooking, ...prev]);
      setSelectedBookingId(nextBooking.id);

      return nextBooking;
    },
    [authUser, bookingDraft.address, bookingDraft.dateLabel, bookingDraft.durationHours, bookingDraft.guests, bookingDraft.mode, bookingDraft.packageName, bookingDraft.timeLabel, bookingSummary.serviceFee, bookingSummary.total, bookingSummary.transferFee, bookings, selectedChef.id, selectedChef.name]
  );

  const value = useMemo<AppStateContextValue>(
    () => ({
      isHydrated,
      authUser,
      chefs: mockChefs,
      selectedChef,
      bookingDraft,
      bookingSummary,
      bookings,
      selectedBooking,
      signIn,
      beginSignUp,
      completeVerification,
      signOut,
      selectChef,
      selectBooking,
      updateBookingDraft,
      confirmBooking
    }),
    [
      authUser,
      beginSignUp,
      bookingDraft,
      bookingSummary,
      bookings,
      completeVerification,
      confirmBooking,
      isHydrated,
      selectBooking,
      selectChef,
      selectedBooking,
      selectedChef,
      signIn,
      signOut,
      updateBookingDraft
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }

  return context;
}
