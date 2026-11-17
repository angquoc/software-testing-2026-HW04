# Mẫu Playwright cho script data-driven, đa trình duyệt

Các mẫu dưới đây là mặc định khi dự án chưa chốt khác. Chỗ ghi "**Quyết định**" là chỗ phải hỏi sinh viên, không tự chọn.

## Mục lục

1. Data-driven với JSON
2. Data-driven với CSV
3. Dữ liệu phải duy nhất và cô lập dữ liệu (Quyết định)
4. Selector
5. Các kiểu assertion
6. Assertion khi đặc tả không ghi nguyên văn
7. Chờ đúng cách
8. Hộp thoại của trình duyệt
9. Validation của trình duyệt (HTML5)
10. Đăng nhập
11. Page Object Model (Quyết định)
12. Dùng API trong test (Quyết định)
13. Khác biệt giữa các trình duyệt

---

## 1. Data-driven với JSON

File dữ liệu: Mảng object, mỗi object là một test case, có `id` (mã TC gốc), `title` (mô tả tiếng Anh ngắn), input, và kết quả mong đợi. Kết quả mong đợi có thêm trường `oracle` ghi căn cứ.

```json
[
  {
    "id": "TC-REG-07",
    "title": "rejects password shorter than 8 characters",
    "input": { "name": "Test User", "email": "reg07{{uniq}}@example.com", "password": "Abc123!" },
    "expected": { "outcome": "error", "field": "password", "messageContains": "8" },
    "oracle": "SRS FR-01: Mật khẩu tối thiểu 8 ký tự"
  }
]
```

Spec đọc file và sinh test cho từng dòng (không có dữ liệu viết thẳng trong spec):

```ts
import { test, expect } from '../support/fixtures';
import cases from './data/register_invalid.json';

type RegisterCase = (typeof cases)[number];

test.describe('FR-01 Register: invalid input', () => {
  for (const c of cases as RegisterCase[]) {
    test(`${c.id}: ${c.title}`, async ({ page }) => {
      // ...
    });
  }
});
```

- `tsconfig.json` cần `"resolveJsonModule": true`. Playwright tự biên dịch TypeScript, không cần build.
- Một file dữ liệu có thể có nhiều dạng case (thành công, lỗi); khi các dạng cần bước khác nhau thì tách file, hoặc dùng trường `expected.outcome` để rẽ nhánh **assertion**, không rẽ nhánh **thao tác** quá nhiều (test khó đọc).
- Không đặt dữ liệu trong `test.describe` hay biến `const cases = [...]` trong spec (đề không chấp nhận). Hằng không phải dữ liệu test (URL, timeout) để ở `tests/support/`.

## 2. Data-driven với CSV

CSV hợp với bảng phẳng (mỗi cột một input). Đọc bằng `loadCsv` trong `tests/support/data.ts` (`assets/project/tests/support/data.ts`):

```ts
import { test, expect } from '../support/fixtures';
import { loadCsv } from '../support/data';
import path from 'node:path';

const rows = loadCsv(path.join(__dirname, 'data', 'cart_quantity.csv'));
for (const r of rows) {
  test(`${r.id}: ${r.title}`, async ({ page }) => { /* r.quantity là string, tự đổi kiểu */ });
}
```

- Mọi giá trị đọc từ CSV là chuỗi; ô trống là `""`. Đổi kiểu rõ ràng (`Number(r.quantity)`), và giữ được giá trị "sai kiểu" cố ý (ví dụ `abc` cho ô số) vì đó thường là test case negative.
- Chuỗi có dấu phẩy, xuống dòng phải nằm trong ngoặc kép.

## 3. Dữ liệu phải duy nhất và cô lập dữ liệu (Quyết định)

Chạy cùng bộ test trên 3 trình duyệt (và chạy lại nhiều lần) làm dữ liệu giẫm lên nhau: Email đăng ký trùng, mã coupon đã tồn tại, giỏ hàng của cùng một tài khoản bị trình duyệt khác sửa. Các phương án (sinh viên chọn, ghi vào `WORKFLOW.md` hoặc `01_selected_tc.md`):

| Phương án | Cách làm | Ưu | Nhược |
|---|---|---|---|
| a. Reset DB trước mỗi lần chạy | Chạy lệnh reset trước mỗi `run.mjs <feature> <trình duyệt>` | Đúng trạng thái đặc tả mô tả | Phải chạy tuần tự; quên reset là sai kết quả |
| b. Giá trị duy nhất lúc chạy | Dữ liệu ghi `{{uniq}}`, test thay bằng chuỗi gồm tên project + thời gian | Chạy lại thoải mái | Không dùng được cho test case cần giá trị cố định (biên độ dài email chẳng hạn) nếu chuỗi thêm làm đổi độ dài |
| c. Tài khoản / dữ liệu riêng cho mỗi trình duyệt | Dữ liệu có cột theo project, hoặc tạo tài khoản ở `beforeAll` | Chạy song song được | Thêm bước chuẩn bị; cần đặc tả cho phép tạo |
| d. Dọn dẹp sau test | `afterEach` xóa dữ liệu vừa tạo | Không đổi dữ liệu | Hỏng giữa chừng thì còn rác; có thể cần API |

Khi dùng `{{uniq}}`, lưu ý test case biên độ dài: Tính độ dài **sau khi thay**, hoặc dùng chuỗi duy nhất có độ dài cố định và trừ ra trong dữ liệu. Ghi rõ trong dữ liệu (`"note"`).

## 4. Selector

Thứ tự ưu tiên (bền nhất trước):

1. `page.getByRole('button', { name: 'Đăng ký' })`: Vai trò và tên truy cập được (khớp cây ARIA của `aria_snapshot.mjs`).
2. `page.getByLabel('Email')`: Ô nhập có nhãn.
3. `page.getByPlaceholder('...')`, `page.getByText('...')`.
4. `page.getByTestId('...')`: Chỉ khi trang có sẵn `data-testid` (không sửa mã nguồn hệ thống để thêm).
5. CSS theo thuộc tính ổn định (`input[name="email"]`, `#email`). Tránh class sinh tự động, `nth-child`, XPath theo vị trí.

- Phạm vi hóa khi trang có nhiều phần tử giống nhau: `page.getByRole('row', { name: 'SAVE10' }).getByRole('button', { name: 'Xóa' })`.
- Chữ tiếng Việt trên giao diện: Dùng đúng chữ, có dấu. Chữ có thể đổi hoa / thường bằng CSS (`text-transform`): `getByRole` dùng tên truy cập, không bị ảnh hưởng; `getByText` có thể bị.
- `{ exact: true }` khi tên ngắn dễ khớp nhầm (`'Xóa'` khớp cả `'Xóa tất cả'`).

## 5. Các kiểu assertion

"Kiểu assertion" là **cách kiểm** khác nhau, không phải cùng một matcher với giá trị khác. Ví dụ các kiểu phân biệt rõ:

| Kiểu | Matcher | Kiểm gì |
|---|---|---|
| Hiển thị | `toBeVisible()`, `toBeHidden()` | Thông báo lỗi / thành công xuất hiện |
| Nội dung chữ | `toHaveText()`, `toContainText()` | Câu thông báo, giá trị hiển thị |
| Điều hướng | `toHaveURL()`, `toHaveTitle()` | Chuyển trang sau khi làm xong |
| Giá trị ô nhập | `toHaveValue()` | Ô giữ / xóa giá trị, số lượng trong giỏ |
| Số lượng | `toHaveCount()` | Số dòng trong bảng, số sản phẩm trong giỏ |
| Trạng thái | `toBeEnabled()`, `toBeDisabled()`, `toBeChecked()` | Nút bị khóa khi dữ liệu sai |
| Thuộc tính | `toHaveAttribute()` | `aria-invalid`, `type`, `maxlength` |
| Phản hồi mạng | `waitForResponse` + `expect(res.status()).toBe(...)` | Request thật sự được gửi / bị chặn |
| Giá trị tính toán | `expect(Number(...)).toBe(...)`, `toBeCloseTo()` | Tổng tiền, giảm giá |
| Validation trình duyệt | `expect(await input.evaluate(e => e.validity.valid)).toBe(false)` | Trình duyệt chặn gửi form |
| Chờ điều kiện | `expect.poll(...)`, `expect(...).toPass()` | Giá trị đổi bất đồng bộ |

`expect.soft(...)` (assertion mềm: Kiểm nhiều điểm trong một test mà không dừng ở điểm sai đầu tiên) là **cách chạy**, không phải một kiểu: `expect.soft(cell).toHaveText(...)` vẫn là kiểu "Nội dung chữ". `check_automation.py spec` chỉ báo số lần dùng `expect.soft`, không tính vào số kiểu. Khi dùng `soft`, giữ assertion thường cho bước mà nếu sai thì các bước sau vô nghĩa (ví dụ "có đúng một dòng" trước khi đọc từng ô của dòng đó), để không phải chờ hết thời gian ở từng ô.

Ưu tiên **web-first assertion** (`await expect(locator).toX()`), vì nó tự chờ và thử lại. Tránh `expect(await locator.textContent()).toBe(...)` (đọc một lần, dễ flaky).

Phạm vi "≥ 3 kiểu" (toàn suite hay mỗi feature): **Quyết định** của dự án. `check_automation.py spec` đếm theo file và theo tập file được truyền vào. Dự án chốt "kiểu nằm trong `lib/` hoặc page object tính cho spec gọi nó" thì thêm `--with-imports`: Mỗi spec được cộng kiểu của các file cục bộ nó `import` (đệ quy, bỏ `import type` và `fixtures`), và `--min-assert` áp cho **từng** spec.

## 6. Assertion khi đặc tả không ghi nguyên văn

- Đặc tả ghi nguyên văn câu thông báo: So nguyên văn (`toHaveText`).
- Đặc tả chỉ nói "hiển thị lỗi" / "báo mật khẩu quá ngắn": Không lấy câu từ giao diện làm kết quả mong đợi. Kiểm phần ý chính đặc tả nói (vùng lỗi xuất hiện, gắn với đúng ô, có từ khóa như "8" hay "mật khẩu"), và **không** cho chuyển trang / không tạo dữ liệu. Ghi câu hỏi mở nếu từ khóa chưa chắc.
- Kết quả âm ("không được tạo"): Kiểm cả giao diện (vẫn ở trang cũ, có lỗi) lẫn hệ quả (không có dòng mới trong danh sách, request bị từ chối) nếu dự án cho dùng API để kiểm.

## 7. Chờ đúng cách

- Không dùng `page.waitForTimeout()` (ngủ cứng gây flaky và chậm). Không dùng `networkidle` để chờ chung chung.
- Chờ điều cần thấy: `await expect(locator).toBeVisible()`, `await expect(page).toHaveURL(...)`.
- Chờ request: `const resp = page.waitForResponse(r => r.url().includes('/api/register'))` **trước** khi click, rồi `await resp` sau khi click.
- Thông báo tự ẩn (toast): Assertion ngay sau thao tác; không chờ thứ khác trước.
- Firefox thường chậm hơn: Nếu cần tăng timeout thì tăng cho riêng assertion đó và ghi lý do, không tăng timeout toàn cục để che flaky.

## 8. Hộp thoại của trình duyệt

Playwright **tự đóng** `alert`, `confirm`, `prompt` nếu test không bắt. Nếu hệ thống báo kết quả bằng `alert` hoặc xác nhận xóa bằng `confirm`, phải bắt để đọc chữ và chọn nút:

```ts
const dialogPromise = page.waitForEvent('dialog');
await page.getByRole('button', { name: 'Xóa' }).click();
const dialog = await dialogPromise;
expect(dialog.message()).toContain('...');   // theo đặc tả
await dialog.accept();                        // hoặc dialog.dismiss() cho test case "hủy"
```

Không bắt mà test vẫn qua thì đó là assertion thiếu (câu thông báo không được kiểm).

## 9. Validation của trình duyệt (HTML5)

Ô có `required`, `type="email"`, `min`, `max`, `maxlength`, `pattern`: Trình duyệt chặn gửi form và hiện bong bóng **không nằm trong DOM**, chữ khác nhau giữa Chrome, Edge, Firefox và theo ngôn ngữ máy.

- Kiểm trạng thái, không kiểm chữ: `expect(await input.evaluate((e: HTMLInputElement) => e.validity.valid)).toBe(false)`.
- Kiểm thêm hệ quả: Không chuyển trang, không có request gửi đi.
- `maxlength`: `fill()` với chuỗi dài hơn sẽ bị trình duyệt cắt; assertion `toHaveValue` cho thấy độ dài sau khi cắt.
- `type="number"`: `fill('abc')` báo lỗi "Cannot type text into input[type=number]" trên một số trình duyệt. Test case "nhập chữ vào ô số" dùng `pressSequentially` và kiểm giá trị còn lại, hoặc ghi là không tự động hóa được qua UI kèm lý do.

## 10. Đăng nhập

- Test về chính chức năng đăng nhập / đăng ký: Thao tác qua UI trong test.
- Feature khác cần đăng nhập sẵn: Đăng nhập qua UI trong `beforeEach` (chậm, đơn giản), hoặc đăng nhập một lần và dùng lại `storageState` cho mỗi project (nhanh; phải tách theo project nếu dùng tài khoản khác nhau mỗi trình duyệt). **Quyết định** khi sinh script đầu tiên của feature cần đăng nhập.
- Không viết mật khẩu vào spec; để trong file dữ liệu hoặc `tests/support/` (tài khoản thử của hệ thống, không phải thông tin cá nhân).
- Đăng nhập một lần (hay reset DB) cho **riêng một feature**: Project `setup` làm `dependencies` vẫn chạy khi lệnh chỉ lọc thư mục của feature khác. Dùng `globalSetup` chung chỉ gọi phần chuẩn bị của feature đang chạy (theo `RUN_LABEL` hoặc tham số đường dẫn), lỗi ném rõ ràng kèm log (`lessons.md`, "Rút từ lần làm thật").

## 11. Page Object Model (Quyết định)

- Có POM: `tests/support/pages/<Trang>Page.ts` gói selector và thao tác (`fillForm`, `submit`), spec chỉ còn dữ liệu và assertion. Hợp khi nhiều spec dùng chung một trang hoặc dự kiến bảo trì lâu.
- Không POM: Selector nằm trong spec, gom thành hàm cục bộ khi lặp. Gọn khi một feature chỉ có một hai spec.
- Assertion vẫn nằm trong spec (page object không tự khẳng định kết quả mong đợi), để đọc spec là thấy test kiểm gì.

## 12. Dùng API trong test (Quyết định)

Fixture `request` gọi API trực tiếp. Dùng được cho: Chuẩn bị dữ liệu (tạo coupon trước khi test sửa), dọn dẹp, kiểm chứng phụ (sau khi xóa trên UI, API không còn trả về). Nếu đề yêu cầu tự động hóa web frontend thì test case vẫn phải **thao tác qua UI**; test case vốn chỉ kiểm qua API ghi rõ trong `01_selected_tc.md` cách xử lý (bỏ, giữ là test API, hoặc chuyển thành thao tác UI tương đương).

## 13. Khác biệt giữa các trình duyệt

- Chữ của bong bóng validation, định dạng ô ngày, cách hiển thị số khác nhau (mục 9).
- Firefox khởi động và chạy chậm hơn Chrome / Edge.
- Edge và Chrome cùng nhân Chromium: Fail chỉ ở Firefox gợi ý khác biệt trình duyệt; fail ở cả 3 gợi ý lỗi hệ thống hoặc lỗi script.
- Test fail chỉ ở một trình duyệt: Chạy lại riêng trình duyệt đó vài lần trước khi kết luận (flaky hay khác biệt thật).
