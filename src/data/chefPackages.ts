import { ChefPackage } from '../types/domain';

type ChefPackageSeed = {
  name: string;
  details: string;
  price: number;
};

const fallbackPackagesByChefId: Record<string, ChefPackageSeed[]> = {
  'erick-martinez': [
    { name: 'Paquete Basico', details: 'Hasta 5 personas', price: 2200 },
    { name: 'Paquete Familiar', details: 'Hasta 10 personas', price: 4200 },
    { name: 'Evento Privado', details: 'Hasta 20 personas', price: 7600 }
  ],
  'carlos-bbq': [
    { name: 'Parrilla Express', details: 'Hasta 6 personas', price: 2500 },
    { name: 'Parrilla Familiar', details: 'Hasta 12 personas', price: 4800 }
  ],
  'martin-asador': [
    { name: 'Smoke Basico', details: 'Hasta 6 personas', price: 2800 },
    { name: 'Smoke Premium', details: 'Hasta 15 personas', price: 6200 }
  ],
  'luis-bbq': [
    { name: 'Asado Regio', details: 'Hasta 8 personas', price: 3000 },
    { name: 'Asado para Evento', details: 'Hasta 18 personas', price: 6500 }
  ],
  'cories-bbq': [
    { name: 'Ribeye Basico', details: 'Hasta 5 personas', price: 2600 },
    { name: 'Ribeye Familiar', details: 'Hasta 10 personas', price: 5000 }
  ]
};

export function getFallbackChefPackages(chefId: string): ChefPackage[] {
  const seed = fallbackPackagesByChefId[chefId] ?? fallbackPackagesByChefId['erick-martinez'] ?? [];
  const now = new Date().toISOString();

  return seed.map((item, index) => ({
    id: `${chefId}-fallback-pkg-${index + 1}`,
    chefId,
    name: item.name,
    details: item.details,
    price: item.price,
    isActive: true,
    displayOrder: index,
    createdAt: now,
    updatedAt: now
  }));
}
