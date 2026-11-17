# Bug report: Automation (HW04)

- Người báo: 23120061
- Repo Issues: https://github.com/angquoc/software-testing-2026-HW02-group/issues
- Nguồn: Lần chạy chính thức của từng feature (`features/<feature>/03_results.md`, timestamp trong tiêu đề report)
- Ảnh: Ảnh tự chụp khi tái hiện bằng tay và ảnh Playwright chụp khi fail (chỉ khi ảnh thấy được lỗi), lưu ở `bugs/screenshots/` và chèn vào issue hoặc bình luận; ảnh danh sách issue ở `bugs/screenshots/`

## 1. Cách chọn

- Chỉ báo test fail phân loại Bug hoặc Khác giả định (hệ thống làm khác đặc tả hoặc giả định, đã tái hiện bằng tay). (`WORKFLOW.md` mục 6).
- Lỗi đã có issue từ HW02: Không tạo issue mới, bình luận vào issue cũ, ghi rõ "HW04".
- Lỗi mới: Tạo issue theo template "Bug report", tiêu đề `[23120061][FR-xx][Web|Admin] ...`, gắn `severity`, `platform`, `technique` (theo test case HW02), `pool`, `hw: HW04`, tự gán cho mình.
- Severity chọn theo câu hỏi của nhóm (README repo nhóm mục 4.3), sinh viên chốt.
- Ảnh Playwright chụp khi fail không dùng được làm bằng chứng cho FR-17: Ảnh chỉ có phần trên của trang nên không thấy dòng lỗi ở cuối bảng, và hộp thoại đã bị tự đóng trước khi chụp. Sinh viên tái hiện bằng tay trên Chrome và tự chụp, đồng thời kiểm mã còn sau khi tải lại trang.
- FR-07: Một bình luận cho mỗi issue HW02, gom mọi test fail cùng lỗi gốc (một test có nhiều điểm fail có mặt ở nhiều bình luận, mỗi bình luận một điểm). AI mở xem từng ảnh Playwright (Chrome): Dùng 9 ảnh thấy được lỗi (bảng giỏ, nhãn, cột, giỏ trống); sinh viên tự chụp 11 ảnh cho chỗ ảnh Playwright không thể hiện được (lần bấm đầu, không có toast, annotation "Response" của test API, tái hiện TC-CART-100). Bản nháp ở `bugs/drafts/B_FR-07/`.

## 2. Issue mới

| Mã | Issue | Tiêu đề | Feature | Test case (F-nn) | Trình duyệt | Severity |
|---|---|---|---|---|---|---|
| B-04 | [#114](https://github.com/angquoc/software-testing-2026-HW02-group/issues/114) | [23120061][FR-17][Admin] Form Tạo mã giảm giá: Tạo được mã loại số tiền cố định có giá trị giảm 0 ₫ | C FR-17 | TC-CPN-39 (F-04), script `tests/C_FR-17_QuanLyCoupon/03_create_invalid.spec.ts` | Chrome, Edge, Firefox | High |
| B-05 | [#115](https://github.com/angquoc/software-testing-2026-HW02-group/issues/115) | [23120061][FR-17][Admin] Form Tạo mã giảm giá: Tạo được mã có đơn tối thiểu âm (-1 ₫) | C FR-17 | TC-CPN-41 (F-05), script `tests/C_FR-17_QuanLyCoupon/03_create_invalid.spec.ts` | Chrome, Edge, Firefox | High |

| B-21 | [#118](https://github.com/angquoc/software-testing-2026-HW02-group/issues/118) | [23120061][FR-07][Web] Trang chi tiết sản phẩm: Nhập Số lượng 0 vẫn thêm sản phẩm vào giỏ | B FR-07 | TC-CART-100 (F-07), script `tests/B_FR-07_GioHang/01_add_from_detail.spec.ts` | Chrome, Edge, Firefox (tái hiện bằng tay trên Chrome 17/11/2026 22:07) | Medium |

Label của #114, #115: `bug`, `severity: high`, `platform: admin`, `technique: EP`, `pool: C`, `hw: HW04`. #114 ghi "Related #55" (cùng quy tắc `discount_value` dương, khác loại mã).

Label của #118: `bug`, `severity: medium`, `platform: web`, `technique: BVA`, `pool: B`, `hw: HW04`. Severity Medium theo câu hỏi 3 (sai validation, có cách đi vòng bằng cách nhập số lượng hợp lệ). #118 ghi "Related #67" (cùng quy tắc số lượng, qua API) và "Related #110" (FR-06 Mobile của thành viên khác).

## 3. Bình luận vào issue đã có

| Mã | Issue | Test case (F-nn) | Trình duyệt | Link bình luận |
|---|---|---|---|---|
| B-01 | #57 (HW02, Low) | TC-CPN-32 (F-01), `03_create_invalid.spec.ts` | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/57#issuecomment-6936478009 |
| B-02 | #56 (HW02, Medium) | TC-CPN-37 (F-02, Khác giả định A01), `03_create_invalid.spec.ts` | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/56#issuecomment-6936478490 |
| B-03 | #55 (HW02, High) | TC-CPN-38 (F-03), `03_create_invalid.spec.ts` | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/55#issuecomment-6936478866 |
| B-06 | #73 (HW02, Medium) | TC-CART-01, 101, 104, 105, 03 (F-01, F-08, F-10, F-11, F-03): Lần bấm đầu không phản hồi | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/73#issuecomment-6952540082 |
| B-07 | #78 (HW02, Low) | TC-CART-01, 101, 02 (F-01, F-08, F-02): Không có toast hay badge | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/78#issuecomment-6952540870 |
| B-08 | #74 (HW02, Medium) | TC-CART-01 (F-01): K1, giỏ API không có dòng mới, giỏ mất sau khi tải lại | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/74#issuecomment-6952541654 |
| B-09 | #79 (HW02, Low) | TC-CART-02, 03 (F-02, F-03): Không có badge số lượng | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/79#issuecomment-6952542388 |
| B-10 | #70 (HW02, Medium) | TC-CART-03 (F-03): Thêm lại tạo dòng mới | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/70#issuecomment-6952543415 |
| B-11 | #72 (HW02, Medium) | TC-CART-07, 08, 09 (F-04, F-05, F-06): Không có dialog xác nhận xóa | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/72#issuecomment-6952544313 |
| B-12 | #80 (HW02, Low) | TC-CART-09, 10 (F-06, F-12): Giỏ trống không có hình minh họa | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/80#issuecomment-6952545146 |
| B-13 | #77 (HW02, Low) | TC-CART-11 (F-13): Không có nút "Tiếp tục mua sắm" | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/77#issuecomment-6952545885 |
| B-14 | #76 (HW02, Low) | TC-CART-90 (F-20): Cột "Giá" | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/76#issuecomment-6952546606 |
| B-15 | #75 (HW02, Low) | TC-CART-90 (F-20): Nhãn "Tổng tạm tính" | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/75#issuecomment-6952547348 |
| B-16 | #83 (HW02, Low) | TC-CART-95 (F-21): Không highlight "Giỏ hàng" | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/83#issuecomment-6952548352 |
| B-17 | #84 (HW02, Low) | TC-CART-95 (F-21): Không có breadcrumb | Chrome, Edge, Firefox | https://github.com/angquoc/software-testing-2026-HW02-group/issues/84#issuecomment-6952549655 |
| B-18 | #69 (HW02, High) | TC-CART-30 (F-14): API nhận sản phẩm không tồn tại | Chrome (test API, D17) | https://github.com/angquoc/software-testing-2026-HW02-group/issues/69#issuecomment-6952550335 |
| B-19 | #67 (HW02, High) | TC-CART-31, 32, 33, 34, 102 (F-15 đến F-18, F-09): API nhận số lượng không hợp lệ | Chrome (test API, D17) | https://github.com/angquoc/software-testing-2026-HW02-group/issues/67#issuecomment-6952550989 |
| B-20 | #68 (HW02, High) | TC-CART-51 (F-19): API lưu giá do client gửi | Chrome (test API, D17) | https://github.com/angquoc/software-testing-2026-HW02-group/issues/68#issuecomment-6952551697 |

## 4. Test fail không báo

| F-nn | Test case | Lý do |
|---|---|---|
| (không có) | | FR-17: Cả 5 test fail (F-01 đến F-05) đều đã báo ở mục 2 hoặc 3 |
| (không có) | | FR-07: Cả 21 test fail (F-01 đến F-21) đều đã báo ở mục 2 (#118) hoặc mục 3 (B-06 đến B-20). Issue HW02 #71, #81, #82 không có bình luận HW04 vì TC-CART-04 đến 06, 92, 93 không được tự động hóa (`features/B_FR-07_GioHang/01_selected_tc.md` mục 4, D-05, D-07) |

## 5. Ảnh danh sách issue

- `bugs/screenshots/issues_list_hw04.png`: Bộ lọc `is:issue label:"hw: HW04" author:angquoc` (chụp lại 17/11/2026, 22:56, thay ảnh lúc 9:54): 3 issue mới #118 (FR-07), #115, #114 (FR-17) với đủ label
- `bugs/screenshots/issues_list_C-FR17_commented.png`: Bộ lọc `is:issue 55 56 57 state:open` (17/11/2026, 9:56): 3 issue HW02 đã bình luận, mỗi issue có 1 bình luận
- `bugs/screenshots/issues_list_B-FR07_commented.png`: Bộ lọc `is:issue 67 68 69 70 72 73 74 75 76 77 78 79 80 83 84` (17/11/2026, 22:57): 15 issue HW02 của FR-07 đã bình luận HW04, mỗi issue có 1 bình luận, label giữ nguyên như HW02
