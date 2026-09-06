# Tìm và sử dụng hình ảnh Internet theo nội dung

Đọc sau khi có outline, trước JSX. Áp dụng cả khi gọi trực tiếp skill tạo video mà không có topic-package. Mục tiêu là mỗi video có hình ảnh/bằng chứng phù hợp và được dựng có diễn biến.

## 1. Kế hoạch tìm kiếm

- Nhận `visualResearch` từ topic-package nếu có. Kế thừa nguồn và query đã kiểm tra; không nghiên cứu lại toàn bộ.
- Mỗi video mới mặc định tìm trên Internet và dùng asset phù hợp ở các cảnh bối cảnh, sự vật/người/địa điểm, sản phẩm hoặc bằng chứng. Không hoàn thành toàn bộ video chỉ bằng card/SVG vì chúng dễ code hơn.
- Nếu user yêu cầu thuần animation/offline, đã cung cấp đủ asset, hoặc mọi ý thực sự chỉ phù hợp diagram, ghi `assetSearch.mode=provided-only|diagram-only` và `reason`. Không bịa một lý do thiếu công cụ để né tìm kiếm: thiếu mạng/tìm kiếm/vision thì báo hạn chế, đề xuất nguồn user cung cấp hoặc phương án diagram chính xác.
- Mỗi scene có `visualIntent`, `assetQuery`, `assetRequired`. Cảnh dựa vào ảnh/screenshot/footage cần `assetRequired=true`; cảnh cơ chế tự vẽ có thể false. `data` vẫn chứa nguồn dữ liệu nếu diagram/chart dựa fact bên ngoài.
- Query nên có tên thực thể + hành động/chi tiết + thời kỳ/địa điểm; thêm bản tiếng Anh khi có lợi. Tránh query chung như "health", "AI", "finance".

## 2. Tìm, chọn và kiểm tra

1. Dùng search/image search/browser/provider API đang có của agent; tìm theo nhóm 2–4 truy vấn độc lập cho cùng mục đích, không mở hàng chục trang tuần tự. Ưu tiên asset đã có trong manifest và đúng ngữ cảnh.
2. Ưu tiên trang chính thức, press/media kit có quyền sử dụng phù hợp, bảo tàng/lưu trữ, Commons có metadata. Stock chỉ cho bối cảnh chung; không dùng stock làm ảnh chứng minh nhân vật/sự kiện cụ thể. Với công cụ/phần mềm, screenshot trang nguồn/UI thật có giá trị hơn ảnh robot chung chung.
3. Mở trang nguồn để xác minh danh tính, thời kỳ, caption, tác giả và quyền dùng; search thumbnail không phải nguồn cuối. Credit không đồng nghĩa có quyền tái sử dụng. Không gọi một ảnh là public domain/CC khi chưa kiểm tra; giữ URL license/permission và điều kiện attribution. Screenshot cũng cần căn cứ sử dụng phù hợp.
4. Xem trực tiếp từng asset được chọn bằng công cụ ảnh/video: đúng người/vật/phía/thời kỳ, không watermark gây cản trở, đủ độ nét và vùng crop cho 9:16. Với footage, kiểm tra các mốc được dùng. Không tự ghi `review.status=verified` khi chỉ đọc filename/snippet.
5. Lưu bản hợp lệ về `template/public/images/<TopicName>/` (footage vào thư mục topic phù hợp trong public); dùng đường dẫn local qua `staticFile()` khi render, không hotlink. Ghi file thực tế và metadata vào `asset-manifest.json` cạnh `visual-plan.json`.
6. Nếu kết quả không đạt: refine query hoặc đổi nguồn một vòng có mục đích; vẫn thiếu thì ghi blocker/cảnh thiếu và đề xuất diagram đúng ngữ nghĩa. Không tiếp tục truy vấn vô hạn, không dùng emoji/card lấp chỗ, không âm thầm bỏ yêu cầu ảnh Internet của video. AI-generated media chỉ khi user cho phép và phải ghi là minh họa, không phải ảnh tư liệu.

## 3. Manifest và gate trước JSX/render

Plan mới dùng `schemaVersion: 2`, `fps: 30`, `assetSearch` và `scenes`. Giữ nguyên các field scene cũ. `assetSearch` gồm `mode` (`web|provided-only|diagram-only`), `queries` và `reason` khi ngoại lệ. Mode web cần query thực và ít nhất một asset Internet đã kiểm tra được scene tham chiếu trong gate ready.

Mỗi scene có `layoutMode: full-stage|editorial`, `durationInFrames`, `assetIds` (mảng rỗng cho scene không dùng file ngoài). Editorial thêm `captionMode: editorial-inline|subtitle-pill`, `evidenceTreatment` và `headline`. Manifest có dạng `{ "assets": [...] }`; mỗi asset gồm:

| Field | Ý nghĩa |
|---|---|
| `id`, `kind` | ID ổn định; photo, footage, archival, screenshot |
| `origin` | web hoặc provided |
| `file` | Đường dẫn tương đối từ template/public; không `../`, không URL |
| `sourceUrl`, `licenseUrl` | Trang nguồn và căn cứ quyền dùng/permission; URL thật, không search results |
| `creator`, `license`, `credit` | Tác giả, quyền dùng và credit thực tế; không đoán |
| `review` | `{status: "verified", relevance: "chi tiết khớp lời thoại", checkedAt: "ISO datetime"}` sau khi xem ảnh/video |
| `sha256` | Hash file đã kiểm tra; thay file phải review lại |

Nguồn user cung cấp (`origin=provided`) vẫn ghi credit, quyền dùng do user khai báo và review nội dung; có thể không có URL. Chưa rõ quyền dùng thì chưa đạt ready.

Từ repository, kiểm tra plan trước khi tìm xong asset:

```bash
node scripts/validate-visual-plan.mjs template/src/<TopicName>/visual-plan.json
```

Sau khi asset đã có, trước JSX và trước render chạy lại:

```bash
node scripts/validate-visual-plan.mjs template/src/<TopicName>/visual-plan.json --ready --asset-manifest template/src/<TopicName>/asset-manifest.json --public-dir template/public
```

Gate ready kiểm tra file/hash/metadata/assetIds, không thay được review bằng mắt. Query hay `assetRequired=true` tự nó chưa chứng minh ảnh đã tải. `images.json` cũ vẫn giữ để code cũ hoạt động; có thể chuyển metadata đã xác minh sang manifest mới, không tự gắn verified cho file cũ.

## 4. Biến asset thành cảnh sống động

- Khai báo trong `visualBeats`: frame + action + ý mới người xem nhận được; gắn crop/callout/ảnh thứ hai với câu thoại.
- Ảnh thật: context → subject focus → relevant detail → comparison/next image. Pan/zoom nhẹ chỉ hỗ trợ; không tính mỗi 1% scale thành một beat.
- Screenshot: crop đoạn có liên quan, reveal dòng/region, zoom chi tiết và highlight; không biến nguyên trang web thành thumbnail khó đọc.
- Footage: chọn đoạn đang có hành động giải thích lời thoại; chuyển theo hành động, tránh loop ngắn lộ rõ.
- Cơ chế vô hình: diagram có quan hệ và đổi trạng thái; dùng ảnh thật để đặt bối cảnh khi phù hợp.
- Tái sử dụng file đã kiểm tra qua hash; thay palette/caption không tìm hoặc tải lại. Hai scene dùng cùng ảnh phải có góc nhìn/ý khác rõ ràng.

`fetch-images.ts` hiện là script ví dụ theo topic, không phải bộ tìm ảnh tổng quát có sẵn. Dùng khả năng search của agent để tìm nguồn mới; không chạy script ví dụ lịch sử cho một chủ đề khác. Không tự cài provider trả phí/mua ảnh nếu user chưa yêu cầu.
