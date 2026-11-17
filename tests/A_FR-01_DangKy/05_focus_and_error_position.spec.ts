// FR-01 Đăng ký, phần P5: Thứ tự focus khi nhấn Tab (TC-REG-94) và vị trí thông báo lỗi so với nút "Đăng Ký" (TC-REG-97).
// Dữ liệu: data/focus_and_error_position.json. Kế hoạch: features/A_FR-01_DangKy/01_selected_tc.md mục 3.
import type { Locator, Page, TestInfo } from '@playwright/test';
import { test, expect } from '../support/fixtures';
import { RegisterPage, type RegisterInput } from '../support/pages/RegisterPage';
import cases from './data/focus_and_error_position.json';

interface FocusCase {
  id: string;
  title: string;
  check: string;
  input?: RegisterInput;
  target?: unknown;
  expected: unknown;
}

interface OrderItem {
  kind: string;
  label?: string;
  name?: string;
  scope?: string;
}

const softExpect = expect.configure({ soft: true });

// Phần tử của một bước trong thứ tự Tab (GĐ-script-22).
function orderItemLocator(page: Page, register: RegisterPage, item: OrderItem): Locator {
  switch (item.kind) {
    case 'field':
      return register.field(item.label ?? '');
    case 'button':
      return register.form.getByRole('button', { name: item.name ?? '', exact: true });
    case 'link':
      return (item.scope === 'form' ? register.form : page).getByRole('link', { name: item.name ?? '', exact: true });
    default:
      throw new Error(`kind không hỗ trợ: ${item.kind}`);
  }
}

// TC-REG-94: Focus ô bắt đầu, mỗi lần Tab chuyển tới đúng phần tử tiếp theo trong order.
async function checkTabOrder(page: Page, register: RegisterPage, c: FocusCase): Promise<void> {
  const target = c.target as { startField: string };
  const expected = c.expected as { order: OrderItem[] };
  const start = register.field(target.startField);
  await start.focus();
  await expect(start, `bắt đầu ở ô "${target.startField}"`).toBeFocused();
  for (const [i, item] of expected.order.entries()) {
    await page.keyboard.press('Tab');
    const name = item.label ?? item.name;
    await expect.soft(orderItemLocator(page, register, item), `Tab lần ${i + 1}: ${item.kind} "${name}" được focus`).toBeFocused();
  }
}

// TC-REG-97: Gửi dữ liệu sai, mọi thông báo mới của trang nằm hoàn toàn phía trên nút (CH-data-02 a).
async function checkErrorPosition(page: Page, register: RegisterPage, c: FocusCase, testInfo: TestInfo): Promise<void> {
  const target = c.target as { buttonName: string };
  const expected = c.expected as { messageShown: boolean; position: string; rule: string };
  if (expected.rule !== 'messageBottomAtOrAboveButtonTop') throw new Error(`rule không hỗ trợ: ${expected.rule}`);
  if (!expected.messageShown) throw new Error(`${c.id}: Chỉ hỗ trợ messageShown = true`);
  if (!c.input) throw new Error(`${c.id}: Thiếu input`);

  const confirmFilled = await register.fillForm(c.input);
  if (!confirmFilled) {
    testInfo.annotations.push({
      type: 'Xác nhận mật khẩu',
      description: 'Form không có ô Xác nhận mật khẩu (#43): Bỏ qua bước nhập (CH-select-06 a)',
    });
  }
  // Nguyên nhân đã có hiệu lực: Mật khẩu yếu của dữ liệu đã nằm trong ô.
  await expect(register.field(RegisterPage.labels.password), 'ô Mật khẩu giữ đúng mật khẩu của dữ liệu').toHaveValue(
    c.input.password,
  );

  const button = register.form.getByRole('button', { name: target.buttonName, exact: true });
  await register.recordTexts();
  await register.submit();

  // Có thông báo của trang (chữ mới sau khi bấm).
  await softExpect
    .poll(() => register.newTexts(), { message: 'có thông báo mới trên trang sau khi bấm "Đăng Ký"' })
    .not.toEqual([]);

  // Chỉ đo khi vẫn ở /register (GĐ-script-11, GĐ-script-24).
  await expect.soft(page, `vẫn ở ${RegisterPage.path}`).toHaveURL((url) => url.pathname === RegisterPage.path);
  const path = new URL(page.url()).pathname;
  if (path !== RegisterPage.path) {
    testInfo.annotations.push({ type: 'Bỏ qua', description: `Không còn ở ${RegisterPage.path} (đang ở ${path}): Không đo vị trí` });
    return;
  }

  await expect(button, `nút "${target.buttonName}" hiển thị`).toBeVisible();
  const buttonBox = await button.boundingBox();
  if (!buttonBox) throw new Error(`Không đọc được tọa độ của nút "${target.buttonName}"`);

  for (const text of await register.newTexts()) {
    const box = register.messageByText(text);
    const n = await box.count();
    expect.soft(n, `thông báo "${text}" định vị được đúng 1 phần tử`).toBe(1);
    if (n !== 1) continue;
    await expect.soft(box, `thông báo "${text}" hiển thị`).toBeVisible();
    const messageBox = await box.boundingBox();
    if (!messageBox) continue;
    const messageBottom = messageBox.y + messageBox.height;
    expect
      .soft(messageBottom, `cạnh dưới thông báo "${text}" (${messageBottom}) không thấp hơn cạnh trên nút (${buttonBox.y})`)
      .toBeLessThanOrEqual(buttonBox.y);
  }
}

test.describe('FR-01 Register: tab order and error message position (P5)', () => {
  for (const c of cases as unknown as FocusCase[]) {
    test(`${c.id}: ${c.title}`, async ({ page }, testInfo) => {
      const register = new RegisterPage(page);
      await register.goto();
      switch (c.check) {
        case 'tabOrder':
          await checkTabOrder(page, register, c);
          break;
        case 'errorPosition':
          await checkErrorPosition(page, register, c, testInfo);
          break;
        default:
          throw new Error(`Loại kiểm tra không hỗ trợ: ${c.check}`);
      }
    });
  }
});
