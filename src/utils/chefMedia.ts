import { Chef } from '../types/domain';
import { resolveMediaUrl } from './media';

type ChefMediaShape = Pick<Chef, 'id' | 'name' | 'avatarUrl' | 'coverUrl'>;

function buildSeed(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function getChefKey(chef?: Partial<ChefMediaShape>) {
  return String(chef?.id ?? chef?.name ?? 'grillerz-default').trim().toLowerCase() || 'grillerz-default';
}

function fallbackAvatarByChef(chef?: Partial<ChefMediaShape>) {
  const seed = buildSeed(getChefKey(chef));
  const avatarIndex = (seed % 70) + 1;
  return `https://i.pravatar.cc/300?img=${avatarIndex}`;
}

function fallbackCoverByChef(chef?: Partial<ChefMediaShape>) {
  const key = encodeURIComponent(getChefKey(chef));
  return `https://picsum.photos/seed/grillerz-cover-${key}/1280/720`;
}

export function getChefAvatarUrl(chef?: Partial<ChefMediaShape>) {
  const resolvedAvatar = resolveMediaUrl(chef?.avatarUrl);
  return resolvedAvatar || fallbackAvatarByChef(chef);
}

export function getChefCoverUrl(chef?: Partial<ChefMediaShape>) {
  const resolvedCover = resolveMediaUrl(chef?.coverUrl);
  return resolvedCover || fallbackCoverByChef(chef);
}
