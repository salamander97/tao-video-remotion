import { generateTopicVoices } from "./generate-tts";

const scenes = [
  { id: "scene1_hook", text: "Một video dọc đẹp không chỉ nhờ một tấm ảnh đứng yên, mà nhờ một hệ thống chuyển động nhất quán." },
  { id: "scene2_parallax", text: "Camera hai chấm năm chiều lướt vào đúng chi tiết cần chú ý, thay vì phóng to cả tấm ảnh." },
  { id: "scene3_data", text: "Một con số ấn tượng luôn cần đơn vị rõ ràng và nguồn dữ liệu đáng tin." },
  { id: "scene4_montage", text: "Nhiều tư liệu cắt nhanh giúp mạch phim không bao giờ đứng yên quá lâu." },
  { id: "scene5_diagram", text: "Một cơ chế nhiều bước cần từng trạng thái được vẽ ra rõ ràng, không dồn hết vào một khung hình." },
  { id: "scene6_hold", text: "Nhưng đôi khi, hình ảnh cần một khoảng lặng đủ dài để người xem kịp đọc, trước khi chuyển sang ý tiếp theo." },
  { id: "scene7_outro", text: "Đó là cách một hệ thống thiết kế cảnh nhất quán giúp video kiến thức trở nên chuyên nghiệp và dễ xem hơn." },
];

generateTopicVoices("MotionSystemShowcase", scenes).catch((e) => {
  console.error(e);
  process.exit(1);
});
