**HW04: Tái hiện bằng automation** (23120061, Playwright 1.65.0)

- Script: `tests/A_FR-01_DangKy/04_form_checklist.spec.ts` (repo HW04 cá nhân), test `TC-REG-93: has exactly one h1 describing the page`
- Lần chạy chính thức (`node tools/run.mjs A all`), Windows 11, EShop commit `85af3ba`:
  - Chrome 157.0.8103.79: 2026-11-18T01:20:51+07:00
  - Edge 157.0.4341.60: 2026-11-18T01:21:33+07:00
  - Firefox 159.0: 2026-11-18T01:22:16+07:00
- Kết quả: **Fail trên cả 3 trình duyệt**: Đếm thẻ `h1` trên cả trang `/register`, mong đợi 1, thực tế 0. Tiêu đề "Đăng Ký Tài Khoản" nhìn thấy trên trang không phải thẻ `h1`.
- Đặc tả: FR-21: Mỗi trang có đúng 1 thẻ `<h1>` mô tả nội dung trang.

**Ảnh** (trang chi tiết của test trong HTML report chính thức, thấy lỗi Expected / Received; ảnh Playwright chụp màn hình không thể hiện được thẻ `h1`)

**A-FR01_F-05_TC-REG-93_report_chrome.png**

<img width="1280" height="2483" alt="b19506a9-6690-40b2-b534-afe72886de36" src="https://github.com/user-attachments/assets/41f6b304-edb6-41a2-b372-626355b486f9" />

**A-FR01_F-05_TC-REG-93_report_firefox.png**

<img width="1280" height="2483" alt="1ce33ba1-b090-43b7-a43b-0befd3de903e" src="https://github.com/user-attachments/assets/44db7231-9437-4296-8660-5ede73ca2223" />
