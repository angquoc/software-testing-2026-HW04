// FR-17 P3: Thêm mã không hợp lệ qua form. TC-CPN-30, 32, 37, 38, 39, 41, 43, 44. Dữ liệu: data/create_invalid.json.
// Mỗi test: Điền 6 ô (một ô vi phạm), bấm "Tạo mã"; chờ có thông báo; kiểm thông báo theo CH-select-01 c;
// kiểm không có dòng mới, kể cả sau khi tải lại (K3).
import type { Locator, Page } from '@playwright/test';
import { test, expect } from '../support/fixtures';
import cases from './data/create_invalid.json';
import { AdminCouponsPage, ADMIN_STATE, COLUMN_OF, type CouponInput } from '../support/pages/AdminCouponsPage';
import { expectCell, escapeRegExp, type CellExpectation } from './lib/expectCell';
import { assumptionNotes } from './lib/assumptions';

test.use({ storageState: ADMIN_STATE });

type Field = Exclude<keyof CouponInput, 'typeOption'>;
type RowExpectation = Record<keyof typeof COLUMN_OF, CellExpectation>;
type InvalidCase = {
  id: string;
  title: string;
  input: CouponInput;
  expected: {
    outcome: 'rejected';
    reason: string;
    violatedField: Field;
    absentCode: string | null;
    rowCountUnchanged: boolean;
    existingRow: RowExpectation | null;
    checkAfterReload: boolean;
    message: { required: boolean; aboveSubmitIfInPage: boolean; forbiddenSubstrings: string[] };
  };
  assumptions: string[];
};

// Các dòng chữ không rỗng của trang, để tìm chữ mới xuất hiện sau khi bấm "Tạo mã".
// Bỏ chữ trong bảng mã: Dòng mới của bảng (khi hệ thống tạo nhầm) không phải thông báo.
// Đọc chữ của trang và của bảng trong cùng một lần evaluate, để bảng không đổi giữa hai lần đọc.
async function pageLines(page: Page): Promise<string[]> {
  const [bodyText, tableText] = await page.evaluate(() => [
    document.body.innerText,
    Array.from(document.querySelectorAll('table'), (t) => t.innerText).join('\n'),
  ]);
  const split = (t: string) => t.split('\n').map((s) => s.trim()).filter(Boolean);
  const tableLines = new Set(split(tableText));
  return split(bodyText).filter((l) => !tableLines.has(l));
}

test.describe('FR-17 Create coupon with invalid data', () => {
  for (const c of cases as unknown as InvalidCase[]) {
    test(`${c.id}: ${c.title}`, { annotation: assumptionNotes(c.assumptions) }, async ({ page }) => {
      const coupons = new AdminCouponsPage(page);
      const exp = c.expected;
      const inputOf: Record<Field, Locator> = {
        code: coupons.codeInput,
        discountValue: coupons.discountInput,
        minOrderAmount: coupons.minOrderInput,
        expiredAt: coupons.expiredAtInput,
        maxUsesPerUser: coupons.maxUsesInput,
      };
      const absentRow = exp.absentCode ? coupons.rowByCode(new RegExp(`^${escapeRegExp(exp.absentCode)}$`, 'i')) : null;

      // Hộp thoại: Ghi chữ để kiểm chuỗi cấm và để xem tay trong report.
      const dialogs: string[] = [];
      page.on('dialog', async (dialog) => {
        dialogs.push(dialog.message());
        test.info().annotations.push({ type: 'Dialog', description: dialog.message() });
        await dialog.accept();
      });

      // Không có dòng mới (và dòng cũ giữ nguyên nếu test case có).
      const expectNoNewRow = async (when: string) => {
        if (absentRow) await expect(absentRow, `${when}: Không có dòng mã ${exp.absentCode}`).toHaveCount(0);
        if (exp.rowCountUnchanged) await expect(coupons.bodyRows, `${when}: Số dòng không đổi`).toHaveCount(rowsBefore);
        if (exp.existingRow) {
          const code = (exp.existingRow.code as { text: string }).text;
          const row = coupons.rowByCode(code);
          await expect(row, `${when}: Vẫn đúng một dòng ${code}`).toHaveCount(1);
          for (const [field, column] of Object.entries(COLUMN_OF)) {
            const cell = await coupons.cell(row, column);
            await expectCell(cell, exp.existingRow[field as keyof RowExpectation], `${code} ${when}, cột "${column}"`, { soft: true });
          }
        }
      };

      await coupons.open();
      await coupons.bodyRows.first().waitFor();
      const rowsBefore = await coupons.bodyRows.count();
      if (absentRow) await expect(absentRow, 'Trước khi bấm: Chưa có mã này').toHaveCount(0);

      await coupons.fillForm(c.input);
      // Bong bóng: Ô vi phạm không hợp lệ theo validity ngay trước khi bấm (trình duyệt chặn gửi form).
      // Đọc trước khi bấm, vì sau khi tạo thành công form tự xóa và ô Giá trị trống (required) cũng không hợp lệ.
      const field = inputOf[exp.violatedField];
      const bubble = await field.evaluate((e: HTMLInputElement) => !e.validity.valid);
      const linesBefore = new Set(await pageLines(page));
      await coupons.createButton.click();

      // Chờ thông báo ở một trong 3 nơi: Bong bóng, hộp thoại, chữ mới trên trang (ngoài bảng).
      const newLines = async () => (await pageLines(page)).filter((l) => !linesBefore.has(l));
      if (exp.message.required) {
        await expect
          .configure({ soft: true })
          .poll(async () => bubble || dialogs.length > 0 || (await newLines()).length > 0, {
            message: 'Có thông báo: Bong bóng của trình duyệt, hộp thoại hoặc chữ mới trên trang',
          })
          .toBe(true);
      }
      const lines = await newLines();
      const channels = [bubble ? 'bong bóng' : '', dialogs.length ? 'hộp thoại' : '', lines.length ? 'chữ trên trang' : '']; // inline-ok: Nhãn nơi tìm thấy thông báo để ghi annotation, không phải dữ liệu test
      test.info().annotations.push({ type: 'Message', description: channels.filter(Boolean).join(', ') || 'không có' });
      if (lines.length) test.info().annotations.push({ type: 'Page text', description: lines.join(' | ') });

      // Quy tắc chuỗi cấm (CH-data-03 c) cho hộp thoại và chữ mới trên trang.
      const forbidden = new RegExp(exp.message.forbiddenSubstrings.map(escapeRegExp).join('|'), 'i');
      for (const msg of dialogs) {
        expect.soft(msg, `Hộp thoại "${msg}": Không chứa chuỗi cấm`).not.toMatch(forbidden);
      }
      const button = await coupons.createButton.boundingBox();
      for (const line of lines) {
        const el = page.getByText(line, { exact: true }).first();
        // Không tìm được phần tử (chữ bị tách qua nhiều phần tử): Ghi lỗi soft, bỏ qua bước đo, không chờ boundingBox.
        if ((await el.count()) === 0) {
          expect.soft(false, `Chữ trên trang "${line}": Không định vị được phần tử chứa thông báo (xem ảnh trong report)`).toBe(true);
          continue;
        }
        await expect.soft(el, `Chữ trên trang "${line}": Không chứa chuỗi cấm`).not.toHaveText(forbidden);
        if (exp.message.aboveSubmitIfInPage) {
          // FR-22: Thông báo nằm trên nút "Tạo mã".
          const box = await el.boundingBox();
          const above = box !== null && button !== null && box.y + box.height <= button.y;
          expect.soft(above, `Chữ trên trang "${line}": Nằm trên nút "Tạo mã"`).toBe(true);
        }
      }

      // Bị từ chối: Không có dòng mới ngay sau khi bấm và sau khi tải lại.
      await expectNoNewRow('Sau khi bấm "Tạo mã"');
      if (exp.checkAfterReload) {
        await coupons.reloadAndReopen();
        await coupons.bodyRows.first().waitFor();
        await expectNoNewRow('Sau khi tải lại');
      }
    });
  }
});
