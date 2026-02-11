import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(cors());
app.use(express.json());

const chefs = [
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

const users = [
  {
    id: 'gabriel@email.com',
    name: 'Gabriel Teneyuque',
    email: 'gabriel@email.com',
    password: '123456',
    phone: '+52 867 000 0000',
    city: 'Nuevo Laredo'
  }
];

const pendingSignups = new Map();

const bookings = [
  {
    id: 'GRZ-4729',
    userId: 'gabriel@email.com',
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
    createdAt: new Date().toISOString()
  }
];

function toPublicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    city: user.city
  };
}

function nextBookingId() {
  const next = 4830 + bookings.length + 1;
  return `GRZ-${next}`;
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/auth/login', (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contrasena son requeridos.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const user = users.find((candidate) => candidate.email === normalizedEmail && candidate.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Credenciales invalidas.' });
  }

  return res.json({ user: toPublicUser(user) });
});

app.post('/auth/signup', (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nombre, email y contrasena son requeridos.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  if (users.some((user) => user.email === normalizedEmail)) {
    return res.status(409).json({ message: 'Ese email ya esta registrado.' });
  }

  pendingSignups.set(normalizedEmail, {
    name: String(name).trim(),
    email: normalizedEmail,
    password: String(password)
  });

  return res.json({ ok: true });
});

app.post('/auth/verify', (req, res) => {
  const { email, code } = req.body ?? {};

  if (!email || !code) {
    return res.status(400).json({ message: 'Email y codigo son requeridos.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const pending = pendingSignups.get(normalizedEmail);

  if (!pending) {
    return res.status(404).json({ message: 'No existe registro pendiente.' });
  }

  if (String(code).trim().length < 4) {
    return res.status(400).json({ message: 'Codigo invalido.' });
  }

  const newUser = {
    id: normalizedEmail,
    name: pending.name,
    email: normalizedEmail,
    password: pending.password,
    phone: '+52 867 000 0000',
    city: 'Nuevo Laredo'
  };

  users.push(newUser);
  pendingSignups.delete(normalizedEmail);

  return res.json({ user: toPublicUser(newUser) });
});

app.get('/chefs', (_req, res) => {
  res.json({ chefs });
});

app.get('/chefs/:chefId', (req, res) => {
  const chef = chefs.find((item) => item.id === req.params.chefId);

  if (!chef) {
    return res.status(404).json({ message: 'Chef no encontrado.' });
  }

  return res.json({ chef });
});

app.get('/bookings', (req, res) => {
  const userId = req.query.userId ? String(req.query.userId) : null;

  if (!userId) {
    return res.json({ bookings });
  }

  return res.json({ bookings: bookings.filter((item) => item.userId === userId) });
});

app.get('/bookings/:bookingId', (req, res) => {
  const booking = bookings.find((item) => item.id === req.params.bookingId);

  if (!booking) {
    return res.status(404).json({ message: 'Reserva no encontrada.' });
  }

  return res.json({ booking });
});

app.post('/bookings', (req, res) => {
  const payload = req.body ?? {};

  if (!payload.userId || !payload.chefId || !payload.dateLabel || !payload.timeLabel) {
    return res.status(400).json({ message: 'Faltan datos de reserva.' });
  }

  const chef = chefs.find((item) => item.id === payload.chefId);

  if (!chef) {
    return res.status(404).json({ message: 'Chef no encontrado.' });
  }

  const booking = {
    id: nextBookingId(),
    userId: payload.userId,
    chefId: payload.chefId,
    chefName: chef.name,
    status: payload.status ?? 'Confirmada',
    dateLabel: payload.dateLabel,
    timeLabel: payload.timeLabel,
    mode: payload.mode ?? 'A domicilio',
    address: payload.address ?? 'Sin direccion',
    packageName: payload.packageName ?? 'Basico',
    guests: payload.guests ?? 10,
    durationHours: payload.durationHours ?? 4,
    serviceFee: payload.serviceFee ?? chef.basePrice,
    transferFee: payload.transferFee ?? 300,
    total: payload.total ?? (payload.serviceFee ?? chef.basePrice) + (payload.transferFee ?? 300),
    paymentMethod: payload.paymentMethod ?? 'Tarjeta',
    createdAt: new Date().toISOString()
  };

  bookings.unshift(booking);
  return res.status(201).json({ booking });
});

app.listen(PORT, () => {
  console.log(`Grillerz backend running on http://localhost:${PORT}`);
});
