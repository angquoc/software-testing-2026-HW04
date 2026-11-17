# A: FR-01 Đăng ký tài khoản data: File dữ liệu test (bản AI)

- Bước: `[A-FR01][data]`
- Thời gian tạo: 2026-11-17 23:40 (+07:00)
- Công cụ: Claude Code (VS Code extension), model Claude Opus 5.5 (`claude-opus-5-5`), skill `playwright-automation`
- Căn cứ: `01_selected_tc.md` (14 test case, kế hoạch P1 đến P5, quyết định CH-select-01 đến 07, giả định GĐ-01 đến GĐ-04), `Homeworks/HW02/features/A_FR-01_DangKy/05_final_tc.md` (giá trị nhập và kết quả mong đợi gốc, mục 1.2, 1.4, 3, 4, 5, 8), SRS `Homeworks/eshop-sut/README.md` (FR-01, FR-02, FR-21, FR-22). Không mở giao diện, không đọc DOM hay mã nguồn ở bước này: Tên nhãn, nút, liên kết trong dữ liệu lấy từ đặc tả và test case HW02
- Quyết định của sinh viên trước khi viết (2026-11-17): TC-REG-92 coi là xanh dương khi hue của màu nền nằm trong 200° đến 250° và độ bão hòa (HSL) từ 40% trở lên. Định dạng JSON, mỗi phần một file (theo kế hoạch đã chốt ở `01_selected_tc.md`). Không dùng chuỗi duy nhất: Reset DB mỗi lượt, giữ đúng email của HW02
- Đã sửa trước khi giao: Không

## Schema chung

Mỗi file là một mảng object, mỗi object là một test case:

| Trường | Kiểu | Ý nghĩa |
|---|---|---|
| `id` | chuỗi | Mã test case HW02 (`TC-REG-nn`) |
| `title` | chuỗi | Mô tả tiếng Anh ngắn, dùng làm tên test sau mã |
| `input` | object | Giá trị nhập (P1, P2, P3, TC-REG-97): `fullName` (Họ Tên), `email`, `password` (Mật khẩu), `confirmPassword` (Xác nhận mật khẩu). Chuỗi rỗng `""` là "để trống". `confirmPassword` chỉ nhập khi form có ô này (CH-select-06 a) |
| `check` | chuỗi | Chỉ P4, P5: Loại kiểm tra, để spec chọn cách đo (`confirmPasswordField`, `submitButtonColor`, `h1`, `requiredMarker`, `inputTypes`, `tabOrder`, `errorPosition`) |
| `target` | object | Chỉ P4, P5: Phần tử cần đo, ghi theo tên trên đặc tả hoặc test case HW02 (nhãn, tên nút, tên liên kết) |
| `expected` | object | Kết quả mong đợi, cấu trúc theo phần (bên dưới) |
| `oracle` | chuỗi | Căn cứ: Mã yêu cầu HW02, câu đặc tả, mã kết quả của `05_final_tc.md` |
| `note` | chuỗi | Ghi chú: Độ dài biên, giới hạn quan sát, dữ liệu đã đổi so với HW02 |

Cấu trúc `expected` theo phần:

| Phần | `expected` |
|---|---|
| P1 (OUT1) | `outcome: "success"`, `path: "/login"`, `loginForm.fields` (nhãn các ô của form đăng nhập theo FR-02), `loginForm.submitButton: true` |
| P2 (OUT2, trình duyệt chặn) | `outcome: "blockedByBrowser"`, `errorCode`, `invalidField` (trường trong `input` bị chặn), `validity: "valueMissing"`, `path: "/register"`, `registerRequestSent: false` |
| P3 (OUT2, trang báo lỗi) | `outcome: "error"`, `errorCode: "ERR6"`, `messageContains` (danh sách từ khóa, so không phân biệt hoa thường), `path: "/register"` |
| P4, P5 | Theo `check` của từng dòng |

## Giả định

- GĐ-data-01: `registerRequestSent: false` (P2) đo bằng cách nghe request `POST .../api/register` trong lúc bấm "Đăng Ký". Đây là quan sát thụ động, test không tự gọi API, nên không trái quyết định "chỉ test qua UI".
- GĐ-data-02: TC-REG-97 dùng nguyên dữ liệu của TC-REG-107 (cả email `tc107@domain.com`) theo CH-select-04 a. Dữ liệu này bị từ chối nên không tạo tài khoản; nếu hệ thống nhận nhầm ở P3 thì TC-REG-97 có thể nhận thông báo Email trùng, nhưng vẫn là thông báo của trang nên vẫn đo được vị trí.
- GĐ-data-03: "Ký tự bị che" của TC-REG-96 coi là hệ quả của `type="password"`, không đo riêng.

## Câu hỏi cho sinh viên

- CH-data-01: TC-REG-95, cách hiểu "ký hiệu `*` bên cạnh nhãn" (FR-22). Phương án: a. Chữ của phần tử nhãn (kể cả phần tử con, như `<span>*</span>` trong nhãn) chứa `*`; b. `*` nằm trong nhãn hoặc trong phần tử đứng ngay cạnh nhãn (cùng phần tử cha).
- CH-data-02: TC-REG-97, cách hiểu "thông báo lỗi xuất hiện **trên** nút submit" (FR-22). Phương án: a. Cạnh dưới của khung thông báo nằm trên (hoặc bằng) cạnh trên của nút: Thông báo hoàn toàn ở trên nút; b. Cạnh trên của khung thông báo nằm trên cạnh trên của nút: Cho phép thông báo chồng một phần lên nút.
- CH-data-03: TC-REG-94 kết thúc ở liên kết "Đăng nhập" của form. Trang còn có liên kết "Đăng nhập" trên thanh điều hướng (HW02 `06_results.md`, TC-REG-94). Phương án: a. Chỉ kiểm tới liên kết "Đăng nhập" nằm trong vùng form (dưới nút "Đăng Ký"); b. Kiểm thêm sau liên kết đó không quay lại ô nào trong form.

## Code

File: `tests/A_FR-01_DangKy/data/register_valid.json`

```json
[
  {
    "id": "TC-REG-01",
    "title": "registers with valid base data and redirects to login",
    "input": {
      "fullName": "Nguyen Van A",
      "email": "tc01@domain.com",
      "password": "Abcdef1!",
      "confirmPassword": "Abcdef1!"
    },
    "expected": {
      "outcome": "success",
      "path": "/login",
      "loginForm": { "fields": ["Email", "Mật khẩu"], "submitButton": true }
    },
    "oracle": "HW02 TC-REG-01, OUT1 (05_final_tc.md mục 1.2); SRS FR-01 (FR01-R01 đến R10, R13): Sau khi đăng ký thành công, người dùng được chuyển tới trang Đăng nhập; FR-02: Người dùng nhập Email và Mật khẩu",
    "note": "Giá trị cơ sở của mọi lớp hợp lệ. Mật khẩu 8 ký tự, ký tự đặc biệt `!`. HW02: Fail do #42"
  },
  {
    "id": "TC-REG-108",
    "title": "registers with a 9-character password and redirects to login",
    "input": {
      "fullName": "Nguyen Van A",
      "email": "tc108@domain.com",
      "password": "Abcdefg1!",
      "confirmPassword": "Abcdefg1!"
    },
    "expected": {
      "outcome": "success",
      "path": "/login",
      "loginForm": { "fields": ["Email", "Mật khẩu"], "submitButton": true }
    },
    "oracle": "HW02 TC-REG-108, OUT1; SRS FR-01 (FR01-R06, R13): Mật khẩu tối thiểu 8 ký tự; sau khi đăng ký thành công chuyển tới trang Đăng nhập",
    "note": "Mật khẩu 9 ký tự (A, b, c, d, e, f, g, 1, !): Biên LB+1 của độ dài, cặp với TC-REG-107. HW02: Fail do #42"
  }
]
```

File: `tests/A_FR-01_DangKy/data/required_fields.json`

```json
[
  {
    "id": "TC-REG-30",
    "title": "blocks submit when full name is empty",
    "input": {
      "fullName": "",
      "email": "tc30@domain.com",
      "password": "Abcdef1!",
      "confirmPassword": "Abcdef1!"
    },
    "expected": {
      "outcome": "blockedByBrowser",
      "errorCode": "ERR1",
      "invalidField": "fullName",
      "validity": "valueMissing",
      "path": "/register",
      "registerRequestSent": false
    },
    "oracle": "HW02 TC-REG-30, OUT2 ERR1 (thiếu Họ Tên); SRS FR-01 (FR01-R01): Người dùng phải cung cấp Họ Tên",
    "note": "Bong bóng của trình duyệt tính là thông báo lỗi (GĐ-02 của select); không so chữ bong bóng vì khác nhau giữa trình duyệt"
  },
  {
    "id": "TC-REG-32",
    "title": "blocks submit when email is empty",
    "input": {
      "fullName": "Nguyen Van A",
      "email": "",
      "password": "Abcdef1!",
      "confirmPassword": "Abcdef1!"
    },
    "expected": {
      "outcome": "blockedByBrowser",
      "errorCode": "ERR2",
      "invalidField": "email",
      "validity": "valueMissing",
      "path": "/register",
      "registerRequestSent": false
    },
    "oracle": "HW02 TC-REG-32, OUT2 ERR2 (thiếu Email); SRS FR-01 (FR01-R02): Người dùng phải cung cấp Email",
    "note": "Như TC-REG-30"
  },
  {
    "id": "TC-REG-49",
    "title": "blocks submit when password is empty",
    "input": {
      "fullName": "Nguyen Van A",
      "email": "tc49@domain.com",
      "password": "",
      "confirmPassword": ""
    },
    "expected": {
      "outcome": "blockedByBrowser",
      "errorCode": "ERR5",
      "invalidField": "password",
      "validity": "valueMissing",
      "path": "/register",
      "registerRequestSent": false
    },
    "oracle": "HW02 TC-REG-49, OUT2 ERR5 (thiếu Mật khẩu); SRS FR-01 (FR01-R03): Người dùng phải cung cấp Mật khẩu",
    "note": "Xác nhận mật khẩu cũng để trống, đúng như HW02"
  }
]
```

File: `tests/A_FR-01_DangKy/data/weak_password.json`

```json
[
  {
    "id": "TC-REG-56",
    "title": "rejects password without a special character",
    "input": {
      "fullName": "Nguyen Van A",
      "email": "tc56@domain.com",
      "password": "Abcdefg1",
      "confirmPassword": "Abcdefg1"
    },
    "expected": {
      "outcome": "error",
      "errorCode": "ERR6",
      "messageContains": ["mật khẩu"],
      "path": "/register"
    },
    "oracle": "HW02 TC-REG-56, OUT2 ERR6 (Mật khẩu không đạt yêu cầu mạnh); SRS FR-01 (FR01-R10): Có ít nhất 1 ký tự đặc biệt (@, $, !, %, *, ?, &). Từ khóa theo CH-select-05 a",
    "note": "Mật khẩu 8 ký tự, đủ chữ hoa, chữ thường, chữ số, không có ký tự đặc biệt: Chỉ vi phạm FR01-R10. Mật khẩu hợp lệ cũng nhận thông báo này (#42), nên đọc cùng TC-REG-01"
  },
  {
    "id": "TC-REG-107",
    "title": "rejects 7-character password",
    "input": {
      "fullName": "Nguyen Van A",
      "email": "tc107@domain.com",
      "password": "Abcde1!",
      "confirmPassword": "Abcde1!"
    },
    "expected": {
      "outcome": "error",
      "errorCode": "ERR6",
      "messageContains": ["mật khẩu"],
      "path": "/register"
    },
    "oracle": "HW02 TC-REG-107, OUT2 ERR6; SRS FR-01 (FR01-R06): Mật khẩu tối thiểu 8 ký tự. Từ khóa theo CH-select-05 a",
    "note": "Mật khẩu 7 ký tự (A, b, c, d, e, 1, !): Biên LB-1, đủ 4 loại ký tự nên chỉ vi phạm độ dài. Cặp với TC-REG-108"
  }
]
```

File: `tests/A_FR-01_DangKy/data/form_checklist.json`

```json
[
  {
    "id": "TC-REG-90",
    "title": "shows a confirm password field",
    "check": "confirmPasswordField",
    "target": { "label": "Xác nhận mật khẩu" },
    "expected": { "present": true },
    "oracle": "HW02 TC-REG-90; SRS FR-01 (FR01-R11): Phải có trường Xác nhận mật khẩu",
    "note": "HW02: Fail, issue #43"
  },
  {
    "id": "TC-REG-92",
    "title": "shows the register button in blue",
    "check": "submitButtonColor",
    "target": { "buttonName": "Đăng Ký" },
    "expected": { "hueMin": 200, "hueMax": 250, "saturationMinPercent": 40 },
    "oracle": "HW02 TC-REG-92; SRS FR-21 (FR01-R15): Các nút hành động tích cực (Submit) dùng màu xanh dương. Khoảng hue và độ bão hòa do sinh viên chốt (CH-select-01 a, 2026-11-17)",
    "note": "Đo màu nền tính được (getComputedStyle) của nút, đổi sang HSL. HW02: Fail (nền đỏ), issue #52"
  },
  {
    "id": "TC-REG-93",
    "title": "has exactly one h1 describing the page",
    "check": "h1",
    "expected": { "count": 1, "textContains": "Đăng ký", "caseInsensitive": true },
    "oracle": "HW02 TC-REG-93; SRS FR-21 (FR01-R16): Mỗi trang có đúng 1 thẻ <h1> mô tả nội dung trang. Từ khóa theo CH-select-02 b",
    "note": "HW02: Fail (0 thẻ h1), issue #53"
  },
  {
    "id": "TC-REG-95",
    "title": "marks required field labels with an asterisk",
    "check": "requiredMarker",
    "target": { "labels": ["Họ Tên", "Email", "Mật khẩu"] },
    "expected": { "marker": "*" },
    "oracle": "HW02 TC-REG-95; SRS FR-22 (FR01-R18): Tất cả trường bắt buộc phải có ký hiệu * bên cạnh nhãn; FR-01: Họ Tên, Email, Mật khẩu là bắt buộc",
    "note": "Chỉ 3 nhãn đang có trên giao diện; nhãn Xác nhận mật khẩu không kiểm ở đây vì ô thiếu (#43, đo ở TC-REG-90), theo 01_selected_tc.md mục 6. HW02: Fail, issue #51"
  },
  {
    "id": "TC-REG-96",
    "title": "uses email and password input types",
    "check": "inputTypes",
    "target": { "fields": [{ "label": "Email", "key": "email" }, { "label": "Mật khẩu", "key": "password" }] },
    "expected": { "types": { "email": "email", "password": "password" } },
    "oracle": "HW02 TC-REG-96; SRS FR-22 (FR01-R19, R20): Trường Email phải dùng type=\"email\"; trường Mật khẩu phải dùng type=\"password\"",
    "note": "Ký tự bị che coi là hệ quả của type=\"password\" (GĐ-data-03). HW02: Email là type=\"text\", issue #50"
  }
]
```

File: `tests/A_FR-01_DangKy/data/focus_and_error_position.json`

```json
[
  {
    "id": "TC-REG-94",
    "title": "moves focus through the form in top-to-bottom order with Tab",
    "check": "tabOrder",
    "target": { "startField": "Họ Tên" },
    "expected": {
      "order": [
        { "kind": "field", "label": "Email" },
        { "kind": "field", "label": "Mật khẩu" },
        { "kind": "button", "name": "Đăng Ký" },
        { "kind": "link", "name": "Đăng nhập" }
      ]
    },
    "oracle": "HW02 TC-REG-94; SRS FR-21 (FR01-R17): Thứ tự focus theo Tab đi từ trên xuống dưới, trái sang phải",
    "note": "Bắt đầu bằng focus vào ô Họ Tên, mỗi phần tử trong order là một lần nhấn Tab; không tính ô Xác nhận mật khẩu (CH-select-03 a). Liên kết Đăng nhập là liên kết trong form (CH-data-03). HW02: Pass"
  },
  {
    "id": "TC-REG-97",
    "title": "shows the page error message above the register button",
    "check": "errorPosition",
    "input": {
      "fullName": "Nguyen Van A",
      "email": "tc107@domain.com",
      "password": "Abcde1!",
      "confirmPassword": "Abcde1!"
    },
    "target": { "buttonName": "Đăng Ký" },
    "expected": { "messageShown": true, "position": "above" },
    "oracle": "HW02 TC-REG-97; SRS FR-22 (FR01-R21): Thông báo lỗi phải xuất hiện trên nút submit, không phải bên dưới",
    "note": "Dùng dữ liệu của TC-REG-107 thay dữ liệu TC-REG-30 để có thông báo của trang (CH-select-04 a); bong bóng của trình duyệt không nằm trong DOM nên không đo. Cách so tọa độ: CH-data-02. HW02: Pass"
  }
]
```
