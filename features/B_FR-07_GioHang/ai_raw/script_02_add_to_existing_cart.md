# FR-07 Giỏ hàng script: P2 Thêm vào giỏ đã có hàng (bản AI)

- Bước: `[B-FR07][script]`, phần P2
- Thời gian tạo: 2026-11-17 14:26 (UTC+07:00)
- Công cụ: Claude Code, model Claude Opus 5.5 (`claude-opus-5-5`), skill `playwright-automation`
- Căn cứ: `01_selected_tc.md` (P2: TC-CART-02, 03; D-02, D-04), `02_review.md` (mục 1 dữ liệu; mục 2.1 cấu trúc, 2.2 CH-script-01, 02), `tests/B_FR-07_GioHang/data/add_to_existing_cart.json`, `data/products.json`; spec P1 bản đã review (commit `4062769`), `lib/`, page object của P1; snapshot `ai_raw/snapshot_home.txt` (link "EShop" trong `banner`, nút "Thêm vào giỏ" trên thẻ sản phẩm), `snapshot_cart_items.txt`; quan sát HW02 `06_results.md` mục 4.B (TC-CART-02: Bấm "Thêm vào giỏ" ở trang chủ một lần thêm đúng một dòng)
- Quyết định của sinh viên trước khi viết P2: `checkCartState` chuyển sang `lib/cartChecks.ts`, kiểu assertion trong hàm `lib` được tính cho spec gọi nó; bước chuẩn bị giỏ (D-04) được kiểm bằng cách mở Giỏ hàng, không đạt thì ném lỗi "Chuẩn bị không đạt", đạt thì quay về trang chủ bằng link "EShop". Các quyết định của P1 (`02_review.md` mục 2.1) giữ nguyên
- Đã sửa trước khi giao: Không

Thay đổi file dùng chung so với bản đã review của P1 (chép đủ bên dưới):

| File | Thay đổi |
|---|---|
| `tests/support/pages/NavBar.ts` | Thêm `homeLink` (link "EShop" trong `banner`) và `openHome()` |
| `tests/support/pages/HomePage.ts` | Thêm `addButton(name)`; `addToCart` dùng hàm này (để cài bộ ghi phản hồi lên đúng nút trước khi bấm) |
| `tests/B_FR-07_GioHang/lib/types.ts` | Thêm `AddToExistingCartCase` |
| `tests/B_FR-07_GioHang/lib/cartChecks.ts` | File mới: `checkCartState` chuyển nguyên từ spec P1 (không đổi nội dung kiểm), thêm `prepareCart` |
| `tests/B_FR-07_GioHang/01_add_from_detail.spec.ts` | Bỏ `checkCartState` cục bộ, import từ `lib/cartChecks.ts`; vòng thêm từ trang chủ thay bằng `prepareCart` (dữ liệu P1 đều `setup.cart: []` nên không đổi hành vi) |

## Giả định

- GĐ-01: Quy tắc "lần bấm đầu không phản hồi thì bấm thêm" chỉ áp cho nút "Thêm vào giỏ hàng" ở trang chi tiết (quyết định ở P1). Nút "Thêm vào giỏ" ở trang chủ bấm đúng một lần: HW02 quan sát bấm một lần thêm đúng một dòng, và bấm thêm sẽ thêm dòng thứ hai (#70), làm sai kết quả.
- GĐ-02: TC-CART-02 đo OUT15 sau lần bấm ở trang chủ bằng cùng bộ ghi phản hồi của P1; vùng thông tin sản phẩm của trang chủ là phần tử con trực tiếp của `main` chứa nút (lưới sản phẩm), nên chữ đổi trong thẻ sản phẩm không bị tính.
- GĐ-03: Badge mong đợi (`badge` là số, A17) kiểm sau khi mở Giỏ hàng bằng `expect.poll` trên `NavBar.badgeCount()`, để trạng thái đã ổn định; TC-CART-02 còn kiểm "badge cập nhật" như một nửa của OUT15 ngay sau khi bấm.
- GĐ-04: TC-CART-03 không có OUT15 trong kết quả mong đợi (HW02 TC-CART-03), nên không kiểm phản hồi; lần bấm đầu không phản hồi vẫn ghi lỗi `soft` như mọi lần thêm từ trang chi tiết.
- GĐ-05: `prepareCart` kiểm giỏ sau khi chuẩn bị: Số dòng bằng số sản phẩm chuẩn bị, mỗi sản phẩm đúng một dòng, Số lượng 1. Assertion trong `prepareCart` là assertion thường được bọc lại: Sai thì ném lỗi "Chuẩn bị không đạt (setup not met)" kèm dòng đầu của lỗi gốc, test dừng và không tính là kết quả của test case (D-04).
- GĐ-06: TC-CART-03 với bug #70: Giỏ có 2 dòng iPhone; `checkCartState` ghi lỗi số dòng và đọc dòng iPhone đầu tiên (dòng cũ, Số lượng 1), nên report ghi thêm lỗi "Số lượng 4", "Thành tiền 120,000,000" (CH-script-02).

## Câu hỏi cho sinh viên

Không có câu hỏi mới. Kiểu assertion của P2 tính cả hàm `lib` (quyết định trước khi viết): `check_automation.py spec` chỉ đếm trong file truyền vào, nên lệnh kiểm truyền cả spec P2 và `lib/cartChecks.ts`.

## Kiểu assertion

- Trong spec P2: `expect.poll` (phản hồi OUT15, badge), `toHaveValue` (ô "Số lượng:"), `toBe` (lần bấm đầu).
- Trong `lib/cartChecks.ts` (tính cho spec gọi nó): `toHaveCount` (số dòng, đúng một dòng sản phẩm), `toHaveText` (Số lượng, Thành tiền, tổng tiền).

## Code

File: `tests/support/pages/NavBar.ts`

```ts
import type { Locator, Page } from '@playwright/test';

// Thanh điều hướng của Web (dùng chung cho mọi trang).
export class NavBar {
  readonly cartLink: Locator;
  readonly homeLink: Locator;

  constructor(private readonly page: Page) {
    // Tên có thể kèm số badge ("Giỏ hàng 2"), nên khớp phần đầu.
    this.cartLink = page.getByRole('navigation').getByRole('link', { name: /^Giỏ hàng/ });
    this.homeLink = page.getByRole('banner').getByRole('link', { name: 'EShop', exact: true });
  }

  // Mở Giỏ hàng bằng link (chuyển trang phía client, giỏ trong bộ nhớ không mất).
  async openCart(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForURL('**/cart');
    await this.page.getByRole('main').getByRole('heading').first().waitFor();
  }

  // Về trang chủ bằng link "EShop" (chuyển trang phía client, giỏ không mất).
  async openHome(): Promise<void> {
    await this.homeLink.click();
    await this.page.getByRole('main').getByRole('heading', { level: 2 }).first().waitFor();
  }

  // Số trên link "Giỏ hàng" hoặc trong phần tử ngay cạnh link (không chứa link, nút); null nếu không có số (D-02).
  async badgeCount(): Promise<number | null> {
    return this.cartLink.evaluate((link) => {
      const own = (link.textContent ?? '').replace('Giỏ hàng', '');
      const next = link.nextElementSibling;
      const nextText =
        next && !next.matches('a, button') && !next.querySelector('a, button') ? (next.textContent ?? '') : '';
      const m = `${own} ${nextText}`.match(/\d+/);
      return m ? Number(m[0]) : null;
    });
  }
}
```

File: `tests/support/pages/HomePage.ts`

```ts
import type { Locator, Page } from '@playwright/test';

// Trang chủ (danh sách sản phẩm).
export class HomePage {
  readonly main: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main');
  }

  // Chỉ dùng ở đầu test: Tải lại ứng dụng làm mất giỏ trong bộ nhớ.
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.main.getByRole('heading', { level: 2 }).first().waitFor();
  }

  // Thẻ sản phẩm: div trong cùng chứa cả tên sản phẩm (heading cấp 2) và nút "Thêm vào giỏ".
  // Lưới sản phẩm cũng chứa cả hai nên khớp trước; thẻ là phần tử khớp cuối theo thứ tự DOM.
  card(name: string): Locator {
    return this.main
      .locator('div')
      .filter({ has: this.page.getByRole('heading', { level: 2, name, exact: true }) })
      .filter({ has: this.page.getByRole('button', { name: 'Thêm vào giỏ', exact: true }) })
      .last();
  }

  addButton(name: string): Locator {
    return this.card(name).getByRole('button', { name: 'Thêm vào giỏ', exact: true });
  }

  async addToCart(name: string): Promise<void> {
    await this.addButton(name).click();
  }

  async openDetail(name: string): Promise<void> {
    await this.card(name).getByRole('link', { name: 'Xem chi tiết' }).click();
    await this.page.getByRole('main').getByRole('heading', { level: 1, name, exact: true }).waitFor();
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
```

File: `tests/B_FR-07_GioHang/lib/cartChecks.ts`

```ts
import { expect } from '../../support/fixtures';
import type { CartPage } from '../../support/pages/CartPage';
import type { HomePage } from '../../support/pages/HomePage';
import type { NavBar } from '../../support/pages/NavBar';
import { moneyPattern } from './money';
import { productByKey } from './products';
import type { CartStateExpected } from './types';

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

File: `tests/B_FR-07_GioHang/01_add_from_detail.spec.ts`

```ts
// P1 (01_selected_tc.md mục 3): Thêm vào giỏ từ trang chi tiết sản phẩm.
// Test case: TC-CART-01, TC-CART-101, TC-CART-104, TC-CART-105, TC-CART-100.
// Dữ liệu: data/add_from_detail.json, data/products.json.
import { test, expect } from '../support/fixtures';
import { USER_ACCOUNT } from '../support/accounts';
import { CartPage } from '../support/pages/CartPage';
import { HomePage } from '../support/pages/HomePage';
import { NavBar } from '../support/pages/NavBar';
import { ProductDetailPage } from '../support/pages/ProductDetailPage';
import cases from './data/add_from_detail.json';
import { getCartRows, loginToken, newRows } from './lib/cartApi';
import { checkCartState, prepareCart } from './lib/cartChecks';
import { becomesTrueWithin, clickAddWithRetry, feedbackSeen, FEEDBACK_WINDOW_MS } from './lib/feedback';
import { productByKey } from './lib/products';
import type { AddFromDetailCase } from './lib/types';
import { USER_STATE } from './setup/globalSetup';

const softExpect = expect.configure({ soft: true });

test.use({ storageState: USER_STATE });

test.describe('FR-07 Cart P1: add to cart from the product detail page', () => {
  for (const c of cases as unknown as AddFromDetailCase[]) {
    test(`${c.id}: ${c.title}`, async ({ page, request }) => {
      const exp = c.expected;
      const product = productByKey(c.input.product);
      const home = new HomePage(page);
      const detail = new ProductDetailPage(page);
      const cart = new CartPage(page);
      const nav = new NavBar(page);

      // K1 phần API (D-01, CH-data-01 a): Đọc giỏ API ngay trước thao tác thêm.
      const token = exp.k1?.apiCart ? await loginToken(request, USER_ACCOUNT) : undefined;
      const apiBefore = token ? await getCartRows(request, token) : [];

      await home.goto();
      await prepareCart(home, nav, cart, c.setup.cart);
      await home.openDetail(product.name);

      if (c.input.fillQuantity) {
        await detail.quantity.fill(String(c.input.quantity));
        await expect(detail.quantity).toHaveValue(String(c.input.quantity));
      } else if ((await detail.quantity.inputValue()) !== String(c.input.quantity)) {
        throw new Error(
          `Chuẩn bị không đạt (setup not met): "Số lượng:" is not ${c.input.quantity}, cannot keep it as the test case requires`,
        );
      }

      const badgeBefore = await nav.badgeCount();
      const { firstClickResponded } = await clickAddWithRetry(page, detail, nav, badgeBefore);
      if (exp.outcome === 'added') {
        softExpect(
          firstClickResponded,
          'First click on "Thêm vào giỏ hàng" gave no response within 1.5 s; clicked again (HW02 observation 2)',
        ).toBe(true);
      }

      const seen = feedbackSeen(page, nav, badgeBefore);
      if (exp.feedback === 'toastOrBadge') {
        await softExpect
          .poll(seen, { message: 'OUT15: toast or "Giỏ hàng" badge update after adding (D-02)', timeout: FEEDBACK_WINDOW_MS })
          .toBe(true);
      }
      if (exp.feedback === 'noSuccess') {
        softExpect(
          await becomesTrueWithin(seen, FEEDBACK_WINDOW_MS),
          'A31: no success toast and no badge change after a rejected add',
        ).toBe(false);
      }
      if (exp.badge === 'unchanged') {
        softExpect(await nav.badgeCount(), 'Badge of "Giỏ hàng" unchanged').toBe(badgeBefore);
      }

      await nav.openCart();
      await checkCartState(cart, exp, 'Cart page');

      if (token) {
        const added = newRows(apiBefore, await getCartRows(request, token));
        softExpect(
          added.map((r) => ({ id: r.id, quantity: r.quantity })),
          'K1: GET /api/cart has exactly the expected new line (CH-data-01 a)',
        ).toEqual((exp.rows ?? []).map((r) => ({ id: productByKey(r.product).apiId, quantity: r.quantity })));
      }
      if (exp.k1?.afterReload) {
        await page.reload();
        await checkCartState(cart, exp, 'K1 after reload');
      }
    });
  }
});
```

File: `tests/B_FR-07_GioHang/02_add_to_existing_cart.spec.ts`

```ts
// P2 (01_selected_tc.md mục 3): Thêm vào giỏ đã có hàng (từ trang chủ, hoặc thêm lại sản phẩm đã có từ trang chi tiết).
// Test case: TC-CART-02, TC-CART-03.
// Dữ liệu: data/add_to_existing_cart.json, data/products.json.
import { test, expect } from '../support/fixtures';
import { CartPage } from '../support/pages/CartPage';
import { HomePage } from '../support/pages/HomePage';
import { NavBar } from '../support/pages/NavBar';
import { ProductDetailPage } from '../support/pages/ProductDetailPage';
import cases from './data/add_to_existing_cart.json';
import { checkCartState, prepareCart } from './lib/cartChecks';
import { clickAddWithRetry, feedbackSeen, FEEDBACK_WINDOW_MS, startFeedbackRecorder } from './lib/feedback';
import { productByKey } from './lib/products';
import type { AddToExistingCartCase } from './lib/types';
import { USER_STATE } from './setup/globalSetup';

const softExpect = expect.configure({ soft: true });

test.use({ storageState: USER_STATE });

test.describe('FR-07 Cart P2: add to a cart that already has lines', () => {
  for (const c of cases as unknown as AddToExistingCartCase[]) {
    test(`${c.id}: ${c.title}`, async ({ page }) => {
      const exp = c.expected;
      const product = productByKey(c.input.product);
      const home = new HomePage(page);
      const detail = new ProductDetailPage(page);
      const cart = new CartPage(page);
      const nav = new NavBar(page);

      await home.goto();
      await prepareCart(home, nav, cart, c.setup.cart);

      let badgeBefore: number | null;
      if (c.input.from === 'home') {
        // Trang chủ: Bấm đúng một lần (GĐ-01 của ai_raw/script_02_add_to_existing_cart.md).
        badgeBefore = await nav.badgeCount();
        await startFeedbackRecorder(home.addButton(product.name));
        await home.addToCart(product.name);
      } else {
        await home.openDetail(product.name);
        if (c.input.fillQuantity && c.input.quantity !== undefined) {
          await detail.quantity.fill(String(c.input.quantity));
          await expect(detail.quantity).toHaveValue(String(c.input.quantity));
        }
        badgeBefore = await nav.badgeCount();
        const { firstClickResponded } = await clickAddWithRetry(page, detail, nav, badgeBefore);
        softExpect(
          firstClickResponded,
          'First click on "Thêm vào giỏ hàng" gave no response within 1.5 s; clicked again (HW02 observation 2)',
        ).toBe(true);
      }

      if (exp.feedback === 'toastOrBadge') {
        await softExpect
          .poll(feedbackSeen(page, nav, badgeBefore), {
            message: 'OUT15: toast or "Giỏ hàng" badge update after adding (D-02)',
            timeout: FEEDBACK_WINDOW_MS,
          })
          .toBe(true);
      }

      await nav.openCart();
      await checkCartState(cart, exp, 'Cart page');

      if (exp.badge !== undefined) {
        await softExpect
          .poll(() => nav.badgeCount(), { message: 'R24: "Giỏ hàng" badge equals the total quantity in the cart (A17)' })
          .toBe(exp.badge);
      }
    });
  }
});
```
