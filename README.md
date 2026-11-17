# HW04-AI: Automation Testing on EShop (Software Testing 2026)

Sinh viên: Nguyễn Thị Ánh Ngọc
MSSV: 23120061

SUT: [EShop](https://github.com/ttbhanh/eshop-sut) (commit `85af3ba`)

Repo: https://github.com/angquoc/software-testing-2026-HW04

## Cấu trúc

| Đường dẫn | Nội dung |
|---|---|
| `report.md` / `report.pdf` | Báo cáo chính: Báo cáo automation, review và gap analysis script AI sinh, Agent Skill, AI Critique, Disclosure, AI Audit Report |
| `WORKFLOW.md` | Quy trình làm bài: Các bước, cách chạy, quy ước commit |
| `features/` | Mỗi feature một thư mục: Test case được chọn, bản AI nguyên văn (`ai_raw/`), bản review có bảng "Thay đổi so với bản AI", kết quả chạy, test case không tự động hóa được |
| `tests/` | Script Playwright (`*.spec.ts`) và file dữ liệu (`data/*.json`, `*.csv`) của từng feature; `support/` (fixture gắn "Run by", URL) |
| `playwright.config.ts` | 3 project `chrome`, `edge`, `firefox`; HTML reporter có "Run by: 23120061" + timestamp ISO |
| `reports/` | HTML report của Playwright: Mỗi feature trên mỗi trình duyệt một report (`reports/<feature>/<trình duyệt>/index.html`), có "Run by: 23120061" và timestamp ISO ở tiêu đề và ở từng test |
| `bugs/` | Bug report, liên kết tới GitHub Issues của nhóm, ảnh trang Issues |
| `skills/` | Agent Skill `playwright-automation`: Sinh và bảo trì script Playwright data-driven, đa trình duyệt, đi từng bước |
| `forms/` | [AI-02] Audit Report, [AI-03] Disclosure, [AI-05] Privacy Checklist |
| `tools/` | `run.mjs` (chạy 1 feature trên 1 hoặc 3 trình duyệt), script hỗ trợ (xuất prompt log, xuất PDF, đóng gói) |
| `git_log.txt` | Git commit log (chỉ có trong file nộp) |
| `prompt_log.md` / `.pdf` | Prompt log có timestamp (chỉ có trong file nộp, không đưa lên repo) |

## Chạy test

Cần Node 24 và 3 server EShop đang chạy (backend 3000, Web 5173, Admin 5174). Chi tiết ở `WORKFLOW.md` mục 4.

```
npm install
node tools/run.mjs A all        # FR-01 trên Chrome, Edge, Firefox (B: FR-07, C: FR-17)
```

## Feature đã chọn

Cùng 3 feature Web đã chọn ở HW02 (đề HW04 mục 5).

| Pool | Feature | Nền tảng | Thư mục |
|---|---|---|---|
| A | FR-01 Đăng ký tài khoản | Web | `features/A_FR-01_DangKy/` |
| B | FR-07 Giỏ hàng | Web | `features/B_FR-07_GioHang/` |
| C | FR-17 Quản lý mã giảm giá (CRUD) | Web Admin | `features/C_FR-17_QuanLyCoupon/` |

Trình duyệt: Chrome, Edge, Firefox. Mỗi feature chạy trên cả 3 trình duyệt (9 lần chạy).

## Test Summary Report

Số liệu từ lần chạy chính thức (`features/<feature>/03_results.md`, 9 HTML report trong `reports/`). "Đã chạy", "Pass", "Fail" đếm lượt test trên cả 3 trình duyệt.

| Feature | TC tự động hóa | Đã chạy | Pass | Fail | Lần chạy trình duyệt | Bug (issue mới / bình luận vào issue HW02) |
|---|---|---|---|---|---|---|
| A: FR-01 | 14 | 42 | 21 | 21 | 3 (Chrome, Edge, Firefox) | 0 / 6 |
| B: FR-07 | 27 (15 giao diện, 12 API chỉ chạy trên Chrome) | 57 (24 bỏ qua theo D17) | 8 | 49 | 3 (Chrome, Edge, Firefox) | 1 / 15 |
| C: FR-17 | 18 | 54 | 39 | 15 | 3 (Chrome, Edge, Firefox) | 2 / 3 |
| **Tổng** | **59** | **153** | **68** | **85** | **9** | **3 / 24** |

- Số feature: 3. Mọi test fail đều do hệ thống sai đặc tả; không có test fail do script, khác biệt trình duyệt hay flaky.
- Issue mới: #114, #115 (FR-17), #118 (FR-07). Chi tiết: `bugs/bug_report.md`.
- Commit có sửa `.spec.ts`: 24 (đề yêu cầu ≥ 8); git log trong `git_log.txt` của file nộp.

## Video demo

| Nội dung | Link |
|---|---|
| Task 2: Chạy script automation đa trình duyệt (FR-17), HTML report, kể chỗ sửa script AI | https://youtu.be/nfzV6JFvdG0 (7:00, Unlisted) |
| Agent Skill: Dùng skill `playwright-automation` trọn feature FR-01 | https://youtu.be/jYuCvhagSy0 (19:33, Unlisted) |

## Self-Assessment

| No. | Criteria | Grade | Self-Assessed Grade |
|---|---|---|---|
| 1 | Task 1: Feature A (FR-01) | 25 | 25 |
| 1 | Task 1: Feature B (FR-07) | 25 | 25 |
| 1 | Task 1: Feature C (FR-17) | 25 | 25 |
| 2 | Task 2: Demo video | 15 | 15 |
| 3 | Agent Skills | 10 | 10 |
| | **Total** | **100** | **100** |
