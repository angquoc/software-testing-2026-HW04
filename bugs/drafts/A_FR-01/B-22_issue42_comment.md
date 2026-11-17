**HW04: Tái hiện bằng automation** (23120061, Playwright 1.65.0)

- Script: `tests/A_FR-01_DangKy/01_register_valid.spec.ts` (repo HW04 cá nhân), test `TC-REG-01: registers with valid base data and redirects to login` và `TC-REG-108: registers with a 9-character password and redirects to login`
- Lần chạy chính thức (`node tools/run.mjs A all`, DB reset về dữ liệu mẫu trước mỗi trình duyệt), Windows 11, EShop commit `85af3ba`:
  - Chrome 157.0.8103.79: 2026-11-18T01:20:51+07:00
  - Edge 157.0.4341.60: 2026-11-18T01:21:33+07:00
  - Firefox 159.0: 2026-11-18T01:22:16+07:00
- Kết quả: **Fail trên cả 3 trình duyệt**, cùng assertion:
  - TC-REG-01 (Họ Tên `Nguyen Van A`, Email `tc01@domain.com`, Mật khẩu `Abcdef1!`): Mong đợi chuyển tới `/login`, thực tế vẫn ở `http://localhost:5173/register`; mong đợi 1 request `POST /api/register`, thực tế 0 (trang chặn trước khi gửi). Trang hiện "Mật khẩu quá yếu! Phải dài tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và KÝ TỰ ĐẶC BIỆT."
  - TC-REG-108 (Mật khẩu 9 ký tự `Abcdefg1!`, Email `tc108@domain.com`): Như TC-REG-01.
- Đặc tả: FR-01: Mật khẩu tối thiểu 8 ký tự, có ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số và 1 ký tự đặc biệt (`@`, `$`, `!`, `%`, `*`, `?`, `&`); sau khi đăng ký thành công, người dùng được chuyển tới trang Đăng nhập. Cả hai mật khẩu trên đều đạt yêu cầu.
- Ghi chú: Hai test mật khẩu yếu của HW04 (TC-REG-56 không có ký tự đặc biệt, TC-REG-107 dài 7 ký tự) qua, nhưng khi thử đổi sang mật khẩu hợp lệ thì vẫn nhận cùng thông báo, nên chưa kiểm được quy tắc mật khẩu khi lỗi này còn.

**Ảnh** (Playwright chụp khi test fail; ảnh Edge giống hệt Chrome)

**A-FR01_F-01_TC-REG-01_chrome.png**

<img width="1280" height="720" alt="41aad0e5-a142-4d94-922b-6b975c9c8701" src="https://github.com/user-attachments/assets/d4ba8a05-8894-4d59-abad-48ce640f293d" />

**A-FR01_F-01_TC-REG-01_firefox.png**

<img width="1280" height="720" alt="9b596075-b867-4125-bf24-4632258eeb00" src="https://github.com/user-attachments/assets/52d56008-c3f1-4976-986c-2909ca901afa" />

**A-FR01_F-02_TC-REG-108_chrome.png**

<img width="1280" height="720" alt="9633c0e5-3d80-42f6-bf64-8023065d8411" src="https://github.com/user-attachments/assets/fb0b7be0-24ab-4d56-b3d2-bf5bb9845acb" />

**A-FR01_F-02_TC-REG-108_firefox.png**

<img width="1280" height="720" alt="54187054-3a0f-4c8a-82ef-f69b788def75" src="https://github.com/user-attachments/assets/740a4ffc-6718-4760-9b87-75526e542641" />
