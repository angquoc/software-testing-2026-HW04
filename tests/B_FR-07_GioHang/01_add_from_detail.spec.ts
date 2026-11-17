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
