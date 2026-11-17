# FR-07 Giỏ hàng script: P1 Thêm vào giỏ từ trang chi tiết (bản AI)

- Bước: `[B-FR07][script]`, phần P1
- Thời gian tạo: 2026-11-17 14:01 (UTC+07:00)
- Công cụ: Claude Code, model Claude Opus 5.5 (`claude-opus-5-5`), skill `playwright-automation`
- Căn cứ: `01_selected_tc.md` (P1: TC-CART-01, 101, 104, 105, 100; D-02, D-04; GĐ-01 đến GĐ-06), `02_review.md` mục 1 (schema đã chốt, CH-data-01 a, CH-data-02 a), `tests/B_FR-07_GioHang/data/add_from_detail.json`, `data/products.json`; snapshot `ai_raw/snapshot_home.txt`, `snapshot_product_detail.txt`, `snapshot_cart_empty.txt`, `snapshot_cart_items.txt` (Chrome 157, đăng nhập `test@eshop.com`, module setup đăng nhập bằng API rồi đặt token vào `localStorage`); mã nguồn frontend `frontend-web/src/App.jsx`, `pages/Home.jsx`, `pages/ProductDetail.jsx`, `pages/Cart.jsx`, `pages/Login.jsx`, `context/CartContext.jsx`, `context/AuthContext.jsx` (chỉ để lấy selector và luồng thao tác); `tests/support/` (fixtures, accounts, urls, globalSetup, page object của FR-17 làm mẫu)
- Quyết định của sinh viên trước khi viết (áp cho P1 đến P7): Page object trong `tests/support/pages/`; thông tin giao diện từ `aria_snapshot` và mã frontend; đăng nhập một lần bằng `storageState` qua `globalSetup` chung; ô tổng tiền tìm theo vị trí, nhãn "Tổng cộng" chỉ kiểm ở TC-CART-90; mỗi file spec tự có ≥ 3 kiểu assertion; `expect.soft` cho các điểm kiểm độc lập, assertion thường cho điều kiện mà sai thì bước sau vô nghĩa; lần bấm "Thêm vào giỏ hàng" đầu tiên không phản hồi trong khoảng 1,5 giây thì ghi lỗi `soft` và bấm thêm một lần (HW02 `06_results.md` mục 4.F ghi nhận 2)
- Đã sửa trước khi giao: Không

File dùng chung sửa hoặc thêm ở phần này: `tests/support/accounts.ts` (thêm `USER_ACCOUNT`), `tests/support/globalSetup.ts` (đăng ký phần chuẩn bị của FR-07); thêm `tests/support/pages/NavBar.ts`, `HomePage.ts`, `ProductDetailPage.ts`, `CartPage.ts`. Hai file có sẵn được chép đủ bên dưới.

## Giả định

- GĐ-01: Trang chi tiết mở bằng link "Xem chi tiết" trên thẻ sản phẩm ở trang chủ, không dùng `page.goto('/product/<id>')`: Giỏ nằm trong bộ nhớ trang (GĐ-01 của `select`), tải lại ứng dụng làm mất giỏ đã chuẩn bị. Thẻ sản phẩm là `div` trong cùng chứa cả heading tên sản phẩm (cấp 2) và nút "Thêm vào giỏ" (snapshot `home`).
- GĐ-02: Nhãn "Số lượng:" không gắn với ô nhập (snapshot `product_detail`: `text: "Số lượng:"` đứng riêng, `spinbutton` không có tên), nên ô tìm theo role `spinbutton` trong vùng `main` (trang chi tiết chỉ có một ô số).
- GĐ-03: Ô trong dòng giỏ đọc theo vị trí cột, theo đúng thứ tự cột FR-07 liệt kê (Sản phẩm, Đơn giá, Số lượng, Thành tiền, Thao tác). Không tìm theo tiêu đề cột vì tiêu đề "Đơn giá" đang là "Giá" (#76); tiêu đề cột kiểm riêng ở TC-CART-90. Cùng cách xử lý với ô tổng (quyết định của SV).
- GĐ-04: Ô tổng tiền là phần tử con đầu tiên của khối ngay sau bảng (snapshot `cart_items`: Dòng tổng đứng ngay sau `table`). Assertion chỉ so giá trị trong khối đó, không so nhãn.
- GĐ-05: So tiền bằng biểu thức chính quy dựng từ số nguyên của dữ liệu: Chữ số đúng thứ tự, cho phép một ký tự phân cách (`,` `.` khoảng trắng) giữa hai chữ số, hai đầu không dính chữ số khác. Dòng có `thousandSeparators` (TC-CART-104, 105) dùng mẫu chặt: Nhóm 3 chữ số từ phải sang, cùng một ký tự phân cách `,` hoặc `.` (CH-data-02 a, câu chốt ở TC-CART-94).
- GĐ-06: Đăng nhập trong `globalSetup`: Gọi `POST /api/login` của `test@eshop.com`, ghi token vào `storageState` (`.auth/user.json`, khóa `localStorage` là `token` theo `AuthContext.jsx`), không mở trình duyệt. File `.auth/` bị `.gitignore` chặn. Phần chuẩn bị chỉ chạy khi lượt chạy là FR-07 (`lessons.md`, "Rút từ lần làm thật").
- GĐ-07: Phản hồi OUT15 (D-02 b) đo bằng `MutationObserver` cài ngay trước lần bấm đầu: Ghi mọi chữ mới xuất hiện ngoài vùng thông tin sản phẩm. Vùng thông tin sản phẩm là phần tử con trực tiếp của `main` chứa nút bấm, nên việc nút đổi nhãn thành "Đã thêm" không bị tính. Badge (D-02) là số trong link "Giỏ hàng" hoặc trong phần tử ngay cạnh link mà không chứa link hay nút. "Có phản hồi" là có chữ mới hoặc badge khác trước khi bấm.
- GĐ-08: Khoảng chờ: Lần bấm đầu 1,5 giây (quyết định của SV); chờ phản hồi sau khi thêm 3 giây; quan sát "không có phản hồi" sau khi bị từ chối 2 giây. Hai số sau do AI chọn (CH-script-01).
- GĐ-09: TC-CART-100 (kết quả mong đợi là bị từ chối): Lần bấm đầu không phản hồi là đúng mong đợi nên **không** ghi lỗi; script vẫn bấm thêm một lần như mọi test của trang chi tiết, để lỗi "lần bấm đầu không làm gì" không che việc hệ thống nhận số lượng 0. Quan sát "không có phản hồi" và giỏ trống tính sau lần bấm thứ hai.
- GĐ-10: Ô "Số lượng:" không phải giá trị cần giữ (TC-CART-01, GĐ-04 của `data`): Script ném lỗi bắt đầu bằng "Chuẩn bị không đạt (setup not met)" (D-04). Playwright không có trạng thái riêng cho trường hợp này nên test hiện là failed, phân biệt qua thông báo.
- GĐ-11: `GET /api/cart` trả về mảng dòng hoặc object có một trường là mảng dòng (API spec không mô tả body phản hồi). "Dòng mới" là chênh lệch theo bội (multiset) giữa hai lần đọc, so cả nội dung dòng (CH-data-01 a).
- GĐ-12: Thứ tự trong test có K1 (TC-CART-01): Kiểm trang Giỏ hàng, rồi `GET /api/cart`, rồi tải lại trang và kiểm lại (bước tải lại làm mất giỏ nên đặt cuối, mọi điểm của K1 là `soft`).

## Câu hỏi cho sinh viên

- CH-script-01: Khoảng chờ phản hồi sau khi thêm (3 giây) và khoảng quan sát "không có phản hồi" ở TC-CART-100 (2 giây) do AI chọn, đặc tả không nêu. Phương án: a. Giữ 3 giây và 2 giây; b. Đặt bằng nhau, ví dụ cùng 3 giây, để "có" và "không có" phản hồi được đo trên cùng một khoảng; c. Sinh viên chọn số khác.
- CH-script-02: Dòng tìm theo tên sản phẩm phải có đúng 1 dòng (assertion thường: Sai thì không đọc ô). Khi hệ thống tạo trùng dòng (#70) ở các phần sau, test dừng ngay ở bước này. Với P1 mỗi test chỉ thêm một lần nên không ảnh hưởng; câu hỏi để chốt cho P2: a. Giữ assertion thường; b. Đổi thành `soft` và đọc ô của dòng đầu tiên khi có nhiều dòng.

## Kiểu assertion trong spec

`toHaveValue` (ô "Số lượng:" sau khi nhập), `toHaveCount` (số dòng, đúng một dòng sản phẩm), `toHaveText` (ô Đơn giá, Số lượng, Thành tiền, ô tổng), `expect.poll` (chờ phản hồi OUT15), `toBe` / `toEqual` (badge, lần bấm đầu, dòng mới của giỏ API).

## Code

File: `tests/support/accounts.ts`

```ts
// Tài khoản thử có sẵn của EShop (WORKFLOW.md mục 4.1, HW02 05_final_tc.md mục 1.3).
// Không phải thông tin cá nhân; để ở đây để spec không chứa mật khẩu.
export const ADMIN_ACCOUNT = { email: 'admin@eshop.com', password: 'Admin123!' };
export const USER_ACCOUNT = { email: 'test@eshop.com', password: 'Test1234!' };
```

File: `tests/support/globalSetup.ts`

```ts
import { setupFr17 } from '../C_FR-17_QuanLyCoupon/setup/globalSetup';
import { setupFr07 } from '../B_FR-07_GioHang/setup/globalSetup';

// globalSetup chung của dự án: Chỉ chạy phần chuẩn bị của feature có trong lượt chạy hiện tại.
// tools/run.mjs chạy mỗi trình duyệt bằng một lệnh riêng, nên hàm này chạy một lần trước mỗi trình duyệt.
const FEATURE_SETUPS: Record<string, () => Promise<void>> = {
  'C_FR-17_QuanLyCoupon': setupFr17,
  'B_FR-07_GioHang': setupFr07,
};

// Tham số đường dẫn trên dòng lệnh (bỏ tùy chọn và giá trị của tùy chọn viết tách, ví dụ `--project chrome`).
function pathFilters(): string[] {
  const args = process.argv.slice(2);
  const filters: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === 'test') continue;
    if (a.startsWith('-')) {
      if (!a.includes('=') && args[i + 1] && !args[i + 1].startsWith('-')) i++;
      continue;
    }
    filters.push(a.replace(/\\/g, '/'));
  }
  return filters;
}

function isTargeted(featureDir: string): boolean {
  const label = process.env.RUN_LABEL;
  if (label) return label.startsWith(`${featureDir} x `);
  const filters = pathFilters();
  return filters.length === 0 || filters.some((f) => f.includes(featureDir));
}

export default async function globalSetup(): Promise<void> {
  for (const [featureDir, setup] of Object.entries(FEATURE_SETUPS)) {
    if (isTargeted(featureDir)) await setup();
  }
}
```

File: `tests/B_FR-07_GioHang/setup/globalSetup.ts`

```ts
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { request } from '@playwright/test';
import { USER_ACCOUNT } from '../../support/accounts';
import { WEB_URL } from '../../support/urls';
import { loginToken } from '../lib/cartApi';

// Trạng thái đăng nhập test@eshop.com cho các test giao diện của FR-07 (thư mục .auth/ bị .gitignore chặn).
export const USER_STATE = path.resolve(__dirname, '../../../.auth/user.json');

// Đăng nhập bằng API rồi ghi token vào storageState: Web đọc token từ localStorage khóa "token".
// Không mở trình duyệt; storageState dùng được cho cả Chrome, Edge, Firefox.
export async function setupFr07(): Promise<void> {
  const api = await request.newContext();
  try {
    const token = await loginToken(api, USER_ACCOUNT);
    const state = {
      cookies: [],
      origins: [{ origin: WEB_URL, localStorage: [{ name: 'token', value: token }] }],
    };
    mkdirSync(path.dirname(USER_STATE), { recursive: true });
    writeFileSync(USER_STATE, JSON.stringify(state, null, 2));
  } catch (err) {
    throw new Error(`FR-07 globalSetup: Cannot log in ${USER_ACCOUNT.email} (is the backend running?): ${String(err)}`);
  } finally {
    await api.dispose();
  }
}
```

File: `tests/support/pages/NavBar.ts`

```ts
import type { Locator, Page } from '@playwright/test';

// Thanh điều hướng của Web (dùng chung cho mọi trang).
export class NavBar {
  readonly cartLink: Locator;

  constructor(private readonly page: Page) {
    // Tên có thể kèm số badge ("Giỏ hàng 2"), nên khớp phần đầu.
    this.cartLink = page.getByRole('navigation').getByRole('link', { name: /^Giỏ hàng/ });
  }

  // Mở Giỏ hàng bằng link (chuyển trang phía client, giỏ trong bộ nhớ không mất).
  async openCart(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForURL('**/cart');
    await this.page.getByRole('main').getByRole('heading').first().waitFor();
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

  async addToCart(name: string): Promise<void> {
    await this.card(name).getByRole('button', { name: 'Thêm vào giỏ', exact: true }).click();
  }

  async openDetail(name: string): Promise<void> {
    await this.card(name).getByRole('link', { name: 'Xem chi tiết' }).click();
    await this.page.getByRole('main').getByRole('heading', { level: 1, name, exact: true }).waitFor();
  }
}
```

File: `tests/support/pages/ProductDetailPage.ts`

```ts
import type { Locator, Page } from '@playwright/test';

// Trang chi tiết sản phẩm.
export class ProductDetailPage {
  readonly quantity: Locator;
  readonly addButton: Locator;

  constructor(page: Page) {
    const main = page.getByRole('main');
    // Nhãn "Số lượng:" không gắn với ô (không dùng getByLabel được); trang chỉ có một ô số.
    this.quantity = main.getByRole('spinbutton');
    this.addButton = main.getByRole('button', { name: 'Thêm vào giỏ hàng', exact: true });
  }
}
```

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

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main');
    this.table = this.main.getByRole('table');
    // Dòng dữ liệu (có ô cell), bỏ dòng tiêu đề.
    this.rows = this.table.getByRole('row').filter({ has: page.getByRole('cell') });
    // Dòng tổng: Phần tử con đầu tiên của khối ngay sau bảng.
    this.totalValue = this.main.locator('table + div > :first-child');
  }

  row(productName: string): Locator {
    return this.rows.filter({ has: this.page.getByRole('cell', { name: productName, exact: true }) });
  }

  cell(row: Locator, column: keyof typeof CartPage.COLUMN): Locator {
    return row.getByRole('cell').nth(CartPage.COLUMN[column]);
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
```

File: `tests/B_FR-07_GioHang/lib/products.ts`

```ts
import products from '../data/products.json';
import type { Product } from './types';

// Tra sản phẩm theo khóa trong data/products.json; khóa sai là lỗi dữ liệu.
export function productByKey(key: string): Product {
  const p = (products as Product[]).find((x) => x.key === key);
  if (!p) throw new Error(`Unknown product key in test data: ${key}`);
  return p;
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
```

File: `tests/B_FR-07_GioHang/lib/cartApi.ts`

```ts
import type { APIRequestContext } from '@playwright/test';
import { API_URL } from '../../support/urls';

export type CartApiRow = Record<string, unknown>;

export async function loginToken(api: APIRequestContext, account: { email: string; password: string }): Promise<string> {
  const res = await api.post(`${API_URL}/api/login`, { data: account });
  if (!res.ok()) throw new Error(`POST /api/login for ${account.email}: HTTP ${res.status()}`);
  const body = await res.json();
  if (typeof body?.token !== 'string') throw new Error(`POST /api/login for ${account.email}: No token in response`);
  return body.token;
}

// GET /api/cart: API spec không mô tả body phản hồi; nhận mảng dòng hoặc object có một trường là mảng.
export async function getCartRows(api: APIRequestContext, token: string): Promise<CartApiRow[]> {
  const res = await api.get(`${API_URL}/api/cart`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok()) throw new Error(`GET /api/cart: HTTP ${res.status()}`);
  const body = await res.json();
  if (Array.isArray(body)) return body;
  const list = body && typeof body === 'object' ? Object.values(body).find(Array.isArray) : undefined;
  if (!list) throw new Error(`GET /api/cart: No cart lines in response ${JSON.stringify(body).slice(0, 200)}`);
  return list as CartApiRow[];
}

// Dòng có trong `after` mà không có trong `before`, so theo nội dung và đếm theo bội.
export function newRows(before: CartApiRow[], after: CartApiRow[]): CartApiRow[] {
  const left = new Map<string, number>();
  for (const r of before) left.set(JSON.stringify(r), (left.get(JSON.stringify(r)) ?? 0) + 1);
  const added: CartApiRow[] = [];
  for (const r of after) {
    const k = JSON.stringify(r);
    const n = left.get(k) ?? 0;
    if (n > 0) left.set(k, n - 1);
    else added.push(r);
  }
  return added;
}
```

File: `tests/B_FR-07_GioHang/lib/feedback.ts`

```ts
import type { Locator, Page } from '@playwright/test';
import { expect } from '../../support/fixtures';
import type { NavBar } from '../../support/pages/NavBar';
import type { ProductDetailPage } from '../../support/pages/ProductDetailPage';

// Khoảng chờ (GĐ-07, GĐ-08 của ai_raw/script_01_add_from_detail.md).
export const FIRST_CLICK_WINDOW_MS = 1_500;
export const FEEDBACK_WINDOW_MS = 3_000;
export const NO_FEEDBACK_WINDOW_MS = 2_000;

declare global {
  interface Window {
    __fr07Feedback?: string[];
  }
}

// Ghi mọi chữ mới xuất hiện ngoài vùng thông tin sản phẩm (phần tử con trực tiếp của main chứa nút bấm), D-02 b.
// Cài trước khi bấm để bắt cả toast tự ẩn.
export async function startFeedbackRecorder(clicked: Locator): Promise<void> {
  await clicked.evaluate((button) => {
    const region = button.closest('main > *') ?? button;
    const texts: string[] = [];
    window.__fr07Feedback = texts;
    new MutationObserver((mutations) => {
      for (const m of mutations) {
        const nodes = m.type === 'characterData' ? [m.target] : Array.from(m.addedNodes);
        for (const n of nodes) {
          if (region.contains(n)) continue;
          const t = (n.textContent ?? '').trim();
          if (t) texts.push(t);
        }
      }
    }).observe(document.body, { subtree: true, childList: true, characterData: true });
  });
}

export async function readFeedback(page: Page): Promise<string[]> {
  return page.evaluate(() => [...(window.__fr07Feedback ?? [])]);
}

// true nếu điều kiện đúng trong khoảng thời gian; false nếu hết thời gian (dùng cho quan sát "không xảy ra").
export async function becomesTrueWithin(check: () => Promise<boolean>, timeout: number): Promise<boolean> {
  try {
    await expect.poll(check, { timeout, intervals: [100, 250] }).toBe(true);
    return true;
  } catch {
    return false;
  }
}

// Có phản hồi sau khi bấm: Chữ mới ngoài vùng sản phẩm, hoặc badge khác lúc trước khi bấm.
export function feedbackSeen(page: Page, nav: NavBar, badgeBefore: number | null): () => Promise<boolean> {
  return async () => (await readFeedback(page)).length > 0 || (await nav.badgeCount()) !== badgeBefore;
}

// Bấm "Thêm vào giỏ hàng"; lần bấm đầu không có thay đổi nào (kể cả nhãn nút) trong FIRST_CLICK_WINDOW_MS thì bấm thêm một lần.
// Trả về lần bấm đầu có phản hồi không; spec quyết định có ghi lỗi hay không.
export async function clickAddWithRetry(
  page: Page,
  detail: ProductDetailPage,
  nav: NavBar,
  badgeBefore: number | null,
): Promise<{ firstClickResponded: boolean }> {
  await startFeedbackRecorder(detail.addButton);
  await detail.addButton.click();
  const seen = feedbackSeen(page, nav, badgeBefore);
  const firstClickResponded = await becomesTrueWithin(
    async () => (await seen()) || (await detail.addButton.count()) === 0,
    FIRST_CLICK_WINDOW_MS,
  );
  if (!firstClickResponded) await detail.addButton.click();
  return { firstClickResponded };
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
import {
  becomesTrueWithin,
  clickAddWithRetry,
  feedbackSeen,
  FEEDBACK_WINDOW_MS,
  NO_FEEDBACK_WINDOW_MS,
} from './lib/feedback';
import { moneyPattern } from './lib/money';
import { productByKey } from './lib/products';
import type { AddFromDetailCase, CartStateExpected } from './lib/types';
import { USER_STATE } from './setup/globalSetup';

const softExpect = expect.configure({ soft: true });

test.use({ storageState: USER_STATE });

// Kiểm trạng thái trang Giỏ hàng. rowPresence "hard": Không có đúng một dòng sản phẩm thì dừng test (đọc ô vô nghĩa).
async function checkCartState(
  cart: CartPage,
  exp: CartStateExpected,
  label: string,
  rowPresence: 'hard' | 'soft',
): Promise<void> {
  if (exp.rowCount !== undefined) {
    await softExpect(cart.rows, `${label}: number of cart lines`).toHaveCount(exp.rowCount);
  }
  for (const r of exp.rows ?? []) {
    const name = productByKey(r.product).name;
    const row = cart.row(name);
    if (rowPresence === 'hard') {
      await expect(row, `${label}: exactly one line "${name}"`).toHaveCount(1);
    } else {
      await softExpect(row, `${label}: exactly one line "${name}"`).toHaveCount(1);
      if ((await row.count()) !== 1) continue;
    }
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
      for (const key of c.setup.cart) await home.addToCart(productByKey(key).name);
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
          await becomesTrueWithin(seen, NO_FEEDBACK_WINDOW_MS),
          'A31: no success toast and no badge change after a rejected add',
        ).toBe(false);
      }
      if (exp.badge === 'unchanged') {
        softExpect(await nav.badgeCount(), 'Badge of "Giỏ hàng" unchanged').toBe(badgeBefore);
      }

      await nav.openCart();
      await checkCartState(cart, exp, 'Cart page', 'hard');

      if (token) {
        const added = newRows(apiBefore, await getCartRows(request, token));
        softExpect(
          added.map((r) => ({ id: r.id, quantity: r.quantity })),
          'K1: GET /api/cart has exactly the expected new line (CH-data-01 a)',
        ).toEqual((exp.rows ?? []).map((r) => ({ id: productByKey(r.product).apiId, quantity: r.quantity })));
      }
      if (exp.k1?.afterReload) {
        await page.reload();
        await checkCartState(cart, exp, 'K1 after reload', 'soft');
      }
    });
  }
});
```
