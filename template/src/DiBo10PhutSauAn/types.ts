import { z } from "zod";

export const dibo10PhutSauAnSchema = z.object({
  title: z.string().default("Đi bộ 10 phút sau ăn"),
  subtitle: z.string().default("Đường huyết thay đổi thế nào?"),
  // Truyền qua --props khi render; rỗng = ẩn hoàn toàn brand header
  channelName: z.string().default(""),
});

export type DiBo10PhutSauAnProps = z.infer<typeof dibo10PhutSauAnSchema>;
