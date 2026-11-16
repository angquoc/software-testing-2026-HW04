# FR-17 script: P2 Thêm mã hợp lệ (bản AI, bản sửa 1)

- Bước: `[C-FR17][script]`, phần P2 (TC-CPN-01, TC-CPN-02, TC-CPN-10, TC-CPN-14, TC-CPN-19, TC-CPN-23, TC-CPN-116)
- Lần sửa: 1. Bản trước: `ai_raw/script_02_create_valid.md` (2026-11-16 13:31, giữ nguyên, không sửa)
- Thời gian tạo: 2026-11-16 15:07 (UTC+07:00)
- Công cụ: Claude Code (VS Code), model Claude Opus 5.5, skill `playwright-automation`
- Lý do: Sinh viên chọn CH-script-05 a (AI sinh bản `_v2` của P2 cùng lúc với P1). Theo CH-script-04 b, mỗi file spec tự gọi đủ ≥ 3 kiểu assertion; bản trước tự gọi 2 kiểu (Số lượng, Hiển thị), nội dung chữ chỉ có trong `lib/expectCell.ts`. CH-script-02 b (`expect.soft` cho từng ô) bản trước đã áp
- Căn cứ: Như bản trước (`01_selected_tc.md` P2, `02_review.md` mục 1, `data/create_valid.json`, `ai_raw/snapshot_coupons.txt`, `ai_raw/snapshot_coupons_fixed.txt`; HW02 OUT1, K1)
- Chỉ đổi `tests/C_FR-17_QuanLyCoupon/02_create_valid.spec.ts`. `lib/expectCell.ts`, `lib/assumptions.ts` giữ như bản trước; page object theo bản AI mới nhất (P4)
- Đã sửa trước khi giao: Không có (`npx tsc --noEmit` và `check_automation.py spec` không báo lỗi ở lần đầu). Không chạy trên giao diện

## Thay đổi so với bản trước

| Chỗ | Bản trước | Bản sửa 1 | Theo |
|---|---|---|---|
| K1 (sau khi tải lại) | Kiểm số dòng, dòng hiện ra, từng ô | Thêm: Chữ của cả dòng sau khi tải lại giống chữ của dòng ngay sau khi tạo (`expect.soft(newRow).toHaveText(...)`, kiểu Nội dung chữ) | CH-script-04 b |
| Comment đầu file | | Ghi bản sửa và quyết định áp dụng | |

Kiểu assertion mà spec tự gọi: Số lượng, Hiển thị, Nội dung chữ, Assertion mềm.

## Giả định

- GĐ-25: Chữ của dòng ngay sau khi tạo là chữ trang hiện sau khi đã kiểm từng ô. So sánh này bắt trường hợp trang hiện giá trị vừa gõ nhưng máy chủ lưu giá trị khác (sau khi tải lại thì khác). Nếu chính chữ ngay sau khi tạo đã sai thì các ô soft trước đó đã báo.

## Câu hỏi cho sinh viên

Không có câu hỏi mới.

## Code

File: `tests/C_FR-17_QuanLyCoupon/02_create_valid.spec.ts`

```ts
// FR-17 P2: Thêm mã hợp lệ qua form "Tạo mã giảm giá mới". TC-CPN-01, 02, 10, 14, 19, 23, 116. Dữ liệu: data/create_valid.json.
// Mỗi test tạo một mã riêng FR17TCnn trên DB vừa reset ở globalSetup; file chạy sau 01_list.spec.ts (workers: 1).
// Bản sửa 1 (script_02_create_valid_v2.md): Spec tự gọi 3 kiểu assertion (CH-script-01 b, CH-script-04 b).
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
      const rowTextAfterCreate = (await newRow.textContent()) ?? '';

      if (c.expected.persistsAfterReload) {
        // K1: Tải lại (Web Admin về Dashboard, bấm lại menu), dòng vẫn còn với đúng giá trị.
        await coupons.reloadAndReopen();
        await expect(newRow, 'Sau khi tải lại: Chỉ một dòng có mã này').toHaveCount(1);
        await expect(newRow, 'Sau khi tải lại: Dòng mới hiện trên bảng').toBeVisible();
        await expect(coupons.bodyRows, 'Sau khi tải lại: Số dòng').toHaveCount(rowsBefore + 1);
        // Chữ của cả dòng giữ nguyên như ngay sau khi tạo (giá trị đã lưu, không chỉ hiển thị tạm trên trang).
        await expect.soft(newRow, 'Sau khi tải lại: Chữ của dòng giống ngay sau khi tạo').toHaveText(rowTextAfterCreate);
        await expectRowCells(coupons, c.input.code, c.expected.row, 'sau khi tải lại');
      }
    });
  }
});
```
