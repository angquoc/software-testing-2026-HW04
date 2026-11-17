// FR-01 Đăng ký, phần P4: Checklist cấu trúc form Đăng ký, không gửi form.
// Test case: TC-REG-90 (ô Xác nhận mật khẩu), TC-REG-92 (màu nút), TC-REG-93 (thẻ h1), TC-REG-95 (dấu *), TC-REG-96 (loại ô).
// Dữ liệu: data/form_checklist.json. Kế hoạch: features/A_FR-01_DangKy/01_selected_tc.md mục 3.
import type { Page } from '@playwright/test';
import { test, expect } from '../support/fixtures';
import { RegisterPage } from '../support/pages/RegisterPage';
import { labelByText } from '../support/pages/fieldByLabel';
import { cssRgbToHsl } from './lib/color';
import cases from './data/form_checklist.json';

interface ChecklistCase {
  id: string;
  title: string;
  check: string;
  target?: unknown;
  expected: unknown;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// TC-REG-90: Có đúng 1 ô đi cùng nhãn Xác nhận mật khẩu, và ô đó hiển thị.
async function checkConfirmPasswordField(register: RegisterPage, c: ChecklistCase): Promise<void> {
  const target = c.target as { label: string };
  const expected = c.expected as { present: boolean };
  const field = register.field(target.label);
  await expect.soft(field, `số ô đi cùng nhãn "${target.label}"`).toHaveCount(expected.present ? 1 : 0);
  if (expected.present && (await field.count()) === 1) {
    await expect.soft(field, `ô "${target.label}" hiển thị`).toBeVisible();
  }
}

// TC-REG-92: Màu nền tính được của nút đổi sang HSL; hue trong khoảng và độ bão hòa đủ lớn.
async function checkSubmitButtonColor(register: RegisterPage, c: ChecklistCase): Promise<void> {
  const target = c.target as { buttonName: string };
  const expected = c.expected as { hueMin: number; hueMax: number; saturationMinPercent: number };
  const button = register.form.getByRole('button', { name: target.buttonName, exact: true });
  await expect(button, `nút "${target.buttonName}" hiển thị`).toBeVisible();
  const css = await button.evaluate((e) => getComputedStyle(e).backgroundColor);
  const hsl = cssRgbToHsl(css);
  expect(hsl, `màu nền đọc được ở dạng rgb()/rgba(): ${css}`).not.toBeNull();
  if (!hsl) return;
  expect.soft(hsl.alpha, `nút có màu nền (alpha > 0): ${css}`).toBeGreaterThan(0);
  if (hsl.alpha === 0) return;
  const shown = `${css} = hue ${hsl.hue.toFixed(1)}°, S ${hsl.saturationPercent.toFixed(1)}%, L ${hsl.lightnessPercent.toFixed(1)}%`;
  expect.soft(hsl.hue, `hue ≥ ${expected.hueMin}° (${shown})`).toBeGreaterThanOrEqual(expected.hueMin);
  expect.soft(hsl.hue, `hue ≤ ${expected.hueMax}° (${shown})`).toBeLessThanOrEqual(expected.hueMax);
  expect
    .soft(hsl.saturationPercent, `độ bão hòa ≥ ${expected.saturationMinPercent}% (${shown})`)
    .toBeGreaterThanOrEqual(expected.saturationMinPercent);
}

// TC-REG-93: Cả trang có đúng `count` thẻ h1; khi có đúng 1 thẻ thì chữ chứa `textContains`.
async function checkH1(page: Page, c: ChecklistCase): Promise<void> {
  const expected = c.expected as { count: number; textContains: string; caseInsensitive: boolean };
  const h1 = page.locator('h1');
  await expect.soft(h1, 'số thẻ h1 trên trang').toHaveCount(expected.count);
  if ((await h1.count()) !== 1) return;
  const pattern = new RegExp(escapeRegExp(expected.textContains), expected.caseInsensitive ? 'iu' : 'u');
  await expect.soft(h1, `thẻ h1 chứa "${expected.textContains}"`).toContainText(pattern);
}

// TC-REG-95: Mỗi nhãn có dấu `*` trong nhãn hoặc ở phần tử đứng ngay cạnh nhãn (CH-data-01 b).
async function checkRequiredMarker(register: RegisterPage, c: ChecklistCase): Promise<void> {
  const target = c.target as { labels: string[] };
  const expected = c.expected as { marker: string; markerPlacement: string };
  if (expected.markerPlacement !== 'labelOrAdjacent') throw new Error(`markerPlacement không hỗ trợ: ${expected.markerPlacement}`);
  for (const label of target.labels) {
    const labelEl = labelByText(register.form, label);
    await expect.soft(labelEl, `nhãn "${label}" có trên form`).toHaveCount(1);
    if ((await labelEl.count()) !== 1) continue;
    const found = await labelEl.evaluate((el, marker) => {
      const texts = [el.textContent, el.previousElementSibling?.textContent, el.nextElementSibling?.textContent];
      return texts.some((t) => (t ?? '').includes(marker));
    }, expected.marker);
    expect.soft(found, `nhãn "${label}" có "${expected.marker}" trong nhãn hoặc ngay cạnh nhãn`).toBe(true);
  }
}

// TC-REG-96: Thuộc tính type của từng ô theo dữ liệu.
async function checkInputTypes(register: RegisterPage, c: ChecklistCase): Promise<void> {
  const target = c.target as { fields: { label: string; key: string }[] };
  const expected = c.expected as { types: Record<string, string> };
  for (const f of target.fields) {
    await expect.soft(register.field(f.label), `ô "${f.label}" có type="${expected.types[f.key]}"`).toHaveAttribute(
      'type',
      expected.types[f.key],
    );
  }
}

test.describe('FR-01 Register: form checklist (P4)', () => {
  for (const c of cases as unknown as ChecklistCase[]) {
    test(`${c.id}: ${c.title}`, async ({ page }) => {
      const register = new RegisterPage(page);
      await register.goto();
      switch (c.check) {
        case 'confirmPasswordField':
          await checkConfirmPasswordField(register, c);
          break;
        case 'submitButtonColor':
          await checkSubmitButtonColor(register, c);
          break;
        case 'h1':
          await checkH1(page, c);
          break;
        case 'requiredMarker':
          await checkRequiredMarker(register, c);
          break;
        case 'inputTypes':
          await checkInputTypes(register, c);
          break;
        default:
          throw new Error(`Loại kiểm tra không hỗ trợ: ${c.check}`);
      }
    });
  }
});
