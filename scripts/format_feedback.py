from pathlib import Path
import re

from docx import Document
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


SOURCE = Path(r"C:\Users\kelsey.wang\Downloads\Warehouse App Feedback (1).docx")
TARGET = Path(r"C:\Users\kelsey.wang\Downloads\Warehouse App Feedback - Formatted.docx")

NAVY = "17324D"
BLUE = "2E6F95"
LIGHT_BLUE = "EAF3F7"
GREY = "5B6570"


def shade_paragraph(paragraph, fill):
    properties = paragraph._p.get_or_add_pPr()
    shading = OxmlElement("w:shd")
    shading.set(qn("w:fill"), fill)
    properties.append(shading)


def set_run_font(run, name="Aptos", size=10.5, color="222222", bold=False):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), name)
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    run.bold = bold


def style_paragraph(paragraph, style_name, before=0, after=6, line=1.08):
    paragraph.style = style_name
    paragraph.paragraph_format.space_before = Pt(before)
    paragraph.paragraph_format.space_after = Pt(after)
    paragraph.paragraph_format.line_spacing = line


def set_heading_text(paragraph, text):
    paragraph.clear()
    run = paragraph.add_run(text)
    set_run_font(run, name="Aptos Display", size=14, color=NAVY, bold=True)


document = Document(SOURCE)
section = document.sections[0]
section.top_margin = Inches(0.7)
section.bottom_margin = Inches(0.65)
section.left_margin = Inches(0.8)
section.right_margin = Inches(0.8)

styles = document.styles
normal = styles["Normal"]
normal.font.name = "Aptos"
normal._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), "Aptos")
normal.font.size = Pt(10.5)
normal.font.color.rgb = RGBColor.from_string("222222")

for name, size, color, space_before, space_after in [
    ("Heading 1", 14, NAVY, 14, 5),
    ("Heading 2", 11, BLUE, 8, 3),
]:
    style = styles[name]
    style.font.name = "Aptos Display"
    style._element.get_or_add_rPr().rFonts.set(qn("w:eastAsia"), "Aptos Display")
    style.font.size = Pt(size)
    style.font.color.rgb = RGBColor.from_string(color)
    style.font.bold = True
    style.paragraph_format.space_before = Pt(space_before)
    style.paragraph_format.space_after = Pt(space_after)
    style.paragraph_format.keep_with_next = True

if "Caption" not in [style.name for style in styles]:
    caption = styles.add_style("Caption", WD_STYLE_TYPE.PARAGRAPH)
else:
    caption = styles["Caption"]
caption.font.name = "Aptos"
caption.font.size = Pt(9)
caption.font.italic = True
caption.font.color.rgb = RGBColor.from_string(GREY)

paragraphs = document.paragraphs
if paragraphs:
    title = paragraphs[0]
    title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    title.paragraph_format.space_before = Pt(6)
    title.paragraph_format.space_after = Pt(4)
    title.paragraph_format.keep_with_next = True
    for run in title.runs:
        set_run_font(run, name="Aptos Display", size=24, color=NAVY, bold=True)
    shade_paragraph(title, LIGHT_BLUE)

subheadings = {
    "Scan Screen",
    "Current display:",
    "Current behaviour requires users to click Clear before items are displayed.",
    "Display:",
    "Example:",
    "When:",
    "CONFIRM",
}
known_headings = {
    "1.(Priority) Make the Scan view default:": "1. Scan View as Default (Priority)",
    "1. Priorities Pending Containers": "2. Prioritise Pending Containers",
    "2. Move completed items to the bottom": "3. Move Completed Items to the Bottom",
    "3. Clarify Progress Counter": "4. Clarify the Progress Counter",
    "4. Replace 'Clear' button with 'All'": "5. Replace 'Clear' with 'All'",
    "5. Add Brand Information to Item Header": "6. Add Brand Information to Item Headers",
    "6. Keep Historical Commitments": "7. Keep Historical Commitments",
    "7. Update the \"?\" Button": "8. Improve the '?' Quantity Button",
    "8. Record Extra Stock Separately": "9. Record Extra Stock Separately",
    "9. Improve Confirm Action": "10. Improve the Confirm Action",
    "10. Allow New Bin Creation": "11. Allow New Bin Creation",
    "11. Lock Quantities Once Complete": "12. Lock Quantities Once Complete",
    "12. Restrict 'Add Manually'": "13. Restrict 'Add Manually'",
    "13. Issue Sign for the problematic items": "14. Add Issue Indicators for Problem Items",
    "14. Mobile Label Printing": "15. Support Mobile Label Printing",
    "15. Missing parts Checking": "16. Prioritise Missing Parts",
    "16. CSV download function": "17. Add CSV Download for Location Lists",
}

for paragraph in paragraphs[1:]:
    text = paragraph.text.strip()
    if not text:
        paragraph.paragraph_format.space_after = Pt(2)
        continue

    if text in known_headings:
        set_heading_text(paragraph, known_headings[text])
        style_paragraph(paragraph, "Heading 1")
        continue

    if text in subheadings or (text.endswith(":") and len(text) < 45):
        style_paragraph(paragraph, "Heading 2", before=6, after=3)
        for run in paragraph.runs:
            set_run_font(run, size=11, color=BLUE, bold=True)
        continue

    if text.startswith(("- ", "• ")):
        style_paragraph(paragraph, "List Bullet", after=3)
    else:
        style_paragraph(paragraph, "Normal", after=5)
        for run in paragraph.runs:
            set_run_font(run)

    if "graphicData" in paragraph._p.xml:
        paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        paragraph.paragraph_format.space_before = Pt(5)
        paragraph.paragraph_format.space_after = Pt(8)

header = section.header.paragraphs[0]
header.text = "WAREHOUSE APP  |  FEEDBACK & IMPROVEMENT REQUESTS"
header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
for run in header.runs:
    set_run_font(run, size=8, color=GREY, bold=True)

footer = section.footer.paragraphs[0]
footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
set_run_font(footer.add_run("Internal working document"), size=8, color=GREY)

document.core_properties.title = "Warehouse App Feedback and Improvement Requests"
document.core_properties.subject = "Organised feedback and requirements"
document.save(TARGET)
print(TARGET)