/**
 * Sound cue schema + gain/ducking — ý tưởng lấy từ video-shotcraft
 * references/sound-design.md (cue array declarative {from,src,volume} và
 * hằng số gain kinh nghiệm), viết lại cho hệ đích nơi TTS luôn là lớp âm
 * thanh ưu tiên cao nhất (Shotcraft không có giọng đọc nên không có ví dụ
 * ducking TTS — phần ducking dưới đây là thiết kế mới).
 */

export type SfxType = "whoosh" | "impact" | "riser" | "sparkle" | "tick" | "none";

export interface SoundCue {
  frame: number; // frame cục bộ trong scene
  type: SfxType;
  src?: string; // staticFile path do người dùng tự cung cấp, tùy chọn
  gain?: number; // override DEFAULT_GAIN.sfx nếu cần
}

/** Gain mặc định: TTS luôn 1.0 (không bao giờ bị SFX/BGM che), BGM thấp hơn
 * Shotcraft (0.34) vì phải nhường chỗ giọng đọc liên tục, không chỉ nhạc nền
 * dưới caption ngắn như video quảng cáo câm. */
export const DEFAULT_GAIN: Record<"bgm" | "sfx" | "tts", number> = {
  bgm: 0.28,
  sfx: 0.5,
  tts: 1.0,
};

/**
 * BGM lùi âm lượng còn `duckTo` trong các khung TTS đang phát, ramp tuyến
 * tính `rampFrames` ở hai đầu mỗi cửa sổ. Trả về hệ số nhân áp cho volume
 * BGM tại `frame`.
 */
export function duckingEnvelope(
  frame: number,
  ttsWindows: Array<[number, number]>,
  base = DEFAULT_GAIN.bgm,
  duckTo = base * 0.35,
  rampFrames = 6,
): number {
  for (const [start, end] of ttsWindows) {
    if (frame < start - rampFrames || frame > end + rampFrames) continue;
    if (frame >= start && frame <= end) return duckTo;
    if (frame < start) {
      const t = (frame - (start - rampFrames)) / rampFrames;
      return base - (base - duckTo) * Math.min(1, Math.max(0, t));
    }
    const t = (frame - end) / rampFrames;
    return duckTo + (base - duckTo) * Math.min(1, Math.max(0, t));
  }
  return base;
}

/**
 * Giới hạn tần suất SFX "toàn khung" (impact/riser mạnh): tối đa 1 lần mỗi
 * 2 scene, không phát cho mọi motion nhỏ (đối chiếu R4 trong
 * video-shotcraft aesthetic-rules.md, điều chỉnh nhẹ hơn cho video ngắn).
 */
export function isSfxFrequencyOk(cues: SoundCue[], type: SfxType, minGapFrames: number): boolean {
  const matching = cues.filter((c) => c.type === type).sort((a, b) => a.frame - b.frame);
  for (let i = 1; i < matching.length; i++) {
    if (matching[i].frame - matching[i - 1].frame < minGapFrames) return false;
  }
  return true;
}
