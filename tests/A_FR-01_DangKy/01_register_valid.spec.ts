// FR-01 Đăng ký, phần P1: Đăng ký với dữ liệu hợp lệ chuyển tới trang Đăng nhập (OUT1).
// Test case: TC-REG-01, TC-REG-108. Dữ liệu: data/register_valid.json. Kế hoạch: features/A_FR-01_DangKy/01_selected_tc.md mục 3.
import type { Response } from '@playwright/test';
import { test, expect } from '../support/fixtures';
import { RegisterPage } from '../support/pages/RegisterPage';
import { LoginPage } from '../support/pages/LoginPage';
import cases from './data/register_valid.json';

type ValidCase = (typeof cases)[number];

test.describe('FR-01 Register: valid data redirects to login (P1)', () => {
  for (const c of cases as ValidCase[]) {
    test(`${c.id}: ${c.title}`, async ({ page }, testInfo) => {
      const register = new RegisterPage(page);
      const login = new LoginPage(page);

      // Ghi request đăng ký (quan sát thụ động); không dùng waitForResponse để test không kẹt khi trang không gửi request.
      const registerResponses: Response[] = [];
      page.on('response', (r) => {
        if (r.request().method() === 'POST' && new URL(r.url()).pathname === '/api/register') registerResponses.push(r);
      });

      await register.goto();
      const confirmFilled = await register.fillForm(c.input);
      if (!confirmFilled) {
        testInfo.annotations.push({
          type: 'Xác nhận mật khẩu',
          description: 'Form không có ô Xác nhận mật khẩu (#43): Bỏ qua bước nhập (CH-select-06 a)',
        });
      }
      await register.submit();

      // OUT1: Đường dẫn đổi thành /login.
      await expect.soft(page, `chuyển tới ${c.expected.path}`).toHaveURL((url) => url.pathname === c.expected.path);

      // Hệ quả của đăng ký thành công: Đúng 1 request đăng ký được gửi và nhận phản hồi 2xx.
      expect.soft(registerResponses, 'số request POST /api/register').toHaveLength(1);
      if (registerResponses.length > 0) {
        const res = registerResponses[0];
        expect.soft(res.ok(), `phản hồi đăng ký HTTP ${res.status()}`).toBe(true);
      }

      // OUT1: Trang hiện form đăng nhập. Chỉ kiểm khi đã ở /login, vì trang Đăng ký cũng có ô "Mật khẩu" và nút gửi.
      if (new URL(page.url()).pathname !== c.expected.path) {
        testInfo.annotations.push({
          type: 'Bỏ qua',
          description: `Không ở ${c.expected.path} (đang ở ${new URL(page.url()).pathname}): Không kiểm form đăng nhập`,
        });
        return;
      }
      for (const label of c.expected.loginForm.fields) {
        await expect.soft(login.field(label), `ô "${label}" của form đăng nhập`).toBeVisible();
      }
      if (c.expected.loginForm.submitButton) {
        await expect.soft(login.submitButton, 'nút gửi của form đăng nhập').toBeVisible();
      }
    });
  }
});
