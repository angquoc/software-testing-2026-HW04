import type { Locator, Page } from '@playwright/test';

// Trang Giỏ hàng. Ô và tổng tiền tìm theo vị trí, không theo nhãn: Nhãn cột và nhãn tổng kiểm riêng ở TC-CART-90.
export class CartPage {
  // Thứ tự cột theo FR-07: Sản phẩm, Đơn giá, Số lượng, Thành tiền, Thao tác.
  static readonly COLUMN = { product: 0, unitPrice: 1, quantity: 2, lineTotal: 3, actions: 4 } as const;

  readonly main: Locator;
  readonly table: Locator;
  readonly rows: Locator;
  readonly totalValue: Locator;
  readonly illustrations: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main');
    this.table = this.main.getByRole('table');
    // Dòng dữ liệu (có ô cell), bỏ dòng tiêu đề.
    this.rows = this.table.getByRole('row').filter({ has: page.getByRole('cell') });
    // Dòng tổng: Phần tử con đầu tiên của khối ngay sau bảng.
    this.totalValue = this.main.locator('table + div > :first-child');
    // Hình minh họa của giỏ trống: Ảnh hoặc biểu tượng đang hiển thị trong vùng nội dung (D-03).
    this.illustrations = this.main.locator('img, svg').filter({ visible: true });
  }

  row(productName: string): Locator {
    return this.rows.filter({ has: this.page.getByRole('cell', { name: productName, exact: true }) });
  }

  cell(row: Locator, column: keyof typeof CartPage.COLUMN): Locator {
    return row.getByRole('cell').nth(CartPage.COLUMN[column]);
  }

  deleteButton(row: Locator): Locator {
    return this.cell(row, 'actions').getByRole('button', { name: 'Xóa', exact: true });
  }
}
