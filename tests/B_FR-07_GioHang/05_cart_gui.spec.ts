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
