export const ONE_SIGNAL_APP_ID = '0023aa06-0519-407a-8ef4-19afad3e7ba6';

export function isValidOneSignalAppId(appId: string): boolean {
  if (!appId) {
    return false;
  }

  if (appId.includes('YOUR_ONESIGNAL_APP_ID')) {
    return false;
  }

  return appId.length >= 8;
}
