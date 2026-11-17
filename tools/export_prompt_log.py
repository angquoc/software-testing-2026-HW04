"""Xuất nguyên văn lịch sử chat Claude Code vào prompt_log.md (Phụ lục A).

- Chỉ đọc các phiên có trong SESSIONS (danh sách trắng). Thư mục transcript dùng chung với
  các phiên không liên quan đến HW04 (HW01, HW02, HW03, Seminar...), nên mọi phiên khác đều bị bỏ qua và được in ra để kiểm tra.
- Mỗi lượt = 1 prompt của sinh viên + toàn bộ phần trả lời (text) của Claude, giữ nguyên văn.
- Timestamp lấy từ transcript, đổi sang giờ Việt Nam (UTC+7), định dạng HH:MM dd/mm/yyyy.
- Chỉ ghi đè vùng giữa CLAUDE-LOG:START và CLAUDE-LOG:END; phần tự điền (ChatGPT, Gemini...) giữ nguyên.

Chạy:  python tools/export_prompt_log.py
Khi mở phiên Claude Code mới cho HW04: thêm session id của phiên đó vào SESSIONS.
"""
import glob
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone

sys.stdout.reconfigure(encoding="utf-8")

TRANSCRIPT_DIR = os.path.expanduser(r"~/.claude/projects/d--Dang-Test")
LOG_FILE = os.path.join(os.path.dirname(__file__), "..", "prompt_log.md")
START = "<!-- CLAUDE-LOG:START -->"
END = "<!-- CLAUDE-LOG:END -->"
VN_TZ = timezone(timedelta(hours=7))

# Danh sách trắng: chỉ các phiên này thuộc HW04 (session id đầy đủ)
SESSIONS = [
    "27ccb594-33fb-4161-bb0b-3de1364349ab",  # 15/11/2026: đọc đề, chốt quyết định, dựng khung HW04 (phiên điều phối)
    "051b68d8-99bd-448b-a46f-f52b2cd6f033",  # 15/11/2026: dùng skill playwright-automation làm FR-17 (phiên làm bài, D14)
    "8897e5a5-2acf-4101-982a-c80750ce5708",  # 17/11/2026: dùng skill playwright-automation làm FR-07 (phiên làm bài, trước FR-01)
]

# Ghi chú của sinh viên cho từng phiên (8 ký tự đầu của session id), hiển thị dưới tiêu đề mỗi mục
SESSION_NOTES = {}

# Ngữ cảnh do IDE / hệ thống tự chèn, không phải chữ sinh viên gõ
INJECTED = re.compile(r"<(system-reminder|ide_selection|ide_opened_file|browser_instruction)>.*?</\1>", re.S)
# Thẻ bao quanh nội dung sinh viên dán vào: bỏ thẻ, giữ nội dung
PASTED_TAG = re.compile(r"</?pasted_content[^>]*>")


def fmt_time(iso):
    t = datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(VN_TZ)
    return t.strftime("%H:%M %d/%m/%Y")


def fence(text):
    """Bọc nguyên văn bằng fence dài hơn mọi dãy backtick bên trong."""
    longest = max((len(m) for m in re.findall(r"`+", text)), default=0)
    f = "`" * max(4, longest + 1)
    return f"{f}text\n{text.strip()}\n{f}"


def tool_note(block):
    inp = block.get("input", {})
    detail = inp.get("description") or inp.get("file_path") or inp.get("pattern") or ""
    return f"{block.get('name')}: {detail}".strip(": ")


def load_turns(path):
    turns = []
    for line in open(path, encoding="utf-8"):
        o = json.loads(line)
        msg = o.get("message")
        if not isinstance(msg, dict) or o.get("isSidechain"):
            continue
        content = msg.get("content")
        if o.get("type") == "user":
            # isMeta = dòng hệ thống tự chèn (vd "[Image: original ...]" khi AI mở ảnh), không phải sinh viên gõ;
            # output AI sau đó vẫn thuộc lượt prompt thật trước đó
            # isCompactSummary = bản tóm tắt hệ thống tự tạo khi phiên quá dài (compact), cũng không phải sinh viên gõ
            if o.get("isMeta") or o.get("isCompactSummary"):
                continue
            texts = []
            if isinstance(content, str):
                texts = [content]
            elif isinstance(content, list):
                texts = [c["text"] for c in content if c.get("type") == "text"]
            prompt = PASTED_TAG.sub("", INJECTED.sub("", "\n".join(texts))).strip()
            if prompt:
                turns.append({"time": o["timestamp"], "prompt": prompt, "out": [], "tools": [], "model": ""})
        elif o.get("type") == "assistant" and turns and isinstance(content, list):
            turn = turns[-1]
            turn["model"] = turn["model"] or msg.get("model", "")
            for c in content:
                if c.get("type") == "text" and c["text"].strip():
                    turn["out"].append(c["text"].strip())
                elif c.get("type") == "tool_use":
                    turn["tools"].append(tool_note(c))
    return turns


def render():
    found = {os.path.splitext(os.path.basename(f))[0]: f
             for f in glob.glob(os.path.join(TRANSCRIPT_DIR, "*.jsonl"))}
    missing = [s for s in SESSIONS if s not in found]
    if missing:
        sys.exit(f"Không tìm thấy transcript của phiên: {', '.join(missing)}")
    for sid in sorted(set(found) - set(SESSIONS)):
        print(f"Bỏ qua phiên không thuộc HW04: {sid}")

    turns = []
    for sid in SESSIONS:
        for t in load_turns(found[sid]):
            t["session"] = sid[:8]
            turns.append(t)
    turns.sort(key=lambda t: t["time"])

    parts = []
    for i, t in enumerate(turns, 1):
        tools = "\n".join(f"- {x}" for x in t["tools"]) or "- (không)"
        out = "\n\n".join(t["out"]) or "(Không có phản hồi: Phiên bị dừng hoặc chưa hoàn tất)"
        note = SESSION_NOTES.get(t["session"])
        note = f"> **Ghi chú của sinh viên:** {note}\n\n" if note else ""
        parts.append(
            f"### C{i:02d} | {fmt_time(t['time'])} | Tool: Claude Code ({t['model'] or 'n/a'}) | Session `{t['session']}`\n\n"
            f"{note}"
            f"**Prompt (nguyên văn):**\n\n{fence(t['prompt'])}\n\n"
            f"**Thao tác AI đã thực hiện (đọc/ghi file, chạy lệnh):**\n\n{tools}\n\n"
            f"**Output AI (nguyên văn):**\n\n{fence(out)}\n"
        )
    print(f"Đã xuất {len(turns)} lượt từ {len(SESSIONS)} phiên")
    return "\n---\n\n".join(parts)


def main():
    doc = open(LOG_FILE, encoding="utf-8").read()
    head, rest = doc.split(START, 1)
    _, tail = rest.split(END, 1)
    body = render()  # tạo xong nội dung rồi mới mở file ghi, để lỗi giữa chừng không xoá trắng file
    open(LOG_FILE, "w", encoding="utf-8").write(f"{head}{START}\n\n{body}\n\n{END}{tail}")
    print("Đã cập nhật", os.path.normpath(LOG_FILE))


if __name__ == "__main__":
    main()
