"""Portable Unicode document exports with collision-resistant filenames."""
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from docx import Document


def create_doc(response, output_dir):
    directory = Path(output_dir)
    directory.mkdir(parents=True, exist_ok=True)
    document = Document()
    document.add_heading("SoftwareDocBot", 0)
    document.add_paragraph("SQL & schema documentation")
    document.add_paragraph(datetime.now(timezone.utc).strftime("Generated %Y-%m-%d at %H:%M UTC"))
    for line in response.splitlines():
        if line.startswith("#"):
            level = min(len(line) - len(line.lstrip("#")), 3)
            document.add_heading(line.lstrip("# "), level)
        else:
            document.add_paragraph(line)
    filename = f"softwaredocbot-{uuid4().hex}.docx"
    document.save(directory / filename)
    return filename
