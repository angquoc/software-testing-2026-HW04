# Bước `review`: Sinh viên review và sửa script AI

**Mục tiêu:** Script cuối cùng đúng với test case và đặc tả, bền trên 3 trình duyệt; mọi chỗ AI sai / bỏ sót được ghi lại với lý do (đề yêu cầu: Selector dễ vỡ, assertion yếu hoặc thiếu, thiếu edge case, wait gây flaky, và vì sao: Prompt, giới hạn model, đặc thù feature).

**Đầu ra:** Spec và dữ liệu đã sửa; mục "Script" trong `02_review.md` có bảng "Thay đổi so với bản AI". Mẫu: `assets/templates/review.md`.

Bước này là của **sinh viên**. AI hỗ trợ khi được nhờ: Chạy thử, đọc lỗi, đề xuất sửa, sửa theo quyết định của sinh viên, soạn file.

## Hỏi trước khi làm

- Sinh viên muốn tự đọc trước rồi nhờ AI chạy thử, hay muốn AI chạy thử trước để có danh sách lỗi?
- Sau khi sinh viên tự review xong, có muốn AI chỉ thêm chỗ nghi ngờ không (những chỗ AI chỉ ra được ghi "AI chỉ ra khi SV hỏi" ở cột lý do)?

## Vòng chạy thử

1. Chạy thử từng trình duyệt: `npx playwright test tests/<feature>/ --project=chrome` (rồi `edge`, `firefox`). Report thử ở `playwright-report/`.
2. Mỗi test fail: Đọc thông báo lỗi, ảnh, trace (`npx playwright show-trace <trace.zip>`). Phân loại:
   - **Lỗi script**: Selector không tìm thấy / khớp nhiều phần tử, chờ sai, dữ liệu sai, assertion sai so với đặc tả.
   - **Hệ thống sai đặc tả**: Assertion đúng với đặc tả mà hệ thống làm khác. **Giữ nguyên test**, ghi để báo bug ở bước `bugs`.
   - **Chưa rõ**: Đặc tả mơ hồ; ghi câu hỏi cho sinh viên.
3. Đề xuất sửa cho từng lỗi script, kèm loại lỗi script. Sinh viên duyệt; sửa; chạy lại.
4. Chạy lại test vừa sửa vài lần (`--repeat-each=3`) trên trình duyệt từng fail để bắt flaky.

## Đọc kỹ cả test qua

Test qua chưa chắc đúng. Với từng test, sinh viên (hoặc AI khi được nhờ) kiểm:

- Assertion có kiểm **đủ** kết quả mong đợi của test case gốc không, hay chỉ kiểm phần dễ (ví dụ chỉ kiểm có thông báo, không kiểm không chuyển trang)?
- Assertion có thể qua cả khi hệ thống sai không (ví dụ `toBeVisible` trên phần tử luôn có sẵn; `toContainText('')`)? Thử làm hỏng có chủ đích: Đổi dữ liệu sang giá trị phải fail và xem test có fail không.
- Selector có phụ thuộc thứ tự, class sinh tự động, chữ dễ đổi không?
- Hộp thoại có bị Playwright tự đóng mà không kiểm chữ không?
- Edge case của test case gốc (biên, rỗng, khoảng trắng, ký tự đặc biệt, tiếng Việt có dấu) có trong dữ liệu không?

## Ghi bảng thay đổi

Mỗi thay đổi về nội dung một dòng (`assets/templates/changes_table.md`). Ghi ngay khi sửa, không đợi cuối bước. Cột lý do ghi rõ: Ai phát hiện, phát hiện khi nào (đọc code, chạy thử trình duyệt nào, thử làm hỏng có chủ đích).

Đánh dấu 1 đến 3 thay đổi đáng kể nhất (`★`) để kể trong video demo (đề yêu cầu kể ít nhất một chỗ đã sửa).

## Tự kiểm

- `npx tsc --noEmit`; `check_automation.py spec tests/<feature>/*.spec.ts --min-assert 3`; `check_automation.py changes features/<feature>/02_review.md`.
- Mọi test fail còn lại đều là "hệ thống sai đặc tả" có ghi chú, hoặc đã có quyết định của sinh viên.
- Checklist bước `review` trong `lessons.md`.

**Dừng** sau mỗi lượt sửa. Mỗi nhóm sửa một commit, ví dụ `[A-FR01][review] Replace brittle CSS selectors with role locators`.
