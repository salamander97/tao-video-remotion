# Editorial news — headline và bằng chứng có diễn biến

Đọc khi chọn preset `editorial-news`. Hợp tin tức, giải thích sản phẩm, review công cụ, case study và nội dung có screenshot/tài liệu. Không mặc định mọi chủ đề công nghệ dùng editorial; chọn theo chất liệu và intent. Có thể xen một cảnh full-stage để nhấn mạnh.

## Bố cục 1080×1920

| Vùng | Gợi ý | Vai trò |
|---|---|---|
| Shell | x=80..1000, y=150..215 | Category nhỏ, số chapter, rule line; brand chỉ khi đã được yêu cầu |
| Headline | x=80..1000, y=245..465 | 1–2 dòng, serif đậm 78–96px, chỉ một cụm màu đỏ gạch |
| Caption inline | x=80..1000, y=495..635 | 38–46px, tối đa 2 dòng, chạy theo lời đọc |
| Evidence | x=80..1000, y=675..1365 | Ảnh, screenshot crop, diagram hoặc chart; vùng minh họa được mở rộng theo nội dung |
| Nguồn | y=1390..1480 | Credit dễ đọc; không sao chép tài khoản/brand của video tham chiếu |
| Safe zone | 260px cuối | Không đặt thông tin thiết yếu |

Khoảng trắng cần phục vụ headline và evidence. `visualCoverage` vẫn là **chiều rộng / 1080**, không phải phần trăm diện tích hay chiều cao. Evidence thường rộng 0.75–0.88 frame; không co chữ tài liệu để ép cả trang vào card. Headline không tự thay thế substantive visual.

`EditorialFrame` trong `template/src/components/EditorialFrame.tsx` cung cấp shell, headline reveal và slot caption/evidence/source. Component không tự sinh beat nội dung: scene phải điều phối state, crop và highlight bằng `VisualBeatSequence` hoặc frame. Khi dùng `captionMode=editorial-inline`, truyền caption đồng bộ TTS vào slot, không coi một câu mô tả tĩnh là phụ đề toàn bộ lời nói. Vẫn dùng `subtitleUtils.ts`; chỉ một luồng phụ đề hiển thị tại một thời điểm.

`EvidenceImage` trong `src/components/` nhận file tương đối từ public, alt, fit (`contain` cho screenshot, `cover` cho ảnh) và focus[] gồm frame/scale/x/y/label. x/y là phần trăm viewport; scale >= 1. Dùng các mốc focus để dẫn mắt vào chi tiết liên quan; lặp cùng transform và chỉ đổi label không tự đủ meaningful beat. Ảnh crop/highlight phải được kiểm tra sau transform; helper không tự hiểu chủ thể hoặc nguồn.

## Ba cách dựng evidence

1. **Document focus:** screenshot từ nguồn thật → crop đoạn liên quan → highlight đúng câu/số → phóng chi tiết hoặc thay bằng bản phóng to dễ đọc. Không thêm highlight làm sai ngữ nghĩa hoặc giả nội dung của nguồn.
2. **Photo story:** ảnh bối cảnh thật → focus chủ thể → crop chi tiết có ý nghĩa → ảnh/góc thứ hai → kết luận ngắn. Zoom đều một ảnh suốt cảnh không đủ diễn biến.
3. **Mechanism/comparison:** line-art/SVG có cấu trúc → đối tượng A tác động B → đường nối/trạng thái đổi → kết quả. Icon đơn lẻ chỉ là nhãn; diagram phải thể hiện quan hệ thực.

Giữ palette kem `#F3EFE3`, mực `#22211D`, đỏ gạch `#B94132`, surface `#FFFCF5`. Display `Noto Serif` (hoặc serif có tiếng Việt đã kiểm tra), body `Be Vietnam Pro`. Tải font cục bộ/qua cơ chế có sẵn trước render; không phụ thuộc font tình cờ có trên máy.

## Nhịp mẫu cho chapter 10 giây @30fps

| Frame | Nội dung thay đổi | Cách thể hiện |
|---|---|---|
| 0 | Câu hỏi/claim + glimpse bằng chứng | Headline reveal ngắn; evidence có mặt từ đầu |
| 35 | Đặt bối cảnh nguồn | Screenshot/ảnh ổn định vào vị trí |
| 100 | Bằng chứng cho lời đang đọc | Highlight đúng dòng hoặc focus chủ thể |
| 170 | Chi tiết thứ hai | Crop/đổi ảnh/chart state, callout giải thích |
| 240 | Kết luận nhìn thấy được | Comparison/annotation trên evidence |
| 285 | Handoff | Cut/mask 6–12 frames vào ý tiếp theo |

Đây là nhịp mẫu, không ép mọi chapter đúng 10 giây. Dùng thời lượng audio thực tế. Entrance/exit, headline reveal, caption đổi và glow không được dùng một mình để đủ quota meaningful beat. Beat phải dẫn tới một trạng thái bằng chứng/nội dung mới. Không bắt mọi đối tượng nảy: `spring()` cho entrance cần settling; `interpolate()` theo frame cho crop/path/highlight.

Shell được giữ xuyên video. Trong ba scene liên tiếp, phải thay cách trình bày evidence (document focus / photo story / mechanism / comparison / chart), hoặc thay rõ thông tin được khám phá trong một chuỗi có lý do. Không đổi tên sceneType để che ba card giống nhau. Mỗi chapter 8–12 giây chỉ hợp lệ khi có diễn biến đủ và khoảng đọc hợp lý; không kéo dài cảnh để khớp voice.

## Kiểm tra khi xem nhỏ và khi phát

- Xem ở 25%: headline/evidence đọc được; screenshot không thành khối chữ li ti; nguồn không tranh headline.
- Kiểm tra đầu/giữa/cuối: có bằng chứng và các trạng thái khác nhau, không chỉ chữ xuất hiện.
- Phát preview tốc độ thật: reveal không hụt chữ Việt, highlight bám ý đang đọc, không có đoạn giữ tĩnh dài ở cuối chapter.
- Đừng sao chép điểm yếu của video tham chiếu: trang tài liệu quá nhỏ, khoảng trống dài đầu scene và outro giữ quá lâu.
