# FR-07 Giỏ hàng script: P5 Checklist giao diện trang Giỏ hàng (bản AI)

- Bước: `[B-FR07][script]`, phần P5
- Thời gian tạo: 2026-11-17 15:13 (UTC+07:00)
- Công cụ: Claude Code, model Claude Opus 5.5 (`claude-opus-5-5`), skill `playwright-automation`
- Căn cứ: `01_selected_tc.md` (P5: TC-CART-90, 94, 95; D-06, D-08, D-09), `02_review.md` (mục 1: Câu chốt định dạng tiền ở `note` của TC-CART-94; mục 2.1 cấu trúc), `tests/B_FR-07_GioHang/data/cart_gui.json`, `data/products.json`; spec, `lib/` và page object của P1 đến P4 (bản AI P4, commit `d01d2d3`); snapshot `ai_raw/snapshot_cart_items.txt` (`columnheader`, `button "Xóa"` trong mỗi dòng, dòng tổng ngay sau bảng), `snapshot_cart_empty.txt`, `snapshot_home.txt`; mã frontend `App.jsx` (link "Giỏ hàng" có class `hover:underline`, chỉ để biết vì sao phải đưa con trỏ ra khỏi navbar trước khi đọc style)
- Quyết định áp dụng: Như `02_review.md` mục 2.1; không có điểm cấu trúc mới cần hỏi trước P5
- Đã sửa trước khi giao: Không

Thay đổi file dùng chung so với bản đã có (chép đủ bên dưới):

| File | Thay đổi |
|---|---|
| `tests/support/pages/CartPage.ts` | Thêm `columnHeaders`, `removeControls(row)`, `breadcrumbLandmark`, `crumbsInOrder(first, second)` |
| `tests/support/pages/NavBar.ts` | Thêm `cartLinkStyle()` (đưa con trỏ ra vùng nội dung rồi đọc `aria-current` và style tính toán của link "Giỏ hàng") |
| `tests/B_FR-07_GioHang/lib/money.ts` | Thêm `currencyFormatPattern(symbol, whole)` (TC-CART-94) |
| `tests/B_FR-07_GioHang/lib/types.ts` | Thêm `CartGuiCase` |

## Giả định

- GĐ-01: TC-CART-90 kiểm **đủ** 5 tiêu đề cột theo đúng chữ của đặc tả, mỗi tiêu đề đúng một lần; không kiểm thứ tự (FR-07 liệt kê nhưng không nói thứ tự là yêu cầu), xem CH-script-04.
- GĐ-02: "Mỗi dòng có nút xóa" (TC-CART-90): Mỗi dòng có một nút có tên chứa "xóa" (không phân biệt hoa thường), để nhận cả "Xóa" lẫn "Xóa sản phẩm" (tên trong FR07-R10). Không so nhãn nút.
- GĐ-03: Nhãn tổng tiền (TC-CART-90, FR07-R14 "nhãn chính xác Tổng cộng, không phải Tổng tạm tính"): Khối tổng tiền (tìm theo vị trí như các phần trước) phải chứa "Tổng cộng" và không chứa "Tổng tạm tính". Đây là chỗ duy nhất trong feature kiểm nhãn này (#75).
- GĐ-04: Định dạng tiền (TC-CART-94) theo câu chốt ở `note`: Phần số gồm nhóm đầu 1 đến 3 chữ số, các nhóm sau đúng 3 chữ số, cùng một ký tự `,` hoặc `.` giữa các nhóm; số từ 1.000 trở lên phải có phân cách. Ký hiệu `₫` (lấy từ `currencySymbol` của dữ liệu) chấp nhận đứng trước hoặc sau số, có hoặc không có khoảng trắng (FR-21 không nói vị trí), xem CH-script-05. Ô Đơn giá và Thành tiền phải chỉ gồm số tiền; khối tổng chỉ cần chứa một số tiền đúng định dạng (khối có cả nhãn).
- GĐ-05: Highlight (TC-CART-95, D-06 a): So link "Giỏ hàng" ở trang Giỏ hàng với chính link đó ở trang chủ: Đạt khi có `aria-current="page"`, hoặc khác ít nhất một trong `color`, `background-color`, `font-weight`, `text-decoration-line`. Trước khi đọc style, con trỏ được đưa vào vùng nội dung (`main`), vì link có hiệu ứng hover (gạch chân) và test vừa bấm vào link để mở Giỏ hàng: Đọc khi con trỏ còn trên link sẽ nhận nhầm hiệu ứng hover là highlight.
- GĐ-06: Breadcrumb (TC-CART-95, D-06 a): Đạt khi có vùng `navigation` có tên chứa "breadcrumb" (không phân biệt hoa thường), hoặc trong `main` có link "Trang chủ", sau nó có phần tử có chữ đúng "Giỏ hàng", và cả hai đứng trước heading đầu tiên của `main` ("ở đầu vùng nội dung").
- GĐ-07: Giỏ của TC-CART-90, 94 tạo bằng `prepareCart` (D-04, D-08); TC-CART-95 dùng giỏ trống (dữ liệu). Thông tin chi tiết của từng điểm không đạt (style hai trang, chữ của ô) ghi trong câu thông báo của assertion.

## Câu hỏi cho sinh viên

- CH-script-04: TC-CART-90 có kiểm thứ tự 5 cột không? Phương án: a. Chỉ kiểm đủ cột (bản AI); b. Kiểm cả thứ tự như FR-07 liệt kê. Lưu ý: Các phần P1 đến P4 đọc ô theo vị trí cột đúng thứ tự FR-07 (GĐ-03 của P1), nên nếu thứ tự không phải yêu cầu thì cách đọc ô đó cũng là một giả định.
- CH-script-05: Ký hiệu `₫` đứng trước hay sau số? Phương án: a. Chấp nhận cả hai (bản AI, vì FR-21 không nói); b. Chỉ chấp nhận đứng sau như test case HW02 viết ("30,000,000 ₫").

## Kiểu assertion

- Trong spec P5: `toHaveCount` (mỗi tiêu đề cột, nút xóa của mỗi dòng), `toContainText` / `not.toContainText` (nhãn tổng), `toHaveText` (định dạng tiền), `toBe` (highlight, breadcrumb).
- Trong `lib/cartChecks.ts`: `toHaveCount`, `toHaveText` (`checkCartState`, số dòng của TC-CART-90).

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
  readonly columnHeaders: Locator;
  readonly rows: Locator;
  readonly totalValue: Locator;
  readonly illustrations: Locator;
  readonly breadcrumbLandmark: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main');
    this.table = this.main.getByRole('table');
    this.columnHeaders = this.table.getByRole('columnheader');
    // Dòng dữ liệu (có ô cell), bỏ dòng tiêu đề.
    this.rows = this.table.getByRole('row').filter({ has: page.getByRole('cell') });
    // Dòng tổng: Phần tử con đầu tiên của khối ngay sau bảng.
    this.totalValue = this.main.locator('table + div > :first-child');
    // Hình minh họa của giỏ trống: Ảnh hoặc biểu tượng đang hiển thị trong vùng nội dung (D-03).
    this.illustrations = this.main.locator('img, svg').filter({ visible: true });
    // Breadcrumb dạng vùng điều hướng có tên chứa "breadcrumb" (D-06).
    this.breadcrumbLandmark = page.getByRole('navigation', { name: /breadcrumb/i });
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

  // Nút xóa của một dòng, nhận mọi tên chứa "xóa" ("Xóa", "Xóa sản phẩm"); dùng cho checklist TC-CART-90.
  removeControls(row: Locator): Locator {
    return row.getByRole('button', { name: /xóa/i });
  }

  // Link hoặc nút trong vùng nội dung có đúng tên (đặc tả gọi là "nút" nhưng không nói là phần tử nào).
  action(name: string): Locator {
    return this.main
      .getByRole('link', { name, exact: true })
      .or(this.main.getByRole('button', { name, exact: true }));
  }

  // Breadcrumb dạng dãy liên kết (D-06): Link `first`, sau nó một phần tử có chữ đúng `second`,
  // cả hai đứng trước heading đầu tiên của vùng nội dung.
  async crumbsInOrder(first: string, second: string): Promise<boolean> {
    return this.main.evaluate(
      (main, [a, b]) => {
        const all = Array.from(main.querySelectorAll('*'));
        const ia = all.findIndex((e) => e.tagName === 'A' && e.textContent?.trim() === a);
        const ib = all.findIndex((e, i) => i > ia && e.children.length === 0 && e.textContent?.trim() === b);
        const ih = all.findIndex((e) => /^H[1-6]$/.test(e.tagName));
        return ia >= 0 && ib > ia && (ih < 0 || ib < ih);
      },
      [first, second] as const,
    );
  }
}
```

File: `tests/support/pages/NavBar.ts`

```ts
import type { Locator, Page } from '@playwright/test';

export interface LinkStyle {
  ariaCurrent: string | null;
  color: string;
  backgroundColor: string;
  fontWeight: string;
  textDecorationLine: string;
}

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

  // aria-current và style tính toán của link "Giỏ hàng" (D-06). Đưa con trỏ vào vùng nội dung trước,
  // để hiệu ứng hover của link (sau khi vừa bấm vào nó) không bị đọc nhầm thành highlight.
  async cartLinkStyle(): Promise<LinkStyle> {
    await this.page.getByRole('main').hover({ position: { x: 1, y: 1 } });
    return this.cartLink.evaluate((link) => {
      const s = getComputedStyle(link);
      return {
        ariaCurrent: link.getAttribute('aria-current'),
        color: s.color,
        backgroundColor: s.backgroundColor,
        fontWeight: s.fontWeight,
        textDecorationLine: s.textDecorationLine,
      };
    });
  }
}
```

File: `tests/B_FR-07_GioHang/lib/money.ts`

```ts
// Mẫu so số tiền hiển thị với số nguyên trong dữ liệu (quyết định của SV: Số tiền ghi bằng số nguyên).
// Không kèm ký tự phân cách: Chữ số đúng thứ tự, giữa hai chữ số có thể có một ký tự phân cách; hai đầu không dính chữ số.
// Có số phân cách (TC-CART-104, 105): Nhóm 3 chữ số từ phải sang, cùng một ký tự "," hoặc "." giữa các nhóm.
export function moneyPattern(value: number, thousandSeparators?: number): RegExp {
  const digits = String(value);
  if (thousandSeparators === undefined) {
    return new RegExp(`(^|\\D)${digits.split('').join('[.,\\s\\u00a0]?')}(\\D|$)`);
  }
  const groups: string[] = [];
  for (let end = digits.length; end > 0; end -= 3) groups.unshift(digits.slice(Math.max(0, end - 3), end));
  if (groups.length - 1 !== thousandSeparators) {
    throw new Error(`Test data error: ${value} has ${groups.length - 1} thousands separators, data says ${thousandSeparators}`);
  }
  const [first, ...rest] = groups;
  const tail = rest.map((g, k) => (k === 0 ? `([.,])${g}` : `\\2${g}`)).join('');
  return new RegExp(`(^|\\D)${first}${tail}(\\D|$)`);
}

// Định dạng tiền của TC-CART-94 (không xét giá trị): Nhóm đầu 1 đến 3 chữ số, các nhóm sau đúng 3 chữ số,
// cùng một ký tự "," hoặc "." giữa các nhóm; ký hiệu tiền đứng trước hoặc sau số (GĐ-04 của ai_raw/script_05_cart_gui.md).
// whole: Chuỗi chỉ gồm số tiền (ô của bảng); không whole: Chứa một số tiền đúng định dạng (khối tổng có cả nhãn).
export function currencyFormatPattern(symbol: string, whole: boolean): RegExp {
  const sym = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sp = '[\\s\\u00a0]*';
  const before = `${sym}${sp}\\d{1,3}(?:([.,])\\d{3}(?:\\1\\d{3})*)?`;
  const after = `\\d{1,3}(?:([.,])\\d{3}(?:\\2\\d{3})*)?${sp}${sym}`;
  const body = `(?:${before}|${after})`;
  return whole
    ? new RegExp(`^${sp}${body}${sp}$`)
    : new RegExp(`(?:^|[^\\d.,${sym}])${body}(?:$|[^\\d.,${sym}])`);
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

export interface CartGuiCase {
  id: string;
  title: string;
  setup: { cart: string[] };
  expected: {
    columns?: string[];
    rowCount?: number;
    deleteButtonPerRow?: boolean;
    totalLabel?: string;
    currencySymbol?: string;
    thousandsSeparated?: Array<'unitPrice' | 'lineTotal' | 'total'>;
    navHighlight?: { link: string; ariaCurrent: string; orStyleDiffersFrom: 'home' };
    breadcrumb?: { landmarkNameContains: string; orLinksInOrder: [string, string] };
  };
  oracle: string;
  note?: string;
}
```

File: `tests/B_FR-07_GioHang/05_cart_gui.spec.ts`

```ts
// P5 (01_selected_tc.md mục 3): Checklist giao diện trang Giỏ hàng.
// Test case: TC-CART-90, TC-CART-94, TC-CART-95.
// Dữ liệu: data/cart_gui.json, data/products.json.
import { test, expect } from '../support/fixtures';
import { CartPage } from '../support/pages/CartPage';
import { HomePage } from '../support/pages/HomePage';
import { NavBar } from '../support/pages/NavBar';
import cases from './data/cart_gui.json';
import { checkCartState, prepareCart } from './lib/cartChecks';
import { currencyFormatPattern } from './lib/money';
import type { CartGuiCase } from './lib/types';
import { USER_STATE } from './setup/globalSetup';

const softExpect = expect.configure({ soft: true });

test.use({ storageState: USER_STATE });

test.describe('FR-07 Cart P5: cart page GUI checklist', () => {
  for (const c of cases as unknown as CartGuiCase[]) {
    test(`${c.id}: ${c.title}`, async ({ page }) => {
      const exp = c.expected;
      const home = new HomePage(page);
      const cart = new CartPage(page);
      const nav = new NavBar(page);

      await home.goto();
      await prepareCart(home, nav, cart, c.setup.cart);
      // TC-CART-95: Style của link "Giỏ hàng" ở trang chủ để so (GĐ-05).
      const homeStyle = exp.navHighlight ? await nav.cartLinkStyle() : undefined;
      await nav.openCart();

      // TC-CART-90: Tiêu đề cột, nút xóa mỗi dòng, nhãn tổng tiền.
      for (const name of exp.columns ?? []) {
        await softExpect(
          cart.table.getByRole('columnheader', { name, exact: true }),
          `FR-07: column "${name}" in the cart table`,
        ).toHaveCount(1);
      }
      if (exp.rowCount !== undefined) await checkCartState(cart, { rowCount: exp.rowCount }, 'Cart page');
      if (exp.deleteButtonPerRow) {
        const n = await cart.rows.count();
        for (let i = 0; i < n; i++) {
          await softExpect(cart.removeControls(cart.rows.nth(i)), `R10: delete button on cart line ${i + 1}`).toHaveCount(1);
        }
      }
      if (exp.totalLabel !== undefined) {
        await softExpect(cart.totalValue, `R14: total label is exactly "${exp.totalLabel}"`).toContainText(exp.totalLabel);
        await softExpect(cart.totalValue, 'R14: total label is not "Tổng tạm tính"').not.toContainText('Tổng tạm tính');
      }

      // TC-CART-94: Ký hiệu ₫ và phân cách hàng nghìn ở Đơn giá, Thành tiền, Tổng cộng.
      if (exp.currencySymbol !== undefined) {
        const fields = exp.thousandsSeparated ?? [];
        const cellPattern = currencyFormatPattern(exp.currencySymbol, true);
        const n = await cart.rows.count();
        for (let i = 0; i < n; i++) {
          const row = cart.rows.nth(i);
          for (const f of fields) {
            if (f === 'total') continue;
            await softExpect(cart.cell(row, f), `FR-21: ${f} of line ${i + 1} uses "${exp.currencySymbol}" and thousands separators`).toHaveText(
              cellPattern,
            );
          }
        }
        if (fields.includes('total')) {
          await softExpect(cart.totalValue, `FR-21: cart total uses "${exp.currencySymbol}" and thousands separators`).toHaveText(
            currencyFormatPattern(exp.currencySymbol, false),
          );
        }
      }

      // TC-CART-95: Navbar highlight và breadcrumb (D-06).
      if (exp.navHighlight && homeStyle) {
        const cartStyle = await nav.cartLinkStyle();
        const styleDiffers =
          cartStyle.color !== homeStyle.color ||
          cartStyle.backgroundColor !== homeStyle.backgroundColor ||
          cartStyle.fontWeight !== homeStyle.fontWeight ||
          cartStyle.textDecorationLine !== homeStyle.textDecorationLine;
        softExpect(
          cartStyle.ariaCurrent === exp.navHighlight.ariaCurrent || styleDiffers,
          `FR-23: "${exp.navHighlight.link}" highlighted on the cart page (home ${JSON.stringify(homeStyle)}, cart ${JSON.stringify(cartStyle)})`,
        ).toBe(true);
      }
      if (exp.breadcrumb) {
        const [first, second] = exp.breadcrumb.orLinksInOrder;
        const hasLandmark = (await cart.breadcrumbLandmark.count()) > 0;
        const hasCrumbs = await cart.crumbsInOrder(first, second);
        softExpect(
          hasLandmark || hasCrumbs,
          `FR-23: breadcrumb on the cart page (navigation named "${exp.breadcrumb.landmarkNameContains}", or "${first}" before "${second}")`,
        ).toBe(true);
      }
    });
  }
});
```
