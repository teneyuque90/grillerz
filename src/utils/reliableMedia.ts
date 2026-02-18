import { resolveMediaUrl } from './media';

export function getReliableMediaUrl(rawValue: string | null | undefined, fallbackUrl: string) {
  const resolved = resolveMediaUrl(rawValue);
  return resolved || fallbackUrl;
}
