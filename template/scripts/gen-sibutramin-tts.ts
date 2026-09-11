import { generateTopicVoices } from "./generate-tts";

const scenes = [
  {
    id: "scene1_hook",
    text: "Viên thuốc giảm 7 ký trong 7 ngày đang bán tràn lan trên TikTok. Và nó đã phá não một cô gái 21 tuổi.",
  },
  {
    id: "scene2_what",
    text: "Sibutramin là chất ức chế serotonin và norepinephrine, đánh lừa vùng dưới đồi khiến bạn mất hoàn toàn cảm giác đói. FDA từng phê duyệt nó năm 1997.",
  },
  {
    id: "scene3_scout",
    text: "Nhưng thử nghiệm SCOUT trên 10.742 bệnh nhân đã vạch trần: Sibutramin tăng 16 phần trăm nguy cơ nhồi máu cơ tim và đột quỵ.",
  },
  {
    id: "scene4_ban",
    text: "Thế giới phản ứng ngay. FDA rút thuốc tháng 10 năm 2010. Việt Nam đình chỉ toàn quốc tháng 4 năm 2011. Sibutramin chính thức là chất cấm.",
  },
  {
    id: "scene5_still",
    text: "Nhưng mở TikTok hôm nay, bạn vẫn thấy: giảm cân siêu tốc, 7 ngày giảm 7 ký. Lời mời chào hấp dẫn, đằng sau là chất cấm 15 năm.",
  },
  {
    id: "scene6_case",
    text: "Một cô gái 21 tuổi ở Hà Nội mua thuốc giảm cân trên TikTok. Uống hơn một tháng, rồi cô bất tỉnh. Bệnh viện Bạch Mai chẩn đoán: tổn thương não nặng.",
  },
  {
    id: "scene7_mechanism",
    text: "Sibutramin gây co thắt mạch máu não, làm thiếu oxy tế bào thần kinh. Vùng đồi thị bị tổn thương vĩnh viễn, không thể hồi phục.",
  },
  {
    id: "scene8_signs",
    text: "Tim đập nhanh, chóng mặt, mất ngủ triền miên, khô miệng. Đó không phải giảm cân, đó là cơ thể đang kêu cứu.",
  },
  {
    id: "scene9_protect",
    text: "Chỉ dùng thuốc có số đăng ký Bộ Y tế. Tuyệt đối không mua thuốc giảm cân rao bán thần tốc trên mạng xã hội.",
  },
  {
    id: "scene10_outro",
    text: "Chia sẻ video này cho người thân trước khi quá muộn. Thông tin chỉ mang tính tham khảo, hãy tham vấn bác sĩ.",
  },
];

(async () => {
  await generateTopicVoices("SibutraminPhaNaO", scenes);
})();
