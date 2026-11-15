# Bước `gap`: Gap analysis

**Mục tiêu:** Trả lời câu hỏi của đề: AI sai hoặc bỏ sót gì khi sinh script (selector dễ vỡ, assertion yếu, thiếu edge case, wait gây flaky...), vì sao (prompt, giới hạn model, đặc thù feature); và danh sách cuối cùng test case không tự động hóa được.

**Đầu ra:** `ai_raw/gap.md` (bản AI), `04_gap.md` (bản review). Mẫu: `assets/templates/gap.md`.

## Cách làm

1. Đọc mọi bảng "Thay đổi so với bản AI" của feature (`01_selected_tc.md`, `02_review.md`), `03_results.md` (`F-nn` loại `Script` và `Flaky` là lỗi lọt qua review).
2. Đếm theo hai chiều: "Loại lỗi script" × "Vì sao AI sai / bỏ sót". Đếm bằng máy (`check_automation.py changes --stats`), không đếm tay.
3. Mỗi nhóm lỗi: 1 đến 2 ví dụ cụ thể (dòng code trước / sau, mã TC), nguyên nhân, và cách tránh lần sau (sửa prompt, thêm vào skill, thêm bước kiểm). Chỉ dẫn những gì có trong bảng thay đổi; không thêm lỗi không có bằng chứng.
4. Điều AI làm tốt (để phần nhận xét cân bằng): Chỉ ghi khi có bằng chứng (ví dụ phần nào chạy qua ngay trên cả 3 trình duyệt mà không phải sửa).
5. Test case không tự động hóa được: Bảng cuối từ `01_selected_tc.md`, cộng test case phát hiện thêm ở `review` / `run` là không tự động hóa được; mỗi cái có lý do và cách kiểm thay thế (chạy tay, kiểm API).
6. Gợi ý cho skill: Lỗi nào lặp lại nên thêm vào `lessons.md` ("Rút từ lần làm thật"). **Không tự sửa skill**; đưa danh sách để sinh viên quyết.

## Tự kiểm

- Số liệu khớp bảng thay đổi (đếm bằng script).
- Mỗi kết luận có dẫn chứng (mã TC, dòng trong bảng thay đổi, `F-nn`).
- Checklist bước `gap` trong `lessons.md`.

**Dừng** sau bản AI và sau bản review. Commit message ví dụ: `[A-FR01][gap] Add gap analysis and non-automatable test cases`.
