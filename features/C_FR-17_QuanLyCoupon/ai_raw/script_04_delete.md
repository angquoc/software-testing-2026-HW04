# FR-17 script: P4 Xóa mã (bản AI)

- Bước: `[C-FR17][script]`, phần P4 (TC-CPN-51)
- Thời gian tạo: 2026-11-16 14:57 (UTC+07:00)
- Công cụ: Claude Code (VS Code), model Claude Opus 5.5, skill `playwright-automation`
- Căn cứ:
  - `01_selected_tc.md` (P4; TC-CPN-52 không tự động hóa được vì không có hộp thoại xác nhận), `02_review.md` mục 1, `tests/C_FR-17_QuanLyCoupon/data/delete.json`; HW02 `05_final_tc.md` TC-CPN-51: Bước 1 tạo `FR17TC51`, bước 2 bấm "Xóa" (có hộp thoại thì chọn đồng ý); OUT8, các dòng khác giữ nguyên; K7 tải lại; K8 tạo lại, mong đợi OUT1.
  - Quyết định của sinh viên dùng lại: Page Object Model, `storageState`, DOM lấy bằng `aria_snapshot.mjs`, `expect.soft` cho từng ô (CH-script-02 b), mỗi file spec tự gọi đủ 3 kiểu assertion (CH-script-04 b).
  - Thông tin giao diện: `ai_raw/snapshot_coupons.txt` (mỗi dòng có ô "Hành động" chứa nút "Xóa").
- File dùng chung đổi so với P2: `tests/support/pages/AdminCouponsPage.ts` thêm hàm `deleteButton(row)` (nút "Xóa" trong một dòng). Phần còn lại của file giữ nguyên như P2; bản này chép đủ file
- Đã sửa trước khi giao: Không có (`npx tsc --noEmit` và `check_automation.py spec` không báo lỗi ở lần đầu). Không chạy trên giao diện

## Giả định

- GĐ-20: "Các dòng khác giữ nguyên" đo bằng chữ của từng dòng: Đọc chữ của mọi dòng trước khi tạo `FR17TC51`; sau khi xóa (và sau khi tải lại) bảng phải có đúng các dòng đó, đúng thứ tự, đúng chữ. Nếu trang đổi thứ tự dòng sau khi tải lại thì điểm này fail và cần xem lại.
- GĐ-21: Bước 1 (tạo mã) là điều kiện của test case, chỉ kiểm có đúng một dòng; giá trị từng ô của lần tạo đầu không kiểm (đã có ở P2). Lần tạo lại (K8) kiểm đủ OUT1 như P2: Đúng một dòng, hiện trên bảng, số dòng tăng 1, từng ô đúng giá trị.
- GĐ-22: Hộp thoại khi xóa (nếu có) được chấp nhận và ghi chữ vào annotation `Dialog`, không khẳng định (FR-17 không yêu cầu xác nhận).
- GĐ-23: Kiểm "không còn dòng" ngay sau khi bấm "Xóa" có thể qua trước khi máy chủ trả lời; kiểm sau khi tải lại (K7) là điểm chốt.

## Câu hỏi cho sinh viên

Không có câu hỏi mới.

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

  // Nút "Xóa" của một dòng (cột "Hành động", snapshot_coupons.txt).
  deleteButton(row: Locator): Locator {
    return row.getByRole('button', { name: 'Xóa', exact: true });
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

File: `tests/C_FR-17_QuanLyCoupon/04_delete.spec.ts`

```ts
// FR-17 P4: Xóa mã vừa tạo. TC-CPN-51. Dữ liệu: data/delete.json.
// Bước 1 tạo mã của test case; bước 2 bấm "Xóa" trên dòng đó; OUT8 (dòng biến mất, các dòng khác giữ nguyên);
// K7 tải lại vẫn không còn; K8 tạo lại được (OUT1).
import { test, expect } from '../support/fixtures';
import cases from './data/delete.json';
import { AdminCouponsPage, ADMIN_STATE, COLUMN_OF, type CouponInput } from '../support/pages/AdminCouponsPage';
import { expectCell, escapeRegExp, type CellExpectation } from './lib/expectCell';
import { assumptionNotes } from './lib/assumptions';

test.use({ storageState: ADMIN_STATE });

type RowExpectation = Record<keyof typeof COLUMN_OF, CellExpectation>;
type DeleteCase = {
  id: string;
  title: string;
  input: CouponInput;
  expected: {
    outcome: 'deleted';
    rowAbsent: string;
    otherRowsUnchanged: boolean;
    absentAfterReload: boolean;
    recreate: { outcome: 'created'; row: RowExpectation } | null;
  };
  assumptions: string[];
};

test.describe('FR-17 Delete coupon', () => {
  for (const c of cases as unknown as DeleteCase[]) {
    test(`${c.id}: ${c.title}`, { annotation: assumptionNotes(c.assumptions) }, async ({ page }) => {
      const coupons = new AdminCouponsPage(page);
      const exp = c.expected;
      const row = coupons.rowByCode(new RegExp(`^${escapeRegExp(exp.rowAbsent)}$`, 'i'));

      // Hệ thống không có hộp thoại xác nhận khi xóa (HW02 S6); nếu có thì chọn đồng ý (bước 2 của TC-CPN-51) và ghi chữ.
      page.on('dialog', async (dialog) => {
        test.info().annotations.push({ type: 'Dialog', description: dialog.message() });
        await dialog.accept();
      });

      await coupons.open();
      await coupons.bodyRows.first().waitFor();
      // Các dòng khác: Chữ của mọi dòng trước khi tạo mã của test case.
      const otherRows = await coupons.bodyRows.allTextContents();
      await expect(row, 'Trước khi tạo: Chưa có mã này').toHaveCount(0);

      // Bước 1: Tạo mã (điều kiện để xóa).
      await coupons.fillForm(c.input);
      await coupons.createButton.click();
      await expect(row, 'Bước 1: Có đúng một dòng mã vừa tạo').toHaveCount(1);

      // Bước 2: Bấm "Xóa" trên dòng đó.
      await coupons.deleteButton(row).click();

      // OUT8: Dòng biến mất, các dòng khác giữ nguyên.
      await expect(row, 'Sau khi xóa: Không còn dòng mã này').toHaveCount(0);
      if (exp.otherRowsUnchanged) {
        await expect(coupons.bodyRows, 'Sau khi xóa: Các dòng khác giữ nguyên').toHaveText(otherRows);
      }

      // K7: Tải lại, dòng vẫn không còn.
      if (exp.absentAfterReload) {
        await coupons.reloadAndReopen();
        await coupons.bodyRows.first().waitFor();
        await expect(row, 'Sau khi tải lại: Không còn dòng mã này').toHaveCount(0);
        if (exp.otherRowsUnchanged) {
          await expect(coupons.bodyRows, 'Sau khi tải lại: Các dòng khác giữ nguyên').toHaveText(otherRows);
        }
      }

      // K8: Tạo lại đúng mã đó được (OUT1), từng ô kiểm bằng expect.soft (CH-script-02 b).
      if (exp.recreate) {
        await coupons.fillForm(c.input);
        await coupons.createButton.click();
        await expect(row, 'Tạo lại: Có đúng một dòng mã này').toHaveCount(1);
        await expect(row, 'Tạo lại: Dòng hiện trên bảng').toBeVisible();
        await expect(coupons.bodyRows, 'Tạo lại: Số dòng tăng đúng 1').toHaveCount(otherRows.length + 1);
        for (const [field, column] of Object.entries(COLUMN_OF)) {
          const cell = await coupons.cell(row, column);
          await expectCell(cell, exp.recreate.row[field as keyof RowExpectation], `${exp.rowAbsent} tạo lại, cột "${column}"`, { soft: true });
        }
      }
    });
  }
});
```
