# A: FR-01 Đăng ký tài khoản: Review dữ liệu và script AI sinh

- Bản AI: `ai_raw/data.md` (commit `930079a`); `ai_raw/script_01_register_valid.md` (P1, commit `4b7b001`)
- Thời gian tạo: 2026-11-17 23:44 (+07:00). Cập nhật: 2026-11-18 00:16 (+07:00), quyết định CH-script-01 đến 03 và sửa `fieldByLabel.ts` sau review P1

## 1. Dữ liệu

- File: `tests/A_FR-01_DangKy/data/` gồm `register_valid.json` (P1: TC-REG-01, 108), `required_fields.json` (P2: TC-REG-30, 32, 49), `weak_password.json` (P3: TC-REG-56, 107), `form_checklist.json` (P4: TC-REG-90, 92, 93, 95, 96), `focus_and_error_position.json` (P5: TC-REG-94, 97). 14 dòng, đúng 14 mã của `01_selected_tc.md`.
- Schema đã chốt: Giữ schema của bản AI (`ai_raw/data.md` mục "Schema chung"): `id`, `title`, `input` (`fullName`, `email`, `password`, `confirmPassword`), `check` và `target` (P4, P5), `expected` theo phần, `oracle`, `note`. Thêm 3 trường để ghi quyết định CH-data-01 đến 03: `expected.markerPlacement` (TC-REG-95), `expected.order[].scope` (TC-REG-94), `expected.rule` (TC-REG-97).
- Cô lập dữ liệu: Reset DB trước mỗi lượt chạy (mỗi trình duyệt), giữ đúng email của HW02; không dùng chuỗi duy nhất (`01_selected_tc.md`).
- Giả định giữ nguyên: GĐ-data-01 (nghe request đăng ký là quan sát thụ động), GĐ-data-02 (TC-REG-97 dùng lại email `tc107@domain.com`), GĐ-data-03 (ký tự bị che là hệ quả của `type="password"`).
- Quyết định:

| Mã | Câu hỏi | Quyết định của SV |
|---|---|---|
| CH-data-01 | TC-REG-95: Cách hiểu "ký hiệu `*` bên cạnh nhãn" | b. `*` nằm trong nhãn (kể cả phần tử con) hoặc trong phần tử đứng ngay cạnh nhãn, cùng phần tử cha. Ghi `"markerPlacement": "labelOrAdjacent"` |
| CH-data-02 | TC-REG-97: Cách hiểu "thông báo lỗi xuất hiện trên nút submit" | a. Cạnh dưới của khung thông báo không thấp hơn cạnh trên của nút: Thông báo hoàn toàn ở trên nút. Ghi `"rule": "messageBottomAtOrAboveButtonTop"` |
| CH-data-03 | TC-REG-94: Liên kết "Đăng nhập" nào là phần tử cuối của thứ tự Tab | a. Liên kết trong vùng form (dưới nút "Đăng Ký"), không phải liên kết trên thanh điều hướng; kiểm tới liên kết đó là dừng. Ghi `"scope": "form"` |

- Ghi chú để bước `script` (sinh viên, 2026-11-17): Tên nhãn, nút, liên kết trong dữ liệu lấy theo đặc tả và test case HW02 (ví dụ "Họ Tên", "Đăng Ký"). Khi đọc DOM thật, nếu giao diện viết khác hoa thường (ví dụ "Họ tên" thay vì "Họ Tên"), cần cập nhật cho khớp hoặc cho locator so khớp không phân biệt hoa thường, để test không fail vì lệch chữ hoa. Chọn cách nào: ⏳ chốt ở bước `script` khi đã có snapshot DOM. Với TC-REG-93 (chữ trong `h1` chứa "Đăng ký") dữ liệu đã ghi `caseInsensitive: true`.

## 2. Script

- Cấu trúc đã chốt (trước P1, 2026-11-17, áp cho P1 đến P5): POM (`tests/support/pages/RegisterPage.ts`, `LoginPage.ts`, `fieldByLabel.ts`), assertion nằm trong spec; thông tin giao diện lấy bằng snapshot (`ai_raw/snapshot_register.txt`, `ai_raw/snapshot_login.txt`) và mã frontend `Register.jsx`, `Login.jsx` (chỉ để lấy selector); mỗi spec tự đủ ≥ 3 kiểu assertion, kiểu trong page object không tính; `expect.soft` cho các điểm quan sát; không cần đăng nhập; chỉ test qua UI (nghe request là quan sát thụ động); reset DB mỗi lượt trong `tests/A_FR-01_DangKy/setup/globalSetup.ts` qua `tests/support/resetDb.ts` (logic của FR-17).
- Quyết định sau bản AI P1:

| Mã | Câu hỏi | Quyết định của SV |
|---|---|---|
| CH-script-01 | `/login` ghi nhãn "Username" thay vì "Email" (FR-02); test P1 sẽ fail vì lệch nhãn khi #42 được sửa | a. Giữ theo dữ liệu (FR-02: Email, Mật khẩu); fail đó ghi rõ là lệch của trang Đăng nhập khi phân loại |
| CH-script-02 | Kiểm "đúng 1 request `POST /api/register`, phản hồi 2xx" không có chữ trong OUT1 | a. Giữ (hệ quả của "đăng ký thành công") |
| CH-script-03 | `resetDb.ts` trùng logic với FR-17 | a. Giữ như vậy; không sửa FR-17 |

- Các lượt chạy thử: Chưa chạy trên giao diện thật. Kiểm locator `fieldByLabel` trên trang HTML dựng bằng `page.setContent` (2026-11-18 00:15, Chrome, không phải EShop): Xem dòng `fieldByLabel.ts` ở mục 3.
- Kiểu assertion dùng: Chưa có.
- Test fail do hệ thống sai đặc tả (giữ nguyên, báo ở bước bugs): Chưa có.

## 3. Thay đổi so với bản AI

| Vị trí | Thay đổi | Loại | Loại lỗi script | Vì sao AI sai / bỏ sót | Lý do hoặc căn cứ |
|---|---|---|---|---|---|
| `tests/A_FR-01_DangKy/data/form_checklist.json:33` (TC-REG-95) | Thêm `"markerPlacement": "labelOrAdjacent"` vào `expected`, ghi cách hiểu vào `note` | Quyết định của SV | Dữ liệu | | Sinh viên chọn CH-data-01 b (2026-11-17); SRS FR-22: Ký hiệu `*` bên cạnh nhãn |
| `tests/A_FR-01_DangKy/data/focus_and_error_position.json:29` (TC-REG-97) | Thêm `"rule": "messageBottomAtOrAboveButtonTop"` vào `expected`, ghi cách so tọa độ vào `note` | Quyết định của SV | Dữ liệu | | Sinh viên chọn CH-data-02 a (2026-11-17); SRS FR-22: Thông báo lỗi xuất hiện trên nút submit, không phải bên dưới |
| `tests/A_FR-01_DangKy/data/focus_and_error_position.json:12` (TC-REG-94) | Thêm `"scope": "form"` cho liên kết "Đăng nhập" cuối thứ tự Tab, ghi rõ vào `note` | Quyết định của SV | Dữ liệu | | Sinh viên chọn CH-data-03 a (2026-11-17); trang có thêm liên kết "Đăng nhập" trên thanh điều hướng (HW02 `06_results.md`, TC-REG-94) |
| ★ `tests/support/pages/fieldByLabel.ts:13` (P1, dùng cho P1 đến P5) | `scope.locator('div').filter({ has: <label khớp> }).locator('input')` → `scope.locator('label').filter({ hasText }).locator('xpath=..').locator('input')`: Đi từ nhãn lên phần tử cha trực tiếp rồi lấy ô, thay vì lọc mọi `div` có chứa nhãn | Sai | Selector dễ vỡ | Giới hạn model: AI đã đọc `Register.jsx` và thấy mỗi trường là một `div` riêng, nhưng không nghĩ tới `div` tổ tiên khác cũng chứa nhãn; với DOM hiện tại locator cũ vẫn đúng nên kiểm tĩnh không lộ ra | Sinh viên tự thấy khi đọc bản AI P1 (2026-11-18). AI kiểm khi sinh viên nhờ, trên HTML dựng bằng `page.setContent` (Chrome): Form có `div` bọc chung 3 trường thì locator cũ khớp 3 ô (lỗi strict mode khi `fill`), locator mới khớp 1; form hiện tại và ô nằm trong `div` con của khối trường: Cả hai khớp 1. DOM EShop hiện tại không đổi kết quả, không đổi ý nghĩa test |

## 4. Chỗ sửa sẽ kể trong video

Chưa có (bước `review`).
