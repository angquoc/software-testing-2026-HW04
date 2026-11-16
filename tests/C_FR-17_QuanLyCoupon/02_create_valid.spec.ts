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
