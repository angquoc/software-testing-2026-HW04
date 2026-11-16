import path from 'node:path';
import type { Locator, Page } from '@playwright/test';
import { ADMIN_URL } from '../urls';

// Trạng thái đăng nhập admin do globalSetup của FR-17 lưu (thư mục .auth/ bị .gitignore chặn).
export const ADMIN_STATE = path.resolve(__dirname, '../../../.auth/admin.json');

// Khóa của một dòng trong dữ liệu -> tên cột trên bảng (tên cột theo test case HW02).
export const COLUMN_OF = {
  code: 'Mã',
  type: 'Loại',
  discountValue: 'Giá trị',
  minOrderAmount: 'Đơn tối thiểu',
  expiredAt: 'Hết hạn',
  maxUsesPerUser: 'Giới hạn/người',
} as const;

// Giá trị gõ vào 6 ô của form "Tạo mã giảm giá mới": Chuỗi đúng như gõ, "" là để trống, ngày dạng yyyy-mm-dd.
export type CouponInput = {
  code: string;
  typeOption: string;
  discountValue: string;
  minOrderAmount: string;
  expiredAt: string;
  maxUsesPerUser: string;
};

// Page object của trang "Quản lý Mã Giảm Giá" (Web Admin). Chỉ gói selector và thao tác; assertion nằm trong spec.
export class AdminCouponsPage {
  readonly heading: Locator;
  readonly table: Locator;
  readonly columnHeaders: Locator;
  readonly bodyRows: Locator;
  readonly codeInput: Locator;
  readonly typeSelect: Locator;
  readonly discountInput: Locator;
  readonly minOrderInput: Locator;
  readonly expiredAtInput: Locator;
  readonly maxUsesInput: Locator;
  readonly createButton: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { name: 'Quản lý Mã Giảm Giá', level: 2 });
    this.table = page.getByRole('table');
    this.columnHeaders = this.table.getByRole('columnheader');
    // Dòng dữ liệu là dòng có ô thường (cell); dòng tiêu đề chỉ có columnheader.
    this.bodyRows = this.table.getByRole('row').filter({ has: page.getByRole('cell') });
    // Form "Tạo mã giảm giá mới" (snapshot_coupons.txt, snapshot_coupons_fixed.txt).
    this.codeInput = page.getByPlaceholder('Mã coupon (VD: SAVE10)', { exact: true });
    this.typeSelect = page.getByRole('combobox');
    // Placeholder của ô giá trị đổi theo loại đang chọn.
    this.discountInput = page.getByPlaceholder(/^(Giá trị % \(VD: 10\)|Số tiền \(VD: 50000\))$/);
    this.minOrderInput = page.getByPlaceholder('Đơn tối thiểu (₫)', { exact: true });
    this.expiredAtInput = page.getByPlaceholder('Ngày hết hạn', { exact: true });
    this.maxUsesInput = page.getByPlaceholder('Số lần dùng tối đa/người', { exact: true });
    this.createButton = page.getByRole('button', { name: 'Tạo mã', exact: true });
  }

  // Mở Web Admin (đã đăng nhập nhờ storageState) rồi vào menu "Mã Giảm Giá".
  async open(): Promise<void> {
    await this.page.goto(ADMIN_URL);
    await this.openFromMenu();
  }

  async openFromMenu(): Promise<void> {
    await this.page.getByRole('listitem').filter({ hasText: /^Mã Giảm Giá$/ }).click();
    await this.heading.waitFor();
  }

  // Tải lại trang: Web Admin quay về Dashboard sau khi tải lại, nên bấm lại menu (HW02 06_results.md mục 6).
  async reloadAndReopen(): Promise<void> {
    await this.page.reload();
    await this.openFromMenu();
  }

  // Điền 6 ô; chọn Loại trước ô Giá trị vì placeholder của ô Giá trị đổi theo loại. fill() xóa giá trị có sẵn rồi gõ.
  async fillForm(input: CouponInput): Promise<void> {
    await this.codeInput.fill(input.code);
    await this.typeSelect.selectOption({ label: input.typeOption });
    await this.discountInput.fill(input.discountValue);
    await this.minOrderInput.fill(input.minOrderAmount);
    await this.expiredAtInput.fill(input.expiredAt);
    await this.maxUsesInput.fill(input.maxUsesPerUser);
  }

  // Dòng có ô đúng bằng mã (chuỗi: So đúng; biểu thức chính quy: Theo biểu thức, ví dụ không phân biệt hoa thường).
  rowByCode(code: string | RegExp): Locator {
    return this.bodyRows.filter({ has: this.page.getByRole('cell', { name: code, exact: true }) });
  }

  async columnIndex(column: string): Promise<number> {
    await this.columnHeaders.first().waitFor();
    const names = (await this.columnHeaders.allInnerTexts()).map((s) => s.trim());
    const index = names.indexOf(column);
    if (index < 0) throw new Error(`Bảng không có cột "${column}". Các cột: ${names.join(', ')}`);
    return index;
  }

  async cell(row: Locator, column: string): Promise<Locator> {
    return row.getByRole('cell').nth(await this.columnIndex(column));
  }
}
