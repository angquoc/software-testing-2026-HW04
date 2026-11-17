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
        // Bước 1 phải thêm đúng 1 dòng vào giỏ của test@eshop.com, nếu không thì bước 2 không chứng minh được gì.
        if (added.length !== 1) {
          throw new Error(
            `Chuẩn bị không đạt (setup not met): Step 1 POST by ${USER_ACCOUNT.email} added ${added.length} line(s), expected 1 (HTTP ${res.status})`,
          );
        }
        const adminAdded = newRows(adminBefore, await getCartRows(request, adminToken));
        softExpect(adminAdded, "The admin's cart gets no new line from the test user's POST").toHaveLength(
          exp.adminCartNewRowCount ?? 0,
        );
      }
    });
  }
});
