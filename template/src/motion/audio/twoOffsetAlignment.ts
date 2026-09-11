/**
 * Two-offset SFX alignment: an SFX cue's AUDIBLE attack can drift from the
 * frame you intended for two independent, real reasons —
 *   1. per-file source-peak lag: the attack transient inside the audio file
 *      itself isn't at sample 0 (`leadingSilenceMs` in the audio manifest,
 *      measured by `vendor/shotcraft/scripts/measure-audio.mjs` via ffmpeg
 *      silencedetect).
 *   2. AAC output-track priming: the encoder can shift the whole rendered
 *      audio track by a small, codec/samplerate/container-dependent offset.
 *      This is NOT a fixed universal constant — it must be re-measured per
 *      Remotion/ffmpeg version. `DEFAULT_AAC_PRIMING_MS` below is the value
 *      empirically measured against Remotion 4.0.520's h264/aac output on
 *      this repo (see `scripts/shotcraft/verify-cue-alignment.mjs` and its
 *      test, which measured a ~70ms residual after compensating (1) alone,
 *      on a 30fps/48kHz render) — treat it as a starting point, not gospel.
 */

/** Empirically measured residual after compensating source-peak lag alone —
 * re-measure with `verify-cue-alignment.mjs` if you change Remotion version,
 * fps, sample rate, or container. */
export const DEFAULT_AAC_PRIMING_MS = 70;

/**
 * Computes the `<Sequence from={...}>` frame to place an SFX cue so its
 * AUDIBLE attack lands as close as possible to `intendedActionFrame`.
 * Compensates source-peak lag (subtracts it, since starting the file
 * earlier makes the attack land later relative to file-start) — priming
 * offset is a post-render encoder artifact, not something a pre-render
 * `Sequence.from` can compensate for; it must be verified after rendering
 * via `verify-cue-alignment.mjs`, not fought at authoring time.
 */
export function sfxCueStartFrame(intendedActionFrame: number, fps: number, leadingSilenceMs: number): number {
  const leadFrames = Math.round((leadingSilenceMs / 1000) * fps);
  return Math.max(0, intendedActionFrame - leadFrames);
}
