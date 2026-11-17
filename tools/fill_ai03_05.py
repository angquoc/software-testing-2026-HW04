"""Điền form [AI-03] Disclosure và [AI-05] Privacy Checklist cho HW04 từ mẫu gốc trong "../AI Templates".

Chạy:  python tools/fill_ai03_05.py   (đặt PYTHONIOENCODING=utf-8 nếu console là cp1252)
- [AI-03]: Bảng thông tin và 6 câu khai báo lấy từ forms/[AI-03] ... .md; khối chữ ký (ảnh chữ ký lấy từ
  form [AI-02] đã ký của HW02, sinh viên cho phép).
- [AI-05]: Khối chữ ký và checklist (đánh dấu giống HW01, HW02 theo quyết định của sinh viên).
Chép từ HW02/tools/fill_ai03_05.py, chỉ đổi phần dữ liệu. Luôn dựng lại từ mẫu gốc nên chạy nhiều lần không bị trùng.
"""
import io
import os
import re
import docx
from docx.oxml.ns import qn
from docx.shared import Emu

HERE = os.path.dirname(os.path.abspath(__file__))
HW = os.path.dirname(HERE)
TPL = os.path.join(HW, "..", "AI Templates")
FORMS = os.path.join(HW, "forms")

SIGN = {
    "Họ tên sinh viên (in hoa)": "NGUYỄN THỊ ÁNH NGỌC",
    "MSSV": "23120061",
    "Lớp / Khoá": "Kiểm thử phần mềm - CQ2023/3",
    "Giảng viên": "Lâm Quang Vũ\nHồ Tuấn Thanh\nTrương Phước Lộc",
    "Ngày": "18/11/2026",
}

_md = open(os.path.join(FORMS, "[AI-03] - FIT@HCMUS - AI Disclosure Form_Vn.md"), encoding="utf-8").read()
_info = dict(re.findall(r"^\| ([^|]+?): \| ([^|]*?) \|$", _md.split("## 2.")[0], re.M))
INFO = {k: _info[k] for k in ("Mã bài tập", "Tên bài tập", "Cấp độ AI (1–5)", "Ngày", "Họ tên sinh viên", "MSSV")}
ANSWERS = {}
_part = re.split(r"^## 3\.", _md.split("## 2. Câu hỏi Khai báo")[1], flags=re.M)[0]
for _blk in re.split(r"^### ", _part, flags=re.M)[1:]:
    _title, _body = _blk.split("\n", 1)
    _paras = [p.strip().replace("`", "") for p in _body.strip().split("\n\n") if p.strip()]
    # Bỏ dòng hướng dẫn của mẫu; câu 2 không có dòng hướng dẫn (dòng đầu là dòng tick)
    ANSWERS[_title.strip()] = _paras if _title.startswith("2.") else _paras[1:]


def set_cell(cell, text):
    p = cell.paragraphs[0]
    for extra in cell.paragraphs[1:]:
        extra._element.getparent().remove(extra._element)
    for r in list(p.runs):
        r._element.getparent().remove(r._element)
    p.add_run(text)


def signature():
    """Ảnh chữ ký của sinh viên, lấy từ form [AI-02] đã ký của HW02 (sinh viên đồng ý dùng lại)."""
    src = docx.Document(os.path.join(HW, "..", "HW02", "forms", "[AI-02] - FIT@HCMUS - AI Audit Report_Vn.docx"))
    for t in src.tables:
        for r in t.rows:
            if r.cells[0].text.strip().startswith("Chữ ký"):
                blip = r.cells[1]._element.findall(".//" + qn("a:blip"))[0]
                ext = r.cells[1]._element.findall(".//" + qn("wp:extent"))[0]
                return src.part.related_parts[blip.get(qn("r:embed"))].blob, int(ext.get("cx"))
    raise SystemExit("Không tìm thấy ảnh chữ ký trong form HW02")


def fill_sign(table):
    blob, width = signature()
    for r in table.rows:
        key = r.cells[0].text.strip().rstrip(":")
        if key in SIGN:
            set_cell(r.cells[1], SIGN[key])
        elif key == "Chữ ký":
            set_cell(r.cells[1], "")
            r.cells[1].paragraphs[0].add_run().add_picture(io.BytesIO(blob), width=Emu(width))


def ai03():
    d = docx.Document(os.path.join(TPL, "[AI-03] - FIT@HCMUS - AI Disclosure Form_Vn.docx"))
    info, sign = d.tables[:2]
    for r in info.rows:
        key = r.cells[0].text.strip().rstrip(":")
        if key in INFO:
            set_cell(r.cells[1], INFO[key])
    fill_sign(sign)
    paras = d.paragraphs
    for i, p in enumerate(paras):
        q = p.text.strip()
        if q in ANSWERS:
            blanks = []
            for p2 in paras[i + 1:]:
                t = p2.text.strip()
                if t in ANSWERS or t.startswith("3. Cam đoan"):
                    break
                if t and set(t) == {"_"}:
                    blanks.append(p2)
            if q.startswith("2."):
                tick = next(p2 for p2 in paras[i + 1:i + 3] if p2.text.strip().startswith("Tick tất cả"))
                for r in list(tick.runs):
                    r._element.getparent().remove(r._element)
                tick.add_run(ANSWERS[q][0])
                lines = ANSWERS[q][1:]
            else:
                lines = ANSWERS[q]
            for j, p2 in enumerate(blanks):
                for r in list(p2.runs):
                    r._element.getparent().remove(r._element)
                if j < len(lines):
                    p2.add_run(lines[j] if j < len(blanks) - 1 else "\n\n".join(lines[j:]))
                else:
                    p2._element.getparent().remove(p2._element)
    out = os.path.join(FORMS, "[AI-03] - FIT@HCMUS - AI Disclosure Form_Vn.docx")
    d.save(out)
    print("Đã ghi", os.path.basename(out))


def ai05():
    d = docx.Document(os.path.join(TPL, "[AI-05] - FIT@HCMUS - AI Privacy Checklist_Vn.docx"))
    fill_sign(d.tables[0])
    # Đánh dấu giống HW01, HW02 (sinh viên chốt 11/11/2026, dùng lại cho HW04): Tick mọi ô, trừ 2 ô dưới đây
    # (đã đưa tên, MSSV, email và SRS, slide của môn cho AI, nên để trống là trung thực)
    keep_empty = ("Không nhập dữ liệu cá nhân", "Không paste nguyên si tài liệu có bản quyền")
    for p in d.paragraphs:
        t = p.text.strip()
        if t.startswith("[ ]") and not any(k in t for k in keep_empty):
            run = next(r for r in p.runs if "[ ]" in r.text)
            run.text = run.text.replace("[ ]", "[x]", 1)
    out = os.path.join(FORMS, "[AI-05] - FIT@HCMUS - AI Privacy Checklist_Vn.docx")
    d.save(out)
    print("Đã ghi", os.path.basename(out))


if __name__ == "__main__":
    os.makedirs(FORMS, exist_ok=True)
    ai03()
    ai05()
