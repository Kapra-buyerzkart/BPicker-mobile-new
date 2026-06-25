package com.bpicker

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // add(MyReactNativePackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    createOrderAlertChannel()
  }

  /**
   * Creates notification channels with the custom order_alert sound.
   *
   * We create TWO channels:
   * 1. "order_alerts" — our explicit channel (used when android_channel_id is set in the payload)
   * 2. "fcm_fallback_notification_channel" — Firebase's default channel. If we don't create it
   *    first, Firebase auto-creates it with the system default sound. By beating it to the punch
   *    we get our custom sound on ALL notifications.
   */
  private fun createOrderAlertChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val soundUri: Uri = Uri.parse(
        "android.resource://${packageName}/raw/order_alert"
      )

      val audioAttributes = AudioAttributes.Builder()
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
        .build()

      val notificationManager = getSystemService(NotificationManager::class.java)

      // 1. Our explicit channel
      val orderChannel = NotificationChannel(
        "order_alerts",
        "Order Alerts",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Notifications for new incoming orders"
        setSound(soundUri, audioAttributes)
        enableVibration(true)
        vibrationPattern = longArrayOf(0, 300, 200, 300)
      }
      notificationManager?.createNotificationChannel(orderChannel)

      // 2. Firebase/FCM fallback channel — must be created BEFORE any FCM message arrives
      val fcmFallbackChannel = NotificationChannel(
        "fcm_fallback_notification_channel",
        "Order Notifications",
        NotificationManager.IMPORTANCE_HIGH
      ).apply {
        description = "Default notification channel for incoming orders"
        setSound(soundUri, audioAttributes)
        enableVibration(true)
        vibrationPattern = longArrayOf(0, 300, 200, 300)
      }
      notificationManager?.createNotificationChannel(fcmFallbackChannel)
    }
  }
}
