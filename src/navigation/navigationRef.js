import { createNavigationContainerRef } from '@react-navigation/native';
import { Linking, Platform } from 'react-native';

export const navigationRef = createNavigationContainerRef();

const DEEP_LINK_PREFIX = 'bpicker://incoming-order';

let activeOrderKey = null;
let pendingOrder = null;
let deepLinkInitialized = false;

function getOrderKey(order) {
  return order?.orderId ?? order?.id ?? JSON.stringify(order);
}

// Prevents the same order from triggering a second navigation/modal if OneSignal's
// click listener and the full-screen-intent deep link both fire for one push.
export function navigateToIncomingOrder(order) {
  if (!order) {
    return;
  }

  const orderKey = getOrderKey(order);
  if (activeOrderKey === orderKey) {
    return;
  }
  activeOrderKey = orderKey;

  if (navigationRef.isReady()) {
    navigationRef.navigate('IncomingOrder', { order });
  } else {
    pendingOrder = order;
  }
}

export function clearActiveIncomingOrder() {
  activeOrderKey = null;
}

export function flushPendingIncomingOrder() {
  if (pendingOrder && navigationRef.isReady()) {
    const order = pendingOrder;
    pendingOrder = null;
    navigationRef.navigate('IncomingOrder', { order });
  }
}

function parseIncomingOrderUrl(url) {
  if (!url || !url.startsWith(DEEP_LINK_PREFIX)) {
    return null;
  }

  const match = url.match(/[?&]order=([^&]*)/);
  if (!match) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export function initIncomingOrderDeepLinking() {
  if (Platform.OS !== 'android' || deepLinkInitialized) {
    return;
  }
  deepLinkInitialized = true;

  Linking.getInitialURL()
    .then((url) => navigateToIncomingOrder(parseIncomingOrderUrl(url)))
    .catch(() => {});

  Linking.addEventListener('url', ({ url }) => {
    navigateToIncomingOrder(parseIncomingOrderUrl(url));
  });
}
