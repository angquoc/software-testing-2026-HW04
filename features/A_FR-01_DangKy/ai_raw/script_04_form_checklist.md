# A: FR-01 Đăng ký tài khoản script: Checklist cấu trúc form Đăng ký (bản AI)

- Bước: `[A-FR01][script]`, phần P4 (TC-REG-90, TC-REG-92, TC-REG-93, TC-REG-95, TC-REG-96)
- Thời gian tạo: 2026-11-18 00:55 (+07:00)
- Công cụ: Claude Code (VS Code extension), model Claude Opus 5.5 (`claude-opus-5-5`), skill `playwright-automation`
- Căn cứ: `01_selected_tc.md` (P4; CH-select-01 a, 02 b; ghi chú TC-REG-95 chỉ kiểm 3 nhãn), `tests/A_FR-01_DangKy/data/form_checklist.json` (bản đã review: `markerPlacement: "labelOrAdjacent"`), `02_review.md` (CH-data-01 b, CH-script-01 đến 06), snapshot `ai_raw/snapshot_register.txt`, `Register.jsx` (chỉ để lấy selector), `eshop-sut/frontend-web/package.json` (Tailwind 3.4: Màu tính được ở dạng `rgb()`), page object hiện tại
- Quyết định đã chốt dùng lại: POM, assertion trong spec, mỗi spec tự đủ ≥ 3 kiểu, `expect.soft` cho điểm quan sát, so đúng chữ hoa thường của nhãn và nút (CH-script-04 a)
- File dùng chung đã đổi so với phần trước: `tests/support/pages/fieldByLabel.ts` thêm `labelByText()` (nhãn theo chữ, cùng mẫu `labelPattern`), `fieldByLabel()` dùng lại hàm này; kết quả của `fieldByLabel()` không đổi. Không đổi `RegisterPage.ts`
- Đã sửa trước khi giao: Không

## Giả định

- GĐ-script-15: Mỗi dòng dữ liệu một test; spec rẽ nhánh theo `check` (một hàm kiểm cho mỗi loại), không rẽ nhánh thao tác: Mọi test chỉ mở `/register`, không gửi form.
- GĐ-script-16: TC-REG-90 "có trường Xác nhận mật khẩu" đo bằng: Có đúng 1 ô nhập đi cùng nhãn "Xác nhận mật khẩu" trong form (`toHaveCount(1)`), và ô đó hiển thị.
- GĐ-script-17: TC-REG-92 đọc `backgroundColor` tính được (`getComputedStyle`) của nút, đổi `rgb()`/`rgba()` sang HSL trong `lib/color.ts`. Nền trong suốt (alpha 0) thì hue không có nghĩa: Test báo "nút không có màu nền" thay vì so hue. Màu không ở dạng `rgb()` thì test báo lỗi rõ ràng (không đoán). Đo lúc trang vừa tải, chuột không ở trên nút (không đo màu khi hover).
- GĐ-script-18: TC-REG-93 đếm thẻ `h1` trên **cả trang** (FR-21: Mỗi trang có đúng 1 thẻ `h1`), không chỉ trong `main`. Phần chữ chỉ kiểm khi đếm được đúng 1 thẻ (không đọc chữ của locator không khớp, bài học FR-17 về kẹt 30 giây).
- GĐ-script-19: TC-REG-95 với `markerPlacement: "labelOrAdjacent"` (CH-data-01 b): Đạt khi `*` nằm trong chữ của nhãn (kể cả phần tử con) hoặc trong chữ của phần tử đứng ngay trước hoặc ngay sau nhãn (cùng phần tử cha). Nhãn tìm bằng `labelPattern`, vốn cho phép một `*` phía sau nhãn; nếu giao diện đặt `*` **trước** chữ nhãn trong cùng thẻ `<label>` ("* Họ Tên") thì nhãn không tìm thấy và test báo thiếu nhãn.
- GĐ-script-20: TC-REG-96 kiểm thuộc tính `type` của ô Email và ô Mật khẩu (`toHaveAttribute`); ký tự bị che là hệ quả của `type="password"` (GĐ-data-03).

## Câu hỏi cho sinh viên

Không có câu hỏi mới: Các điểm cần quyết định của P4 đã chốt ở CH-select-01, 02, CH-data-01 và ghi chú TC-REG-95.

## Code

File: `tests/support/pages/fieldByLabel.ts`

```ts
import type { Locator } from '@playwright/test';

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Mẫu so nhãn: Đúng chữ hoa thường theo đặc tả (FR-01 02_review.md, CH-script-04 a: Không che lệch đặc tả),
// chỉ bỏ qua khoảng trắng hai đầu và một dấu * phía sau (FR-22 có thể thêm * vào nhãn).
export function labelPattern(label: string): RegExp {
  return new RegExp(`^\\s*${escapeRegExp(label)}\\s*\\*?\\s*$`, 'u');
}

// Thẻ <label> có chữ khớp labelPattern(label) trong phạm vi `scope`.
export function labelByText(scope: Locator, label: string): Locator {
  return scope.locator('label').filter({ hasText: labelPattern(label) });
}

// Ô nhập đi cùng nhãn khi <label> không gắn với ô bằng for/id: Tìm nhãn trong phạm vi `scope`, đi lên phần tử cha
// trực tiếp của nhãn (khối của trường đó), lấy ô nhập trong khối. Không lọc mọi div có chứa nhãn, vì div bọc chung
// nhiều trường cũng chứa nhãn và làm locator khớp nhiều ô (strict mode).
export function fieldByLabel(scope: Locator, label: string): Locator {
  return labelByText(scope, label).locator('xpath=..').locator('input');
}
```

File: `tests/A_FR-01_DangKy/lib/color.ts`

```ts
// Đổi màu CSS tính được (getComputedStyle) dạng rgb()/rgba() sang HSL để so với khoảng "xanh dương" của TC-REG-92.
export interface Hsl {
  hue: number; // 0 đến 360 độ
  saturationPercent: number; // 0 đến 100
  lightnessPercent: number; // 0 đến 100
  alpha: number; // 0 đến 1
}

// Nhận cả cú pháp có dấu phẩy "rgb(239, 68, 68)" và không dấu phẩy "rgb(239 68 68 / 0.5)". Trả về null nếu không phải rgb()/rgba().
export function cssRgbToHsl(css: string): Hsl | null {
  const m = css.trim().match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i);
  if (!m) return null;
  const [r, g, b] = [m[1], m[2], m[3]].map((v) => Number(v) / 255);
  let alpha = 1;
  if (m[4] !== undefined) alpha = m[4].endsWith('%') ? Number(m[4].slice(0, -1)) / 100 : Number(m[4]);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return { hue: h, saturationPercent: s * 100, lightnessPercent: l * 100, alpha };
}
```

File: `tests/A_FR-01_DangKy/04_form_checklist.spec.ts`

```ts
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
```
