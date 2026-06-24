import { NativeModules, Platform } from 'react-native';

const { IncomingOrderSound } = NativeModules;

let isPlaying = false;

export function startIncomingOrderSound() {
  if (Platform.OS !== 'android' || !IncomingOrderSound || isPlaying) {
    return;
  }
  isPlaying = true;
  IncomingOrderSound.start();
}

export function stopIncomingOrderSound() {
  if (Platform.OS !== 'android' || !IncomingOrderSound || !isPlaying) {
    return;
  }
  isPlaying = false;
  IncomingOrderSound.stop();
}
