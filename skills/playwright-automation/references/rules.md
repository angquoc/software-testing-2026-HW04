# Quy tắc chung

Đây là mặc định của skill. Nếu dự án có tài liệu quy trình riêng (ví dụ `WORKFLOW.md`), tài liệu đó ưu tiên hơn.

## Mục lục

1. Nguồn được đọc và không được đọc
2. Oracle và selector
3. Khi thiếu thông tin
4. Thư mục, tên file và mã
5. Bản AI trong `ai_raw/`
6. Bản review và bảng "Thay đổi so với bản AI"
7. Chạy thử và chạy chính thức
8. Commit
9. Định dạng văn bản
10. Rà bước trước

---

## 1. Nguồn được đọc và không được đọc

| Được đọc | Không được đọc |
|---|---|
| Đề bài, tài liệu quy trình và README của dự án | Mã nguồn backend của hệ thống được test |
| Đặc tả của hệ thống (SRS, đặc tả API nếu dự án cho) | Prompt log, ghi chú cá nhân của sinh viên (nếu dự án nêu tên) |
| Test case thủ công đã chốt của **feature đang làm** và bug đã báo của feature đó | Test case, kết quả của feature khác (trừ khi sinh viên cho phép) |
| DOM của trang và mã nguồn frontend, **chỉ để lấy selector, khi dự án cho phép** | Log phiên AI (ví dụ file `.jsonl`) |
| Chính skill này; file trong thư mục tài liệu và thư mục script của feature; `tests/support/`, `playwright.config.ts` | Mọi file dự án ghi là cấm |
| `run`: `results.json`, ảnh, trace của lần chạy | |
| `bugs`: README và template issue của repo nhóm; issue trên repo nhóm (đọc bằng `gh`) | |

Liệt kê thư mục để biết tên file không phải là đọc nội dung, nhưng không mở file bị cấm dù tên có vẻ hữu ích.

## 2. Oracle và selector

- **Kết quả mong đợi** (trong file dữ liệu và trong assertion) lấy từ đặc tả và test case đã chốt. Mỗi kết quả mong đợi truy được về câu đặc tả hoặc mã test case.
- **Không** lấy kết quả mong đợi từ hành vi hiện tại của hệ thống, từ snapshot DOM, hay từ mã nguồn. Ví dụ: Snapshot cho thấy nút có chữ "Thêm" thì được dùng để **tìm** nút, nhưng câu thông báo sau khi thêm phải lấy từ đặc tả; đặc tả không ghi nguyên văn câu thông báo thì assertion không so nguyên văn (mục "Assertion khi đặc tả không ghi nguyên văn" ở `playwright-patterns.md`) và ghi câu hỏi mở.
- Test fail vì hệ thống sai đặc tả là kết quả đúng của test. **Không** sửa assertion, dữ liệu, hay thêm `test.fail()` / `test.skip()` để suite "xanh". Chỉ dùng `test.fail()` khi sinh viên quyết định và ghi lý do (số issue) ngay trong code.
- Selector: Theo thứ tự ưu tiên ở `playwright-patterns.md`. Thông tin để chọn selector lấy từ snapshot DOM, codegen, inspector hoặc mã nguồn frontend **khi dự án cho phép**; nếu không được phép thì chỉ dùng ảnh và mô tả của sinh viên.

## 3. Khi thiếu thông tin

- Không biết phần tử trên trang trông thế nào: Xin phép chạy `scripts/aria_snapshot.mjs` (nếu dự án cho đọc DOM), hoặc nhờ sinh viên chạy codegen / chụp ảnh.
- Đặc tả không nói: Ghi thành câu hỏi mở có phương án. Không tự chọn.
- Dữ liệu cần cho một test case không có sẵn (ví dụ coupon hết hạn, giỏ hàng có sẵn hàng): Hỏi sinh viên cách tạo (qua UI, qua API, reset DB với dữ liệu mẫu); không tự giả định dữ liệu có sẵn.
- Không bù chỗ thiếu bằng cách đọc file bị cấm, hay đoán rồi viết như thể đã biết.

## 4. Thư mục, tên file và mã

```
features/<feature>/
├── 01_selected_tc.md        select: Test case chọn, kế hoạch sinh script, TC không tự động hóa được
├── 02_review.md             data (mục dữ liệu) và review (mục script): Bảng "Thay đổi so với bản AI"
├── 03_results.md            run: Kết quả chính thức, phân loại test fail; bugs điền cột issue
├── 04_gap.md                gap
└── ai_raw/
    ├── select.md
    ├── data.md
    ├── script_01_<nội dung>.md ... script_0n_<nội dung>.md
    └── gap.md
tests/
├── <feature>/
│   ├── <nội dung>.spec.ts   Mỗi phần trong kế hoạch sinh script là một file spec (hoặc một nhóm test trong file)
│   └── data/<nội dung>.json | .csv
└── support/                 fixtures.ts, runInfo.ts, urls.ts, data.ts, phần dùng chung (page object nếu dùng POM)
reports/<feature>/<chrome|edge|firefox>/   index.html + results.json của lần chạy chính thức
bugs/bug_report.md, bugs/screenshots/
```

| Mã | Ý nghĩa | Bước tạo | Ví dụ |
|---|---|---|---|
| Mã test case gốc | Giữ nguyên mã của bộ test case thủ công | (có sẵn) | `TC-REG-07` |
| `P<n>` | Phần trong kế hoạch sinh script | `select` | `P2` |
| `CH-<bước>-nn` | Câu hỏi mở cho sinh viên. Tên bước nằm trong mã để người đọc biết câu trả lời thuộc bước nào; mỗi bước đánh số lại từ `01`, riêng bước `script` đánh số nối tiếp qua các phần. Nhắc lại câu hỏi của bước khác thì ghi đủ mã. File đã giao trước khi có quy ước này giữ mã cũ `CH-nn` | Mọi bước | `CH-select-02`, `CH-data-03` |
| `GĐ-nn` | Giả định của AI | Mọi bước | `GĐ-02` |
| `F-nn` | Test fail trong lần chạy chính thức | `run` | `F-04` |

Tên test: `<mã TC>: <mô tả tiếng Anh>`, ví dụ `TC-REG-07: rejects password shorter than 8 characters`. Mã TC đứng đầu để report, `results.json` và bug report đối chiếu được.

## 5. Bản AI trong `ai_raw/`

- Đầu file theo `assets/templates/ai_raw_header.md`: Bước, thời gian tạo, công cụ và model, căn cứ (file đã đọc, snapshot đã dùng).
- Code nằm trong khối code; ngay trước mỗi khối là dòng `File: \`<đường dẫn trong dự án>\``. Ở commit bản AI, file trong `tests/` phải **giống hệt** khối code (`check_automation.py same`).
- Kiểm tĩnh trước khi giao (`tsc`, `check_automation.py`) được phép; lỗi tĩnh đã sửa trước khi giao ghi ở đầu file ("Đã sửa trước khi giao: ..."). **Không** chạy trên giao diện rồi sửa trước khi giao. Nếu sinh viên cho phép, được kiểm riêng locator hay hàm dùng chung trên HTML dựng tại chỗ (`page.setContent`) hoặc bằng `node -e`, không mở hệ thống đang test; ghi ở đầu file `ai_raw/` đã kiểm gì, kết quả, và sửa gì nếu có ("Đã sửa trước khi giao").
- Không chép prompt vào file (prompt đã có trong prompt log).
- Sau khi giao, không sửa, không ghi đè. Lỡ sửa thì khôi phục bằng `git checkout -- <file>`.
- Bản viết lại `_v2`, `_v3`: Ghi lần sửa, thời gian, lý do, bản trước. File trong `tests/` lúc đó được thay bằng code của bản viết lại (commit riêng, "AI revision n").

## 6. Bản review và bảng "Thay đổi so với bản AI"

- Bản review là bản đầy đủ của bước, không chỉ phần sửa. `02_review.md` có mục dữ liệu (bước `data`) và mục script (bước `review`), một bảng thay đổi chung hoặc mỗi mục một bảng.
- Bảng theo `assets/templates/changes_table.md` (khớp `WORKFLOW.md` nếu dự án có). Cột "Loại": `Sai`, `Thiếu`, `Thừa`, `Mơ hồ`, `Quyết định của SV`. Cột "Loại lỗi script": `Selector dễ vỡ`, `Assertion yếu / thiếu`, `Thiếu edge case`, `Wait gây flaky`, `Dữ liệu`, `Khác`. Cột "Vì sao AI sai / bỏ sót" bắt đầu bằng `Prompt`, `Giới hạn model` hoặc `Đặc thù feature` (bỏ trống chỉ khi Loại là `Quyết định của SV`).
- Cột lý do ghi **ai phát hiện** (sinh viên tự thấy, sinh viên thấy khi chạy thử, AI chỉ ra khi sinh viên hỏi), theo thông tin sinh viên cung cấp; không rõ thì hỏi.
- Ghi đủ mọi thay đổi về nội dung; không ghi thay đổi thuần hình thức (đổi tên biến, định dạng).
- Sửa bản review sau đó: Ghi thời gian cập nhật ở đầu file và thêm dòng vào bảng.

## 7. Chạy thử và chạy chính thức

| | Chạy thử (gỡ lỗi) | Chạy chính thức |
|---|---|---|
| Ai chạy | AI hoặc sinh viên | **Sinh viên** |
| Lệnh | `npx playwright test tests/<feature>/ --project=<trình duyệt>` | `node tools/run.mjs <feature> all` |
| Report | `playwright-report/` (bị `.gitignore` chặn) | `reports/<feature>/<trình duyệt>/` |
| Dùng cho | Bước `review`, `maintain` | Nộp bài, `03_results.md`, bug |

- Trước mỗi lần chạy chính thức: Server đang chạy, dữ liệu reset theo cách dự án chốt, không còn `test.only`.
- AI không sửa, không xóa, không tạo file trong `reports/`.

## 8. Commit

- Theo quy ước của dự án. Mặc định: `[<phạm vi>][<bước>] <Verb> <nội dung>`, tiếng Anh, động từ mệnh lệnh, không dấu chấm cuối.
- Tách commit để lịch sử cho thấy phần AI viết và phần sinh viên sửa: Bản AI một commit (đuôi `(AI draft)`), bản review / sửa một commit riêng; bước `script` mỗi phần một commit.
- Trước khi sửa bất kỳ file nào của bản AI (file trong `tests/` vừa chép từ `ai_raw/`) theo câu trả lời hoặc nhận xét của sinh viên: Kiểm bản AI đã commit chưa (`git status --short <file>`, `git log -1 -- <file>`). Chưa commit thì **dừng**, đưa lệnh commit bản AI, chờ sinh viên commit xong rồi mới sửa; không sửa trước rồi đưa file về bản AI sau.
- AI không tự commit; đưa message và lệnh `git add` / `git commit` cho sinh viên.

## 9. Định dạng văn bản

- Tiếng Việt; giữ nguyên tên trường, nút, thông báo như trên giao diện; tên test, tên biến, commit bằng tiếng Anh.
- Không dùng dấu "—" và dấu "·".
- Chữ cái đầu tiên sau dấu ":" viết hoa (trừ code, tên label, đường dẫn, giờ).

## 10. Rà bước trước

Khi bắt đầu từ giữa chừng hoặc trước bước `run`, kiểm:

- Mỗi test case trong `01_selected_tc.md` có dữ liệu và có test tương ứng (mã TC ở đầu tên test); không có test thừa.
- Dữ liệu không nằm trong spec; ≥ 3 kiểu assertion theo phạm vi dự án chốt; không `waitForTimeout`, không `test.only`.
- Mọi spec import `test` từ `tests/support/fixtures`.
- `02_review.md` có bảng thay đổi đúng cột; mỗi dòng Sai / Thiếu / Thừa / Mơ hồ có lý do AI sai.
- Báo những gì thiếu, không tự viết lại.
