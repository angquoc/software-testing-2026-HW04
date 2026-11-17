# FR-07 Giỏ hàng script: P7 API hợp lệ và bảo mật (bản AI)

- Bước: `[B-FR07][script]`, phần P7
- Thời gian tạo: 2026-11-17 15:50 (UTC+07:00)
- Công cụ: Claude Code, model Claude Opus 5.5 (`claude-opus-5-5`), skill `playwright-automation`
- Căn cứ: `01_selected_tc.md` (mục 2.1 test API, P7: TC-CART-50, 51, 54, 53), `02_review.md` (mục 1: CH-data-04 b, schema test API; mục 2.1: D17; mục 2.2: CH-script-06 a), `tests/B_FR-07_GioHang/data/api_valid.json`, `data/cart_api_base.json`; `api_specification.md` mục 4; `lib/cartApi.ts`, `lib/types.ts`, spec P6 (bản AI P6, commit `0efe78c`); `tests/support/accounts.ts` (`ADMIN_ACCOUNT`)
- Quyết định áp dụng: D17 (chỉ chạy trên `chrome`, `test.skip` trong spec); CH-script-06 a (spec API 2 kiểu assertion); các quyết định chung ở `02_review.md` mục 2.1
- Đã sửa trước khi giao: Không
- Lỗi kiểm còn lại: `check_automation.py spec tests/B_FR-07_GioHang/07_api_valid.spec.ts --min-assert 3 --with-imports` báo 2 kiểu assertion, cần ≥ 3; chấp nhận theo CH-script-06 a (ngoại lệ cho spec API), không thêm assertion ngoài test case

Thay đổi file dùng chung so với bản AI P6 (chép đủ bên dưới):

| File | Thay đổi |
|---|---|
| `tests/B_FR-07_GioHang/lib/types.ts` | Thêm `ApiValidCase` |

## Giả định

- GĐ-01: Mọi điểm "dòng mới" đo bằng chênh lệch giữa `GET /api/cart` ngay trước và ngay sau `POST` (GĐ-07 của bản AI dữ liệu); `newRows` chỉ so các trường test case nêu, bằng `toMatchObject` (dòng mới có thể có thêm trường khác như `name`, `price`).
- GĐ-02: TC-CART-50 "`POST` thành công" là HTTP 2xx (`toBeOK`). TC-CART-53 "không trả về lỗi hệ thống" là mã HTTP dưới 500 (GĐ-06 của bản AI dữ liệu).
- GĐ-03: TC-CART-51: Không dòng mới nào có `price` bằng 1 (so theo giá trị số, nhận cả chuỗi "1"); nếu có dòng mới thì mỗi dòng mới phải có `price` 30000000 (A24). Không có dòng mới (hệ thống từ chối) thì phần "nếu thêm thành công" không áp dụng; test case không yêu cầu `POST` phải thành công.
- GĐ-04: TC-CART-54 (CH-data-04 b): Đọc giỏ bằng token `admin@eshop.com` ngay trước và ngay sau `POST` của `test@eshop.com`; giỏ admin không có dòng mới. Không kiểm `POST` có thành công không (test case không yêu cầu); mã HTTP ghi vào annotation.
- GĐ-05: TC-CART-53 "không có dòng lạ, các dòng cũ giữ nguyên": Đúng 1 dòng mới `id` 1, số lượng 1, và mọi dòng có trước vẫn còn nguyên nội dung (chênh lệch ngược `newRows(after, before)` rỗng).
- GĐ-06: Thứ tự test theo thứ tự dòng trong `api_valid.json` (TC-CART-53 cuối, GĐ-08 của bản AI dữ liệu); cấu hình chạy tuần tự (`workers: 1`) nên thứ tự được giữ trong file. Việc reset dữ liệu sau TC-CART-53 (HW02) chưa chốt (⏳ D10).
- GĐ-07: Như P6: Annotation "Response" ghi phương thức, body gửi, mã HTTP và 200 ký tự đầu của phản hồi; annotation "New cart lines" ghi các dòng mới.

## Câu hỏi cho sinh viên

Không có câu hỏi mới.

## Kiểu assertion

- Trong spec P7: `toBeOK` (Phản hồi mạng); `toBeLessThan`, `toHaveLength`, `toMatchObject` (Giá trị tính toán / so sánh). 2 kiểu, theo CH-script-06 a.

## Code

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

export interface ApiValidCase {
  id: string;
  title: string;
  request: ApiRequestSpec;
  thenGet?: { auth: 'admin'; compare: 'beforeAndAfter' };
  expected: {
    success?: boolean;
    noServerError?: boolean;
    newRowCount?: number;
    newRows?: Record<string, unknown>[];
    noNewRowWithPrice?: number;
    ifAdded?: Record<string, unknown>;
    oldRowsUnchanged?: boolean;
    adminCartNewRowCount?: number;
  };
  oracle: string;
  note?: string;
}
```

File: `tests/B_FR-07_GioHang/07_api_valid.spec.ts`

```ts
// P7 (01_selected_tc.md mục 2.1, 3): API giỏ hàng hợp lệ và bảo mật (test API, không tính vào 15).
// Test case: TC-CART-50, 51, 54, 53 (TC-CART-53 cuối, theo thứ tự trong dữ liệu).
// Dữ liệu: data/api_valid.json, data/cart_api_base.json. Chỉ chạy trên project chrome (D17).
import { test, expect } from '../support/fixtures';
import { ADMIN_ACCOUNT, USER_ACCOUNT } from '../support/accounts';
import apiBase from './data/cart_api_base.json';
import cases from './data/api_valid.json';
import { buildBody, getCartRows, loginToken, newRows, postCart } from './lib/cartApi';
import type { ApiValidCase, CartApiBase } from './lib/types';

const softExpect = expect.configure({ soft: true });
const base = (apiBase as CartApiBase).baseBody;

test.describe('FR-07 Cart P7: cart API with valid requests and security checks', () => {
  test.beforeEach(async ({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chrome', 'D17: API tests run on Chrome only');
  });

  for (const c of cases as unknown as ApiValidCase[]) {
    test(`${c.id}: ${c.title}`, async ({ request }, testInfo) => {
      const exp = c.expected;
      const userToken = await loginToken(request, USER_ACCOUNT);
      const adminToken = c.thenGet?.auth === 'admin' ? await loginToken(request, ADMIN_ACCOUNT) : undefined;

      // Giỏ ngay trước bước chính (GĐ-01, GĐ-04).
      const adminBefore = adminToken ? await getCartRows(request, adminToken) : [];
      const before = await getCartRows(request, userToken);

      const body = buildBody(base, c.request.bodyOverride, c.request.bodyOmit);
      const res = await postCart(request, userToken, body);
      testInfo.annotations.push({
        type: 'Response',
        description: `POST /api/cart ${JSON.stringify(body)} -> HTTP ${res.status} ${res.text.slice(0, 200)}`,
      });

      const after = await getCartRows(request, userToken);
      const added = newRows(before, after);
      testInfo.annotations.push({ type: 'New cart lines', description: JSON.stringify(added).slice(0, 300) });

      if (exp.success) await softExpect(res.response, 'POST /api/cart succeeds (2xx)').toBeOK();
      if (exp.noServerError) softExpect(res.status, `No server error (HTTP ${res.status})`).toBeLessThan(500);
      if (exp.newRowCount !== undefined) {
        softExpect(added, `Exactly ${exp.newRowCount} new cart line(s)`).toHaveLength(exp.newRowCount);
      }
      if (exp.newRows) softExpect(added, 'New cart line(s) have the expected values').toMatchObject(exp.newRows);

      // TC-CART-51: Giỏ dùng giá trong CSDL (A24, GĐ-03).
      if (exp.noNewRowWithPrice !== undefined) {
        const withClientPrice = added.filter((r) => Number(r.price) === exp.noNewRowWithPrice);
        softExpect(withClientPrice, `No new line stores the client price ${exp.noNewRowWithPrice}`).toHaveLength(0);
      }
      if (exp.ifAdded) {
        for (const r of added) softExpect(r, 'A new line uses the catalogue values').toMatchObject(exp.ifAdded);
      }

      // TC-CART-53: Không có dòng lạ, các dòng cũ giữ nguyên (GĐ-05).
      if (exp.oldRowsUnchanged) {
        softExpect(newRows(after, before), 'Lines that were in the cart before are unchanged').toHaveLength(0);
      }

      // TC-CART-54: Người dùng khác không thấy dòng vừa thêm (CH-data-04 b, GĐ-04).
      if (adminToken) {
        const adminAdded = newRows(adminBefore, await getCartRows(request, adminToken));
        softExpect(adminAdded, "The admin's cart gets no new line from the test user's POST").toHaveLength(
          exp.adminCartNewRowCount ?? 0,
        );
      }
    });
  }
});
```
