# Quy trình làm bài HW04: Automation Testing trên EShop

Tài liệu này mô tả cách làm bài HW04: Các bước của từng feature, file đầu ra, cách chạy, cách commit và các quy tắc phải giữ. Mọi phiên AI tham gia làm bài phải đọc file này trước khi bắt đầu.

Phạm vi của sinh viên (3 feature Web đã chọn ở HW02, theo bảng phân công của nhóm):

| Pool | Feature | Nền tảng | Tài liệu | Script |
|---|---|---|---|---|
| A | FR-01 Đăng ký tài khoản | Web (`http://localhost:5173`) | `features/A_FR-01_DangKy/` | `tests/A_FR-01_DangKy/` |
| B | FR-07 Giỏ hàng | Web (`http://localhost:5173`) | `features/B_FR-07_GioHang/` | `tests/B_FR-07_GioHang/` |
| C | FR-17 Quản lý mã giảm giá (CRUD) | Web Admin (`http://localhost:5174`) | `features/C_FR-17_QuanLyCoupon/` | `tests/C_FR-17_QuanLyCoupon/` |

Trình duyệt: Chrome, Edge, Firefox. Mỗi feature chạy trên cả 3 trình duyệt: 9 lần chạy, 9 HTML report.

Công cụ: Playwright Test 1.65.0 (TypeScript), Playwright HTML reporter, Node 24.

---

## 1. Nguyên tắc chung

### 1.1 Oracle và phạm vi được đọc mã nguồn

- **Oracle** (kết quả mong đợi) là đặc tả của EShop: `Homeworks/eshop-sut/README.md` (SRS), cùng test case đã chốt ở HW02. Kết quả mong đợi trong file dữ liệu và trong assertion phải lấy từ đây, **không** lấy từ hành vi hiện tại của hệ thống hay từ mã nguồn.
- Được đọc **DOM** của trang (Playwright codegen, inspector, DevTools) và **mã nguồn frontend** (`frontend-web/`, `frontend-admin/`) **chỉ để tìm selector** và hiểu luồng thao tác (đề HW04 không yêu cầu hộp đen; sinh viên chốt nới quy ước này).
- **Không** đọc mã nguồn backend (`backend/`) và không dùng mã nguồn để suy ra kết quả mong đợi.
- Script khẳng định theo SRS, nên test **fail khi hệ thống sai đặc tả là đúng**. Không sửa assertion cho khớp với hành vi sai của hệ thống; ghi bug (mục 6).
- Chỗ nào đặc tả không nói rõ thì ghi thành **giả định** hoặc **câu hỏi mở**, không tự đặt ra quy tắc.

### 1.2 AI-First, có người kiểm soát

- AI được dẫn qua **từng bước** (mục 3), mỗi lượt chỉ làm **một bước** (hoặc một phần của bước, ví dụ một nhóm test case), sau đó dừng lại chờ sinh viên review. Không dùng một prompt chung kiểu "viết script Playwright cho feature này" (đề §6 Task 1).
- Sinh viên review và quyết định sửa gì ở mọi output của AI, và chịu trách nhiệm về script cuối cùng.
- Output của AI ở mỗi bước được lưu **nguyên văn** trong `features/<feature>/ai_raw/`. **Không bao giờ sửa hay ghi đè file trong `ai_raw/`.** Mọi chỉnh sửa nằm ở bản review và ở script trong `tests/`.
- Khi AI viết lại output của một bước (theo yêu cầu của sinh viên), bản viết lại cũng là output của AI: Lưu thành **file mới** có đuôi `_v2`, `_v3`... File cũ giữ nguyên.

### 1.3 Bằng chứng chạy thật (đề §11)

- HTML report phải có **"Run by: 23120061"** và **timestamp ISO**, và **không** được do AI tạo hay làm giả. Video phải có giọng của sinh viên và face-cam hoặc terminal chạy `whoami`, `hostname`.
- **Lần chạy chính thức** (ra report nộp bài) do **sinh viên tự chạy** trên máy mình bằng `node tools/run.mjs` (mục 4). AI chỉ chạy thử để gỡ lỗi, report của lần chạy thử nằm ở `playwright-report/` (bị `.gitignore` chặn, không nộp).
- Không sửa tay file trong `reports/`. Muốn có report mới thì chạy lại.

### 1.4 Phiên điều phối và phiên làm bài

| Phiên | Làm gì |
|---|---|
| Phiên làm bài | Dùng skill `playwright-automation` làm các bước của từng feature theo tài liệu này. **Không** sửa file trong `skills/` và `.claude/skills/`, **không** chạy script xuất prompt log |
| Phiên điều phối | Theo dõi tiến độ, xuất prompt log, chạy server EShop, kiểm tra phiên làm bài không đọc file bị cấm. Nhận ý kiến của sinh viên về skill, sửa skill, đồng bộ sang `.claude/skills/`, đưa commit message |

### 1.5 Phiên làm bài được đọc và không được đọc

| Được đọc | Không được đọc |
|---|---|
| Đề bài `Homeworks/HW04/2026.HW04.Automation Testing_En.pdf` | `Homeworks/HW04/prompt_log.md` |
| `Homeworks/HW04/README.md`, `Homeworks/HW04/WORKFLOW.md` | `Homeworks/HW04/_NOTES.md` |
| README của repo nhóm `Homeworks/HW02/HW02_group/README.md` (quy ước Issues, mục 6 HW04) | File `.jsonl` trong `~/.claude/projects/` |
| SRS `Homeworks/eshop-sut/README.md` và `api_specification.md` của EShop | Mã nguồn backend `Homeworks/eshop-sut/backend/` (mục 1.1) |
| Mã nguồn `frontend-web/`, `frontend-admin/` và DOM của trang, **chỉ để lấy selector** (mục 1.1) | Thư mục `DA/` |
| Bài HW02 của **feature đang làm**: `Homeworks/HW02/features/<feature>/05_final_tc.md`, bug report và issue HW02 của feature đó | Bài HW02 của feature khác |
| Slide môn học về test automation và regression (Automation & Regression AI-First, S12) | |
| File trong `features/<feature>/`, `tests/<feature>/` của feature đang làm, `tests/support/`, `playwright.config.ts`; file do chính phiên đó tạo ra | |

---

## 2. Cấu trúc thư mục

```
HW04/
├── features/<feature>/         Tài liệu từng feature
│   ├── 01_selected_tc.md       Test case HW02 được chọn để tự động hóa, TC không tự động hóa được và lý do
│   ├── 02_review.md            Review script AI: Bảng "Thay đổi so với bản AI" (mục 2.2)
│   ├── 03_results.md           Kết quả 3 lần chạy chính thức, phân loại test fail, môi trường
│   ├── 04_gap.md               Gap analysis: AI sai / thiếu gì, vì sao
│   ├── ai_raw/                 Output nguyên văn của AI
│   └── screenshots/            Ảnh bổ sung (nếu cần ngoài ảnh trong HTML report)
├── tests/
│   ├── <feature>/              Spec (*.spec.ts) và dữ liệu của feature
│   │   └── data/               File dữ liệu .json / .csv (đề §6: Không viết mảng dữ liệu trong script)
│   ├── support/                fixtures.ts (annotation Run by), runInfo.ts, urls.ts, phần dùng chung
│   └── _smoke/                 Test mẫu kiểm khung dự án, không thuộc feature nào
├── reports/<feature>/<chrome|edge|firefox>/index.html   HTML report của lần chạy chính thức
├── bugs/
│   ├── bug_report.md           Danh sách bug và số issue
│   └── screenshots/            Ảnh danh sách issue trên GitHub
├── skills/                     Agent Skill (nguồn chính)
├── playwright.config.ts        3 project chrome / edge / firefox, reporter HTML có Run by + ISO
└── tools/run.mjs               Chạy 1 feature trên 1 hoặc 3 trình duyệt, mỗi trình duyệt 1 report
```

Cách tổ chức trong `tests/<feature>/` (có Page Object Model không, D11) chốt khi sinh script đầu tiên.

### 2.1 File trong `ai_raw/`

- Đặt tên theo bước: `select.md`, `data.md`, `script_<phần>.md` (ví dụ `script_01_valid.md`), `gap.md`...
- Đầu file ghi tên bước và thời gian tạo, sau đó là nguyên văn câu trả lời của AI (code để trong khối code). Không chép prompt vào file (prompt đã có trong prompt log).
- File bản viết lại (`_v2`, `_v3`...) ghi thêm ở đầu: Lần sửa thứ mấy, thời gian, lý do sửa.
- File dữ liệu và spec AI sinh ra được đưa vào `tests/<feature>/` **đúng nguyên văn** ở commit bản AI (mục 5.2), để `git diff` của commit sau cho thấy chính xác sinh viên đã sửa gì.

### 2.2 Bảng "Thay đổi so với bản AI"

`02_review.md` (và mọi bản review khác) có mục **"Thay đổi so với bản AI"**:

| Vị trí (file:dòng hoặc mã TC) | Thay đổi | Loại | Loại lỗi script | Vì sao AI sai / bỏ sót | Lý do hoặc căn cứ |
|---|---|---|---|---|---|

Cột "Loại":

| Loại | Khi nào dùng |
|---|---|
| Sai | Bản AI trái với đặc tả, với test case HW02, hoặc chạy sai trên giao diện thật |
| Thiếu | Đặc tả hoặc test case có mà bản AI không đưa vào |
| Thừa | Bản AI tự đặt quy tắc mà đặc tả không có, hoặc có bước, assertion trùng lặp |
| Mơ hồ | Assertion hoặc dữ liệu ghi chung chung, không kiểm chứng được |
| Quyết định của SV | Bản AI không sai, nhưng sinh viên chọn một phương án khác |

Cột "Loại lỗi script" (đề §6 Task 1): `Selector dễ vỡ`, `Assertion yếu / thiếu`, `Thiếu edge case`, `Wait gây flaky`, `Dữ liệu`, `Khác`.

Cột "Vì sao AI sai / bỏ sót" (đề §6 Task 1) chỉ nhận một trong ba giá trị, kèm giải thích ngắn:

| Giá trị | Khi nào dùng |
|---|---|
| Prompt | Prompt hoặc dữ liệu đưa cho AI thiếu thông tin (ví dụ không đưa DOM, không nhắc dữ liệu phải duy nhất) |
| Giới hạn model | AI đã có đủ thông tin mà vẫn sai hoặc không nghĩ tới |
| Đặc thù feature | Điểm chỉ có ở EShop hoặc ở feature này, khó suy ra từ kiến thức chung |

Bảng này là dữ liệu cho gap analysis, AI Critique, AI Audit Report và cho phần "kể chỗ đã sửa" trong video, nên ghi đủ mọi thay đổi về nội dung. Không cần ghi thay đổi thuần hình thức.

---

## 3. Các bước của một feature

| Bước | Nội dung | Ai làm | Đầu ra |
|---|---|---|---|
| `select` | Chọn **≥ 12 test case** từ `05_final_tc.md` của HW02 (positive, negative, edge đều tính); ghi TC không tự động hóa được và lý do | AI đề xuất, SV chốt | `ai_raw/select.md`, `01_selected_tc.md` |
| `data` | Sinh file dữ liệu từ các TC đã chọn: Input và kết quả mong đợi theo SRS | AI, SV review | `ai_raw/data.md`, `tests/<feature>/data/*.json` hoặc `.csv` |
| `script` | Sinh spec data-driven, **từng phần một** (ví dụ mỗi nhóm TC một lượt), dùng ≥ 3 kiểu assertion | AI | `ai_raw/script_*.md`, `tests/<feature>/*.spec.ts` (nguyên văn bản AI) |
| `review` | Review và sửa: Selector dễ vỡ, assertion yếu hoặc thiếu, thiếu edge case, wait gây flaky, dữ liệu sai | **SV** (AI hỗ trợ khi SV yêu cầu) | Spec và dữ liệu đã sửa, `02_review.md` |
| `run` | Chạy thử, sửa lỗi script; **lần chạy chính thức** trên Chrome, Edge, Firefox | **SV** | `reports/<feature>/<trình duyệt>/`, `03_results.md` |
| `bugs` | Tách test fail do bug thật với fail do script; báo bug | SV, AI hỗ trợ viết | `bugs/bug_report.md`, issue hoặc bình luận trên repo nhóm |
| `gap` | Gap analysis: AI sai / thiếu gì, vì sao; chốt danh sách TC không tự động hóa được | AI đề xuất, SV review | `ai_raw/gap.md`, `04_gap.md` |

### 3.1 `select`: Chọn test case

- Nguồn: `Homeworks/HW02/features/<feature>/05_final_tc.md`. Giữ nguyên mã TC của HW02 (ví dụ `FR01-BVA-07`) để truy vết sang HW02 và issue.
- Tiêu chí chọn chốt khi tới bước này (D12). Một phần TC của HW02 kiểm qua API; dùng API trong script tới mức nào chốt khi sinh script đầu tiên (D17).
- `01_selected_tc.md` có: Bảng TC được chọn (mã, tiêu đề, loại positive / negative / edge, kỹ thuật EP / BVA, dữ liệu, kết quả mong đợi, căn cứ SRS) và bảng **TC không tự động hóa được** kèm lý do (đề §6 Task 1).

### 3.2 `data`, `script`: Sinh script

- Dữ liệu test và kết quả mong đợi nằm trong file `.json` / `.csv` ở `tests/<feature>/data/`. Script đọc file và sinh test cho từng dòng. **Không** viết mảng hay object dữ liệu thẳng trong script (đề §6 Task 1).
- Mỗi test có tên bắt đầu bằng mã TC HW02, ví dụ `FR01-BVA-07: ...`, để đọc report dễ đối chiếu.
- Spec import `test`, `expect` từ `tests/support/fixtures.ts`, **không** import `test` thẳng từ `@playwright/test`: Fixture này gắn annotation "Run by: 23120061 | <ISO>" vào từng test. `tools/run.mjs` từ chối chạy nếu có spec import sai.
- Dùng **≥ 3 kiểu assertion khác nhau** (ví dụ `toBeVisible` / `toHaveText` / `toHaveURL` / `toHaveCount` / `toHaveValue` / kiểm response). Phạm vi tính (toàn suite hay mỗi feature) chốt khi review script feature đầu (D13).
- Selector ưu tiên theo thứ tự của Playwright: `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`, `getByTestId`; tránh CSS / XPath phụ thuộc cấu trúc.
- Không dùng `waitForTimeout`; dùng auto-wait và web-first assertion.
- Cách giữ dữ liệu không giẫm lên nhau giữa các lần chạy và giữa 3 trình duyệt (reset DB, dữ liệu riêng, hậu tố...) chốt trước lần chạy đa trình duyệt đầu tiên (D10). Cấu hình hiện tại chạy tuần tự (`workers: 1`).

### 3.3 `review`: Review và sửa

- Sinh viên đọc từng spec, chạy thử, so với TC HW02 và SRS. Mọi sửa đổi ghi vào bảng "Thay đổi so với bản AI" (mục 2.2).
- Ghi lại ngay những chỗ đáng kể để làm phần "kể chỗ đã sửa" trong video Task 2.

### 3.4 `run`: Chạy chính thức

Mục 4. `03_results.md` ghi: Ngày giờ (khớp timestamp trong report), phiên bản trình duyệt, OS, Playwright 1.65.0, số test pass / fail / skip mỗi trình duyệt, và với mỗi test fail: Fail do **bug thật** (có số issue) hay do **script** (đã sửa chưa, nếu chưa thì vì sao).

### 3.5 `gap`: Gap analysis

- Tổng hợp từ bảng "Thay đổi so với bản AI": AI sai / thiếu gì, nhóm theo "Loại lỗi script" và "Vì sao AI sai / bỏ sót".
- Danh sách cuối cùng TC không tự động hóa được và lý do.

---

## 4. Chạy test

### 4.1 Chuẩn bị (mỗi đợt chạy chính thức)

1. Bật 3 server EShop: `backend` (`node server.js`, cổng 3000), `frontend-web` (`npm run dev`, 5173), `frontend-admin` (`npm run dev`, 5174).
2. Reset dữ liệu: `cd backend && node database.js` (theo cách chốt ở D10).
3. Tài khoản: Admin `admin@eshop.com` / `Admin123!`; User `test@eshop.com` / `Test1234!`.

### 4.2 Lệnh

| Mục đích | Lệnh | Report |
|---|---|---|
| Chạy chính thức (SV) | `node tools/run.mjs <A\|B\|C> all` hoặc `node tools/run.mjs <A\|B\|C> <chrome\|edge\|firefox>` | `reports/<feature>/<trình duyệt>/index.html` |
| Chạy thử, gỡ lỗi (AI hoặc SV) | `npx playwright test tests/<feature>/ --project=chrome` | `playwright-report/` (không nộp) |
| Kiểm tra kiểu | `npm run typecheck` | |
| Test mẫu kiểm khung | `node tools/run.mjs smoke all` | `reports/_smoke/` (không nộp) |

- Mỗi lần chạy `tools/run.mjs` ghi đè report cũ của đúng feature và trình duyệt đó.
- Report có "Run by: 23120061 | <ISO> | <feature> x <trình duyệt>" ở **tiêu đề**, và "Run by: 23120061 | <ISO>" ở **annotation** của từng test (D9). Annotation `Browser` ghi tên và phiên bản trình duyệt.
- Cạnh `index.html` có `results.json` (JSON reporter) để tóm tắt kết quả vào `03_results.md` bằng script, không chép tay.
- `<feature>` của `tools/run.mjs` là tên thư mục trong `tests/` hoặc tiền tố của nó (`A`, `B`, `C`).
- Khi test fail, report kèm **ảnh chụp** và **trace** (D9). Không quay video.

---

## 5. Commit

### 5.1 Định dạng

Theo mục 3 README của repo nhóm HW02 (D8):

```
[<phạm vi>][<bước>] <Verb> <nội dung>
```

- Tiếng Anh, bắt đầu bằng động từ dạng mệnh lệnh, không có dấu chấm cuối.
- Phạm vi: `A-FR01`, `B-FR07`, `C-FR17`. Bước: `select`, `data`, `script`, `review`, `run`, `bugs`, `gap` (mục 3).
- Commit không thuộc feature nào: `[setup]`, `[skill]`, `[report]`, `[forms]`.
- **Sinh viên tự commit.** AI chỉ đưa commit message và lệnh. Trước mỗi commit, sinh viên nhờ phiên điều phối xuất prompt log.
- Đề §12: Chỉ commit **có sửa file `.spec.ts`** mới tính vào tối thiểu 8 commit. Tách commit như mục 5.2 thì mỗi feature có ít nhất 3 commit như vậy.

### 5.2 Tách commit trong mỗi bước

Tách để lịch sử git cho thấy rõ phần AI viết và phần sinh viên sửa.

| Bước | Các commit | Ví dụ message |
|---|---|---|
| `select` | (1) Bản AI, (2) bản SV chốt | `[A-FR01][select] Select HW02 test cases for automation (AI draft)` |
| `data` | (1) Bản AI (`ai_raw/` + file dữ liệu nguyên văn), (2) bản review | `[A-FR01][data] Add registration test data (AI draft)` |
| `script` | Mỗi phần AI sinh một commit, spec nguyên văn bản AI | `[A-FR01][script] Add valid registration spec (AI draft)` |
| `review` | Mỗi nhóm sửa một commit (ví dụ selector, assertion, edge case) | `[A-FR01][review] Replace brittle CSS selectors with role locators` |
| `run` | (1) Sửa script sau khi chạy thử (nếu có), (2) report chính thức + `03_results.md` | `[A-FR01][run] Add Chrome, Edge and Firefox reports` |
| `bugs` | Một commit | `[A-FR01][bugs] Report bugs found by automation` |
| `gap` | (1) Bản AI, (2) bản review | `[A-FR01][gap] Add gap analysis and non-automatable test cases` |
| Bất kỳ bước nào | AI viết lại theo yêu cầu: Thêm `ai_raw/..._v2.md` và cập nhật bản review | `[A-FR01][script] Regenerate cart spec with data file (AI revision 1)` |

Sửa lại một bước đã commit thì giữ nguyên tag của bước đó.

---

## 6. Bug report và GitHub Issues

Repo của nhóm: https://github.com/angquoc/software-testing-2026-HW02-group. Quy ước đầy đủ nằm ở mục 4 và mục 6 README của repo này. Tóm tắt:

- Chỉ báo bug khi test fail vì **hệ thống sai so với SRS**, đã chạy lại và tái hiện được. Test fail vì script sai thì sửa script, không báo bug.
- **Bug đã có issue từ HW02** (FR-01 #42 đến #54, FR-17 #55 đến #66, FR-07 #67 đến #84): Không tạo issue mới. Bình luận vào issue cũ: Tên script và mã TC, trình duyệt, kết quả assertion, ảnh chụp, ghi rõ "HW04".
- **Bug mới:** Tiêu đề `[23120061][FR-xx][Web|Admin] Mô tả ngắn: Hành vi sai so với đặc tả`, template "Bug report", bắt buộc có ảnh chụp (lấy từ HTML report hoặc tự chụp). Gắn đủ `severity`, `platform`, `technique` (theo TC HW02), `pool`, và thêm `hw: HW04`.
- Ghi mọi bug vào `bugs/bug_report.md` (mã TC, script, trình duyệt bị lỗi, số issue hoặc link bình luận). Chụp trang Issues đã lọc `label:"hw: HW04"` (và các issue HW02 đã bình luận) vào `bugs/screenshots/`.

---

## 7. Agent Skill

- Skill `playwright-automation`, nguồn chính ở `skills/playwright-automation/`; skill làm theo đúng các bước ở mục 3 (dẫn AI từng bước, dữ liệu ở file riêng, đa trình duyệt, bảo trì script). Chỗ skill và tài liệu này khác nhau thì tài liệu này ưu tiên.
- Sau mỗi lần sửa skill: Chép sang `D:\Dang\Test\.claude\skills\` và kiểm tra bằng `diff -r`.
- Thứ tự (D7, D14): Viết skill, dùng skill làm FR-17 (feature C) và sửa skill theo những gì gặp, rồi quay video dùng skill trọn FR-01 (feature A).
- Sửa skill trong lúc làm FR-17: Sinh viên chuyển ý kiến về skill cho phiên điều phối; phiên điều phối sửa skill và đồng bộ. Phiên làm bài đọc lại file skill vừa sửa trước khi làm tiếp (nội dung skill đã nạp trước đó không tự cập nhật).

---

## 8. Định dạng văn bản

- Viết tiếng Việt; giữ nguyên tên trường, nút, thông báo như trên giao diện; tên test và commit bằng tiếng Anh.
- Không dùng dấu "—" và dấu "·".
- Chữ cái đầu tiên sau dấu ":" viết hoa (trừ code, tên label, đường dẫn, giờ).
