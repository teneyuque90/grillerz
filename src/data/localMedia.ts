import { Image, ImageSourcePropType } from 'react-native';

const avatarSources = [
  require('../../assets/images/avatar-1.jpg'),
  require('../../assets/images/avatar-2.jpg'),
  require('../../assets/images/avatar-3.jpg'),
  require('../../assets/images/avatar-4.jpg'),
  require('../../assets/images/avatar-5.jpg')
];

const coverSources = [
  require('../../assets/images/cover-1.jpg'),
  require('../../assets/images/cover-2.jpg'),
  require('../../assets/images/cover-3.jpg'),
  require('../../assets/images/cover-4.jpg'),
  require('../../assets/images/cover-5.jpg')
];

const dishSources = [
  require('../../assets/images/dish-1.jpg'),
  require('../../assets/images/dish-2.jpg'),
  require('../../assets/images/dish-3.jpg'),
  require('../../assets/images/dish-4.jpg'),
  require('../../assets/images/dish-5.jpg'),
  require('../../assets/images/dish-6.jpg')
];

const videoSources = [
  require('../../assets/images/video-1.jpg'),
  require('../../assets/images/video-2.jpg'),
  require('../../assets/images/video-3.jpg')
];

const categoryIconSources: Record<string, ImageSourcePropType> = {
  top: require('../../assets/images/category-icons/top.png'),
  costillas: require('../../assets/images/category-icons/costillas.png'),
  tomahawk: require('../../assets/images/category-icons/tomahawk.png'),
  parrilla: require('../../assets/images/category-icons/parrilla.png'),
  ahumados: require('../../assets/images/category-icons/ahumados.png'),
  brisket: require('../../assets/images/category-icons/brisket.png'),
  cabrito: require('../../assets/images/category-icons/cabrito.png'),
  mariscos: require('../../assets/images/category-icons/mariscos.png'),
  'rib-eyes': require('../../assets/images/category-icons/rib-eyes.png'),
  ribeyes: require('../../assets/images/category-icons/rib-eyes.png'),
  arrachera: require('../../assets/images/category-icons/arrachera.png'),
  picana: require('../../assets/images/category-icons/picana.png'),
  't-bone': require('../../assets/images/category-icons/t-bone.png'),
  'asado-regio': require('../../assets/images/category-icons/asado-regio.png'),
  'parrilla-mixta': require('../../assets/images/category-icons/parrilla-mixta.png'),
  'veggie-grill': require('../../assets/images/category-icons/veggie-grill.png'),
  'paquete-familiar': require('../../assets/images/category-icons/paquete-familiar.png'),
  'evento-premium': require('../../assets/images/category-icons/evento-premium.png')
};

const fallbackSource = require('../../assets/images/fallback.jpg');

function buildSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function pickBySeed<T>(items: T[], seedKey: string): T {
  return items[buildSeed(seedKey) % items.length];
}

function toUri(source: ImageSourcePropType): string {
  return Image.resolveAssetSource(source).uri;
}

function normalizeCategoryName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getFallbackMediaUri() {
  return toUri(fallbackSource);
}

export function getLocalAvatarUriByChef(chefId?: string) {
  return toUri(pickBySeed(avatarSources, chefId ?? 'grillerz-avatar'));
}

export function getLocalCoverUriByChef(chefId?: string) {
  return toUri(pickBySeed(coverSources, chefId ?? 'grillerz-cover'));
}

export function getLocalDishUriByName(name?: string) {
  return toUri(pickBySeed(dishSources, name ?? 'grillerz-dish'));
}

export function getLocalCategoryUriByName(name?: string) {
  const normalized = normalizeCategoryName(name ?? 'default');
  const mappedSource = categoryIconSources[normalized];

  if (mappedSource) {
    return toUri(mappedSource);
  }

  return getLocalDishUriByName(`category-${name ?? 'default'}`);
}

export function getLocalGalleryUriByChef(chefId: string, index: number) {
  return toUri(dishSources[(buildSeed(chefId) + index) % dishSources.length]);
}

export function getLocalVideoThumbUri(videoId?: string) {
  return toUri(pickBySeed(videoSources, videoId ?? 'grillerz-video'));
}
