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
