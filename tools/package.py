"""Đóng gói bài nộp HW04 cho Moodle.

Chạy SAU commit cuối:  python tools/package.py [điểm tự chấm, 3 chữ số; mặc định 100]
1. Xuất git_log.txt (git log --date=iso).
2. Gom mọi file git đang theo dõi (git ls-files), git_log.txt và các file không đưa lên repo public
   (EXTRA: prompt log) vào một file zip, đặt trong thư mục gốc 23120061_HW04_AI_Automation_<điểm>/.
   Tên file theo đề HW04 mục 14: <StudentID>_HW04_AI_Automation_<SelfAssessedGrade>.zip
3. Cắt zip thành các phần 19 MB (.zip.001, .zip.002, ...) trong HW04_submit/, như HW02, HW03.
   Moodle: Tối đa 20 file, mỗi file 20 MB. Ghép lại bằng 7-Zip (mở file .001) hoặc
   lệnh: copy /b name.zip.001+name.zip.002+... name.zip
Không đưa vào bản nộp: Video (bị .gitignore chặn, trừ video trong reports/), _NOTES.md, node_modules/, test-results/.
"""
import os
import subprocess
import sys
import zipfile

sys.stdout.reconfigure(encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
HW = os.path.dirname(HERE)
GRADE = sys.argv[1] if len(sys.argv) > 1 else "100"
if not (len(GRADE) == 3 and GRADE.isdigit() and int(GRADE) <= 100):
    sys.exit("Điểm tự chấm phải là 3 chữ số trong khoảng 000 đến 100")
NAME = f"23120061_HW04_AI_Automation_{GRADE}"
OUT_DIR = os.path.join(HW, "HW04_submit")
PART = 19922944  # 19 MB, giống HW02, HW03
# File có trong bản nộp nhưng không đưa lên repo public (.gitignore chặn)
EXTRA = ["prompt_log.md", "prompt_log.pdf"]


def main():
    missing = [p for p in EXTRA if not os.path.isfile(os.path.join(HW, p))]
    if missing:
        sys.exit(f"Thiếu file bắt buộc ngoài repo: {', '.join(missing)}")
    log = subprocess.run(["git", "log", "--date=iso"], cwd=HW, capture_output=True, check=True).stdout
    with open(os.path.join(HW, "git_log.txt"), "wb") as f:
        f.write(log)
    files = subprocess.run(["git", "ls-files", "-z"], cwd=HW, capture_output=True, check=True).stdout
    files = [p for p in files.decode("utf-8").split("\0") if p] + ["git_log.txt"] + EXTRA
    os.makedirs(OUT_DIR, exist_ok=True)
    for old in os.listdir(OUT_DIR):
        if old.startswith("23120061_HW04_AI_Automation_"):
            os.remove(os.path.join(OUT_DIR, old))
    zpath = os.path.join(OUT_DIR, NAME + ".zip")
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for p in files:
            full = os.path.join(HW, p)
            if os.path.isfile(full):
                z.write(full, NAME + "/" + p)
    size = os.path.getsize(zpath)
    with open(zpath, "rb") as f:
        i = 1
        while True:
            chunk = f.read(PART)
            if not chunk:
                break
            with open(f"{zpath}.{i:03d}", "wb") as g:
                g.write(chunk)
            i += 1
    os.remove(zpath)
    print(f"{len(files)} file, zip {size / 1048576:.1f} MB, {i - 1} phần trong {OUT_DIR}")


if __name__ == "__main__":
    main()
