import { resolveMediaUrl } from './media';

const DEMO_PLACEHOLDER_HOSTS = ['loremflickr.com', 'picsum.photos', 'i.pravatar.cc', 'img.youtube.com'];

export function isDemoPlaceholderMedia(value: string) {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return DEMO_PLACEHOLDER_HOSTS.some((host) => hostname.includes(host));
  } catch {
    return false;
  }
}

export function getReliableMediaUrl(rawValue: string | null | undefined, fallbackUrl: string) {
  const resolved = resolveMediaUrl(rawValue);
  if (!resolved) {
    return fallbackUrl;
  }

  if (isDemoPlaceholderMedia(resolved)) {
    return fallbackUrl;
  }

  return resolved;
}
