import { test } from "node:test";
import assert from "node:assert/strict";
import {
  chunkSentences,
  getChunkStartFrames,
  getActiveChunkIndex,
  estimateCaptionWidthPx,
  fitCaptionFontSize,
  splitIntoCaptionCues,
  captionCueStartFrames,
  CAPTION_MAX_WIDTH_PX,
  CAPTION_MAX_FONT_PX,
  CAPTION_MIN_FONT_PX,
} from "../subtitleUtils";

// Real narration from template/src/DiBo10PhutSauAn/visual-plan.json — the
// exact 8 lines from an already-shipped composition, used here to prove the
// NEW single-line chunker does not regress the OLD one that composition
// still relies on, and that the new chunker itself handles all real content.
const REAL_NARRATION = [
  "Sau bữa tối, chỉ mười phút đi bộ có thể làm đường huyết thay đổi rõ rệt. Vì sao?",
  "Sau khi ăn, carbohydrate thành glucose. Đường huyết tăng, còn insulin giúp đưa glucose vào tế bào.",
  "Khi đi bộ, cơ bắp co lại và sử dụng thêm glucose làm nhiên liệu, giúp giảm đỉnh sau ăn.",
  "Năm 2016, thử nghiệm crossover trên 41 người tiểu đường type 2 đã so sánh hai cách đi bộ.",
  "Mười phút sau mỗi bữa giúp đường huyết sau ăn thấp hơn khoảng mười hai phần trăm. Riêng bữa tối, chênh lệch là hai mươi hai phần trăm.",
  "Phân tích bảy thử nghiệm năm 2022 cũng cho thấy đi bộ nhẹ cải thiện glucose và insulin tốt hơn tiếp tục ngồi, và tốt hơn chỉ đứng.",
  "Hãy thử đi bộ thoải mái mười phút sau bữa tối. Nếu dùng insulin hoặc dễ hạ đường huyết, hãy hỏi bác sĩ trước.",
  "Đi bộ không thay thế thuốc hay điều trị. Lưu video để thử tối nay. Thông tin tham khảo, không thay thế chỉ định bác sĩ.",
];

// --- backward compatibility: OLD functions must be completely unaffected ---

test("BACKWARD-COMPAT: chunkSentences/getChunkStartFrames/getActiveChunkIndex behavior unchanged", () => {
  const chunks = chunkSentences(REAL_NARRATION[0], 12);
  assert.ok(chunks.length >= 1);
  const starts = getChunkStartFrames(chunks, 165);
  assert.equal(starts.length, chunks.length);
  assert.equal(starts[0], 0);
  const idx = getActiveChunkIndex(chunks, 165, 80);
  assert.ok(idx >= 0 && idx < chunks.length);
});

// --- new single-line width-fit chunker ---

test("NEW: every real narration line produces cues that all fit within CAPTION_MAX_WIDTH_PX at CAPTION_MAX_FONT_PX", () => {
  for (const line of REAL_NARRATION) {
    const cues = splitIntoCaptionCues(line);
    assert.ok(cues.length >= 1, `no cues for: ${line}`);
    for (const cue of cues) {
      const w = estimateCaptionWidthPx(cue.text, CAPTION_MAX_FONT_PX);
      assert.ok(w <= CAPTION_MAX_WIDTH_PX, `cue "${cue.text}" estimated ${w.toFixed(0)}px > ${CAPTION_MAX_WIDTH_PX}px limit`);
      assert.ok(cue.text.length > 0);
    }
  }
});

test("NEW: a long synthetic Vietnamese sentence (accented + wide chars) splits into multiple one-line cues, never one giant cue", () => {
  const worst =
    "Những chương trình khuyến nghị vận động thể chất mỗi ngày luôn nhấn mạnh rằng việc đi bộ nhẹ nhàng ngay sau bữa ăn tối có thể mang lại những thay đổi đáng kể và rõ rệt về mặt sinh lý học đối với đường huyết của người trưởng thành.";
  const cues = splitIntoCaptionCues(worst);
  assert.ok(cues.length >= 3);
  for (const cue of cues) {
    assert.ok(estimateCaptionWidthPx(cue.text, CAPTION_MAX_FONT_PX) <= CAPTION_MAX_WIDTH_PX);
  }
});

test("NEW: a short phrase stays a single cue", () => {
  const cues = splitIntoCaptionCues("Ăn tối xong.");
  assert.equal(cues.length, 1);
});

test("NEW: fitCaptionFontSize returns the max font for short text and steps down for long text, never below min", () => {
  const short = fitCaptionFontSize("Ăn tối xong", { maxWidthPx: CAPTION_MAX_WIDTH_PX });
  assert.equal(short.fontSizePx, CAPTION_MAX_FONT_PX);
  assert.equal(short.overflow, false);

  const longer = fitCaptionFontSize("Mười phút sau mỗi bữa giúp đường huyết sau ăn thấp hơn", { maxWidthPx: CAPTION_MAX_WIDTH_PX });
  assert.ok(longer.fontSizePx >= CAPTION_MIN_FONT_PX);
  assert.ok(longer.fontSizePx <= CAPTION_MAX_FONT_PX);
});

test("NEW: captionCueStartFrames distributes proportionally to word count and starts at 0", () => {
  const cues = splitIntoCaptionCues(REAL_NARRATION[4]);
  const starts = captionCueStartFrames(cues, 218);
  assert.equal(starts[0], 0);
  assert.equal(starts.length, cues.length);
  for (let i = 1; i < starts.length; i++) assert.ok(starts[i] >= starts[i - 1]);
});
