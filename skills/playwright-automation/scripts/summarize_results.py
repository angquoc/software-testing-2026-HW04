"""Tóm tắt results.json của Playwright (JSON reporter) thành bảng Markdown nháp cho 03_results.md.

Cách dùng (chạy từ thư mục gốc của dự án):
  python -I summarize_results.py reports/<feature>                 # đọc reports/<feature>/<trình duyệt>/results.json
  python -I summarize_results.py <results.json>...

Chỉ đọc kết quả của lần chạy thật; không sửa file nào. Phân loại test fail (Bug / Script / Flaky / Khác biệt
trình duyệt) để trống cho sinh viên chốt.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ANSI = re.compile(r"\x1b\[[0-9;]*m")
STATUS = {"expected": "Pass", "unexpected": "Fail", "flaky": "Flaky", "skipped": "Skip"}


def walk(suite: dict):
    for spec in suite.get("specs", []):
        for t in spec.get("tests", []):
            yield spec, t
    for s in suite.get("suites", []):
        yield from walk(s)


def first_error_line(t: dict) -> str:
    for r in reversed(t.get("results", [])):
        err = r.get("error") or (r.get("errors") or [None])[0]
        if err:
            text = ANSI.sub("", err.get("message", "")).strip()
            lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
            head = lines[0] if lines else ""
            extra = [ln for ln in lines[1:4] if ln.startswith(("Expected", "Received", "Locator", "Timeout"))]
            return " ".join([head] + extra).replace("|", "\\|")[:300]
    return ""


def screenshots(t: dict) -> list[str]:
    out = []
    for r in t.get("results", []):
        for a in r.get("attachments", []):
            if a.get("contentType", "").startswith("image/") and a.get("path"):
                out.append(a["path"])
    return out


def annotation(t: dict, kind: str) -> str:
    for a in t.get("annotations", []):
        if a.get("type") == kind:
            return a.get("description", "")
    return ""


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    files: list[Path] = []
    for arg in sys.argv[1:]:
        p = Path(arg)
        files += sorted(p.glob("*/results.json")) if p.is_dir() else [p]
    if not files:
        print("Không thấy results.json")
        return 1

    summary, failures = [], {}
    for f in files:
        data = json.loads(f.read_text(encoding="utf-8"))
        tests = list(walk({"suites": data.get("suites", [])}))
        counts = {v: 0 for v in STATUS.values()}
        project, run_by, browser = "", "", ""
        for spec, t in tests:
            st = STATUS.get(t.get("status", ""), t.get("status", ""))
            counts[st] = counts.get(st, 0) + 1
            project = t.get("projectName", project)
            run_by = run_by or annotation(t, "Run by")
            browser = browser or annotation(t, "Browser")
            if st in ("Fail", "Flaky"):
                key = spec.get("title", "")
                entry = failures.setdefault(key, {"file": spec.get("file", ""), "line": spec.get("line", ""),
                                                  "browsers": [], "errors": {}, "shots": [], "status": set()})
                entry["browsers"].append(project)
                entry["errors"][project] = first_error_line(t)
                entry["shots"] += screenshots(t)
                entry["status"].add(st)
        stamp = run_by.split("|", 1)[1].strip() if "|" in run_by else ""
        summary.append((project, browser, stamp, len(tests), counts, f.parent.as_posix()))

    print("## Tóm tắt (nháp từ results.json)\n")
    print("| Trình duyệt | Phiên bản | Timestamp (khớp tiêu đề report) | Tổng | Pass | Fail | Skip | Flaky | Report |")
    print("|---|---|---|---|---|---|---|---|---|")
    for project, browser, stamp, total, c, folder in summary:
        print(f"| {project} | {browser} | {stamp} | {total} | {c['Pass']} | {c['Fail']} | {c['Skip']} | {c['Flaky']} "
              f"| `{folder}/index.html` |")

    print("\n## Test fail (phân loại để trống cho sinh viên chốt)\n")
    if not failures:
        print("Không có test fail.")
        return 0
    print("| Mã | Test | Spec | Trình duyệt | Lỗi (dòng đầu, theo trình duyệt) | Phân loại | Bằng chứng | Issue |")
    print("|---|---|---|---|---|---|---|---|")
    for n, (title, e) in enumerate(sorted(failures.items()), 1):
        errs = "; ".join(f"{b}: {msg}" for b, msg in e["errors"].items())
        flaky = " (Flaky)" if "Flaky" in e["status"] else ""
        safe = title.replace("|", "\\|")
        print(f"| F-{n:02d} | {safe}{flaky} | `{e['file']}:{e['line']}` | {', '.join(e['browsers'])} "
              f"| {errs} | | | |")
    print("\n### Ảnh Playwright chụp khi fail\n")
    for n, (title, e) in enumerate(sorted(failures.items()), 1):
        for s in e["shots"]:
            print(f"- F-{n:02d}: `{s}`")
    return 0


if __name__ == "__main__":
    sys.exit(main())
