import { API_BASE_URL } from '../config/api';

const REMOTE_PROTOCOL_PATTERN = /^(https?:|data:|file:|content:)/i;

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function trimLeadingSlash(value: string): string {
  return value.replace(/^\/+/, '');
}

function getApiOrigin(): string {
  try {
    return trimTrailingSlash(new URL(API_BASE_URL).origin);
  } catch {
    return trimTrailingSlash(API_BASE_URL);
  }
}

export function resolveMediaUrl(rawValue: string | null | undefined): string {
  const value = rawValue?.trim() ?? '';

  if (!value) {
    return '';
  }

  if (REMOTE_PROTOCOL_PATTERN.test(value)) {
    return value;
  }

  if (value.startsWith('//')) {
    return `https:${value}`;
  }

  const origin = getApiOrigin();
  if (value.startsWith('/')) {
    return `${origin}/${trimLeadingSlash(value)}`;
  }

  return `${origin}/${trimLeadingSlash(value)}`;
}
