# A: FR-01 Đăng ký tài khoản: Review dữ liệu và script AI sinh

- Bản AI: `ai_raw/data.md` (commit `930079a`); `ai_raw/script_01_register_valid.md` (P1, commit `4b7b001`); `ai_raw/script_02_required_fields.md` (P2, commit `7b6292b`); `ai_raw/script_03_weak_password.md` (P3, commit `041c1ba`); `ai_raw/script_04_form_checklist.md` (P4, commit `33ce9e5`); `ai_raw/script_05_focus_and_error_position.md` (P5, commit `61c443a`)
- Thời gian tạo: 2026-11-17 23:44 (+07:00). Cập nhật: 2026-11-18 00:16 (+07:00), quyết định CH-script-01 đến 03 và sửa `fieldByLabel.ts` sau review P1; 2026-11-18 00:25 (+07:00), sinh viên sửa lại quyết định chữ hoa thường (mục 1), CH-script-04; 2026-11-18 00:38 (+07:00), CH-script-05, P2 duyệt không sửa; 2026-11-18 00:50 (+07:00), CH-script-06, sửa `recordTexts` sau review P3; 2026-11-18 01:08 (+07:00), lượt chạy thử T1 đến T3 trên 3 trình duyệt, đề xuất phân loại 7 test fail

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

- Ghi chú để bước `script` (sinh viên, 2026-11-17): Tên nhãn, nút, liên kết trong dữ liệu lấy theo đặc tả và test case HW02 (ví dụ "Họ Tên", "Đăng Ký"). Khi đọc DOM thật, nếu giao diện viết khác hoa thường (ví dụ "Họ tên" thay vì "Họ Tên"), cần cập nhật cho khớp hoặc cho locator so khớp không phân biệt hoa thường, để test không fail vì lệch chữ hoa. Với TC-REG-93 (chữ trong `h1` chứa "Đăng ký") dữ liệu đã ghi `caseInsensitive: true`.
- Quyết định sửa lại ghi chú trên (sinh viên, 2026-11-18 00:20): Dữ liệu JSON **giữ nguyên** tên nhãn, nút theo đặc tả ("Họ Tên", "Đăng Ký"), **không** sửa chạy theo giao diện, để không che mất lỗi lệch đặc tả nếu có. Căn cứ: Snapshot DOM `/register` của P1 (`ai_raw/snapshot_register.txt`) khớp đúng chữ hoa thường với đặc tả ("Họ Tên", "Email", "Mật khẩu", nút "Đăng Ký"), nên không có dòng dữ liệu nào phải đổi. Cách so khớp chữ hoa thường của locator: Xem mục 2 (CH-script-04).

## 2. Script

- Cấu trúc đã chốt (trước P1, 2026-11-17, áp cho P1 đến P5): POM (`tests/support/pages/RegisterPage.ts`, `LoginPage.ts`, `fieldByLabel.ts`), assertion nằm trong spec; thông tin giao diện lấy bằng snapshot (`ai_raw/snapshot_register.txt`, `ai_raw/snapshot_login.txt`) và mã frontend `Register.jsx`, `Login.jsx` (chỉ để lấy selector); mỗi spec tự đủ ≥ 3 kiểu assertion, kiểu trong page object không tính; `expect.soft` cho các điểm quan sát; không cần đăng nhập; chỉ test qua UI (nghe request là quan sát thụ động); reset DB mỗi lượt trong `tests/A_FR-01_DangKy/setup/globalSetup.ts` qua `tests/support/resetDb.ts` (logic của FR-17).
- Quyết định sau bản AI P1:

| Mã | Câu hỏi | Quyết định của SV |
|---|---|---|
| CH-script-01 | `/login` ghi nhãn "Username" thay vì "Email" (FR-02); test P1 sẽ fail vì lệch nhãn khi #42 được sửa | a. Giữ theo dữ liệu (FR-02: Email, Mật khẩu); fail đó ghi rõ là lệch của trang Đăng nhập khi phân loại |
| CH-script-02 | Kiểm "đúng 1 request `POST /api/register`, phản hồi 2xx" không có chữ trong OUT1 | a. Giữ (hệ quả của "đăng ký thành công") |
| CH-script-03 | `resetDb.ts` trùng logic với FR-17 | a. Giữ như vậy; không sửa FR-17 |
| CH-script-04 | Sau quyết định giữ tên nhãn, nút theo đặc tả (mục 1, 2026-11-18): Locator so tên không phân biệt hoa thường (GĐ-script-01) có che lệch đặc tả không | a. So đúng chữ hoa thường: Bỏ cờ `i` trong `labelPattern`, nút "Đăng Ký" dùng `exact: true`. Giao diện đổi chữ thì test fail ở bước tìm phần tử. Áp cho P1 đến P5 |
| CH-script-05 | P2: Kiểm sự kiện `invalid` trên ô vi phạm (quan sát thêm, không có chữ trong test case HW02) | a. Giữ: Bằng chứng trình duyệt chặn do đúng ô, tránh qua nhầm khi #42 cũng chặn gửi. Sinh viên duyệt P2 (2026-11-18 00:38) |
| CH-script-06 | P3: "Không tạo tài khoản" đo bằng không có phản hồi 2xx cho `POST /api/register` (không có trong dữ liệu P3) | a. Giữ (cùng lý do với CH-script-02) |

- Kiểm ngoài EShop (trước khi chạy thử): Locator `fieldByLabel` (2026-11-18 00:15) và `recordTexts` (2026-11-18 00:48) trên trang HTML dựng bằng `page.setContent` (Chrome); hàm `cssRgbToHsl` thử riêng bằng `node` với màu đúng và sai có chủ đích (2026-11-18 00:56). Xem các dòng tương ứng ở mục 3.
- Các lượt chạy thử: AI chạy khi sinh viên nhờ, trên bản sau commit `61c443a` (đủ P1 đến P5, đã gồm các sửa ở mục 3). Lệnh giống lệnh `tools/run.mjs` gọi (`npx playwright test tests/A_FR-01_DangKy/ --project=<trình duyệt>`, cùng `RUN_LABEL` để `globalSetup` reset DB trước mỗi trình duyệt), nhưng report để ở `playwright-report/trial-<trình duyệt>/` (không nộp), vì `reports/` chỉ dành cho lần chạy chính thức của sinh viên (WORKFLOW 1.3). Số liệu tóm tắt bằng `summarize_results.py` từ `results.json` của 3 lượt:

| Lượt | Thời điểm (khớp tiêu đề report thử) | Trình duyệt | Tổng | Pass | Fail | Skip | Flaky | Thời gian | Reset DB |
|---|---|---|---|---|---|---|---|---|---|
| T1 | 2026-11-18T01:01:23+07:00 | Chrome 157.0.8103.79 | 14 | 7 | 7 | 0 | 0 | 44,5 giây | Có (`[FR-01 setup] Reset DB xong`, mã thoát 0) |
| T2 | 2026-11-18T01:02:10+07:00 | Edge 157.0.4341.60 | 14 | 7 | 7 | 0 | 0 | 46,3 giây | Có |
| T3 | 2026-11-18T01:02:58+07:00 | Firefox 159.0 | 14 | 7 | 7 | 0 | 0 | 1,6 phút | Có |

  - Kết quả giống hệt nhau trên 3 trình duyệt: Cùng 7 test qua (TC-REG-30, 32, 49, 56, 107, 94, 97), cùng 7 test fail ở cùng assertion. Không có lỗi script (không lỗi selector, không strict mode, không kẹt tới hết 30 giây).
  - Test fail mất khoảng 5,7 giây (Firefox 8 đến 9,5 giây) vì assertion soft chờ hết thời gian chờ của `expect` (5 giây) trước khi ghi lỗi; đúng như thiết kế. Firefox chậm hơn đều ở mọi test (khoảng 3 giây mỗi test, kể cả test qua), không phải flaky.
  - Annotation có đúng như thiết kế: "Xác nhận mật khẩu: Form không có ô..." ở mọi test có nhập form; "Bỏ qua: Không ở /login (đang ở /register)" ở TC-REG-01, 108.
  - Mỗi trình duyệt mới chạy 1 lượt. Chưa chạy lặp để bắt flaky, chưa thử làm hỏng có chủ đích để kiểm 7 test qua có bắt được lỗi không (checklist bước `review`).
- Kiểu assertion dùng (`check_automation.py spec --min-assert 3`, mỗi spec tự đủ, không tính page object): P1 3 kiểu (Điều hướng, Hiển thị, Giá trị so sánh); P2 4 kiểu (Giá trị ô nhập, Điều hướng, Validation trình duyệt, Giá trị so sánh); P3 5 kiểu (Giá trị ô nhập, Hiển thị, Nội dung chữ, Điều hướng, Giá trị so sánh); P4 5 kiểu (Số lượng, Hiển thị, Nội dung chữ, Thuộc tính, Giá trị so sánh); P5 5 kiểu (Trạng thái, Hiển thị, Giá trị ô nhập, Điều hướng, Giá trị so sánh). Cả feature 9 kiểu.
- Test fail do hệ thống sai đặc tả (giữ nguyên, báo ở bước `bugs`). Phân loại do AI đề xuất từ lượt chạy thử, **chờ sinh viên chốt**:

| Mã | Test | Assertion fail (giống nhau trên 3 trình duyệt) | Câu đặc tả | Đề xuất phân loại | Issue HW02 |
|---|---|---|---|---|---|
| F-01 | TC-REG-01 | Vẫn ở `/register`, không chuyển tới `/login`; 0 request `POST /api/register` (mật khẩu hợp lệ `Abcdef1!` bị trang chặn trước khi gửi) | FR-01: Mật khẩu mạnh (8 ký tự, hoa, thường, số, ký tự đặc biệt); sau khi đăng ký thành công chuyển tới trang Đăng nhập | Hệ thống sai đặc tả | #42 |
| F-02 | TC-REG-108 | Như F-01, mật khẩu 9 ký tự `Abcdefg1!` | Như F-01 | Hệ thống sai đặc tả | #42 |
| F-03 | TC-REG-90 | 0 ô đi cùng nhãn "Xác nhận mật khẩu" (mong đợi 1) | FR-01: Phải có trường Xác nhận mật khẩu | Hệ thống sai đặc tả | #43 |
| F-04 | TC-REG-92 | Màu nền nút `rgb(239, 68, 68)`: Hue 0°, S 84,2% (đỏ), ngoài khoảng 200° đến 250° | FR-21: Nút hành động tích cực (Submit) dùng màu xanh dương | Hệ thống sai đặc tả | #52 |
| F-05 | TC-REG-93 | 0 thẻ `h1` trên trang (mong đợi 1); phần chữ không kiểm vì không có thẻ | FR-21: Mỗi trang có đúng 1 thẻ `<h1>` | Hệ thống sai đặc tả | #53 |
| F-06 | TC-REG-95 | Cả 3 nhãn "Họ Tên", "Email", "Mật khẩu" tìm thấy, nhưng không có `*` trong nhãn hay ngay cạnh nhãn (3 lỗi soft) | FR-22: Trường bắt buộc có ký hiệu `*` bên cạnh nhãn | Hệ thống sai đặc tả | #51 |
| F-07 | TC-REG-96 | Ô Email `type="text"` (mong đợi `email`); ô Mật khẩu đạt `type="password"` | FR-22: Trường Email phải dùng `type="email"` | Hệ thống sai đặc tả | #50 |

  Cả 7 lỗi khớp với kết quả chạy tay ở HW02 (`06_results.md`) và đã có issue từ HW02, nên ở bước `bugs` là bình luận vào issue cũ, không tạo issue mới (WORKFLOW mục 6).

## 3. Thay đổi so với bản AI

| Vị trí | Thay đổi | Loại | Loại lỗi script | Vì sao AI sai / bỏ sót | Lý do hoặc căn cứ |
|---|---|---|---|---|---|
| `tests/A_FR-01_DangKy/data/form_checklist.json:33` (TC-REG-95) | Thêm `"markerPlacement": "labelOrAdjacent"` vào `expected`, ghi cách hiểu vào `note` | Quyết định của SV | Dữ liệu | | Sinh viên chọn CH-data-01 b (2026-11-17); SRS FR-22: Ký hiệu `*` bên cạnh nhãn |
| `tests/A_FR-01_DangKy/data/focus_and_error_position.json:29` (TC-REG-97) | Thêm `"rule": "messageBottomAtOrAboveButtonTop"` vào `expected`, ghi cách so tọa độ vào `note` | Quyết định của SV | Dữ liệu | | Sinh viên chọn CH-data-02 a (2026-11-17); SRS FR-22: Thông báo lỗi xuất hiện trên nút submit, không phải bên dưới |
| `tests/A_FR-01_DangKy/data/focus_and_error_position.json:12` (TC-REG-94) | Thêm `"scope": "form"` cho liên kết "Đăng nhập" cuối thứ tự Tab, ghi rõ vào `note` | Quyết định của SV | Dữ liệu | | Sinh viên chọn CH-data-03 a (2026-11-17); trang có thêm liên kết "Đăng nhập" trên thanh điều hướng (HW02 `06_results.md`, TC-REG-94) |
| ★ `tests/support/pages/fieldByLabel.ts:13` (P1, dùng cho P1 đến P5) | `scope.locator('div').filter({ has: <label khớp> }).locator('input')` → `scope.locator('label').filter({ hasText }).locator('xpath=..').locator('input')`: Đi từ nhãn lên phần tử cha trực tiếp rồi lấy ô, thay vì lọc mọi `div` có chứa nhãn | Sai | Selector dễ vỡ | Giới hạn model: AI đã đọc `Register.jsx` và thấy mỗi trường là một `div` riêng, nhưng không nghĩ tới `div` tổ tiên khác cũng chứa nhãn; với DOM hiện tại locator cũ vẫn đúng nên kiểm tĩnh không lộ ra | Sinh viên tự thấy khi đọc bản AI P1 (2026-11-18). AI kiểm khi sinh viên nhờ, trên HTML dựng bằng `page.setContent` (Chrome): Form có `div` bọc chung 3 trường thì locator cũ khớp 3 ô (lỗi strict mode khi `fill`), locator mới khớp 1; form hiện tại và ô nằm trong `div` con của khối trường: Cả hai khớp 1. DOM EShop hiện tại không đổi kết quả, không đổi ý nghĩa test |
| `tests/support/pages/fieldByLabel.ts:10`, `tests/support/pages/RegisterPage.ts:24` (P1, dùng cho P1 đến P5) | `labelPattern` cờ `'iu'` → `'u'` (so nhãn đúng chữ hoa thường); nút `getByRole('button', { name: 'Đăng Ký' })` → thêm `exact: true` | Quyết định của SV | Selector dễ vỡ | | Sinh viên sửa lại quyết định về chữ hoa thường (2026-11-18 00:20): Giữ tên theo đặc tả, không để locator che lệch đặc tả (CH-script-04 a). Bản AI làm đúng ghi chú cũ của sinh viên ở `02_review.md` mục 1 (GĐ-script-01). Snapshot `/register` khớp đúng chữ với đặc tả nên kết quả hiện tại không đổi |
| ★ `tests/support/pages/RegisterPage.ts:77` (`recordTexts`, P3, dùng cho P3 và TC-REG-97 ở P5) | Thêm `if (typeof el.checkVisibility === 'function' && !el.checkVisibility()) return;`: Chỉ ghi chữ đang hiển thị, cùng điều kiện với `newTexts` | Sai | Assertion yếu / thiếu | Giới hạn model: AI thêm lọc hiển thị vào `newTexts` mà không áp cùng điều kiện cho `recordTexts`, nên "chữ mới" thành "chữ chưa từng có trong DOM" thay vì "chữ mới hiển thị"; với DOM hiện tại (khung lỗi chỉ được tạo khi có lỗi) không lộ ra | Sinh viên tự thấy khi đọc bản AI P3 (2026-11-18). AI kiểm khi sinh viên nhờ, trên HTML dựng bằng `page.setContent` (Chrome): Khung thông báo có sẵn nhưng ẩn, bấm mới hiện thì bản AI trả `[]` (test sẽ báo nhầm "không có thông báo"), bản sửa tìm được thông báo; khung tạo mới khi bấm: Cả hai tìm được. Kết quả trên EShop hiện tại không đổi |

## 4. Chỗ sửa sẽ kể trong video

Chưa có (bước `review`).
