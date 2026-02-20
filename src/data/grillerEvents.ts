import { GrillerEvent, GrillerEventStatus } from '../types/domain';

const nowIso = new Date().toISOString();

const fallbackEvents: GrillerEvent[] = [
  {
    id: 'evt-local-erick-01',
    chefId: 'erick-martinez',
    chefName: 'Erick Martinez',
    createdByUserId: 'erick@grillerz.app',
    title: 'Noche de Costillas Ahumadas',
    description: 'Evento en terraza con menu premium y cupo limitado.',
    city: 'Nuevo Laredo',
    venueName: 'Terraza Norte',
    address: 'Av. Reforma 120, Nuevo Laredo',
    dateKey: '2026-05-10',
    timeLabel: '7:30 PM',
    capacityTotal: 12,
    seatsAvailable: 7,
    pricePerPerson: 750,
    minSeatsPerReservation: 1,
    maxSeatsPerReservation: 6,
    menu: ['Costillas Ahumadas', 'Brisket', 'Guarniciones', 'Bebida artesanal'],
    status: 'Publicado',
    createdAt: nowIso,
    updatedAt: nowIso
  },
  {
    id: 'evt-local-carlos-01',
    chefId: 'carlos-bbq',
    chefName: 'Carlos BBQ',
    createdByUserId: 'admin@grillerz.app',
    title: 'Parrilla Mixta en Terraza',
    description: 'Asado premium para grupo de amigos y familias.',
    city: 'Monterrey',
    venueName: 'Patio BBQ',
    address: 'Centro 405, Monterrey',
    dateKey: '2026-05-17',
    timeLabel: '8:00 PM',
    capacityTotal: 18,
    seatsAvailable: 14,
    pricePerPerson: 820,
    minSeatsPerReservation: 1,
    maxSeatsPerReservation: 8,
    menu: ['Parrilla Mixta', 'Tomahawk', 'Salsas', 'Postre'],
    status: 'Publicado',
    createdAt: nowIso,
    updatedAt: nowIso
  }
];

export function getFallbackEvents(status: GrillerEventStatus = 'Publicado') {
  return fallbackEvents
    .filter((item) => item.status === status)
    .map((item) => ({ ...item, menu: [...item.menu] }));
}

export function getFallbackEventsByChef(chefId: string) {
  return fallbackEvents
    .filter((item) => item.chefId === chefId)
    .map((item) => ({ ...item, menu: [...item.menu] }));
}
