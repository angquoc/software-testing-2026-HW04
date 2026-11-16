// FR-17 P1: Danh sách mã ngay sau reset. TC-CPN-50, TC-CPN-93. Dữ liệu: data/list.json.
// Tên file bắt đầu bằng 01_ để chạy đầu tiên trong lượt (workers: 1), ngay sau globalSetup reset DB và đăng nhập admin.
// Bản sửa 1 (script_01_list_v2.md): Từng ô dùng expect.soft (CH-script-02 b); spec tự gọi 3 kiểu assertion (CH-script-01 b, CH-script-04 b).
import { test, expect } from '../support/fixtures';
import cases from './data/list.json';
import { AdminCouponsPage, ADMIN_STATE, COLUMN_OF } from '../support/pages/AdminCouponsPage';
import { expectCell, type CellExpectation } from './lib/expectCell';
import { assumptionNotes } from './lib/assumptions';

test.use({ storageState: ADMIN_STATE });

type RowExpectation = { code: { text: string } } & Record<Exclude<keyof typeof COLUMN_OF, 'code'>, CellExpectation>;
type ListExpected =
  | { rowCount: number; columnCount: number; rows: RowExpectation[] }
  | { moneyCells: { column: string; codes: string[] }[]; moneyPattern: string };
type ListCase = { id: string; title: string; expected: ListExpected; assumptions: string[] };

test.describe('FR-17 Coupon list right after reset', () => {
  for (const c of cases as unknown as ListCase[]) {
    test(`${c.id}: ${c.title}`, { annotation: assumptionNotes(c.assumptions) }, async ({ page }) => {
      const coupons = new AdminCouponsPage(page);
      await coupons.open();
      const exp = c.expected;

      if ('rows' in exp) {
        // TC-CPN-50: Đúng số dòng, đủ số cột (soft, để vẫn kiểm từng dòng khi số dòng sai).
        await expect.soft(coupons.bodyRows, 'Số dòng mã').toHaveCount(exp.rowCount);
        await expect.soft(coupons.columnHeaders, 'Số cột').toHaveCount(exp.columnCount);
        for (const r of exp.rows) {
          // Mỗi mã mẫu có đúng một dòng và dòng hiện trên bảng (assertion thường: Không có dòng thì không còn ô để kiểm).
          const row = coupons.rowByCode(r.code.text);
          await expect(row, `Dòng ${r.code.text}: Đúng một dòng`).toHaveCount(1);
          await expect(row, `Dòng ${r.code.text}: Hiện trên bảng`).toBeVisible();
          for (const [field, column] of Object.entries(COLUMN_OF)) {
            const cell = await coupons.cell(row, column);
            await expectCell(cell, r[field as keyof RowExpectation], `${r.code.text}, cột "${column}"`, { soft: true });
          }
        }
      }

      if ('moneyCells' in exp) {
        // TC-CPN-93: Mọi ô tiền có ₫ và phân cách hàng nghìn.
        const pattern = new RegExp(exp.moneyPattern);
        const codes = [...new Set(exp.moneyCells.flatMap((g) => g.codes))];
        for (const code of codes) {
          await expect(coupons.rowByCode(code), `Dòng ${code}: Hiện trên bảng`).toBeVisible();
        }
        for (const group of exp.moneyCells) {
          for (const code of group.codes) {
            const cell = await coupons.cell(coupons.rowByCode(code), group.column);
            await expect.soft(cell, `${code}, cột "${group.column}"`).toHaveText(pattern);
          }
        }
      }
    });
  }
});
