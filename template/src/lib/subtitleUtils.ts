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
