from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import PatientHistoryResponse, ReportListItem
from app.utils.auth import require_doctor
from app.services.ai_service import generate_clinical_summary
from app.database import get_supabase_admin

router = APIRouter(prefix="/doctor", tags=["doctor"])


@router.get("/patient/{mobile}", response_model=PatientHistoryResponse)
async def get_patient_by_mobile(
    mobile: str,
    current_user: dict = Depends(require_doctor),
):
    """
    Doctor looks up a patient by mobile number.
    Returns full report history + AI clinical summary.
    """
    db = get_supabase_admin()

    # Find patient
    patient_result = db.table("patients").select("*").eq("mobile", mobile).execute()

    if not patient_result.data:
        raise HTTPException(status_code=404, detail="No patient found with this mobile number")

    patient = patient_result.data[0]

    # Get all their reports
    reports_result = (
        db.table("reports")
        .select("*")
        .eq("patient_id", patient["id"])
        .order("created_at", desc=True)
        .execute()
    )

    reports = reports_result.data or []

    # AI clinical summary for the doctor
    clinical_summary = await generate_clinical_summary(reports)

    report_items = [
        ReportListItem(
            report_id=r["id"],
            report_type=r["report_type"],
            severity=r["severity"],
            summary=r["summary"],
            file_name=r["file_name"] or "report",
            created_at=r["created_at"],
        )
        for r in reports
    ]

    return PatientHistoryResponse(
        patient_id=patient["id"],
        name=patient["name"],
        mobile=patient["mobile"],
        age=patient["age"],
        gender=patient["gender"],
        reports=report_items,
        clinical_summary=clinical_summary,
    )


@router.get("/patients/recent")
async def get_recent_patients(current_user: dict = Depends(require_doctor)):
    """
    Returns patients who uploaded reports recently — for doctor's dashboard.
    """
    db = get_supabase_admin()

    result = (
        db.table("reports")
        .select("patient_id, created_at, severity, report_type, patients(name, mobile)")
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )

    # Deduplicate by patient_id, keep most recent
    seen = set()
    unique = []
    for r in result.data:
        pid = r["patient_id"]
        if pid not in seen:
            seen.add(pid)
            unique.append(r)

    return unique