# A: FR-01 Đăng ký tài khoản gap: Gap analysis script AI sinh (bản AI)

- Bước: `[A-FR01][gap]`
- Thời gian tạo: 2026-11-18 01:55 (+07:00)
- Công cụ: Claude Code (VS Code extension), model Claude Opus 5.5 (`claude-opus-5-5`), skill `playwright-automation`
- Căn cứ: Bảng "Thay đổi so với bản AI" của `01_selected_tc.md` (mục 6) và `02_review.md` (mục 3), đếm bằng `check_automation.py changes --stats` (2026-11-18 01:53); `02_review.md` mục 2 (lượt chạy thử T1 đến T3, thử làm hỏng M1 đến M8); `03_results.md` (lần chạy chính thức); `01_selected_tc.md` mục 4 (test case không tự động hóa được); đầu các file `ai_raw/` (giả định, câu hỏi, "Đã sửa trước khi giao"); `bugs/bug_report.md`
- Đã sửa trước khi giao: Mục 5 ý 6 viết sai "bắt được 2 lỗi"; sửa thành "xác nhận 2 lỗi do sinh viên phát hiện" (AI tự đọc lại trước khi giao)

## 1. Số liệu

Kết quả nguyên văn của `check_automation.py changes --stats features/A_FR-01_DangKy/01_selected_tc.md features/A_FR-01_DangKy/02_review.md` (cột "(trống)" là các dòng Loại "Quyết định của SV", không có cột "Vì sao"):

| Loại lỗi script | Prompt | Giới hạn model | Đặc thù feature | (trống) | Tổng |
|---|---|---|---|---|---|
| Assertion yếu / thiếu | 0 | 2 | 0 | 0 | 2 |
| Dữ liệu | 0 | 0 | 0 | 3 | 3 |
| Khác | 0 | 0 | 0 | 1 | 1 |
| Selector dễ vỡ | 0 | 1 | 0 | 1 | 2 |

Theo Loại: Quyết định của SV 5, Sai 2, Mơ hồ 1. Tổng 8 dòng.

Tách theo mẫu `gap.md` (chỉ các dòng là lỗi của AI, tức Loại khác "Quyết định của SV"; lấy từ cùng bảng trên, cột "(trống)" bỏ ra):

| Loại lỗi script | Prompt | Giới hạn model | Đặc thù feature | Tổng |
|---|---|---|---|---|
| Selector dễ vỡ | 0 | 1 | 0 | 1 |
| Assertion yếu / thiếu | 0 | 2 | 0 | 2 |
| Thiếu edge case | 0 | 0 | 0 | 0 |
| Wait gây flaky | 0 | 0 | 0 | 0 |
| Dữ liệu | 0 | 0 | 0 | 0 |
| Khác | 0 | 0 | 0 | 0 |
| **Tổng** | **0** | **3** | **0** | **3** |

- 3 lỗi của AI (Sai 2, Mơ hồ 1), cả 3 do giới hạn model; cả 3 do **sinh viên tự thấy khi đọc bản AI**, trước khi chạy trên giao diện thật; AI kiểm lại 2 trong 3 lỗi trên HTML dựng bằng `page.setContent` khi sinh viên nhờ.
- 5 dòng "Quyết định của SV": 3 dòng ghi quyết định CH-data-01 đến 03 vào dữ liệu, 1 dòng sinh viên sửa lại quyết định chữ hoa thường (CH-script-04), 1 dòng đưa giới hạn quan sát vào report (CH-review-01).
- Lỗi lọt qua review, lộ ra ở lần chạy chính thức: Không có. `03_results.md` có 7 test fail (F-01 đến F-07), cả 7 loại Bug, không có loại Script hay Flaky.

## 2. AI sai hoặc bỏ sót gì, vì sao

### 2.1 Áp điều kiện không nhất quán giữa hai chỗ đi cặp (2 trên 3 lỗi)

Hai lỗi cùng dạng: AI đã biết một điều kiện và áp nó ở một chỗ, nhưng bỏ sót chỗ đi cặp với nó.

- Ví dụ 1 (`01_selected_tc.md` mục 6, ★, Mơ hồ, Assertion yếu / thiếu): TC-REG-95, kết quả mong đợi "Nhãn Họ Tên, Email, Mật khẩu (và Xác nhận mật khẩu) có dấu `*`". AI đã biết form thiếu ô Xác nhận mật khẩu (#43) và đã hỏi CH-select-06 cho **bước nhập** ô đó, nhưng không áp cùng ý cho **nhãn** của ô ở TC-REG-95. Sửa: Chỉ kiểm dấu `*` trên 3 nhãn đang có; thiếu ô đã đo ở TC-REG-90.
- Ví dụ 2 (`02_review.md` mục 3, ★, Sai, Assertion yếu / thiếu): `tests/support/pages/RegisterPage.ts:77`. AI lọc phần tử đang hiển thị (`checkVisibility()`) ở `newTexts()` nhưng không lọc ở `recordTexts()`. Hệ quả: Khung thông báo có sẵn nhưng ẩn, bấm mới hiện thì không được tính là chữ mới, test báo nhầm "không có thông báo". Sửa: Thêm cùng điều kiện vào `recordTexts()`.
- Vì sao: Giới hạn model. AI có đủ thông tin (đã tự viết điều kiện ở chỗ thứ nhất) nhưng không rà chỗ đi cặp. Kiểm tĩnh (`tsc`, `check_automation.py`) không bắt được, và với DOM hiện tại của EShop cả hai lỗi không đổi kết quả, nên chạy thử cũng không lộ ra.
- Lần sau: Thêm bước tự kiểm "Khi thêm một điều kiện hay ngoại lệ, rà mọi chỗ đi cặp với nó (ghi / đọc, ô / nhãn của ô, trước / sau khi bấm)".

### 2.2 Selector lọc tổ tiên khớp cả phần tử bọc ngoài (1 trên 3 lỗi)

- Ví dụ (`02_review.md` mục 3, ★, Sai, Selector dễ vỡ): `tests/support/pages/fieldByLabel.ts:13`. Trước: `scope.locator('div').filter({ has: <nhãn> }).locator('input')`; sau: `scope.locator('label').filter({ hasText }).locator('xpath=..').locator('input')`. Với một `div` bọc chung các trường, `div` đó cũng "có" nhãn, locator khớp 3 ô và `fill` báo lỗi strict mode (kiểm trên HTML dựng: Cũ 3 ô, mới 1 ô).
- Vì sao: Giới hạn model. AI đã đọc `Register.jsx`, thấy mỗi trường là một `div` riêng, và viết selector chỉ đúng với cấu trúc hiện tại; không nghĩ tới `filter({ has })` khớp **mọi** tổ tiên chứa phần tử con.
- Lần sau: Khi tìm phần tử theo phần tử neo (nhãn), đi từ phần tử neo lên cha trực tiếp thay vì lọc tổ tiên bằng `has`; nếu buộc phải lọc tổ tiên thì kiểm locator khớp đúng 1 phần tử trên một cấu trúc có lớp bọc.

### 2.3 Điểm AI tự sửa trước khi giao (không có trong bảng thay đổi)

- `ai_raw/select.md`: Dòng "Tổng" dưới bảng 96 test case đếm tay sai (Có 59, Không 21); đếm lại bằng script trước khi giao (Có 69, Không 20). Ghi ở "Đã sửa trước khi giao".
- `ai_raw/script_05_focus_and_error_position.md`: AI tự đọc lại và viết lại phép chờ thông báo của TC-REG-97 (biểu thức `.not.toEqual(expected.messageShown ? [] : [...])` sai ý khi `messageShown` là `false`) trước khi kiểm tĩnh. Ghi ở "Đã sửa trước khi giao".

Hai điểm này không tính vào số liệu mục 1 vì không qua tay sinh viên, nhưng cùng cho thấy: Số liệu đếm tay và biểu thức rẽ nhánh viết vội là chỗ AI hay sai.

### 2.4 Giới hạn quan sát, không phải lỗi script

- Thử làm hỏng M4 (`02_review.md` mục 2): Đổi TC-REG-107 sang mật khẩu hợp lệ mà test vẫn qua, vì #42 làm trang báo "mật khẩu" với mọi mật khẩu. AI đã dự đoán điều này từ bước `select` (mục "Bug #42 che...", ý 3) và ở GĐ-script-14, nhưng chỉ ghi trong `ai_raw/`, không đưa vào report. Sinh viên chọn đưa thành annotation "Giới hạn quan sát" (CH-review-01 b; dòng "Quyết định của SV" ở mục 3 của `02_review.md`).
- Lần sau: Giả định nào nói "test qua không chứng minh được ..." thì hỏi ngay ở bước `script` có đưa thành annotation trong report không.

## 3. AI làm tốt

- Lượt chạy thử đầu tiên trên giao diện thật (T1 đến T3, `02_review.md` mục 2) không có lỗi script nào: 14 test, không lỗi selector, không strict mode, không kẹt hết thời gian, kết quả giống hệt nhau trên Chrome, Edge, Firefox; 7 test fail đều đúng bug đã có từ HW02. Lần chạy chính thức (`03_results.md`) cho đúng kết quả đó.
- Thử làm hỏng có chủ đích: 7 trên 8 lần cho kết quả đúng như mong đợi; lần còn lại (M4) là giới hạn AI đã dự đoán trước (mục 2.4). M1 cho thấy bằng chứng phụ AI đề xuất ở P2 (sự kiện `invalid`, CH-script-05) là cần thiết: Không có nó, TC-REG-30 sẽ qua nhầm khi ô Họ Tên không trống, vì #42 cũng chặn gửi.
- AI chỉ ra trước các điểm dễ qua nhầm hoặc fail nhầm vì bug khác, và hỏi thay vì tự chọn: #42 che lỗi các trường khác (bước `select`, CH-select-07), nhãn "Username" của trang Đăng nhập (CH-script-01), trang Đăng nhập có "Quên mật khẩu?" chứa "mật khẩu" (GĐ-script-11).

## 4. Test case không tự động hóa được

Giữ nguyên bảng `01_selected_tc.md` mục 4; bước `review` và `run` không phát hiện thêm test case nào không tự động hóa được.

| Mã | Lý do | Cách kiểm thay thế |
|---|---|---|
| TC-REG-70 đến TC-REG-77, TC-REG-80, TC-REG-82, TC-REG-129, TC-REG-130 | Chỉ kiểm qua API `POST /api/register`; dự án chốt chỉ tự động hóa qua giao diện web (đề HW04: "automate the web frontend") | Kết quả chạy API của HW02 (`06_results.md` nhóm E); bug #44 đến #49 đã có issue |
| TC-REG-81 | Bước 1 gửi API (đã chốt bỏ); bước 2 qua giao diện bị #42 che | Như dòng trên |
| TC-REG-78 | Bước 1 gửi API; làm bước 1 qua giao diện thì #42 chặn tạo tài khoản, bước 2 (so trùng) không còn ý nghĩa | Chạy tay sau khi #42 được sửa |
| TC-REG-79 | Như TC-REG-78; thêm ràng buộc chạy cuối cùng và reset DB ngay sau đó, không giữ được trong một lượt chạy chung | Chạy tay riêng như HW02 |
| TC-REG-59 đến TC-REG-62 | Form không có ô Xác nhận mật khẩu (#43): Không thực hiện được bước nhập; chỉ lặp lại TC-REG-90 | TC-REG-90 giữ regression cho #43; chạy lại khi có ô |
| TC-REG-91 | "Toàn bộ chữ là tiếng Việt" cần người đọc đánh giá; bong bóng của trình duyệt không nằm trong DOM | Kiểm tay; ảnh HW02 và issue #54 |

Ghi thêm (không phải test case): Phần kiểm form đăng nhập của TC-REG-01, TC-REG-108 chưa từng chạy trên giao diện thật (bị bỏ qua vì #42 không cho tới `/login`), nên selector của `LoginPage` chưa được kiểm chứng.

## 5. Đề xuất bổ sung skill

Sinh viên quyết định; AI không tự sửa skill.

1. Checklist bước `script` trong `lessons.md`: "Khi thêm điều kiện hay ngoại lệ cho một chỗ, rà mọi chỗ đi cặp với nó (hàm ghi / hàm đọc, ô / nhãn của ô, trước / sau khi bấm)" (mục 2.1, 2 lỗi FR-01).
2. Bảng lỗi hay gặp trong `lessons.md`: "`locator('div').filter({ has })` khớp mọi tổ tiên chứa phần tử con; div bọc chung làm locator khớp nhiều ô" và cách xử lý "đi từ phần tử neo lên cha trực tiếp" (mục 2.2).
3. Checklist bước `select` trong `lessons.md`: Khi một bug đã biết làm thiếu phần tử (ô, nút), rà cả kết quả mong đợi liên quan tới nhãn, thứ tự Tab, dấu `*` của phần tử đó, không chỉ bước nhập (mục 2.1, ví dụ 1).
4. `step-script.md`, mục "Hỏi trước khi viết": Hỏi cách so chữ của nhãn, nút (đúng chữ hoa thường theo đặc tả hay không phân biệt) ngay trước phần đầu, vì so không phân biệt hoa thường có thể che lệch đặc tả (CH-script-04, sinh viên đổi quyết định giữa chừng).
5. `step-script.md`: Giả định dạng "test qua không chứng minh được ..." thì hỏi luôn có đưa thành annotation trong report không (mục 2.4, CH-review-01).
6. Câu hỏi cho sinh viên (không tự chốt): Có cho phép AI kiểm locator hay hàm dùng chung trên HTML dựng bằng `page.setContent` **trước khi giao** bản AI không. Hiện quy tắc chỉ cho kiểm tĩnh; ở FR-01 cách kiểm này chỉ dùng ở bước `review`, để xác nhận 2 lỗi do sinh viên phát hiện (`fieldByLabel`, `recordTexts`; mục 2.1 ví dụ 2 và mục 2.2). Đây là chạy trên trình duyệt nhưng không chạy trên giao diện EShop.
