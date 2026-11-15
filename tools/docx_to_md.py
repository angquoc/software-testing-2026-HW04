"""Tạo bản text-based (.md) cho các form .docx trong thư mục forms/.

Chạy:  python tools/docx_to_md.py
Mỗi file forms/X.docx sinh ra forms/X.md (giữ thứ tự đoạn văn và bảng; ảnh chữ ký ghi chú là có trong bản PDF).
"""
import glob, os
import docx
from docx.oxml.ns import qn

HERE = os.path.dirname(os.path.abspath(__file__))
FORMS = os.path.join(os.path.dirname(HERE), "forms")

def cell_text(cell):
    # Ngắt dòng trong ô (w:br) cũng đổi thành <br> để không làm vỡ bảng Markdown
    t = " <br> ".join(p.text.strip().replace("\n", " <br> ") for p in cell.paragraphs if p.text.strip())
    if cell._element.findall('.//' + qn('w:drawing')):
        t = (t + " " if t else "") + "*(Ảnh chữ ký: Xem bản PDF)*"
    return t.replace("|", "\\|")

for path in sorted(glob.glob(os.path.join(FORMS, "*.docx"))):
    d = docx.Document(path)
    out = []
    for el in d.element.body.iterchildren():
        if el.tag == qn('w:p'):
            p = docx.text.paragraph.Paragraph(el, d)
            text = p.text.strip()
            if not text:
                continue
            style = p.style.name
            if style.startswith("Heading"):
                level = int(style.split()[-1]) if style.split()[-1].isdigit() else 2
                out.append("#" * level + " " + text)
            elif "List" in style:
                out.append("- " + text)
            else:
                out.append(text)
            out.append("")
        elif el.tag == qn('w:tbl'):
            t = docx.table.Table(el, d)
            rows = [[cell_text(c) for c in r.cells] for r in t.rows]
            n = max(len(r) for r in rows)
            rows = [r + [""] * (n - len(r)) for r in rows]
            out.append("| " + " | ".join(rows[0]) + " |")
            out.append("|" + "---|" * n)
            out += ["| " + " | ".join(r) + " |" for r in rows[1:]]
            out.append("")
    md = os.path.splitext(path)[0] + ".md"
    header = f"> Bản text-based của `{os.path.basename(path)}` (bản binary: .docx / .pdf cùng tên).\n\n"
    open(md, "w", encoding="utf-8").write(header + "\n".join(out).rstrip() + "\n")
    print("Đã tạo", os.path.basename(md))
