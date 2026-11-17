// FR-01 Đăng ký, phần P2: Để trống một ô bắt buộc, trình duyệt chặn gửi form (OUT2: ERR1, ERR2, ERR5).
// Test case: TC-REG-30, TC-REG-32, TC-REG-49. Dữ liệu: data/required_fields.json. Kế hoạch: features/A_FR-01_DangKy/01_selected_tc.md mục 3.
import { test, expect } from '../support/fixtures';
import { RegisterPage, type RegisterInput } from '../support/pages/RegisterPage';
import cases from './data/required_fields.json';

type RequiredCase = (typeof cases)[number];
type FieldKey = keyof RegisterInput;
type FlagWindow = Window & { __fr01InvalidFired?: boolean };

const softExpect = expect.configure({ soft: true });

test.describe('FR-01 Register: empty required field is blocked by the browser (P2)', () => {
  for (const c of cases as RequiredCase[]) {
    test(`${c.id}: ${c.title}`, async ({ page }, testInfo) => {
      const register = new RegisterPage(page);
      const invalidKey = c.expected.invalidField as FieldKey;
      const invalidLabel = RegisterPage.labels[invalidKey];

      // Ghi request đăng ký (quan sát thụ động).
      const registerRequests: string[] = [];
      page.on('request', (r) => {
        if (r.method() === 'POST' && new URL(r.url()).pathname === '/api/register') registerRequests.push(r.url());
      });

      await register.goto();
      const confirmFilled = await register.fillForm(c.input);
      if (!confirmFilled) {
        testInfo.annotations.push({
          type: 'Xác nhận mật khẩu',
          description: 'Form không có ô Xác nhận mật khẩu (#43): Bỏ qua bước nhập (CH-select-06 a)',
        });
      }

      // Nguyên nhân đã có hiệu lực: Ô vi phạm đúng là trống; các ô có giá trị trong dữ liệu vẫn giữ giá trị đó.
      const target = register.field(invalidLabel);
      await expect(target, `ô "${invalidLabel}" để trống theo dữ liệu`).toHaveValue(c.input[invalidKey]);
      const otherKeys = (Object.keys(RegisterPage.labels) as FieldKey[]).filter(
        (k) => k !== invalidKey && c.input[k] !== '' && (k !== 'confirmPassword' || confirmFilled),
      );
      for (const k of otherKeys) {
        await expect(register.field(RegisterPage.labels[k]), `ô "${RegisterPage.labels[k]}" giữ giá trị của dữ liệu`).toHaveValue(
          c.input[k],
        );
      }

      // Trước khi bấm (GĐ-script-06): Ô vi phạm có validity theo dữ liệu (valueMissing); các ô khác hợp lệ.
      const targetState = await target.evaluate(
        (e, key) => (e as HTMLInputElement).validity[key as keyof ValidityState],
        c.expected.validity,
      );
      expect.soft(targetState, `ô "${invalidLabel}": validity.${c.expected.validity} trước khi bấm`).toBe(true);
      for (const k of otherKeys) {
        const valid = await register.field(RegisterPage.labels[k]).evaluate((e) => (e as HTMLInputElement).validity.valid);
        expect.soft(valid, `ô "${RegisterPage.labels[k]}": validity.valid trước khi bấm (chỉ ô vi phạm bị chặn)`).toBe(true);
      }

      // Bằng chứng trình duyệt chặn gửi vì đúng ô này (GĐ-script-07): Sự kiện invalid trên ô vi phạm.
      await target.evaluate((e) => {
        (window as FlagWindow).__fr01InvalidFired = false;
        e.addEventListener('invalid', () => {
          (window as FlagWindow).__fr01InvalidFired = true;
        });
      });
      await register.submit();
      await softExpect
        .poll(() => page.evaluate(() => (window as FlagWindow).__fr01InvalidFired === true), {
          message: `trình duyệt chặn gửi vì ô "${invalidLabel}" (sự kiện invalid)`,
        })
        .toBe(true);

      // OUT2: Vẫn ở /register; không gửi request đăng ký.
      await expect.soft(page, `vẫn ở ${c.expected.path}`).toHaveURL((url) => url.pathname === c.expected.path);
      expect.soft(registerRequests, 'số request POST /api/register').toHaveLength(c.expected.registerRequestSent ? 1 : 0);
    });
  }
});
