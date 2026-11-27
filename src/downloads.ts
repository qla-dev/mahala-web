export const DOWNLOAD_PATH = '/downloads';

export const STORE_LINKS = {
  ios: 'https://apps.apple.com/app/id6763176567',
  android: 'https://play.google.com/store/apps/details?id=mahala.qla.dev',
};

export function detectMobileStorePlatform(
  device: Pick<Navigator, 'userAgent' | 'platform' | 'maxTouchPoints'> = navigator,
): keyof typeof STORE_LINKS | null {
  if (/Android/i.test(device.userAgent)) {
    return 'android';
  }

  const isIPadOS = device.platform === 'MacIntel' && device.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/i.test(device.userAgent) || isIPadOS) {
    return 'ios';
  }

  return null;
}
