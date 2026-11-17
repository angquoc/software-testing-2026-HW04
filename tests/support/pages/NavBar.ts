import type { Locator, Page } from '@playwright/test';

export interface LinkStyle {
  ariaCurrent: string | null;
  color: string;
  backgroundColor: string;
  fontWeight: string;
  textDecorationLine: string;
}

// Thanh điều hướng của Web (dùng chung cho mọi trang).
export class NavBar {
  readonly cartLink: Locator;
  readonly homeLink: Locator;

  constructor(private readonly page: Page) {
    // Tên có thể kèm số badge ("Giỏ hàng 2"), nên khớp phần đầu.
    this.cartLink = page.getByRole('navigation').getByRole('link', { name: /^Giỏ hàng/ });
    this.homeLink = page.getByRole('banner').getByRole('link', { name: 'EShop', exact: true });
  }

  // Mở Giỏ hàng bằng link (chuyển trang phía client, giỏ trong bộ nhớ không mất).
  async openCart(): Promise<void> {
    await this.cartLink.click();
    await this.page.waitForURL('**/cart');
    await this.page.getByRole('main').getByRole('heading').first().waitFor();
  }

  // Về trang chủ bằng link "EShop" (chuyển trang phía client, giỏ không mất).
  async openHome(): Promise<void> {
    await this.homeLink.click();
    await this.page.getByRole('main').getByRole('heading', { level: 2 }).first().waitFor();
  }

  // Số trên link "Giỏ hàng" hoặc trong phần tử ngay cạnh link (không chứa link, nút); null nếu không có số (D-02).
  async badgeCount(): Promise<number | null> {
    return this.cartLink.evaluate((link) => {
      const own = (link.textContent ?? '').replace('Giỏ hàng', '');
      const next = link.nextElementSibling;
      const nextText =
        next && !next.matches('a, button') && !next.querySelector('a, button') ? (next.textContent ?? '') : '';
      const m = `${own} ${nextText}`.match(/\d+/);
      return m ? Number(m[0]) : null;
    });
  }

  // aria-current và style tính toán của link "Giỏ hàng" (D-06). Đưa con trỏ vào vùng nội dung trước,
  // để hiệu ứng hover của link (sau khi vừa bấm vào nó) không bị đọc nhầm thành highlight.
  async cartLinkStyle(): Promise<LinkStyle> {
    await this.page.getByRole('main').hover({ position: { x: 1, y: 1 } });
    return this.cartLink.evaluate((link) => {
      const s = getComputedStyle(link);
      return {
        ariaCurrent: link.getAttribute('aria-current'),
        color: s.color,
        backgroundColor: s.backgroundColor,
        fontWeight: s.fontWeight,
        textDecorationLine: s.textDecorationLine,
      };
    });
  }
}
