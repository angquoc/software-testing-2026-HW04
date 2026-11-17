# A: FR-01 Đăng ký tài khoản script: Ô bắt buộc để trống bị trình duyệt chặn (bản AI)

- Bước: `[A-FR01][script]`, phần P2 (TC-REG-30, TC-REG-32, TC-REG-49)
- Thời gian tạo: 2026-11-18 00:31 (+07:00)
- Công cụ: Claude Code (VS Code extension), model Claude Opus 5.5 (`claude-opus-5-5`), skill `playwright-automation`
- Căn cứ: `01_selected_tc.md` (P2, GĐ-02), `tests/A_FR-01_DangKy/data/required_fields.json`, `02_review.md` (cấu trúc đã chốt, CH-script-01 đến 04), snapshot `ai_raw/snapshot_register.txt` (3 ô có `required`), `Register.jsx` (chỉ để lấy selector), spec và page object hiện tại của P1 (đã qua review: `fieldByLabel.ts` đi từ nhãn lên cha, so đúng chữ hoa thường; nút "Đăng Ký" `exact: true`), `lessons.md` (đọc `validity` trước khi bấm; chứng minh nguyên nhân đã có hiệu lực)
- Quyết định đã chốt dùng lại: POM, assertion trong spec, mỗi spec tự đủ ≥ 3 kiểu, `expect.soft` cho điểm quan sát, chỉ test qua UI (nghe request là quan sát thụ động), Xác nhận mật khẩu có thì nhập (CH-select-06 a)
- File dùng chung đã đổi so với phần trước: `tests/support/pages/RegisterPage.ts` thêm `static readonly labels` (ánh xạ khóa dữ liệu `fullName`, `email`, `password`, `confirmPassword` sang nhãn theo đặc tả), `fillForm` dùng bảng này; phần còn lại giữ đúng bản hiện tại sau review P1
- Đã sửa trước khi giao: Không

## Giả định

- GĐ-script-06: `validity` của ô vi phạm và các ô khác được đọc **trước** khi bấm "Đăng Ký" (bài học FR-17: Đọc sau khi bấm, nếu hệ thống nhận dữ liệu và xóa form thì ô trống nào cũng báo `valueMissing`).
- GĐ-script-07: Bằng chứng "trình duyệt chặn gửi vì đúng ô này" là sự kiện `invalid` phát ra trên ô vi phạm khi bấm "Đăng Ký" (test gắn bộ nghe trước khi bấm, chờ bằng `expect.poll`). "Không có request `POST /api/register`" một mình không đủ: Với TC-REG-30, 32 (mật khẩu hợp lệ), nếu trình duyệt không chặn thì trang vẫn tự chặn vì #42 và cũng không gửi request, test sẽ qua nhầm.
- GĐ-script-08: "Thông báo chỉ ra đúng nguyên nhân" (GĐ-02 của select) đo bằng: Ô vi phạm đúng là trống (`toHaveValue('')`), `validity.valueMissing` của ô đó là `true`, và các ô có giá trị trong dữ liệu vẫn giữ giá trị và `validity.valid` là `true`. Ô có giá trị rỗng trong dữ liệu (TC-REG-49: Mật khẩu và Xác nhận mật khẩu cùng trống) không đưa vào phần "các ô khác hợp lệ".
- GĐ-script-09: Không so chữ bong bóng của trình duyệt (khác nhau giữa Chrome, Edge, Firefox và theo ngôn ngữ máy; `playwright-patterns.md` mục 9).

## Câu hỏi cho sinh viên

- CH-script-05: Kiểm sự kiện `invalid` (GĐ-script-07) là quan sát thêm, không có chữ trong test case HW02 (HW02 chỉ thấy bong bóng bằng mắt). Phương án: a. Giữ, vì nó là bằng chứng trình duyệt chặn do đúng ô đó và tránh qua nhầm khi #42 cũng chặn gửi; b. Bỏ, chỉ kiểm `validity` trước khi bấm, vẫn ở `/register` và không có request.

## Code

File: `tests/support/pages/RegisterPage.ts`

```ts
import type { Locator, Page } from '@playwright/test';
import { fieldByLabel } from './fieldByLabel';

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Trang Đăng ký của Web (FR-01). Selector lấy từ snapshot features/A_FR-01_DangKy/ai_raw/snapshot_register.txt
// và frontend-web/src/pages/Register.jsx: Nhãn không gắn với ô nên tìm ô theo khối chứa nhãn (fieldByLabel).
// Page object chỉ gói selector và thao tác; assertion nằm trong spec.
export class RegisterPage {
  static readonly path = '/register';
  // Nhãn của từng ô theo đặc tả FR-01 (khóa trùng tên trường trong `input` của file dữ liệu).
  static readonly labels: Record<keyof RegisterInput, string> = {
    fullName: 'Họ Tên',
    email: 'Email',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu',
  };
  readonly main: Locator;
  readonly form: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main');
    this.form = this.main.locator('form');
    // exact: So đúng chữ hoa thường theo đặc tả (CH-script-04 a).
    this.submitButton = this.form.getByRole('button', { name: 'Đăng Ký', exact: true });
  }

  field(label: string): Locator {
    return fieldByLabel(this.form, label);
  }

  async goto(): Promise<void> {
    await this.page.goto(RegisterPage.path);
    await this.submitButton.waitFor();
  }

  // Điền form theo dữ liệu. Ô Xác nhận mật khẩu: Có thì nhập, không có thì bỏ qua (CH-select-06 a).
  // Trả về true nếu đã nhập ô Xác nhận mật khẩu.
  async fillForm(input: RegisterInput): Promise<boolean> {
    const labels = RegisterPage.labels;
    await this.field(labels.fullName).fill(input.fullName);
    await this.field(labels.email).fill(input.email);
    await this.field(labels.password).fill(input.password);
    const confirm = this.field(labels.confirmPassword);
    if ((await confirm.count()) === 0) return false;
    await confirm.fill(input.confirmPassword);
    return true;
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
```

File: `tests/A_FR-01_DangKy/02_required_fields.spec.ts`

```ts
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
```
