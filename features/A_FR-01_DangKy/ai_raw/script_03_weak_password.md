# A: FR-01 Đăng ký tài khoản script: Mật khẩu yếu bị trang từ chối (bản AI)

- Bước: `[A-FR01][script]`, phần P3 (TC-REG-56, TC-REG-107)
- Thời gian tạo: 2026-11-18 00:44 (+07:00)
- Công cụ: Claude Code (VS Code extension), model Claude Opus 5.5 (`claude-opus-5-5`), skill `playwright-automation`
- Căn cứ: `01_selected_tc.md` (P3, CH-select-05 a: Thông báo của trang chứa "mật khẩu", không phân biệt hoa thường), `tests/A_FR-01_DangKy/data/weak_password.json`, `02_review.md` (cấu trúc đã chốt, CH-script-01 đến 05), snapshot `ai_raw/snapshot_register.txt`, `Register.jsx` (chỉ để biết thông báo nằm ngoài form và chỉ hiện khi có lỗi), spec và page object hiện tại của P1, P2, `lessons.md` (so theo chữ vì React vẽ lại phần tử; đọc chữ trong cùng một lần `evaluate`; nhánh hệ thống nhận nhầm)
- Quyết định của sinh viên trước khi viết (2026-11-18 00:40, áp cho P3 và TC-REG-97 ở P5): Khung thông báo của trang tìm theo **chữ mới xuất hiện sau khi bấm** trong vùng `main` (phương án b), không theo cấu trúc quanh form, không theo class màu
- File dùng chung đã đổi so với phần trước: `tests/support/pages/RegisterPage.ts` thêm `recordTexts()`, `newTexts()`, `messageByText()`; phần còn lại giữ đúng bản AI P2
- Đã sửa trước khi giao: Không

## Giả định

- GĐ-script-10: "Chữ mới" là chữ của chính một phần tử (chỉ các nút chữ con trực tiếp, gộp khoảng trắng), đang hiển thị (`checkVisibility`), nằm trong `main`, và **không** có trong tập chữ ghi lại ngay trước khi bấm. So theo chữ, không theo phần tử, vì React có thể vẽ lại phần tử cũ với cùng chữ (bài học FR-07). Giá trị trong ô nhập không phải nút chữ nên không bị tính.
- GĐ-script-11: Thông báo chỉ được đọc khi đường dẫn vẫn là `/register`. Nếu hệ thống nhận nhầm và chuyển sang `/login`, chữ mới của trang Đăng nhập ("Quên mật khẩu?") cũng chứa "mật khẩu" và test sẽ qua nhầm. Đường dẫn sai thì test đã fail ở assertion đường dẫn (soft); phần thông báo ghi annotation "Bỏ qua".
- GĐ-script-12: Trước khi bấm, kiểm ô Mật khẩu giữ đúng mật khẩu của dữ liệu (nguyên nhân có hiệu lực, nhất là độ dài 7 ký tự của TC-REG-107).
- GĐ-script-13: Thông báo được định vị lại bằng `getByText(chữ, { exact: true })` trong `main` để dùng assertion web-first. Nếu thông báo có phần tử con (ví dụ chữ in đậm) thì chữ của chính phần tử khác toàn bộ chữ và locator này không khớp; bước `review` kiểm khi chạy thử.
- GĐ-script-14: Theo HW02 (`06_results.md`, QS02), mật khẩu hợp lệ cũng nhận thông báo về mật khẩu (#42). Hai test P3 qua không chứng minh quy tắc mật khẩu được kiểm đúng; phải đọc cùng TC-REG-01, TC-REG-108 (`01_selected_tc.md`, mục "Bug #42 che...", ý 3).

## Câu hỏi cho sinh viên

- CH-script-06: "Không tạo tài khoản" (kết quả âm) đo bằng: Không có phản hồi 2xx cho `POST /api/register`. Điều này không có trong dữ liệu P3 (`expected` chỉ có thông báo và đường dẫn), AI thêm theo cùng lý do với CH-script-02 (hệ quả, quan sát thụ động). Phương án: a. Giữ; b. Bỏ, chỉ kiểm thông báo và đường dẫn.

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

type TextsWindow = Window & { __fr01TextsBefore?: string[] };

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

  // Ghi lại chữ đang có trong vùng main ngay trước khi bấm, để sau đó tìm thông báo của trang là chữ mới
  // (quyết định P3: Chữ mới xuất hiện sau khi bấm). So theo chữ, không theo phần tử: React có thể vẽ lại phần tử cũ.
  async recordTexts(): Promise<void> {
    await this.main.evaluate((root) => {
      const ownText = (el: Element) =>
        Array.from(el.childNodes)
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent ?? '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      const seen: string[] = [];
      root.querySelectorAll('*').forEach((el) => {
        const t = ownText(el);
        if (t) seen.push(t);
      });
      (window as TextsWindow).__fr01TextsBefore = seen;
    });
  }

  // Chữ đang hiển thị trong main mà chưa có lúc recordTexts (mỗi phần tử lấy chữ của chính nó, không gồm phần tử con).
  async newTexts(): Promise<string[]> {
    return this.main.evaluate((root) => {
      const before = (window as TextsWindow).__fr01TextsBefore;
      if (!before) throw new Error('Chưa gọi recordTexts() trước khi bấm');
      const seen = new Set(before);
      const ownText = (el: Element) =>
        Array.from(el.childNodes)
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent ?? '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      const found: string[] = [];
      root.querySelectorAll('*').forEach((el) => {
        if (typeof el.checkVisibility === 'function' && !el.checkVisibility()) return;
        const t = ownText(el);
        if (t && !seen.has(t) && !found.includes(t)) found.push(t);
      });
      return found;
    });
  }

  // Phần tử có đúng chữ đó trong main, để dùng assertion web-first cho thông báo đã tìm được bằng newTexts.
  messageByText(text: string): Locator {
    return this.main.getByText(text, { exact: true });
  }
}
```

File: `tests/A_FR-01_DangKy/03_weak_password.spec.ts`

```ts
// FR-01 Đăng ký, phần P3: Mật khẩu không đạt yêu cầu mạnh, trang báo lỗi về mật khẩu và không đăng ký (OUT2, ERR6).
// Test case: TC-REG-56, TC-REG-107. Dữ liệu: data/weak_password.json. Kế hoạch: features/A_FR-01_DangKy/01_selected_tc.md mục 3.
import type { Response } from '@playwright/test';
import { test, expect } from '../support/fixtures';
import { RegisterPage } from '../support/pages/RegisterPage';
import cases from './data/weak_password.json';

type WeakPasswordCase = (typeof cases)[number];

const softExpect = expect.configure({ soft: true });

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test.describe('FR-01 Register: weak password is rejected with a page message (P3)', () => {
  for (const c of cases as WeakPasswordCase[]) {
    test(`${c.id}: ${c.title}`, async ({ page }, testInfo) => {
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
```
