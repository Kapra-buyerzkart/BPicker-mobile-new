import { NativeModules, Platform } from 'react-native';

type RingtonePlayerModule = {
  playOrderAlert: () => void;
  stop: () => void;
};

const RingtonePlayer: RingtonePlayerModule | undefined = NativeModules.RingtonePlayer;


export function playOrderAlertSound(): void {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    RingtonePlayer?.playOrderAlert();
  } catch {
    // ignore playback errors
  }
}

export function stopOrderAlertSound(): void {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    RingtonePlayer?.stop();
  } catch {
    // ignore
  }
}
