package com.margelo.nitro.facelandmarker

import android.content.Context
import android.media.Image
import com.google.mediapipe.framework.image.MediaImageBuilder
import com.google.mediapipe.tasks.core.BaseOptions
import com.google.mediapipe.tasks.vision.core.ImageProcessingOptions
import com.google.mediapipe.tasks.vision.core.RunningMode
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarker

/**
 * Wraps MediaPipe's FaceLandmarker (iris-refined, 478-point face mesh) and
 * exposes a plain flat-array API so this class has zero dependency on
 * react-native-vision-camera types. That keeps it reusable if the
 * VisionCamera integration layer (HybridFaceLandmarkerPlugin) ever needs to
 * be swapped out -- e.g. for the classic FrameProcessorPluginRegistry API
 * instead of Nitro -- without touching any MediaPipe logic.
 *
 * Landmark indices below follow MediaPipe's standard 478-point face mesh
 * (iris landmarks included by default in the "face_landmarker" model
 * bundle). The "EyeA"/"EyeB" labels are deliberately NOT "right"/"left":
 * community references disagree on which anatomical eye index 468 vs 473
 * corresponds to (subject's-left vs image-left convention). Since
 * src/gaze/featureExtraction.ts only ever averages the two eyes' ratios,
 * this ambiguity has no functional effect -- verify visually on-device
 * (e.g. close one eye and see which iris landmark stops moving) before
 * ever adding per-eye-specific logic.
 */
class GazeLandmarkerCore(context: Context) {
  companion object {
    const val VECTOR_LENGTH = 18

    private const val EYE_A_IRIS = 468
    private const val EYE_A_OUTER = 33
    private const val EYE_A_INNER = 133
    private const val EYE_A_UPPER = 159
    private const val EYE_A_LOWER = 145

    private const val EYE_B_IRIS = 473
    private const val EYE_B_OUTER = 263
    private const val EYE_B_INNER = 362
    private const val EYE_B_UPPER = 386
    private const val EYE_B_LOWER = 374

    private const val MODEL_ASSET_PATH = "face_landmarker.task"
  }

  private val faceLandmarker: FaceLandmarker =
    FaceLandmarker.createFromOptions(
      context,
      FaceLandmarker.FaceLandmarkerOptions.builder()
        .setBaseOptions(BaseOptions.builder().setModelAssetPath(MODEL_ASSET_PATH).build())
        .setRunningMode(RunningMode.IMAGE)
        .setNumFaces(1)
        .setMinFaceDetectionConfidence(0.5f)
        .setMinFacePresenceConfidence(0.5f)
        .setMinTrackingConfidence(0.5f)
        .build()
    )

  /**
   * Runs detection on a single camera frame. [rotationDegrees] should come
   * from the frame's own orientation metadata (e.g. ImageProxy.imageInfo
   * .rotationDegrees on the VisionCamera side) -- MediaPipe does not infer
   * this itself, and a wrong value will silently produce plausible-looking
   * but rotated/wrong landmark coordinates. Never throws: returns an
   * all-zero vector (faceFound = 0) on any failure or when no face is
   * detected.
   */
  fun detect(mediaImage: Image, rotationDegrees: Int): DoubleArray {
    val notFound = DoubleArray(VECTOR_LENGTH)
    return try {
      val mpImage = MediaImageBuilder(mediaImage).build()
      val processingOptions = ImageProcessingOptions.builder().setRotationDegrees(rotationDegrees).build()
      val result = faceLandmarker.detect(mpImage, processingOptions)
      val faces = result.faceLandmarks()
      if (faces.isEmpty()) return notFound

      val landmarks = faces[0]
      fun lx(i: Int) = landmarks[i].x().toDouble()
      fun ly(i: Int) = landmarks[i].y().toDouble()

      val irisAx = lx(EYE_A_IRIS)
      val irisAy = ly(EYE_A_IRIS)
      val irisBx = lx(EYE_B_IRIS)
      val irisBy = ly(EYE_B_IRIS)
      val interPupillaryDistance = kotlin.math.hypot(irisAx - irisBx, irisAy - irisBy)

      doubleArrayOf(
        1.0,
        irisAx, irisAy,
        irisBx, irisBy,
        lx(EYE_A_OUTER), ly(EYE_A_OUTER), lx(EYE_A_INNER), ly(EYE_A_INNER),
        lx(EYE_B_OUTER), ly(EYE_B_OUTER), lx(EYE_B_INNER), ly(EYE_B_INNER),
        ly(EYE_A_UPPER), ly(EYE_A_LOWER),
        ly(EYE_B_UPPER), ly(EYE_B_LOWER),
        interPupillaryDistance
      )
    } catch (_: Exception) {
      notFound
    }
  }

  fun close() {
    faceLandmarker.close()
  }
}
