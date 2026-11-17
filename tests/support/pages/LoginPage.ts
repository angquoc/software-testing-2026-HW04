import type { Locator, Page } from '@playwright/test';
import { fieldByLabel } from './fieldByLabel';

// Trang Đăng nhập của Web, dùng để kiểm OUT1 của FR-01 (chuyển tới trang Đăng nhập, có form đăng nhập).
// Selector lấy từ snapshot features/A_FR-01_DangKy/ai_raw/snapshot_login.txt và frontend-web/src/pages/Login.jsx.
export class LoginPage {
  static readonly path = '/login';
  readonly form: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.form = page.getByRole('main').locator('form');
    // Đặc tả không nêu tên nút gửi, nên tìm theo loại submit.
    this.submitButton = this.form.locator('button[type="submit"], input[type="submit"]');
  }

  field(label: string): Locator {
    return fieldByLabel(this.form, label);
  }
}
