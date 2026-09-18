import { useKeepAwake } from 'expo-keep-awake';
import { Platform } from 'react-native';

/**
 * expo-keep-awake's web implementation (Screen Wake Lock API) has a race
 * where deactivating on unmount can throw "wake lock has not activated
 * yet" if the component unmounts quickly after mounting (e.g. navigating
 * screens fast during manual testing) -- surfaces as an uncaught promise
 * rejection. Harmless on Android (the real target), but disruptive when
 * testing in a browser, so it's skipped on web. `Platform.OS` never
 * changes during a running app, so this conditional hook call is stable
 * across renders.
 */
export function useKeepAwakeSafe(): void {
  if (Platform.OS !== 'web') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useKeepAwake();
  }
}
