import type { Locator, Page } from '@playwright/test';

// Trang Giỏ hàng. Ô và tổng tiền tìm theo vị trí, không theo nhãn: Nhãn cột và nhãn tổng kiểm riêng ở TC-CART-90.
export class CartPage {
  // Thứ tự cột theo FR-07: Sản phẩm, Đơn giá, Số lượng, Thành tiền, Thao tác.
  static readonly COLUMN = { product: 0, unitPrice: 1, quantity: 2, lineTotal: 3, actions: 4 } as const;

  readonly main: Locator;
  readonly table: Locator;
  readonly columnHeaders: Locator;
  readonly rows: Locator;
  readonly totalValue: Locator;
  readonly illustrations: Locator;
  readonly breadcrumbLandmark: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main');
    this.table = this.main.getByRole('table');
    this.columnHeaders = this.table.getByRole('columnheader');
    // Dòng dữ liệu (có ô cell), bỏ dòng tiêu đề.
    this.rows = this.table.getByRole('row').filter({ has: page.getByRole('cell') });
    // Dòng tổng: Phần tử con đầu tiên của khối ngay sau bảng.
    this.totalValue = this.main.locator('table + div > :first-child');
    // Hình minh họa của giỏ trống: Ảnh hoặc biểu tượng đang hiển thị trong vùng nội dung (D-03).
    this.illustrations = this.main.locator('img, svg').filter({ visible: true });
    // Breadcrumb dạng vùng điều hướng có tên chứa "breadcrumb" (D-06).
    this.breadcrumbLandmark = page.getByRole('navigation', { name: /breadcrumb/i });
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

  // Nút xóa của một dòng, nhận mọi tên chứa "xóa" ("Xóa", "Xóa sản phẩm"); dùng cho checklist TC-CART-90.
  removeControls(row: Locator): Locator {
    return row.getByRole('button', { name: /xóa/i });
  }

  // Link hoặc nút trong vùng nội dung có đúng tên (đặc tả gọi là "nút" nhưng không nói là phần tử nào).
  action(name: string): Locator {
    return this.main
      .getByRole('link', { name, exact: true })
      .or(this.main.getByRole('button', { name, exact: true }));
  }

  // Breadcrumb dạng dãy liên kết (D-06): Link `first`, sau nó một phần tử có chữ đúng `second`,
  // cả hai đứng trước heading đầu tiên của vùng nội dung.
  async crumbsInOrder(first: string, second: string): Promise<boolean> {
    return this.main.evaluate(
      (main, [a, b]) => {
        const all = Array.from(main.querySelectorAll('*'));
        const ia = all.findIndex((e) => e.tagName === 'A' && e.textContent?.trim() === a);
        const ib = all.findIndex((e, i) => i > ia && e.children.length === 0 && e.textContent?.trim() === b);
        const ih = all.findIndex((e) => /^H[1-6]$/.test(e.tagName));
        return ia >= 0 && ib > ia && (ih < 0 || ib < ih);
      },
      [first, second] as const,
    );
  }
}
