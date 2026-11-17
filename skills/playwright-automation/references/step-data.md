# Bước `data`: Sinh file dữ liệu

**Mục tiêu:** Mỗi test case đã chọn có một dòng dữ liệu gồm input và kết quả mong đợi (lấy từ đặc tả / test case gốc), ở file `.json` hoặc `.csv` riêng.

**Đầu ra:** `ai_raw/data.md` (bản AI, chứa nguyên văn các file dữ liệu), `tests/<feature>/data/*` (giống hệt bản AI ở commit bản AI), mục "Dữ liệu" trong `02_review.md` (bản review).

## Hỏi trước khi viết

- Định dạng: JSON (mặc định; lồng được, có kiểu số / boolean) hay CSV (phẳng, dễ đọc trong Excel). Có thể trộn: Mỗi phần một file.
- Cách tạo giá trị duy nhất (nếu đã chốt cô lập dữ liệu kiểu b) và cách xử lý test case biên độ dài (`playwright-patterns.md` mục 3).
- Kết quả mong đợi dạng nào khi đặc tả không ghi nguyên văn thông báo (`playwright-patterns.md` mục 6).

## Cách làm

1. Thiết kế **schema** chung cho feature trước: Tên trường input (theo tên ô trên giao diện, viết camelCase tiếng Anh), cấu trúc `expected` (ví dụ `outcome`: `success` / `error` / `blocked`; `field`; `messageContains`; `redirect`; giá trị tính toán), trường `oracle` (căn cứ), `note` (tùy chọn). Ghi schema ở đầu `ai_raw/data.md`.
2. Mỗi test case một dòng; `id` đúng mã gốc; `title` tiếng Anh ngắn, mô tả điều test kiểm.
3. Input lấy đúng giá trị của test case gốc. Giá trị biên tính lại độ dài / giá trị và ghi trong `note` (ví dụ `"note": "8 ký tự, biên dưới hợp lệ"`).
4. Kết quả mong đợi lấy từ test case gốc và đặc tả; ghi `oracle` (mục đặc tả hoặc mã test case). **Không** lấy từ hành vi của hệ thống.
5. Dữ liệu tiền điều kiện (tài khoản, sản phẩm, coupon có sẵn) ghi trong file riêng hoặc trường `setup` của dòng, không viết trong spec.
6. Tự kiểm: `check_automation.py data tests/<feature>/data/* --min 12 --ids-from features/<feature>/01_selected_tc.md`.

## Bản review

Trước khi sửa file dữ liệu theo câu trả lời hoặc nhận xét của sinh viên: Kiểm bản AI (`ai_raw/data.md` và `tests/<feature>/data/*`) đã commit chưa; chưa thì dừng và đưa lệnh commit bản AI trước (`rules.md` mục 8).

Sinh viên đối chiếu từng dòng với test case gốc và đặc tả. Mục "Dữ liệu" trong `02_review.md`: Schema đã chốt, quyết định cho câu hỏi, bảng "Thay đổi so với bản AI" (cột "Loại lỗi script" thường là `Dữ liệu`).

## Tự kiểm

- Mỗi test case chọn có đúng một dòng; không có dòng thừa; `id` không trùng.
- Mỗi `expected` có `oracle`.
- Không có giá trị lấy từ hệ thống (câu thông báo chép từ giao diện mà đặc tả không ghi).
- Checklist bước `data` trong `lessons.md`.

**Dừng** sau bản AI và sau bản review. Commit message ví dụ: `[A-FR01][data] Add registration test data (AI draft)`, `[A-FR01][data] Review test data against SRS`.
