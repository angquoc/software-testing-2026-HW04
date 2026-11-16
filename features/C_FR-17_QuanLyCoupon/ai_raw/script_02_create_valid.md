# FR-17 script: P2 Thêm mã hợp lệ (bản AI)

- Bước: `[C-FR17][script]`, phần P2 (TC-CPN-01, TC-CPN-02, TC-CPN-10, TC-CPN-14, TC-CPN-19, TC-CPN-23, TC-CPN-116)
- Thời gian tạo: 2026-11-16 13:31 (UTC+07:00)
- Công cụ: Claude Code (VS Code), model Claude Opus 5.5, skill `playwright-automation`
- Căn cứ:
  - `01_selected_tc.md` (P2, CH-select-02), `02_review.md` mục 1 (schema, CH-data-01, CH-data-02), `tests/C_FR-17_QuanLyCoupon/data/create_valid.json`; HW02 `05_final_tc.md`: OUT1 (dòng mới đúng giá trị, còn sau khi tải lại), KQ-H-GD (K1; thông báo thành công và việc xóa form không bắt buộc, A19), GH9 (ô Mã tự chuyển chữ hoa).
  - Quyết định của sinh viên cho P1 dùng lại: Page Object Model, `storageState` của `globalSetup`, DOM lấy bằng `aria_snapshot.mjs`.
  - Quyết định của sinh viên sau P1: CH-script-01 b (mỗi file spec đủ ≥ 3 kiểu assertion), CH-script-02 b (`expect.soft` cho từng ô).
  - Thông tin giao diện: `ai_raw/snapshot_coupons.txt` (form khi loại là "Phần trăm (%)") và snapshot mới `ai_raw/snapshot_coupons_fixed.txt` (form khi chọn "Số tiền cố định (₫)", chỉ đổi ô chọn, không bấm "Tạo mã"). Placeholder của ô giá trị đổi theo loại: "Giá trị % (VD: 10)" và "Số tiền (VD: 50000)". Ô ngày là `input type="date"` có placeholder "Ngày hết hạn".
- File dùng chung đổi so với P1: `tests/support/pages/AdminCouponsPage.ts` (thêm ô của form, `fillForm`, `rowByCode` nhận cả biểu thức chính quy) và `tests/C_FR-17_QuanLyCoupon/lib/expectCell.ts` (thêm tùy chọn `soft`, xuất `escapeRegExp`). Lời gọi cũ của P1 giữ nguyên hành vi. Vì vậy `check_automation.py same ai_raw/script_01_list.md` sẽ báo hai file này khác bản P1; so với bản P2 thì giống. File mới: `lib/assumptions.ts` (hàm ghi mã giả định vào annotation, P1 vẫn dùng bản riêng trong spec)
- Đã sửa trước khi giao: Không có (`npx tsc --noEmit` không báo lỗi ở lần đầu). Không chạy trên giao diện

## Giả định

- GĐ-07: Tìm dòng mới theo ô "Mã" bằng đúng chuỗi đã gõ, không phân biệt hoa thường (GH9). Nếu trang hiện thẻ HTML thành phần tử (TC-CPN-10 sai), ô không có chữ `<b>` nên không tìm thấy dòng và test fail ở bước "Chỉ một dòng có mã này".
- GĐ-08: "Có dòng mới" đo bằng 3 điểm: Trước khi tạo chưa có dòng mã này; sau khi tạo có đúng một dòng mã này và dòng đó hiện ra; tổng số dòng tăng đúng 1. Số dòng trước khi tạo đọc sau khi bảng đã có ít nhất một dòng (sau reset luôn có 4 mã mẫu).
- GĐ-09: Hộp thoại sau khi bấm "Tạo mã" (nếu có) được chấp nhận và ghi chữ vào annotation `Dialog` của test, không khẳng định, vì thông báo thành công không bắt buộc (A19). Nếu là thông báo lỗi thì dòng mới không có và test fail ở các bước trên.
- GĐ-10: Không khẳng định form có được xóa sau khi tạo (A19).
- GĐ-11: Điền form theo thứ tự Mã, Loại, Giá trị, Đơn tối thiểu, Ngày hết hạn, Số lần dùng; chọn Loại trước ô Giá trị vì placeholder của ô Giá trị đổi theo loại. `fill` xóa giá trị có sẵn rồi gõ, nên ô có sẵn `0` (TC-CPN-19) và `1` (TC-CPN-116) vẫn được gõ lại như HW02 ghi. Ô ngày nhận chuỗi `yyyy-mm-dd`.
- GĐ-12: Phân chia hard và soft: Các bước "có dòng" dùng assertion thường (dòng không có thì không còn ô nào để kiểm, tránh mỗi ô chờ hết thời gian); từng ô dùng `expect.soft` (CH-script-02 b), trước và sau khi tải lại.

## Câu hỏi cho sinh viên

- CH-script-03: P1 chưa theo CH-script-01 b và CH-script-02 b (bản P1 đã giao, không sửa `ai_raw/`). Phương án: a. Sinh viên sửa P1 ở bước `review` và ghi vào bảng thay đổi (loại "Quyết định của SV"); b. AI sinh `ai_raw/script_01_list_v2.md` áp hai quyết định, sau khi xong P4.
- CH-script-04: Theo CH-script-01 b, kiểu assertion dùng qua hàm chung có tính cho file spec không? `02_create_valid.spec.ts` gọi thẳng 2 kiểu (Số lượng, Hiển thị); nội dung chữ của từng ô kiểm qua `expectCell` trong `lib/expectCell.ts`. `check_automation.py spec` chỉ với file spec đếm 2 kiểu; với file spec và `lib/expectCell.ts` đếm 3. Phương án: a. Có tính (đếm file spec cùng file `lib/` nó dùng); b. Không tính, mỗi file spec phải tự gọi đủ 3 kiểu.

## Code

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

// Giá trị gõ vào 6 ô của form "Tạo mã giảm giá mới": Chuỗi đúng như gõ, "" là để trống, ngày dạng yyyy-mm-dd.
export type CouponInput = {
  code: string;
  typeOption: string;
  discountValue: string;
  minOrderAmount: string;
  expiredAt: string;
  maxUsesPerUser: string;
};

// Page object của trang "Quản lý Mã Giảm Giá" (Web Admin). Chỉ gói selector và thao tác; assertion nằm trong spec.
export class AdminCouponsPage {
  readonly heading: Locator;
  readonly table: Locator;
  readonly columnHeaders: Locator;
  readonly bodyRows: Locator;
  readonly codeInput: Locator;
  readonly typeSelect: Locator;
  readonly discountInput: Locator;
  readonly minOrderInput: Locator;
  readonly expiredAtInput: Locator;
  readonly maxUsesInput: Locator;
  readonly createButton: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Quản lý Mã Giảm Giá', level: 2 });
    this.table = page.getByRole('table');
    this.columnHeaders = this.table.getByRole('columnheader');
    // Dòng dữ liệu là dòng có ô thường (cell); dòng tiêu đề chỉ có columnheader.
    this.bodyRows = this.table.getByRole('row').filter({ has: page.getByRole('cell') });
    // Form "Tạo mã giảm giá mới" (snapshot_coupons.txt, snapshot_coupons_fixed.txt).
    this.codeInput = page.getByPlaceholder('Mã coupon (VD: SAVE10)', { exact: true });
    this.typeSelect = page.getByRole('combobox');
    // Placeholder của ô giá trị đổi theo loại đang chọn.
    this.discountInput = page.getByPlaceholder(/^(Giá trị % \(VD: 10\)|Số tiền \(VD: 50000\))$/);
    this.minOrderInput = page.getByPlaceholder('Đơn tối thiểu (₫)', { exact: true });
    this.expiredAtInput = page.getByPlaceholder('Ngày hết hạn', { exact: true });
    this.maxUsesInput = page.getByPlaceholder('Số lần dùng tối đa/người', { exact: true });
    this.createButton = page.getByRole('button', { name: 'Tạo mã', exact: true });
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

  // Điền 6 ô; chọn Loại trước ô Giá trị vì placeholder của ô Giá trị đổi theo loại. fill() xóa giá trị có sẵn rồi gõ.
  async fillForm(input: CouponInput): Promise<void> {
    await this.codeInput.fill(input.code);
    await this.typeSelect.selectOption({ label: input.typeOption });
    await this.discountInput.fill(input.discountValue);
    await this.minOrderInput.fill(input.minOrderAmount);
    await this.expiredAtInput.fill(input.expiredAt);
    await this.maxUsesInput.fill(input.maxUsesPerUser);
  }

  // Dòng có ô đúng bằng mã (chuỗi: So đúng; biểu thức chính quy: Theo biểu thức, ví dụ không phân biệt hoa thường).
  rowByCode(code: string | RegExp): Locator {
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

export const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Ô tiền: Nhóm 3 chữ số ngăn bằng "," hoặc "." (CH-select-03 b), "₫" sau số, có hoặc không có một dấu cách (CH-data-02 a).
export function moneyRegExp(amount: number): RegExp {
  const grouped = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '[.,]');
  return new RegExp(`^${grouped} ?₫$`);
}

// soft: true dùng expect.soft (CH-script-02 b): Ô sai được ghi lại, test chạy tiếp để liệt kê đủ các ô sai.
export async function expectCell(
  cell: Locator,
  exp: CellExpectation,
  label: string,
  opts: { soft?: boolean } = {},
): Promise<void> {
  if (exp === null) return;
  const check = expect.configure({ soft: opts.soft ?? false });
  if ('text' in exp) {
    await check(cell, label).toHaveText(exp.text);
  } else if ('textIgnoreCase' in exp) {
    await check(cell, label).toHaveText(new RegExp(`^${escapeRegExp(exp.textIgnoreCase)}$`, 'i'));
    if (exp.noDescendant) await check(cell.locator(exp.noDescendant), `${label}: không có phần tử <${exp.noDescendant}>`).toHaveCount(0);
  } else if ('money' in exp) {
    await check(cell, label).toHaveText(moneyRegExp(exp.money));
  } else {
    await check(cell, `${label}: không rỗng`).not.toHaveText(/^\s*$/);
    await check(cell, `${label}: khác "${exp.notText}"`).not.toHaveText(exp.notText);
  }
}
```

File: `tests/C_FR-17_QuanLyCoupon/lib/assumptions.ts`

```ts
// Ghi mã giả định HW02 vào annotation của test (CH-select-02 a); fail ở các chỗ này phân loại "Khác giả định" ở bước run.
export const assumptionNotes = (assumptions: string[]) =>
  assumptions.map((a) => ({ type: 'Assumption', description: `${a} (giả định HW02)` }));
```

File: `tests/C_FR-17_QuanLyCoupon/02_create_valid.spec.ts`

```ts
// FR-17 P2: Thêm mã hợp lệ qua form "Tạo mã giảm giá mới". TC-CPN-01, 02, 10, 14, 19, 23, 116. Dữ liệu: data/create_valid.json.
// Mỗi test tạo một mã riêng FR17TCnn trên DB vừa reset ở globalSetup; file chạy sau 01_list.spec.ts (workers: 1).
import { test, expect } from '../support/fixtures';
import cases from './data/create_valid.json';
import { AdminCouponsPage, ADMIN_STATE, COLUMN_OF, type CouponInput } from '../support/pages/AdminCouponsPage';
import { expectCell, escapeRegExp, type CellExpectation } from './lib/expectCell';
import { assumptionNotes } from './lib/assumptions';

test.use({ storageState: ADMIN_STATE });

type RowExpectation = Record<keyof typeof COLUMN_OF, CellExpectation>;
type ValidCase = {
  id: string;
  title: string;
  input: CouponInput;
  expected: { outcome: 'created'; row: RowExpectation; persistsAfterReload: boolean };
  assumptions: string[];
};

// Kiểm từng ô của dòng bằng expect.soft (CH-script-02 b).
async function expectRowCells(coupons: AdminCouponsPage, code: string, exp: RowExpectation, when: string) {
  const row = coupons.rowByCode(new RegExp(`^${escapeRegExp(code)}$`, 'i'));
  for (const [field, column] of Object.entries(COLUMN_OF)) {
    const cell = await coupons.cell(row, column);
    await expectCell(cell, exp[field as keyof RowExpectation], `${code} ${when}, cột "${column}"`, { soft: true });
  }
}

test.describe('FR-17 Create coupon with valid data', () => {
  for (const c of cases as unknown as ValidCase[]) {
    test(`${c.id}: ${c.title}`, { annotation: assumptionNotes(c.assumptions) }, async ({ page }) => {
      const coupons = new AdminCouponsPage(page);
      // Ô Mã tự chuyển chữ hoa khi gõ (GH9), nên tìm dòng mới không phân biệt hoa thường.
      const newRow = coupons.rowByCode(new RegExp(`^${escapeRegExp(c.input.code)}$`, 'i'));

      // Hộp thoại (nếu có) ghi vào annotation, không khẳng định: Thông báo thành công không bắt buộc (A19).
      page.on('dialog', async (dialog) => {
        test.info().annotations.push({ type: 'Dialog', description: dialog.message() });
        await dialog.accept();
      });

      await coupons.open();
      await coupons.bodyRows.first().waitFor();
      const rowsBefore = await coupons.bodyRows.count();
      await expect(newRow, 'Trước khi tạo: Chưa có mã này').toHaveCount(0);

      await coupons.fillForm(c.input);
      await coupons.createButton.click();

      // OUT1: Đúng một dòng mới, hiện trên bảng, đúng giá trị từng ô.
      await expect(newRow, 'Sau khi tạo: Chỉ một dòng có mã này').toHaveCount(1);
      await expect(newRow, 'Sau khi tạo: Dòng mới hiện trên bảng').toBeVisible();
      await expect(coupons.bodyRows, 'Sau khi tạo: Số dòng tăng đúng 1').toHaveCount(rowsBefore + 1);
      await expectRowCells(coupons, c.input.code, c.expected.row, 'sau khi tạo');

      if (c.expected.persistsAfterReload) {
        // K1: Tải lại (Web Admin về Dashboard, bấm lại menu), dòng vẫn còn với đúng giá trị.
        await coupons.reloadAndReopen();
        await expect(newRow, 'Sau khi tải lại: Chỉ một dòng có mã này').toHaveCount(1);
        await expect(newRow, 'Sau khi tải lại: Dòng mới hiện trên bảng').toBeVisible();
        await expect(coupons.bodyRows, 'Sau khi tải lại: Số dòng').toHaveCount(rowsBefore + 1);
        await expectRowCells(coupons, c.input.code, c.expected.row, 'sau khi tải lại');
      }
    });
  }
});
```
