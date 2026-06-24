# Rider Order Alert System — Implementation Summary

Android-only. Built on top of the project's **existing OneSignal push pipeline** (which wraps FCM), not raw `@react-native-firebase/messaging` + Notifee as originally spec'd — see "Architecture decisions" below for why.

## Architecture decisions

1. **OneSignal, not raw Firebase Messaging.** The repo's actual push setup is `react-native-onesignal` (OneSignal owns the FCM token/receiver natively via `google-services.json`). There is no `@react-native-firebase/messaging` installed. Routing this feature through OneSignal reuses what's already wired up instead of registering a second, competing FCM consumer.

2. **No Notifee.** OneSignal already displays the system notification natively, including when the app is fully killed (JS isn't running at that point, so a JS-only library like Notifee can't intercept that path anyway). OneSignal exposes a native extension point for exactly this — `com.onesignal.notifications.INotificationServiceExtension`, registered via an `AndroidManifest` meta-data tag, called regardless of app state. Adding Notifee on top would have no notification left to create and risked a **duplicate** notification. Channel/sound/vibration/full-screen-intent are implemented with plain `NotificationCompat`/`NotificationChannel` inside that native hook instead.

3. **Only pushes with `additionalData.type == "incoming_order"` are touched.** Every hook (native extension, `foregroundWillDisplay`, `click`) checks this first and falls through to existing behavior otherwise — no existing notification/badge logic was changed.

4. **Sound playback uses a small custom native module**, not a third-party audio library. RN core ships `Vibration` (used directly for the vibration service) but no audio player, and the project is on RN 0.84 (New Architecture by default) where older unmaintained audio libraries (e.g. `react-native-sound`) are a real compatibility risk. A ~70-line `MediaPlayer`-based native module is smaller and safer.

5. **Full-screen-intent wake path uses a deep link** (`bpicker://incoming-order?order=<json>`), resolved via RN's built-in `Linking` module (`getInitialURL` for cold start, `onNewIntent` for already-running). No new dependency; React Navigation's own `linking` config wasn't needed since this is handled with one imperative `navigationRef.navigate(...)` call shared with the OneSignal click listener.

6. **Sound asset**: `android/app/src/main/res/raw/order_alert.wav` already existed in the repo (valid 16-bit PCM WAV, placed ahead of this task) — referenced directly, no placeholder fabricated.

## How each state is handled

| App state | Mechanism |
|---|---|
| **Killed / background** | `RiderOrderNotificationServiceExtension` (native, runs with no JS) builds the `rider_orders` channel (HIGH importance, custom sound, vibration, lights) and sets `PRIORITY_MAX` + `CATEGORY_CALL` + a full-screen-intent `PendingIntent`. OS displays the heads-up notification and, depending on lock state, auto-launches the full-screen intent. |
| **Tap on notification** | OneSignal's existing `click` listener (already wired for badge-clearing) now also checks `additionalData.type`; if it's an order alert it calls `navigateToIncomingOrder()`. OneSignal queues click events that occur before the JS listener attaches, so this works for cold starts too. |
| **Full-screen-intent auto-launch (locked/off screen)** | The intent target is `bpicker://incoming-order?order=...`, opened via `MainActivity`'s manifest intent-filter + `onNewIntent` override. RN's `Linking` API delivers it to `navigationRef.js`, which calls the same `navigateToIncomingOrder()`. |
| **Foreground** | OneSignal's `foregroundWillDisplay` listener now checks `additionalData.type`; for order alerts it calls `event.preventDefault()` (suppresses the system notification entirely) and navigates straight to the in-app alert. |

A module-level guard (`activeOrderKey` in `navigationRef.js`) makes these three entry points idempotent — whichever fires first wins; the others are no-ops for the same order.

## Deliverables / file-by-file

### New files

| File | Role |
|---|---|
| `android/app/src/main/java/com/bpicker/incomingorder/RiderOrderNotificationServiceExtension.kt` | OneSignal native extension: creates `rider_orders` channel, sets priority/category/vibration/full-screen-intent for `incoming_order` pushes only |
| `android/app/src/main/java/com/bpicker/incomingorder/IncomingOrderSoundModule.kt` | Native module wrapping `MediaPlayer`, loops `res/raw/order_alert`, guards against duplicate instances, releases cleanly |
| `android/app/src/main/java/com/bpicker/incomingorder/IncomingOrderSoundPackage.kt` | `ReactPackage` registering the sound module |
| `src/services/incomingOrderSoundService.js` | JS-side `startIncomingOrderSound()` / `stopIncomingOrderSound()` wrapping the native module |
| `src/services/incomingOrderVibrationService.js` | JS-side `startIncomingOrderVibration()` / `stopIncomingOrderVibration()` using RN core `Vibration` |
| `src/navigation/navigationRef.js` | Navigation ref, `navigateToIncomingOrder()` (de-duped), `clearActiveIncomingOrder()`, deep-link bootstrap (`initIncomingOrderDeepLinking()`) |
| `src/components/IncomingOrderAlert.js` | Full-screen alert UI: countdown (20s default), earnings/pickup/delivery, Accept/Reject buttons; owns the sound+vibration+timer lifecycle so it behaves the same regardless of how it was reached |
| `src/screens/IncomingOrderScreen.js` | Stack screen hosting `IncomingOrderAlert`; wires Accept/Reject/Timeout to `updateOrderStatus()` |

### Edited files

| File | Change |
|---|---|
| `android/app/src/main/AndroidManifest.xml` | Added `VIBRATE` / `USE_FULL_SCREEN_INTENT` permissions; `android:showWhenLocked` / `android:turnScreenOn` on `MainActivity`; new `bpicker://incoming-order` intent-filter; `com.onesignal.NotificationServiceExtension` meta-data tag |
| `android/app/src/main/java/com/bpicker/MainActivity.kt` | Added `onNewIntent` override (`setIntent(intent)`) so the deep link works while the app is already running, not just cold start |
| `android/app/src/main/java/com/bpicker/MainApplication.kt` | Registered `IncomingOrderSoundPackage()` in the existing manual-package block |
| `src/navigation/Container.js` | Attached `navigationRef` to `NavigationContainer`, added `onReady={flushPendingIncomingOrder}`, added the `IncomingOrder` stack screen (transparent modal presentation) |
| `src/services/oneSignalService.ts` | Added an `incoming_order` branch to the existing `foregroundWillDisplay` and `click` listeners; all other notification types/behavior (badge counting) untouched |
| `App.tsx` | Added `initIncomingOrderDeepLinking()` call alongside the existing `initOneSignal()` |

## Duplicate protection & cleanup

- **Duplicate notifications**: only one native display path (OneSignal); Notifee deliberately excluded.
- **Duplicate navigation/modals**: `activeOrderKey` guard in `navigationRef.js` ignores repeat calls for the same order id from any of the three entry points.
- **Multiple sound/vibration instances**: module-level `isPlaying` / `isVibrating` flags in the JS services; native `MediaPlayer` is released and nulled before a new one starts.
- **Cleanup**: `IncomingOrderAlert` stops sound/vibration/timer on accept, reject, timeout, and on unmount; `IncomingOrderSoundModule.invalidate()` stops playback if the native module is torn down.

## Verified

- `npx tsc --noEmit` — clean
- `npx eslint` on all new/edited JS/TS files — no errors (pre-existing unrelated warning in `oneSignalService.ts` left untouched)
- `./gradlew :app:assembleDebug` — clean build; confirmed merged manifest contains the new permissions, intent-filter, and meta-data tag; confirmed all three new Kotlin classes compiled

## Open items for you to confirm

1. **`eventKey` values** — `IncomingOrderScreen.js` calls the existing `updateOrderStatus({ orderId, eventKey })` with `'ACCEPTED'` / `'REJECTED'`, inferred from the `'PACKED'` convention already used in `OrderDetailsScreen.js`. No accept/reject endpoint existed in the repo before this — confirm these strings match your backend.
2. **Push payload shape** — `IncomingOrderAlert` reads `order.earnings`, `order.pickup`, `order.delivery`, `order.orderNumber` (with `??` fallbacks). Make sure your backend's OneSignal `additionalData` includes `type: "incoming_order"` plus these fields.
3. **`order_alert.wav`** is now live as the channel sound and native ringtone loop — replace it if you want a different sound, but no code changes are needed to do so.
