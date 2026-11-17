"""Chép Appendix B (AI Audit Report) trong report.md vào form [AI-02] .docx.

Chạy lại mỗi khi Appendix B thay đổi:  python tools/fill_ai02.py
Luôn dựng lại từ template gốc trong "../AI Templates" nên chạy nhiều lần không bị trùng dữ liệu.
"""
import copy, os, re
import docx
from docx.oxml.ns import qn

HERE = os.path.dirname(os.path.abspath(__file__))
HW = os.path.dirname(HERE)
SRC = os.path.join(HW, "..", "AI Templates", "[AI-02] - FIT@HCMUS - AI Audit Report_Vn.docx")
OUT = os.path.join(HW, "forms", "[AI-02] - FIT@HCMUS - AI Audit Report_Vn.docx")

STUDENT = {
    "Họ tên sinh viên (in hoa)": "NGUYỄN THỊ ÁNH NGỌC",
    "MSSV": "23120061",
    "Lớp / Khoá": "Kiểm thử phần mềm - CQ2023/3",
    "Mã bài tập": "HW04-AI",
    "Ngày làm bài": "15/11/2026 đến 18/11/2026",
    "Ngày": "18/11/2026",
    "Giảng viên": "Lâm Quang Vũ\nHồ Tuấn Thanh\nTrương Phước Lộc",
}
TOOLS = "Claude Code (Anthropic, claude-opus-5-5)"

rep = open(os.path.join(HW, "report.md"), encoding="utf-8").read()
app = rep[rep.find("## Appendix B"):]
rows = [l for l in app.split("\n") if re.match(r"^\| B\d\d[a-z]?: ", l)]
arts = [[c.strip() for c in re.split(r"(?<!\\)\|", l.strip())[1:-1]] for l in rows]
summ = {m.group(1): (m.group(2), m.group(3)) for m in re.finditer(r"^\| (Tổng artifact AI sinh đã audit|VALID[^|]*|INVALID[^|]*|INCOMPLETE[^|]*) \| (\d+) \| ([\d.,]+%) \|$", app, re.M)}
concl = app.split("### Kết luận: Khi nào nên, không nên dùng AI?", 1)[1].strip()
# Mandatory Disclosure (dán nguyên văn vào mục 6 của form)
disc = re.search(r"## Mandatory Disclosure\s*\n\s*\n(\".*?\")\s*\n", rep, re.S).group(1)

def put(cell, text):
    """Ghi text vào ô, chuyển **đậm** và `code` thành run tương ứng."""
    p = cell.paragraphs[0]
    for extra in cell.paragraphs[1:]:
        extra._element.getparent().remove(extra._element)
    for r in list(p.runs):
        r._element.getparent().remove(r._element)
    for part in re.split(r"(\*\*[^*]+\*\*)", text):
        if not part:
            continue
        bold = part.startswith("**")
        run = p.add_run(part.strip("*").replace("`", "") if bold else part.replace("`", ""))
        run.bold = bold or None
        run.italic = False

d = docx.Document(SRC)
t_info, t_audit, t_sum, t_sign = d.tables[:4]

for t in (t_info, t_sign):
    for r in t.rows:
        key = r.cells[0].text.strip().rstrip(":").split(" (ví dụ")[0]
        if key in STUDENT:
            put(r.cells[1], STUDENT[key])

# Ảnh chữ ký: Lấy từ form [AI-02] đã ký của HW02 (sinh viên đồng ý dùng lại)
import io
from docx.shared import Emu
_src = docx.Document(os.path.join(HW, "..", "HW02", "forms", "[AI-02] - FIT@HCMUS - AI Audit Report_Vn.docx"))
_sig = next(r.cells[1]._element for t in _src.tables for r in t.rows if r.cells[0].text.strip().startswith("Chữ ký"))
_blip = _sig.findall(".//" + qn("a:blip"))[0]
_blob = _src.part.related_parts[_blip.get(qn("r:embed"))].blob
_width = int(_sig.findall(".//" + qn("wp:extent"))[0].get("cx"))
for r in t_sign.rows:
    if r.cells[0].text.strip().startswith("Chữ ký"):
        put(r.cells[1], "")
        r.cells[1].paragraphs[0].add_run().add_picture(io.BytesIO(_blob), width=Emu(_width))
tool_rows = [r for r in t_info.rows if r.cells[0].text.strip().startswith("Công cụ AI đã dùng")]
put(tool_rows[0].cells[1], TOOLS)
if len(tool_rows) > 1:
    put(tool_rows[1].cells[1], "[x] Có  [ ] Không")

# Bảng audit: bỏ 2 hàng mẫu, dùng hàng "Artifact #1" làm khuôn
proto = copy.deepcopy(t_audit.rows[3]._tr)
for r in list(t_audit.rows)[1:]:
    t_audit._tbl.remove(r._tr)
for a in arts:
    tr = copy.deepcopy(proto); t_audit._tbl.append(tr)
    cells = t_audit.rows[-1].cells
    art, prompt, out, verdict, why, fix = a
    put(cells[0], f"**{art}**\n{prompt}")
    put(cells[1], out); put(cells[2], verdict); put(cells[3], why); put(cells[4], fix)

for r in t_sum.rows[1:]:
    key = r.cells[0].text.strip()
    for k, (n, pct) in summ.items():
        if key.split(" (")[0] == k.split(" (")[0]:
            put(r.cells[1], n); put(r.cells[2], pct)

# Kết luận: thay các dòng gạch dưới bằng đoạn kết luận
blanks = [p for p in d.paragraphs if set(p.text.strip()) == {"_"}]
if blanks and concl and not concl.startswith("_("):
    blanks[0].text = concl
    for p in blanks[1:]:
        p._element.getparent().remove(p._element)

# Mục 6: Dán nguyên văn Mandatory Disclosure
for p in d.paragraphs:
    if p.text.strip().startswith('"[Test case / script / dataset'):
        for r in list(p.runs):
            r._element.getparent().remove(r._element)
        p.add_run(disc)
        break

d.save(OUT)
print(f"Đã ghi {OUT}: {len(arts)} artifact, tổng kết {summ}")
