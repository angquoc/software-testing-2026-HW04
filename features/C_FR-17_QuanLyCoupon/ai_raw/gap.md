# FR-17 gap: Gap analysis script AI sinh (bản AI)

- Bước: `[C-FR17][gap]`
- Thời gian tạo: 2026-11-17 10:07 (UTC+07:00)
- Công cụ: Claude Code (VS Code), model Claude Opus 5.5, skill `playwright-automation`
- Căn cứ: Bảng "Thay đổi so với bản AI" ở `01_selected_tc.md` mục 6 (8 dòng) và `02_review.md` mục 3 (5 dòng); `02_review.md` mục 2 (cấu trúc, lượt chạy thử, test fail do hệ thống); `03_results.md` (F-01 đến F-05); `bugs/bug_report.md`; đầu các file `ai_raw/script_01_list_v2.md`, `script_02_create_valid_v2.md`; `references/lessons.md` (để không đề xuất trùng bài học đã có)
- Số liệu: `check_automation.py changes features/C_FR-17_QuanLyCoupon/01_selected_tc.md features/C_FR-17_QuanLyCoupon/02_review.md --stats`
- Đã sửa trước khi giao: Không

## 1. Số liệu

Bảng thay đổi có 13 dòng: 7 dòng là lỗi của AI (Loại `Sai`, `Thiếu`, `Thừa`), 6 dòng là quyết định của sinh viên.

Lỗi của AI theo loại lỗi script và nguyên nhân:

| Loại lỗi script | Prompt | Giới hạn model | Đặc thù feature | Tổng |
|---|---|---|---|---|
| Selector dễ vỡ | 0 | 0 | 0 | 0 |
| Assertion yếu / thiếu | 0 | 0 | 2 | 2 |
| Thiếu edge case | 0 | 1 | 0 | 1 |
| Wait gây flaky | 0 | 1 | 0 | 1 |
| Dữ liệu | 0 | 0 | 0 | 0 |
| Khác | 0 | 3 | 0 | 3 |
| Tổng | 0 | 5 | 2 | 7 |

Theo bước: `select` 4 lỗi (1 `Thiếu edge case`, 3 `Khác`); `data` 0 lỗi; `script` 3 lỗi, cả ba ở P3 (`03_create_invalid.spec.ts`), lộ ra ở lượt chạy thử đầu trên Chrome.

Quyết định của sinh viên (6 dòng, không phải lỗi của AI): `Assertion yếu / thiếu` 3 (CH-select-01 c, CH-data-01 b, CH-data-03 c), `Dữ liệu` 2 (CH-select-03 b, CH-select-04 b), `Khác` 1 (CH-select-02 a).

Lỗi lọt qua review, lộ ra ở lần chạy chính thức: Không có. `03_results.md` có 5 test fail (F-01 đến F-05), cả 5 là `Bug` hoặc `Khác giả định`, không có `Script` hay `Flaky`.

## 2. AI sai hoặc bỏ sót gì, vì sao

### 2.1 Assertion yếu / thiếu: Nhận diện thông báo sai khi hệ thống không từ chối (2 lỗi, Đặc thù feature)

- Ví dụ 1: TC-CPN-37, 38, 39, 41, `03_create_invalid.spec.ts` hàm `pageLines`. Trước: Mọi dòng chữ mới của `body` sau khi bấm "Tạo mã" đều tính là thông báo, nên dòng `FR17TC37 ... Xóa` vừa được tạo nhầm làm điều kiện "có thông báo" qua sai. Sau: Bỏ dòng chữ nằm trong bảng, đọc chữ của trang và của bảng trong một lần `page.evaluate`.
- Ví dụ 2: TC-CPN-37, 38, 39, kiểm bong bóng. Trước: Đọc `validity` của ô vi phạm sau khi bấm; form tự xóa sau khi tạo thành công, ô Giá trị trống có `required` nên báo không hợp lệ, script ghi nhầm "bong bóng". Sau: Đọc `validity` trước khi bấm.
- Vì sao: Đặc thù feature: Bản AI chỉ có snapshot của trang lúc chưa nhập gì (`snapshot_coupons.txt`, `snapshot_coupons_fixed.txt`), không có trạng thái sau khi bấm "Tạo mã" (bảng thêm dòng, form tự xóa). Script viết theo giả định "dữ liệu sai thì bị từ chối", nên không xét nhánh hệ thống nhận dữ liệu sai, đúng là nhánh của 4 bug.
- Lần sau: Với phần kiểm dữ liệu không hợp lệ, viết script cho cả nhánh "hệ thống nhận nhầm" (chữ mới có thể là dữ liệu vừa tạo; form có thể tự xóa); khi dự án cho đọc DOM, chụp thêm snapshot của trang ngay sau khi gửi một form hợp lệ để thấy trạng thái sau khi gửi.

### 2.2 Wait gây flaky: Thao tác chờ không giới hạn (1 lỗi, Giới hạn model)

- Ví dụ: TC-CPN-37, 38, 39, 41, đo vị trí thông báo. Trước: `await el.boundingBox()` trên locator không khớp phần tử nào, chờ tới hết 30 giây của test; 4 test kẹt và không tới bước kiểm "không có dòng mới". Sau: Kiểm `await el.count()` trước, không có thì ghi lỗi soft và bỏ qua bước đo. Kết quả: 4 test fail sau khoảng 11 giây, đúng nguyên nhân, trên cả 3 trình duyệt (`02_review.md` mục 2.2, lượt 2 đến 5).
- Vì sao: Giới hạn model: Bản AI dùng `boundingBox()` như một lệnh đọc tức thời, không xét rằng nó chờ phần tử xuất hiện và không theo thời gian chờ của `expect`.
- Lần sau: Đã có trong `lessons.md` (bảng lỗi hay gặp, FR-17 16/11/2026).

### 2.3 Thiếu edge case: Không xét lớp không hợp lệ theo từng loại mã (1 lỗi, Giới hạn model)

- Ví dụ: Bước `select`, bản AI chọn TC-CPN-95 (đúng 1 thẻ `<h1>`) thay vì TC-CPN-39 (loại "Số tiền cố định (₫)", giá trị `0`). Sinh viên đổi sang TC-CPN-39. Ở lần chạy chính thức TC-CPN-39 fail trên cả 3 trình duyệt (F-04) và thành issue mới #114.
- Vì sao: Giới hạn model: AI chỉ xét mỗi trường có một lớp không hợp lệ (`discount_value` = 0 đã có TC-CPN-38 loại phần trăm), không tách lớp đó theo `type`, và ưu tiên test case đã chạy tay hơn test case có khả năng lặp lại bug #55.
- Lần sau: Ở bước `select`, khi một trường có ràng buộc giống nhau cho nhiều giá trị của trường khác (`discount_value` dương cho cả `percent` và `fixed`), chọn ít nhất một test case cho mỗi giá trị; ưu tiên test case cùng lớp với bug đã biết.

### 2.4 Khác: Trình bày thừa hoặc thiếu trong `01_selected_tc.md` (3 lỗi, Giới hạn model)

- Ví dụ: (1) Dòng thống kê có câu giải thích vì sao số test case BVA thấp, sinh viên bỏ; (2) dự phòng liệt kê 7 mã, sinh viên giữ 3 mã; (3) thiếu mục "Điều kiện tiên quyết" (server, dữ liệu vừa reset, tài khoản admin) dù AI đã đọc tài khoản ở `05_final_tc.md` mục 1.3 và `WORKFLOW.md` mục 4.1.
- Vì sao: Giới hạn model: Thêm lời biện minh thay vì chỉ ghi số liệu; liệt kê dàn trải không lọc theo giá trị; đẩy việc đăng nhập sang bước sau mà không ghi tiền điều kiện chung.
- Lần sau: Mẫu `selected_tc.md` có sẵn mục "Điều kiện tiên quyết" (server, dữ liệu, tài khoản) và giới hạn số dự phòng (2 đến 3 mã, mỗi mã một lý do).

## 3. AI làm tốt

- Selector: Không có dòng `Selector dễ vỡ` nào. Mọi selector lấy từ snapshot ARIA (`getByRole`, `getByPlaceholder`, ô tìm theo tên cột) chạy được trên Chrome, Edge, Firefox mà không phải sửa (`02_review.md` mục 2.2). Snapshot thêm `snapshot_coupons_fixed.txt` bắt được việc placeholder của ô giá trị đổi theo loại ("Giá trị % (VD: 10)" và "Số tiền (VD: 50000)") trước khi viết P2.
- Dữ liệu: Bước `data` không có lỗi của AI; 2 dòng thay đổi ở `02_review.md` mục 3 đều là quyết định của sinh viên (CH-data-01 b, CH-data-03 c).
- P1, P2, P4 (10 test) qua ngay ở lượt chạy thử đầu và ở lần chạy chính thức trên cả 3 trình duyệt, không phải sửa code. Bản `_v2` của P1, P2 là để áp quyết định CH-script-01 b, 02 b, 04 b, không phải sửa lỗi.
- Phần chuẩn bị: `globalSetup` reset DB và đăng nhập admin theo feature chạy đúng trước mỗi trình duyệt ở mọi lượt chạy thử và lần chạy chính thức, không phải sửa.
- Bắt bug: TC-CPN-32 bắt được chuỗi kỹ thuật trong hộp thoại (#57) ngay lượt chạy đầu; sau khi sửa 3 lỗi ở mục 2.1, 2.2, P3 bắt được cả 5 lỗi của hệ thống, trong đó 2 lỗi mới (#114, #115).

## 4. Test case không tự động hóa được

Bảng cuối, từ `01_selected_tc.md` mục 4; bước `review`, `run` không phát hiện thêm test case nào không tự động hóa được.

| Mã | Lý do | Cách kiểm thay thế |
|---|---|---|
| TC-CPN-52 | Hệ thống không có hộp thoại xác nhận khi xóa (HW02 S6), điều kiện của test case không tồn tại; theo A07 là Không áp dụng | Không cần. Nếu sau này có hộp thoại thì tự động hóa được (bắt `dialog`, chọn hủy) |
| TC-CPN-91 | Phải đánh giá mọi chữ trên trang là tiếng Việt hay "thuật ngữ kỹ thuật chuẩn"; FR-21 không cho danh sách thuật ngữ; một phần chữ (lịch chọn ngày, bong bóng) là của trình duyệt | Kiểm tay như HW02 (`06_results.md` dòng 4) |
| TC-CPN-60 đến TC-CPN-82, TC-CPN-118, TC-CPN-130, TC-CPN-131, TC-CPN-140 đến TC-CPN-143 (30 test case) | Chỉ quan sát được bằng request trực tiếp tới API; giao diện Web Admin không tạo được input tương ứng. Đề HW04 yêu cầu tự động hóa web frontend, sinh viên chốt "chỉ giao diện" | Script Python của HW02 `features/C_FR-17_QuanLyCoupon/scripts/run_api_tests.py` |

Phần không đo được của test case đã tự động hóa:

| Test case | Phần không đo được | Cách kiểm thay thế |
|---|---|---|
| P3 (8 test case), OUT4 | Vị trí của bong bóng và hộp thoại; ngôn ngữ của bong bóng; thông báo có chỉ đúng nguyên nhân không (CH-select-01 c, CH-script-06 a) | Xem chữ trong annotation `Dialog`, `Page text` của report; xem tay |
| TC-CPN-37, 38, 39, 41 khi hệ thống nhận nhầm | Bước kiểm sau khi tải lại không chạy, vì test dừng ở assertion thường "Không có dòng mã ..." ngay sau khi bấm | Tái hiện bằng tay (đã làm ở bước `bugs`, 17/11/2026: Cả 4 mã còn sau khi tải lại) |
| TC-CPN-32 và P3 nói chung | Ảnh Playwright chụp khi fail chỉ có phần trên của trang (không thấy dòng ở cuối bảng) và chụp sau khi hộp thoại đã bị tự đóng, nên không dùng làm bằng chứng cho issue | Tự chụp khi tái hiện bằng tay (`bugs/bug_report.md` mục 1) |

## 5. Đề xuất bổ sung skill

Sinh viên quyết; AI không sửa skill. Hai bài học về `validity` sau khi gửi và `boundingBox()` chờ không giới hạn đã có trong `lessons.md`, không đề xuất lại.

- Bảng "Lỗi Playwright hay gặp": "Test ghi nhận có thông báo dù hệ thống không báo gì": Tìm chữ mới trên trang mà không bỏ vùng dữ liệu (bảng, danh sách), nên dòng dữ liệu vừa tạo nhầm bị tính là thông báo. Cách xử lý: Bỏ chữ của vùng dữ liệu, đọc chữ trang và vùng dữ liệu trong cùng một lần `evaluate` (mục 2.1).
- "Rút từ lần làm thật" (bước `bugs`): Ảnh `screenshot: 'only-on-failure'` chỉ chụp khung nhìn và chụp sau khi hộp thoại đã bị tự đóng, nên thường không thấy lỗi. Cách xử lý: Tái hiện bằng tay và tự chụp; hoặc ở bước `setup` cân nhắc `fullPage: true` (mục 4).
- Checklist bước `script`: Với test kiểm "bị từ chối", đặt các kiểm tra quan sát (thông báo) trước và dùng soft, để khi hệ thống nhận nhầm, report vẫn ghi đủ; nếu bước "sau khi tải lại" là bằng chứng quan trọng, cân nhắc cho bước "ngay sau khi bấm" là soft để bước tải lại vẫn chạy (mục 4, dòng TC-CPN-37 đến 41).
- Checklist bước `select`: Ràng buộc chung cho nhiều giá trị của trường khác (ví dụ theo `type`) thì chọn ít nhất một test case cho mỗi giá trị; mẫu `selected_tc.md` có sẵn mục "Điều kiện tiên quyết" và giới hạn dự phòng 2 đến 3 mã (mục 2.3, 2.4).

## Giả định

- GĐ-26: "Lỗi của AI" là các dòng có Loại `Sai`, `Thiếu`, `Thừa`; dòng `Quyết định của SV` không tính là lỗi và đếm riêng.
- GĐ-27: Mục 3 "AI làm tốt" dựa trên bảng thay đổi (không có dòng về selector và dữ liệu do AI sai) và các lượt chạy ở `02_review.md` mục 2.2, `03_results.md`.

## Câu hỏi cho sinh viên

- CH-gap-01: Hai bản `_v2` (P1, P2) do AI sinh lại theo CH-script-03 b, 05 a để áp CH-script-01 b, 02 b, 04 b. Các thay đổi này ghi ở đầu hai file `_v2`, chưa có dòng trong bảng "Thay đổi so với bản AI" của `02_review.md`. Phương án: a. Giữ như vậy, `04_gap.md` chỉ nhắc ở mục 3; b. Thêm dòng loại "Quyết định của SV" vào `02_review.md` mục 3 cho mỗi nhóm thay đổi (soft cho từng ô; thêm kiểu assertion gọi thẳng trong spec), rồi đếm lại số liệu.
