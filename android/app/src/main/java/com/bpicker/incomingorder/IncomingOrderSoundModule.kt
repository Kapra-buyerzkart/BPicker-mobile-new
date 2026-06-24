package com.bpicker.incomingorder

import android.media.AudioAttributes
import android.media.MediaPlayer
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Loops the rider order alert ringtone (res/raw/order_alert) natively so it keeps playing
 * reliably while the IncomingOrderAlert UI is on screen. Guards against creating more than
 * one MediaPlayer instance at a time.
 */
class IncomingOrderSoundModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var mediaPlayer: MediaPlayer? = null

    override fun getName(): String = "IncomingOrderSound"

    @ReactMethod
    fun start() {
        if (mediaPlayer != null) {
            return
        }

        val context = reactApplicationContext
        val resId = context.resources.getIdentifier("order_alert", "raw", context.packageName)
        if (resId == 0) {
            return
        }

        try {
            val player = MediaPlayer.create(context, resId)
            if (player == null) {
                return
            }
            player.setAudioAttributes(
                AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            )
            player.isLooping = true
            player.start()
            mediaPlayer = player
        } catch (_: Exception) {
            mediaPlayer = null
        }
    }

    @ReactMethod
    fun stop() {
        val player = mediaPlayer ?: return
        mediaPlayer = null
        try {
            if (player.isPlaying) {
                player.stop()
            }
        } catch (_: Exception) {
            // ignore - player may already be in an invalid state
        } finally {
            player.release()
        }
    }

    override fun invalidate() {
        super.invalidate()
        stop()
    }
}
