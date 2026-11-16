# FR-17 script: P1 Danh sách mã ngay sau reset (bản AI)

- Bước: `[C-FR17][script]`, phần P1 (TC-CPN-50, TC-CPN-93)
- Thời gian tạo: 2026-11-16 12:10 (UTC+07:00)
- Công cụ: Claude Code (VS Code), model Claude Opus 5.5, skill `playwright-automation`
- Căn cứ:
  - `01_selected_tc.md` (P1, điều kiện tiên quyết, CH-select-02, CH-select-04), `02_review.md` mục 1 (schema dữ liệu, CH-data-01 đến CH-data-03), `tests/C_FR-17_QuanLyCoupon/data/list.json`.
  - Quyết định của sinh viên cho phần đầu của feature: Dùng Page Object Model; đăng nhập một lần và dùng lại `storageState`; reset DB và đăng nhập trong `globalSetup` theo feature, chỉ chạy khi lượt chạy là feature C, lỗi reset hoặc đăng nhập phải ném lỗi rõ ràng kèm log ở terminal; lấy DOM bằng `aria_snapshot.mjs`.
  - Thông tin giao diện: Snapshot `ai_raw/snapshot_login.txt` (trang đăng nhập Web Admin: Ô placeholder "Email", "Password", nút "Login") và `ai_raw/snapshot_coupons.txt` (trang "Quản lý Mã Giảm Giá": Menu là `listitem`, tiêu đề `h1` "EShop Admin", `h2` "Quản lý Mã Giảm Giá", bảng có 7 `columnheader`). Lúc chụp, trang lưu trạng thái đăng nhập ở `localStorage` khóa `adminToken`, không có cookie hay `sessionStorage` (in ra khi chụp), nên `storageState` giữ được đăng nhập. Snapshot chỉ dùng để chọn selector, không dùng làm kết quả mong đợi.
  - Kiểm môi trường trước khi viết (sinh viên cho phép): `node database.js` trong `eshop-sut/backend` reset được khi backend đang chạy (tạo mã tạm qua API, chạy reset, `GET /api/coupons` còn đúng 4 mã mẫu; đăng nhập lại được). Thử bằng cấu hình tạm và `--list`: Project dependency chạy cả khi lệnh lọc thư mục của feature khác, nên dùng `globalSetup` có kiểm feature.
- Đã sửa trước khi giao: `npx tsc --noEmit` báo 5 lỗi kiểu ở `01_list.spec.ts` (TypeScript gộp hai phần tử của `list.json` thành một kiểu có trường tùy chọn, nên `'rows' in exp` không thu hẹp được kiểu). Sửa: Thêm kiểu `RowExpectation`, `ListExpected`, ép `c.expected` về `ListExpected`, bỏ ép kiểu ở lời gọi `expectCell`. Không chạy trên giao diện

## Giả định

- GĐ-01: `globalSetup` chạy trong tiến trình chính của Playwright, một lần cho mỗi lệnh `npx playwright test`. `tools/run.mjs` chạy mỗi trình duyệt bằng một lệnh riêng, nên reset và đăng nhập diễn ra trước mỗi trình duyệt. Chạy thẳng `npx playwright test tests/C_FR-17_QuanLyCoupon/` không có `--project` thì 3 trình duyệt dùng chung một lần reset (chỉ dùng khi chạy thử).
- GĐ-02: Lượt chạy là feature C khi `RUN_LABEL` (do `run.mjs` đặt) bắt đầu bằng `C_FR-17_QuanLyCoupon x `; nếu không có `RUN_LABEL` thì khi một tham số đường dẫn trên dòng lệnh chứa `C_FR-17_QuanLyCoupon`, hoặc không có tham số đường dẫn nào (chạy cả bộ). Lọc theo tên file ngắn (ví dụ `01_list`) sẽ không kích hoạt setup.
- GĐ-03: Đăng nhập trong `globalSetup` bằng Chrome (`channel: 'chrome'`). `storageState` chỉ chứa `localStorage` của `http://localhost:5174`, dùng lại được cho Edge và Firefox.
- GĐ-04: Đăng nhập thành công khi tiêu đề `h1` "EShop Admin" hiện ra và `localStorage` có `adminToken` (theo snapshot). Đây là điều kiện của bước chuẩn bị, không phải kết quả mong đợi của test case.
- GĐ-05: Tìm ô theo tên cột: Lấy vị trí của cột trong hàng tiêu đề (`columnheader`) rồi lấy ô cùng vị trí trong dòng; không cố định số thứ tự cột trong code. Tìm dòng theo ô có chữ đúng bằng Mã.
- GĐ-06: TC-CPN-50 không khẳng định thứ tự 4 dòng (test case HW02 không nêu thứ tự).

## Câu hỏi cho sinh viên

- CH-script-01: Phạm vi "≥ 3 kiểu assertion" (D13) chưa chốt. P1 dùng 2 kiểu: Số lượng (`toHaveCount`) và nội dung chữ (`toHaveText` với chuỗi, biểu thức chính quy, `not.toHaveText`). Phương án: a. Tính trên cả feature (P2 đến P4 sẽ có thêm `validity`, `dialog`, vị trí, `toBeVisible`); b. Mỗi file spec phải đủ 3 kiểu (P1 cần thêm một kiểu, ví dụ `toBeVisible` cho tiêu đề trang).
- CH-script-02: Khi một ô sai, test dừng ở ô đó (assertion thường). Phương án: a. Giữ như vậy; b. Dùng `expect.soft` cho từng ô, để một lần chạy liệt kê đủ mọi ô sai của TC-CPN-50 (tiện cho bug report).

## Code

File: `tests/support/accounts.ts`

```ts
// Tài khoản thử có sẵn của EShop (WORKFLOW.md mục 4.1, HW02 05_final_tc.md mục 1.3).
// Không phải thông tin cá nhân; để ở đây để spec không chứa mật khẩu.
export const ADMIN_ACCOUNT = { email: 'admin@eshop.com', password: 'Admin123!' };
```

File: `tests/support/pages/AdminCouponsPage.ts`

```ts
import path from 'node:path';
import type { Locator, Page } from '@playwright/test';
import { ADMIN_URL } from '../urls';

// Trạng thái đăng nhập admin do globalSetup của FR-17 lưu (thư mục .auth/ bị .gitignore chặn).
export const ADMIN_STATE = path.resolve(__dirname, '../../../.auth/admin.json');

// Khóa của một dòng trong dữ liệu -> tên cột trên bảng (tên cột theo test case HW02).
export const COLUMN_OF = {
  code: 'Mã',
  type: 'Loại',
  discountValue: 'Giá trị',
  minOrderAmount: 'Đơn tối thiểu',
  expiredAt: 'Hết hạn',
  maxUsesPerUser: 'Giới hạn/người',
} as const;

// Page object của trang "Quản lý Mã Giảm Giá" (Web Admin). Chỉ gói selector và thao tác; assertion nằm trong spec.
export class AdminCouponsPage {
  readonly heading: Locator;
  readonly table: Locator;
  readonly columnHeaders: Locator;
  readonly bodyRows: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Quản lý Mã Giảm Giá', level: 2 });
    this.table = page.getByRole('table');
    this.columnHeaders = this.table.getByRole('columnheader');
    // Dòng dữ liệu là dòng có ô thường (cell); dòng tiêu đề chỉ có columnheader.
    this.bodyRows = this.table.getByRole('row').filter({ has: page.getByRole('cell') });
  }

  // Mở Web Admin (đã đăng nhập nhờ storageState) rồi vào menu "Mã Giảm Giá".
  async open(): Promise<void> {
    await this.page.goto(ADMIN_URL);
    await this.openFromMenu();
  }

  async openFromMenu(): Promise<void> {
    await this.page.getByRole('listitem').filter({ hasText: /^Mã Giảm Giá$/ }).click();
    await this.heading.waitFor();
  }

  // Tải lại trang: Web Admin quay về Dashboard sau khi tải lại, nên bấm lại menu (HW02 06_results.md mục 6).
  async reloadAndReopen(): Promise<void> {
    await this.page.reload();
    await this.openFromMenu();
  }

  rowByCode(code: string): Locator {
    return this.bodyRows.filter({ has: this.page.getByRole('cell', { name: code, exact: true }) });
  }

  async columnIndex(column: string): Promise<number> {
    await this.columnHeaders.first().waitFor();
    const names = (await this.columnHeaders.allInnerTexts()).map((s) => s.trim());
    const index = names.indexOf(column);
    if (index < 0) throw new Error(`Bảng không có cột "${column}". Các cột: ${names.join(', ')}`);
    return index;
  }

  async cell(row: Locator, column: string): Promise<Locator> {
    return row.getByRole('cell').nth(await this.columnIndex(column));
  }
}
```

File: `tests/C_FR-17_QuanLyCoupon/setup/globalSetup.ts`

```ts
import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { ADMIN_URL } from '../../support/urls';
import { ADMIN_ACCOUNT } from '../../support/accounts';
import { ADMIN_STATE } from '../../support/pages/AdminCouponsPage';

// Chuẩn bị cho mỗi lượt chạy FR-17 (một trình duyệt): Reset DB về dữ liệu mẫu, rồi đăng nhập admin và lưu storageState.
// Quyết định của SV (bước script, phần P1): globalSetup theo feature; lỗi phải rõ ràng, kèm log.
const BACKEND_DIR = path.resolve(__dirname, '../../../../eshop-sut/backend');

function resetDatabase(): void {
  const r = spawnSync(process.execPath, ['database.js'], { cwd: BACKEND_DIR, encoding: 'utf8', timeout: 60_000 });
  const log = [
    `  Lệnh: node database.js`,
    `  Thư mục: ${BACKEND_DIR}`,
    `  Mã thoát: ${r.status}${r.signal ? ` (signal ${r.signal})` : ''}`,
    `  stdout:\n${(r.stdout ?? '').trim() || '(trống)'}`,
    `  stderr:\n${(r.stderr ?? '').trim() || '(trống)'}`,
  ].join('\n');
  if (r.error || r.status !== 0) {
    throw new Error(`[FR-17 setup] Reset DB thất bại.\n${log}${r.error ? `\n  Lỗi: ${r.error.message}` : ''}`);
  }
  console.log(`[FR-17 setup] Reset DB xong.\n${log}`);
}

async function loginAndSaveState(): Promise<void> {
  const browser = await chromium.launch({ channel: 'chrome' });
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto(ADMIN_URL);
    await page.getByPlaceholder('Email').fill(ADMIN_ACCOUNT.email);
    await page.getByPlaceholder('Password').fill(ADMIN_ACCOUNT.password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.getByRole('heading', { name: 'EShop Admin', level: 1 }).waitFor({ timeout: 10_000 });
    const token = await page.evaluate(() => localStorage.getItem('adminToken'));
    if (!token) throw new Error('Không thấy khóa adminToken trong localStorage sau khi đăng nhập');
    mkdirSync(path.dirname(ADMIN_STATE), { recursive: true });
    await context.storageState({ path: ADMIN_STATE });
    console.log(`[FR-17 setup] Đăng nhập admin xong, lưu storageState: ${ADMIN_STATE}`);
  } catch (e) {
    const bodyText = (await page.locator('body').innerText().catch(() => '(không đọc được trang)')).slice(0, 500);
    throw new Error(
      `[FR-17 setup] Đăng nhập admin thất bại.\n  URL: ${page.url()}\n  Tài khoản: ${ADMIN_ACCOUNT.email}\n` +
        `  Lỗi: ${(e as Error).message}\n  Nội dung trang (500 ký tự đầu):\n${bodyText}`,
    );
  } finally {
    await browser.close();
  }
}

export async function setupFr17(): Promise<void> {
  resetDatabase();
  await loginAndSaveState();
}
```

File: `tests/support/globalSetup.ts`

```ts
import { setupFr17 } from '../C_FR-17_QuanLyCoupon/setup/globalSetup';

// globalSetup chung của dự án: Chỉ chạy phần chuẩn bị của feature có trong lượt chạy hiện tại.
// tools/run.mjs chạy mỗi trình duyệt bằng một lệnh riêng, nên hàm này chạy một lần trước mỗi trình duyệt.
const FEATURE_SETUPS: Record<string, () => Promise<void>> = {
  'C_FR-17_QuanLyCoupon': setupFr17,
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

File: `playwright.config.ts`

```ts
import { defineConfig, devices } from '@playwright/test';
import { WEB_URL } from './tests/support/urls';
import { STUDENT_ID, localIsoNow } from './tests/support/runInfo';

// Mỗi lần chạy (1 feature x 1 trình duyệt) ra 1 HTML report có "Run by: 23120061" + timestamp ISO (đề §6, §11; D9):
// Ở tiêu đề report, và ở annotation của từng test (tests/support/fixtures.ts).
// tools/run.mjs đặt các biến môi trường bên dưới; chạy thẳng `npx playwright test` thì dùng giá trị mặc định.
// Worker kế thừa biến môi trường của tiến trình chính, nên mọi worker thấy cùng một timestamp.
process.env.RUN_STARTED_AT ??= localIsoNow();
const runStartedAt = process.env.RUN_STARTED_AT;
const runLabel = process.env.RUN_LABEL ?? 'ad-hoc';
const reportDir = process.env.RUN_REPORT_DIR ?? 'playwright-report';
const resultsDir = process.env.RUN_RESULTS_DIR ?? 'test-results';

export default defineConfig({
  testDir: './tests',
  outputDir: resultsDir,
  // Chuẩn bị theo feature trước mỗi lượt chạy (FR-17: Reset DB, đăng nhập admin lưu storageState). Xem tests/support/globalSetup.ts.
  globalSetup: './tests/support/globalSetup.ts',
  // Dữ liệu EShop dùng chung một DB: Chạy tuần tự cho an toàn. Đổi khi chốt D10.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  timeout: 30_000,
  expect: { timeout: 5_000 },

  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: reportDir,
        open: 'never',
        title: `Run by: ${STUDENT_ID} | ${runStartedAt} | ${runLabel}`,
      },
    ],
    // Kết quả dạng máy đọc được, để soạn 03_results.md từ đúng lần chạy (không thay HTML report).
    ['json', { outputFile: `${reportDir}/results.json` }],
  ],

  use: {
    baseURL: WEB_URL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'off',
  },

  projects: [
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
});
```

File: `tests/C_FR-17_QuanLyCoupon/lib/expectCell.ts`

```ts
import type { Locator } from '@playwright/test';
import { expect } from '../../support/fixtures';

// Kỳ vọng cho một ô của bảng mã giảm giá, theo schema đã chốt ở 02_review.md mục 1.1.
export type CellExpectation =
  | { text: string }
  | { textIgnoreCase: string; noDescendant?: string }
  | { money: number }
  | { notEmpty: true; notText: string }
  | null;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Ô tiền: Nhóm 3 chữ số ngăn bằng "," hoặc "." (CH-select-03 b), "₫" sau số, có hoặc không có một dấu cách (CH-data-02 a).
export function moneyRegExp(amount: number): RegExp {
  const grouped = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '[.,]');
  return new RegExp(`^${grouped} ?₫$`);
}

export async function expectCell(cell: Locator, exp: CellExpectation, label: string): Promise<void> {
  if (exp === null) return;
  if ('text' in exp) {
    await expect(cell, label).toHaveText(exp.text);
  } else if ('textIgnoreCase' in exp) {
    await expect(cell, label).toHaveText(new RegExp(`^${escapeRegExp(exp.textIgnoreCase)}$`, 'i'));
    if (exp.noDescendant) await expect(cell.locator(exp.noDescendant), `${label}: không có phần tử <${exp.noDescendant}>`).toHaveCount(0);
  } else if ('money' in exp) {
    await expect(cell, label).toHaveText(moneyRegExp(exp.money));
  } else {
    await expect(cell, `${label}: không rỗng`).not.toHaveText(/^\s*$/);
    await expect(cell, `${label}: khác "${exp.notText}"`).not.toHaveText(exp.notText);
  }
}
```

File: `tests/C_FR-17_QuanLyCoupon/01_list.spec.ts`

```ts
// FR-17 P1: Danh sách mã ngay sau reset. TC-CPN-50, TC-CPN-93. Dữ liệu: data/list.json.
// Tên file bắt đầu bằng 01_ để chạy đầu tiên trong lượt (workers: 1), ngay sau globalSetup reset DB và đăng nhập admin.
import { test, expect } from '../support/fixtures';
import cases from './data/list.json';
import { AdminCouponsPage, ADMIN_STATE, COLUMN_OF } from '../support/pages/AdminCouponsPage';
import { expectCell, type CellExpectation } from './lib/expectCell';

test.use({ storageState: ADMIN_STATE });

type ListCase = (typeof cases)[number];
type RowExpectation = { code: { text: string } } & Record<Exclude<keyof typeof COLUMN_OF, 'code'>, CellExpectation>;
type ListExpected =
  | { rowCount: number; columnCount: number; rows: RowExpectation[] }
  | { moneyCells: { column: string; codes: string[] }[]; moneyPattern: string };

// Ghi mã giả định HW02 vào annotation của test (CH-select-02 a); fail ở các chỗ này phân loại "Khác giả định" ở bước run.
const assumptionNotes = (c: ListCase) =>
  (c.assumptions as string[]).map((a) => ({ type: 'Assumption', description: `${a} (giả định HW02)` }));

test.describe('FR-17 Coupon list right after reset', () => {
  for (const c of cases as ListCase[]) {
    test(`${c.id}: ${c.title}`, { annotation: assumptionNotes(c) }, async ({ page }) => {
      const coupons = new AdminCouponsPage(page);
      await coupons.open();
      const exp = c.expected as ListExpected;

      if ('rows' in exp) {
        // TC-CPN-50: Đúng số dòng, đủ số cột, mỗi mã mẫu một dòng với đúng giá trị từng ô.
        await expect(coupons.bodyRows, 'Số dòng mã').toHaveCount(exp.rowCount);
        await expect(coupons.columnHeaders, 'Số cột').toHaveCount(exp.columnCount);
        for (const r of exp.rows) {
          const row = coupons.rowByCode(r.code.text);
          await expect(row, `Dòng ${r.code.text}`).toHaveCount(1);
          for (const [field, column] of Object.entries(COLUMN_OF)) {
            const cell = await coupons.cell(row, column);
            await expectCell(cell, r[field as keyof RowExpectation], `${r.code.text}, cột "${column}"`);
          }
        }
      }

      if ('moneyCells' in exp) {
        // TC-CPN-93: Mọi ô tiền có ₫ và phân cách hàng nghìn.
        const pattern = new RegExp(exp.moneyPattern);
        for (const group of exp.moneyCells) {
          for (const code of group.codes) {
            const cell = await coupons.cell(coupons.rowByCode(code), group.column);
            await expect(cell, `${code}, cột "${group.column}"`).toHaveText(pattern);
          }
        }
      }
    });
  }
});
```
