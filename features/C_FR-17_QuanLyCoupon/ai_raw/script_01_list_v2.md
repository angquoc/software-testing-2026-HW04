# FR-17 script: P1 Danh sách mã ngay sau reset (bản AI, bản sửa 1)

- Bước: `[C-FR17][script]`, phần P1 (TC-CPN-50, TC-CPN-93)
- Lần sửa: 1. Bản trước: `ai_raw/script_01_list.md` (2026-11-16 12:10, giữ nguyên, không sửa)
- Thời gian tạo: 2026-11-16 15:07 (UTC+07:00)
- Công cụ: Claude Code (VS Code), model Claude Opus 5.5, skill `playwright-automation`
- Lý do: Sinh viên chọn CH-script-03 b (AI sinh bản `_v2` của P1 sau P4) để áp các quyết định chốt sau khi P1 đã giao:
  - CH-script-01 b và CH-script-04 b: Mỗi file spec tự gọi đủ ≥ 3 kiểu assertion; kiểu nằm trong `lib/` không tính. Bản trước tự gọi 2 kiểu (Số lượng, Nội dung chữ).
  - CH-script-02 b: Từng ô dùng `expect.soft`, để một lần chạy liệt kê đủ các ô sai. Bản trước dừng ở ô sai đầu tiên.
- Căn cứ: Như bản trước (`01_selected_tc.md` P1, `02_review.md` mục 1, `data/list.json`, `ai_raw/snapshot_coupons.txt`); `lib/expectCell.ts` có tùy chọn `soft` và `lib/assumptions.ts` từ P2 (`ai_raw/script_02_create_valid.md`)
- Chỉ đổi `tests/C_FR-17_QuanLyCoupon/01_list.spec.ts`. Các file khác của bản trước (`globalSetup`, `accounts.ts`, `playwright.config.ts`) giữ nguyên; page object và `expectCell.ts` theo bản AI mới nhất (P4, P2)
- Đã sửa trước khi giao: Không có (`npx tsc --noEmit` và `check_automation.py spec` không báo lỗi ở lần đầu). Không chạy trên giao diện

## Thay đổi so với bản trước

| Chỗ | Bản trước | Bản sửa 1 | Theo |
|---|---|---|---|
| Từng ô của TC-CPN-50 | `expectCell` assertion thường | `expectCell(..., { soft: true })` | CH-script-02 b |
| Ô tiền của TC-CPN-93 | `expect(...).toHaveText` | `expect.soft(...).toHaveText` | CH-script-02 b |
| Số dòng, số cột của TC-CPN-50 | Assertion thường | `expect.soft`, để vẫn kiểm từng dòng khi số dòng sai | CH-script-02 b |
| Mỗi dòng mã mẫu của TC-CPN-50 | Chỉ `toHaveCount(1)` | Thêm `toBeVisible()` (kiểu Hiển thị); hai bước này giữ assertion thường | CH-script-01 b, CH-script-04 b |
| TC-CPN-93 | Không kiểm dòng có tồn tại trước khi đọc ô | Kiểm mỗi mã có dòng hiện trên bảng (assertion thường) trước khi đọc ô, để ô soft không phải chờ hết thời gian khi thiếu dòng | CH-script-02 b |
| Annotation giả định | Hàm riêng trong spec | Dùng `lib/assumptions.ts` (giống P2 đến P4) | Đồng bộ với P2 |
| Kiểu dữ liệu | `(typeof cases)[number]`, ép `c.expected` trong thân test | Kiểu `ListCase` khai báo rõ, ép một lần ở vòng lặp | Đồng bộ với P2 |

Kiểu assertion mà spec tự gọi: Số lượng, Hiển thị, Nội dung chữ, Assertion mềm.

## Giả định

- GĐ-24: Phân chia hard và soft như GĐ-12 của P2: Bước "có dòng" (đúng một dòng, hiện trên bảng) là assertion thường; số dòng, số cột và từng ô là soft.

## Câu hỏi cho sinh viên

Không có câu hỏi mới.

## Code

File: `tests/C_FR-17_QuanLyCoupon/01_list.spec.ts`

```ts
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
```
