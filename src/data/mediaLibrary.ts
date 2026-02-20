import { ChefVideo } from '../types/domain';

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
  { name: 'Costillas a la Parrilla', imageUrl: 'https://loremflickr.com/1200/800/ribs,bbq?lock=301' },
  { name: 'Asado Regio', imageUrl: 'https://loremflickr.com/1200/800/asado,carne?lock=302' },
  { name: 'Costillas Ahumadas', imageUrl: 'https://loremflickr.com/1200/800/smoked,ribs?lock=303' },
  { name: 'Ribeye Jugoso', imageUrl: 'https://loremflickr.com/1200/800/ribeye,steak?lock=304' },
  { name: 'Tomahawk al Carbon', imageUrl: 'https://loremflickr.com/1200/800/tomahawk,grill?lock=305' },
  { name: 'Parrilla Mixta', imageUrl: 'https://loremflickr.com/1200/800/parrilla,mixta?lock=306' },
  { name: 'Brisket', imageUrl: 'https://loremflickr.com/1200/800/brisket,bbq?lock=307' },
  { name: 'Paquete Familiar', imageUrl: 'https://loremflickr.com/1200/800/family,bbq?lock=308' },
  { name: 'Evento Premium', imageUrl: 'https://loremflickr.com/1200/800/premium,steak?lock=309' }
];

const categoryMedia: MediaItem[] = [
  { name: 'Asado Regio', imageUrl: 'https://loremflickr.com/1200/800/asado,norte?lock=320' },
  { name: 'Costillas', imageUrl: 'https://loremflickr.com/1200/800/costillas,bbq?lock=321' },
  { name: 'Tomahawk', imageUrl: 'https://loremflickr.com/1200/800/tomahawk,fire?lock=322' },
  { name: 'Brisket', imageUrl: 'https://loremflickr.com/1200/800/brisket,smoke?lock=323' },
  { name: 'Parrilla Mixta', imageUrl: 'https://loremflickr.com/1200/800/grill,party?lock=324' },
  { name: 'Mariscos', imageUrl: 'https://loremflickr.com/1200/800/shrimp,grill?lock=325' },
  { name: 'Veggie Grill', imageUrl: 'https://loremflickr.com/1200/800/vegetables,grill?lock=326' },
  { name: 'Paquete Familiar', imageUrl: 'https://loremflickr.com/1200/800/family,barbecue?lock=327' },
  { name: 'Evento Premium', imageUrl: 'https://loremflickr.com/1200/800/steak,premium?lock=328' }
];

const grillerVideosByChefId: Record<string, GrillerVideoSeed[]> = {
  'erick-martinez': [
    {
      videoId: 'M7lc1UVf-VE',
      title: 'Tomahawk al Carbon: punto perfecto',
      subtitle: 'Tecnica de sellado y reposo',
      youtubeUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE'
    },
    {
      videoId: 'ysz5S6PUM-U',
      title: 'Costillas ahumadas estilo norte',
      subtitle: 'Coccion lenta y glaseado',
      youtubeUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U'
    }
  ],
  'carlos-bbq': [
    {
      videoId: 'aqz-KE-bpKQ',
      title: 'Parrilla mixta para 20 personas',
      subtitle: 'Orden y tiempos de servicio',
      youtubeUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ'
    },
    {
      videoId: 'M7lc1UVf-VE',
      title: 'Brisket jugoso: guia completa',
      subtitle: 'Temperatura y reposo',
      youtubeUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE'
    }
  ],
  'martin-asador': [
    {
      videoId: 'ysz5S6PUM-U',
      title: 'Cortes premium al fuego vivo',
      subtitle: 'Control de flama y sabor',
      youtubeUrl: 'https://www.youtube.com/watch?v=ysz5S6PUM-U'
    }
  ],
  'luis-bbq': [
    {
      videoId: 'aqz-KE-bpKQ',
      title: 'Asado regio para eventos',
      subtitle: 'Flujo para servicio rapido',
      youtubeUrl: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ'
    }
  ],
  'cories-bbq': [
    {
      videoId: 'M7lc1UVf-VE',
      title: 'Ribeye jugoso en parrilla',
      subtitle: 'Sellado, mantequilla y acabado',
      youtubeUrl: 'https://www.youtube.com/watch?v=M7lc1UVf-VE'
    }
  ]
};

const defaultDishImage = 'https://loremflickr.com/1200/800/grill,steak?lock=399';

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
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
