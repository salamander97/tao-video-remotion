import { generateTopicVoices } from "./generate-tts";

// Kịch bản chốt — "Đi bộ 10 phút sau ăn: đường huyết thay đổi thế nào?"
// Kênh: Thật Hay Thôi? (health, clinical-clarity, vi-VN-HoaiMyNeural +15%)
const VOICE = "vi-VN-HoaiMyNeural";
const RATE = "+15%";

const scenes = [
  { id: "scene1_hook", text: "Sau bữa tối, chỉ mười phút đi bộ có thể làm đường huyết thay đổi rõ rệt. Vì sao?" },
  { id: "scene2_eat", text: "Sau khi ăn, carbohydrate thành glucose. Đường huyết tăng, còn insulin giúp đưa glucose vào tế bào." },
  { id: "scene3_walk", text: "Khi đi bộ, cơ bắp co lại và sử dụng thêm glucose làm nhiên liệu, giúp giảm đỉnh sau ăn." },
  { id: "scene4_study", text: "Năm 2016, thử nghiệm crossover trên 41 người tiểu đường type 2 đã so sánh hai cách đi bộ." },
  { id: "scene5_stat", text: "Mười phút sau mỗi bữa giúp đường huyết sau ăn thấp hơn khoảng mười hai phần trăm. Riêng bữa tối, chênh lệch là hai mươi hai phần trăm." },
  { id: "scene6_compare", text: "Phân tích bảy thử nghiệm năm 2022 cũng cho thấy đi bộ nhẹ cải thiện glucose và insulin tốt hơn tiếp tục ngồi, và tốt hơn chỉ đứng." },
  { id: "scene7_routine", text: "Hãy thử đi bộ thoải mái mười phút sau bữa tối. Nếu dùng insulin hoặc dễ hạ đường huyết, hãy hỏi bác sĩ trước." },
  { id: "scene8_outro", text: "Đi bộ không thay thế thuốc hay điều trị. Lưu video để thử tối nay. Thông tin tham khảo, không thay thế chỉ định bác sĩ." },
].map((s) => ({ ...s, voice: VOICE, rate: RATE }));

generateTopicVoices("DiBo10PhutSauAn", scenes).catch((e) => {
  console.error(e);
  process.exit(1);
});
