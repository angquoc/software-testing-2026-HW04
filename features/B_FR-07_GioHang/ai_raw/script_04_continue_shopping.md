# FR-07 Giỏ hàng script: P4 Giỏ trống và nút Tiếp tục mua sắm (bản AI)

- Bước: `[B-FR07][script]`, phần P4
- Thời gian tạo: 2026-11-17 15:03 (UTC+07:00)
- Công cụ: Claude Code, model Claude Opus 5.5 (`claude-opus-5-5`), skill `playwright-automation`
- Căn cứ: `01_selected_tc.md` (P4: TC-CART-10, 11; D-03, D-04; GĐ-06), `02_review.md` (mục 2.1 cấu trúc; 2.2 CH-script-01 đến 03), `tests/B_FR-07_GioHang/data/continue_shopping.json`, `data/products.json`; spec, `lib/` và page object của P1 đến P3 (P3 bản đã review, commit `306deed`); snapshot `ai_raw/snapshot_cart_empty.txt` (`link "Tiếp tục mua sắm"`), `snapshot_cart_items.txt` (`link "← Mua tiếp"`, không có "Tiếp tục mua sắm"), `snapshot_home.txt` (`heading "Danh sách sản phẩm" [level=1]`)
- Quyết định áp dụng: Như `02_review.md` mục 2.1; không có điểm cấu trúc mới cần hỏi trước P4
- Đã sửa trước khi giao: Không

Thay đổi file dùng chung so với bản đã có (chép đủ bên dưới):

| File | Thay đổi |
|---|---|
| `tests/support/pages/CartPage.ts` | Thêm `action(name)`: Link hoặc nút trong `main` có đúng tên |
| `tests/support/pages/HomePage.ts` | Thêm `heading(name)`: Heading trong `main` có đúng tên |
| `tests/B_FR-07_GioHang/lib/types.ts` | Thêm `ContinueShoppingCase` |

## Giả định

- GĐ-01: FR07-R12 gọi "Tiếp tục mua sắm" là "nút" nhưng không nói là phần tử `button` hay link. Script nhận cả link và nút có đúng tên "Tiếp tục mua sắm" trong `main` (A30 của HW02: Liên kết cũng đạt); snapshot cho thấy giỏ trống dùng link.
- GĐ-02: Badge "ẩn hoặc 0" (A18) là `NavBar.badgeCount()` trả `null` (không có số) hoặc `0`.
- GĐ-03: OUT10 ("Đường dẫn `localhost:5173`, trang Danh sách sản phẩm") kiểm bằng `toHaveURL` đúng `WEB_URL` + `path` của dữ liệu, và heading "Danh sách sản phẩm" hiển thị trong `main`. Không kiểm cấp của heading (đặc tả không nêu).
- GĐ-04: TC-CART-11 theo bước của test case (GĐ-06 của `select`): Kiểm "Tiếp tục mua sắm" có hiển thị (`soft`); không có thì ghi annotation "Fallback" rồi bấm `fallbackButton` ("← Mua tiếp") để vẫn kiểm được FR07-R13. Không có cả hai thì test dừng (không còn cách quay về theo test case).
- GĐ-05: "Mở lại trang Giỏ hàng" (TC-CART-11) bằng link "Giỏ hàng" ở navbar, không tải lại trang (giỏ trong bộ nhớ).
- GĐ-06: TC-CART-10 kiểm trạng thái giỏ trống bằng `checkEmptyState` của P3 (D-03), rồi mới bấm "Tiếp tục mua sắm".

## Câu hỏi cho sinh viên

Không có câu hỏi mới.

## Kiểu assertion

- Trong spec P4: `toHaveURL` (về trang chủ), `toBeVisible` (nút "Tiếp tục mua sắm", heading trang chủ), `toContain` (badge ẩn hoặc 0).
- Trong `lib/cartChecks.ts`: `toHaveCount`, `toHaveText` (`checkCartState`); `toBeVisible`, `toContainText`, `toHaveCount` (`checkEmptyState`).

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

  // Link hoặc nút trong vùng nội dung có đúng tên (đặc tả gọi là "nút" nhưng không nói là phần tử nào).
  action(name: string): Locator {
    return this.main
      .getByRole('link', { name, exact: true })
      .or(this.main.getByRole('button', { name, exact: true }));
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

  heading(name: string): Locator {
    return this.main.getByRole('heading', { name, exact: true });
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

export interface ContinueShoppingCase {
  id: string;
  title: string;
  setup: { cart: string[] };
  input: { button: string; fallbackButton?: string };
  expected: {
    emptyState?: EmptyStateExpected;
    badge?: 'hiddenOrZero';
    continueButton?: 'present';
    home: { path: string; heading: string };
    afterReturn?: CartStateExpected;
  };
  oracle: string;
  note?: string;
}
```

File: `tests/B_FR-07_GioHang/04_continue_shopping.spec.ts`

```ts
// P4 (01_selected_tc.md mục 3): Giỏ trống và nút "Tiếp tục mua sắm".
// Test case: TC-CART-10, TC-CART-11.
// Dữ liệu: data/continue_shopping.json, data/products.json.
import { test, expect } from '../support/fixtures';
import { CartPage } from '../support/pages/CartPage';
import { HomePage } from '../support/pages/HomePage';
import { NavBar } from '../support/pages/NavBar';
import { WEB_URL } from '../support/urls';
import cases from './data/continue_shopping.json';
import { checkCartState, checkEmptyState, prepareCart } from './lib/cartChecks';
import type { ContinueShoppingCase } from './lib/types';
import { USER_STATE } from './setup/globalSetup';

const softExpect = expect.configure({ soft: true });

test.use({ storageState: USER_STATE });

test.describe('FR-07 Cart P4: empty cart and continue shopping', () => {
  for (const c of cases as unknown as ContinueShoppingCase[]) {
    test(`${c.id}: ${c.title}`, async ({ page }, testInfo) => {
      const exp = c.expected;
      const home = new HomePage(page);
      const cart = new CartPage(page);
      const nav = new NavBar(page);

      await home.goto();
      await prepareCart(home, nav, cart, c.setup.cart);
      await nav.openCart();

      if (exp.emptyState) await checkEmptyState(cart, exp.emptyState, 'Empty cart page');
      if (exp.badge === 'hiddenOrZero') {
        softExpect([null, 0], 'R24 / A18: "Giỏ hàng" badge hidden or 0 when the cart is empty').toContain(
          await nav.badgeCount(),
        );
      }

      // FR07-R12: Nút "Tiếp tục mua sắm". Không có thì làm theo bước của test case: Bấm nút quay về đang có (GĐ-04).
      const button = cart.action(c.input.button);
      if (exp.continueButton === 'present') {
        await softExpect(button.first(), `R12: "${c.input.button}" is shown on the cart page`).toBeVisible();
      }
      if ((await button.count()) > 0) {
        await button.first().click();
      } else if (c.input.fallbackButton !== undefined && (await cart.action(c.input.fallbackButton).count()) > 0) {
        testInfo.annotations.push({
          type: 'Fallback',
          description: `"${c.input.button}" not found; clicked "${c.input.fallbackButton}" to check R13 (test case step)`,
        });
        await cart.action(c.input.fallbackButton).first().click();
      } else {
        throw new Error(`No "${c.input.button}"${c.input.fallbackButton ? ` or "${c.input.fallbackButton}"` : ''} on the cart page to go back home`);
      }

      // OUT10, FR07-R13: Về trang chủ.
      await softExpect(page, 'R13 / OUT10: back on the home page').toHaveURL(`${WEB_URL}${exp.home.path}`);
      await softExpect(home.heading(exp.home.heading), `OUT10: "${exp.home.heading}" page`).toBeVisible();

      if (exp.afterReturn) {
        await nav.openCart();
        await checkCartState(cart, exp.afterReturn, 'Cart reopened after continuing shopping');
      }
    });
  }
});
```
