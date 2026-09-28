package com.margelo.nitro.facelandmarker

import com.margelo.nitro.NitroModules
import com.margelo.nitro.camera.HybridFrameSpec
import com.margelo.nitro.camera.public.NativeFrame

/**
 * Nitro HybridObject implementation backing FaceLandmarkerPlugin.nitro.ts.
 * Bridges a VisionCamera Frame to GazeLandmarkerCore, which holds all the
 * actual MediaPipe logic and knows nothing about VisionCamera types.
 *
 * Confirmed on-device (Galaxy J7 Prime 2 / Android 9): `NativeFrame` lives
 * at `com.margelo.nitro.camera.public.NativeFrame` (not directly under
 * `com.margelo.nitro.camera`), and `NitroModules` at `com.margelo.nitro`
 * (not `com.margelo.nitro.core`) -- both differ from what the
 * react-native-vision-camera v5 docs implied.
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
