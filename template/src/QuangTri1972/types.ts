import { z } from "zod";

export const quangTriSchema = z.object({
  title: z.string().default("Thành cổ Quảng Trị 1972"),
  subtitle: z.string().default("81 ngày đêm — Chứng tích thép"),
  // Truyền qua --props khi render; rỗng = ẩn hoàn toàn brand header
  channelName: z.string().default(""),
});

export type QuangTriProps = z.infer<typeof quangTriSchema>;
