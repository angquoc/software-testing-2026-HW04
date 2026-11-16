import type { Locator } from '@playwright/test';
import { expect } from '../../support/fixtures';

// Kỳ vọng cho một ô của bảng mã giảm giá, theo schema đã chốt ở 02_review.md mục 1.1.
export type CellExpectation =
  | { text: string }
  | { textIgnoreCase: string; noDescendant?: string }
  | { money: number }
  | { notEmpty: true; notText: string }
  | null;

export const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Ô tiền: Nhóm 3 chữ số ngăn bằng "," hoặc "." (CH-select-03 b), "₫" sau số, có hoặc không có một dấu cách (CH-data-02 a).
export function moneyRegExp(amount: number): RegExp {
  const grouped = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '[.,]');
  return new RegExp(`^${grouped} ?₫$`);
}

// soft: true dùng expect.soft (CH-script-02 b): Ô sai được ghi lại, test chạy tiếp để liệt kê đủ các ô sai.
export async function expectCell(
  cell: Locator,
  exp: CellExpectation,
  label: string,
  opts: { soft?: boolean } = {},
): Promise<void> {
  if (exp === null) return;
  const check = expect.configure({ soft: opts.soft ?? false });
  if ('text' in exp) {
    await check(cell, label).toHaveText(exp.text);
  } else if ('textIgnoreCase' in exp) {
    await check(cell, label).toHaveText(new RegExp(`^${escapeRegExp(exp.textIgnoreCase)}$`, 'i'));
    if (exp.noDescendant) await check(cell.locator(exp.noDescendant), `${label}: không có phần tử <${exp.noDescendant}>`).toHaveCount(0);
  } else if ('money' in exp) {
    await check(cell, label).toHaveText(moneyRegExp(exp.money));
  } else {
    await check(cell, `${label}: không rỗng`).not.toHaveText(/^\s*$/);
    await check(cell, `${label}: khác "${exp.notText}"`).not.toHaveText(exp.notText);
  }
}
