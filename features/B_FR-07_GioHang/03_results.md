# FR-07 Giỏ hàng: Kết quả chạy chính thức

- Bước: `[B-FR07][run]`. AI soạn từ `reports/B_FR-07_GioHang/<trình duyệt>/results.json` (`summarize_results.py` và đối chiếu từng điểm fail); sinh viên chốt phân loại
- Thời gian soạn: 2026-11-17 21:02 (UTC+07:00)
- Cập nhật lần 1: Sinh viên điền thời điểm reset dữ liệu (17:23, 17:33) và chốt phân loại F-01 đến F-21 đều là Bug
- Người chạy: 23120061 (chạy trên máy của sinh viên)
- Lệnh: `node tools/run.mjs B all`
- Commit của script khi chạy: `0b8e4c7` (17:23, ngay trước lần chạy Chrome lúc 17:24); `tests/` không có thay đổi chưa commit
- Môi trường: Windows 11 (10.0.26300); Node 24.11.0; Playwright 1.65.0; EShop commit `85af3ba` (backend `http://localhost:3000`, Web `http://localhost:5173`)
- Dữ liệu (D10): Reset dữ liệu EShop thủ công trước lượt chạy (WORKFLOW mục 4.1). Reset lúc 17:23 ngày 17/11/2026, ngay trước lượt chạy Chrome (17:24); reset lại lúc 17:33 sau khi lượt chạy kết thúc, để dọn dữ liệu của TC-CART-53 (HW02 dặn reset sau test case này). Giỏ Web tự cô lập theo context trình duyệt; test API đánh giá theo dòng mới giữa trước và sau nên không phụ thuộc dữ liệu giỏ API có sẵn
- Phạm vi: 15 test giao diện chạy trên cả 3 trình duyệt; 12 test API chỉ chạy trên Chrome, Edge và Firefox bỏ qua bằng `test.skip` (D17)

## 1. Tóm tắt

| Trình duyệt | Phiên bản | Timestamp (khớp tiêu đề report) | Tổng | Pass | Fail | Skip | Flaky | Report |
|---|---|---|---|---|---|---|---|---|
| Chrome | Chromium 157.0.8103.52 | 2026-11-17T17:24:05+07:00 | 27 | 6 | 21 | 0 | 0 | `reports/B_FR-07_GioHang/chrome/index.html` |
| Edge | Chromium 157.0.4341.60 | 2026-11-17T17:26:36+07:00 | 27 | 1 | 14 | 12 | 0 | `reports/B_FR-07_GioHang/edge/index.html` |
| Firefox | Firefox 159.0 | 2026-11-17T17:29:02+07:00 | 27 | 1 | 14 | 12 | 0 | `reports/B_FR-07_GioHang/firefox/index.html` |

Tiêu đề report: "Run by: 23120061 | <timestamp> | B_FR-07_GioHang x <trình duyệt>". Phiên bản trình duyệt lấy từ annotation `Browser` của từng test.

Test qua: TC-CART-94 (cả 3 trình duyệt); TC-CART-35, 36, 50, 53, 54 (Chrome, test API).

Đối chiếu với các lượt chạy thử ở `02_review.md` mục 2.3 (lượt 1 đến 4): Mọi test có cùng trạng thái và cùng tập điểm fail; không có điểm fail mới, không có test flaky.

## 2. Test fail

Mã `F-nn` theo thứ tự của `summarize_results.py`. Mọi test fail ở mọi trình duyệt chạy test đó (UI: 3 trình duyệt; API: Chrome). Cột "Lỗi" liệt kê đủ các điểm fail (assertion `soft`), không chỉ dòng đầu. Cột "Issue" là issue HW02 đã có (đối chiếu `HW02/bugs/bug_report.md`); bình luận "HW04" vào issue cũ hoặc tạo issue mới làm ở bước `bugs`.

| Mã | Test case | Trình duyệt | Lỗi (các điểm fail) | Phân loại | Bằng chứng | Issue |
|---|---|---|---|---|---|---|
| F-01 | TC-CART-01 | Chrome, Edge, Firefox | (1) Lần bấm "Thêm vào giỏ hàng" đầu tiên không phản hồi trong 1,5 giây; (2) OUT15: Không có toast hay badge; (3) K1: `GET /api/cart` không có dòng mới (Received `[]`); (4) K1 sau khi tải lại: Giỏ trống (số dòng, dòng iPhone, tổng) | Bug | FR-06 (nút Thêm vào giỏ hàng có phản hồi trực quan), FR07-R33; K1 (D-01); HW02 ghi nhận 2 | #73, #78, #74 |
| F-02 | TC-CART-02 | Chrome, Edge, Firefox | (1) OUT15: Không có toast hay badge sau khi bấm "Thêm vào giỏ" ở trang chủ; (2) R24: Không có badge số lượng (mong đợi 2) | Bug | FR-24, FR07-R33; FR-23 (badge số lượng), A17 | #78, #79 |
| F-03 | TC-CART-03 | Chrome, Edge, Firefox | (1) Lần bấm đầu không phản hồi; (2) Số dòng 3 thay vì 2; (3) Có 2 dòng "iPhone 15 Pro Max"; (4) Dòng iPhone đầu Số lượng 1 (mong đợi 4), Thành tiền 30,000,000 (mong đợi 120,000,000); (5) Không có badge (mong đợi 5) | Bug | FR07-R08, R09 (thêm cùng sản phẩm tăng số lượng, không tạo dòng mới); FR-23 | #73, #70, #79 |
| F-04 | TC-CART-07 | Chrome, Edge, Firefox | (1) Không có dialog xác nhận khi bấm "Xóa"; (2) Sau bước "hủy" chỉ còn 1 dòng (mong đợi 2), tổng 30,000,000 (mong đợi 58,000,000): Dòng Samsung đã bị xóa ngay | Bug | FR07-R11, FR-24 (xóa phải có dialog xác nhận); CH-data-03 a | #72 |
| F-05 | TC-CART-08 | Chrome, Edge, Firefox | Không có dialog xác nhận (phần xóa dòng, tổng, thêm lại đạt) | Bug | FR07-R11, FR-24 | #72 |
| F-06 | TC-CART-09 | Chrome, Edge, Firefox | (1) Không có dialog xác nhận; (2) Giỏ trống không có hình minh họa (thông báo có từ "trống", không còn bảng: Đạt) | Bug | FR07-R11, R15, FR-24; OUT9 (D-03) | #72, #80 |
| F-07 | TC-CART-100 | Chrome, Edge, Firefox | Giỏ có 1 dòng sau khi nhập "Số lượng:" = 0 và bấm thêm (mong đợi 0 dòng); không có toast, badge không đổi: Đạt | Bug (ứng viên) | FR-06 (Số lượng chỉ nhận số nguyên dương, tối thiểu là 1), FR07-R27; A31 | Chưa có (HW02 không chạy TC-CART-100). SV tái hiện bằng tay ở bước `bugs` |
| F-08 | TC-CART-101 | Chrome, Edge, Firefox | (1) Lần bấm đầu không phản hồi; (2) OUT15: Không có toast hay badge (giỏ 1 dòng, Số lượng 2, 60,000,000: Đạt) | Bug | FR-06, FR07-R33 | #73, #78 |
| F-09 | TC-CART-102 | Chrome | (1) `POST /api/cart` với `quantity` -1 trả HTTP 200; (2) Giỏ có dòng mới `quantity` -1 | Bug | FR-06, FR07-R29; KQ-KH-API | #67 |
| F-10 | TC-CART-104 | Chrome, Edge, Firefox | Lần bấm đầu không phản hồi (Thành tiền, tổng 996,000,000 với 2 dấu phân cách: Đạt) | Bug | FR-06, FR07-R33; HW02 ghi nhận 2 | #73 |
| F-11 | TC-CART-105 | Chrome, Edge, Firefox | Lần bấm đầu không phản hồi (Thành tiền, tổng 1,000,000,000 với 3 dấu phân cách: Đạt) | Bug | FR-06, FR07-R33; HW02 ghi nhận 2 | #73 |
| F-12 | TC-CART-10 | Chrome, Edge, Firefox | Giỏ trống không có hình minh họa (thông báo, không còn bảng, badge ẩn, về trang chủ: Đạt) | Bug | FR07-R15, FR-24; OUT9 (D-03) | #80 |
| F-13 | TC-CART-11 | Chrome, Edge, Firefox | Không có nút "Tiếp tục mua sắm" (test bấm "← Mua tiếp" theo bước của test case: Về trang chủ, giỏ còn 1 dòng iPhone × 1: Đạt) | Bug | FR07-R12 | #77 |
| F-14 | TC-CART-30 | Chrome | (1) `POST /api/cart` với `id` 9999 trả HTTP 200; (2) Giỏ có dòng mới `id` 9999 | Bug | FR07-R29; A24 | #69 |
| F-15 | TC-CART-31 | Chrome | (1) `quantity` 0 trả HTTP 200; (2) Giỏ có dòng mới `quantity` 0 | Bug | FR-06, FR07-R27, R29 | #67 |
| F-16 | TC-CART-32 | Chrome | (1) `quantity` 1.5 trả HTTP 200; (2) Giỏ có dòng mới `quantity` 1.5 | Bug | FR-06, FR07-R27, R29 | #67 |
| F-17 | TC-CART-33 | Chrome | (1) `quantity` "abc" trả HTTP 200; (2) Giỏ có dòng mới `quantity` "abc" | Bug | FR07-R29 | #67 |
| F-18 | TC-CART-34 | Chrome | (1) Body thiếu `quantity` trả HTTP 200; (2) Giỏ có dòng mới không có `quantity` | Bug | FR07-R29; A25 | #67 |
| F-19 | TC-CART-51 | Chrome | (1) Dòng mới lưu `price` 1 do client gửi; (2) Dòng mới không có `price` 30000000 | Bug | FR07-R29; A24 | #68 |
| F-20 | TC-CART-90 | Chrome, Edge, Firefox | (1) Tiêu đề cột thứ 2 là "Giá" thay vì "Đơn giá"; (2) Nhãn tổng không có "Tổng cộng"; (3) Nhãn tổng là "Tổng tạm tính" (2 dòng, mỗi dòng có nút xóa: Đạt) | Bug | FR-07 (các cột), FR07-R14 (nhãn chính xác "Tổng cộng", không phải "Tổng tạm tính") | #76, #75 |
| F-21 | TC-CART-95 | Chrome, Edge, Firefox | (1) Link "Giỏ hàng" ở trang Giỏ hàng không có `aria-current` và style giống hệt ở trang chủ; (2) Không có breadcrumb | Bug | FR-23 (navbar highlight trang đang chọn; breadcrumb bắt buộc ở trang Giỏ hàng); D-06 | #83, #84 |

Thống kê phân loại (sinh viên đã chốt): 21 Bug (trong đó F-07 là ứng viên bug mới, chưa có issue), 0 Khác biệt trình duyệt, 0 Script, 0 Flaky.

## 3. Ghi chú

- Không chạy lại trình duyệt nào; mỗi report là lần chạy đầu tiên của lượt chính thức.
- Lỗi script tìm được ở bước `review` (S1, S2, N1, N2, `02_review.md` mục 3) đã sửa và commit trước lần chạy này (`c985b00`, `81d7090`).
- Lần bấm "Thêm vào giỏ hàng" đầu tiên ở trang chi tiết không phản hồi (F-01, 03, 08, 10, 11): Script ghi lỗi `soft` rồi bấm thêm một lần (quyết định ở `02_review.md` mục 2.1), nên các điểm kiểm sau đó (giỏ, tiền) vẫn được kiểm. HW02 báo hiện tượng này ở #73 với mô tả "giữ số lượng mặc định 1 thì không thêm"; cách ghi vào #73 hay tách issue chốt ở bước `bugs`.
- F-07 (TC-CART-100) chỉ bắt được vì script bấm thêm lần thứ hai (GĐ-09 của bản AI P1): Nếu chỉ bấm một lần, giỏ trống do lỗi lần bấm đầu và test qua nhầm.
- Ảnh Playwright chụp khi fail ở `test-results/B_FR-07_GioHang/<trình duyệt>/`; theo `lessons.md` (ảnh khi fail chỉ chụp khung nhìn, sau khi hộp thoại đã đóng), bằng chứng cho bug nên do sinh viên tái hiện và tự chụp ở bước `bugs`. Mã HTTP và body của test API có trong annotation "Response" của từng test (report Chrome).
