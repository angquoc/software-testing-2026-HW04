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
