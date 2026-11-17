# <Feature>: Test case chọn để tự động hóa

- Bước: `[<phạm vi>][select]` (bản review). Bản AI: `ai_raw/select.md`
- Thời gian: <YYYY-MM-DD HH:MM> (<múi giờ>)
- Nguồn test case: <đường dẫn bộ test case thủ công>; đặc tả: <đường dẫn>
- Tiêu chí chọn: <Quyết định của sinh viên>
- Điều kiện tiên quyết chung: <server cần chạy, trạng thái dữ liệu (ví dụ vừa reset), tài khoản>

## 1. Toàn bộ test case của feature

| Mã | Tiêu đề | Loại | Kỹ thuật | Đã chạy tay / kết quả | Bug liên quan | Tự động hóa | Lý do |
|---|---|---|---|---|---|---|---|
| TC-XXX-01 | | positive / negative / edge | EP / BVA | | #<số> | Có / Có, cần chuẩn bị / Không | |

## 2. Test case được chọn (<n> test case)

| Mã | Loại | Kỹ thuật | Kết quả mong đợi (tóm tắt) | Căn cứ | Phần | Dữ liệu cần chuẩn bị | Vì sao chọn |
|---|---|---|---|---|---|---|---|

Thống kê: <n> positive, <n> negative, <n> edge; <n> EP, <n> BVA.

Dự phòng (2 đến 3 mã, mỗi mã một lý do): <Mã>: <lý do>.

## 3. Kế hoạch sinh script

| Phần | Luồng thao tác | Test case | File spec | File dữ liệu |
|---|---|---|---|---|
| P1 | | | `tests/<feature>/<...>.spec.ts` | `tests/<feature>/data/<...>.json` |

## 4. Test case không tự động hóa được

| Mã | Lý do cụ thể | Cách kiểm thay thế |
|---|---|---|

## 5. Câu hỏi và quyết định

| Mã | Câu hỏi | Quyết định của SV |
|---|---|---|

## 6. Thay đổi so với bản AI

(Bảng theo `changes_table.md`.)
