# Điều khiển các cảnh S1 đến S9 khi quay video Task 2 (FR-17), theo kịch bản quay thao tác.
# Chỉ mở file, chạy lệnh thật và mở report thật; không tạo hay sửa kết quả nào.
# Cách chạy (trong thư mục HW04, terminal PowerShell của VS Code):
#   powershell -ExecutionPolicy Bypass -File tools\demo_task2.ps1
# Mỗi cảnh dừng chờ Enter để bạn nói hoặc thao tác thêm; khi dựng thì cắt các dòng "Enter để tiếp".

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Set-Location (Split-Path -Parent $PSScriptRoot)

$Feature = 'C_FR-17_QuanLyCoupon'
$Spec = "tests/$Feature/03_create_invalid.spec.ts"
$Data = "tests/$Feature/data/create_invalid.json"
$Review = "features/$Feature/02_review.md"
$Results = "features/$Feature/03_results.md"
$FixCommit = '19b234a'

function Pause-Step([string]$Next) {
    Write-Host ''
    Read-Host "[Enter để tiếp: $Next]" | Out-Null
}

function Open-Code([string]$PathLine) {
    & code -g $PathLine
}

# ---- Kiểm tra trước khi quay (không cần quay đoạn này) ----
Write-Host '== Kiểm tra trước khi quay ==' -ForegroundColor Yellow
$ok = $true
foreach ($u in 'http://localhost:3000/api/products', 'http://localhost:5173', 'http://localhost:5174') {
    try {
        $r = Invoke-WebRequest $u -UseBasicParsing -TimeoutSec 5
        Write-Host "  $u : HTTP $($r.StatusCode)"
    } catch {
        Write-Host "  $u : KHÔNG CHẠY" -ForegroundColor Red
        $ok = $false
    }
}
$dirty = git status --porcelain -- "reports/$Feature"
if ($dirty) {
    Write-Host "  reports/$Feature đang có thay đổi chưa commit; xử lý trước khi quay." -ForegroundColor Red
    $ok = $false
}
if (-not $ok) { Write-Host 'Dừng: Sửa các mục đỏ rồi chạy lại.' -ForegroundColor Red; exit 1 }
Write-Host '  Sẵn sàng. Bắt đầu quay màn hình rồi bấm Enter.' -ForegroundColor Green
Pause-Step 'S1 whoami, hostname'
Clear-Host

# ---- S1 ----
Write-Host 'PS> whoami'; whoami
Write-Host 'PS> hostname'; hostname
Write-Host 'PS> git log -1 --format=%an'; git log -1 --format=%an
Pause-Step 'S2 file dữ liệu'

# ---- S2 ----
Open-Code "${Data}:62"
Pause-Step 'S3 spec: Vòng lặp sinh test'

# ---- S3 ----
Open-Code "${Spec}:46"
Pause-Step 'S3 spec: validity trước khi bấm'
Open-Code "${Spec}:88"
Pause-Step 'S3 spec: count() trước boundingBox()'
Open-Code "${Spec}:115"
Pause-Step 'S3 spec: pageLines'
Open-Code "${Spec}:35"
Pause-Step 'S4 commit sửa của SV'

# ---- S4 ----
Clear-Host
Write-Host "PS> git show $FixCommit -- $Spec"
git --no-pager show --color=always $FixCommit -- $Spec
Pause-Step 'S4 bảng thay đổi (3 dòng ★)'
Open-Code "${Review}:111"
Pause-Step 'S5 trang Mã Giảm Giá (Web Admin)'

# ---- S5 ----
Start-Process 'http://localhost:5174'
Write-Host '  Đăng nhập admin nếu cần, mở menu "Mã Giảm Giá".'
Pause-Step 'S6 chạy 3 trình duyệt (khoảng 5 đến 6 phút)'

# ---- S6 ----
Clear-Host
Write-Host 'PS> node tools/run.mjs C all'
node tools/run.mjs C all
Pause-Step 'S7 report Chrome'

# ---- S7 ----
Start-Process (Resolve-Path "reports/$Feature/chrome/index.html")
Write-Host '  Chỉ tiêu đề "Run by"; lọc Failed, mở TC-CPN-38; mở 1 test qua (TC-CPN-30).'
Pause-Step 'S8 report Edge'

# ---- S8 ----
Start-Process (Resolve-Path "reports/$Feature/edge/index.html")
Pause-Step 'S8 report Firefox'
Start-Process (Resolve-Path "reports/$Feature/firefox/index.html")
Pause-Step 'S9 bảng tóm tắt 03_results.md'

# ---- S9 ----
Open-Code "${Results}:10"
Pause-Step 'Kết thúc quay. Dừng quay màn hình rồi bấm Enter'

# ---- Sau khi quay: Trả lại report chính thức đã commit ----
$ans = Read-Host "Khôi phục report chính thức của $Feature (xóa report vừa sinh khi quay)? (y/n)"
if ($ans -eq 'y') {
    git restore -- "reports/$Feature"
    git clean -fd -- "reports/$Feature"
    $left = git status --porcelain -- "reports/$Feature"
    if ($left) { Write-Host "Còn thay đổi:`n$left" -ForegroundColor Red }
    else { Write-Host 'Đã khôi phục; reports khớp commit.' -ForegroundColor Green }
} else {
    Write-Host "Chưa khôi phục. Khi cần: git restore -- reports/$Feature ; git clean -fd -- reports/$Feature" -ForegroundColor Yellow
}
