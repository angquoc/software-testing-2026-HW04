**HW04: Tái hiện bằng automation** (23120061, Playwright 1.65.0)

- Script: `tests/A_FR-01_DangKy/04_form_checklist.spec.ts` (repo HW04 cá nhân), test `TC-REG-96: uses email and password input types`
- Lần chạy chính thức (`node tools/run.mjs A all`), Windows 11, EShop commit `85af3ba`:
  - Chrome 157.0.8103.79: 2026-11-18T01:20:51+07:00
  - Edge 157.0.4341.60: 2026-11-18T01:21:33+07:00
  - Firefox 159.0: 2026-11-18T01:22:16+07:00
- Kết quả: **Fail trên cả 3 trình duyệt**: Ô Email mong đợi `type="email"`, thực tế `type="text"`. Ô Mật khẩu đạt `type="password"`.
- Đặc tả: FR-22: Trường Email phải dùng `type="email"`.

**Ảnh** (trang chi tiết của test trong HTML report chính thức, thấy lỗi Expected / Received; ảnh Playwright chụp màn hình không thể hiện được thuộc tính `type`)

**A-FR01_F-07_TC-REG-96_report_chrome.png**

<img width="1280" height="2483" alt="06aeecc3-cccc-4ad6-bb6f-044128a2c230" src="https://github.com/user-attachments/assets/2c46cdd9-0252-434b-b0f4-c06ade8ba6d3" />

**A-FR01_F-07_TC-REG-96_report_firefox.png**

<img width="1280" height="2483" alt="22bf5f85-e49c-4047-b52c-cb4569ebc24a" src="https://github.com/user-attachments/assets/101ef0af-aed7-4329-bf4d-c7f9029e75b3" />
