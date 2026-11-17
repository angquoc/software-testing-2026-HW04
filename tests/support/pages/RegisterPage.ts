import type { Locator, Page } from '@playwright/test';
import { fieldByLabel } from './fieldByLabel';

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Trang Đăng ký của Web (FR-01). Selector lấy từ snapshot features/A_FR-01_DangKy/ai_raw/snapshot_register.txt
// và frontend-web/src/pages/Register.jsx: Nhãn không gắn với ô nên tìm ô theo khối chứa nhãn (fieldByLabel).
// Page object chỉ gói selector và thao tác; assertion nằm trong spec.
export class RegisterPage {
  static readonly path = '/register';
  // Nhãn của từng ô theo đặc tả FR-01 (khóa trùng tên trường trong `input` của file dữ liệu).
  static readonly labels: Record<keyof RegisterInput, string> = {
    fullName: 'Họ Tên',
    email: 'Email',
    password: 'Mật khẩu',
    confirmPassword: 'Xác nhận mật khẩu',
  };
  readonly main: Locator;
  readonly form: Locator;
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.main = page.getByRole('main');
    this.form = this.main.locator('form');
    // exact: So đúng chữ hoa thường theo đặc tả (CH-script-04 a).
    this.submitButton = this.form.getByRole('button', { name: 'Đăng Ký', exact: true });
  }

  field(label: string): Locator {
    return fieldByLabel(this.form, label);
  }

  async goto(): Promise<void> {
    await this.page.goto(RegisterPage.path);
    await this.submitButton.waitFor();
  }

  // Điền form theo dữ liệu. Ô Xác nhận mật khẩu: Có thì nhập, không có thì bỏ qua (CH-select-06 a).
  // Trả về true nếu đã nhập ô Xác nhận mật khẩu.
  async fillForm(input: RegisterInput): Promise<boolean> {
    const labels = RegisterPage.labels;
    await this.field(labels.fullName).fill(input.fullName);
    await this.field(labels.email).fill(input.email);
    await this.field(labels.password).fill(input.password);
    const confirm = this.field(labels.confirmPassword);
    if ((await confirm.count()) === 0) return false;
    await confirm.fill(input.confirmPassword);
    return true;
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
