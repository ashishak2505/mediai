from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.utils.auth import get_current_user
from app.services.ai_service import chat_about_report
from app.database import get_supabase_admin

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/report", response_model=ChatResponse)
async def chat_about_report_endpoint(
    body: ChatRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Patient (or doctor) asks follow-up questions about a specific report.
    Example: "What does my hemoglobin level mean?" or "Is 140/90 BP dangerous?"
    """
    db = get_supabase_admin()

    # Fetch the report for context
    result = db.table("reports").select("*").eq("id", body.report_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found")

    r = result.data[0]

    # Patients can only chat about their own reports
    if current_user["role"] == "patient" and r["patient_id"] != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")

    # Build report context string for the AI
    report_context = f"""
Report Type: {r['report_type']}
Summary: {r['summary']}
Key Findings: {', '.join(r.get('key_findings', []))}
Severity: {r['severity']}
What to do: {r['what_to_do']}
Raw text: {(r.get('raw_extracted_text') or '')[:2000]}
"""

    # Convert history to Gemini format
    history = [
        {"role": "user" if m.role == "user" else "model", "content": m.content}
        for m in body.history
    ]

    answer = await chat_about_report(
        report_context=report_context,
        message=body.message,
        history=history,
    )

    return ChatResponse(answer=answer)