**HW04: Tái hiện bằng automation** (23120061, Playwright 1.65.0)

- Script: `tests/A_FR-01_DangKy/04_form_checklist.spec.ts` (repo HW04 cá nhân), test `TC-REG-90: shows a confirm password field`
- Lần chạy chính thức (`node tools/run.mjs A all`), Windows 11, EShop commit `85af3ba`:
  - Chrome 157.0.8103.79: 2026-11-18T01:20:51+07:00
  - Edge 157.0.4341.60: 2026-11-18T01:21:33+07:00
  - Firefox 159.0: 2026-11-18T01:22:16+07:00
- Kết quả: **Fail trên cả 3 trình duyệt**: Mong đợi đúng 1 ô nhập đi cùng nhãn "Xác nhận mật khẩu" trong form Đăng ký, thực tế 0. Form chỉ có 3 ô: Họ Tên, Email, Mật khẩu.
- Đặc tả: FR-01: Phải có trường Xác nhận mật khẩu; hệ thống từ chối nếu hai trường không khớp.
- Ghi chú: Vì thiếu ô này, các test HW04 có nhập form đều bỏ qua bước nhập Xác nhận mật khẩu và ghi annotation trong report; 4 test case HW02 về Xác nhận mật khẩu không khớp (TC-REG-59 đến 62) không tự động hóa được.

**Ảnh** (Playwright chụp khi test fail; ảnh Edge giống hệt Chrome)

**A-FR01_F-03-07_register_form_chrome.png**

<img width="1280" height="720" alt="47c013a2-5ad8-46e1-96da-34006d20db5a" src="https://github.com/user-attachments/assets/572eb9dc-3335-4ef8-a331-4e107e31e621" />

**A-FR01_F-03-07_register_form_firefox.png**

<img width="1280" height="720" alt="76f9a14d-b432-4b52-8b4a-a0a16bf8dfab" src="https://github.com/user-attachments/assets/8cd9d44c-be64-446d-9a53-d0131bf0b56a" />
