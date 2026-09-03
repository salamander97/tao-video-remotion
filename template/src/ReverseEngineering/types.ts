import { z } from "zod";

export const reverseEngineeringSchema = z.object({
  title: z.string().default("Reverse Engineer là gì?"),
  subtitle: z.string().default("Giải thích trong 50 giây"),
  // Truyền qua --props khi render; rỗng = ẩn hoàn toàn brand header
  channelName: z.string().default(""),
});

export type ReverseEngineeringProps = z.infer<typeof reverseEngineeringSchema>;
