# A: FR-01 Đăng ký tài khoản: Kết quả chạy chính thức

- Bước: `[A-FR01][run]`. AI tóm tắt từ `reports/A_FR-01_DangKy/<trình duyệt>/results.json` bằng `summarize_results.py` (2026-11-18 01:27 (+07:00)); sinh viên xác nhận phân loại F-01 đến F-07 giống lượt chạy thử đã chốt, và xác nhận terminal có in dòng reset DB ở cả 3 trình duyệt (2026-11-18 01:30)
- Người chạy: 23120061 (chạy trên máy của sinh viên)
- Lệnh: `node tools/run.mjs A all`
- Commit của script khi chạy: `4c93617` (`tests/` sạch lúc chạy; report tạo lúc 01:20 đến 01:23, sau commit này)
- Môi trường: Windows 11 Home Single Language 10.0.26300; Node 24.11.0; Playwright 1.65.0; EShop commit `85af3ba` (backend `http://localhost:3000`, Web `http://localhost:5173`)
- Dữ liệu: Reset DB về dữ liệu mẫu trước mỗi trình duyệt trong `globalSetup` của FR-01 (`tests/A_FR-01_DangKy/setup/globalSetup.ts`, chạy `node database.js` trong `eshop-sut/backend`); không dùng chuỗi duy nhất

## 1. Tóm tắt

Tiêu đề report đọc từ dữ liệu nhúng trong `index.html`; timestamp trùng với annotation "Run by" của từng test. Phiên bản trình duyệt lấy từ annotation `Browser`.

| Trình duyệt | Phiên bản | Timestamp (khớp tiêu đề report) | Tổng | Pass | Fail | Skip | Flaky | Thời gian | Report |
|---|---|---|---|---|---|---|---|---|---|
| Chrome | 157.0.8103.79 (chromium) | 2026-11-18T01:20:51+07:00 | 14 | 7 | 7 | 0 | 0 | 40,3 giây | `reports/A_FR-01_DangKy/chrome/index.html` |
| Edge | 157.0.4341.60 (chromium) | 2026-11-18T01:21:33+07:00 | 14 | 7 | 7 | 0 | 0 | 42,4 giây | `reports/A_FR-01_DangKy/edge/index.html` |
| Firefox | 159.0 | 2026-11-18T01:22:16+07:00 | 14 | 7 | 7 | 0 | 0 | 80,5 giây | `reports/A_FR-01_DangKy/firefox/index.html` |

Tổng mỗi trình duyệt là 14 test, bằng 14 test case đã chọn ở `01_selected_tc.md`.

Test qua trên cả 3 trình duyệt (7): TC-REG-30, TC-REG-32, TC-REG-49 (ô bắt buộc để trống, trình duyệt chặn đúng ô), TC-REG-56, TC-REG-107 (mật khẩu yếu bị trang từ chối; có giới hạn quan sát, mục 3), TC-REG-94 (thứ tự Tab), TC-REG-97 (thông báo lỗi nằm trên nút "Đăng Ký").

## 2. Test fail

7 test fail giống hệt nhau trên cả 3 trình duyệt, ở cùng assertion, và khớp với kết quả chạy thử T1 đến T3 cùng phân loại sinh viên đã chốt ở `02_review.md` mục 2 (2026-11-18 01:14). Cả 7 trùng bug đã có issue từ HW02 (`06_results.md`), nên ở bước `bugs` sẽ bình luận vào issue cũ (WORKFLOW mục 6).

| Mã | Test case | Trình duyệt | Lỗi (dòng đầu) | Phân loại | Bằng chứng | Issue |
|---|---|---|---|---|---|---|
| F-01 | TC-REG-01 | Chrome, Edge, Firefox | "chuyển tới /login": Received `http://localhost:5173/register`; "số request POST /api/register": 0 (mong đợi 1) | Bug | FR-01: Mật khẩu `Abcdef1!` đạt yêu cầu mạnh (8 ký tự, hoa, thường, số, `!`); sau khi đăng ký thành công phải chuyển tới trang Đăng nhập. Trang chặn ngay, không gửi request | #42 |
| F-02 | TC-REG-108 | Chrome, Edge, Firefox | Như F-01, mật khẩu 9 ký tự `Abcdefg1!` | Bug | Như F-01 (FR01-R06, R13; biên LB+1) | #42 |
| F-03 | TC-REG-90 | Chrome, Edge, Firefox | "số ô đi cùng nhãn "Xác nhận mật khẩu"": Expected 1, Received 0 | Bug | FR-01: Phải có trường Xác nhận mật khẩu | #43 |
| F-04 | TC-REG-92 | Chrome, Edge, Firefox | "hue ≥ 200°": `rgb(239, 68, 68)` = hue 0,0°, S 84,2%, L 60,2% | Bug | FR-21: Nút hành động tích cực (Submit) dùng màu xanh dương; nút có nền đỏ | #52 |
| F-05 | TC-REG-93 | Chrome, Edge, Firefox | "số thẻ h1 trên trang": Expected 1, Received 0 | Bug | FR-21: Mỗi trang có đúng 1 thẻ `<h1>` | #53 |
| F-06 | TC-REG-95 | Chrome, Edge, Firefox | 3 lỗi soft: Nhãn "Họ Tên", "Email", "Mật khẩu" đều không có `*` trong nhãn hay ngay cạnh nhãn | Bug | FR-22: Trường bắt buộc phải có ký hiệu `*` bên cạnh nhãn | #51 |
| F-07 | TC-REG-96 | Chrome, Edge, Firefox | "ô "Email" có type="email"": Received `"text"` (ô Mật khẩu đạt `type="password"`) | Bug | FR-22: Trường Email phải dùng `type="email"` | #50 |

Không có fail loại "Khác biệt trình duyệt", "Script" hay "Flaky": Kết quả giống nhau trên 3 trình duyệt, khớp lượt chạy thử, không có lỗi selector hay hết thời gian.

Ảnh Playwright chụp khi fail nằm trong report (thư mục `data/`). Theo bài học FR-17 ở bước `bugs`, ảnh tự động chỉ chụp khung nhìn; ảnh làm bằng chứng cho bình luận issue nên kiểm lại khi tới bước đó.

## 3. Ghi chú

- Mỗi trình duyệt chạy 1 lần chính thức, không chạy lại.
- Firefox chậm hơn đều ở mọi test (khoảng 2 đến 3 giây mỗi test), không có test flaky. Test fail mất khoảng 5,5 giây (Firefox khoảng 8 giây) vì assertion soft chờ hết thời gian chờ của `expect` (5 giây).
- Giới hạn quan sát của TC-REG-56, TC-REG-107 (annotation "Giới hạn quan sát" có trong report của cả 3 trình duyệt, CH-review-01 b): Thử làm hỏng M4 ở `02_review.md` cho thấy mật khẩu hợp lệ cũng nhận thông báo về mật khẩu (#42). Hai test này qua không chứng minh quy tắc mật khẩu được kiểm đúng; phải đọc cùng F-01, F-02.
- TC-REG-01, TC-REG-108: Phần kiểm form đăng nhập không chạy (annotation "Bỏ qua: Không ở /login") vì trang không chuyển tới `/login`. Khi #42 được sửa, phần này có thể fail vì nhãn "Username" của trang Đăng nhập (CH-script-01 a: Ghi là lệch của trang Đăng nhập, FR-02).
- Mọi test có nhập form có annotation "Xác nhận mật khẩu: Form không có ô Xác nhận mật khẩu (#43): Bỏ qua bước nhập" (CH-select-06 a).
- Việc reset DB trước mỗi trình duyệt in ra terminal (`[FR-01 setup] Reset DB xong`), không nằm trong report; AI không thấy được terminal của lần chạy chính thức. Sinh viên xác nhận terminal có in dòng này ở cả 3 trình duyệt.
