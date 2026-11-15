"""Xuất bản "Save-As-PDF" cho mọi file Markdown nộp bài (Homework Policies: Mỗi file MD kèm bản PDF).

Cách làm: Markdown -> HTML (thư viện `markdown`) -> PDF bằng Chrome/Edge chạy ẩn (--print-to-pdf).
PDF nằm cạnh file MD, cùng tên. Ảnh trong MD dùng đường dẫn tương đối nên vẫn hiện trong PDF.

Chạy:  python tools/md_to_pdf.py                 (mọi file MD nộp bài)
       python tools/md_to_pdf.py report.md README.md   (chỉ các file chỉ định)
Bỏ qua: _NOTES.md (không nộp), thư mục .git, forms/ (PDF của form xuất từ Word),
      node_modules/, reports/ (HTML report của Playwright), HW04_submit/.
"""
import glob
import html
import os
import subprocess
import sys
import tempfile

import markdown

sys.stdout.reconfigure(encoding="utf-8")

HW = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SKIP = {"_NOTES.md"}
BROWSERS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
]
CSS = """
body { font-family: "Segoe UI", Arial, sans-serif; font-size: 10.5pt; line-height: 1.45; margin: 0; }
h1 { font-size: 18pt; } h2 { font-size: 14pt; border-bottom: 1px solid #ccc; } h3 { font-size: 12pt; }
table { border-collapse: collapse; margin: 6px 0; width: 100%; font-size: 9pt; }
th, td { border: 1px solid #999; padding: 3px 5px; vertical-align: top; word-break: break-word; }
th { background: #eee; }
code { font-family: Consolas, monospace; font-size: 9pt; background: #f4f4f4; padding: 0 2px; }
pre { background: #f4f4f4; padding: 6px; white-space: pre-wrap; word-break: break-word; font-size: 8.5pt; }
pre code { background: none; }
blockquote { border-left: 3px solid #ccc; margin: 4px 0; padding-left: 8px; color: #444; }
img { max-width: 100%; }
@page { size: A4; margin: 14mm 12mm; }
"""


def browser():
    for b in BROWSERS:
        if os.path.exists(b):
            return b
    sys.exit("Không tìm thấy Chrome hoặc Edge")


def convert(md_path, exe):
    text = open(md_path, encoding="utf-8").read()
    body = markdown.markdown(text, extensions=["tables", "fenced_code", "sane_lists", "toc"])
    title = html.escape(os.path.basename(md_path))
    page = f'<!doctype html><html><head><meta charset="utf-8"><title>{title}</title><style>{CSS}</style></head><body>{body}</body></html>'
    # HTML tạm đặt cạnh file MD để đường dẫn ảnh tương đối vẫn đúng
    fd, tmp = tempfile.mkstemp(suffix=".html", dir=os.path.dirname(md_path))
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        f.write(page)
    pdf = os.path.splitext(md_path)[0] + ".pdf"
    try:
        subprocess.run([exe, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                        f"--print-to-pdf={pdf}", "file:///" + tmp.replace("\\", "/")],
                       check=True, capture_output=True, timeout=120)
    finally:
        os.remove(tmp)
    return pdf


def targets(args):
    if args:
        return [os.path.join(HW, a) for a in args]
    # forms/*.md là bản chữ của file Word; PDF của form xuất từ Word (có ảnh chữ ký), không xuất từ .md
    # node_modules/, reports/, test-results/, playwright-report/: Không phải tài liệu nộp; HW04_submit/: Bản đóng gói
    skip_dirs = [os.path.join(HW, d) + os.sep for d in ("forms", "node_modules", "reports", "test-results", "playwright-report", "HW04_submit")]
    files = [f for f in glob.glob(os.path.join(HW, "**", "*.md"), recursive=True)
             if os.path.basename(f) not in SKIP and os.sep + ".git" + os.sep not in f
             and not any(f.startswith(d) for d in skip_dirs)]
    return sorted(files)


def main():
    exe = browser()
    files = targets(sys.argv[1:])
    for f in files:
        pdf = convert(f, exe)
        ok = os.path.exists(pdf) and os.path.getsize(pdf) > 0
        print(("OK  " if ok else "LỖI ") + os.path.relpath(pdf, HW))
    print(f"Đã xuất {len(files)} file")


if __name__ == "__main__":
    main()
