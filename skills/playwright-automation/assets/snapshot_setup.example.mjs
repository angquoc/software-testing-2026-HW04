// Ví dụ module --setup cho scripts/aria_snapshot.mjs: Đăng nhập rồi mở trang cần chụp.
// Chép ra thư mục scratch của phiên (không commit nếu có mật khẩu thật), sửa selector và địa chỉ theo hệ thống.
export default async function (page) {
  await page.getByLabel('<Nhãn ô email>').fill('<email tài khoản thử>');
  await page.getByLabel('<Nhãn ô mật khẩu>').fill('<mật khẩu tài khoản thử>');
  await page.getByRole('button', { name: '<Chữ trên nút đăng nhập>' }).click();
  await page.waitForURL('**/<trang sau khi đăng nhập>');
  await page.goto('<URL trang cần chụp>');
}
