import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  OneSignal,
  LogLevel,
  type NotificationClickEvent,
  type NotificationWillDisplayEvent,
} from 'react-native-onesignal';
import { ONE_SIGNAL_APP_ID, isValidOneSignalAppId } from '../config/oneSignal';

let hasInitialized = false;
let desiredExternalId: string | null = null;
let ensureExternalIdAttempt = 0;
let ensureExternalIdTimer: ReturnType<typeof setTimeout> | null = null;

const NOTIFICATION_BADGE_STORAGE_KEY = 'notificationBadgeCount';
const badgeCountListeners = new Set<(count: number) => void>();

function parseBadgeCount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return Math.max(0, parsed);
    }
  }
  return 0;
}

function emitBadgeCount(count: number): void {
  badgeCountListeners.forEach((listener) => {
    try {
      listener(count);
    } catch {
      // ignore listener errors
    }
  });
}

export async function getNotificationBadgeCount(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_BADGE_STORAGE_KEY);
    return parseBadgeCount(raw);
  } catch {
    return 0;
  }
}

export async function setNotificationBadgeCount(count: number): Promise<number> {
  const normalized = Math.max(0, Math.floor(count));
  try {
    await AsyncStorage.setItem(NOTIFICATION_BADGE_STORAGE_KEY, String(normalized));
  } catch {
    // ignore storage write errors
  }
  emitBadgeCount(normalized);
  return normalized;
}

export async function incrementNotificationBadgeCount(incrementBy = 1): Promise<number> {
  const delta = Math.max(1, Math.floor(incrementBy));
  const current = await getNotificationBadgeCount();
  return setNotificationBadgeCount(current + delta);
}

export async function clearNotificationBadgeCount(): Promise<number> {
  return setNotificationBadgeCount(0);
}

export function subscribeNotificationBadgeCount(listener: (count: number) => void): () => void {
  badgeCountListeners.add(listener);

  void getNotificationBadgeCount().then(listener);

  return () => {
    badgeCountListeners.delete(listener);
  };
}

function getExternalIdCandidate(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function scheduleEnsureExternalId(): void {
  if (!desiredExternalId) {
    return;
  }

  if (ensureExternalIdTimer) {
    clearTimeout(ensureExternalIdTimer);
  }

  ensureExternalIdTimer = setTimeout(async () => {
    const expectedExternalId = desiredExternalId;
    if (!expectedExternalId) {
      return;
    }

    try {
      const currentExternalId = await OneSignal.User.getExternalId();
      if (currentExternalId === expectedExternalId) {
        ensureExternalIdAttempt = 0;
        return;
      }

      OneSignal.login(expectedExternalId);
    } catch {
      // ignore and retry below
    } finally {
      ensureExternalIdAttempt += 1;
      if (ensureExternalIdAttempt < 6) {
        scheduleEnsureExternalId();
      } else {
        ensureExternalIdAttempt = 0;
      }
    }
  }, 1500);
}

export function initOneSignal(): void {
  if (hasInitialized) {
    return;
  }

  if (!isValidOneSignalAppId(ONE_SIGNAL_APP_ID)) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(
        '[OneSignal] Skipping init: set a real ONE_SIGNAL_APP_ID in src/config/oneSignal.ts'
      );
    }
    return;
  }

  hasInitialized = true;

  if (__DEV__) {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
  }

  OneSignal.initialize(ONE_SIGNAL_APP_ID);

  OneSignal.User.pushSubscription.addEventListener('change', () => {
    if (desiredExternalId) {
      scheduleEnsureExternalId();
    }
  });

  OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event: NotificationWillDisplayEvent) => {
    const notification = event.getNotification();
    const incrementBy = parseBadgeCount(notification?.badgeIncrement) || 1;
    void incrementNotificationBadgeCount(incrementBy);
  });

  OneSignal.Notifications.addEventListener('click', (_event: NotificationClickEvent) => {
    void clearNotificationBadgeCount();
  });
}

export async function requestPushPermissionIfNeeded(): Promise<boolean> {
  initOneSignal();

  try {
    const hasPermission = await OneSignal.Notifications.getPermissionAsync();
    if (hasPermission) {
      OneSignal.User.pushSubscription.optIn();
      return true;
    }

    const canRequest = await OneSignal.Notifications.canRequestPermission();

    const accepted = await OneSignal.Notifications.requestPermission(true);
    if (accepted) {
      OneSignal.User.pushSubscription.optIn();
    }
    return accepted;
  } catch {
    return false;
  }
}

export function oneSignalLogin(params: { externalId: string; tags?: Record<string, string> }): void {
  initOneSignal();

  const externalId = getExternalIdCandidate(params.externalId);
  if (!externalId) {
    return;
  }

  desiredExternalId = externalId;
  OneSignal.login(externalId);
  scheduleEnsureExternalId();

  if (params.tags && Object.keys(params.tags).length > 0) {
    OneSignal.User.addTags(params.tags);
  }
}

export function oneSignalLogout(): void {
  initOneSignal();
  desiredExternalId = null;
  void clearNotificationBadgeCount();
  OneSignal.logout();
}
