# <Feature>: Kết quả chạy chính thức

- Người chạy: <MSSV> (chạy trên máy của sinh viên)
- Lệnh: `node tools/run.mjs <feature> all`
- Commit của script khi chạy: `<hash>`
- Môi trường: <OS>; Playwright <phiên bản>; dữ liệu: <cách reset / cô lập>

## 1. Tóm tắt

| Trình duyệt | Phiên bản | Timestamp (khớp tiêu đề report) | Tổng | Pass | Fail | Skip | Flaky | Report |
|---|---|---|---|---|---|---|---|---|
| Chrome | | | | | | | | `reports/<feature>/chrome/index.html` |
| Edge | | | | | | | | `reports/<feature>/edge/index.html` |
| Firefox | | | | | | | | `reports/<feature>/firefox/index.html` |

## 2. Test fail

| Mã | Test case | Trình duyệt | Lỗi (dòng đầu) | Phân loại | Bằng chứng | Issue |
|---|---|---|---|---|---|---|
| F-01 | TC-XXX-07 | Chrome, Edge, Firefox | | Bug / Khác biệt trình duyệt / Script / Flaky | <Câu đặc tả, Expected / Received> | #<số> hoặc bình luận |

## 3. Ghi chú

- <Chạy lại trình duyệt nào, vì sao; test có quyết định đặc biệt>
