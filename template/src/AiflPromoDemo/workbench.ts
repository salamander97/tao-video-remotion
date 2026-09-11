// Workbench manifest for AiflPromoDemo — same-origin principle (per
// vendor/shotcraft/workbench.md §2): every table below is `import`ed
// straight from Main.tsx, never re-typed, so the manifest can never drift
// from what actually renders.
import { AIFL_SHOTS, AIFL_TOTAL, SFX, CAPTIONS, TITLE_CARDS, parseWords } from "./Main";
import { SceneOpen } from "./live/SceneOpen";
import { SceneFlyIn } from "./live/SceneFlyIn";
import { SceneDetail } from "./live/SceneDetail";
import { ScenePapers } from "./live/ScenePapers";
import { SceneWbr } from "./live/SceneWbr";
import { SceneOutroLive } from "./live/SceneOutroLive";
import { PaperTitleCard } from "./PaperTitleCard";
import { Caption } from "./Caption";
import { AiflMain } from "./Main";
import type { WorkbenchManifest } from "../../../workbench/src/cards/manifest";

const titleCardUnit = (id: string, from: number, duration: number, key: keyof typeof TITLE_CARDS) => ({
  id,
  label: `Title card — ${key}`,
  from,
  duration,
  component: PaperTitleCard as React.ComponentType<Record<string, unknown>>,
  props: { duration, words: parseWords(TITLE_CARDS[key].text) },
  cardId: "title-card",
  cardName: "Title card",
});

export const WORKBENCH: WorkbenchManifest = {
  name: "Ink Press · AIFL promo",
  fps: 30,
  width: 1920,
  height: 1080,
  total: AIFL_TOTAL,
  background: "#f2eee6",
  shots: [
    { id: "morning", label: "S1 brand open", from: AIFL_SHOTS.morning.from, duration: AIFL_SHOTS.morning.duration, component: SceneOpen as React.ComponentType<Record<string, unknown>> },
    titleCardUnit("card1", AIFL_SHOTS.card1.from, AIFL_SHOTS.card1.duration, "card1"),
    { id: "table", label: "S2 deck fly-in", from: AIFL_SHOTS.table.from, duration: AIFL_SHOTS.table.duration, component: SceneFlyIn as React.ComponentType<Record<string, unknown>> },
    { id: "macro", label: "S3 detail macro", from: AIFL_SHOTS.macro.from, duration: AIFL_SHOTS.macro.duration, component: SceneDetail as React.ComponentType<Record<string, unknown>> },
    titleCardUnit("card2", AIFL_SHOTS.card2.from, AIFL_SHOTS.card2.duration, "card2"),
    { id: "chart", label: "S4 papers radar", from: AIFL_SHOTS.chart.from, duration: AIFL_SHOTS.chart.duration, component: ScenePapers as React.ComponentType<Record<string, unknown>> },
    titleCardUnit("cardWbr", AIFL_SHOTS.cardWbr.from, AIFL_SHOTS.cardWbr.duration, "cardWbr"),
    { id: "wbr", label: "S5 weekly report", from: AIFL_SHOTS.wbr.from, duration: AIFL_SHOTS.wbr.duration, component: SceneWbr as React.ComponentType<Record<string, unknown>> },
    titleCardUnit("card3", AIFL_SHOTS.card3.from, AIFL_SHOTS.card3.duration, "card3"),
    { id: "outro", label: "S6 outro sign-off", from: AIFL_SHOTS.outro.from, duration: AIFL_SHOTS.outro.duration, component: SceneOutroLive as React.ComponentType<Record<string, unknown>> },
  ],
  captions: CAPTIONS.map((c, i) => ({
    id: `caption-${i}`,
    label: c.text,
    from: c.from,
    duration: c.duration,
    component: Caption as unknown as React.ComponentType<Record<string, unknown>>,
    props: { text: c.text, duration: c.duration },
  })),
  sfx: SFX.map((s) => ({ from: s.from, duration: 90, src: `audio/${s.src}`, volume: s.volume })),
  original: AiflMain,
};
