# Khung dự án Playwright (bước `setup`)

Chép các file này vào thư mục dự án, rồi:

1. `tests/support/runInfo.ts`: Thay `<STUDENT_ID>` bằng MSSV.
2. `tests/support/urls.ts`: Sửa địa chỉ các phần của hệ thống.
3. `package.json`: Điền tên và phiên bản (ưu tiên Playwright khớp trình duyệt đã có trên máy).
4. `playwright.config.ts`: Sửa `projects` nếu dùng bộ trình duyệt khác Chrome / Edge / Firefox.
5. `.gitignore`: Thêm `node_modules/`, `test-results/`, `playwright-report/`, `reports/_smoke/`.
6. `npm install`, viết `tests/_smoke/smoke.spec.ts`, chạy `node tools/run.mjs smoke all`.

| File | Vai trò |
|---|---|
| `playwright.config.ts` | 3 project; HTML reporter có tiêu đề "Run by: <MSSV> \| <ISO> \| <feature> x <trình duyệt>"; JSON reporter ghi `results.json` cạnh report; ảnh + trace khi fail |
| `tests/support/fixtures.ts` | Auto fixture gắn annotation `Run by` và `Browser` vào từng test; spec import `test`, `expect` từ đây |
| `tests/support/runInfo.ts` | MSSV, hàm timestamp ISO có múi giờ |
| `tests/support/data.ts` | `loadJson`, `loadCsv` |
| `tools/run.mjs` | Chạy 1 feature trên 1 hoặc 3 trình duyệt, mỗi trình duyệt 1 report ở `reports/<feature>/<trình duyệt>/`; từ chối spec import `test` thẳng từ `@playwright/test` |
