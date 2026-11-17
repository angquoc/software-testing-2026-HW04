# FR-07 Giỏ hàng script: P3 Xóa sản phẩm và dialog xác nhận (bản AI)

- Bước: `[B-FR07][script]`, phần P3
- Thời gian tạo: 2026-11-17 14:41 (UTC+07:00)
- Công cụ: Claude Code, model Claude Opus 5.5 (`claude-opus-5-5`), skill `playwright-automation`
- Căn cứ: `01_selected_tc.md` (P3: TC-CART-07, 08, 09; D-03, D-04, D-08), `02_review.md` (mục 1: CH-data-03 a; mục 2.1 cấu trúc, gồm quyết định trước P2), `tests/B_FR-07_GioHang/data/remove_item.json`, `data/products.json`; spec, `lib/` và page object của P1, P2 (bản AI P2, commit `0d59488`); snapshot `ai_raw/snapshot_cart_items.txt` (mỗi dòng có `button "Xóa"`), `snapshot_cart_empty.txt`; mã frontend `pages/Cart.jsx` (chỉ để biết nút "Xóa" nằm trong ô cuối của dòng)
- Quyết định áp dụng: Như `02_review.md` mục 2.1; không có điểm cấu trúc mới cần hỏi trước P3
- Đã sửa trước khi giao: Không

Thay đổi file dùng chung so với bản AI P2 (chép đủ bên dưới):

| File | Thay đổi |
|---|---|
| `tests/support/pages/CartPage.ts` | Thêm `deleteButton(row)` và `illustrations` (phần tử `img` hoặc `svg` đang hiển thị trong `main`, D-03) |
| `tests/B_FR-07_GioHang/lib/types.ts` | Thêm `EmptyStateExpected`, `RemoveItemCase` |
| `tests/B_FR-07_GioHang/lib/cartChecks.ts` | Thêm `checkEmptyState` (OUT9 theo D-03; P4 dùng lại) |
| `tests/B_FR-07_GioHang/lib/removeDialog.ts` | File mới: `removeWithDialog` bấm "Xóa", bắt dialog xác nhận và chọn hủy hoặc xác nhận |

## Giả định

- GĐ-01: Đặc tả (FR07-R11, FR-24) chỉ nói "dialog xác nhận", không nói là hộp thoại của trình duyệt (`confirm`) hay hộp thoại trên trang. Script nhận cả hai: Sự kiện `dialog` của Playwright, hoặc phần tử đang hiển thị có role `dialog` / `alertdialog`. Không thấy cái nào trong `FEEDBACK_WINDOW_MS` (2 giây, CH-script-01) sau khi bấm "Xóa" thì coi là không có dialog.
- GĐ-02: Chữ trong dialog không được so (đặc tả không ghi nguyên văn, `rules.md` mục 2); script ghi chữ đó vào annotation "Dialog message" của test để làm bằng chứng (`lessons.md`: Ảnh chụp khi fail không thấy hộp thoại).
- GĐ-03: Hộp thoại trên trang (nếu có): Nút xác nhận là nút trong dialog có tên chứa "xác nhận", "đồng ý", "xóa", "có" hoặc "ok"; nút hủy có tên chứa "hủy", "không", "đóng" hoặc "cancel" (không phân biệt hoa thường). Đặc tả không nêu nhãn nút; hệ thống hiện không có dialog (#72) nên nhánh này chưa kiểm chứng được.
- GĐ-04: "Dòng Samsung vẫn còn khi dialog mở" (TC-CART-07) chỉ đo được với hộp thoại trên trang. Với hộp thoại của trình duyệt, trang bị chặn khi hộp thoại mở nên không đọc được DOM; việc xóa chỉ xảy ra sau khi hộp thoại đóng, nên điểm này được ghi annotation "không đo được khi hộp thoại của trình duyệt mở" thay vì assertion.
- GĐ-05: TC-CART-07 khi không có dialog (CH-data-03 a): Script ghi lỗi `soft` R11 rồi vẫn kiểm "sau khi hủy còn 2 dòng, Tổng cộng 58,000,000": Dòng đã bị xóa ngay nên hai điểm này fail, làm bằng chứng việc xóa không qua xác nhận.
- GĐ-06: Trạng thái giỏ trống (TC-CART-09) kiểm ngay sau khi xóa, không tải lại trang (A11). Thông báo kiểm bằng `toContainText` từ "trống" không phân biệt hoa thường (D-03 chỉ yêu cầu có từ này).
- GĐ-07: TC-CART-08 "thêm lại Samsung từ trang chủ": Về trang chủ bằng link "EShop", bấm "Thêm vào giỏ" của Samsung một lần (như D-04), mở Giỏ hàng bằng link navbar.

## Câu hỏi cho sinh viên

- CH-script-03: Khoảng chờ dialog sau khi bấm "Xóa" đang dùng lại `FEEDBACK_WINDOW_MS` (2 giây). Phương án: a. Dùng chung 2 giây; b. Hằng riêng `DIALOG_WINDOW_MS` (sinh viên chọn số).

## Kiểu assertion

- Trong spec P3: `not.toBe` (có dialog), `toBeGreaterThan` (dòng còn khi dialog mở).
- Trong `lib/cartChecks.ts`: `toHaveCount`, `toHaveText` (`checkCartState`); `toBeVisible`, `toContainText`, `toHaveCount` (`checkEmptyState`).
- Trong `lib/feedback.ts` (qua `lib/removeDialog.ts`): `expect.poll`.

## Code

File: `tests/support/pages/CartPage.ts`

```ts
import type { Locator, Page } from '@playwright/test';

// Trang Giỏ hàng. Ô và tổng tiền tìm theo vị trí, không theo nhãn: Nhãn cột và nhãn tổng kiểm riêng ở TC-CART-90.
export class CartPage {
  // Thứ tự cột theo FR-07: Sản phẩm, Đơn giá, Số lượng, Thành tiền, Thao tác.
  static readonly COLUMN = { product: 0, unitPrice: 1, quantity: 2, lineTotal: 3, actions: 4 } as const;

  readonly main: Locator;
  readonly table: Locator;
  readonly rows: Locator;
  readonly totalValue: Locator;
  readonly illustrations: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main');
    this.table = this.main.getByRole('table');
    // Dòng dữ liệu (có ô cell), bỏ dòng tiêu đề.
    this.rows = this.table.getByRole('row').filter({ has: page.getByRole('cell') });
    // Dòng tổng: Phần tử con đầu tiên của khối ngay sau bảng.
    this.totalValue = this.main.locator('table + div > :first-child');
    // Hình minh họa của giỏ trống: Ảnh hoặc biểu tượng đang hiển thị trong vùng nội dung (D-03).
    this.illustrations = this.main.locator('img, svg').filter({ visible: true });
  }

  row(productName: string): Locator {
    return this.rows.filter({ has: this.page.getByRole('cell', { name: productName, exact: true }) });
  }

  cell(row: Locator, column: keyof typeof CartPage.COLUMN): Locator {
    return row.getByRole('cell').nth(CartPage.COLUMN[column]);
  }

  deleteButton(row: Locator): Locator {
    return this.cell(row, 'actions').getByRole('button', { name: 'Xóa', exact: true });
  }
}
```

File: `tests/B_FR-07_GioHang/lib/types.ts`

```ts
// Kiểu của file dữ liệu FR-07 (schema ở ai_raw/data.md, đã chốt ở 02_review.md mục 1.2).

export interface Product {
  key: string;
  name: string;
  price: number;
  apiId?: number;
  oracle: string;
  note?: string;
}

export interface ExpectedRow {
  product: string;
  unitPrice?: number;
  quantity?: number;
  lineTotal?: number;
}

export interface CartStateExpected {
  rowCount?: number;
  rows?: ExpectedRow[];
  total?: number;
  thousandSeparators?: number;
}

export interface EmptyStateExpected {
  illustration: boolean;
  messageContains: string;
  table: boolean;
}

export interface AddFromDetailCase {
  id: string;
  title: string;
  setup: { cart: string[] };
  input: { product: string; quantity: number; fillQuantity: boolean };
  expected: CartStateExpected & {
    outcome: 'added' | 'rejected';
    feedback?: 'toastOrBadge' | 'noSuccess';
    badge?: number | 'hiddenOrZero' | 'unchanged';
    k1?: { afterReload: boolean; apiCart: boolean };
  };
  oracle: string;
  note?: string;
}

export interface AddToExistingCartCase {
  id: string;
  title: string;
  setup: { cart: string[] };
  input: { from: 'home' | 'detail'; product: string; quantity?: number; fillQuantity?: boolean };
  expected: CartStateExpected & {
    feedback?: 'toastOrBadge';
    badge?: number;
  };
  oracle: string;
  note?: string;
}

export interface RemoveItemCase {
  id: string;
  title: string;
  setup: { cart: string[] };
  input: { remove: string; dialogChoice: 'accept' | 'dismiss'; thenAddFromHome?: string };
  expected: CartStateExpected & {
    dialog: 'shown';
    rowPresentWhileDialogOpen?: string;
    afterRemove?: CartStateExpected;
    afterReAdd?: CartStateExpected;
    emptyState?: EmptyStateExpected;
  };
  oracle: string;
  note?: string;
}
```

File: `tests/B_FR-07_GioHang/lib/cartChecks.ts`

```ts
import { expect } from '../../support/fixtures';
import type { CartPage } from '../../support/pages/CartPage';
import type { HomePage } from '../../support/pages/HomePage';
import type { NavBar } from '../../support/pages/NavBar';
import { moneyPattern } from './money';
import { productByKey } from './products';
import type { CartStateExpected, EmptyStateExpected } from './types';

const softExpect = expect.configure({ soft: true });

// Kiểm trạng thái trang Giỏ hàng. Mọi điểm là soft: Có nhiều dòng cùng tên (#70) thì ghi lỗi số dòng
// và vẫn đọc ô của dòng đầu tiên; không có dòng nào thì bỏ qua các ô của dòng đó. Tổng tiền luôn được kiểm.
export async function checkCartState(cart: CartPage, exp: CartStateExpected, label: string): Promise<void> {
  if (exp.rowCount !== undefined) {
    await softExpect(cart.rows, `${label}: number of cart lines`).toHaveCount(exp.rowCount);
  }
  for (const r of exp.rows ?? []) {
    const name = productByKey(r.product).name;
    const rows = cart.row(name);
    await softExpect(rows, `${label}: exactly one line "${name}"`).toHaveCount(1);
    if ((await rows.count()) === 0) continue;
    const row = rows.first();
    if (r.unitPrice !== undefined) {
      await softExpect(cart.cell(row, 'unitPrice'), `${label}: Đơn giá of "${name}"`).toHaveText(moneyPattern(r.unitPrice));
    }
    if (r.quantity !== undefined) {
      await softExpect(cart.cell(row, 'quantity'), `${label}: Số lượng of "${name}"`).toHaveText(String(r.quantity));
    }
    if (r.lineTotal !== undefined) {
      await softExpect(cart.cell(row, 'lineTotal'), `${label}: Thành tiền of "${name}"`).toHaveText(
        moneyPattern(r.lineTotal, exp.thousandSeparators),
      );
    }
  }
  if (exp.total !== undefined) {
    await softExpect(cart.totalValue, `${label}: cart total (found by position; label checked in TC-CART-90)`).toHaveText(
      moneyPattern(exp.total, exp.thousandSeparators),
    );
  }
}

// OUT9 theo D-03: Hình minh họa (img hoặc svg đang hiển thị trong main), thông báo có từ đã chốt, không còn bảng.
export async function checkEmptyState(cart: CartPage, exp: EmptyStateExpected, label: string): Promise<void> {
  if (exp.illustration) {
    await softExpect(cart.illustrations.first(), `${label}: illustration (img or svg) in the main content (OUT9, D-03)`).toBeVisible();
  }
  await softExpect(cart.main, `${label}: message says the cart is empty (OUT9, D-03)`).toContainText(exp.messageContains, {
    ignoreCase: true,
  });
  if (!exp.table) {
    await softExpect(cart.table, `${label}: no cart table (OUT9)`).toHaveCount(0);
  }
}

// D-04: Tạo giỏ bằng nút "Thêm vào giỏ" ở trang chủ, mỗi sản phẩm bấm một lần; mở Giỏ hàng kiểm lại rồi về trang chủ
// bằng link "EShop". Bắt đầu và kết thúc ở trang chủ. Không đạt thì ném lỗi "Chuẩn bị không đạt": Test dừng,
// không tính là kết quả của test case.
export async function prepareCart(home: HomePage, nav: NavBar, cart: CartPage, keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  for (const key of keys) await home.addToCart(productByKey(key).name);
  await nav.openCart();
  try {
    await expect(cart.rows).toHaveCount(keys.length);
    for (const key of keys) {
      const row = cart.row(productByKey(key).name);
      await expect(row).toHaveCount(1);
      await expect(cart.cell(row, 'quantity')).toHaveText('1');
    }
  } catch (err) {
    const first = String(err).split('\n')[0];
    throw new Error(`Chuẩn bị không đạt (setup not met): Cart after adding ${keys.join(', ')} from the home page (D-04): ${first}`);
  }
  await nav.openHome();
}
```

File: `tests/B_FR-07_GioHang/lib/removeDialog.ts`

```ts
import type { Dialog, Page } from '@playwright/test';
import type { CartPage } from '../../support/pages/CartPage';
import { becomesTrueWithin, FEEDBACK_WINDOW_MS } from './feedback';

export interface RemoveResult {
  // native: Hộp thoại của trình duyệt (confirm); modal: Hộp thoại trên trang (role dialog / alertdialog); none: Không có.
  kind: 'native' | 'modal' | 'none';
  message?: string;
  // Số dòng của sản phẩm khi hộp thoại trên trang đang mở (không đo được với hộp thoại của trình duyệt).
  rowCountWhileOpen?: number;
}

// Nhãn nút trong hộp thoại trên trang: Đặc tả không nêu (GĐ-03 của ai_raw/script_03_remove_item.md).
const CONFIRM_NAME = /xác nhận|đồng ý|xóa|có|ok/i;
const CANCEL_NAME = /hủy|không|đóng|cancel/i;

// Bấm "Xóa" ở dòng đầu tiên của sản phẩm; nếu có dialog xác nhận thì chọn hủy hoặc xác nhận. Không tự khẳng định kết quả.
export async function removeWithDialog(
  page: Page,
  cart: CartPage,
  productName: string,
  choice: 'accept' | 'dismiss',
): Promise<RemoveResult> {
  let nativeMessage: string | undefined;
  const onDialog = async (d: Dialog): Promise<void> => {
    nativeMessage = d.message();
    if (choice === 'accept') await d.accept();
    else await d.dismiss();
  };
  page.on('dialog', onDialog);
  try {
    const modal = page.getByRole('dialog').or(page.getByRole('alertdialog')).filter({ visible: true });
    await cart.deleteButton(cart.row(productName).first()).click();
    const shown = await becomesTrueWithin(
      async () => nativeMessage !== undefined || (await modal.count()) > 0,
      FEEDBACK_WINDOW_MS,
    );
    if (!shown) return { kind: 'none' };
    if (nativeMessage !== undefined) return { kind: 'native', message: nativeMessage };
    const rowCountWhileOpen = await cart.row(productName).count();
    const message = (await modal.first().innerText()).trim();
    await modal
      .first()
      .getByRole('button', { name: choice === 'accept' ? CONFIRM_NAME : CANCEL_NAME })
      .first()
      .click();
    return { kind: 'modal', message, rowCountWhileOpen };
  } finally {
    page.off('dialog', onDialog);
  }
}
```

File: `tests/B_FR-07_GioHang/03_remove_item.spec.ts`

```ts
// P3 (01_selected_tc.md mục 3): Xóa sản phẩm khỏi giỏ và dialog xác nhận.
// Test case: TC-CART-07, TC-CART-08, TC-CART-09.
// Dữ liệu: data/remove_item.json, data/products.json.
import { test, expect } from '../support/fixtures';
import { CartPage } from '../support/pages/CartPage';
import { HomePage } from '../support/pages/HomePage';
import { NavBar } from '../support/pages/NavBar';
import cases from './data/remove_item.json';
import { checkCartState, checkEmptyState, prepareCart } from './lib/cartChecks';
import { productByKey } from './lib/products';
import { removeWithDialog } from './lib/removeDialog';
import type { RemoveItemCase } from './lib/types';
import { USER_STATE } from './setup/globalSetup';

const softExpect = expect.configure({ soft: true });

test.use({ storageState: USER_STATE });

test.describe('FR-07 Cart P3: remove a line with a confirmation dialog', () => {
  for (const c of cases as unknown as RemoveItemCase[]) {
    test(`${c.id}: ${c.title}`, async ({ page }, testInfo) => {
      const exp = c.expected;
      const home = new HomePage(page);
      const cart = new CartPage(page);
      const nav = new NavBar(page);

      await home.goto();
      await prepareCart(home, nav, cart, c.setup.cart);
      await nav.openCart();

      const removeName = productByKey(c.input.remove).name;
      const result = await removeWithDialog(page, cart, removeName, c.input.dialogChoice);
      if (result.message !== undefined) {
        testInfo.annotations.push({ type: 'Dialog message', description: `${result.kind}: ${result.message}` });
      }
      softExpect(result.kind, 'R11 / FR-24: confirmation dialog appears before removing').not.toBe('none');

      if (exp.rowPresentWhileDialogOpen !== undefined) {
        if (result.kind === 'modal') {
          softExpect(result.rowCountWhileOpen ?? 0, `Line "${removeName}" still present while the dialog is open`).toBeGreaterThan(0);
        } else if (result.kind === 'native') {
          testInfo.annotations.push({
            type: 'Not measurable',
            description: 'Line presence while a browser confirm dialog is open (page is blocked); removal can only happen after it closes',
          });
        }
      }

      const after = c.input.dialogChoice === 'dismiss' ? 'After cancelling the dialog' : 'After confirming the dialog';
      await checkCartState(cart, exp, after);
      if (exp.afterRemove) await checkCartState(cart, exp.afterRemove, after);
      if (exp.emptyState) await checkEmptyState(cart, exp.emptyState, `${after} (no reload, A11)`);

      if (c.input.thenAddFromHome !== undefined) {
        await nav.openHome();
        await home.addToCart(productByKey(c.input.thenAddFromHome).name);
        await nav.openCart();
        if (exp.afterReAdd) await checkCartState(cart, exp.afterReAdd, 'After adding the product again from the home page');
      }
    });
  }
});
```
