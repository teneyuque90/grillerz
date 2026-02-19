import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { grillerzApi } from '../api/grillerzApi';
import { setAuthToken } from '../api/client';
import { OFFLINE_DEMO_MODE } from '../config/api';
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
  replaceChef: (chef: Chef) => void;
  selectBooking: (bookingId: string) => void;
  updateBookingDraft: (patch: Partial<Omit<BookingDraft, 'chefId'>>) => void;
  confirmBooking: (paymentMethod: PaymentMethod) => Promise<Booking>;
};

type PersistedState = {
  authUser: User | null;
  authToken: string | null;
  bookingDraft: BookingDraft;
  selectedChefId: string;
  bookings: Booking[];
  selectedBookingId: string | null;
};

type PendingRegistration = {
  name: string;
  email: string;
  password: string;
};

const STORAGE_KEY = 'grillerz.app.state.v1';
const DEFAULT_CHEF_ID = mockChefs[0].id;
const WAIT_MS = 260;
const DEMO_ACCOUNTS = [
  {
    email: 'gabriel@email.com',
    password: '123456',
    user: {
      id: 'gabriel@email.com',
      name: 'Gabriel Teneyuque',
      email: 'gabriel@email.com',
      phone: '+52 867 000 0000',
      city: 'Nuevo Laredo',
      role: 'admin',
      managedChefId: null
    }
  },
  {
    email: 'erick@grillerz.app',
    password: 'Griller123!',
    user: {
      id: 'erick@grillerz.app',
      name: 'Erick Martinez',
      email: 'erick@grillerz.app',
      phone: '+52 867 333 3333',
      city: 'Nuevo Laredo',
      role: 'griller',
      managedChefId: 'erick-martinez'
    }
  },
  {
    email: 'admin@grillerz.app',
    password: 'Admin123!',
    user: {
      id: 'admin@grillerz.app',
      name: 'Admin Grillerz',
      email: 'admin@grillerz.app',
      phone: '+52 867 222 2222',
      city: 'Nuevo Laredo',
      role: 'admin',
      managedChefId: null
    }
  },
  {
    email: 'cliente@grillerz.app',
    password: 'Cliente123!',
    user: {
      id: 'cliente@grillerz.app',
      name: 'Cliente Grillerz',
      email: 'cliente@grillerz.app',
      phone: '+52 867 444 4444',
      city: 'Nuevo Laredo',
      role: 'client',
      managedChefId: null
    }
  }
] as const;

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function findDemoAccount(email: string, password: string) {
  return DEMO_ACCOUNTS.find((account) => account.email === email && account.password === password) ?? null;
}

function createOfflineUserFromEmail(email: string): User {
  const base = email.split('@')[0]?.trim();
  const normalizedBase = base && base.length > 1 ? base : 'Demo';
  const name = normalizedBase.charAt(0).toUpperCase() + normalizedBase.slice(1);

  return {
    id: email,
    name,
    email,
    phone: '+52 867 000 0000',
    city: 'Nuevo Laredo',
    role: 'client',
    managedChefId: null
  };
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
  const [authToken, setAuthTokenState] = useState<string | null>(null);
  const [chefs, setChefs] = useState<Chef[]>(mockChefs);
  const [selectedChefId, setSelectedChefId] = useState<string>(DEFAULT_CHEF_ID);
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>(createInitialDraft(DEFAULT_CHEF_ID));
  const [bookings, setBookings] = useState<Booking[]>(seedBookings(defaultUser.id));
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [pendingRegistration, setPendingRegistration] = useState<PendingRegistration | null>(null);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      setAuthToken(null);
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = parseStoredState(raw);

      if (!active) {
        return;
      }

      if (parsed) {
        setAuthUser(parsed.authUser);
        setAuthTokenState(parsed.authToken ?? null);
        setAuthToken(parsed.authToken ?? null);
        setSelectedChefId(parsed.selectedChefId);
        setBookingDraft(parsed.bookingDraft);
        setBookings(parsed.bookings);
        setSelectedBookingId(parsed.selectedBookingId);
      }

      if (!OFFLINE_DEMO_MODE) {
        try {
          const remoteChefs = await grillerzApi.getChefs();

          if (active && remoteChefs.length > 0) {
            setChefs(remoteChefs);
          }
        } catch {
          // keep local fallback
        }
      }

      if (!OFFLINE_DEMO_MODE && parsed?.authUser && parsed?.authToken) {
        try {
          const remoteBookings = await grillerzApi.getBookings();

          if (active) {
            setBookings(remoteBookings.length > 0 ? remoteBookings : parsed.bookings);
          }
        } catch {
          // keep local fallback
        }
      }

      setIsHydrated(true);
    }

    void hydrate();

    return () => {
      active = false;
    };
  }, []);

  const selectedChef = useMemo(() => {
    return chefs.find((chef) => chef.id === selectedChefId) ?? chefs[0] ?? mockChefs[0];
  }, [chefs, selectedChefId]);

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
      authToken,
      selectedChefId,
      bookingDraft,
      bookings,
      selectedBookingId
    };

    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [authToken, authUser, bookingDraft, bookings, isHydrated, selectedBookingId, selectedChefId]);

  const signIn = useCallback(async ({ email, password }: SignInPayload): Promise<ActionResult> => {
    if (!email.trim() || !password.trim()) {
      return { ok: false, message: 'Completa correo y contrasena.' };
    }

    await wait(WAIT_MS);

    const normalizedEmail = sanitizeEmail(email);

    if (OFFLINE_DEMO_MODE) {
      const demoAccount = findDemoAccount(normalizedEmail, password);
      const user = demoAccount?.user ?? createOfflineUserFromEmail(normalizedEmail);
      const localToken = `local-offline-${user.id}`;
      setAuthTokenState(localToken);
      setAuthToken(localToken);
      setAuthUser(user);
      setBookings(seedBookings(user.id));
      return { ok: true };
    }

    try {
      const { user, token } = await grillerzApi.login({ email: normalizedEmail, password });
      setAuthTokenState(token);
      setAuthToken(token);
      setAuthUser(user);

      try {
        const remoteBookings = await grillerzApi.getBookings();
        setBookings(remoteBookings.length > 0 ? remoteBookings : seedBookings(user.id));
      } catch {
        setBookings(seedBookings(user.id));
      }

      return { ok: true };
    } catch (error) {
      const demoAccount = findDemoAccount(normalizedEmail, password);
      if (demoAccount) {
        const localToken = `local-demo-${demoAccount.user.id}`;
        setAuthTokenState(localToken);
        setAuthToken(localToken);
        setAuthUser(demoAccount.user);
        setBookings(seedBookings(demoAccount.user.id));

        return { ok: true };
      }

      setAuthTokenState(null);
      setAuthToken(null);
      return { ok: false, message: error instanceof Error ? error.message : 'No se pudo iniciar sesion.' };
    }
  }, []);

  const beginSignUp = useCallback(async ({ name, email, password }: SignUpPayload): Promise<ActionResult> => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return { ok: false, message: 'Completa todos los campos para continuar.' };
    }

    await wait(WAIT_MS);

    const normalizedEmail = sanitizeEmail(email);

    try {
      await grillerzApi.signup({ name: name.trim(), email: normalizedEmail, password });
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : 'No se pudo crear la cuenta.' };
    }

    setPendingRegistration({
      name: name.trim(),
      email: normalizedEmail,
      password
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

    try {
      const { user, token } = await grillerzApi.verify({ email: pendingRegistration.email, code });
      setAuthTokenState(token);
      setAuthToken(token);
      setAuthUser(user);
      setPendingRegistration(null);
      setBookings(seedBookings(user.id));

      return { ok: true };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : 'No se pudo verificar.' };
    }
  }, [pendingRegistration]);

  const signOut = useCallback(async () => {
    if (authToken && !OFFLINE_DEMO_MODE) {
      try {
        await grillerzApi.logout();
      } catch {
        // ignore network/backend failures on local logout
      }
    }

    setAuthUser(null);
    setAuthTokenState(null);
    setAuthToken(null);
    setPendingRegistration(null);
    setSelectedChefId(DEFAULT_CHEF_ID);
    setBookingDraft(createInitialDraft(DEFAULT_CHEF_ID));
    setBookings(seedBookings(defaultUser.id));
    setSelectedBookingId(null);

    await AsyncStorage.removeItem(STORAGE_KEY);
  }, [authToken]);

  const selectChef = useCallback((chefId: string) => {
    const chef = chefs.find((candidate) => candidate.id === chefId);

    if (!chef) {
      return;
    }

    setSelectedChefId(chef.id);
    setBookingDraft((prev) => ({
      ...prev,
      chefId: chef.id
    }));
  }, [chefs]);

  const selectBooking = useCallback((bookingId: string) => {
    setSelectedBookingId(bookingId);
  }, []);

  const replaceChef = useCallback((chef: Chef) => {
    setChefs((prev) => {
      const exists = prev.some((item) => item.id === chef.id);
      if (!exists) {
        return [chef, ...prev];
      }

      return prev.map((item) => (item.id === chef.id ? chef : item));
    });
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

      const payload = {
        userId: user.id,
        chefId: selectedChef.id,
        chefName: selectedChef.name,
        status: 'Pendiente' as const,
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
        paymentMethod
      };

      let createdBooking: Booking | null = null;

      if (OFFLINE_DEMO_MODE) {
        createdBooking = {
          id: buildBookingId(bookings),
          createdAt: new Date().toISOString(),
          ...payload
        };
      } else {
        try {
          createdBooking = await grillerzApi.createBooking(payload);
        } catch {
          createdBooking = {
            id: buildBookingId(bookings),
            createdAt: new Date().toISOString(),
            ...payload
          };
        }
      }

      setBookings((prev) => [createdBooking, ...prev]);
      setSelectedBookingId(createdBooking.id);

      return createdBooking;
    },
    [authUser, bookingDraft.address, bookingDraft.dateLabel, bookingDraft.durationHours, bookingDraft.guests, bookingDraft.mode, bookingDraft.packageName, bookingDraft.timeLabel, bookingSummary.serviceFee, bookingSummary.total, bookingSummary.transferFee, bookings, selectedChef.id, selectedChef.name]
  );

  const value = useMemo<AppStateContextValue>(
    () => ({
      isHydrated,
      authUser,
      chefs,
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
      replaceChef,
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
      chefs,
      completeVerification,
      confirmBooking,
      isHydrated,
      selectBooking,
      selectChef,
      replaceChef,
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
