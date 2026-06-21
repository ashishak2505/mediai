from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime
from enum import Enum


# ── Enums ──────────────────────────────────────────────────────────────────────

class UserRole(str, Enum):
    patient = "patient"
    doctor  = "doctor"


class ReportType(str, Enum):
    blood   = "blood"
    xray    = "xray"
    ecg     = "ecg"
    ctscan  = "ctscan"
    mri     = "mri"
    other   = "other"


class SeverityLevel(str, Enum):
    normal     = "normal"
    borderline = "borderline"
    urgent     = "urgent"


# ── Auth ───────────────────────────────────────────────────────────────────────

class RegisterPatientRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    mobile: str = Field(..., pattern=r"^\+?[0-9]{10,13}$")
    age: int = Field(..., ge=0, le=120)
    gender: Literal["male", "female", "other"]
    password: str = Field(..., min_length=6)


class RegisterDoctorRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    mobile: str = Field(..., pattern=r"^\+?[0-9]{10,13}$")
    specialization: str
    password: str = Field(..., min_length=6)
    # In production you'd verify this with a medical council number
    registration_number: str


class LoginRequest(BaseModel):
    # Patients log in with mobile, doctors with email
    identifier: str   # mobile OR email
    password: str
    role: UserRole


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: str
    name: str


# ── Reports ────────────────────────────────────────────────────────────────────

class ReportUploadResponse(BaseModel):
    report_id: str
    report_type: ReportType
    severity: SeverityLevel
    summary: str           # plain-language explanation for patients
    key_findings: list[str]
    what_to_do: str        # recommended next steps
    raw_extracted_text: Optional[str] = None
    created_at: datetime


class ReportListItem(BaseModel):
    report_id: str
    report_type: ReportType
    severity: SeverityLevel
    summary: str
    file_name: str
    created_at: datetime


class PatientHistoryResponse(BaseModel):
    patient_id: str
    name: str
    mobile: str
    age: int
    gender: str
    reports: list[ReportListItem]
    clinical_summary: Optional[str] = None   # AI summary for doctors


# ── Chat / RAG ─────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    report_id: str
    message: str
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = []