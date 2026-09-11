import "./index.css";
import { Composition } from "remotion";
import { DockerExplainer } from "./DockerExplainer/DockerExplainer";
import { dockerExplainerSchema } from "./DockerExplainer/types";
import { ReverseEngineering } from "./ReverseEngineering/ReverseEngineering";
import { reverseEngineeringSchema } from "./ReverseEngineering/types";
import { QuangTri1972 } from "./QuangTri1972/QuangTri1972";
import { quangTriSchema } from "./QuangTri1972/types";
import { AiMalwareShort } from "./AiMalwareShort/AiMalwareShort";
import { aiMalwareSchema } from "./AiMalwareShort/types";
import { SibutraminPhaNaO } from "./SibutraminPhaNaO/SibutraminPhaNaO";
import { sibutraminSchema } from "./SibutraminPhaNaO/types";
import { MotionSystemShowcase } from "./MotionSystemShowcase/MotionSystemShowcase";
import { motionSystemShowcaseSchema } from "./MotionSystemShowcase/types";
import { DiBo10PhutSauAn } from "./DiBo10PhutSauAn/DiBo10PhutSauAn";
import { dibo10PhutSauAnSchema } from "./DiBo10PhutSauAn/types";
import { AiflMain, AIFL_TOTAL } from "./AiflPromoDemo/Main";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 50s AI Voice Explainer: Docker */}
      <Composition
        id="DockerExplainer"
        component={DockerExplainer}
        durationInFrames={1280}
        fps={30}
        width={1080}
        height={1920}
        schema={dockerExplainerSchema}
        defaultProps={{
          title: "Docker là gì?",
          subtitle: "Giải thích trong 50 giây",
          channelName: "",
        }}
      />
      {/* 50s AI Voice Explainer: Reverse Engineering */}
      <Composition
        id="ReverseEngineering"
        component={ReverseEngineering}
        durationInFrames={1500}
        fps={30}
        width={1080}
        height={1920}
        schema={reverseEngineeringSchema}
        defaultProps={{
          title: "Reverse Engineer là gì?",
          subtitle: "Giải thích trong 50 giây",
          channelName: "",
        }}
      />
      {/* 3-min history documentary: Thành cổ Quảng Trị 1972 */}
      <Composition
        id="QuangTri1972"
        component={QuangTri1972}
        durationInFrames={4746}
        fps={30}
        width={1080}
        height={1920}
        schema={quangTriSchema}
        defaultProps={{
          title: "Thành cổ Quảng Trị 1972",
          subtitle: "81 ngày đêm — Chứng tích thép",
          channelName: "",
        }}
      />
      {/* 60s cosmic-neon: kênh An Toàn Số — mã độc giả danh AI */}
      <Composition
        id="AiMalwareShort"
        component={AiMalwareShort}
        durationInFrames={1832}
        fps={30}
        width={1080}
        height={1920}
        schema={aiMalwareSchema}
        defaultProps={{
          title: "Hacker lười sáng tạo — mã độc giả AI",
          subtitle: "An Toàn Số · Kaspersky 2026",
          channelName: "",
        }}
      />
      {/* ~90s clinical-clarity: Sibutramin — chất cấm phá não */}
      <Composition
        id="SibutraminPhaNaO"
        component={SibutraminPhaNaO}
        durationInFrames={2724}
        fps={30}
        width={1080}
        height={1920}
        schema={sibutraminSchema}
        defaultProps={{
          title: "Sibutramin — Chất cấm phá não",
          subtitle: "Thuốc giảm cân TikTok đã bị cấm từ 2010",
          channelName: "",
        }}
      />
      {/* Composition kiểm chứng tích hợp Shotcraft — motion helpers, camera 2.5D,
          shot registry, sound cues. Xem docs/shotcraft-integration-plan.md. */}
      <Composition
        id="MotionSystemShowcase"
        component={MotionSystemShowcase}
        durationInFrames={1244}
        fps={30}
        width={1080}
        height={1920}
        schema={motionSystemShowcaseSchema}
        defaultProps={{
          title: "Hệ thống chuyển động dọc",
          subtitle: "Composition kiểm chứng — motion system",
          channelName: "",
        }}
      />
      {/* 58s clinical-clarity: kênh Thật Hay Thôi? — đi bộ 10 phút sau ăn và đường huyết */}
      <Composition
        id="DiBo10PhutSauAn"
        component={DiBo10PhutSauAn}
        durationInFrames={1745}
        fps={30}
        width={1080}
        height={1920}
        schema={dibo10PhutSauAnSchema}
        defaultProps={{
          title: "Đi bộ 10 phút sau ăn",
          subtitle: "Đường huyết thay đổi thế nào?",
          channelName: "Thật Hay Thôi?",
        }}
      />
      {/* OPTIONAL reference path — Shotcraft's own "Ink Press" product-promo
          template (AiflPromo), ported for horizontal 1920x1080 SFX-only
          promos (no TTS). NOT a vertical-video default — registered so the
          resolver/skill workflow has a real, provenance-tracked example of
          the full Shotcraft product-promo grammar to copy from when a user
          explicitly asks for a horizontal SaaS-style promo instead of the
          TTS-first vertical pipeline. All SFX cues in `Main.tsx` were
          remapped from the original template's 6 quarantined/legacy audio
          references to provenance-approved equivalents from the 144-file
          corpus (see the ADAPTATION NOTE in `Main.tsx`) — every cue is
          asserted present + approved by `assertSfxAssets()` and covered by
          `__tests__/AiflPromoAudio.test.ts`; the riser cue was omitted
          outright (the `riser` category has zero approved files) rather
          than faked with an unrelated sound. */}
      <Composition
        id="AiflPromoDemo"
        component={AiflMain}
        durationInFrames={AIFL_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
