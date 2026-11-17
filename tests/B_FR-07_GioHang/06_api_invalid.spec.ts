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
