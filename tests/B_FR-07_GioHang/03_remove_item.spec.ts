// P3 (01_selected_tc.md mục 3): Xóa sản phẩm khỏi giỏ và dialog xác nhận.
// Test case: TC-CART-07, TC-CART-08, TC-CART-09.
// Dữ liệu: data/remove_item.json, data/products.json.
import { test, expect } from '../support/fixtures';
import { CartPage } from '../support/pages/CartPage';
import { HomePage } from '../support/pages/HomePage';
import { NavBar } from '../support/pages/NavBar';
import cases from './data/remove_item.json';
import { checkCartState, checkEmptyState, prepareCart } from './lib/cartChecks';
import { productByKey } from './lib/products';
import { removeWithDialog } from './lib/removeDialog';
import type { RemoveItemCase } from './lib/types';
import { USER_STATE } from './setup/globalSetup';

const softExpect = expect.configure({ soft: true });

test.use({ storageState: USER_STATE });

test.describe('FR-07 Cart P3: remove a line with a confirmation dialog', () => {
  for (const c of cases as unknown as RemoveItemCase[]) {
    test(`${c.id}: ${c.title}`, async ({ page }, testInfo) => {
      const exp = c.expected;
      const home = new HomePage(page);
      const cart = new CartPage(page);
      const nav = new NavBar(page);

      await home.goto();
      await prepareCart(home, nav, cart, c.setup.cart);
      await nav.openCart();

      const removeName = productByKey(c.input.remove).name;
      const result = await removeWithDialog(page, cart, removeName, c.input.dialogChoice);
      if (result.message !== undefined) {
        testInfo.annotations.push({ type: 'Dialog message', description: `${result.kind}: ${result.message}` });
      }
      softExpect(result.kind, 'R11 / FR-24: confirmation dialog appears before removing').not.toBe('none');

      if (exp.rowPresentWhileDialogOpen !== undefined) {
        if (result.kind === 'modal') {
          softExpect(result.rowCountWhileOpen ?? 0, `Line "${removeName}" still present while the dialog is open`).toBeGreaterThan(0);
        } else if (result.kind === 'native') {
          testInfo.annotations.push({
            type: 'Not measurable',
            description: 'Line presence while a browser confirm dialog is open (page is blocked); removal can only happen after it closes',
          });
        }
      }

      const after = c.input.dialogChoice === 'dismiss' ? 'After cancelling the dialog' : 'After confirming the dialog';
      await checkCartState(cart, exp, after);
      if (exp.afterRemove) await checkCartState(cart, exp.afterRemove, after);
      if (exp.emptyState) await checkEmptyState(cart, exp.emptyState, `${after} (no reload, A11)`);

      if (c.input.thenAddFromHome !== undefined) {
        await nav.openHome();
        await home.addToCart(productByKey(c.input.thenAddFromHome).name);
        await nav.openCart();
        if (exp.afterReAdd) await checkCartState(cart, exp.afterReAdd, 'After adding the product again from the home page');
      }
    });
  }
});
