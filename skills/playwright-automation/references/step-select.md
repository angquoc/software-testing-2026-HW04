# Bước `select`: Chọn test case để tự động hóa

**Mục tiêu:** Chọn **≥ 12 test case** (positive, negative, edge đều tính) từ bộ test case thủ công của feature, mỗi test case có căn cứ và khả năng tự động hóa; chia thành các phần để sinh script từng bước; ghi test case không tự động hóa được và lý do.

**Đầu ra:** `ai_raw/select.md` (bản AI), `01_selected_tc.md` (bản sinh viên chốt). Mẫu: `assets/templates/selected_tc.md`.

## Hỏi trước khi viết

- **Tiêu chí chọn** (Quyết định của dự án, nếu chưa chốt thì hỏi), ví dụ:
  - a. Ưu tiên test case đã chạy tay ở bài trước (có kết quả thật để so).
  - b. Ưu tiên test case đã phát hiện bug (regression cho bug đã báo).
  - c. Phủ đủ lớp tương đương và giá trị biên (mỗi biến ít nhất một lớp hợp lệ, một không hợp lệ, các biên).
  - d. Kết hợp, kèm tỉ lệ.
- Số test case muốn chọn (≥ 12; chọn dư vài cái phòng khi có cái không tự động hóa được).
- Test case kiểm qua API ở bộ gốc: Bỏ, giữ là test API, hay chuyển thành thao tác UI (Quyết định của dự án; `playwright-patterns.md` mục 12).
- Cách cô lập dữ liệu nếu chưa chốt (`playwright-patterns.md` mục 3): Ảnh hưởng tới việc test case nào cần dữ liệu chuẩn bị.

## Cách làm

1. Đọc toàn bộ test case thủ công của feature và đặc tả. Lập bảng **toàn bộ** test case với cột: Mã, tiêu đề, loại (positive / negative / edge), kỹ thuật (EP / BVA), đã chạy tay chưa / kết quả, bug liên quan, **khả năng tự động hóa** (`Có`, `Có, cần chuẩn bị`, `Không`) và lý do.
2. Lý do thường gặp cho `Không` / `Có, cần chuẩn bị`:
   - Cần trạng thái không tạo được qua UI hay dữ liệu mẫu (thời gian thực, hết hạn, đồng thời).
   - Kiểm bằng mắt / cảm nhận (bố cục, màu sắc) mà đặc tả không cho tiêu chí đo được.
   - Cần dịch vụ ngoài (email, thanh toán thật).
   - Chỉ kiểm được ở tầng API hoặc DB trong khi dự án yêu cầu qua UI.
   - Ghi lý do cụ thể cho từng test case, không ghi chung chung.
3. Đề xuất danh sách chọn theo tiêu chí; ghi vì sao chọn từng test case.
4. **Kế hoạch sinh script**: Chia các test case chọn thành phần `P1`, `P2`... (mỗi phần một lượt sinh script ở bước `script`), thường theo luồng thao tác giống nhau (ví dụ: P1 đăng ký thành công, P2 lỗi từng ô, P3 biên độ dài). Mỗi phần ghi: Test case, file spec dự kiến, file dữ liệu dự kiến, dữ liệu cần chuẩn bị.
5. Câu hỏi mở `CH-select-nn` (đặc tả mơ hồ ảnh hưởng tới kết quả mong đợi; test case gốc có kết quả mong đợi không đo được bằng máy).

## Bản review (`01_selected_tc.md`)

- Bảng test case **đã chốt**, kế hoạch sinh script đã chốt, bảng test case không tự động hóa được (đề yêu cầu ghi và giải thích), quyết định cho từng câu hỏi.
- Bảng "Thay đổi so với bản AI" (đổi test case chọn, đổi khả năng tự động hóa, đổi cách chia phần).

## Tự kiểm

- Số test case chọn ≥ 12 (hoặc số dự án yêu cầu); mỗi test case có mã gốc.
- Mỗi test case chọn có kết quả mong đợi đo được bằng máy.
- Mỗi test case `Không` có lý do cụ thể.
- Checklist bước `select` trong `lessons.md`.

**Dừng** sau bản AI và sau bản review. Commit message ví dụ: `[A-FR01][select] Select HW02 test cases for automation (AI draft)`.
