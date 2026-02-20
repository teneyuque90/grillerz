export type ChefMenuItem = {
  id: string;
  chefId: string;
  name: string;
  details: string;
  category: string;
  price: number;
};

type MenuSeed = Omit<ChefMenuItem, 'id' | 'chefId'>;

const menuByChefId: Record<string, MenuSeed[]> = {
  'erick-martinez': [
    { name: 'Tomahawk Prime', details: 'Sellado fuerte, mantequilla de ajo y papas rusticas.', category: 'Corte premium', price: 780 },
    { name: 'Costillas Ahumadas', details: 'Ahumado lento 6 horas con salsa de la casa.', category: 'Ahumados', price: 690 },
    { name: 'Parrilla Mixta', details: 'Arrachera, chorizo artesanal y vegetales al carbon.', category: 'Parrilla', price: 620 },
    { name: 'Brisket Jugoso', details: 'Rebanado premium con gravy y ensalada fresca.', category: 'Especialidad', price: 740 }
  ],
  'carlos-bbq': [
    { name: 'Parrilla Familiar', details: 'Asado completo con guarniciones para compartir.', category: 'Parrilla', price: 650 },
    { name: 'Rib Eye Clasico', details: 'Punto medio con chimichurri y vegetales.', category: 'Corte premium', price: 760 },
    { name: 'Pollo al Carbon', details: 'Marinado citrico con papas al romero.', category: 'Pollo', price: 520 },
    { name: 'Burger Ahumada', details: 'Carne premium, queso y pan artesanal.', category: 'Especialidad', price: 390 }
  ],
  'martin-asador': [
    { name: 'Costilla St. Louis', details: 'Ahumado de la casa con glaseado BBQ.', category: 'Ahumados', price: 710 },
    { name: 'Picana al Fuego', details: 'Corte brasileño con sal de mar y pure.', category: 'Corte premium', price: 820 },
    { name: 'Pulpo a las Brasas', details: 'Pulpo marinado con mantequilla al ajo.', category: 'Mariscos', price: 860 },
    { name: 'Parrillada Norteña', details: 'Mix de carne y salchicha polaca artesanal.', category: 'Parrilla', price: 640 }
  ],
  'luis-bbq': [
    { name: 'Asado Regio', details: 'Arrachera, cebolla cambray y tortillas hechas a mano.', category: 'Parrilla', price: 600 },
    { name: 'Cabrito al Carbon', details: 'Porcion premium con salsa tatemada.', category: 'Cabrito', price: 830 },
    { name: 'Boneless Fuego', details: 'Salsa buffalo-ahumada y aderezo ranch.', category: 'Pollo', price: 460 },
    { name: 'T-Bone Especial', details: 'Punto a elegir con guarniciones completas.', category: 'Corte premium', price: 780 }
  ],
  'cories-bbq': [
    { name: 'Ribeye Jugoso', details: 'Ribeye premium con mantequilla de hierbas.', category: 'Corte premium', price: 760 },
    { name: 'Costillas a la Parrilla', details: 'Costilla glaseada con chile rojo suave.', category: 'Ahumados', price: 670 },
    { name: 'Camaron Zarandeado', details: 'Camaron marinado, ajo y limon.', category: 'Mariscos', price: 690 },
    { name: 'Parrilla Brisket', details: 'Brisket laminado y salchicha artesanal.', category: 'Parrilla', price: 640 }
  ]
};

export function getFallbackChefMenuItems(chefId: string) {
  const base = menuByChefId[chefId] ?? [];
  return base.map((item, index) => ({
    id: `${chefId}-menu-${index + 1}`,
    chefId,
    ...item
  }));
}
