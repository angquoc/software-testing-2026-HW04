# A: FR-01 Đăng ký tài khoản script: Đăng ký hợp lệ chuyển tới trang Đăng nhập (bản AI)

- Bước: `[A-FR01][script]`, phần P1 (TC-REG-01, TC-REG-108)
- Thời gian tạo: 2026-11-18 00:02 (+07:00)
- Công cụ: Claude Code (VS Code extension), model Claude Opus 5.5 (`claude-opus-5-5`), skill `playwright-automation`
- Căn cứ: `01_selected_tc.md` (P1, GĐ-03), `tests/A_FR-01_DangKy/data/register_valid.json`, `02_review.md` mục 1 (ghi chú chữ hoa thường cho bước script), snapshot `ai_raw/snapshot_register.txt` và `ai_raw/snapshot_login.txt` (Chrome 157, 2026-11-17 23:57), mã frontend `eshop-sut/frontend-web/src/pages/Register.jsx`, `Login.jsx` (chỉ để lấy selector), `tests/C_FR-17_QuanLyCoupon/setup/globalSetup.ts` (cách reset DB, sinh viên cho phép đọc), `tests/support/*`
- Quyết định của sinh viên trước khi viết (2026-11-17, áp cho P1 đến P5): Có POM (`RegisterPage`, `LoginPage` trong `tests/support/pages/`), assertion nằm trong spec; thông tin giao diện lấy bằng snapshot và mã frontend; mỗi spec tự đủ ≥ 3 kiểu assertion (kiểu trong page object không tính); reset DB dùng lại cách của FR-17; `expect.soft` cho các điểm quan sát, assertion thường cho bước mà sai thì bước sau vô nghĩa
- Đã sửa trước khi giao: Không

## Giả định

- GĐ-script-01: Nhãn trên giao diện khớp đúng dữ liệu ("Họ Tên", "Email", "Mật khẩu" ở `/register`; "Mật khẩu" ở `/login`). Theo ghi chú của sinh viên ở `02_review.md` mục 1, page object vẫn so nhãn **không phân biệt hoa thường**, bỏ qua khoảng trắng hai đầu và một dấu `*` phía sau (để test không vỡ khi giao diện thêm `*` theo FR-22).
- GĐ-script-02: Nhãn `<label>` không gắn với ô (không có `for`/`id`, snapshot cho thấy ô không có tên truy cập được), nên không dùng `getByLabel`. Ô được tìm theo khối `div` chứa nhãn đó (`fieldByLabel`), trong phạm vi `<form>` của vùng `main`.
- GĐ-script-03: Form đăng nhập chỉ được kiểm khi đường dẫn đã là `/login`. Trang Đăng ký cũng có ô "Mật khẩu" và nút gửi, nên kiểm khi còn ở `/register` sẽ qua nhầm. Đường dẫn sai thì test đã fail ở assertion đường dẫn (soft), phần form ghi annotation "Bỏ qua".
- GĐ-script-04: Request `POST /api/register` được ghi bằng `page.on('response')` (quan sát thụ động, GĐ-data-01), không dùng `waitForResponse`, để test không kẹt tới hết 30 giây khi trang không gửi request (#42 chặn trước khi gửi).
- GĐ-script-05: `tests/support/resetDb.ts` chép logic `resetDatabase` của FR-17 (chạy `node database.js` trong `eshop-sut/backend`, lỗi ném kèm log) thành hàm dùng chung có tham số tên feature. Không sửa file của FR-17.

## Câu hỏi cho sinh viên

- CH-script-01: Snapshot `/login` cho thấy nhãn ô đầu tiên là "Username", không phải "Email" như dữ liệu (`loginForm.fields`, theo FR-02). Khi #42 được sửa và test tới được `/login`, ô "Email" sẽ không tìm thấy và TC-REG-01, 108 fail vì lệch nhãn của trang Đăng nhập (thuộc FR-02), không phải vì FR-01. Hiện #42 chặn trước nên chưa thấy. Phương án: a. Giữ theo dữ liệu: Fail đó là đúng đặc tả FR-02, ghi rõ khi phân loại; b. Sửa dữ liệu theo OUT1 của HW02 ("có ô nhập và nút gửi"): Kiểm form có ít nhất 1 ô nhập và nút gửi, không xét nhãn; c. Chỉ kiểm ô "Mật khẩu" và nút gửi.
- CH-script-02: Phần "đúng 1 request `POST /api/register`, phản hồi 2xx" không có chữ trong OUT1 (OUT1 chỉ nói đường dẫn và form đăng nhập); AI thêm vì đó là hệ quả của "đăng ký thành công" và là kiểu assertion thứ 3 của spec. Phương án: a. Giữ; b. Bỏ, và chọn kiểu thứ 3 khác có trong OUT1.
- CH-script-03: `resetDb.ts` trùng logic với `resetDatabase` trong `tests/C_FR-17_QuanLyCoupon/setup/globalSetup.ts`. Phương án: a. Giữ như vậy (FR-17 không đổi); b. Sau này cho FR-17 (và FR-07 nếu có) gọi `tests/support/resetDb.ts` (việc của phiên điều phối hoặc sinh viên, ngoài phạm vi phiên này).

## Code

File: `tests/support/pages/fieldByLabel.ts`

```ts
import type { Locator } from '@playwright/test';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Mẫu so nhãn: Không phân biệt hoa thường, bỏ qua khoảng trắng hai đầu và một dấu * phía sau
// (FR-01 02_review.md mục 1: Tránh fail vì lệch chữ hoa; FR-22 có thể thêm * vào nhãn).
export function labelPattern(label: string): RegExp {
  return new RegExp(`^\\s*${escapeRegExp(label)}\\s*\\*?\\s*$`, 'iu');
}

// Ô nhập đi cùng nhãn khi <label> không gắn với ô bằng for/id: Tìm khối div chứa nhãn đó trong phạm vi `scope`, lấy ô nhập trong khối.
export function fieldByLabel(scope: Locator, label: string): Locator {
  return scope
    .locator('div')
    .filter({ has: scope.page().locator('label').filter({ hasText: labelPattern(label) }) })
    .locator('input');
}
```

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
  readonly main: Locator;
  readonly form: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main');
    this.form = this.main.locator('form');
    this.submitButton = this.form.getByRole('button', { name: 'Đăng Ký' });
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
    await this.field('Họ Tên').fill(input.fullName);
    await this.field('Email').fill(input.email);
    await this.field('Mật khẩu').fill(input.password);
    const confirm = this.field('Xác nhận mật khẩu');
    if ((await confirm.count()) === 0) return false;
    await confirm.fill(input.confirmPassword);
    return true;
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
```

File: `tests/support/pages/LoginPage.ts`

```ts
import type { Locator, Page } from '@playwright/test';
import { fieldByLabel } from './fieldByLabel';

// Trang Đăng nhập của Web, dùng để kiểm OUT1 của FR-01 (chuyển tới trang Đăng nhập, có form đăng nhập).
// Selector lấy từ snapshot features/A_FR-01_DangKy/ai_raw/snapshot_login.txt và frontend-web/src/pages/Login.jsx.
export class LoginPage {
  static readonly path = '/login';
  readonly form: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.form = page.getByRole('main').locator('form');
    // Đặc tả không nêu tên nút gửi, nên tìm theo loại submit.
    this.submitButton = this.form.locator('button[type="submit"], input[type="submit"]');
  }

  field(label: string): Locator {
    return fieldByLabel(this.form, label);
  }
}
```

File: `tests/support/resetDb.ts`

```ts
import { spawnSync } from 'node:child_process';
import path from 'node:path';

// Reset DB EShop về dữ liệu mẫu: Chạy `node database.js` trong eshop-sut/backend (WORKFLOW.md mục 4.1).
// Logic chép từ resetDatabase của tests/C_FR-17_QuanLyCoupon/setup/globalSetup.ts; lỗi ném rõ ràng kèm log vì globalSetup không hiện trong report.
const BACKEND_DIR = path.resolve(__dirname, '../../../eshop-sut/backend');

export function resetDatabase(tag: string): void {
  const r = spawnSync(process.execPath, ['database.js'], { cwd: BACKEND_DIR, encoding: 'utf8', timeout: 60_000 });
  const log = [
    `  Lệnh: node database.js`,
    `  Thư mục: ${BACKEND_DIR}`,
    `  Mã thoát: ${r.status}${r.signal ? ` (signal ${r.signal})` : ''}`,
    `  stdout:\n${(r.stdout ?? '').trim() || '(trống)'}`,
    `  stderr:\n${(r.stderr ?? '').trim() || '(trống)'}`,
  ].join('\n');
  if (r.error || r.status !== 0) {
    throw new Error(`[${tag} setup] Reset DB thất bại.\n${log}${r.error ? `\n  Lỗi: ${r.error.message}` : ''}`);
  }
  console.log(`[${tag} setup] Reset DB xong.\n${log}`);
}
```

File: `tests/A_FR-01_DangKy/setup/globalSetup.ts`

```ts
import { resetDatabase } from '../../support/resetDb';

// Chuẩn bị cho mỗi lượt chạy FR-01 (một trình duyệt): Reset DB về dữ liệu mẫu, để email của HW02 (tc01@domain.com...)
// chưa tồn tại và test@eshop.com có sẵn (01_selected_tc.md: Cô lập dữ liệu phương án a). FR-01 không cần đăng nhập.
export async function setupFr01(): Promise<void> {
  resetDatabase('FR-01');
}
```

File: `tests/support/globalSetup.ts`

Đổi so với bản trước: Thêm `import { setupFr01 }` và dòng `'A_FR-01_DangKy': setupFr01` vào `FEATURE_SETUPS`; phần còn lại giữ nguyên.

```ts
import { setupFr17 } from '../C_FR-17_QuanLyCoupon/setup/globalSetup';
import { setupFr07 } from '../B_FR-07_GioHang/setup/globalSetup';
import { setupFr01 } from '../A_FR-01_DangKy/setup/globalSetup';

// globalSetup chung của dự án: Chỉ chạy phần chuẩn bị của feature có trong lượt chạy hiện tại.
// tools/run.mjs chạy mỗi trình duyệt bằng một lệnh riêng, nên hàm này chạy một lần trước mỗi trình duyệt.
const FEATURE_SETUPS: Record<string, () => Promise<void>> = {
  'C_FR-17_QuanLyCoupon': setupFr17,
  'B_FR-07_GioHang': setupFr07,
  'A_FR-01_DangKy': setupFr01,
};

// Tham số đường dẫn trên dòng lệnh (bỏ tùy chọn và giá trị của tùy chọn viết tách, ví dụ `--project chrome`).
function pathFilters(): string[] {
  const args = process.argv.slice(2);
  const filters: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === 'test') continue;
    if (a.startsWith('-')) {
      if (!a.includes('=') && args[i + 1] && !args[i + 1].startsWith('-')) i++;
      continue;
    }
    filters.push(a.replace(/\\/g, '/'));
  }
  return filters;
}

function isTargeted(featureDir: string): boolean {
  const label = process.env.RUN_LABEL;
  if (label) return label.startsWith(`${featureDir} x `);
  const filters = pathFilters();
  return filters.length === 0 || filters.some((f) => f.includes(featureDir));
}

export default async function globalSetup(): Promise<void> {
  for (const [featureDir, setup] of Object.entries(FEATURE_SETUPS)) {
    if (isTargeted(featureDir)) await setup();
  }
}
```

File: `tests/A_FR-01_DangKy/01_register_valid.spec.ts`

```ts
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
```
