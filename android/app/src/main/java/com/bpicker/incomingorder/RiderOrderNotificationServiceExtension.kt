package com.bpicker.incomingorder

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat
import com.bpicker.MainActivity
import com.onesignal.notifications.INotificationReceivedEvent
import com.onesignal.notifications.INotificationServiceExtension

/**
 * Registered via the "com.onesignal.NotificationServiceExtension" meta-data tag in
 * AndroidManifest.xml. OneSignal calls this for every push it receives, regardless of
 * whether the app is foregrounded, backgrounded, or fully killed (JS is not guaranteed
 * to be running, so this customization has to happen natively).
 *
 * Only pushes carrying additionalData.type == "incoming_order" are touched; everything
 * else falls through to OneSignal's normal display behavior untouched.
 */
class RiderOrderNotificationServiceExtension : INotificationServiceExtension {

    companion object {
        const val CHANNEL_ID = "rider_orders"
        private const val NOTIFICATION_TYPE_KEY = "type"
        private const val NOTIFICATION_TYPE_VALUE = "incoming_order"
        private const val FULL_SCREEN_REQUEST_CODE = 9421
        private val VIBRATE_PATTERN = longArrayOf(0, 800, 400, 800, 400, 800)
    }

    override fun onNotificationReceived(event: INotificationReceivedEvent) {
        val notification = event.notification
        val additionalData = notification.additionalData ?: return

        if (additionalData.optString(NOTIFICATION_TYPE_KEY) != NOTIFICATION_TYPE_VALUE) {
            return
        }

        val context = event.context
        ensureChannel(context)

        notification.setExtender(
            NotificationCompat.Extender { builder ->
                builder
                    .setChannelId(CHANNEL_ID)
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setCategory(NotificationCompat.CATEGORY_CALL)
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                    .setVibrate(VIBRATE_PATTERN)
                    .setFullScreenIntent(buildFullScreenIntent(context, additionalData.toString()), true)
                builder
            }
        )
    }

    private fun ensureChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            return
        }

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        if (manager.getNotificationChannel(CHANNEL_ID) != null) {
            return
        }

        val soundUri = Uri.parse("android.resource://${context.packageName}/raw/order_alert")
        val channel = NotificationChannel(CHANNEL_ID, "Rider Orders", NotificationManager.IMPORTANCE_HIGH).apply {
            description = "Incoming delivery order alerts"
            enableVibration(true)
            vibrationPattern = VIBRATE_PATTERN
            enableLights(true)
            lightColor = Color.RED
            lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            setBypassDnd(true)
            setSound(
                soundUri,
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            )
        }
        manager.createNotificationChannel(channel)
    }

    private fun buildFullScreenIntent(context: Context, payloadJson: String): PendingIntent {
        val uri = Uri.parse("bpicker://incoming-order?order=" + Uri.encode(payloadJson))
        val intent = Intent(Intent.ACTION_VIEW, uri).apply {
            setClass(context, MainActivity::class.java)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
        }
        return PendingIntent.getActivity(
            context,
            FULL_SCREEN_REQUEST_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }
}
