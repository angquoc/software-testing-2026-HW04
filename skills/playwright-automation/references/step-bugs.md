# Bước `bugs`: Bug report và GitHub Issues

**Mục tiêu:** Mỗi test fail phân loại `Bug` (hoặc `Khác biệt trình duyệt` mà sinh viên coi là lỗi) có một issue mới hoặc một bình luận vào issue đã có, có ảnh; bug report liệt kê đủ và nêu test fail nào không báo, vì sao.

**Đầu ra:** `bugs/bug_report.md` (mẫu `assets/templates/bug_report.md`); issue / bình luận trên repo nhóm; cột issue trong `03_results.md`; ảnh danh sách issue đã lọc trong `bugs/screenshots/`.

## Hỏi trước khi làm

- Quy ước của nhóm (đọc README repo nhóm): Tiêu đề, template, label bắt buộc (kể cả label đánh dấu bài, ví dụ `hw: HW04`), cách chọn severity, cách xử lý bug đã có issue từ bài trước.
- Ai chạy lệnh `gh`: Sinh viên, hay AI chạy sau khi sinh viên duyệt. Tạo issue và bình luận là **đăng công khai**.

## Pha 1: Chọn (AI đề xuất, sinh viên chốt)

Với mỗi `F-nn` phân loại `Bug`:

1. Tìm issue đã có:

   ```bash
   gh issue list -R <owner>/<repo> --state all --limit 200 --search "<mã FR> <từ khóa>"
   gh issue view <số> -R <owner>/<repo>
   ```

2. Quyết định: **Bình luận** vào issue cũ (cùng lỗi gốc) hay **tạo mới**. Nhiều `F-nn` cùng lỗi gốc (cùng test case trên 3 trình duyệt, hoặc nhiều test case cùng nguyên nhân) gộp vào một issue / một bình luận.
3. Severity: Theo câu hỏi của nhóm; AI đề xuất kèm lý do, sinh viên chốt.

Bảng đề xuất: `B-nn`, các `F-nn`, mã TC, trình duyệt, tiêu đề, severity, tạo mới hay bình luận (số issue). **Dừng.**

## Pha 2: Soạn

- **Issue mới**: Thân issue viết đúng các trường của template (mỗi trường một tiêu đề `### <nhãn trường>`, vì tạo bằng `gh` thì form không hiện). Trường "Test case": Mã TC và tên script (`tests/<feature>/<file>.spec.ts`). Trường "Các bước": Bước tái hiện bằng tay (người đọc issue không cần chạy Playwright), kèm lệnh chạy test. "Kết quả mong đợi": Trích đặc tả. "Kết quả thực tế": Chép thông báo lỗi assertion (Expected / Received) và những gì thấy trên giao diện. "Môi trường": Trình duyệt và phiên bản, OS, timestamp lần chạy.
- **Bình luận vào issue cũ**: "Tái hiện bằng automation (<bài>, <MSSV>)": Script và mã TC, trình duyệt bị lỗi, kết quả assertion, timestamp lần chạy, ảnh.
- Ảnh: Lấy ảnh Playwright chụp khi fail (đường dẫn trong `results.json`, mục `attachments`, thường nằm trong `test-results/`), hoặc sinh viên tự chụp thêm. Không chỉnh nội dung ảnh.

Sinh viên duyệt nội dung. **Dừng.**

## Pha 3: Đăng (sau khi sinh viên cho phép)

```bash
gh issue create -R <owner>/<repo> --title "<tiêu đề>" --body-file <file> \
  --label "bug" --label "severity: <mức>" --label "<label nền tảng>" --label "<label bài>" ... --assignee @me
gh issue comment <số> -R <owner>/<repo> --body-file <file>
```

Chèn ảnh: `gh` không tải ảnh lên được. Kéo nhiều ảnh cùng lúc vào **một ô bình luận** trên GitHub (không gửi), chép các link GitHub sinh ra, ghép với tên file theo **thứ tự kéo thả** đã ghi sẵn; chèn vào issue bằng `gh issue edit <số> --body-file <file>` (hoặc vào bình luận bằng cách sửa bình luận trên web), mỗi ảnh có tên file in đậm ngay trên. Kiểm lại từng ảnh sau khi chèn.

## Pha 4: Bug report

`bugs/bug_report.md`: Đầu file (người báo, repo, nguồn: Lần chạy nào, timestamp); cách chọn; bảng issue mới; bảng bình luận vào issue cũ; bảng test fail không báo kèm lý do; ảnh trang Issues đã lọc (theo label của bài, và các issue cũ đã bình luận). Điền cột issue trong `03_results.md`.

## Tự kiểm

- Mỗi `F-nn` phân loại `Bug` có mặt ở đúng một nơi: Issue mới, bình luận, hoặc bảng "không báo" có lý do.
- Mỗi issue / bình luận có ảnh đúng test case; label đủ; tiêu đề đúng quy ước.
- Checklist bước `bugs` trong `lessons.md`.

**Dừng.** Commit message ví dụ: `[A-FR01][bugs] Report bugs found by automation`.
