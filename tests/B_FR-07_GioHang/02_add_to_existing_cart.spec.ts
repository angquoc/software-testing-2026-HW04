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
import {
  clickAddWithRetry,
  feedbackSeen,
  FEEDBACK_WINDOW_MS,
  FIRST_CLICK_WINDOW_MS,
  startFeedbackRecorder,
} from './lib/feedback';
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
          `First click on "Thêm vào giỏ hàng" gave no response within ${FIRST_CLICK_WINDOW_MS / 1000} s; clicked again (HW02 observation 2)`,
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
