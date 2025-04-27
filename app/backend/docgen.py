from fpdf import FPDF
import os
from datetime import datetime

def create_doc(bot_response, output_dir="static/docs"):
    #  Create output folder if missing
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.multi_cell(0, 10, bot_response)

    #  Save with timestamp to avoid conflict
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"chat_{timestamp}.pdf"
    pdf_path = os.path.join(output_dir, filename)
    pdf.output(pdf_path)

    return filename  