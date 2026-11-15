# Bước `setup`: Dựng hoặc kiểm dự án Playwright

**Mục tiêu:** Dự án chạy được 1 feature trên 3 trình duyệt, mỗi lần chạy ra 1 HTML report có "Run by: <MSSV>" và timestamp ISO (ở tiêu đề report và ở annotation từng test), kèm `results.json`.

**Đầu ra:** `package.json`, `tsconfig.json`, `playwright.config.ts`, `tests/support/{fixtures,runInfo,urls,data}.ts`, `tools/run.mjs`, `.gitignore` có `playwright-report/`, `test-results/`, `node_modules/`.

## Dự án đã có sẵn

Kiểm từng điểm, báo điểm thiếu; **không** ghi đè file của dự án khi chưa được đồng ý:

- [ ] `playwright.config.ts` có 3 project (tên trùng tên trình duyệt), reporter `html` có `title` chứa "Run by", reporter `json` ghi `results.json` cạnh report.
- [ ] `tests/support/fixtures.ts` có auto fixture gắn annotation `Run by` và `Browser`.
- [ ] `tools/run.mjs` chạy được `node tools/run.mjs smoke all` (hoặc feature có sẵn) và ra đủ 3 report.
- [ ] `tests/support/runInfo.ts` có đúng MSSV.
- [ ] `npx tsc --noEmit` không lỗi.

## Dự án mới

1. Hỏi: MSSV, URL các phần của hệ thống, 3 trình duyệt (mặc định Chrome, Edge, Firefox; hoặc Chromium, Firefox, WebKit), phiên bản Playwright (ưu tiên bản khớp trình duyệt đã cài trên máy: So `revision` trong `browsers.json` của `playwright-core` với thư mục `ms-playwright`).
2. Chép `assets/project/` vào thư mục dự án; thay `<STUDENT_ID>` trong `tests/support/runInfo.ts`; sửa `tests/support/urls.ts`; sửa project trong `playwright.config.ts` nếu dùng bộ trình duyệt khác.
3. `npm install`; nếu dùng Firefox / WebKit của Playwright mà máy chưa có: `npx playwright install firefox`.
4. Viết `tests/_smoke/smoke.spec.ts` (mở trang chủ, kiểm một phần tử) và chạy `node tools/run.mjs smoke all`.
5. Mở một report, kiểm tiêu đề và annotation; báo đường dẫn để sinh viên tự xem.

## Hỏi trước khi viết

- Bộ trình duyệt, phiên bản Playwright.
- Chạy tuần tự (`workers: 1`) hay song song: Phụ thuộc cách cô lập dữ liệu (`playwright-patterns.md` mục 3). Mặc định tuần tự cho đến khi dự án chốt.
- Kèm gì khi test fail (ảnh, trace, video): Ảnh hưởng dung lượng report (một test fail có ảnh + trace khoảng 2 MB).

## Tự kiểm

- Report test mẫu có "Run by: <MSSV> | <ISO> | <feature> x <trình duyệt>" ở tiêu đề; trang chi tiết test có annotation `Run by` và `Browser`.
- Report test mẫu không nằm trong file nộp (`.gitignore` chặn `reports/_smoke/`).

**Dừng**, đưa commit message (ví dụ `[setup] Add Playwright project with Run-by HTML reports`).
