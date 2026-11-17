# FR-07 Giỏ hàng script: P6 API thêm vào giỏ không hợp lệ (bản AI)

- Bước: `[B-FR07][script]`, phần P6
- Thời gian tạo: 2026-11-17 15:44 (UTC+07:00)
- Công cụ: Claude Code, model Claude Opus 5.5 (`claude-opus-5-5`), skill `playwright-automation`
- Căn cứ: `01_selected_tc.md` (mục 2.1 test API, P6: TC-CART-30 đến 36, 102), `02_review.md` (mục 1: GĐ-05 đến GĐ-07 của bản AI dữ liệu, schema test API; mục 2.1 cấu trúc), `tests/B_FR-07_GioHang/data/api_invalid.json`, `data/cart_api_base.json`; `api_specification.md` mục 4 (`GET /api/cart`, `POST /api/cart`, header `Authorization: Bearer <token>`); `lib/cartApi.ts`, `lib/types.ts` (bản AI P5, commit `4cc1e7d`); `playwright.config.ts` (tên project `chrome`, `edge`, `firefox`)
- Quyết định của sinh viên trước khi viết P6: Test API (P6, P7) chỉ chạy trên project `chrome` (D17); Edge, Firefox bỏ qua bằng `test.skip` trong spec, kèm lý do. Các quyết định chung ở `02_review.md` mục 2.1 giữ nguyên
- Đã sửa trước khi giao: Không

Thay đổi file dùng chung so với bản đã có (chép đủ bên dưới):

| File | Thay đổi |
|---|---|
| `tests/B_FR-07_GioHang/lib/cartApi.ts` | Thêm `ApiResult`, `postCart`, `getCart`, `getProduct`, `cartRowsOf`, `buildBody`, `tamperToken`; `getCartRows` viết lại trên `getCart` + `cartRowsOf` (hành vi không đổi: Lỗi khi không phải 2xx hoặc không có mảng dòng) |
| `tests/B_FR-07_GioHang/lib/types.ts` | Thêm `ApiAuth`, `ApiRequestSpec`, `ApiInvalidCase`, `CartApiBase` |

## Giả định

- GĐ-01: D17 hiện bằng `test.skip(testInfo.project.name !== 'chrome', ...)` trong `beforeEach` của spec: Report Edge, Firefox hiện các test P6 là skipped với lý do "D17: API tests run on Chrome only". Đây là phạm vi chạy do sinh viên chốt, không phải bỏ qua test fail.
- GĐ-02: "Phản hồi thành công" là HTTP 2xx (GĐ-06 của bản AI dữ liệu), kiểm bằng `toBeOK()` / `not.toBeOK()` của Playwright trên đúng response.
- GĐ-03: "Giỏ không đổi" là không có dòng mới giữa `GET /api/cart` ngay trước và ngay sau bước chính (GĐ-07 của bản AI dữ liệu), đọc bằng token hợp lệ của `test@eshop.com`, kể cả với TC-CART-35 (bước chính không gửi token).
- GĐ-04: Bước 1 của TC-CART-30 ("`GET /api/products/9999` không trả về sản phẩm") là kiểm tiền điều kiện: Phản hồi 2xx có object có `id` hoặc `name` thì ném lỗi "Chuẩn bị không đạt" (sản phẩm 9999 có thật thì test case không còn ý nghĩa). Phản hồi không phải 2xx, hoặc body rỗng (HW02 ghi `{}`), là đạt.
- GĐ-05: TC-CART-36 bước 1 (`setupPost`): `POST` body cơ sở bằng token hợp lệ; không phải 2xx thì ném lỗi "Chuẩn bị không đạt". "Không có dữ liệu giỏ" là body phản hồi không phải mảng dòng và không có trường nào là mảng (`cartRowsOf` trả `null`).
- GĐ-06: Token bị sửa (TC-CART-36): Đổi ký tự ở giữa phần cuối (phần chữ ký) của token thành ký tự khác (`A` hoặc `B`), theo GĐ-05 của bản AI dữ liệu.
- GĐ-07: Mỗi test ghi annotation "Response" gồm phương thức, mã HTTP và 200 ký tự đầu của body, làm bằng chứng cho bước `bugs` (đặc tả không nêu mã HTTP và câu lỗi, GH5 của HW02, nên không so).
- GĐ-08: Body gửi đi là `baseBody` ghép `bodyOverride` rồi bỏ các trường trong `bodyOmit`; giữ đúng kiểu JSON của dữ liệu (`1.5` là số, `"abc"` là chuỗi).

## Câu hỏi cho sinh viên

- CH-script-06: Spec API không có giao diện nên `check_automation.py spec --with-imports` chỉ đếm được 2 kiểu: Phản hồi mạng (`toBeOK`) và Giá trị tính toán / so sánh (`toBe`, `toHaveLength`, `toBeNull`), dưới mức "mỗi spec ≥ 3 kiểu" đã chốt. AI không thêm assertion chỉ để đủ kiểu. Phương án: a. Ghi ngoại lệ cho spec API (P6, P7) trong `02_review.md`: Mỗi spec giao diện đủ ≥ 3 kiểu, spec API 2 kiểu, cả feature vẫn đủ; b. Sinh viên chỉ ra một điểm kiểm có ý nghĩa thuộc kiểu khác để thêm.

## Kiểu assertion

- Trong spec P6: `toBeOK` / `not.toBeOK` (Phản hồi mạng); `toHaveLength` (không có dòng mới), `toBeNull` (không có dữ liệu giỏ) (Giá trị tính toán / so sánh).

## Code

File: `tests/B_FR-07_GioHang/lib/cartApi.ts`

```ts
import type { APIRequestContext, APIResponse } from '@playwright/test';
import { API_URL } from '../../support/urls';

export type CartApiRow = Record<string, unknown>;

// Kết quả gọi API: Giữ response gốc (cho toBeOK), mã HTTP, body đã parse (nếu là JSON) và chữ gốc.
export interface ApiResult {
  response: APIResponse;
  status: number;
  body: unknown;
  text: string;
}

async function toResult(response: APIResponse): Promise<ApiResult> {
  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {
    // Không phải JSON: Giữ chữ gốc.
  }
  return { response, status: response.status(), body, text };
}

function authHeaders(token: string | undefined): Record<string, string> {
  return token === undefined ? {} : { Authorization: `Bearer ${token}` };
}

export async function loginToken(api: APIRequestContext, account: { email: string; password: string }): Promise<string> {
  const res = await api.post(`${API_URL}/api/login`, { data: account });
  if (!res.ok()) throw new Error(`POST /api/login for ${account.email}: HTTP ${res.status()}`);
  const body = await res.json();
  if (typeof body?.token !== 'string') throw new Error(`POST /api/login for ${account.email}: No token in response`);
  return body.token;
}

// token undefined: Không gửi header Authorization (TC-CART-35).
export async function postCart(api: APIRequestContext, token: string | undefined, body: Record<string, unknown>): Promise<ApiResult> {
  return toResult(await api.post(`${API_URL}/api/cart`, { data: body, headers: authHeaders(token) }));
}

export async function getCart(api: APIRequestContext, token: string | undefined): Promise<ApiResult> {
  return toResult(await api.get(`${API_URL}/api/cart`, { headers: authHeaders(token) }));
}

export async function getProduct(api: APIRequestContext, id: number): Promise<ApiResult> {
  return toResult(await api.get(`${API_URL}/api/products/${id}`));
}

// Mảng dòng của giỏ trong body: Body là mảng, hoặc object có một trường là mảng (API spec không mô tả body phản hồi).
// null: Không có dữ liệu giỏ.
export function cartRowsOf(body: unknown): CartApiRow[] | null {
  if (Array.isArray(body)) return body as CartApiRow[];
  if (body && typeof body === 'object') {
    const list = Object.values(body).find(Array.isArray);
    if (list) return list as CartApiRow[];
  }
  return null;
}

// GET /api/cart bằng token hợp lệ; không phải 2xx hoặc không có mảng dòng là lỗi (không phải kết quả của test case).
export async function getCartRows(api: APIRequestContext, token: string): Promise<CartApiRow[]> {
  const res = await getCart(api, token);
  if (!res.response.ok()) throw new Error(`GET /api/cart: HTTP ${res.status}`);
  const rows = cartRowsOf(res.body);
  if (!rows) throw new Error(`GET /api/cart: No cart lines in response ${res.text.slice(0, 200)}`);
  return rows;
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

// Body cơ sở ghép phần đổi, rồi bỏ các trường trong omit (giữ đúng kiểu JSON của dữ liệu).
export function buildBody(
  base: Record<string, unknown>,
  override: Record<string, unknown> = {},
  omit: string[] = [],
): Record<string, unknown> {
  const body: Record<string, unknown> = { ...base, ...override };
  for (const k of omit) delete body[k];
  return body;
}

// Token bị sửa một ký tự: Đổi ký tự ở giữa phần cuối (chữ ký) của token (GĐ-05 của ai_raw/data.md).
export function tamperToken(token: string): string {
  const parts = token.split('.');
  const sig = parts[parts.length - 1];
  const i = Math.floor(sig.length / 2);
  const replacement = sig[i] === 'A' ? 'B' : 'A';
  parts[parts.length - 1] = sig.slice(0, i) + replacement + sig.slice(i + 1);
  return parts.join('.');
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

// Test API (P6, P7): Schema ở ai_raw/data.md mục "Test API".
export type ApiAuth = 'user' | 'admin' | 'none' | 'userTampered';

export interface ApiRequestSpec {
  method: 'POST' | 'GET';
  auth: ApiAuth;
  bodyOverride?: Record<string, unknown>;
  bodyOmit?: string[];
}

export interface CartApiBase {
  baseBody: Record<string, unknown>;
  oracle: string;
}

export interface ApiInvalidCase {
  id: string;
  title: string;
  precheck?: { productMissing: number };
  setupPost?: boolean;
  request: ApiRequestSpec;
  expected: { success: boolean; newRowCount?: number; cartData?: boolean };
  oracle: string;
  note?: string;
}
```

File: `tests/B_FR-07_GioHang/06_api_invalid.spec.ts`

```ts
// P6 (01_selected_tc.md mục 2.1, 3): API thêm vào giỏ / xem giỏ với yêu cầu không hợp lệ (test API, không tính vào 15).
// Test case: TC-CART-30, 31, 32, 33, 34, 35, 102, 36.
// Dữ liệu: data/api_invalid.json, data/cart_api_base.json. Chỉ chạy trên project chrome (D17).
import { test, expect } from '../support/fixtures';
import { USER_ACCOUNT } from '../support/accounts';
import apiBase from './data/cart_api_base.json';
import cases from './data/api_invalid.json';
import {
  buildBody,
  cartRowsOf,
  getCart,
  getCartRows,
  getProduct,
  loginToken,
  newRows,
  postCart,
  tamperToken,
  type ApiResult,
} from './lib/cartApi';
import type { ApiInvalidCase, CartApiBase } from './lib/types';

const softExpect = expect.configure({ soft: true });
const base = (apiBase as CartApiBase).baseBody;

test.describe('FR-07 Cart P6: API rejects invalid cart requests', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chrome', 'D17: API tests run on Chrome only');
  });

  for (const c of cases as unknown as ApiInvalidCase[]) {
    test(`${c.id}: ${c.title}`, async ({ request }, testInfo) => {
      const exp = c.expected;
      const userToken = await loginToken(request, USER_ACCOUNT);
      const record = (label: string, r: ApiResult): void => {
        testInfo.annotations.push({ type: 'Response', description: `${label} -> HTTP ${r.status} ${r.text.slice(0, 200)}` });
      };

      // Bước 1 của TC-CART-30: Sản phẩm không tồn tại (GĐ-04).
      if (c.precheck) {
        const p = await getProduct(request, c.precheck.productMissing);
        record(`GET /api/products/${c.precheck.productMissing}`, p);
        const exists = p.response.ok() && !!p.body && typeof p.body === 'object' && ('id' in p.body || 'name' in p.body);
        if (exists) {
          throw new Error(`Chuẩn bị không đạt (setup not met): product ${c.precheck.productMissing} exists`);
        }
      }
      // Bước 1 của TC-CART-36: Thêm body cơ sở bằng token hợp lệ (GĐ-05).
      if (c.setupPost) {
        const s = await postCart(request, userToken, base);
        record('POST /api/cart (setup, valid token)', s);
        if (!s.response.ok()) throw new Error(`Chuẩn bị không đạt (setup not met): POST /api/cart with a valid token: HTTP ${s.status}`);
      }

      const before = await getCartRows(request, userToken);
      const token =
        c.request.auth === 'none' ? undefined : c.request.auth === 'userTampered' ? tamperToken(userToken) : userToken;

      let res: ApiResult;
      if (c.request.method === 'POST') {
        const body = buildBody(base, c.request.bodyOverride, c.request.bodyOmit);
        res = await postCart(request, token, body);
        record(`POST /api/cart ${JSON.stringify(body)} (auth: ${c.request.auth})`, res);
      } else {
        res = await getCart(request, token);
        record(`GET /api/cart (auth: ${c.request.auth})`, res);
      }

      // KQ-KH-API: Không trả về phản hồi thành công (GĐ-02).
      if (exp.success) await softExpect(res.response, 'Request succeeds (2xx)').toBeOK();
      else await softExpect(res.response, `KQ-KH-API: request is rejected (not 2xx), got HTTP ${res.status}`).not.toBeOK();

      if (exp.cartData === false) {
        softExpect(cartRowsOf(res.body), 'No cart data in the response').toBeNull();
      }
      // KQ-KH-API: Giỏ không đổi, đọc bằng token hợp lệ (GĐ-03).
      if (exp.newRowCount !== undefined) {
        const added = newRows(before, await getCartRows(request, userToken));
        softExpect(added, `Cart unchanged: new lines ${JSON.stringify(added).slice(0, 200)}`).toHaveLength(exp.newRowCount);
      }
    });
  }
});
```
