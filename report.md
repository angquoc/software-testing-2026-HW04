# HW04-AI: Automation Testing trên EShop

| | |
|---|---|
| MSSV | 23120061 |
| Họ tên | Nguyễn Thị Ánh Ngọc |
| Lớp | Kiểm thử phần mềm - CQ2023/3 |
| Môn học | CS423 / CSC15003 - Software Testing |
| Bloom-AI | G9.2 (Apply), G9.3 (Analyse), G9.4 (Collaborate) |
| Công cụ AI | Claude Code (Anthropic, claude-opus-5-5) |
| Công cụ kiểm thử | Playwright 1.65.0 (TypeScript), Playwright HTML reporter, Node 24.11.0 |
| SUT | [EShop](https://github.com/ttbhanh/eshop-sut), commit `85af3ba` |
| Repo bài làm | https://github.com/angquoc/software-testing-2026-HW04 |
| Repo nhóm (GitHub Issues) | https://github.com/angquoc/software-testing-2026-HW02-group |
| Video Task 2 | https://youtu.be/nfzV6JFvdG0 |
| Video Agent Skill | https://youtu.be/jYuCvhagSy0 |
| Ngày nộp | 18/11/2026 |

> Báo cáo này là bản tổng hợp. Chi tiết từng bước nằm trong thư mục của từng feature (`features/<feature>/`): Test case được chọn, bản gốc của AI (`ai_raw/`), bản review có bảng "Thay đổi so với bản AI", kết quả chạy chính thức, gap analysis. Các đường dẫn bên dưới tính từ thư mục gốc của repo.

## Mục lục

- [HW04-AI: Automation Testing trên EShop](#hw04-ai-automation-testing-trên-eshop)
  - [Mục lục](#mục-lục)
  - [1. Cách làm](#1-cách-làm)
    - [1.1 Phạm vi](#11-phạm-vi)
    - [1.2 Quy trình (dùng Agent Skill `playwright-automation`)](#12-quy-trình-dùng-agent-skill-playwright-automation)
    - [1.3 Nguyên tắc](#13-nguyên-tắc)
  - [2. Task 1: Script tự động do AI sinh](#2-task-1-script-tự-động-do-ai-sinh)
    - [2.1 Tổng quan](#21-tổng-quan)
    - [2.2 Feature A: FR-01 Đăng ký tài khoản](#22-feature-a-fr-01-đăng-ký-tài-khoản)
    - [2.3 Feature B: FR-07 Giỏ hàng](#23-feature-b-fr-07-giỏ-hàng)
    - [2.4 Feature C: FR-17 Quản lý mã giảm giá](#24-feature-c-fr-17-quản-lý-mã-giảm-giá)
  - [3. Review và gap analysis script AI sinh](#3-review-và-gap-analysis-script-ai-sinh)
    - [3.1 Số liệu](#31-số-liệu)
    - [3.2 AI sai gì, vì sao (các ví dụ đáng kể)](#32-ai-sai-gì-vì-sao-các-ví-dụ-đáng-kể)
    - [3.3 AI làm tốt](#33-ai-làm-tốt)
    - [3.4 Kể trong video](#34-kể-trong-video)
  - [4. Test case không tự động hóa được](#4-test-case-không-tự-động-hóa-được)
  - [5. Bug](#5-bug)
  - [6. Task 2: Video demo](#6-task-2-video-demo)
  - [7. Agent Skill](#7-agent-skill)
  - [8. Test Summary](#8-test-summary)
  - [AI Critique](#ai-critique)
  - [Mandatory Disclosure](#mandatory-disclosure)
  - [Self-Assessment](#self-assessment)
  - [Appendix A: Prompt log](#appendix-a-prompt-log)
  - [Appendix B: AI Audit Report](#appendix-b-ai-audit-report)
    - [Tổng kết độ chính xác AI](#tổng-kết-độ-chính-xác-ai)
    - [Kết luận: Khi nào nên, không nên dùng AI?](#kết-luận-khi-nào-nên-không-nên-dùng-ai)

---

## 1. Cách làm

### 1.1 Phạm vi

Cùng 3 feature Web đã chọn ở HW02 (đề mục 5), dùng lại bộ test case thủ công đã chốt ở HW02 làm nguồn chọn và làm oracle.

| Pool | Feature | Nền tảng | Test case HW02 | Thư mục |
|---|---|---|---|---|
| A | FR-01 Đăng ký tài khoản | Web (5173) | 96 | [`features/A_FR-01_DangKy/`](features/A_FR-01_DangKy/) |
| B | FR-07 Giỏ hàng | Web (5173) và API giỏ hàng | 38 | [`features/B_FR-07_GioHang/`](features/B_FR-07_GioHang/) |
| C | FR-17 Quản lý mã giảm giá (CRUD) | Web Admin (5174) | 115 | [`features/C_FR-17_QuanLyCoupon/`](features/C_FR-17_QuanLyCoupon/) |

Trình duyệt: Chrome, Edge, Firefox (3 project trong [`playwright.config.ts`](playwright.config.ts)); mỗi feature chạy trên cả 3 trình duyệt, tổng 9 HTML report.

### 1.2 Quy trình (dùng Agent Skill `playwright-automation`)

Mỗi feature đi qua 8 bước, mỗi lượt một bước, AI dừng chờ sinh viên review trước khi sang bước sau ([`WORKFLOW.md`](WORKFLOW.md) mục 3):

| Bước | Việc | Ai làm | Đầu ra |
|---|---|---|---|
| `select` | Đọc toàn bộ test case HW02, chọn ≥ 12 test case, chia phần sinh script, ghi test case không tự động hóa được | AI đề xuất, sinh viên chốt | `ai_raw/select.md`, `01_selected_tc.md` |
| `data` | Sinh file dữ liệu `.json`: Input và kết quả mong đợi theo đặc tả, có `oracle` | AI sinh, sinh viên review | `ai_raw/data.md`, `tests/<feature>/data/*.json` |
| `script` | Sinh spec từng phần (P1, P2...), ≥ 3 kiểu assertion | AI sinh, sinh viên review | `ai_raw/script_<nn>_*.md`, `tests/<feature>/*.spec.ts` |
| `review` | Chạy thử 3 trình duyệt, sửa selector, assertion, edge case, wait; thử làm hỏng có chủ đích | **Sinh viên** quyết; AI chạy thử khi được nhờ | `02_review.md` (bảng "Thay đổi so với bản AI") |
| `run` | Chạy chính thức `node tools/run.mjs <feature> all` | **Sinh viên** chạy trên máy mình | `reports/<feature>/<trình duyệt>/`, `03_results.md` |
| `bugs` | Bình luận vào issue HW02 hoặc tạo issue mới, có ảnh | Sinh viên duyệt, AI chạy `gh` sau khi duyệt | `bugs/bug_report.md`, GitHub Issues |
| `gap` | AI sai gì, vì sao; đề xuất bổ sung skill | AI viết, sinh viên duyệt | `ai_raw/gap.md`, `04_gap.md` |

Thứ tự feature (D7, D14): Viết skill trước, dùng skill làm FR-17 và sửa skill theo những gì gặp, làm FR-07 để sửa skill thêm, rồi quay video dùng skill trọn FR-01.

### 1.3 Nguyên tắc

- **Oracle là đặc tả.** Kết quả mong đợi trong file dữ liệu và trong assertion lấy từ SRS EShop (`README.md` của SUT) và test case HW02, không lấy từ hành vi hiện tại của hệ thống hay mã nguồn. Mã nguồn frontend chỉ được đọc để lấy selector; không đọc mã nguồn backend (WORKFLOW mục 1.1).
- **Data-driven.** Spec không chứa dữ liệu test; vòng lặp đọc file `.json` và sinh một test cho mỗi dòng, tên test bắt đầu bằng mã test case. Kiểm bằng `check_automation.py spec` (không có mảng dữ liệu viết thẳng).
- **Bản AI giữ nguyên văn.** Mỗi bản AI lưu trong `ai_raw/` và được commit riêng (đuôi `(AI draft)`) trước khi sinh viên sửa, để `git diff` của commit sau cho thấy đúng phần sinh viên sửa. Mọi thay đổi về nội dung ghi vào bảng "Thay đổi so với bản AI" với Loại (Sai, Thiếu, Thừa, Mơ hồ, Quyết định của SV), loại lỗi script và lý do AI sai.
- **Không chạy thử bản AI trước khi giao.** Trước khi giao chỉ kiểm tĩnh (`tsc`, `check_automation.py`); chạy trên giao diện thuộc bước `review`, để lỗi của AI hiện ra trong bảng thay đổi.
- **Test fail do hệ thống sai đặc tả thì giữ nguyên**, không sửa assertion cho xanh; báo ở bước `bugs`.
- **HTML report chỉ đến từ lần chạy thật của sinh viên.** AI chỉ chạy thử để gỡ lỗi, report thử để ngoài `reports/` (gitignore). Mỗi report có tiêu đề "Run by: 23120061 | <timestamp ISO> | <feature> x <trình duyệt>" và annotation "Run by", "Browser" ở từng test (fixture [`tests/support/fixtures.ts`](tests/support/fixtures.ts)).
- **Cô lập dữ liệu (D10).** FR-17, FR-01: `globalSetup` reset DB (`node database.js`) trước lượt chạy của mỗi trình duyệt. FR-07: Giỏ Web nằm trong bộ nhớ trang nên mỗi test tự cô lập; test API đo theo "dòng mới" giữa trước và sau; sinh viên reset DB trước và sau lượt chạy chính thức.

---

## 2. Task 1: Script tự động do AI sinh

### 2.1 Tổng quan

| Feature | Test case tự động hóa | Phần (spec) | File dữ liệu | Kiểu assertion (cả feature) | Page object |
|---|---|---|---|---|---|
| A: FR-01 | 14 (8 positive, 4 negative, 2 edge; 5 EP, 2 BVA, 7 Checklist) | 5 | 5 `.json` | 9 | `RegisterPage`, `LoginPage`, `fieldByLabel` |
| B: FR-07 | 27: 15 giao diện (9 positive, 1 negative, 5 edge) và 12 API | 7 | 7 `.json` (cùng `products.json`, `cart_api_base.json`) | 7 | `NavBar`, `HomePage`, `ProductDetailPage`, `CartPage` |
| C: FR-17 | 18 (5 positive, 8 negative, 5 edge; 16 EP, 1 BVA, 1 Checklist) | 4 | 4 `.json` | 5 | `AdminCouponsPage` |

Mọi spec đạt ≥ 3 kiểu assertion (`check_automation.py spec --min-assert 3 --with-imports`, tính cả kiểu trong `lib/` mà spec gọi theo quyết định của sinh viên), trừ 2 spec API của FR-07 (2 kiểu: Phản hồi mạng, giá trị so sánh); sinh viên chốt ngoại lệ này ở CH-script-06 thay vì thêm assertion không có trong test case.

### 2.2 Feature A: FR-01 Đăng ký tài khoản

- Chọn ([`01_selected_tc.md`](features/A_FR-01_DangKy/01_selected_tc.md)): Tiêu chí kết hợp a (đã chạy tay ở HW02), b (đã phát hiện bug), c (phủ lớp và biên). Bug #42 làm mọi đăng ký hợp lệ qua UI bị báo "Mật khẩu quá yếu!", nên các test case kiểm lỗi ở trường khác (Email sai định dạng, trùng) chỉ thấy lại #42; sinh viên giữ chúng ở dự phòng.
- Phần: P1 đăng ký hợp lệ (TC-REG-01, 108), P2 ô bắt buộc để trống (30, 32, 49), P3 mật khẩu yếu (56, 107), P4 checklist form (90, 92, 93, 95, 96), P5 thứ tự Tab và vị trí thông báo (94, 97).
- Điểm đáng chú ý: Màu nút "xanh dương" (TC-REG-92) đo bằng hue 200° đến 250° và độ bão hòa ≥ 40% (sinh viên chốt); nhãn và nút so đúng chữ hoa thường theo đặc tả (CH-script-04), không chạy theo giao diện để không che lệch đặc tả; validation trình duyệt đo bằng `validity` trước khi bấm và sự kiện `invalid` trên đúng ô.
- Chạy chính thức ([`03_results.md`](features/A_FR-01_DangKy/03_results.md)):

| Trình duyệt | Phiên bản | Timestamp | Tổng | Pass | Fail | Flaky |
|---|---|---|---|---|---|---|
| Chrome | 157.0.8103.79 | 2026-11-18T01:20:51+07:00 | 14 | 7 | 7 | 0 |
| Edge | 157.0.4341.60 | 2026-11-18T01:21:33+07:00 | 14 | 7 | 7 | 0 |
| Firefox | 159.0 | 2026-11-18T01:22:16+07:00 | 14 | 7 | 7 | 0 |

7 test fail giống nhau trên 3 trình duyệt, đều do hệ thống sai đặc tả: TC-REG-01, 108 (#42), 90 (#43), 92 (#52), 93 (#53), 95 (#51), 96 (#50).

### 2.3 Feature B: FR-07 Giỏ hàng

- Chọn ([`01_selected_tc.md`](features/B_FR-07_GioHang/01_selected_tc.md)): 15 test case giao diện (tiêu chí c, b, a) và 12 test case chỉ kiểm qua API giữ làm test API (không tính vào tối thiểu 12). Sản phẩm của mọi giỏ chuẩn bị được chốt cụ thể (D-08) để bước sau không tự chọn hoặc bịa.
- Phần: P1 thêm từ trang chi tiết, P2 thêm vào giỏ đã có hàng, P3 xóa sản phẩm và dialog, P4 giỏ trống và "Tiếp tục mua sắm", P5 checklist giao diện trang Giỏ hàng, P6 API không hợp lệ, P7 API hợp lệ và bảo mật.
- Test API chỉ chạy trên project `chrome` (D17), Edge và Firefox bỏ qua bằng `test.skip` kèm lý do.
- Chạy chính thức ([`03_results.md`](features/B_FR-07_GioHang/03_results.md)):

| Trình duyệt | Phiên bản | Timestamp | Tổng | Pass | Fail | Skip | Flaky |
|---|---|---|---|---|---|---|---|
| Chrome | 157.0.8103.52 | 2026-11-17T17:24:05+07:00 | 27 | 6 | 21 | 0 | 0 |
| Edge | 157.0.4341.60 | 2026-11-17T17:26:36+07:00 | 27 | 1 | 14 | 12 | 0 |
| Firefox | 159.0 | 2026-11-17T17:29:02+07:00 | 27 | 1 | 14 | 12 | 0 |

21 test fail (F-01 đến F-21) đều là Bug: Lần bấm "Thêm vào giỏ hàng" đầu không phản hồi (#73), không có toast hay badge (#78, #79), thêm lại tạo dòng mới (#70), không có dialog xác nhận xóa (#72), giỏ trống không có hình (#80), thiếu nút "Tiếp tục mua sắm" (#77), cột "Giá" và nhãn "Tổng tạm tính" (#76, #75), không highlight và không có breadcrumb (#83, #84), API nhận số lượng và sản phẩm không hợp lệ, lưu giá do client gửi (#67, #68, #69), và lỗi mới TC-CART-100 (nhập Số lượng 0 vẫn thêm vào giỏ, #118). TC-CART-100 chỉ bắt được vì script bấm thêm lần thứ hai khi lần đầu không phản hồi; nếu chỉ bấm một lần, giỏ trống do #73 và test qua nhầm.

### 2.4 Feature C: FR-17 Quản lý mã giảm giá

- Chọn ([`01_selected_tc.md`](features/C_FR-17_QuanLyCoupon/01_selected_tc.md)): Tiêu chí kết hợp (đã chạy tay, đã ra bug, rồi bù phủ lớp và biên), 18 test case; regression cho bug #55, #56, #57.
- Phần: P1 danh sách (TC-CPN-50, 93), P2 tạo mã hợp lệ (7 test case), P3 tạo mã không hợp lệ (8), P4 xóa (TC-CPN-51). Page object `AdminCouponsPage`; đăng nhập admin một lần trong `globalSetup`, dùng lại `storageState`.
- Chạy chính thức ([`03_results.md`](features/C_FR-17_QuanLyCoupon/03_results.md)):

| Trình duyệt | Phiên bản | Timestamp | Tổng | Pass | Fail | Flaky |
|---|---|---|---|---|---|---|
| Chrome | 157.0.8103.52 | 2026-11-17T00:27:17+07:00 | 18 | 13 | 5 | 0 |
| Edge | 157.0.4341.60 | 2026-11-17T00:29:18+07:00 | 18 | 13 | 5 | 0 |
| Firefox | 159.0 | 2026-11-17T00:30:37+07:00 | 18 | 13 | 5 | 0 |

5 test fail giống nhau trên 3 trình duyệt: TC-CPN-32 (hộp thoại lộ chuỗi `SQLITE_CONSTRAINT`, #57), TC-CPN-37 (tạo được mã 150%, khác giả định A01, #56), TC-CPN-38 (0%, #55), TC-CPN-39 (0 ₫ loại cố định, mới #114), TC-CPN-41 (đơn tối thiểu -1 ₫, mới #115).

**Trace của FR-17:** Trace (`.zip`) của lần chạy chính thức không còn: Khi quay video Task 2 (18/11/2026), `tools/run.mjs` xóa thư mục `reports/C_FR-17_QuanLyCoupon/` rồi chạy lại; bước khôi phục bằng `git restore` chỉ trả lại các file đã commit, mà trace bị `.gitignore` (`*.zip`) chặn nên chưa từng được commit. HTML report, ảnh lúc fail và `results.json` của lần chạy chính thức vẫn nguyên (khôi phục từ commit); chỉ nút mở trace của 5 test fail không mở được. Trace của lần quay video không được đưa lên vì không khớp report chính thức. FR-01, FR-07 có đủ trace.

Chrome tự cập nhật bản vá giữa lần chạy FR-07 (157.0.8103.52) và FR-01 (157.0.8103.79); mỗi `03_results.md` ghi đúng phiên bản của lần chạy đó (lấy từ annotation `Browser`).

---

## 3. Review và gap analysis script AI sinh

Số liệu đếm bằng `check_automation.py changes --stats` trên bảng "Thay đổi so với bản AI" của `01_selected_tc.md` và `02_review.md` từng feature. Chi tiết: [`A/04_gap.md`](features/A_FR-01_DangKy/04_gap.md), [`B/04_gap.md`](features/B_FR-07_GioHang/04_gap.md), [`C/04_gap.md`](features/C_FR-17_QuanLyCoupon/04_gap.md).

### 3.1 Số liệu

| Feature | Dòng thay đổi | Lỗi của AI (Sai / Thiếu / Thừa / Mơ hồ) | Quyết định của SV | Lỗi lọt tới lần chạy chính thức |
|---|---|---|---|---|
| A: FR-01 | 8 | 3 (2 / 0 / 0 / 1) | 5 | Không |
| B: FR-07 | 25 | 10 (3 / 3 / 0 / 4) | 15 | Không |
| C: FR-17 | 15 | 7 (3 / 2 / 2 / 0) | 8 | Không |
| **Tổng** | **48** | **20 (8 / 5 / 2 / 5)** | **28** | **Không** |

Lỗi của AI theo loại lỗi script (đề yêu cầu) và nguyên nhân:

| Loại lỗi script | Prompt | Giới hạn model | Đặc thù feature | Tổng |
|---|---|---|---|---|
| Selector dễ vỡ | 0 | 1 | 0 | 1 |
| Assertion yếu / thiếu | 0 | 6 | 3 | 9 |
| Thiếu edge case | 0 | 3 | 0 | 3 |
| Wait gây flaky | 0 | 1 | 0 | 1 |
| Dữ liệu | 0 | 3 | 0 | 3 |
| Khác | 0 | 3 | 0 | 3 |
| **Tổng** | **0** | **17** | **3** | **20** |

Ở FR-01, sinh viên chọn không ghi 2 nhóm thay đổi ở bước `select` (mục "Điều kiện tiên quyết chung" bản AI bỏ sót và các thay đổi theo CH-select) vì đang quay video; số liệu FR-01 không gồm hai nhóm này.

### 3.2 AI sai gì, vì sao (các ví dụ đáng kể)

| Loại | Ví dụ | Vì sao AI sai | Ai phát hiện, sửa thế nào |
|---|---|---|---|
| Wait gây flaky | FR-17 P3: Gọi `boundingBox()` trên locator không khớp phần tử nào; hàm này chờ tới hết 30 giây của test, nên 4 test kẹt và không tới bước kiểm "không có dòng mới" | Giới hạn model: Dùng `boundingBox()` như lệnh đọc tức thời | Lần chạy thử đầu trên Chrome; đếm phần tử trước, không có thì ghi lỗi soft; 4 test fail sau khoảng 11 giây, đúng nguyên nhân |
| Assertion yếu / thiếu | FR-17 P3: Dòng mã vừa bị tạo nhầm trong bảng bị coi là "thông báo"; đọc `validity` sau khi bấm nên form tự xóa làm ô trống báo không hợp lệ | Đặc thù feature: Bản AI chỉ có snapshot trang lúc chưa nhập, viết theo giả định "dữ liệu sai thì bị từ chối" | Chạy thử Chrome; bỏ chữ của bảng, đọc `validity` trước khi bấm |
| Assertion yếu / thiếu | FR-07 review: Bộ ghi phản hồi tính câu chào trên Header (vẽ lại khi giỏ đổi) là thông báo mới; mẫu so tiền `\2000` bị JavaScript đọc thành escape bát phân | Giới hạn model | AI chạy thử theo yêu cầu (S1, S2); chỉ tính chữ chưa có lúc cài bộ ghi; bọc backreference `(?:\2)` |
| Assertion yếu / thiếu | FR-07 review: TC-CART-54 qua cả khi bước 1 không thêm được dòng nào (không chứng minh được gì); mẫu so tiền chặt nhận cả "1,996,000,000" cho 996,000,000 | Giới hạn model | AI chỉ ra khi sinh viên nhờ rà test qua (N1, N2), chứng minh bằng thử làm hỏng có chủ đích |
| Dữ liệu, Mơ hồ | FR-07 select: "Giỏ 2 dòng" không chốt sản phẩm; TC-CART-93 cần dialog mà bug #72 làm mất | Giới hạn model | Sinh viên khi review bản AI; chốt sản phẩm (D-08), bỏ TC-CART-93 |
| Selector dễ vỡ | FR-01 P1: `locator('div').filter({ has: nhãn })` khớp cả `div` bọc chung nhiều trường, lỗi strict mode | Giới hạn model | Sinh viên khi đọc bản AI; AI kiểm trên HTML dựng tại chỗ; đi từ nhãn lên cha trực tiếp |
| Thiếu edge case | FR-17 select: Không xét lớp "giá trị dương" theo từng loại mã nên bỏ TC-CPN-39 | Giới hạn model | Sinh viên khi review; TC-CPN-39 ra bug mới #114 |

### 3.3 AI làm tốt

- Selector lấy từ snapshot ARIA (`getByRole`, `getByPlaceholder`) chạy được trên cả 3 trình duyệt mà gần như không phải sửa; không có test fail do khác biệt trình duyệt hay flaky ở 9 lần chạy chính thức.
- Câu hỏi mở (CH-...) đặt đúng chỗ đặc tả không nói (tiêu chí màu, cách đo thông báo, phạm vi 3 kiểu assertion); 28 dòng thay đổi là quyết định của sinh viên cho các câu hỏi này.
- Bắt bug thật: 2 issue mới ở FR-17 (#114, #115), 1 issue mới ở FR-07 (#118), regression của 24 bug HW02 (bình luận HW04).

### 3.4 Kể trong video

Video Task 2 kể 3 chỗ sửa ★ của FR-17 P3 (`03_create_invalid.spec.ts`, commit `19b234a`): `boundingBox()` kẹt 30 giây, `validity` đọc sau khi bấm, dòng bảng bị coi là thông báo ([`C/02_review.md`](features/C_FR-17_QuanLyCoupon/02_review.md) mục 4).

---

## 4. Test case không tự động hóa được

| Feature | Test case | Lý do | Cách kiểm thay thế |
|---|---|---|---|
| A | TC-REG-70 đến 77, 80, 81, 82, 129, 130 | Chỉ kiểm qua `POST /api/register`; dự án chốt chỉ tự động hóa qua giao diện web (đề: "automate the web frontend") | Script API của HW02 |
| A | TC-REG-78, 79 | Bước 1 gửi API (đã chốt bỏ); làm qua UI thì #42 chặn tạo tài khoản, bước so trùng mất ý nghĩa; TC-REG-79 phải chạy cuối và reset DB ngay sau | Chạy tay sau khi #42 được sửa |
| A | TC-REG-59 đến 62 | Form không có ô Xác nhận mật khẩu (#43); test chỉ lặp lại TC-REG-90 | TC-REG-90 (đã tự động hóa) |
| A | TC-REG-91 | "Toàn bộ chữ là tiếng Việt" cần người đọc đánh giá; bong bóng của trình duyệt không nằm trong DOM | Kiểm tay như HW02 |
| B | TC-CART-52, TC-CART-50 (phần trang Giỏ hàng) | Dòng thêm qua `POST /api/cart` không hiện trên giỏ Web vì hai giỏ tách nhau (#74) | Kiểm tay sau khi #74 được sửa; phần API của TC-CART-50 vẫn tự động hóa |
| B | TC-CART-92 | Phân biệt từng chữ là tiếng Việt hay thuật ngữ kỹ thuật cần người đọc | Kiểm tay |
| B | TC-CART-93 | Không có ngưỡng màu trong đặc tả (D-05), và nút xác nhận xóa không tồn tại vì #72 nên test chỉ lặp lại #72 | TC-CART-94 (dự phòng) thay vào P5 |
| C | TC-CPN-52 | Hệ thống không có hộp thoại xác nhận khi xóa, điều kiện test case không tồn tại (A07: Không áp dụng) | Không cần |
| C | TC-CPN-91 | Cần người đánh giá chữ là tiếng Việt hay thuật ngữ kỹ thuật | Kiểm tay như HW02 |
| C | TC-CPN-60 đến 82, 118, 130, 131, 140 đến 143 (30 test case) | Chỉ quan sát được bằng request trực tiếp tới API; giao diện không tạo được input tương ứng | Script API của HW02 |

Phần không đo được của test case đã tự động hóa (vị trí và ngôn ngữ của bong bóng trình duyệt; bước sau khi tải lại khi assertion trước đó dừng test; ảnh Playwright chỉ chụp khung nhìn) ghi ở mục 4 của từng `04_gap.md`.

---

## 5. Bug

Chi tiết: [`bugs/bug_report.md`](bugs/bug_report.md). Bug báo ở repo nhóm dùng chung với HW02 (quy ước ở README repo nhóm mục 6): Bug đã có issue từ HW02 thì bình luận "HW04" (tên script, mã TC, trình duyệt, kết quả assertion, ảnh); bug mới tạo issue theo template, gắn thêm label `hw: HW04`.

| Feature | Issue mới | Bình luận HW04 vào issue HW02 | Ảnh trang Issues đã lọc |
|---|---|---|---|
| A: FR-01 | 0 | 6 (#42, #43, #50, #51, #52, #53) | `bugs/screenshots/issues_list_A-FR01_commented.png` |
| B: FR-07 | 1 (#118) | 15 (#67 đến #70, #72 đến #80, #83, #84) | `issues_list_B-FR07_commented.png` |
| C: FR-17 | 2 (#114, #115) | 3 (#55, #56, #57) | `issues_list_C-FR17_commented.png` |
| **Tổng** | **3** | **24** | `issues_list_hw04.png` (lọc `label:"hw: HW04"`) |

Ảnh Playwright chụp khi fail chỉ dùng khi thấy được lỗi; còn lại sinh viên tái hiện bằng tay và tự chụp (hộp thoại bị Playwright tự đóng, dòng lỗi ở cuối bảng ngoài khung nhìn).

---

## 6. Task 2: Video demo

Link: https://youtu.be/nfzV6JFvdG0 (7 phút 00 giây, Unlisted, thuyết minh tiếng Việt).

| Yêu cầu của đề | Trong video |
|---|---|
| Chạy một script automation trọn vẹn | Bộ test FR-17 (18 test case, 4 spec) bằng `node tools/run.mjs C all` |
| Chạy đa trình duyệt | Chrome, Edge, Firefox lần lượt, `globalSetup` reset DB trước mỗi trình duyệt |
| HTML report | Mở report của 3 trình duyệt, tiêu đề "Run by: 23120061" + timestamp ISO, test fail TC-CPN-38 và test qua TC-CPN-30 |
| Kể ≥ 1 chỗ đã sửa trong script AI sinh | 3 chỗ sửa ★ của `03_create_invalid.spec.ts` (commit `19b234a`), xem mục 3.4 |
| Bằng chứng tác giả | Terminal chạy `whoami`, `hostname` |

Sinh viên quay thao tác trước rồi lồng tiếng; thao tác điều khiển bằng [`tools/demo_task2.ps1`](tools/demo_task2.ps1) (chạy lệnh thật, mở file và report thật, sau khi quay khôi phục report chính thức đã commit).

---

## 7. Agent Skill

Thư mục: [`skills/playwright-automation/`](skills/playwright-automation/SKILL.md). Bản trong repo là nguồn chính; bản cài cho Claude Code ở `.claude/skills/` được chép từ đây và kiểm bằng `diff -r` sau mỗi lần sửa. Video demo dùng skill trọn feature FR-01: https://youtu.be/jYuCvhagSy0 (19 phút 33 giây, Unlisted; đã cắt bớt đoạn AI suy nghĩ, tạo file)

| Thành phần | Nội dung |
|---|---|
| `SKILL.md` | Phạm vi 9 bước (`setup`, `select`, `data`, `script`, `review`, `run`, `bugs`, `gap`, `maintain`), cách nhận biết bước tiếp theo từ trạng thái thư mục, quy tắc chung |
| `references/` | Một file cho mỗi bước (`step-*.md`), `rules.md` (nguồn được đọc, oracle, `ai_raw/`, bảng thay đổi, commit), `playwright-patterns.md` (selector, data-driven, cô lập dữ liệu, assertion, dialog, validation, POM, API), `lessons.md` (checklist từng bước, lỗi Playwright hay gặp, "Rút từ lần làm thật") |
| `assets/` | Mẫu bản AI, bảng thay đổi, test case chọn, review, kết quả, bug report, gap; dự án Playwright mẫu (config 3 trình duyệt, "Run by" + ISO) |
| `scripts/` | `check_automation.py` (`spec`, `data`, `same`, `changes`, `format`), `summarize_results.py` (đọc `results.json`), `aria_snapshot.mjs` (chụp DOM lấy selector) |

Skill viết trước khi làm bài, rồi được sửa **17 lần** trong lúc dùng thật trên FR-17 và FR-07 (nhật ký sửa ghi trong lịch sử commit `[skill]`). Ví dụ:

| Gặp ở | Vấn đề | Sửa trong skill |
|---|---|---|
| FR-17 `select` | `check_automation.py changes` nhận nhầm bảng test case chọn là bảng thay đổi (36 lỗi giả) | Nhận bảng theo đúng tên cột |
| FR-17 `script` | Câu hỏi phạm vi 3 kiểu assertion và `expect.soft` đến sau khi giao P1, phải sinh lại `_v2` | Hỏi các câu áp cho mọi phần trước phần đầu |
| FR-17 `review` | `--repeat-each` không dùng được với test có dữ liệu cố định | Chỉ chạy lặp khi dữ liệu cho phép, không thì chạy lại nguyên lượt có reset |
| FR-17 `bugs` | Ảnh Playwright khi fail không thấy lỗi | Xem từng ảnh trước khi dùng; tự chụp khi tái hiện |
| FR-07 `data` | AI sửa dữ liệu trước khi bản AI được commit | Kiểm bản AI đã commit trước khi sửa, chưa thì dừng |
| FR-07 `script` | Dòng bảng bị tách khỏi bảng nên bộ kiểm không đếm; không đếm được kiểu assertion trong `lib/` | `changes` báo dòng bảng không thuộc bảng nào; `spec --with-imports` |
| FR-07, FR-01 `gap` | 13 đề xuất từ gap analysis | Thêm vào `lessons.md`, `step-script.md`, `step-review.md`, `step-bugs.md` |

Hiệu quả thấy ở FR-01 (feature quay video): Các bài học đã thêm được áp dụng ngay (đọc `validity` trước khi bấm, kiểm nguyên nhân đã có hiệu lực, chỉ tính chữ chưa có trước khi bấm, hỏi phạm vi 3 kiểu và cách so chữ trước khi viết, commit bản AI trước khi sửa); FR-01 chỉ có 3 lỗi của AI, không lỗi nào lọt tới lần chạy chính thức.

---

## 8. Test Summary

Bảng đầy đủ ở [`README.md`](README.md).

| Feature | TC tự động hóa | Lượt chạy test (3 trình duyệt) | Pass | Fail | Skip | Bug (issue mới / bình luận) |
|---|---|---|---|---|---|---|
| A: FR-01 | 14 | 42 | 21 | 21 | 0 | 0 / 6 |
| B: FR-07 | 27 (15 giao diện, 12 API) | 81 (57 chạy, 24 bỏ qua theo D17) | 8 | 49 | 24 | 1 / 15 |
| C: FR-17 | 18 | 54 | 39 | 15 | 0 | 2 / 3 |
| **Tổng** | **59** | **177 (153 chạy)** | **68** | **85** | **24** | **3 / 24** |

Số lần chạy trình duyệt: 9 (3 feature × Chrome, Edge, Firefox), 9 HTML report trong [`reports/`](reports/). Mọi test fail đều do hệ thống sai đặc tả (hoặc khác giả định HW02 ở TC-CPN-37); không có test fail do script, khác biệt trình duyệt hay flaky. Commit có sửa `.spec.ts`: 24 (đề yêu cầu ≥ 8).

---

## AI Critique

**AI sai, thiếu ở đâu.** Phần lớn lỗi của AI (17 trên 20) không nằm ở cú pháp mà ở những điều chỉ lộ ra khi chạy: `boundingBox()` chờ tới hết 30 giây khi không có phần tử, form tự xóa sau khi gửi làm `validity` báo sai, dòng dữ liệu vừa tạo nhầm bị coi là thông báo, chữ được vẽ lại bị tính là phản hồi mới, `\2000` thành escape bát phân. AI cũng hay viết assertion qua được cả khi hệ thống sai (TC-CART-54 không kiểm bước 1 đã thêm được dòng). Ở bước chọn, AI để dữ liệu mơ hồ ("giỏ 2 dòng") và giữ test case mà bug đã biết làm mất điều kiện.

**Vì sao AI không bắt được.** AI viết theo nhánh "hệ thống làm đúng": Khi dữ liệu sai bị từ chối thì script ổn, còn khi hệ thống nhận nhầm, đúng nhánh có bug, thì AI chưa thấy trạng thái đó trong snapshot. Quy tắc không cho chạy thử bản AI trước khi giao giữ lại các lỗi này làm bằng chứng, nhưng cũng có nghĩa AI không tự kiểm được hành vi chạy.

**Nguyên tắc rút ra.** (1) Test qua chưa chắc đúng: Phải thử làm hỏng có chủ đích để chắc assertion bắt được lỗi. (2) Hỏi trước những câu áp cho mọi phần (phạm vi assertion, cách so chữ) để không phải sinh lại. (3) Commit bản AI trước khi sửa, ghi mọi thay đổi vào bảng, thì mới đo được AI sai gì. (4) Mỗi lỗi gặp lại nên thành bài học trong skill; FR-01 làm sau cùng chỉ còn 3 lỗi của AI.

---

## Mandatory Disclosure

"Tôi dùng AI (Claude Code, Anthropic, claude-opus-5-5) cho các việc sau: Phân tích đề và lập kế hoạch, dựng dự án Playwright (cấu hình 3 trình duyệt, fixture "Run by", script chạy), viết Agent Skill `playwright-automation` và sửa skill 17 lần theo góp ý của tôi; ở cả 3 feature: Đề xuất test case chọn, sinh file dữ liệu, sinh spec và page object (bản gốc lưu nguyên văn trong `ai_raw/`), chạy thử trên 3 trình duyệt khi tôi nhờ, thử làm hỏng có chủ đích, soạn bảng thay đổi, tóm tắt `results.json`, soạn và đăng bình luận, issue lên GitHub sau khi tôi duyệt, viết gap analysis; kiểm tra phiên làm bài, xuất prompt log, soạn commit message, script hỗ trợ quay video, và soạn báo cáo này. Tôi tự quyết định test case, tiêu chí và mọi câu hỏi mở, review và quyết định từng chỗ sửa, tự chạy chính thức 9 lần trên máy mình để sinh HTML report, tự tái hiện bug bằng tay và chụp ảnh, tự quay và thuyết minh hai video, và tự commit, push. Tôi chịu trách nhiệm về toàn bộ nội dung nộp."

---

## Self-Assessment

| No. | Criteria | Grade | Self-Assessed Grade |
|---|---|---|---|
| 1 | Task 1: Feature A (FR-01) | 25 | 25 |
| 1 | Task 1: Feature B (FR-07) | 25 | 25 |
| 1 | Task 1: Feature C (FR-17) | 25 | 25 |
| 2 | Task 2: Demo video | 15 | 15 |
| 3 | Agent Skills | 10 | 10 |
| | **Total** | **100** | **100** |

---

## Appendix A: Prompt log

Xem [`prompt_log.md`](prompt_log.md) (và `prompt_log.pdf`), chỉ có trong file nộp, không đưa lên repo. Log xuất tự động từ transcript Claude Code bằng [`tools/export_prompt_log.py`](tools/export_prompt_log.py), chỉ gồm các phiên của HW04 (danh sách trắng): Phiên điều phối `27ccb594`, phiên FR-17 `051b68d8`, phiên FR-07 `8897e5a5`, phiên FR-01 (quay video skill) `8a6f8ed4`. Mỗi lượt có mã `Cnn`, thời gian, công cụ, prompt và output nguyên văn, danh sách thao tác AI đã làm. Không dùng công cụ AI nào khác.

---

## Appendix B: AI Audit Report

> Theo mẫu [AI-02] (5 mục cho mỗi artifact). Nguyên văn prompt và output ở `prompt_log.md` (Appendix A, dẫn bằng mã `Cnn`); bản gốc của AI ở `features/<feature>/ai_raw/`. Cột (4) dựa trên bảng "Thay đổi so với bản AI" của từng bước. Phần in đậm ở cột (5) là phần sinh viên thay đổi. Bản form: [`forms/[AI-02] - FIT@HCMUS - AI Audit Report_Vn.md`](forms/).

Công cụ khai báo theo đề §8: Claude Code (Anthropic, claude-opus-5-5) là công cụ AI duy nhất; Playwright 1.65.0 và Playwright HTML reporter.

"I use AI tools for the following tasks" (Tôi dùng công cụ AI cho các việc dưới đây):

| Artifact | (1) Prompt + công cụ + thời gian | (2) Output AI | (3) Verdict | (4) Lý do | (5) Bản SV sửa |
|---|---|---|---|---|---|
| B01: Phân tích đề, kế hoạch, tracker, `WORKFLOW.md`, dự án Playwright | Claude Code, phiên điều phối `27ccb594`, C01 đến C09, 15/11/2026 | Tóm tắt yêu cầu, danh sách việc và file nộp, quy trình 8 bước; `playwright.config.ts` 3 project, fixture "Run by" + annotation `Browser`, `tools/run.mjs`, JSON reporter | **INCOMPLETE** | Đề không yêu cầu hộp đen; sinh viên chốt nới quy ước (được đọc DOM và mã frontend để lấy selector). Ghép "A x Chrome, B x Edge, C x Firefox" bị loại vì mỗi feature phải chạy cả 3 trình duyệt | Sinh viên chốt **D1 đến D17** (repo cá nhân, Issues ở repo nhóm HW02, 2 video riêng, FR-17 để sửa skill, FR-01 quay video) |
| B02: Agent Skill `playwright-automation` bản đầu | Phiên `27ccb594`, C05 đến C07, 15/11/2026 (commit `bb8687a`) | `SKILL.md`, 12 file `references/`, mẫu, 3 script kiểm | **INCOMPLETE** | Viết trước khi làm thật; 17 lần sửa sau khi dùng (mục 7) | Sinh viên duyệt **từng lần sửa** |
| B03: FR-17 `select`, `data` | Phiên FR-17 `051b68d8`, C10 đến C20, 15/11 đến 16/11/2026 | `ai_raw/select.md` (115 test case, 18 chọn), `ai_raw/data.md` (4 file JSON) | **INCOMPLETE** | `select`: 4 lỗi (thiếu TC-CPN-39, lời biện minh thừa, 7 mã dự phòng không lọc, thiếu tiền điều kiện đăng nhập); AI đếm tay sai dòng tổng. `data`: Không lỗi, 2 quyết định | Sinh viên **thay TC-CPN-95 bằng TC-CPN-39**, chọn CH-select-01 đến 05, CH-data-01 b, **CH-data-03 c** (thêm từ tiếng Anh vào chuỗi cấm) |
| B04: FR-17 `script` P1 đến P4 (kèm `_v2` P1, P2) | Phiên `051b68d8`, C21 đến C32, 16/11/2026 | 4 spec, `AdminCouponsPage`, `globalSetup` reset DB và đăng nhập, `lib/expectCell.ts` | **INCOMPLETE** | Câu hỏi phạm vi 3 kiểu và `expect.soft` đến sau P1 nên P1, P2 phải sinh lại `_v2` | Sinh viên chọn **CH-script-01 b, 02 b, 04 b** (mỗi spec đủ 3 kiểu, soft cho từng ô) |
| B05: FR-17 `review` (chạy thử 3 trình duyệt) | Phiên `051b68d8`, C33 đến C37, 16/11/2026 | 5 lượt chạy thử, phân loại test fail, 3 đề xuất sửa P3 | **INCOMPLETE** | Bản AI P3 có 3 lỗi chỉ lộ khi chạy (mục 3.2) | Sinh viên **duyệt 3 chỗ sửa ★**, bỏ `--repeat-each` vì dữ liệu cố định |
| B06: FR-17 `run`, `bugs`, `gap` | Phiên `051b68d8`, C40 đến C51, 17/11/2026 | `03_results.md` từ `results.json`; bản nháp 3 bình luận, 2 issue; đăng sau khi duyệt; `04_gap.md` | **VALID** | Số liệu khớp `results.json`; đăng chỉ sau khi sinh viên bảo "đăng đi" | Sinh viên **tự chạy chính thức**, chốt phân loại, **tự chụp ảnh tái hiện** |
| B07: FR-07 `select`, `data` | Phiên FR-07 `8897e5a5`, C53 đến C61, 17/11/2026 | `ai_raw/select.md` (38 test case, 15 giao diện + 12 API), `ai_raw/data.md` (9 file JSON) | **INCOMPLETE** | `select`: "Giỏ 2 dòng" mơ hồ, TC-CART-93 bị #72 chặn điều kiện. `data`: TC-CART-08 thiếu số dòng và tổng sau khi thêm lại; AI sửa JSON trước khi bản AI được commit | Sinh viên **chốt sản phẩm (D-08)**, **bỏ TC-CART-93**, thêm `rowCount`, `total` |
| B08: FR-07 `script` P1 đến P7 | Phiên `8897e5a5`, C62 đến C90, 17/11/2026 | 7 spec, 4 page object, `lib/` (feedback, money, cartChecks, cartApi, removeDialog) | **INCOMPLETE** | P1 bỏ qua ô khi có dòng trùng (#70); spec API chỉ 2 kiểu assertion (AI để nguyên lỗi và hỏi) | Sinh viên góp ý **`row.first()`**, chọn CH-script-01 đến 06 (**kiểu trong `lib/` tính cho spec**, ngoại lệ spec API) |
| B09: FR-07 `review` | Phiên `8897e5a5`, C91 đến C101, 17/11/2026 | 4 lượt chạy thử, S1, S2 sửa khi chạy, N1, N2 khi rà test qua, `--repeat-each=3` cho P1 đến P5 | **INCOMPLETE** | S1 (bát phân), S2 (chữ vẽ lại), N1 (biên mẫu số), N2 (TC-CART-54 qua không chứng minh gì) | Sinh viên **duyệt S1, S2, N1, N2**; để TC-CART-100 tới bước `bugs` |
| B10: FR-07 `run`, `bugs`, `gap` | Phiên `8897e5a5`, C102 đến C113, 17/11/2026 | `03_results.md`; 15 bình luận và issue #118; `04_gap.md` (7 đề xuất skill) | **VALID** | Số liệu khớp `results.json`; chỉ dùng 9 ảnh Playwright thấy được lỗi; đăng sau khi sinh viên bảo "Đăng cả hai" | Sinh viên **tự chạy chính thức**, reset DB, **tái hiện TC-CART-100 bằng tay** |
| B11: FR-01 `select`, `data` | Phiên FR-01 `8a6f8ed4`, C115 đến C124, 17/11/2026 | `ai_raw/select.md` (96 test case, 14 chọn), `ai_raw/data.md` (5 file JSON) | **INCOMPLETE** | `select`: Kết quả mong đợi TC-REG-95 tính cả nhãn của ô bị thiếu (#43); thiếu mục "Điều kiện tiên quyết chung" | Sinh viên **sửa TC-REG-95** (3 nhãn), chọn CH-select-01 đến 07, CH-data-01 đến 03 |
| B12: FR-01 `script` P1 đến P5 | Phiên `8a6f8ed4`, C125 đến C138, 18/11/2026 | 5 spec, `RegisterPage`, `LoginPage`, `fieldByLabel`, `lib/color.ts`, reset DB | **INCOMPLETE** | `fieldByLabel` lọc mọi `div` chứa nhãn (strict mode); `recordTexts` thiếu lọc hiển thị như `newTexts` | Sinh viên **tự phát hiện 2 lỗi khi đọc bản AI**, **đổi quyết định so chữ đúng hoa thường** (CH-script-04) |
| B13: FR-01 `review`, `run`, `bugs`, `gap` | Phiên `8a6f8ed4`, C138 đến C152, 18/11/2026 | Chạy thử 3 trình duyệt; thử làm hỏng M1 đến M8; `03_results.md`; 6 bình luận; `04_gap.md` | **VALID** | M4 cho thấy test P3 qua cả với mật khẩu hợp lệ vì #42, được ghi thành annotation "Giới hạn quan sát" | Sinh viên chọn **CH-review-01 b**, **tự chạy chính thức** |
| B14: Phiên điều phối: Kiểm tra phiên làm bài, sửa skill, commit message, prompt log | Phiên `27ccb594`, từ C11, 16/11/2026 đến 18/11/2026 | Kiểm từng bước (`tsc`, `check_automation.py`, đối chiếu `results.json`, GitHub), 17 lần sửa skill, lệnh commit, xuất log | **INCOMPLETE** | Bắt được: Dòng bảng bị tách, commit thiếu 4 file JSON, đổi thứ tự commit, câu ghi cũ; sinh viên duyệt mọi lần sửa skill. Ước tính thời gian còn lại thường dư | Sinh viên **duyệt từng đề xuất skill**, tự commit và push |
| B15: Kịch bản và script quay video Task 2, báo cáo này | Phiên `27ccb594`, C153 đến C165, 18/11/2026 | Kịch bản quay và lồng tiếng (sườn), `tools/demo_task2.ps1` (chỉ điều khiển thao tác: Chạy lệnh thật, mở file và report thật), `report.md`, README, đóng gói | **INCOMPLETE** | Script chỉ thao tác, không tạo hay sửa kết quả. Nhưng bước khôi phục report sau khi quay chỉ dùng `git restore`, không tính tới trace bị `.gitignore` chặn, nên trace của lần chạy chính thức FR-17 bị mất (phát hiện khi kiểm bản tải về). Bảng mục 2 `bug_report.md` và danh sách lồng nhau vỡ khi xuất PDF, sửa sau khi sinh viên phát hiện | Sinh viên **chọn FR-17**, **quyết định quay đoạn nào**, **tinh chỉnh lời thuyết minh**, **tự lồng tiếng và dựng video**, **phát hiện bảng vỡ trong PDF**, **tải bản nộp về kiểm**, chọn **điểm tự chấm** |

### Tổng kết độ chính xác AI

| Chỉ số | Số lượng | Tỉ lệ |
|---|---|---|
| Tổng artifact AI sinh đã audit | 15 | 100% |
| VALID (đúng, dùng nguyên) | 3 | 20,0% |
| INVALID (sai, loại bỏ) | 0 | 0,0% |
| INCOMPLETE (chấp nhận sau khi sửa) | 12 | 80,0% |

### Kết luận: Khi nào nên, không nên dùng AI?

Nên dùng AI để sinh khung script data-driven, page object và file dữ liệu từ test case có sẵn, chạy thử nhiều trình duyệt, đọc `results.json`, và soạn các bản ghi lặp lại (bảng kết quả, bình luận bug); những việc này nhanh hơn nhiều so với làm tay và ít sai về cú pháp. Không nên tin AI ở chỗ quyết định script có kiểm đúng hay không: AI viết theo nhánh hệ thống làm đúng, nên assertion có thể qua cả khi hệ thống sai; phải chạy thử, đọc cả test qua và thử làm hỏng có chủ đích. Kết quả chính thức, ảnh bằng chứng và các quyết định về oracle phải do người làm.
