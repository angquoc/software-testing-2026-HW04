# FR-17 script: P3 Thêm mã không hợp lệ (bản AI)

- Bước: `[C-FR17][script]`, phần P3 (TC-CPN-30, TC-CPN-32, TC-CPN-37, TC-CPN-38, TC-CPN-39, TC-CPN-41, TC-CPN-43, TC-CPN-44)
- Thời gian tạo: 2026-11-16 14:36 (UTC+07:00)
- Công cụ: Claude Code (VS Code), model Claude Opus 5.5, skill `playwright-automation`
- Căn cứ:
  - `01_selected_tc.md` (P3, CH-select-01 c, CH-select-02, mục 4 phần không đo được của OUT4), `02_review.md` mục 1 (schema, CH-data-03), `tests/C_FR-17_QuanLyCoupon/data/create_invalid.json`; HW02 `05_final_tc.md`: KQ-KH-GD (không có dòng mới, kể cả sau khi tải lại; bong bóng của trình duyệt cũng tính là thông báo, A21).
  - Quyết định của sinh viên dùng lại: Page Object Model, `storageState`, DOM lấy bằng `aria_snapshot.mjs`, `expect.soft` cho từng ô (CH-script-02 b).
  - Quyết định của sinh viên sau P2: CH-script-03 b (AI sinh `script_01_list_v2.md` sau P4), CH-script-04 b (mỗi file spec tự gọi đủ 3 kiểu assertion, không tính kiểu nằm trong `lib/`).
  - Thông tin giao diện: `ai_raw/snapshot_coupons.txt`, `ai_raw/snapshot_coupons_fixed.txt`. Thuộc tính của ô theo snapshot: Mã và Ngày hết hạn có `required`; ô Giá trị có `required`; Số lần dùng có `min="1"`; Đơn tối thiểu không có `min`. Chưa có snapshot của trạng thái lỗi, nên script không giả định thông báo nằm ở phần tử nào.
- Không đổi file dùng chung của P1, P2.
- Đã sửa trước khi giao: `npx tsc --noEmit` không báo lỗi. `check_automation.py spec` báo ERROR "Mảng dữ liệu viết thẳng trong spec" ở dòng `const channels = [...]` (mảng nhãn nơi tìm thấy thông báo, không phải dữ liệu test). Sửa: Thêm comment `// inline-ok: ...` cuối dòng đó. Không chạy trên giao diện

## Giả định

- GĐ-13: Thông báo được tìm ở 3 nơi theo CH-select-01 c: (1) Bong bóng của trình duyệt: Ô vi phạm có `validity.valid` là `false`; (2) hộp thoại (`dialog`); (3) chữ trên trang: Dòng chữ của `body` xuất hiện sau khi bấm "Tạo mã" mà trước đó không có. Có ít nhất một nơi là "có thông báo". Nơi tìm thấy được ghi vào annotation `Message`.
- GĐ-14: Chờ kết quả bằng cách chờ có thông báo (tối đa thời gian chờ mặc định của `expect`, 5 giây). Kiểm "không có dòng mới" ngay sau đó có thể qua trước khi máy chủ trả lời, nên kiểm lại sau khi tải lại trang mới là điểm chốt (K3).
- GĐ-15: Bong bóng chỉ hiện khi các ô nằm trong `form` và trình duyệt chặn gửi. Nếu ô có `validity.valid` là `false` nhưng trang vẫn gửi yêu cầu, kiểm sau khi tải lại sẽ bắt được dòng mới.
- GĐ-16: Vị trí "trên nút Tạo mã" (FR-22) chỉ đo cho chữ trên trang: Cạnh dưới của phần tử chứa dòng chữ mới không thấp hơn cạnh trên của nút. Phần tử tìm bằng `getByText(dòng, { exact: true })`; nếu không tìm được (chữ bị tách qua nhiều phần tử) thì điểm này fail và cần xem ảnh trong report.
- GĐ-17: Quy tắc chuỗi cấm (CH-data-03 c) áp cho chữ của hộp thoại và từng dòng chữ mới trên trang, không phân biệt hoa thường. Không áp cho bong bóng.
- GĐ-18: Phân chia hard và soft: Chờ thông báo, vị trí, chuỗi cấm, từng ô của dòng `SAVE10` dùng soft; "không có dòng mới" và "số dòng không đổi" dùng assertion thường. Thông báo được kiểm trước, để test vẫn ghi lại thông báo khi sau đó fail vì hệ thống tạo dòng mới.
- GĐ-19: TC-CPN-30 để trống Mã nên không có mã để tìm; "không có dòng mới" đo bằng số dòng. TC-CPN-32 đo thêm: Vẫn đúng một dòng `SAVE10`, đúng giá trị mẫu, trước và sau khi tải lại.

## Câu hỏi cho sinh viên

- CH-script-05: P2 (đã giao) chỉ tự gọi 2 kiểu assertion (Số lượng, Hiển thị), chưa theo CH-script-04 b. Phương án: a. AI sinh `ai_raw/script_02_create_valid_v2.md` cùng lúc với `script_01_list_v2.md`, sau P4; b. Sinh viên sửa P2 ở bước `review` và ghi vào bảng thay đổi.
- CH-script-06: Chữ của thông báo không được so với nguyên nhân (mục 4 của `01_selected_tc.md`: Đặc tả không ghi câu chữ). Script ghi chữ của hộp thoại và chữ mới trên trang vào annotation để xem tay trong report. Phương án: a. Giữ như vậy; b. Thêm kiểm thông báo có nhắc tên ô vi phạm (ví dụ chữ "Mã", "ngày"); cần sinh viên cho danh sách từ của từng ô ở `create_invalid.json`.

## Code

File: `tests/C_FR-17_QuanLyCoupon/03_create_invalid.spec.ts`

```ts
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
async function pageLines(page: Page): Promise<string[]> {
  const text = await page.locator('body').innerText();
  return text.split('\n').map((s) => s.trim()).filter(Boolean);
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
      const linesBefore = new Set(await pageLines(page));
      await coupons.createButton.click();

      // Chờ thông báo ở một trong 3 nơi: Bong bóng (validity của ô vi phạm), hộp thoại, chữ mới trên trang.
      const field = inputOf[exp.violatedField];
      const bubble = () => field.evaluate((e: HTMLInputElement) => !e.validity.valid);
      const newLines = async () => (await pageLines(page)).filter((l) => !linesBefore.has(l));
      if (exp.message.required) {
        await expect
          .configure({ soft: true })
          .poll(async () => (await bubble()) || dialogs.length > 0 || (await newLines()).length > 0, {
            message: 'Có thông báo: Bong bóng của trình duyệt, hộp thoại hoặc chữ mới trên trang',
          })
          .toBe(true);
      }
      const lines = await newLines();
      const channels = [(await bubble()) ? 'bong bóng' : '', dialogs.length ? 'hộp thoại' : '', lines.length ? 'chữ trên trang' : '']; // inline-ok: Nhãn nơi tìm thấy thông báo để ghi annotation, không phải dữ liệu test
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
```
