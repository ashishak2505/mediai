import fitz          # PyMuPDF
import pytesseract
from PIL import Image
import io
import base64
from pathlib import Path


def extract_text_from_pdf(file_bytes: bytes) -> tuple[str, list[str]]:
    """
    Extract text from a PDF file.
    Returns (extracted_text, list_of_base64_page_images).
    Images are passed to Gemini Vision for scanned/image-based PDFs.
    """
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    texts = []
    page_images = []

    for page in doc:
        # Try direct text extraction first (works for digital PDFs)
        text = page.get_text().strip()
        if text:
            texts.append(text)

        # Always render to image so Gemini Vision can see layout/charts/graphs
        mat = fitz.Matrix(2, 2)   # 2x zoom for better quality
        pix = page.get_pixmap(matrix=mat)
        img_bytes = pix.tobytes("png")
        page_images.append(base64.b64encode(img_bytes).decode())

    doc.close()

    extracted_text = "\n\n".join(texts)

    # If no text was found (scanned PDF), run OCR on the images
    if not extracted_text.strip():
        ocr_texts = []
        for b64img in page_images:
            img_bytes = base64.b64decode(b64img)
            img = Image.open(io.BytesIO(img_bytes))
            ocr_text = pytesseract.image_to_string(img)
            ocr_texts.append(ocr_text)
        extracted_text = "\n\n".join(ocr_texts)

    return extracted_text, page_images


def extract_text_from_image(file_bytes: bytes) -> tuple[str, str]:
    """
    Extract text from an image file using OCR.
    Returns (extracted_text, base64_image).
    """
    img = Image.open(io.BytesIO(file_bytes))

    # Convert to RGB if needed (handles PNG with transparency, etc.)
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    ocr_text = pytesseract.image_to_string(img)
    b64 = base64.b64encode(file_bytes).decode()

    return ocr_text, b64


def detect_report_type_from_filename(filename: str) -> str:
    """
    Rough guess of report type from filename.
    Gemini will confirm / override this.
    """
    name = filename.lower()
    if any(w in name for w in ["blood", "cbc", "hb", "hemoglobin", "rbc", "wbc"]):
        return "blood"
    if any(w in name for w in ["xray", "x-ray", "chest", "lung"]):
        return "xray"
    if any(w in name for w in ["ecg", "ekg", "electrocardiogram"]):
        return "ecg"
    if any(w in name for w in ["ct", "ctscan", "computed"]):
        return "ctscan"
    if "mri" in name:
        return "mri"
    return "other"