import { Chef } from '../types/domain';
import { getLocalAvatarUriByChef, getLocalCoverUriByChef } from '../data/localMedia';
import { getReliableMediaUrl } from './reliableMedia';

type ChefMediaShape = Pick<Chef, 'id' | 'name' | 'avatarUrl' | 'coverUrl'>;

function getChefKey(chef?: Partial<ChefMediaShape>) {
  return String(chef?.id ?? chef?.name ?? 'grillerz-default').trim().toLowerCase() || 'grillerz-default';
}

export function getChefAvatarUrl(chef?: Partial<ChefMediaShape>) {
  return getReliableMediaUrl(chef?.avatarUrl, getLocalAvatarUriByChef(getChefKey(chef)));
}

export function getChefCoverUrl(chef?: Partial<ChefMediaShape>) {
  return getReliableMediaUrl(chef?.coverUrl, getLocalCoverUriByChef(getChefKey(chef)));
}
