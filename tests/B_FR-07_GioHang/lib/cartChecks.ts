import { expect } from '../../support/fixtures';
import type { CartPage } from '../../support/pages/CartPage';
import type { HomePage } from '../../support/pages/HomePage';
import type { NavBar } from '../../support/pages/NavBar';
import { moneyPattern } from './money';
import { productByKey } from './products';
import type { CartStateExpected, EmptyStateExpected } from './types';

const softExpect = expect.configure({ soft: true });

// Kiểm trạng thái trang Giỏ hàng. Mọi điểm là soft: Có nhiều dòng cùng tên (#70) thì ghi lỗi số dòng
// và vẫn đọc ô của dòng đầu tiên; không có dòng nào thì bỏ qua các ô của dòng đó. Tổng tiền luôn được kiểm.
export async function checkCartState(cart: CartPage, exp: CartStateExpected, label: string): Promise<void> {
  if (exp.rowCount !== undefined) {
    await softExpect(cart.rows, `${label}: number of cart lines`).toHaveCount(exp.rowCount);
  }
  for (const r of exp.rows ?? []) {
    const name = productByKey(r.product).name;
    const rows = cart.row(name);
    await softExpect(rows, `${label}: exactly one line "${name}"`).toHaveCount(1);
    if ((await rows.count()) === 0) continue;
    const row = rows.first();
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

// OUT9 theo D-03: Hình minh họa (img hoặc svg đang hiển thị trong main), thông báo có từ đã chốt, không còn bảng.
export async function checkEmptyState(cart: CartPage, exp: EmptyStateExpected, label: string): Promise<void> {
  if (exp.illustration) {
    await softExpect(cart.illustrations.first(), `${label}: illustration (img or svg) in the main content (OUT9, D-03)`).toBeVisible();
  }
  await softExpect(cart.main, `${label}: message says the cart is empty (OUT9, D-03)`).toContainText(exp.messageContains, {
    ignoreCase: true,
  });
  if (!exp.table) {
    await softExpect(cart.table, `${label}: no cart table (OUT9)`).toHaveCount(0);
  }
}

// D-04: Tạo giỏ bằng nút "Thêm vào giỏ" ở trang chủ, mỗi sản phẩm bấm một lần; mở Giỏ hàng kiểm lại rồi về trang chủ
// bằng link "EShop". Bắt đầu và kết thúc ở trang chủ. Không đạt thì ném lỗi "Chuẩn bị không đạt": Test dừng,
// không tính là kết quả của test case.
export async function prepareCart(home: HomePage, nav: NavBar, cart: CartPage, keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  for (const key of keys) await home.addToCart(productByKey(key).name);
  await nav.openCart();
  try {
    await expect(cart.rows).toHaveCount(keys.length);
    for (const key of keys) {
      const row = cart.row(productByKey(key).name);
      await expect(row).toHaveCount(1);
      await expect(cart.cell(row, 'quantity')).toHaveText('1');
    }
  } catch (err) {
    const first = String(err).split('\n')[0];
    throw new Error(`Chuẩn bị không đạt (setup not met): Cart after adding ${keys.join(', ')} from the home page (D-04): ${first}`);
  }
  await nav.openHome();
}
