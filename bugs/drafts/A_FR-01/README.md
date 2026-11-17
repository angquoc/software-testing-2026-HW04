# Bản nháp bình luận HW04 cho FR-01

- Nguồn: Lần chạy chính thức `features/A_FR-01_DangKy/03_results.md` (F-01 đến F-07, phân loại Bug, sinh viên chốt)
- Soạn: AI, 2026-11-18 01:40 (+07:00). Sinh viên duyệt nội dung; AI đăng bằng `gh issue comment` sau khi sinh viên cho phép rõ ràng
- Cả 7 test fail trùng bug HW02, nên chỉ bình luận vào issue cũ (README repo nhóm mục 6), không tạo issue mới
- Đã đăng: Sinh viên duyệt cả 6 bản nháp không sửa và cho phép đăng; AI thay dấu chờ ảnh bằng link GitHub (10 link, MD5 khớp file trên máy) và đăng bằng `gh issue comment` lúc 2026-11-18 01:47. Link từng bình luận ở `bugs/bug_report.md` mục 3. Các file `B-*.md` dưới đây là nội dung đúng như đã đăng

| Mã | Issue | F-nn | Test case | File nháp | Ảnh |
|---|---|---|---|---|---|
| B-22 | #42 (critical) | F-01, F-02 | TC-REG-01, TC-REG-108 | `B-22_issue42_comment.md` | 4 ảnh Playwright (Chrome, Firefox) |
| B-23 | #43 (high) | F-03 | TC-REG-90 | `B-23_issue43_comment.md` | Ảnh form chung (Chrome, Firefox) |
| B-24 | #52 (low) | F-04 | TC-REG-92 | `B-24_issue52_comment.md` | Ảnh form chung (Chrome, Firefox) |
| B-25 | #53 (low) | F-05 | TC-REG-93 | `B-25_issue53_comment.md` | 2 ảnh trang test trong report (sinh viên chụp) |
| B-26 | #51 (low) | F-06 | TC-REG-95 | `B-26_issue51_comment.md` | Ảnh form chung (Chrome, Firefox) |
| B-27 | #50 (medium) | F-07 | TC-REG-96 | `B-27_issue50_comment.md` | 2 ảnh trang test trong report (sinh viên chụp) |

## Ảnh

Ảnh Playwright chép nguyên byte từ `test-results/A_FR-01_DangKy/<trình duyệt>/.../test-failed-1.png` của lần chạy chính thức (MD5 khớp ảnh gốc); ảnh Edge giống hệt Chrome nên không dùng. 5 test của P4 chụp cùng một trang nên dùng chung một ảnh form.

4 ảnh trang chi tiết test trong HTML report chính thức (cho #53, #50): AI chụp theo nhờ của sinh viên (2026-11-18 01:38), mở `reports/A_FR-01_DangKy/<trình duyệt>/index.html` ở chế độ chỉ đọc bằng Playwright (Chrome, khung 1280 x 900, chụp cả trang), bấm vào test rồi chờ mục "Errors" hiện ra. MD5 của mọi file trong `reports/A_FR-01_DangKy/` trước và sau khi chụp giống nhau. AI đã mở xem cả 4 ảnh:

| Tên file | Report, test | Thấy trong ảnh |
|---|---|---|
| `A-FR01_F-05_TC-REG-93_report_chrome.png` | `chrome`, TC-REG-93 | Annotation "Run by: 23120061 \| 2026-11-18T01:20:51+07:00", "Browser: chrome (chromium 157.0.8103.79)"; lỗi "số thẻ h1 trên trang", Expected 1, Received 0 |
| `A-FR01_F-05_TC-REG-93_report_firefox.png` | `firefox`, TC-REG-93 | "Run by: 23120061 \| 2026-11-18T01:22:16+07:00", "Browser: firefox (firefox 159.0)"; cùng lỗi |
| `A-FR01_F-07_TC-REG-96_report_chrome.png` | `chrome`, TC-REG-96 | "Run by" và "Browser" như trên; lỗi `ô "Email" có type="email"`, Expected "email", Received "text", call log `<input ... type="text" ...>` |
| `A-FR01_F-07_TC-REG-96_report_firefox.png` | `firefox`, TC-REG-96 | Như trên, Firefox 159.0 |

Trang chi tiết test không hiển thị tiêu đề report; annotation "Run by" có cùng timestamp với tiêu đề.

## Thứ tự kéo thả ảnh

Kéo cả 10 ảnh **cùng lúc, đúng thứ tự dưới đây** vào **một ô bình luận** trên GitHub (không gửi), chép toàn bộ đoạn link GitHub sinh ra và gửi cho AI. AI ghép link với tên file theo thứ tự này, thay vào các dòng `<!-- ẢNH: ... -->`.

1. `A-FR01_F-01_TC-REG-01_chrome.png`
2. `A-FR01_F-01_TC-REG-01_firefox.png`
3. `A-FR01_F-02_TC-REG-108_chrome.png`
4. `A-FR01_F-02_TC-REG-108_firefox.png`
5. `A-FR01_F-03-07_register_form_chrome.png`
6. `A-FR01_F-03-07_register_form_firefox.png`
7. `A-FR01_F-05_TC-REG-93_report_chrome.png`
8. `A-FR01_F-05_TC-REG-93_report_firefox.png`
9. `A-FR01_F-07_TC-REG-96_report_chrome.png`
10. `A-FR01_F-07_TC-REG-96_report_firefox.png`

Trước khi đăng, AI tải từng link về (dùng token của `gh`, không in token) và so MD5 với file trên máy để chắc ghép đúng.
