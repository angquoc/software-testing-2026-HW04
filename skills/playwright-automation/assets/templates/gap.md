# <Feature>: Gap analysis script AI sinh

- Bản AI: `ai_raw/gap.md`. Thời gian: <YYYY-MM-DD HH:MM> (<múi giờ>)
- Nguồn số liệu: Bảng "Thay đổi so với bản AI" trong `01_selected_tc.md`, `02_review.md`; `03_results.md`

## 1. Số liệu

| Loại lỗi script | Prompt | Giới hạn model | Đặc thù feature | Tổng |
|---|---|---|---|---|
| Selector dễ vỡ | | | | |
| Assertion yếu / thiếu | | | | |
| Thiếu edge case | | | | |
| Wait gây flaky | | | | |
| Dữ liệu | | | | |
| Khác | | | | |

Lỗi lọt qua review, lộ ra ở lần chạy chính thức: <F-nn loại Script / Flaky>

## 2. AI sai hoặc bỏ sót gì, vì sao

### 2.1 <Nhóm lỗi>

- Ví dụ: <Mã TC, file:dòng, trước → sau>
- Vì sao: <Prompt / Giới hạn model / Đặc thù feature: ...>
- Lần sau: <Sửa prompt / thêm vào skill / thêm bước kiểm>

## 3. AI làm tốt

- <Chỉ ghi khi có bằng chứng>

## 4. Test case không tự động hóa được

| Mã | Lý do | Cách kiểm thay thế |
|---|---|---|

## 5. Đề xuất bổ sung skill

- <Bài học nên thêm vào lessons.md; sinh viên quyết>
