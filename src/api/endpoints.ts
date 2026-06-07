const env = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>;
}).env;

const defaultPublicUrl = 'https://api.mahala.app/public';
const PUBLIC_URL = ((env?.VITE_MAHALA_PUBLIC_URL || defaultPublicUrl) ?? '').replace(/\/+$/, '');
const BASE_URL = `${PUBLIC_URL}/api`;

const mediaUrl = (path: string | null | undefined) => {
  const value = String(path || '');

  if (!value) {
    return null;
  }

  const uploadsIndex = value.indexOf('/uploads/posts/');
  const normalizedValue = uploadsIndex >= 0 ? value.slice(uploadsIndex) : value;

  if (uploadsIndex < 0 && /^https?:\/\//i.test(value)) {
    return value;
  }

  return `${PUBLIC_URL}/${normalizedValue.replace(/^\/+/, '')}`;
};

const endpoints = {
  publicBase: PUBLIC_URL,
  mediaUrl,
  mahalas: `${BASE_URL}/mahalas`,
  feedForCurrentMahalas: (
    mahalaIds: string[],
    params: { limit?: number; page?: number; sort?: string } = {},
  ) => {
    const query = [
      `mahala_ids=${encodeURIComponent(mahalaIds.join(','))}`,
      `limit=${encodeURIComponent(String(params.limit ?? 12))}`,
      `sort=${encodeURIComponent(params.sort ?? 'recent')}`,
    ];

    if (params.page != null) {
      query.push(`page=${encodeURIComponent(String(params.page))}`);
    }

    return `${BASE_URL}/feed?${query.join('&')}`;
  },
  topicsPreview: `${BASE_URL}/topics`,
  topicsForCurrentMahalas: (mahalaIds: string[]) =>
    `${BASE_URL}/topics/current-mahalas?mahala_ids=${encodeURIComponent(mahalaIds.join(','))}`,
};

export default endpoints;
