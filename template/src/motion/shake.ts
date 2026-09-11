// origin: video-shotcraft assets/lib/helpers/shake.ts (Apache-2.0). Logic unchanged,
// usage note added below. See THIRD_PARTY_NOTICES.md for full attribution and change log.
/**
 * Deterministic hand-held camera noise. Layered sines at incommensurate
 * frequencies read as organic drift; amplitude in world units.
 * Dùng tiết chế: chỉ cho archive-documentary/history, không dùng cho
 * video sản phẩm/tin tức sáng màu (theo aesthetic-rules Q3 của Shotcraft).
 */
export const handheld = (frame: number, amp = 0.012): [number, number, number] => [
  amp * (Math.sin(frame * 0.31) + 0.6 * Math.sin(frame * 0.83 + 1.7)),
  amp * (Math.sin(frame * 0.47 + 0.9) + 0.5 * Math.sin(frame * 1.13 + 3.1)),
  0,
];
