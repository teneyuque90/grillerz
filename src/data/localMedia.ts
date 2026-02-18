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
  return getLocalDishUriByName(`category-${name ?? 'default'}`);
}

export function getLocalGalleryUriByChef(chefId: string, index: number) {
  return toUri(dishSources[(buildSeed(chefId) + index) % dishSources.length]);
}

export function getLocalVideoThumbUri(videoId?: string) {
  return toUri(pickBySeed(videoSources, videoId ?? 'grillerz-video'));
}
