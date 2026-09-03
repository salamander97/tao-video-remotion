import { z } from "zod";

export const dockerExplainerSchema = z.object({
  title: z.string().default("Docker là gì?"),
  subtitle: z.string().default("Giải thích trong 60 giây"),
  // Truyền qua --props khi render; rỗng = ẩn hoàn toàn brand header
  channelName: z.string().default(""),
});

export type DockerExplainerProps = z.infer<typeof dockerExplainerSchema>;
