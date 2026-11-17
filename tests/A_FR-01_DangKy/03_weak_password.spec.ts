// FR-01 Đăng ký, phần P3: Mật khẩu không đạt yêu cầu mạnh, trang báo lỗi về mật khẩu và không đăng ký (OUT2, ERR6).
// Test case: TC-REG-56, TC-REG-107. Dữ liệu: data/weak_password.json. Kế hoạch: features/A_FR-01_DangKy/01_selected_tc.md mục 3.
import type { Response } from '@playwright/test';
import { test, expect } from '../support/fixtures';
import { RegisterPage } from '../support/pages/RegisterPage';
import cases from './data/weak_password.json';

type WeakPasswordCase = (typeof cases)[number];

const softExpect = expect.configure({ soft: true });

// Giới hạn quan sát hiện trong report (CH-review-01 b): Thử làm hỏng M4 (02_review.md) cho thấy mật khẩu hợp lệ
// cũng nhận thông báo về mật khẩu (#42), nên test P3 qua không chứng minh quy tắc mật khẩu được kiểm đúng.
const OBSERVATION_LIMIT =
  'Mật khẩu hợp lệ cũng nhận thông báo về mật khẩu (#42; 02_review.md, thử M4): Test qua không chứng minh quy tắc ' +
  'mật khẩu được kiểm đúng. Đọc kết quả cùng TC-REG-01, TC-REG-108';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test.describe('FR-01 Register: weak password is rejected with a page message (P3)', () => {
  for (const c of cases as WeakPasswordCase[]) {
    test(`${c.id}: ${c.title}`, async ({ page }, testInfo) => {
      testInfo.annotations.push({ type: 'Giới hạn quan sát', description: OBSERVATION_LIMIT });
      const register = new RegisterPage(page);

      // Ghi phản hồi của request đăng ký (quan sát thụ động).
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

      // Nguyên nhân đã có hiệu lực: Ô Mật khẩu giữ đúng mật khẩu yếu của dữ liệu.
      await expect(register.field(RegisterPage.labels.password), 'ô Mật khẩu giữ đúng mật khẩu của dữ liệu').toHaveValue(
        c.input.password,
      );

      await register.recordTexts();
      await register.submit();

      // OUT2: Có thông báo của trang (chữ mới trong main sau khi bấm).
      await softExpect
        .poll(() => register.newTexts(), { message: 'có thông báo mới trên trang sau khi bấm "Đăng Ký"' })
        .not.toEqual([]);

      // Chỉ đọc thông báo khi vẫn ở /register: Trang Đăng nhập có chữ "Quên mật khẩu?" cũng chứa "mật khẩu".
      const path = new URL(page.url()).pathname;
      if (path !== c.expected.path) {
        testInfo.annotations.push({
          type: 'Bỏ qua',
          description: `Không còn ở ${c.expected.path} (đang ở ${path}): Không đọc thông báo`,
        });
      } else {
        const texts = await register.newTexts();
        const patterns = c.expected.messageContains.map((k) => new RegExp(escapeRegExp(k), 'iu'));
        const message = texts.find((t) => patterns.every((p) => p.test(t)));
        expect
          .soft(message, `thông báo chứa ${JSON.stringify(c.expected.messageContains)} (không phân biệt hoa thường); chữ mới: ${JSON.stringify(texts)}`)
          .toBeDefined();
        if (message) {
          const messageBox = register.messageByText(message);
          await expect.soft(messageBox, 'thông báo hiển thị trên trang').toBeVisible();
          for (const p of patterns) {
            await expect.soft(messageBox, `thông báo chứa ${p}`).toContainText(p);
          }
        }
      }

      // OUT2: Vẫn ở /register.
      await expect.soft(page, `vẫn ở ${c.expected.path}`).toHaveURL((url) => url.pathname === c.expected.path);

      // Không tạo tài khoản: Không có phản hồi 2xx cho request đăng ký (CH-script-06).
      expect
        .soft(
          registerResponses.filter((r) => r.ok()).map((r) => r.status()),
          'phản hồi 2xx của POST /api/register (tài khoản được tạo)',
        )
        .toEqual([]);
    });
  }
});
