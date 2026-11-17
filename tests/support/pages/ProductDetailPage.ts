import type { Locator, Page } from '@playwright/test';

// Trang chi tiết sản phẩm.
export class ProductDetailPage {
  readonly quantity: Locator;
  readonly addButton: Locator;

  constructor(page: Page) {
    const main = page.getByRole('main');
    // Nhãn "Số lượng:" không gắn với ô (không dùng getByLabel được); trang chỉ có một ô số.
    this.quantity = main.getByRole('spinbutton');
    this.addButton = main.getByRole('button', { name: 'Thêm vào giỏ hàng', exact: true });
  }
}
