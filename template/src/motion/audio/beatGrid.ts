/**
 * Lưới beat thuần toán học — lấy khái niệm beatF(n) từ video-shotcraft
 * references/music-beat-sync.md nhưng KHÔNG dùng librosa/Python. BPM do
 * người dùng cung cấp thủ công (đo bằng tai/DAW) khi có nhạc nền; không bắt
 * buộc dùng. Chỉ được dùng để căn THỜI ĐIỂM transition/SFX phụ — không bao
 * giờ dùng để tính lại durationInFrames của scene (TTS vẫn là nguồn timing
 * chính, xem ràng buộc #4 trong docs/shotcraft-integration-plan.md).
 */

export interface BeatGridConfig {
  bpm: number;
  phaseSec: number; // thời điểm beat đầu tiên tính bằng giây trong file nhạc
  fps: number;
}

export const beatIntervalSec = (bpm: number): number => 60 / bpm;

export const beatTimeSec = (config: BeatGridConfig, n: number): number =>
  config.phaseSec + n * beatIntervalSec(config.bpm);

export const beatFrame = (config: BeatGridConfig, n: number): number =>
  Math.round(beatTimeSec(config, n) * config.fps);

/** Beat gần nhất (làm tròn xuống) tại một frame cho trước — dùng để "nam châm" transition vào beat gần nhất, sai số tối đa nửa nhịp. */
export const nearestBeatIndex = (config: BeatGridConfig, frame: number): number => {
  const sec = frame / config.fps;
  return Math.round((sec - config.phaseSec) / beatIntervalSec(config.bpm));
};
