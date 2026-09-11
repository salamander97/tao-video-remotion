import { AbsoluteFill, Audio, Sequence, staticFile } from 'remotion';
import { SceneOpen } from './live/SceneOpen';
import { SceneFlyIn } from './live/SceneFlyIn';
import { SceneDetail } from './live/SceneDetail';
import { ScenePapers } from './live/ScenePapers';
import { SceneWbr } from './live/SceneWbr';
import { PaperTitleCard } from './PaperTitleCard';
import { SceneOutroLive } from './live/SceneOutroLive';
import { FlashCut } from './FlashCut';
import { Caption } from './Caption';

// ~36.2s @ 30fps — paper-and-ink morning reading room (10 shots). Both wordmark
// moments (brand open, outro sign-off) hold a full second once fully on.
export const AIFL_SHOTS = {
  morning: { from: 0, duration: 220 },  // 0–7.3s  brand ~46f + 30f hold + 138f macro
  card1: { from: 220, duration: 55 },   // 7.3–9.2s "All your team's research, one place to go."
  table: { from: 275, duration: 190 },  // 9.2–15.5s pile close-up → deal → scroll → search → filter → click
  macro: { from: 465, duration: 100 },  // 15.5–18.8s macro card detail, rows reveal
  card2: { from: 565, duration: 55 },   // 18.8–20.7s "Paper Radar, tailored for your morning reading."
  chart: { from: 620, duration: 105 },  // 20.7–24.2s papers stack radar
  cardWbr: { from: 725, duration: 50 }, // 24.2–25.8s "Every project, linked to your weekly report."
  wbr: { from: 775, duration: 110 },    // 25.8–29.5s weekly report / collaborative write
  card3: { from: 885, duration: 55 },   // 29.5–31.3s "The whole team, on the same page."
  outro: { from: 940, duration: 145 },  // 31.3–36.2s defocus + letterpress sign-off (+1s hold)
} as const; // sum = 1085

export const AIFL_TOTAL = 1085;

// title-card copy: space-separated words, `*word*` = amber italic accent. Single
// source for the render below and for the workbench manifest (workbench.ts).
export const TITLE_CARDS = {
  card1: { text: 'All your team’s research, *one* place to go.' },
  card2: { text: 'Paper *Radar,* tailored for your morning reading.', sub: 'of 31 fetched today', subDigits: '5' },
  cardWbr: { text: 'Every project, *linked* to your weekly report.' },
  card3: { text: 'The whole team, on the *same* page.' },
} as const;

export const parseWords = (text: string): { text: string; accent?: boolean }[] =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => {
      const m = w.match(/^\*(.+)\*$/);
      return m ? { text: m[1], accent: true } : { text: w };
    });

// warm flash cuts straddle these hard cuts (from = cut − 5, 10f long)
export const FLASH_CUTS = [AIFL_SHOTS.table.from, AIFL_SHOTS.macro.from, AIFL_SHOTS.chart.from, AIFL_SHOTS.wbr.from];

// keyboard: 24f for the short search-box typing, 44f under the wbr writing
// reveals; everything else plays out (≤3s assets)
export const sfxDuration = (s: { from: number; src: string }) =>
  s.src === 'typewriter-digital.mp3' ? (s.from > 700 ? 44 : 24) : 90;

// bottom-strip narration over the live shots (absolute frames; outro stays clean)
export const CAPTIONS = [
  { from: 90, duration: 40, text: 'TEN LIVE PROJECTS · FOUR RESEARCHERS' },
  // (the hero-card hover annotation lives inside SceneOpen as a 3D floating note)
  { from: 318, duration: 44, text: 'NEW WORK LANDS ALL WEEK' },
  { from: 395, duration: 55, text: 'SEARCH · FILTER · OPEN' },
  { from: 477, duration: 68, text: 'EVERY QUESTION, TRACKED TO ITS EXPERIMENTS' },
  { from: 633, duration: 72, text: 'THE DAILY PAPER RADAR' },
  { from: 789, duration: 78, text: 'FOUR VOICES, ONE WEEKLY BRIEF' },
] as const;

// sound design pinned to animation beats (absolute frames). Classic
// product-promo vocabulary: whooshes on camera moves, cinematic impacts on
// landings, sparkle on reveals. Every `src` below resolves to a file that
// exists in `template/public/audio/` AND is a properly-attributed Mixkit
// asset from `vendor/shotcraft/audio/manifest.json` — see `assertSfxAssets()`
// below, which fails loudly if this ever drifts.
//
// ADAPTATION NOTE (2026-09-11): the original Shotcraft template referenced 6
// files this repo does not vendor (5 quarantined for unresolved provenance —
// keyboard/pop/riser-cine/sparkle/whoosh-big — plus a legacy duplicate
// impact-cine, superseded by impact-cine-big). Each cue below was remapped
// to a provenance-approved semantic equivalent from the 144-file corpus,
// same cue timing/volume/intent preserved:
//   whoosh-big.mp3    -> air-whoosh-powerful.mp3 (sfx/transition, "big air whoosh")
//   sparkle.mp3       -> shimmer-sparkle-sweep.mp3 (sfx/light, literal sparkle match)
//   keyboard.mp3      -> typewriter-digital.mp3 (sfx/text, digital typing)
//   pop.mp3           -> ui-message-pop.mp3 (sfx/ui, literal "pop" match)
//   impact-cine.mp3   -> impact-cine-big.mp3 (sfx/impact, its approved successor)
// riser-cine.mp3 has NO safe substitute — the `riser` SFX category is
// entirely empty in the approved corpus (its one source file was itself the
// quarantined one). Per policy, the riser cue at frame 945 is OMITTED
// outright rather than faked with an unrelated category — the outro still
// gets its impact hit at frame 980, just without a riser build-up under it.
export const SFX: { from: number; src: string; volume: number }[] = [
  // brand open: soft transition as the lockup lands, whoosh into the console
  { from: 12, src: 'transition-soft.mp3', volume: 0.4 },
  { from: 78, src: 'whoosh-fast.mp3', volume: 0.45 }, // brand → dashboard
  // hero card: whoosh up on the pop, sparkle on the beam scan, impact reseat
  { from: 127, src: 'air-whoosh-powerful.mp3', volume: 0.5 },
  { from: 141, src: 'shimmer-sparkle-sweep.mp3', volume: 0.35 },
  { from: 204, src: 'transition-snap.mp3', volume: 0.5 },
  // title cards ride a quick swoosh
  { from: 220, src: 'swoosh-quick.mp3', volume: 0.4 },
  // deck shot: soft transition into the pile close-up, whoosh as the orbit
  // pulls back and dealing starts, fast whooshes as the deal accelerates,
  // then the scroll rest → big whoosh back up to the search bar
  { from: 277, src: 'transition-soft.mp3', volume: 0.4 }, // pile close-up
  { from: 308, src: 'air-whoosh-powerful.mp3', volume: 0.5 }, // pull-back + first deals
  { from: 340, src: 'whoosh-fast.mp3', volume: 0.4 }, // dealing accelerates
  { from: 356, src: 'whoosh-fast.mp3', volume: 0.32 }, // full flurry
  { from: 388, src: 'air-whoosh-powerful.mp3', volume: 0.5 }, // swoosh back to header
  // typing (slower now, 3f/char) + a breath + filter + click
  { from: 401, src: 'typewriter-digital.mp3', volume: 0.4 }, // trimmed by sequence length
  { from: 435, src: 'whoosh-fast.mp3', volume: 0.4 }, // grid filters away
  { from: 451, src: 'click-camera.mp3', volume: 0.6 }, // click on the result card
  { from: 455, src: 'swoosh-quick.mp3', volume: 0.35 }, // push-in
  // detail rows embed with one cinematic transition sweep
  { from: 475, src: 'transition-soft.mp3', volume: 0.45 },
  { from: 565, src: 'swoosh-quick.mp3', volume: 0.4 }, // title card 2
  // papers stack: soft transition, camera-click as the counter settles
  { from: 623, src: 'transition-soft.mp3', volume: 0.45 },
  { from: 648, src: 'click-camera.mp3', volume: 0.45 },
  { from: 725, src: 'swoosh-quick.mp3', volume: 0.4 }, // wbr title card
  // wbr: the page "writes itself" over live keyboard typing, then past weeks
  // pop into the left rail one by one (a pop per landing)
  { from: 779, src: 'transition-soft.mp3', volume: 0.4 },
  { from: 781, src: 'typewriter-digital.mp3', volume: 0.34 }, // trimmed to the writing reveals
  { from: 840, src: 'ui-message-pop.mp3', volume: 0.4 },
  { from: 845, src: 'ui-message-pop.mp3', volume: 0.37 },
  { from: 850, src: 'ui-message-pop.mp3', volume: 0.34 },
  { from: 855, src: 'ui-message-pop.mp3', volume: 0.31 },
  { from: 860, src: 'ui-message-pop.mp3', volume: 0.28 },
  { from: 865, src: 'ui-message-pop.mp3', volume: 0.25 },
  { from: 885, src: 'swoosh-quick.mp3', volume: 0.4 }, // title card 3
  // outro: impact when the wordmark stamps (riser cue omitted — see note above)
  { from: 980, src: 'impact-cine-big.mp3', volume: 0.55 },
  { from: 1005, src: 'shimmer-sparkle-sweep.mp3', volume: 0.3 }, // rule + tagline glint
];

/** Fails loudly (throws) if any SFX cue references a file that isn't both
 * present under `public/audio/` AND listed in the approved Shotcraft audio
 * manifest — the exact class of bug this whole adaptation note exists to
 * prevent from silently recurring. See `__tests__/AiflPromoAudio.test.ts`. */
export function assertSfxAssets(sfx: typeof SFX, approvedFiles: Set<string>): void {
  const missing = sfx.filter((s) => !approvedFiles.has(s.src));
  if (missing.length) {
    throw new Error(`AiflPromo SFX references non-approved/missing audio: ${missing.map((m) => m.src).join(', ')}`);
  }
}

export const AiflMain: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#f2eee6' }}>
      {/* beat-pinned promo sound effects (no music bed — SFX only) */}
      {SFX.map((s, i) => (
        <Sequence
          key={`sfx-${i}`}
          from={s.from}
          durationInFrames={sfxDuration(s)}
        >
          <Audio src={staticFile(`audio/${s.src}`)} volume={() => s.volume} />
        </Sequence>
      ))}
      <Sequence from={AIFL_SHOTS.morning.from} durationInFrames={AIFL_SHOTS.morning.duration}>
        <SceneOpen />
      </Sequence>
      <Sequence from={AIFL_SHOTS.card1.from} durationInFrames={AIFL_SHOTS.card1.duration}>
        <PaperTitleCard
          duration={AIFL_SHOTS.card1.duration}
          words={parseWords(TITLE_CARDS.card1.text)}
        />
      </Sequence>
      <Sequence from={AIFL_SHOTS.table.from} durationInFrames={AIFL_SHOTS.table.duration}>
        <SceneFlyIn />
      </Sequence>
      <Sequence from={AIFL_SHOTS.macro.from} durationInFrames={AIFL_SHOTS.macro.duration}>
        <SceneDetail />
      </Sequence>
      <Sequence from={AIFL_SHOTS.card2.from} durationInFrames={AIFL_SHOTS.card2.duration}>
        <PaperTitleCard
          duration={AIFL_SHOTS.card2.duration}
          words={parseWords(TITLE_CARDS.card2.text)}
          sub={TITLE_CARDS.card2.sub}
          subDigits={TITLE_CARDS.card2.subDigits}
        />
      </Sequence>
      <Sequence from={AIFL_SHOTS.chart.from} durationInFrames={AIFL_SHOTS.chart.duration}>
        <ScenePapers />
      </Sequence>
      <Sequence from={AIFL_SHOTS.cardWbr.from} durationInFrames={AIFL_SHOTS.cardWbr.duration}>
        <PaperTitleCard
          duration={AIFL_SHOTS.cardWbr.duration}
          words={parseWords(TITLE_CARDS.cardWbr.text)}
        />
      </Sequence>
      <Sequence from={AIFL_SHOTS.wbr.from} durationInFrames={AIFL_SHOTS.wbr.duration}>
        <SceneWbr />
      </Sequence>
      <Sequence from={AIFL_SHOTS.card3.from} durationInFrames={AIFL_SHOTS.card3.duration}>
        <PaperTitleCard
          duration={AIFL_SHOTS.card3.duration}
          words={parseWords(TITLE_CARDS.card3.text)}
        />
      </Sequence>
      <Sequence from={AIFL_SHOTS.outro.from} durationInFrames={AIFL_SHOTS.outro.duration}>
        <SceneOutroLive />
      </Sequence>
      {/* narration captions over the live shots (under the flash cuts) */}
      {CAPTIONS.map((c) => (
        <Sequence key={c.from} from={c.from} durationInFrames={c.duration}>
          <Caption text={c.text} duration={c.duration} />
        </Sequence>
      ))}
      {/* warm flash cuts straddling scene changes */}
      {FLASH_CUTS.map((cut) => (
        <Sequence key={cut} from={cut - 5} durationInFrames={10}>
          <FlashCut duration={10} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
