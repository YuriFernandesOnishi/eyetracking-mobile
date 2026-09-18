package com.margelo.nitro.facelandmarker

import com.margelo.nitro.camera.HybridFrameSpec
import com.margelo.nitro.camera.NativeFrame
import com.margelo.nitro.core.NitroModules

/**
 * Nitro HybridObject implementation backing FaceLandmarkerPlugin.nitro.ts.
 * Bridges a VisionCamera Frame to GazeLandmarkerCore, which holds all the
 * actual MediaPipe logic and knows nothing about VisionCamera types.
 *
 * NOTE: `NativeFrame` / `HybridFrameSpec` package path and the
 * `.image.image` / `.orientation` property names below are based on the
 * react-native-vision-camera v5 "Native Frame Processor Plugins" guide
 * (which documents casting HybridFrameSpec -> NativeFrame to reach the
 * underlying ImageProxy) -- verify these exact property names compile
 * against the installed react-native-vision-camera version, since this
 * could not be checked against a real Android build in this environment.
 */
class HybridFaceLandmarkerPlugin : HybridFaceLandmarkerPluginSpec() {
  private val core: GazeLandmarkerCore by lazy {
    val context = NitroModules.applicationContext
      ?: throw IllegalStateException("NitroModules.applicationContext is not available yet")
    GazeLandmarkerCore(context)
  }

  override fun detect(frame: HybridFrameSpec): DoubleArray {
    val nativeFrame = frame as? NativeFrame ?: return DoubleArray(GazeLandmarkerCore.VECTOR_LENGTH)
    val imageProxy = nativeFrame.image
    val mediaImage = imageProxy.image ?: return DoubleArray(GazeLandmarkerCore.VECTOR_LENGTH)
    val rotationDegrees = imageProxy.imageInfo.rotationDegrees
    return core.detect(mediaImage, rotationDegrees)
  }
}
