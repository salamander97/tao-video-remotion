import { generateTopicVoices } from "./generate-tts";

const scenes = [
  {
    id: "scene1_hook",
    text: "Bạn có biết các hacker và chuyên gia bảo mật đọc được bên trong một phần mềm đóng gói mà không có mã nguồn không? Đó chính là Reverse Engineer!",
  },
  {
    id: "scene2_problem",
    text: "Khi tải một file app hay exe về, bạn chỉ thấy mã máy 0 và 1 hoàn toàn khó hiểu. Vậy làm sao để biết nó đang làm gì thật sự?",
  },
  {
    id: "scene3_concept1",
    text: "Reverse Engineer là kỹ thuật phân tích ngược: từ chương trình đã biên dịch, suy ngược lại logic, thuật toán và cả mã nguồn ban đầu của nó.",
  },
  {
    id: "scene4_concept2",
    text: "Quy trình gồm ba bước: disassembly để đọc assembly, decompile dịch ngược thành pseudocode, rồi debug động để theo dõi chương trình chạy thật.",
  },
  {
    id: "scene5_impact",
    text: "Kỹ thuật này được dùng để tìm lỗ hổng bảo mật, phân tích malware, crack phần mềm và cả reverse game mobile để hiểu giao thức kết nối.",
  },
  {
    id: "scene6_outro",
    text: "Muốn thành chuyên gia bảo mật, hãy bắt đầu với Reverse Engineer ngay hôm nay. Nhớ thả tim và follow kênh để đón xem video tiếp theo nhé!",
  },
];

async function main() {
  await generateTopicVoices("ReverseEngineering", scenes);
}

void main();
