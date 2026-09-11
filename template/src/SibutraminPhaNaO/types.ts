import { z } from "zod";

export const sibutraminSchema = z.object({
  title: z.string().default("Sibutramin — Chất cấm phá não"),
  subtitle: z.string().default("Thuốc giảm cân TikTok đã bị cấm từ 2010"),
  channelName: z.string().default(""),
});

export type SibutraminPhaNaOProps = z.infer<typeof sibutraminSchema>;
