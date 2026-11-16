# Bước `script`: Sinh spec từng phần

**Mục tiêu:** Mỗi phần trong kế hoạch sinh script (`01_selected_tc.md`) thành spec data-driven, mỗi lượt **một phần**, đọc dữ liệu từ file của bước `data`, dùng ≥ 3 kiểu assertion (theo phạm vi dự án chốt).

**Đầu ra:** `ai_raw/script_<nn>_<nội dung>.md` (bản AI), `tests/<feature>/<nội dung>.spec.ts` (giống hệt bản AI ở commit bản AI), phần dùng chung trong `tests/support/` nếu cần.

## Hỏi trước khi viết (phần đầu tiên của feature)

- **POM** hay không (`playwright-patterns.md` mục 11).
- **Thông tin giao diện** đưa cho AI để chọn selector, theo phạm vi dự án cho phép:
  - a. AI chạy `scripts/aria_snapshot.mjs` cho các trang của phần đó (cần server đang chạy).
  - b. Sinh viên chạy `npx playwright codegen <url>` và dán code / selector.
  - c. AI đọc mã nguồn frontend của trang (chỉ khi dự án cho phép).
  - d. Chỉ ảnh chụp và mô tả của sinh viên.
  Cách đã dùng ghi vào phần "Căn cứ" của `ai_raw/`, vì nó giải thích vì sao AI chọn selector như vậy (cột "Vì sao AI sai" sau này).
- Cách đăng nhập nếu feature cần (`playwright-patterns.md` mục 10).
- Dùng API để chuẩn bị / kiểm chứng phụ không (`playwright-patterns.md` mục 12).
- Phạm vi "≥ 3 kiểu assertion": Mỗi file spec tự gọi đủ, mỗi feature, hay toàn suite; kiểu nằm trong hàm dùng chung (`lib/`, page object) có tính cho spec gọi nó không (`playwright-patterns.md` mục 5).
- Kiểm nhiều điểm trong một test (từng ô của một dòng, từng ô tiền): Dừng ở điểm sai đầu tiên (assertion thường) hay dùng `expect.soft` để một lần chạy liệt kê đủ các điểm sai.

Các câu này áp cho **mọi phần** của feature, nên hỏi ngay trước khi viết phần đầu tiên. Hỏi sau khi đã giao phần đầu thì phần đó phải sinh lại (`_v2`) hoặc sửa ở bước `review`.

Các phần sau dùng lại quyết định của phần đầu; chỉ hỏi khi phần mới có điểm khác.

## Cách làm

1. Đọc `01_selected_tc.md` (phần đang làm), file dữ liệu, `02_review.md` mục dữ liệu, spec của các phần trước (dùng lại hàm chung, giữ cùng cách viết).
2. Lấy thông tin giao diện theo cách đã chốt. Snapshot lưu ở `features/<feature>/ai_raw/snapshot_<trang>.txt` (output của script, không sửa).
3. Viết spec theo `playwright-patterns.md`:
   - Import `test`, `expect` từ `../support/fixtures`.
   - Đọc dữ liệu từ file; vòng lặp sinh test; tên test `${c.id}: ${c.title}`.
   - Mỗi test kiểm **đủ** kết quả mong đợi của test case gốc (không chỉ điểm dễ kiểm nhất); kết quả âm kiểm cả "không xảy ra" (không chuyển trang, không tạo dữ liệu).
   - Selector theo thứ tự ưu tiên; không `waitForTimeout`; bắt hộp thoại nếu có; validation trình duyệt kiểm bằng `validity`.
   - Comment ngắn ở đầu file: Phần nào, test case nào, file dữ liệu nào.
4. Viết `ai_raw/script_<nn>_<nội dung>.md`: Đầu file theo mẫu, mục "Căn cứ" (dữ liệu, snapshot, quyết định), mục "Giả định" `GĐ-nn` và "Câu hỏi" `CH-script-nn` (số nối tiếp qua các phần), rồi các khối code, mỗi khối có dòng `File: \`...\`` ngay trước. Phần này sửa file dùng chung do phần trước sinh (page object, hàm trong `lib/`) thì chép **đủ** file đó vào bản AI của phần này và ghi ở đầu file đã đổi gì; `same` với bản của phần trước sẽ báo "Đã được bản AI sau thay" thay cho lỗi.
5. Chép nguyên văn vào `tests/`. Tự kiểm tĩnh:
   - `npx tsc --noEmit`
   - `check_automation.py spec tests/<feature>/<file>.spec.ts`
   - `check_automation.py same features/<feature>/ai_raw/script_<nn>_<nội dung>.md`
   Lỗi tĩnh sửa trước khi giao và ghi ở đầu file `ai_raw/` ("Đã sửa trước khi giao"). **Không chạy trên giao diện** (thuộc bước `review`).

## Tự kiểm

- Mọi test case của phần có test; không có test case ngoài phần.
- Không có dữ liệu test trong spec (`check_automation.py spec` không báo ERROR về dữ liệu viết thẳng).
- Số kiểu assertion của phần và của cả feature (báo cho sinh viên).
- Checklist bước `script` trong `lessons.md`.

**Dừng** sau mỗi phần. Commit message ví dụ: `[A-FR01][script] Add invalid registration spec (AI draft)`.
