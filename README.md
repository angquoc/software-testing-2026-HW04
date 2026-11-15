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
| `demo/` | Kết quả chạy Agent Skill trong video demo |
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

| Feature | TC tự động hóa | Đã chạy | Pass | Fail | Lần chạy trình duyệt | Bug |
|---|---|---|---|---|---|---|
| A: FR-01 | | | | | | |
| B: FR-07 | | | | | | |
| C: FR-17 | | | | | | |
| **Tổng** | | | | | | |

## Video demo

| Nội dung | Link |
|---|---|
| Task 2: Chạy script automation đa trình duyệt, HTML report | |
| Agent Skill | |

## Self-Assessment

| No. | Criteria | Grade | Self-Assessed Grade |
|---|---|---|---|
| 1 | Task 1: Feature A (FR-01) | 25 | |
| 1 | Task 1: Feature B (FR-07) | 25 | |
| 1 | Task 1: Feature C (FR-17) | 25 | |
| 2 | Task 2: Demo video | 15 | |
| 3 | Agent Skills | 10 | |
| | **Total** | **100** | |
