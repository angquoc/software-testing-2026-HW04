# FR-17 Quản lý mã giảm giá: Kết quả chạy chính thức

- Bước: `[C-FR17][run]`. Thời gian soạn: 2026-11-17 01:05 (UTC+07:00), AI tóm tắt từ `results.json`. Phân loại F-01 đến F-05 do sinh viên chốt (giữ như đề xuất)
- Người chạy: 23120061 (chạy trên máy của sinh viên)
- Lệnh: `node tools/run.mjs C all` (3 trình duyệt chạy lần lượt, mỗi trình duyệt một report)
- Commit của script khi chạy: `53c939b`; code trong `tests/` và `playwright.config.ts` không đổi từ `19b234a` (`[C-FR17][review] Fix P3 message detection, ...`)
- Môi trường: Windows 11 Home Single Language; Playwright 1.65.0; server EShop chạy cục bộ (backend cổng 3000, Web Admin cổng 5174)
- Dữ liệu: `globalSetup` của feature chạy `node database.js` (reset về 4 mã mẫu FR-09) rồi đăng nhập admin, trước lượt chạy của **mỗi** trình duyệt (CH-select-04 b); mỗi test tạo mã riêng `FR17TCnn`

## 1. Tóm tắt

| Trình duyệt | Phiên bản | Timestamp (khớp tiêu đề report) | Tổng | Pass | Fail | Skip | Flaky | Report |
|---|---|---|---|---|---|---|---|---|
| Chrome | Chromium 157.0.8103.52 | 2026-11-17T00:27:17+07:00 | 18 | 13 | 5 | 0 | 0 | `reports/C_FR-17_QuanLyCoupon/chrome/index.html` |
| Edge | Chromium 157.0.4341.60 | 2026-11-17T00:29:18+07:00 | 18 | 13 | 5 | 0 | 0 | `reports/C_FR-17_QuanLyCoupon/edge/index.html` |
| Firefox | Firefox 159.0 | 2026-11-17T00:30:37+07:00 | 18 | 13 | 5 | 0 | 0 | `reports/C_FR-17_QuanLyCoupon/firefox/index.html` |

Tổng 18 test mỗi trình duyệt, đúng 18 test case ở `01_selected_tc.md` mục 2. Ba trình duyệt cho kết quả giống hệt nhau: Cùng 5 test fail, cùng lỗi, cùng annotation (nơi thấy thông báo, chữ của hộp thoại).

Test qua (13): TC-CPN-50, 93 (P1); TC-CPN-01, 02, 10, 14, 19, 23, 116 (P2); TC-CPN-30, 43, 44 (P3, trình duyệt chặn bằng bong bóng); TC-CPN-51 (P4).

## 2. Test fail

Mọi test fail ở cả 3 trình duyệt.

| Mã | Test case | Trình duyệt | Lỗi (dòng đầu) | Phân loại | Bằng chứng | Issue |
|---|---|---|---|---|---|---|
| F-01 | TC-CPN-32 | Chrome, Edge, Firefox | Hộp thoại "Lỗi: SQLITE_CONSTRAINT: UNIQUE constraint failed: coupons.code": Không chứa chuỗi cấm | Bug | FR-21 (toàn bộ giao diện dùng tiếng Việt; quy tắc chuỗi cấm CH-data-03 c): Hộp thoại lộ chuỗi kỹ thuật của SQLite. Phần còn lại của test qua: Không có dòng mới, dòng `SAVE10` giữ nguyên. Khớp bug HW02 #57 | ⏳ Bước `bugs` |
| F-02 | TC-CPN-37 | Chrome, Edge, Firefox | Có thông báo: Bong bóng của trình duyệt, hộp thoại hoặc chữ mới trên trang; Sau khi bấm "Tạo mã": Không có dòng mã FR17TC37 | Khác giả định (A01) | Kết quả mong đợi dựa trên A01 (phần trăm tối đa 100), FR-17 chỉ ghi "dương" (CH-select-02 a). Hệ thống tạo được mã 150%, không có thông báo nào (annotation `Message`: "không có"). Khớp bug HW02 #56 | ⏳ Bước `bugs` |
| F-03 | TC-CPN-38 | Chrome, Edge, Firefox | Như F-02, mã FR17TC38 | Bug | FR-17: `discount_value` dương. Hệ thống tạo được mã 0%, không có thông báo. Khớp bug HW02 #55 | ⏳ Bước `bugs` |
| F-04 | TC-CPN-39 | Chrome, Edge, Firefox | Như F-02, mã FR17TC39 | Bug | FR-17: `discount_value` dương. Hệ thống tạo được mã loại "Số tiền cố định (₫)" giá trị 0 ₫, không có thông báo. Chưa có bug ở HW02 (test case chưa chạy tay); có thể cùng gốc với #55 (khác loại mã) | ⏳ Bước `bugs` |
| F-05 | TC-CPN-41 | Chrome, Edge, Firefox | Như F-02, mã FR17TC41 | Bug | FR-17: `min_order_amount` >= 0. Hệ thống tạo được mã có đơn tối thiểu -1 ₫ (bảng hiện "-1 ₫"), không có thông báo; ô "Đơn tối thiểu (₫)" không có `min` nên trình duyệt không chặn. Chưa có bug ở HW02 (test case chưa chạy tay) | ⏳ Bước `bugs` |

Không có test fail do script, khác biệt trình duyệt hay flaky.

Ảnh lúc fail: Trong từng report (mục "Attachments" của test), và ở `test-results/C_FR-17_QuanLyCoupon/<trình duyệt>/` (bị `.gitignore` chặn).

## 3. Ghi chú

- Không chạy lại trình duyệt nào; mỗi report là lần chạy đầu của lệnh trên.
- Lỗi worker thoát bất thường (mã 134) từng gặp một lần trên Firefox ở lượt chạy thử (`02_review.md` mục 2.2) không xảy ra ở lần chạy chính thức.
- F-02 phân loại theo CH-select-02 a: Test khẳng định theo giả định A01 của HW02 và ghi mã giả định trong annotation `Assumption`; fail ở đây là hệ thống khác giả định, không phải sai câu chữ của đặc tả. HW02 đã thành bug riêng (#56, Medium) với lý do suy từ công thức FR-09.
- F-02 đến F-05 có cùng hiện tượng: Form nhận giá trị ngoài miền hợp lệ, không có thông báo, mã hiện trên bảng ngay sau khi bấm "Tạo mã". Test dừng ở bước này (assertion thường), nên bước kiểm sau khi tải lại không chạy; việc mã còn sau khi tải lại cần kiểm tay khi viết bug. Gộp hay tách bug quyết định ở bước `bugs` (⏳).
