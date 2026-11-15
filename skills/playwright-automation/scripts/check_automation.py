"""Kiểm tra máy móc cho skill playwright-automation (không đánh giá nội dung).

Cách dùng (chạy từ thư mục gốc của dự án):
  python -I check_automation.py spec <file.spec.ts>... [--min-assert 3] [--id-pattern REGEX]
  python -I check_automation.py data <file.json|file.csv>... [--min 12] [--ids-from 01_selected_tc.md] [--id-pattern REGEX]
  python -I check_automation.py same <ai_raw/script_xx.md>... [--root .]
  python -I check_automation.py changes <file.md>... [--stats]
  python -I check_automation.py format <file.md>...

Mỗi dòng in ra bắt đầu bằng ERROR, WARN hoặc INFO. Mã thoát 1 nếu có ERROR.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

DEFAULT_ID = r"TC-[A-Z0-9]+-\d+"
ERRORS = 0


def out(level: str, where: str, msg: str) -> None:
    global ERRORS
    if level == "ERROR":
        ERRORS += 1
    print(f"{level} {where}: {msg}")


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8-sig")


# ---------------------------------------------------------------- spec

ASSERT_KINDS = {
    "Hiển thị": ["toBeVisible", "toBeHidden", "toBeAttached", "toBeInViewport"],
    "Nội dung chữ": ["toHaveText", "toContainText"],
    "Điều hướng": ["toHaveURL", "toHaveTitle"],
    "Giá trị ô nhập": ["toHaveValue", "toHaveValues"],
    "Số lượng": ["toHaveCount"],
    "Trạng thái": ["toBeEnabled", "toBeDisabled", "toBeChecked", "toBeEditable", "toBeFocused", "toBeEmpty"],
    "Thuộc tính": ["toHaveAttribute", "toHaveClass", "toHaveCSS", "toHaveId", "toHaveJSProperty",
                   "toHaveAccessibleName", "toHaveAccessibleDescription", "toHaveRole"],
    "Ảnh chụp": ["toHaveScreenshot", "toMatchSnapshot", "toMatchAriaSnapshot"],
    "Phản hồi mạng": ["toBeOK"],
    "Chờ điều kiện": ["toPass"],
}
MATCHER_TO_KIND = {m: k for k, ms in ASSERT_KINDS.items() for m in ms}
GENERIC_KIND = "Giá trị tính toán / so sánh"

BAD_IMPORT = re.compile(r"import\s*\{[^}]*\btest\b[^}]*\}\s*from\s*['\"]@playwright/test['\"]")
DATA_READ = re.compile(r"(import\s+\w+\s+from\s+['\"][^'\"]+\.json['\"])|loadCsv\(|loadJson\(|readFileSync\(")
MATCHER = re.compile(r"\.(?:not\.)?(to[A-Z]\w*)\s*\(")
TEST_CALL = re.compile(r"\btest(?:\.(?:only|skip|fixme|fail))?\s*\(\s*(['\"`])((?:\\.|(?!\1).)*)\1", re.S)
ARRAY_DECL = re.compile(r"\b(?:const|let|var)\s+\w+\s*(?::[^=;]+)?=\s*\[")
OBJ_DECL = re.compile(r"\b(?:const|let|var)\s+\w+\s*(?::[^=;]+)?=\s*\{")


def strip_comments(code: str) -> str:
    code = re.sub(r"/\*.*?\*/", lambda m: "\n" * m.group(0).count("\n"), code, flags=re.S)
    return re.sub(r"(?<![:'\"`])//[^\n]*", "", code)


def bracket_body(code: str, start: int, open_ch: str, close_ch: str) -> str:
    depth = 0
    for i in range(start, len(code)):
        if code[i] == open_ch:
            depth += 1
        elif code[i] == close_ch:
            depth -= 1
            if depth == 0:
                return code[start + 1:i]
    return code[start + 1:]


def line_of(code: str, pos: int) -> int:
    return code.count("\n", 0, pos) + 1


def cmd_spec(args) -> None:
    id_re = re.compile(args.id_pattern)
    union_kinds: Counter = Counter()
    union_matchers: Counter = Counter()
    for f in args.files:
        raw = read(f)
        code = strip_comments(raw)
        lines = raw.splitlines()
        if BAD_IMPORT.search(code):
            out("ERROR", f, "Import `test` thẳng từ '@playwright/test'; phải import từ tests/support/fixtures (annotation Run by)")
        if "fixtures" not in code:
            out("WARN", f, "Không thấy import từ fixtures")
        for m in re.finditer(r"waitForTimeout\s*\(", code):
            out("ERROR", f"{f}:{line_of(code, m.start())}", "waitForTimeout (ngủ cứng); chờ điều kiện cụ thể")
        for m in re.finditer(r"networkidle", code):
            out("WARN", f"{f}:{line_of(code, m.start())}", "networkidle: Chờ chung chung, dễ flaky")
        for m in re.finditer(r"\b(?:test|describe)\.only\s*\(", code):
            out("ERROR", f"{f}:{line_of(code, m.start())}", ".only còn trong code")
        if not DATA_READ.search(code):
            out("WARN", f, "Không thấy đọc file dữ liệu (import .json, loadCsv, loadJson, readFileSync)")
        for decl, (o, c) in ((ARRAY_DECL, ("[", "]")), (OBJ_DECL, ("{", "}"))):
            for m in decl.finditer(code):
                ln = line_of(code, m.start())
                if "inline-ok" in (lines[ln - 1] if ln - 1 < len(lines) else ""):
                    continue
                body = bracket_body(code, m.end() - 1, o, c)
                literals = len(re.findall(r"(['\"`])(?:\\.|(?!\1).)*\1|\b\d+(?:\.\d+)?\b", body))
                if o == "[" and ("{" in body or literals >= 2):
                    out("ERROR", f"{f}:{ln}", "Mảng dữ liệu viết thẳng trong spec; chuyển sang file .json / .csv "
                                            "(nếu không phải dữ liệu test, thêm comment `// inline-ok: <lý do>`)")
                elif o == "{" and len(re.findall(r"\w+\s*:", body)) >= 3 and literals >= 3:
                    out("WARN", f"{f}:{ln}", "Object nhiều giá trị viết thẳng trong spec; có phải dữ liệu test không?")
        for m in TEST_CALL.finditer(code):
            title = m.group(2)
            if title.startswith("${") or id_re.match(title):
                continue
            if re.search(r"\.describe\s*\($", code[max(0, m.start() - 12):m.start() + 5]):
                continue
            out("WARN", f"{f}:{line_of(code, m.start())}", f"Tên test không bắt đầu bằng mã TC: {title[:60]!r}")
        matchers = Counter(MATCHER.findall(code))
        kinds: Counter = Counter()
        for mname, n in matchers.items():
            kinds[MATCHER_TO_KIND.get(mname, GENERIC_KIND)] += n
        if re.search(r"expect\.soft\s*\(", code):
            kinds["Assertion mềm"] += len(re.findall(r"expect\.soft\s*\(", code))
        if re.search(r"expect\.poll\s*\(", code):
            kinds["Chờ điều kiện"] += len(re.findall(r"expect\.poll\s*\(", code))
        if re.search(r"waitForResponse\s*\(", code) and re.search(r"\.status\(\)", code):
            kinds["Phản hồi mạng"] += 1
        if "validity" in code:
            kinds["Validation trình duyệt"] += 1
        union_kinds.update(kinds)
        union_matchers.update(matchers)
        out("INFO", f, f"{len(kinds)} kiểu assertion: " + ", ".join(f"{k} ({n})" for k, n in kinds.most_common())
            + " | matcher: " + ", ".join(sorted(matchers)))
    if len(args.files) > 1:
        out("INFO", "Tổng các file", f"{len(union_kinds)} kiểu assertion: "
            + ", ".join(f"{k} ({n})" for k, n in union_kinds.most_common()))
    if args.min_assert and len(union_kinds) < args.min_assert:
        out("ERROR", "Tổng các file", f"Chỉ có {len(union_kinds)} kiểu assertion, cần ≥ {args.min_assert}")


# ---------------------------------------------------------------- data

def load_rows(f: str) -> list[dict]:
    text = read(f)
    if f.lower().endswith(".json"):
        data = json.loads(text)
        if isinstance(data, dict):
            for v in data.values():
                if isinstance(v, list):
                    return v
            raise ValueError("JSON là object nhưng không có mảng test case")
        if not isinstance(data, list):
            raise ValueError("JSON phải là mảng test case")
        return data
    if f.lower().endswith(".csv"):
        return list(csv.DictReader(io.StringIO(text)))
    raise ValueError("Chỉ đọc .json hoặc .csv")


def ids_from_md(md: str, id_re: re.Pattern) -> set[str]:
    text = read(md)
    sections = re.split(r"(?m)^#{2,3} ", text)
    chosen = [s for s in sections if re.match(r"[^\n]*(được chọn|selected)", s, re.I)]
    if not chosen:
        out("WARN", md, "Không thấy mục 'Test case được chọn'; lấy mọi mã trong file")
        chosen = [text]
    ids: set[str] = set()
    for s in chosen:
        for line in s.splitlines():
            if line.startswith("|"):
                cell = line.strip("|").split("|")[0].strip()
                m = id_re.search(cell)
                if m:
                    ids.add(m.group(0))
    return ids


def cmd_data(args) -> None:
    id_re = re.compile(args.id_pattern)
    seen: dict[str, str] = {}
    total = 0
    for f in args.files:
        try:
            rows = load_rows(f)
        except Exception as e:  # noqa: BLE001
            out("ERROR", f, f"Không đọc được: {e}")
            continue
        total += len(rows)
        for i, r in enumerate(rows, 1):
            where = f"{f}#{i}"
            if not isinstance(r, dict):
                out("ERROR", where, "Mỗi test case phải là object")
                continue
            rid = str(r.get("id", "")).strip()
            if not rid:
                out("ERROR", where, "Thiếu `id`")
                continue
            if not id_re.fullmatch(rid):
                out("WARN", where, f"`id` {rid!r} không đúng mẫu {args.id_pattern}")
            if rid in seen:
                out("ERROR", where, f"`id` {rid} trùng với {seen[rid]}")
            seen[rid] = where
            if not str(r.get("title", "")).strip():
                out("WARN", where, f"{rid}: Thiếu `title`")
            keys = {k.lower() for k in r}
            if not any(k.startswith("expected") for k in keys):
                out("WARN", where, f"{rid}: Không thấy trường kết quả mong đợi (`expected...`)")
            if not any(k.startswith("oracle") for k in keys):
                out("WARN", where, f"{rid}: Không có `oracle` (căn cứ kết quả mong đợi)")
        out("INFO", f, f"{len(rows)} dòng")
    out("INFO", "Tổng", f"{total} dòng, {len(seen)} mã khác nhau")
    if args.min and len(seen) < args.min:
        out("ERROR", "Tổng", f"Chỉ có {len(seen)} test case, cần ≥ {args.min}")
    if args.ids_from:
        want = ids_from_md(args.ids_from, id_re)
        for rid in sorted(want - set(seen)):
            out("ERROR", args.ids_from, f"{rid} được chọn nhưng không có dữ liệu")
        for rid in sorted(set(seen) - want):
            out("WARN", seen[rid], f"{rid} có dữ liệu nhưng không có trong danh sách chọn")


# ---------------------------------------------------------------- same

FILE_LINE = re.compile(r"^File:\s*`([^`]+)`\s*$")


def code_blocks(md_text: str) -> list[tuple[str, str]]:
    blocks, pending, lines = [], None, md_text.splitlines()
    i = 0
    while i < len(lines):
        m = FILE_LINE.match(lines[i].strip())
        if m:
            pending = m.group(1)
        elif lines[i].lstrip().startswith("```") and pending:
            fence = lines[i].lstrip()[:3]
            body = []
            i += 1
            while i < len(lines) and not lines[i].lstrip().startswith(fence):
                body.append(lines[i])
                i += 1
            blocks.append((pending, "\n".join(body)))
            pending = None
        elif lines[i].strip() and not lines[i].lstrip().startswith("```"):
            pass
        i += 1
    return blocks


def norm(text: str) -> str:
    return "\n".join(line.rstrip() for line in text.replace("\r\n", "\n").split("\n")).strip("\n")


def cmd_same(args) -> None:
    root = Path(args.root)
    for md in args.files:
        blocks = code_blocks(read(md))
        if not blocks:
            out("ERROR", md, "Không thấy khối code nào có dòng `File: \\`...\\`` ngay trước")
        for path, body in blocks:
            target = root / path
            if not target.exists():
                out("ERROR", md, f"{path}: Chưa có file trong dự án")
            elif norm(read(str(target))) == norm(body):
                out("INFO", md, f"{path}: Giống hệt bản AI")
            else:
                a, b = norm(body).split("\n"), norm(read(str(target))).split("\n")
                first = next((k for k, (x, y) in enumerate(zip(a, b)) if x != y), min(len(a), len(b)))
                out("ERROR", md, f"{path}: Khác bản AI từ dòng {first + 1} (bản AI {len(a)} dòng, file {len(b)} dòng)")


# ---------------------------------------------------------------- changes

LOAI = {"Sai", "Thiếu", "Thừa", "Mơ hồ", "Quyết định của SV"}
LOAI_LOI = {"Selector dễ vỡ", "Assertion yếu / thiếu", "Thiếu edge case", "Wait gây flaky", "Dữ liệu", "Khác"}
VI_SAO = ("Prompt", "Giới hạn model", "Đặc thù feature")


def split_row(line: str) -> list[str]:
    cells, cur, in_code = [], "", False
    for ch in line.strip().strip("|"):
        if ch == "`":
            in_code = not in_code
        if ch == "|" and not in_code:
            cells.append(cur.strip())
            cur = ""
        else:
            cur += ch
    cells.append(cur.strip())
    return cells


def change_tables(text: str):
    lines = text.splitlines()
    i = 0
    while i < len(lines):
        if lines[i].startswith("|") and "Loại" in lines[i] and "Vì sao" in lines[i] \
                and i + 1 < len(lines) and re.match(r"^\|[\s:|-]+\|?$", lines[i + 1]):
            header = split_row(lines[i])
            rows, j = [], i + 2
            while j < len(lines) and lines[j].startswith("|"):
                rows.append((j + 1, split_row(lines[j])))
                j += 1
            yield header, rows
            i = j
        else:
            i += 1


def col(header: list[str], *names: str) -> int | None:
    for k, h in enumerate(header):
        if any(h.strip() == n or h.strip().startswith(n) for n in names):
            return k
    return None


def cmd_changes(args) -> None:
    stats: dict[str, Counter] = defaultdict(Counter)
    loai_count: Counter = Counter()
    for f in args.files:
        found = False
        for header, rows in change_tables(read(f)):
            found = True
            c_loai = col(header, "Loại")
            c_loi = col(header, "Loại lỗi script")
            c_vs = col(header, "Vì sao")
            c_ld = col(header, "Lý do")
            if c_loai == c_loi:
                c_loai = next((k for k, h in enumerate(header) if h.strip() == "Loại"), c_loai)
            for ln, r in rows:
                where = f"{f}:{ln}"
                if len(r) != len(header):
                    out("ERROR", where, f"Dòng có {len(r)} cột, bảng có {len(header)}")
                    continue
                loai = r[c_loai] if c_loai is not None else ""
                if loai not in LOAI:
                    out("ERROR", where, f"Loại {loai!r} không thuộc {sorted(LOAI)}")
                loai_count[loai] += 1
                loi = r[c_loi] if c_loi is not None else ""
                if c_loi is not None:
                    parts = [p.strip() for p in re.split(r"[;,]", loi) if p.strip()]
                    if loi in LOAI_LOI:
                        parts = [loi]
                    for p in parts or [""]:
                        if p not in LOAI_LOI:
                            out("ERROR", where, f"Loại lỗi script {p!r} không thuộc {sorted(LOAI_LOI)}")
                vs = r[c_vs] if c_vs is not None else ""
                if loai != "Quyết định của SV":
                    if not vs.startswith(VI_SAO):
                        out("ERROR", where, f"Cột 'Vì sao' phải bắt đầu bằng {', '.join(VI_SAO)}")
                prefix = next((p for p in VI_SAO if vs.startswith(p)), "(trống)")
                for p in [x.strip() for x in re.split(r"[;,]", loi) if x.strip()] or ["(trống)"]:
                    stats[p][prefix] += 1
                if c_ld is not None and not r[c_ld].strip():
                    out("ERROR", where, "Thiếu lý do / căn cứ")
        if not found:
            out("WARN", f, "Không thấy bảng 'Thay đổi so với bản AI' (cần cột Loại và Vì sao)")
    if args.stats:
        print("\n| Loại lỗi script | " + " | ".join(VI_SAO) + " | (trống) | Tổng |")
        print("|---|" + "---|" * (len(VI_SAO) + 2))
        for loi in sorted(stats):
            c = stats[loi]
            print(f"| {loi} | " + " | ".join(str(c[p]) for p in VI_SAO) + f" | {c['(trống)']} | {sum(c.values())} |")
        print("\nTheo Loại: " + ", ".join(f"{k}: {n}" for k, n in loai_count.most_common()))


# ---------------------------------------------------------------- format

def cmd_format(args) -> None:
    for f in args.files:
        in_fence = False
        for n, line in enumerate(read(f).splitlines(), 1):
            if line.lstrip().startswith("```"):
                in_fence = not in_fence
                continue
            if in_fence:
                continue
            plain = re.sub(r"`[^`]*`", "", line)
            plain = re.sub(r"\"[^\"]*\"", "", plain)
            for ch, name in (("—", "dấu —"), ("·", "dấu ·")):
                if ch in plain:
                    out("ERROR", f"{f}:{n}", f"Có {name}")


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = p.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("spec")
    s.add_argument("files", nargs="+")
    s.add_argument("--min-assert", type=int, default=0)
    s.add_argument("--id-pattern", default=DEFAULT_ID)
    s.set_defaults(fn=cmd_spec)
    s = sub.add_parser("data")
    s.add_argument("files", nargs="+")
    s.add_argument("--min", type=int, default=0)
    s.add_argument("--ids-from")
    s.add_argument("--id-pattern", default=DEFAULT_ID)
    s.set_defaults(fn=cmd_data)
    s = sub.add_parser("same")
    s.add_argument("files", nargs="+")
    s.add_argument("--root", default=".")
    s.set_defaults(fn=cmd_same)
    s = sub.add_parser("changes")
    s.add_argument("files", nargs="+")
    s.add_argument("--stats", action="store_true")
    s.set_defaults(fn=cmd_changes)
    s = sub.add_parser("format")
    s.add_argument("files", nargs="+")
    s.set_defaults(fn=cmd_format)
    args = p.parse_args()
    args.fn(args)
    return 1 if ERRORS else 0


if __name__ == "__main__":
    sys.exit(main())
