import { generateTopicVoices } from "./generate-tts";

// Video lịch sử: giọng nam NamMinh, tốc độ +0% (trang trọng, kể chuyện)
const VOICE = "vi-VN-NamMinhNeural";
const RATE = "+15%";

const scenes = [
  {
    id: "scene1_hook",
    rate: RATE,
    voice: VOICE,
    text: "Tám mươi mốt ngày đêm. Một tòa thành cổ ba trăm năm tuổi bị bom đạn san phẳng, nhưng lá cờ vẫn tung bay trên nóc thành. Đây là câu chuyện về trận Thành cổ Quảng Trị, mùa hè đỏ lửa năm 1972.",
  },
  {
    id: "scene2_context",
    rate: RATE,
    voice: VOICE,
    text: "Xuân hè năm 1972, quân ta mở chiến dịch tiến công chiến lược trên toàn miền Nam, nhằm buộc Mỹ trở lại đàm phán. Quảng Trị, cửa ngõ phía Bắc, trở thành nơi hội tụ của cuộc quyết đấu lớn nhất giữa ta và địch.",
  },
  {
    id: "scene3_liberation",
    rate: RATE,
    voice: VOICE,
    text: "Ngày mùng một tháng Năm năm 1972, thành phố Quảng Trị được giải phóng, trở thành tỉnh đầu tiên của miền Nam được giải phóng. Nhưng chính vì lẽ đó, kẻ thù không cam chịu, chúng dồn toàn lực hỏa lực để đòi lại bằng được.",
  },
  {
    id: "scene4_lamson72",
    rate: RATE,
    voice: VOICE,
    text: "Cuộc hành quân Lam Sơn bảy mươi hai mở màn giữa tháng Sáu. Không quân Mỹ và Việt Nam Cộng hòa ném bom suốt ngày đêm, đạn pháo hải quân từ biển Đông dồn về thành cổ. Người ta ví nơi đây là địa ngục trần thế.",
  },
  {
    id: "scene5_siege",
    rate: RATE,
    voice: VOICE,
    text: "Từ ngày hai mươi tám tháng Sáu, địch ồ ạt đánh chiếm thành cổ. Bộ đội của ta với quyết tâm sống bám thành, chết kiên quyết, bắt đầu cuộc phòng ngự tám mươi mốt ngày đêm đi vào lịch sử dân tộc.",
  },
  {
    id: "scene6_hellfire",
    rate: RATE,
    voice: VOICE,
    text: "Mỗi ngày, hàng nghìn quả đạn pháo rơi xuống khu thành cổ chưa đầy hai cây số vuông. Tường thành kiên cố ba thế kỷ bị san phẳng, chỉ còn nền đất đỏ trơ và những hố bom sâu hoắm chồng chất nhau.",
  },
  {
    id: "scene7_young",
    rate: RATE,
    voice: VOICE,
    text: "Giữ thành là những chiến sĩ còn rất trẻ. Đa phần chỉ mười tám, hai mươi tuổi, nhiều người vừa rời ghế nhà trường, tự nguyện viết đơn xin ra mặt trận, nhận về mình nhiệm vụ nặng nhất đời người.",
  },
  {
    id: "scene8_thachhan",
    rate: RATE,
    voice: VOICE,
    text: "Phía trước thành cổ là sông Thạch Hãn. Trong lũ đạn pháo, từng người một, các chiến sĩ băng qua dòng sông để vào thành. Nhiều người đã nằm lại mãi mãi bên dòng sông hiền hòa ấy, mãi mãi ở tuổi hai mươi.",
  },
  {
    id: "scene9_counterattack",
    rate: RATE,
    voice: VOICE,
    text: "Sau hai tháng rưỡi giữ vững, đến giữa tháng Chín, quân ta mở màn phản công. Các đơn vị đồng loạt tiến công, đỉnh điểm là cuộc xung phong đêm mười bốn, quét sạch từng vị trí địch bao vây quanh thành.",
  },
  {
    id: "scene10_flag",
    rate: RATE,
    voice: VOICE,
    text: "Chiều mười sáu tháng Chín năm 1972, lá cờ quyết chiến quyết thắng lại tung bay trên nóc thành cổ. Tám mươi mốt ngày đêm thép khép lại trong vinh quang, làm rạng rỡ lịch sử dân tộc.",
  },
  {
    id: "scene11_meaning",
    rate: RATE,
    voice: VOICE,
    text: "Chiến thắng thành cổ đã làm sụp đổ hoàn toàn âm mưu tám chiếm Quảng Trị của địch, giữ vững thành quả của chiến dịch, đồng thời góp phần quan trọng buộc Mỹ phải quay lại bàn hội nghị Paris một cách nghiêm túc.",
  },
  {
    id: "scene12_sacrifice",
    rate: RATE,
    voice: VOICE,
    text: "Nhưng chiến thắng ấy được đánh đổi bằng máu của hàng nghìn người con ưu tú. Họ đã ngã xuống khi tuổi đời còn xanh nhất. Mãi mãi, họ ở lại bên thành cổ và sông Thạch Hãn thân thương.",
  },
  {
    id: "scene13_legacy",
    rate: RATE,
    voice: VOICE,
    text: "Hôm nay, Thành cổ Quảng Trị đã trở thành di tích quốc gia đặc biệt, một địa chỉ đỏ của cả nước. Hằng năm, hàng triệu người từ khắp mọi miền đất nước về đây thắp nén tâm hương, tri ân các anh.",
  },
  {
    id: "scene14_outro",
    rate: RATE,
    voice: VOICE,
    text: "Nếu bạn thấy biết ơn thế hệ cha anh đã ngã xuống vì độc lập tự do của đất nước, hãy thả tim, chia sẻ video này và follow kênh Lịch Sử Việt Nam. Cảm ơn bạn đã theo dõi.",
  },
];

async function main() {
  await generateTopicVoices("QuangTri1972", scenes);
}

void main();
