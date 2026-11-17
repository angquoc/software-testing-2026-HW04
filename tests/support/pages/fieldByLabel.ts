import type { Locator } from '@playwright/test';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Mẫu so nhãn: Không phân biệt hoa thường, bỏ qua khoảng trắng hai đầu và một dấu * phía sau
// (FR-01 02_review.md mục 1: Tránh fail vì lệch chữ hoa; FR-22 có thể thêm * vào nhãn).
export function labelPattern(label: string): RegExp {
  return new RegExp(`^\\s*${escapeRegExp(label)}\\s*\\*?\\s*$`, 'iu');
}

// Ô nhập đi cùng nhãn khi <label> không gắn với ô bằng for/id: Tìm khối div chứa nhãn đó trong phạm vi `scope`, lấy ô nhập trong khối.
export function fieldByLabel(scope: Locator, label: string): Locator {
  return scope
    .locator('div')
    .filter({ has: scope.page().locator('label').filter({ hasText: labelPattern(label) }) })
    .locator('input');
}
