import type { Dialog, Page } from '@playwright/test';
import type { CartPage } from '../../support/pages/CartPage';
import { becomesTrueWithin, FEEDBACK_WINDOW_MS } from './feedback';

export interface RemoveResult {
  // native: Hộp thoại của trình duyệt (confirm); modal: Hộp thoại trên trang (role dialog / alertdialog); none: Không có.
  kind: 'native' | 'modal' | 'none';
  message?: string;
  // Số dòng của sản phẩm khi hộp thoại trên trang đang mở (không đo được với hộp thoại của trình duyệt).
  rowCountWhileOpen?: number;
}

// Nhãn nút trong hộp thoại trên trang: Đặc tả không nêu (GĐ-03 của ai_raw/script_03_remove_item.md).
const CONFIRM_NAME = /xác nhận|đồng ý|xóa|có|ok/i;
const CANCEL_NAME = /hủy|không|đóng|cancel/i;

// Bấm "Xóa" ở dòng đầu tiên của sản phẩm; nếu có dialog xác nhận thì chọn hủy hoặc xác nhận. Không tự khẳng định kết quả.
export async function removeWithDialog(
  page: Page,
  cart: CartPage,
  productName: string,
  choice: 'accept' | 'dismiss',
): Promise<RemoveResult> {
  let nativeMessage: string | undefined;
  const onDialog = async (d: Dialog): Promise<void> => {
    nativeMessage = d.message();
    if (choice === 'accept') await d.accept();
    else await d.dismiss();
  };
  page.on('dialog', onDialog);
  try {
    const modal = page.getByRole('dialog').or(page.getByRole('alertdialog')).filter({ visible: true });
    await cart.deleteButton(cart.row(productName).first()).click();
    const shown = await becomesTrueWithin(
      async () => nativeMessage !== undefined || (await modal.count()) > 0,
      FEEDBACK_WINDOW_MS,
    );
    if (!shown) return { kind: 'none' };
    if (nativeMessage !== undefined) return { kind: 'native', message: nativeMessage };
    const rowCountWhileOpen = await cart.row(productName).count();
    const message = (await modal.first().innerText()).trim();
    await modal
      .first()
      .getByRole('button', { name: choice === 'accept' ? CONFIRM_NAME : CANCEL_NAME })
      .first()
      .click();
    return { kind: 'modal', message, rowCountWhileOpen };
  } finally {
    page.off('dialog', onDialog);
  }
}
