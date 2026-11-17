import type { Locator, Page } from '@playwright/test';
import { fieldByLabel } from './fieldByLabel';

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type TextsWindow = Window & { __fr01TextsBefore?: string[] };

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

  // Ghi lại chữ đang có trong vùng main ngay trước khi bấm, để sau đó tìm thông báo của trang là chữ mới
  // (quyết định P3: Chữ mới xuất hiện sau khi bấm). So theo chữ, không theo phần tử: React có thể vẽ lại phần tử cũ.
  async recordTexts(): Promise<void> {
    await this.main.evaluate((root) => {
      const ownText = (el: Element) =>
        Array.from(el.childNodes)
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent ?? '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      const seen: string[] = [];
      root.querySelectorAll('*').forEach((el) => {
        const t = ownText(el);
        if (t) seen.push(t);
      });
      (window as TextsWindow).__fr01TextsBefore = seen;
    });
  }

  // Chữ đang hiển thị trong main mà chưa có lúc recordTexts (mỗi phần tử lấy chữ của chính nó, không gồm phần tử con).
  async newTexts(): Promise<string[]> {
    return this.main.evaluate((root) => {
      const before = (window as TextsWindow).__fr01TextsBefore;
      if (!before) throw new Error('Chưa gọi recordTexts() trước khi bấm');
      const seen = new Set(before);
      const ownText = (el: Element) =>
        Array.from(el.childNodes)
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent ?? '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      const found: string[] = [];
      root.querySelectorAll('*').forEach((el) => {
        if (typeof el.checkVisibility === 'function' && !el.checkVisibility()) return;
        const t = ownText(el);
        if (t && !seen.has(t) && !found.includes(t)) found.push(t);
      });
      return found;
    });
  }

  // Phần tử có đúng chữ đó trong main, để dùng assertion web-first cho thông báo đã tìm được bằng newTexts.
  messageByText(text: string): Locator {
    return this.main.getByText(text, { exact: true });
  }
}
