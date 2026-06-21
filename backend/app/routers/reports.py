from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from typing import Optional
import uuid

from app.models.schemas import ReportUploadResponse, ReportListItem
from app.utils.auth import get_current_user
from app.utils.parser import (
    extract_text_from_pdf,
    extract_text_from_image,
    detect_report_type_from_filename,
)
from app.services.ai_service import analyze_report
from app.database import get_supabase_admin

router = APIRouter(prefix="/reports", tags=["reports"])

ALLOWED_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
}


@router.post("/upload", response_model=ReportUploadResponse)
async def upload_report(
    file: UploadFile = File(...),
    report_type_hint: Optional[str] = Form(None),
    current_user: dict = Depends(get_current_user),
):
    """
    Patient uploads a medical report (PDF or image).
    Returns an AI-generated plain-language explanation.
    """
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Upload a PDF or image (JPG/PNG).",
        )

    file_bytes = await file.read()

    if len(file_bytes) > 10 * 1024 * 1024:   # 10 MB limit
        raise HTTPException(status_code=400, detail="File too large. Max 10 MB.")

    # --- Parse the document ---
    if file.content_type == "application/pdf":
        extracted_text, page_images = extract_text_from_pdf(file_bytes)
    else:
        extracted_text, single_image = extract_text_from_image(file_bytes)
        page_images = [single_image]

    # --- Send to Gemini ---
    analysis = await analyze_report(
        extracted_text=extracted_text,
        page_images=page_images,
        filename=file.filename or "report",
    )

    # --- Upload file to Supabase Storage ---
    db = get_supabase_admin()
    patient_id = current_user["sub"]
    file_path = f"{patient_id}/{uuid.uuid4()}_{file.filename}"

    try:
        db.storage.from_("reports").upload(
            path=file_path,
            file=file_bytes,
            file_options={"content-type": file.content_type},
        )
    except Exception as e:
        # Non-fatal — we still save the analysis even if file upload fails
        print(f"Storage upload warning: {e}")
        file_path = None

    # --- Save report record to DB ---
    report_record = {
        "id":                 str(uuid.uuid4()),
        "patient_id":         patient_id,
        "file_name":          file.filename,
        "file_path":          file_path,
        "report_type":        analysis.get("report_type", "other"),
        "severity":           analysis.get("severity", "borderline"),
        "summary":            analysis.get("summary", ""),
        "key_findings":       analysis.get("key_findings", []),
        "what_to_do":         analysis.get("what_to_do", ""),
        "doctor_notes":       analysis.get("doctor_notes", ""),
        "raw_extracted_text": extracted_text[:5000] if extracted_text else None,
    }

    result = db.table("reports").insert(report_record).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Could not save report")

    saved = result.data[0]

    return ReportUploadResponse(
        report_id=saved["id"],
        report_type=saved["report_type"],
        severity=saved["severity"],
        summary=saved["summary"],
        key_findings=saved["key_findings"],
        what_to_do=saved["what_to_do"],
        raw_extracted_text=saved.get("raw_extracted_text"),
        created_at=saved["created_at"],
    )


@router.get("/my", response_model=list[ReportListItem])
async def get_my_reports(current_user: dict = Depends(get_current_user)):
    """Patient views their own report history."""
    db = get_supabase_admin()
    patient_id = current_user["sub"]

    result = (
        db.table("reports")
        .select("id, report_type, severity, summary, file_name, created_at")
        .eq("patient_id", patient_id)
        .order("created_at", desc=True)
        .execute()
    )

    return [
        ReportListItem(
            report_id=r["id"],
            report_type=r["report_type"],
            severity=r["severity"],
            summary=r["summary"],
            file_name=r["file_name"] or "report",
            created_at=r["created_at"],
        )
        for r in result.data
    ]


@router.get("/{report_id}", response_model=ReportUploadResponse)
async def get_report(
    report_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Fetch a single report — accessible by the patient who owns it or any doctor."""
    db = get_supabase_admin()

    result = db.table("reports").select("*").eq("id", report_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found")

    r = result.data[0]

    # Patients can only see their own reports
    if current_user["role"] == "patient" and r["patient_id"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return ReportUploadResponse(
        report_id=r["id"],
        report_type=r["report_type"],
        severity=r["severity"],
        summary=r["summary"],
        key_findings=r["key_findings"],
        what_to_do=r["what_to_do"],
        raw_extracted_text=r.get("raw_extracted_text"),
        created_at=r["created_at"],
    )