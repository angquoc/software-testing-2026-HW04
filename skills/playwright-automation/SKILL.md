---
name: playwright-automation
description: Chuyển test case thủ công thành script Playwright TypeScript data-driven chạy trên 3 trình duyệt và bảo trì script, đi từng bước setup (dự án có HTML report "Run by: <MSSV>" + timestamp ISO), select (chọn ≥ 12 test case, test case không tự động hóa được), data (file .json / .csv có kết quả mong đợi theo đặc tả), script (sinh spec từng phần, ≥ 3 kiểu assertion), review (sinh viên sửa selector, assertion, edge case, wait; bảng "Thay đổi so với bản AI"), run (sinh viên chạy chính thức, AI tóm tắt results.json), bugs (GitHub Issues có ảnh), gap (AI sai gì, vì sao), maintain. Lưu nguyên văn bản AI vào ai_raw/, dừng chờ sinh viên review. Dùng khi người dùng nói "automation test", "viết script Playwright", "data-driven", "chạy đa trình duyệt", "chuyển test case thành script", "review script AI sinh", "sửa script flaky", "làm bước tiếp theo" cho thư mục feature automation. Không dùng để thiết kế test case mới; không tạo hay sửa HTML report.
---

# Tự động hóa test case bằng Playwright (data-driven, đa trình duyệt)

Skill này dẫn AI đi qua việc chuyển test case thủ công thành script tự động **từng bước một**, như một trợ lý có kỷ luật chứ không phải máy sinh script một phát. Sinh viên review và quyết định ở mọi bước, và chịu trách nhiệm về script cuối cùng; mọi output của AI được giữ nguyên văn để làm bằng chứng cho phần "AI sai / bỏ sót gì và vì sao", AI Critique và AI Audit Report.

Skill được viết trước khi làm bài (HW04, EShop) từ đề bài, slide Automation & Regression và kinh nghiệm chung về Playwright; mục "Rút từ lần làm thật" trong `references/lessons.md` được bổ sung sau mỗi feature làm thật. Đọc `references/lessons.md` trước khi giao bất kỳ bước nào.

## Phạm vi

| Bước | Nội dung | Ai làm |
|---|---|---|
| `setup` | Dựng (hoặc kiểm) dự án Playwright: 3 project trình duyệt, HTML report có "Run by" + ISO, fixture, script chạy | AI dựng, sinh viên chạy thử |
| `select` | Chọn ≥ 12 test case, chia phần sinh script, ghi test case không tự động hóa được | AI đề xuất, sinh viên chốt |
| `data` | Sinh file dữ liệu: Input và kết quả mong đợi theo đặc tả | AI, sinh viên review |
| `script` | Sinh spec data-driven, **mỗi lượt một phần** | AI |
| `review` | Sửa selector, assertion, edge case, wait; bảng "Thay đổi so với bản AI" | **Sinh viên** quyết; AI chạy thử, chỉ chỗ nghi ngờ khi được yêu cầu, soạn file |
| `run` | Lần chạy chính thức trên 3 trình duyệt; tóm tắt, phân loại test fail | **Sinh viên** chạy; AI tóm tắt từ `results.json`, sinh viên chốt |
| `bugs` | Bình luận issue cũ hoặc tạo issue mới có ảnh; bug report | AI đề xuất và soạn; sinh viên chốt và cho phép đăng |
| `gap` | Gap analysis; danh sách test case không tự động hóa được | AI đề xuất, sinh viên review |
| `maintain` | Sửa script khi giao diện, đặc tả hoặc dữ liệu đổi; thêm test case | AI đề xuất, sinh viên duyệt |

## Bước 0: Xác định ngữ cảnh (đầu mỗi phiên)

1. **Đọc quy trình của dự án.** Nếu dự án có `WORKFLOW.md`, đọc trước tiên. Quy tắc của dự án **ưu tiên hơn** mặc định của skill; chỗ nào dự án không nói thì dùng `references/rules.md`.
2. **Xác định**, hỏi người dùng nếu chưa rõ:
   - **Feature**: Mã, tên, nền tảng và URL; thư mục tài liệu (mặc định `features/<feature>/`) và thư mục script (mặc định `tests/<feature>/`). Làm cho feature khác với lần trước (ví dụ để demo skill) thì dùng thư mục do sinh viên chỉ định; **không ghi đè** file của lần làm khác, thấy thư mục đã có file thì hỏi.
   - Nguồn test case thủ công (ví dụ `05_final_tc.md` của bài trước) và mẫu mã test case (ví dụ `TC-REG-01`).
   - Đặc tả (oracle); tài khoản thử; cách reset dữ liệu.
   - Phạm vi được đọc: DOM, mã nguồn frontend để lấy selector (dự án quyết), file bị cấm.
   - Quyết định của dự án còn mở ảnh hưởng tới bước sắp làm (POM, cô lập dữ liệu, dùng API, phạm vi 3 kiểu assertion...). **Không tự chốt**; hỏi khi tới bước đó.
3. **Xác định bước hiện tại** từ các file:

   | Đã có | Bước tiếp theo |
   |---|---|
   | Chưa có `playwright.config.ts` hoặc `tests/support/fixtures.ts` | `setup` |
   | Chưa có `ai_raw/select.md` | `select` |
   | `ai_raw/select.md`, chưa có `01_selected_tc.md` | Chờ sinh viên chốt (`select` pha review) |
   | `01_selected_tc.md`, chưa có `ai_raw/data.md` | `data` |
   | `ai_raw/data.md`, file dữ liệu vẫn giống hệt bản AI (`check_automation.py same`) | Chờ sinh viên review dữ liệu |
   | Dữ liệu đã review, còn phần trong "Kế hoạch sinh script" chưa có `ai_raw/script_<phần>.md` | `script` (phần tiếp theo) |
   | Đủ các phần, chưa có `02_review.md` hoặc mục script trong đó còn trống | `review` |
   | `02_review.md` xong, chưa có `reports/<feature>/<trình duyệt>/` đủ 3 trình duyệt | `run` (chờ sinh viên chạy chính thức) |
   | Đủ report, chưa có `03_results.md` | `run` (tóm tắt) |
   | `03_results.md` có test fail do bug chưa có issue | `bugs` |
   | Chưa có `04_gap.md` | `gap` |

4. **Bắt đầu từ giữa chừng**: Rà các file đã có theo mục "Rà bước trước" ở `references/rules.md`, báo những gì thiếu. **Không tự viết lại**; chờ sinh viên quyết định.
5. **Nạp tài liệu:** Luôn đọc `references/rules.md` và `references/lessons.md`; đọc `references/step-<bước>.md` của bước sắp làm; bước `data`, `script`, `review`, `maintain` đọc thêm `references/playwright-patterns.md`.

## Quy tắc cứng

Chi tiết ở `references/rules.md`. Tóm tắt:

- **Oracle là đặc tả và test case đã chốt**, không phải hành vi hiện tại của hệ thống hay mã nguồn. Test fail vì hệ thống sai đặc tả là đúng; **không bao giờ** sửa assertion hay dữ liệu cho khớp với hành vi sai.
- **Selector** lấy từ DOM (snapshot bằng `scripts/aria_snapshot.mjs`, Playwright codegen, inspector) hoặc mã nguồn frontend **chỉ khi dự án cho phép**; không đọc mã nguồn backend.
- **Dữ liệu ở file riêng** (`.json` / `.csv`), script không chứa mảng hay object dữ liệu viết thẳng.
- **Mỗi lượt một bước** (bước `script`: Mỗi lượt một phần), xong thì dừng chờ sinh viên.
- **Không bao giờ sửa hay ghi đè file trong `ai_raw/`** sau khi đã giao. AI làm lại thì lưu file mới `_v2`, `_v3`, đầu file ghi lần sửa, thời gian, lý do.
- **Bản AI của code không được chạy thử rồi sửa trước khi giao.** Trước khi giao chỉ được kiểm tĩnh (`tsc`, `check_automation.py`) và sửa lỗi tĩnh, ghi rõ đã sửa gì ở đầu file `ai_raw/`. Chạy trên giao diện thật thuộc bước `review`, để lỗi của AI hiện ra trong bảng thay đổi.
- **HTML report và kết quả chạy chỉ đến từ lần chạy thật.** Lần chạy chính thức do sinh viên chạy. AI không tạo, không sửa file trong `reports/`; AI chỉ chạy thử để gỡ lỗi, report chạy thử để ngoài `reports/`.
- **Chỗ đặc tả không nói:** Ghi thành câu hỏi mở `CH-<bước>-nn` có phương án đánh chữ cái (`references/rules.md` mục 4). AI không tự chọn.
- **Đăng ra ngoài** (tạo issue, bình luận) chỉ làm khi sinh viên đã duyệt nội dung và cho phép rõ ràng; mặc định đưa lệnh để sinh viên chạy.
- **Bản review** có bảng "Thay đổi so với bản AI" (mẫu `assets/templates/changes_table.md`); ghi rõ ai phát hiện mỗi thay đổi, không đoán.
- **AI không tự commit.** Chỉ đưa commit message và lệnh.
- **Văn bản** tiếng Việt, giữ nguyên tên trường, nút, thông báo như trên giao diện; tên test và commit tiếng Anh; không dùng dấu "—" và "·"; chữ đầu sau dấu ":" viết hoa.

## Vòng lặp cho mỗi bước

**Pha A: Chuẩn bị**

1. Đọc bản review của **tất cả** các bước trước của feature: Quyết định đã chốt, giả định, ghi chú "để bước sau".
2. Xem mục "Hỏi trước khi viết" trong `references/step-<bước>.md`. Quyết định nào ảnh hưởng tới cấu trúc cả bản thì **hỏi trước khi viết** bản AI, vì `ai_raw/` không sửa được sau khi giao.

**Pha B: Viết bản AI**

3. Viết file `ai_raw/` theo mẫu `assets/templates/ai_raw_header.md`. Code nằm trong khối code, trước mỗi khối là dòng `File: \`<đường dẫn>\``. Chép đúng nguyên văn các khối code đó vào `tests/`.
4. **Tự kiểm** trước khi giao: `npx tsc --noEmit`, `scripts/check_automation.py` (mục Tài nguyên), sửa hết ERROR tĩnh; đi qua checklist của bước trong `references/lessons.md`.

**Pha C: Dừng**

5. Báo cho sinh viên: Tóm tắt ngắn, các câu hỏi cần quyết định, commit message cho bản AI. Dừng.

**Pha D: Viết bản review** (bước `select`, `data`, `gap`; bước `review` có quy trình riêng)

6. Nhận quyết định của sinh viên; kiểm mâu thuẫn với các bước trước; đổi lớn cấu trúc thì trình bày phương án và chờ duyệt.
7. Viết bản review đầy đủ, kết thúc bằng bảng "Thay đổi so với bản AI". Chạy lại script kiểm, đưa commit message. Dừng.

## Tóm tắt các bước

| Bước | Việc chính | Đầu ra | Hướng dẫn |
|---|---|---|---|
| `setup` | Kiểm hoặc dựng dự án từ `assets/project/`; chạy test mẫu trên 3 trình duyệt | `playwright.config.ts`, `tests/support/`, `tools/run.mjs` | `references/step-setup.md` |
| `select` | Bảng test case chọn, phân loại, khả năng tự động hóa; kế hoạch sinh script theo phần; câu hỏi mở | `ai_raw/select.md`, `01_selected_tc.md` | `references/step-select.md` |
| `data` | Schema dữ liệu, file dữ liệu, kết quả mong đợi trích đặc tả | `ai_raw/data.md`, `tests/<feature>/data/*` | `references/step-data.md` |
| `script` | Snapshot DOM (nếu được phép), sinh spec từng phần | `ai_raw/script_<phần>.md`, `tests/<feature>/*.spec.ts` | `references/step-script.md` |
| `review` | Sinh viên chạy thử và sửa; AI chạy thử khi được nhờ; bảng thay đổi | Spec, dữ liệu đã sửa, `02_review.md` | `references/step-review.md` |
| `run` | Checklist trước khi chạy; sinh viên chạy `tools/run.mjs`; AI tóm tắt bằng `summarize_results.py`; phân loại fail | `reports/<feature>/<trình duyệt>/`, `03_results.md` | `references/step-run.md` |
| `bugs` | Tìm issue cũ, bình luận hoặc tạo issue, chèn ảnh, bug report | `bugs/bug_report.md`, issue | `references/step-bugs.md` |
| `gap` | Gom bảng thay đổi theo loại lỗi và nguyên nhân; test case không tự động hóa được | `ai_raw/gap.md`, `04_gap.md` | `references/step-gap.md` |
| `maintain` | Phân tích nguyên nhân hỏng, đề xuất sửa nhỏ nhất, chạy lại | Spec, dữ liệu, dòng mới trong bảng thay đổi | `references/step-maintain.md` |

## Điểm dừng chờ sinh viên

- Trước khi viết bản AI của một bước, nếu có quyết định ảnh hưởng tới cấu trúc cả bản (POM, định dạng dữ liệu, cô lập dữ liệu, dùng API).
- `setup`: Sau khi dựng, chờ sinh viên chạy thử và xem report.
- `select`: Sau bản AI; sau bản review.
- `data`: Sau bản AI; sau bản review.
- `script`: Sau **mỗi phần**.
- `review`: Sau mỗi lượt chạy thử và đề xuất sửa; trước mỗi sửa đổi làm đổi ý nghĩa test case.
- `run`: Trước lần chạy chính thức (checklist); sau bản tóm tắt nháp (chờ sinh viên chốt phân loại).
- `bugs`: Sau bảng đề xuất; sau khi soạn nội dung; trước mỗi lệnh đăng ra ngoài.
- `gap`: Sau bản AI; sau bản review.
- Bất cứ lúc nào thiếu thông tin mà chỉ người dùng cung cấp được.

## Tài nguyên

- `references/rules.md`: Nguồn được đọc, oracle, `ai_raw/`, bản review, bảng thay đổi, mã và tên file, commit, định dạng, rà bước trước.
- `references/lessons.md`: Checklist tự kiểm theo bước; lỗi Playwright hay gặp; mục "Rút từ lần làm thật".
- `references/playwright-patterns.md`: Mẫu data-driven, đọc JSON / CSV, selector, các kiểu assertion, chờ đúng cách, hộp thoại, validation của trình duyệt, cô lập dữ liệu, POM.
- `references/step-*.md`: Hướng dẫn chi tiết từng bước, kèm "Hỏi trước khi viết".
- `assets/templates/`: `ai_raw_header.md`, `selected_tc.md`, `changes_table.md`, `review.md`, `results.md`, `gap.md`, `bug_report.md`.
- `assets/project/`: Khung dự án (config, fixture, `run.mjs`, `data.ts`, `tsconfig.json`, `package.json`) cho bước `setup`.
- `scripts/check_automation.py`: Kiểm tra máy móc (không đánh giá nội dung):

  ```bash
  python -I <skill>/scripts/check_automation.py spec tests/<feature>/*.spec.ts [--min-assert 3] [--with-imports]   # --with-imports: tính cả kiểu trong lib/ được import
  python -I <skill>/scripts/check_automation.py data tests/<feature>/data/* [--min 12] [--ids-from features/<feature>/01_selected_tc.md]
  python -I <skill>/scripts/check_automation.py same features/<feature>/ai_raw/script_01.md     # code trong tests/ còn giống bản AI không
  python -I <skill>/scripts/check_automation.py changes features/<feature>/02_review.md
  python -I <skill>/scripts/check_automation.py format <file.md>...
  ```

- `scripts/summarize_results.py`: Tóm tắt `reports/<feature>/<trình duyệt>/results.json` thành bảng Markdown nháp cho `03_results.md`.
- `scripts/aria_snapshot.mjs`: Snapshot cây ARIA và danh sách ô nhập của một trang để chọn selector (chạy từ thư mục dự án; chỉ dùng khi dự án cho đọc DOM). Trang cần đăng nhập thì dùng `--setup` theo mẫu `assets/snapshot_setup.example.mjs`.

  ```bash
  node <skill>/scripts/aria_snapshot.mjs <url> --browser chrome --out features/<feature>/ai_raw/snapshot_<trang>.txt
  ```
