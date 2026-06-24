import { Platform, Vibration } from 'react-native';

const VIBRATE_PATTERN = [0, 800, 400, 800, 400, 800];

let isVibrating = false;

export function startIncomingOrderVibration() {
  if (Platform.OS !== 'android' || isVibrating) {
    return;
  }
  isVibrating = true;
  Vibration.vibrate(VIBRATE_PATTERN, true);
}

export function stopIncomingOrderVibration() {
  if (Platform.OS !== 'android' || !isVibrating) {
    return;
  }
  isVibrating = false;
  Vibration.cancel();
}
