/**
 * Tiện ích phụ đề dùng chung: ngắt câu theo dấu câu tiếng Việt
 * (thay vì cắt cứng theo số từ làm đứt giữa câu).
 *
 * - Câu ngắn (dưới maxWords từ) hiển thị nguyên vẹn cả dấu câu.
 * - Câu dài hơn được tách tại dấu phẩy/dấu chấm phẩy gần giữa câu nhất,
 *   mỗi vế vẫn là một đoạn ngắt nghỉ đúng chỗ.
 * - Thời lượng hiển thị từng câu được chia theo tỉ lệ độ dài (số từ),
 *   giúp phụ đề bám sát nhịp đọc thay vì chia đều dẫn tới lệch dần.
 */

/** Cắt văn bản thành các câu, giữ nguyên dấu kết câu. */
function splitSentences(text: string): string[] {
  // Ngắt tại . ! ? … nhưng không ngắt với các số thập phân (3.5) hay viết tắt thông thường
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const parts = normalized
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : [normalized];
}

/** Tách một câu dài tại dấu phẩy gần giữa nhất (hoặc tại khoảng trắng nếu không có phẩy). */
function breakLongSentence(sentence: string, maxWords: number): string[] {
  const words = sentence.split(" ");
  if (words.length <= maxWords) return [sentence];

  const mid = Math.ceil(words.length / 2);

  // Tìm dấu phẩy / chấm phẩy gần vị trí giữa câu nhất
  let bestBreak = -1;
  let bestDist = Infinity;
  words.forEach((w, i) => {
    if (i < 2 || i > words.length - 3) return; // tránh cắt hai đầu câu
    if (/[,;:]$/.test(w)) {
      const dist = Math.abs(i + 1 - mid);
      if (dist < bestDist) {
        bestDist = dist;
        bestBreak = i + 1;
      }
    }
  });

  // Không có dấu phẩy: cắt tại khoảng trắng gần giữa
  if (bestBreak === -1) bestBreak = mid;

  const first = words.slice(0, bestBreak).join(" ");
  const rest = words.slice(bestBreak).join(" ");

  // Đảm bảo vế đầu không thành câu cụt không dấu: nếu cắt tại khoảng trắng,
  // thêm dấu phẩy vào cuối vế đầu để giữ ngữ điệu tự nhiên
  const firstWithPunct = /[.!?…,;:]$/.test(first) ? first : `${first},`;

  return [firstWithPunct, ...breakLongSentence(rest, maxWords)];
}

/** Chia phụ đề theo câu: 1 câu = 1 dòng hiển thị, câu dài tách tại dấu phẩy. */
export function chunkSentences(text: string, maxWords = 12): string[] {
  const sentences = splitSentences(text);
  const chunks: string[] = [];

  for (const sentence of sentences) {
    chunks.push(...breakLongSentence(sentence, maxWords));
  }

  // Gộp các câu quá ngắn (≤ 3 từ) với câu kế tiếp cho đỡ chớp nháy
  const merged: string[] = [];
  for (const chunk of chunks) {
    const wordCount = chunk.split(" ").length;
    const prev = merged[merged.length - 1];
    if (prev && (prev.split(" ").length <= 3 || wordCount <= 3) &&
        prev.split(" ").length + wordCount <= maxWords) {
      merged[merged.length - 1] = `${prev} ${chunk}`;
    } else {
      merged.push(chunk);
    }
  }

  return merged.length > 0 ? merged : [text.trim() || ""];
}

/** Vị trí bắt đầu (frame) của từng cụm phụ đề, chia theo tỉ lệ số từ. */
export function getChunkStartFrames(chunks: string[], durationInFrames: number): number[] {
  const weights = chunks.map((c) => Math.max(c.split(" ").length, 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);

  const starts: number[] = [];
  let acc = 0;
  for (const w of weights) {
    starts.push(Math.round((acc / totalWeight) * durationInFrames));
    acc += w;
  }
  return starts;
}

/** Tìm index cụm phụ đề đang hiển thị tại frame hiện tại. */
export function getActiveChunkIndex(chunks: string[], durationInFrames: number, frame: number): number {
  const starts = getChunkStartFrames(chunks, durationInFrames);
  let index = 0;
  for (let i = 0; i < starts.length; i++) {
    if (frame >= starts[i]) index = i;
  }
  return Math.min(index, chunks.length - 1);
}

// ============================================================================
// Single-line width-fit caption (NEW DEFAULT cho video mới — xem SKILL.md
// "chuẩn caption skill-wide"). `chunkSentences` ở trên chỉ đếm SỐ TỪ, không
// ước lượng bề rộng thật — với font/size nhất định, câu vẫn có thể tự xuống
// dòng ở CSS nếu không ép whiteSpace:nowrap (bug thực tế gặp phải: caption
// mono 58px + chunk 13 từ tạo khối nhiều dòng chiếm nửa màn hình). Các hàm
// dưới đây CHỈ ĐƯỢC BỔ SUNG, không sửa hàm cũ — composition cũ tiếp tục dùng
// chunkSentences/getChunkStartFrames/getActiveChunkIndex y nguyên, không bị
// ảnh hưởng. Composition MỚI nên dùng splitIntoCaptionCues + fitFontSize +
// CSS whiteSpace:'nowrap' để đảm bảo TOÁN HỌC (không phải hy vọng) rằng mỗi
// cue chỉ chiếm đúng 1 dòng.
const NARROW_CHARS = new Set("iIljJ.,;:'’`|!ì".split(""));
const WIDE_LOWER_CHARS = new Set("mwMW".split(""));
const DIGIT_CHARS = new Set("0123456789".split(""));

function charWeight(ch: string): number {
  if (ch === " ") return 0.28;
  if (NARROW_CHARS.has(ch)) return 0.26;
  if (WIDE_LOWER_CHARS.has(ch)) return 0.82;
  if (DIGIT_CHARS.has(ch)) return 0.58;
  const isUpper = ch === ch.toUpperCase() && ch !== ch.toLowerCase();
  if (isUpper) return 0.66;
  return 0.54;
}

/** Bù sai số ước lượng heuristic so với đo canvas thật — luôn nới rộng lên,
 * không bao giờ đánh giá THẤP hơn thực tế (tránh tràn dòng khi render). */
export const CAPTION_SAFETY_FACTOR = 1.1;
export const CAPTION_MAX_FONT_PX = 46;
export const CAPTION_MIN_FONT_PX = 38;
export const CAPTION_MAX_WIDTH_PX = 820;
export const CAPTION_PILL_MAX_HEIGHT_PX = 108;

/** Ước lượng bề rộng text (px) không cần canvas thật — per-character weight
 * theo class ký tự, scale theo fontSize, nhân safety factor. */
export function estimateCaptionWidthPx(text: string, fontSizePx: number): number {
  let sum = 0;
  for (const ch of text) sum += charWeight(ch);
  return sum * fontSizePx * CAPTION_SAFETY_FACTOR;
}

export interface FitCaptionFontOptions {
  maxWidthPx: number;
  maxFontPx?: number;
  minFontPx?: number;
  stepPx?: number;
}

/** Chọn cỡ chữ lớn nhất vừa đúng 1 dòng trong maxWidthPx, không dưới
 * minFontPx. Nếu ngay cả minFontPx cũng không vừa, trả `overflow=true` —
 * đây là tín hiệu lỗi ở chunker (phải tách cue nhỏ hơn), không phải hành vi
 * mong đợi khi dùng cùng với `splitIntoCaptionCues`. */
export function fitCaptionFontSize(text: string, opts: FitCaptionFontOptions): { fontSizePx: number; overflow: boolean } {
  const { maxWidthPx, maxFontPx = CAPTION_MAX_FONT_PX, minFontPx = CAPTION_MIN_FONT_PX, stepPx = 2 } = opts;
  for (let f = maxFontPx; f >= minFontPx; f -= stepPx) {
    if (estimateCaptionWidthPx(text, f) <= maxWidthPx) return { fontSizePx: f, overflow: false };
  }
  return { fontSizePx: minFontPx, overflow: estimateCaptionWidthPx(text, minFontPx) > maxWidthPx };
}

export interface CaptionCue {
  text: string;
  words: number;
}

const BREAK_PREFERRED_AFTER = new Set(["và", "nhưng", "hoặc", "vì", "để", "nếu", "rồi", "còn", "sau", "khi"]);

function fitSentenceToOneLineChunks(sentence: string, planningFontPx: number, maxWidthPx: number): string[] {
  const words = sentence.split(" ").filter(Boolean);
  const lines: string[] = [];
  let current: string[] = [];

  for (const word of words) {
    const candidate = [...current, word];
    const candidateWidth = estimateCaptionWidthPx(candidate.join(" "), planningFontPx);
    if (candidateWidth <= maxWidthPx || current.length === 0) {
      current.push(word);
      continue;
    }
    lines.push(current.join(" "));
    current = [word];
  }
  if (current.length) lines.push(current.join(" "));

  const merged: string[] = [];
  for (const line of lines) {
    const prev = merged[merged.length - 1];
    const prevLastWord = prev?.split(" ").pop()?.replace(/[,.]$/, "").toLowerCase();
    if (
      prev &&
      line.split(" ").length <= 2 &&
      prevLastWord &&
      !BREAK_PREFERRED_AFTER.has(prevLastWord) &&
      estimateCaptionWidthPx(`${prev} ${line}`, planningFontPx) <= maxWidthPx * 1.05
    ) {
      merged[merged.length - 1] = `${prev} ${line}`;
    } else {
      merged.push(line);
    }
  }
  return merged;
}

/**
 * Chia narration thành cue MỘT DÒNG THẬT SỰ (khác `chunkSentences` ở trên):
 * cắt theo BỀ RỘNG ƯỚC LƯỢNG THẬT tại `planningFontPx` (mặc định = cỡ chữ
 * lớn nhất renderer sẽ dùng), không phải đếm từ. Nếu 1 câu dài hơn
 * maxWidthPx, TÁCH THÀNH CUE KẾ TIẾP — không bao giờ dựa vào giảm chữ để
 * "nhét vừa" (component render vẫn phải tự ép `whiteSpace:'nowrap'` làm
 * lưới an toàn cuối, hàm này chỉ đảm bảo phần chia cue đúng về mặt toán học).
 */
export function splitIntoCaptionCues(text: string, planningFontPx = CAPTION_MAX_FONT_PX, maxWidthPx = CAPTION_MAX_WIDTH_PX): CaptionCue[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];
  const sentences = splitSentences(normalized);
  const cues: string[] = [];
  for (const sentence of sentences.length ? sentences : [normalized]) {
    cues.push(...fitSentenceToOneLineChunks(sentence, planningFontPx, maxWidthPx));
  }
  return cues.map((c) => ({ text: c, words: c.split(" ").length }));
}

/** Điểm bắt đầu (frame) mỗi cue, chia theo tỉ lệ số từ (bám nhịp đọc TTS). */
export function captionCueStartFrames(cues: CaptionCue[], durationInFrames: number): number[] {
  const total = cues.reduce((a, c) => a + c.words, 0) || 1;
  let acc = 0;
  return cues.map((c) => {
    const start = Math.round((acc / total) * durationInFrames);
    acc += c.words;
    return start;
  });
}
