import type { Locator, Page } from '@playwright/test';

// Trang chủ (danh sách sản phẩm).
export class HomePage {
  readonly main: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main');
  }

  // Chỉ dùng ở đầu test: Tải lại ứng dụng làm mất giỏ trong bộ nhớ.
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.main.getByRole('heading', { level: 2 }).first().waitFor();
  }

  // Thẻ sản phẩm: div trong cùng chứa cả tên sản phẩm (heading cấp 2) và nút "Thêm vào giỏ".
  // Lưới sản phẩm cũng chứa cả hai nên khớp trước; thẻ là phần tử khớp cuối theo thứ tự DOM.
  card(name: string): Locator {
    return this.main
      .locator('div')
      .filter({ has: this.page.getByRole('heading', { level: 2, name, exact: true }) })
      .filter({ has: this.page.getByRole('button', { name: 'Thêm vào giỏ', exact: true }) })
      .last();
  }

  addButton(name: string): Locator {
    return this.card(name).getByRole('button', { name: 'Thêm vào giỏ', exact: true });
  }

  async addToCart(name: string): Promise<void> {
    await this.addButton(name).click();
  }

  async openDetail(name: string): Promise<void> {
    await this.card(name).getByRole('link', { name: 'Xem chi tiết' }).click();
    await this.page.getByRole('main').getByRole('heading', { level: 1, name, exact: true }).waitFor();
  }
}
