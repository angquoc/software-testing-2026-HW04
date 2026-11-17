import type { Locator } from '@playwright/test';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Mẫu so nhãn: Đúng chữ hoa thường theo đặc tả (FR-01 02_review.md, CH-script-04 a: Không che lệch đặc tả),
// chỉ bỏ qua khoảng trắng hai đầu và một dấu * phía sau (FR-22 có thể thêm * vào nhãn).
export function labelPattern(label: string): RegExp {
  return new RegExp(`^\\s*${escapeRegExp(label)}\\s*\\*?\\s*$`, 'u');
}

// Ô nhập đi cùng nhãn khi <label> không gắn với ô bằng for/id: Tìm nhãn trong phạm vi `scope`, đi lên phần tử cha
// trực tiếp của nhãn (khối của trường đó), lấy ô nhập trong khối. Không lọc mọi div có chứa nhãn, vì div bọc chung
// nhiều trường cũng chứa nhãn và làm locator khớp nhiều ô (strict mode).
export function fieldByLabel(scope: Locator, label: string): Locator {
  return scope.locator('label').filter({ hasText: labelPattern(label) }).locator('xpath=..').locator('input');
}
