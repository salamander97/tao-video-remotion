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
    </>
  );
};
