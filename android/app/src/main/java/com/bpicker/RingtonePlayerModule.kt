package com.bpicker

import android.media.AudioAttributes
import android.media.MediaPlayer
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Plays the bundled `order_alert` sound on demand.
 *
 * The notification channels in [MainApplication] already ring when the OS posts a
 * notification (i.e. while the app is backgrounded). When the app is in the foreground
 * OneSignal hands the notification to JS via `foregroundWillDisplay` and the channel
 * sound does not play, so we trigger the same alert sound explicitly from there.
 */
class RingtonePlayerModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private var mediaPlayer: MediaPlayer? = null

  override fun getName(): String = NAME

  @ReactMethod
  fun playOrderAlert() {
    val context = reactApplicationContext
    val resId = context.resources.getIdentifier("order_alert", "raw", context.packageName)
    if (resId == 0) {
      return
    }

    try {
      // Release any previous instance so repeated alerts don't overlap.
      releasePlayer()

      val attributes = AudioAttributes.Builder()
        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
        .setUsage(AudioAttributes.USAGE_NOTIFICATION)
        .build()

      val player = MediaPlayer.create(context, resId) ?: return
      player.setAudioAttributes(attributes)
      player.setOnCompletionListener {
        it.release()
        if (mediaPlayer === it) {
          mediaPlayer = null
        }
      }
      player.start()
      mediaPlayer = player
    } catch (e: Exception) {
      releasePlayer()
    }
  }

  @ReactMethod
  fun stop() {
    releasePlayer()
  }

  override fun invalidate() {
    releasePlayer()
    super.invalidate()
  }

  private fun releasePlayer() {
    mediaPlayer?.let {
      try {
        if (it.isPlaying) {
          it.stop()
        }
      } catch (_: Exception) {
        // Player may already be in an invalid state; ignore.
      }
      it.release()
    }
    mediaPlayer = null
  }

  companion object {
    const val NAME = "RingtonePlayer"
  }
}
