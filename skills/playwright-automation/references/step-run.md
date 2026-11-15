# Bước `run`: Chạy chính thức trên 3 trình duyệt

**Mục tiêu:** 3 HTML report thật (mỗi trình duyệt một report) có "Run by" + ISO, và bản tóm tắt kết quả phân loại rõ test fail do bug với test fail do script.

**Đầu ra:** `reports/<feature>/<chrome|edge|firefox>/` (index.html, results.json), `03_results.md`. Mẫu: `assets/templates/results.md`.

## Pha 1: Checklist trước khi chạy (AI soạn, sinh viên làm)

- [ ] Server của hệ thống đang chạy (ví dụ backend, frontend web, frontend admin).
- [ ] Dữ liệu ở trạng thái đúng theo cách dự án chốt (reset DB trước **mỗi** trình duyệt nếu chốt phương án a).
- [ ] `git status` sạch phần `tests/` (chạy đúng code đã commit, để report khớp lịch sử git).
- [ ] Không còn `test.only`; `npx tsc --noEmit` qua.

**Dừng** chờ sinh viên chạy.

## Pha 2: Sinh viên chạy

```
node tools/run.mjs <feature> all          # hoặc từng trình duyệt: node tools/run.mjs <feature> chrome
```

Nếu reset dữ liệu giữa các trình duyệt thì chạy từng trình duyệt một, reset trước mỗi lần.

Chạy lại sau khi sửa script: Chạy lại **cả** trình duyệt đó (report bị ghi đè), không ghép report. Lần chạy nào được nộp thì `03_results.md` ghi đúng timestamp của lần đó.

## Pha 3: Tóm tắt (AI nháp, sinh viên chốt)

1. `python -I <skill>/scripts/summarize_results.py reports/<feature>` ra bảng nháp: Mỗi trình duyệt (timestamp, phiên bản, số pass / fail / skip / flaky) và danh sách test fail (mã TC, trình duyệt, dòng đầu của lỗi).
2. Mỗi test fail một mã `F-nn`. Đề xuất phân loại kèm bằng chứng:
   - `Bug`: Assertion đúng với đặc tả (dẫn câu đặc tả / mã TC), hệ thống làm khác. Fail ở mọi trình duyệt là dấu hiệu mạnh.
   - `Khác biệt trình duyệt`: Chỉ fail ở một trình duyệt, chạy lại vẫn fail; ghi hành vi khác nhau thế nào.
   - `Script`: Lỗi của script lọt qua bước review; phải sửa (quay lại `review`, commit sửa, chạy lại trình duyệt đó).
   - `Flaky`: Lúc qua lúc fail khi chạy lại; ghi nguyên nhân nghi ngờ và cách sửa.
3. Đối chiếu bug đã biết của feature (bug report / issue của bài trước): Test fail khớp bug cũ thì ghi số issue cũ.
4. Sinh viên chốt phân loại. `03_results.md` ghi: Môi trường (OS, trình duyệt và phiên bản lấy từ annotation `Browser`, phiên bản Playwright, lệnh đã chạy), bảng kết quả, danh sách `F-nn`, ghi chú. Cột issue điền ở bước `bugs`.

## Tự kiểm

- Timestamp trong `03_results.md` khớp tiêu đề của từng report.
- Tổng số test mỗi trình duyệt bằng số test case đã chọn (trừ test case có quyết định bỏ).
- Không có fail nào để trống phân loại.
- Checklist bước `run` trong `lessons.md`.

**Dừng.** Commit message ví dụ: `[A-FR01][run] Add Chrome, Edge and Firefox reports`.
