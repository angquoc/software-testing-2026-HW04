# Bug report: Automation (HW04)

- Người báo: 23120061
- Repo Issues: https://github.com/angquoc/software-testing-2026-HW02-group/issues
- Nguồn: Lần chạy chính thức của từng feature (`features/<feature>/03_results.md`, timestamp trong tiêu đề report)
- Ảnh: Ảnh tự chụp khi tái hiện bằng tay, lưu ở `bugs/screenshots/` và chèn vào issue hoặc bình luận; ảnh danh sách issue ở `bugs/screenshots/`

## 1. Cách chọn

- Chỉ báo test fail phân loại Bug hoặc Khác giả định (hệ thống làm khác đặc tả hoặc giả định, đã tái hiện bằng tay). (`WORKFLOW.md` mục 6).
- Lỗi đã có issue từ HW02: Không tạo issue mới, bình luận vào issue cũ, ghi rõ "HW04".
- Lỗi mới: Tạo issue theo template "Bug report", tiêu đề `[23120061][FR-xx][Web|Admin] ...`, gắn `severity`, `platform`, `technique` (theo test case HW02), `pool`, `hw: HW04`, tự gán cho mình.
- Severity chọn theo câu hỏi của nhóm (README repo nhóm mục 4.3), sinh viên chốt.
- Ảnh Playwright chụp khi fail không dùng được làm bằng chứng cho FR-17: Ảnh chỉ có phần trên của trang nên không thấy dòng lỗi ở cuối bảng, và hộp thoại đã bị tự đóng trước khi chụp. Sinh viên tái hiện bằng tay trên Chrome và tự chụp, đồng thời kiểm mã còn sau khi tải lại trang.

## 2. Issue mới

| Mã | Issue | Tiêu đề | Feature | Test case (F-nn) | Trình duyệt | Severity |
|---|---|---|---|---|---|---|
| B-04 | [#114](https://github.com/angquoc/software-testing-2026-HW02-group/issues/114) | [23120061][FR-17][Admin] Form Tạo mã giảm giá: Tạo được mã loại số tiền cố định có giá trị giảm 0 ₫ | C FR-17 | TC-CPN-39 (F-04), script `tests/C_FR-17_QuanLyCoupon/03_create_invalid.spec.ts` | Chrome, Edge, Firefox | High |
| B-05 | [#115](https://github.com/angquoc/software-testing-2026-HW02-group/issues/115) | [23120061][FR-17][Admin] Form Tạo mã giảm giá: Tạo được mã có đơn tối thiểu âm (-1 ₫) | C FR-17 | TC-CPN-41 (F-05), script `tests/C_FR-17_QuanLyCoupon/03_create_invalid.spec.ts` | Chrome, Edge, Firefox | High |

Label của cả hai: `bug`, `severity: high`, `platform: admin`, `technique: EP`, `pool: C`, `hw: HW04`. #114 ghi "Related #55" (cùng quy tắc `discount_value` dương, khác loại mã).

## 3. Bình luận vào issue đã có

| Mã | Issue | Test case (F-nn) | Trình duyệt | Link bình luận |
|---|---|---|---|---|
| B-01 | #57 (HW02, Low) | TC-CPN-32 (F-01), `03_create_invalid.spec.ts` | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/57#issuecomment-6936478009 |
| B-02 | #56 (HW02, Medium) | TC-CPN-37 (F-02, Khác giả định A01), `03_create_invalid.spec.ts` | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/56#issuecomment-6936478490 |
| B-03 | #55 (HW02, High) | TC-CPN-38 (F-03), `03_create_invalid.spec.ts` | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/55#issuecomment-6936478866 |

## 4. Test fail không báo

| F-nn | Test case | Lý do |
|---|---|---|
| (không có) | | FR-17: Cả 5 test fail (F-01 đến F-05) đều đã báo ở mục 2 hoặc 3 |

## 5. Ảnh danh sách issue

- `bugs/screenshots/issues_list_hw04.png`: Bộ lọc `is:issue state:open label:"hw: HW04"` (17/11/2026, 9:54): 2 issue mới #114, #115 với đủ label
- `bugs/screenshots/issues_list_C-FR17_commented.png`: Bộ lọc `is:issue 55 56 57 state:open` (17/11/2026, 9:56): 3 issue HW02 đã bình luận, mỗi issue có 1 bình luận
