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
