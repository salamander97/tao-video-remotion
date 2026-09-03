# Chuẩn nguồn & checklist fact-check theo domain

Nguyên tắc bất di bất dịch: **không có nguồn = không đưa vào kịch bản**. Fact nào "nhớ mang máng" phải tra lại trước khi viết.

## 📜 Lịch sử
Nguồn chấp nhận (ưu tiên từ trên xuống):
1. Cơ quan lưu trữ/bảo tàng chính thống (Trung tâm Lưu trữ Quốc gia, Bảo tàng Lịch sử Quân sự Việt Nam, tư liệu NARA/Commons có metadata).
2. Báo chính thống có trích dẫn tư liệu (QĐND, Nhân Dân, Tuổi Trẻ với chủ đề lịch sử có nhà sử học tham mưu).
3. Wikipedia có citation check được (mở footnote xác minh — KHÔNG tin bảng thông tin không nguồn).

Checklist:
- [ ] Ngày tháng năm sự kiện: khớp ≥ 2 nguồn độc lập.
- [ ] Con số thương vong/lực lượng: ghi rõ "theo nguồn X" trong kịch bản hoặc caption nếu các nguồn chênh nhau.
- [ ] Ảnh tư liệu: đúng phía, đúng thời kỳ, có license/credit (Commons CC hoặc web VN có ghi nguồn).
- [ ] Nhân vật nói lời trích dẫn: kiểm tra thật – hư; nếu là lời truyền lại thì ghi "tương truyền".

## 🏥 Y tế & sức khỏe
Nguồn chấp nhận:
1. WHO, NIH/NLM, CDC, Harvard Health, Mayo Clinic.
2. Nghiên cứu trên PubMed (ưu tiên review/meta-analysis, ghi năm).
3. Bộ Y tế Việt Nam, Viện Dinh dưỡng Quốc gia.

Checklist (NGHIÊM hơn các domain khác):
- [ ] Mọi claim chạm bệnh/thuốc/chẩn đoán: có nguồn y khoa kèm năm nghiên cứu.
- [ ] Không đưa lời khuyên điều trị; kết video bằng disclaimer "thông tin tham khảo, không thay thế chỉ định của bác sĩ".
- [ ] Phân biệt rõ "nghiên cứu cho thấy liên hệ" ≠ "gây ra" (correlation vs causation).
- [ ] Số liệu %: ghi kích thước mẫu + năm khi số gây sốc.
- [ ] Không dùng ảnh bệnh lý gây sợ hãi quá mức (platform có thể giới hạn truyền phân phối).

## 💰 Tài chính
Nguồn chấp nhận:
1. Ngân hàng Nhà nước VN, GSO (Tổng cục Thống kê), IMF, World Bank.
2. Báo cáo chính thức của công ty niêm yết (HOSE/HNX).
3. Báo chính thống mục tài chính (VnEconomy, Nhân Dân tài chính).

Checklist:
- [ ] Lãi suất/mức phí: kiểm tra hiện hành theo năm (không dùng số cũ quá 12 tháng).
- [ ] Mô phỏng lãi kép: tự tính lại bằng công thức, ghi rõ giả định (số gửi, kỳ hạn, suất).
- [ ] Không hứa/ngụ ý lợi nhuận chắc chắn; thêm "tham khảo, không phải khuyến nghị đầu tư".
- [ ] So sánh các loại hình đầu tư: cùng mốc thời gian + sau phí.

## Ghi nguồn vào video như thế nào
- Caption nhỏ cuối cảnh hoặc cuối video: "Nguồn: WHO (2024)" / "Ảnh: Wikimedia Commons — CC BY-SA".
- Fact sốc hiển thị số to + nguồn nhỏ bên dưới ngay tại cảnh đó (tăng độ tin).
- Lưu URL đầy đủ vào `episodes.json` → dùng lại khi người xem phản biện ở comment.
