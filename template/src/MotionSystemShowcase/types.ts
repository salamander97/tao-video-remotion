import { z } from "zod";

export const motionSystemShowcaseSchema = z.object({
  title: z.string().default("Hệ thống chuyển động dọc"),
  subtitle: z.string().default("Composition kiểm chứng — motion system"),
  channelName: z.string().default(""),
});

export type MotionSystemShowcaseProps = z.infer<typeof motionSystemShowcaseSchema>;
