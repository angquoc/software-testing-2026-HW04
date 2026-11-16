import type { Locator } from '@playwright/test';
import { expect } from '../../support/fixtures';

// Kỳ vọng cho một ô của bảng mã giảm giá, theo schema đã chốt ở 02_review.md mục 1.1.
export type CellExpectation =
  | { text: string }
  | { textIgnoreCase: string; noDescendant?: string }
  | { money: number }
  | { notEmpty: true; notText: string }
  | null;

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Ô tiền: Nhóm 3 chữ số ngăn bằng "," hoặc "." (CH-select-03 b), "₫" sau số, có hoặc không có một dấu cách (CH-data-02 a).
export function moneyRegExp(amount: number): RegExp {
  const grouped = String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, '[.,]');
  return new RegExp(`^${grouped} ?₫$`);
}

export async function expectCell(cell: Locator, exp: CellExpectation, label: string): Promise<void> {
  if (exp === null) return;
  if ('text' in exp) {
    await expect(cell, label).toHaveText(exp.text);
  } else if ('textIgnoreCase' in exp) {
    await expect(cell, label).toHaveText(new RegExp(`^${escapeRegExp(exp.textIgnoreCase)}$`, 'i'));
    if (exp.noDescendant) await expect(cell.locator(exp.noDescendant), `${label}: không có phần tử <${exp.noDescendant}>`).toHaveCount(0);
  } else if ('money' in exp) {
    await expect(cell, label).toHaveText(moneyRegExp(exp.money));
  } else {
    await expect(cell, `${label}: không rỗng`).not.toHaveText(/^\s*$/);
    await expect(cell, `${label}: khác "${exp.notText}"`).not.toHaveText(exp.notText);
  }
}
