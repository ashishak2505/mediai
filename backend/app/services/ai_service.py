import google.generativeai as genai
import json
import re
from app.config import get_settings

settings = get_settings()
genai.configure(api_key=settings.gemini_api_key)

# Use Gemini 1.5 Flash — free tier, supports vision
model = genai.GenerativeModel("gemini-2.5-flash")


# ── Report analysis prompt ─────────────────────────────────────────────────────

REPORT_ANALYSIS_PROMPT = """
You are MediAI, a medical report assistant. A patient or doctor has uploaded a medical report.

Your job is to:
1. Identify the type of report (blood/xray/ecg/ctscan/mri/other)
2. Extract the key medical findings
3. Explain the report in simple, non-scary language a non-medical person can understand
4. Flag the severity level
5. Suggest what the patient should do next

IMPORTANT RULES:
- Never diagnose a disease definitively. Say "this may suggest" or "your doctor should check"
- Be warm and reassuring, not clinical and cold
- Use simple Hindi/English friendly terms where helpful
- Always recommend consulting a doctor for urgent findings

Respond ONLY with a valid JSON object in this exact format:
{
  "report_type": "blood|xray|ecg|ctscan|mri|other",
  "severity": "normal|borderline|urgent",
  "summary": "2-3 sentence plain language explanation of what this report shows overall",
  "key_findings": ["finding 1", "finding 2", "finding 3"],
  "what_to_do": "Clear recommended next step for the patient",
  "doctor_notes": "Technical summary for the doctor (can use medical terms)"
}
"""


async def analyze_report(
    extracted_text: str,
    page_images: list[str],    # base64 PNG images of PDF pages
    filename: str,
) -> dict:
    """
    Send report text + images to Gemini and get structured analysis back.
    """
    parts = [REPORT_ANALYSIS_PROMPT, f"\nFilename: {filename}\n"]

    if extracted_text.strip():
        parts.append(f"\nExtracted text from report:\n{extracted_text[:8000]}")

    # Attach up to 3 page images so Gemini can see charts, graphs, waveforms
    for b64img in page_images[:3]:
        parts.append({
            "mime_type": "image/png",
            "data": b64img,
        })

    response = model.generate_content(parts)
    raw = response.text.strip()

    # Strip markdown code fences if Gemini wraps in ```json
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Fallback if parsing fails
        return {
            "report_type": "other",
            "severity": "borderline",
            "summary": raw[:500],
            "key_findings": ["Could not parse structured findings"],
            "what_to_do": "Please show this report to your doctor.",
            "doctor_notes": raw,
        }


# ── Follow-up chat on a report ─────────────────────────────────────────────────

CHAT_SYSTEM_PROMPT = """
You are MediAI, a friendly medical assistant. The user is asking questions about their medical report.

Report context:
{report_context}

Rules:
- Answer in simple language the patient can understand
- If asked about a specific value, explain what it means and whether it's in normal range
- Never make a definitive diagnosis
- For urgent questions, always recommend seeing a doctor immediately
- Keep answers concise (3-5 sentences max)
- You can respond in Hindi if the user writes in Hindi
"""


async def chat_about_report(
    report_context: str,
    message: str,
    history: list[dict],
) -> str:
    """
    Conversational Q&A about a specific report.
    history = [{"role": "user"|"model", "parts": [text]}, ...]
    """
    system = CHAT_SYSTEM_PROMPT.format(report_context=report_context[:3000])

    # Build conversation history for Gemini multi-turn
    gemini_history = []
    for msg in history[-10:]:   # keep last 10 messages to stay within context
        gemini_history.append({
            "role": msg["role"],
            "parts": [msg["content"]],
        })

    chat = model.start_chat(history=gemini_history)
    full_prompt = f"{system}\n\nUser question: {message}"
    response = chat.send_message(full_prompt)
    return response.text


# ── Clinical summary for doctors ───────────────────────────────────────────────

async def generate_clinical_summary(reports: list[dict]) -> str:
    """
    Given a list of a patient's past reports, generate a clinical summary for doctors.
    """
    if not reports:
        return "No previous reports found."

    reports_text = "\n\n".join([
        f"Report ({r.get('report_type', 'unknown')}) on {r.get('created_at', 'unknown date')}:\n"
        f"Findings: {r.get('summary', '')}\n"
        f"Severity: {r.get('severity', '')}"
        for r in reports[:10]   # last 10 reports
    ])

    prompt = f"""
You are a clinical assistant. Based on the following patient reports, write a brief clinical summary
for the treating doctor. Use medical terminology. Highlight trends, recurring issues, and anything
requiring immediate attention.

Patient Reports:
{reports_text}

Write a 3-5 sentence clinical summary:
"""
    response = model.generate_content(prompt)
    return response.text.strip()