import { ChefVideo } from '../types/domain';
import { getLocalCategoryUriByName, getLocalDishUriByName, getLocalVideoThumbUri } from './localMedia';

type MediaItem = {
  name: string;
  imageUrl: string;
};

type GrillerVideoSeed = {
  videoId: string;
  title: string;
  subtitle: string;
  youtubeUrl: string;
};

const dishMedia: MediaItem[] = [
  { name: 'Costillas a la Parrilla', imageUrl: getLocalDishUriByName('Costillas a la Parrilla') },
  { name: 'Asado Regio', imageUrl: getLocalDishUriByName('Asado Regio') },
  { name: 'Costillas Ahumadas', imageUrl: getLocalDishUriByName('Costillas Ahumadas') },
  { name: 'Ribeye Jugoso', imageUrl: getLocalDishUriByName('Ribeye Jugoso') },
  { name: 'Tomahawk al Carbon', imageUrl: getLocalDishUriByName('Tomahawk al Carbon') },
  { name: 'Parrilla Mixta', imageUrl: getLocalDishUriByName('Parrilla Mixta') },
  { name: 'Brisket', imageUrl: getLocalDishUriByName('Brisket') },
  { name: 'Paquete Familiar', imageUrl: getLocalDishUriByName('Paquete Familiar') },
  { name: 'Evento Premium', imageUrl: getLocalDishUriByName('Evento Premium') }
];

const categoryMedia: MediaItem[] = [
  { name: 'Asado Regio', imageUrl: getLocalCategoryUriByName('Asado Regio') },
  { name: 'Costillas', imageUrl: getLocalCategoryUriByName('Costillas') },
  { name: 'Tomahawk', imageUrl: getLocalCategoryUriByName('Tomahawk') },
  { name: 'Brisket', imageUrl: getLocalCategoryUriByName('Brisket') },
  { name: 'Parrilla Mixta', imageUrl: getLocalCategoryUriByName('Parrilla Mixta') },
  { name: 'Mariscos', imageUrl: getLocalCategoryUriByName('Mariscos') },
  { name: 'Veggie Grill', imageUrl: getLocalCategoryUriByName('Veggie Grill') },
  { name: 'Paquete Familiar', imageUrl: getLocalCategoryUriByName('Paquete Familiar') },
  { name: 'Evento Premium', imageUrl: getLocalCategoryUriByName('Evento Premium') }
];

const grillerVideosByChefId: Record<string, GrillerVideoSeed[]> = {
  'erick-martinez': [
    {
      videoId: 'dQw4w9WgXcQ',
      title: 'Tomahawk al Carbon: punto perfecto',
      subtitle: 'Tecnica de sellado y reposo',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    {
      videoId: 'M7FIvfx5J10',
      title: 'Costillas ahumadas estilo norte',
      subtitle: 'Coccion lenta y glaseado',
      youtubeUrl: 'https://www.youtube.com/watch?v=M7FIvfx5J10'
    }
  ],
  'carlos-bbq': [
    {
      videoId: 'J---aiyznGQ',
      title: 'Parrilla mixta para 20 personas',
      subtitle: 'Orden y tiempos de servicio',
      youtubeUrl: 'https://www.youtube.com/watch?v=J---aiyznGQ'
    },
    {
      videoId: 'kXYiU_JCYtU',
      title: 'Brisket jugoso: guia completa',
      subtitle: 'Temperatura y reposo',
      youtubeUrl: 'https://www.youtube.com/watch?v=kXYiU_JCYtU'
    }
  ],
  'martin-asador': [
    {
      videoId: 'fJ9rUzIMcZQ',
      title: 'Cortes premium al fuego vivo',
      subtitle: 'Control de flama y sabor',
      youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ'
    }
  ],
  'luis-bbq': [
    {
      videoId: 'hTWKbfoikeg',
      title: 'Asado regio para eventos',
      subtitle: 'Flujo para servicio rapido',
      youtubeUrl: 'https://www.youtube.com/watch?v=hTWKbfoikeg'
    }
  ],
  'cories-bbq': [
    {
      videoId: 'Zi_XLOBDo_Y',
      title: 'Ribeye jugoso en parrilla',
      subtitle: 'Sellado, mantequilla y acabado',
      youtubeUrl: 'https://www.youtube.com/watch?v=Zi_XLOBDo_Y'
    }
  ]
};

const defaultDishImage = getLocalDishUriByName('default');

export function getDishImageByName(name: string) {
  const item = dishMedia.find((entry) => entry.name === name);
  return item?.imageUrl ?? defaultDishImage;
}

export function getCategoryImageByName(name: string) {
  const item = categoryMedia.find((entry) => entry.name === name);
  return item?.imageUrl ?? defaultDishImage;
}

export function getGrillerVideos(chefId: string) {
  const now = new Date().toISOString();
  const items = grillerVideosByChefId[chefId] ?? [];

  return items.map<ChefVideo>((item, index) => ({
    id: `${chefId}-${item.videoId}-${index}`,
    chefId,
    title: item.title,
    subtitle: item.subtitle,
    youtubeUrl: item.youtubeUrl,
    videoId: item.videoId,
    displayOrder: index,
    createdAt: now,
    updatedAt: now
  }));
}

export function getYouTubeThumbnail(videoId: string) {
  return getLocalVideoThumbUri(videoId);
}
