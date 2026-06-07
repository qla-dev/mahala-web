const env = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>;
}).env;

const defaultBaseUrl = 'https://api.mahala.app/public/api';
const baseUrl = ((env?.VITE_MAHALA_DB_BASE_URL || defaultBaseUrl) ?? '').replace(/\/+$/, '');
const publicBaseUrl = baseUrl.replace(/\/api$/, '');

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

  return `${publicBaseUrl.replace(/\/+$/, '')}/${normalizedValue.replace(/^\/+/, '')}`;
};

const endpoints = {
  publicBase: publicBaseUrl,
  mediaUrl,
  mahalas: `${baseUrl}/mahalas`,
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

    return `${baseUrl}/feed?${query.join('&')}`;
  },
  topicsPreview: `${baseUrl}/topics`,
  topicsForCurrentMahalas: (mahalaIds: string[]) =>
    `${baseUrl}/topics/current-mahalas?mahala_ids=${encodeURIComponent(mahalaIds.join(','))}`,
};

export default endpoints;
