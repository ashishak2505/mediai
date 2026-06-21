from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    RegisterPatientRequest, RegisterDoctorRequest,
    LoginRequest, TokenResponse, UserRole,
)
from app.utils.auth import hash_password, verify_password, create_access_token
from app.database import get_supabase_admin

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register/patient", response_model=TokenResponse, status_code=201)
async def register_patient(body: RegisterPatientRequest):
    db = get_supabase_admin()

    # Check mobile not already registered
    existing = db.table("patients").select("id").eq("mobile", body.mobile).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="Mobile number already registered")

    hashed = hash_password(body.password)

    result = db.table("patients").insert({
        "name":     body.name,
        "mobile":   body.mobile,
        "age":      body.age,
        "gender":   body.gender,
        "password": hashed,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Could not create patient account")

    patient = result.data[0]
    token = create_access_token({
        "sub":  patient["id"],
        "role": "patient",
        "name": patient["name"],
    })

    return TokenResponse(
        access_token=token,
        role=UserRole.patient,
        user_id=patient["id"],
        name=patient["name"],
    )


@router.post("/register/doctor", response_model=TokenResponse, status_code=201)
async def register_doctor(body: RegisterDoctorRequest):
    db = get_supabase_admin()

    existing = db.table("doctors").select("id").eq("email", body.email).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="Email already registered")

    hashed = hash_password(body.password)

    result = db.table("doctors").insert({
        "name":                body.name,
        "email":               body.email,
        "mobile":              body.mobile,
        "specialization":      body.specialization,
        "registration_number": body.registration_number,
        "password":            hashed,
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Could not create doctor account")

    doctor = result.data[0]
    token = create_access_token({
        "sub":  doctor["id"],
        "role": "doctor",
        "name": doctor["name"],
    })

    return TokenResponse(
        access_token=token,
        role=UserRole.doctor,
        user_id=doctor["id"],
        name=doctor["name"],
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    db = get_supabase_admin()

    if body.role == UserRole.patient:
        result = db.table("patients").select("*").eq("mobile", body.identifier).execute()
        table_key = "patient"
    else:
        result = db.table("doctors").select("*").eq("email", body.identifier).execute()
        table_key = "doctor"

    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = result.data[0]

    if not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub":  user["id"],
        "role": table_key,
        "name": user["name"],
    })

    return TokenResponse(
        access_token=token,
        role=body.role,
        user_id=user["id"],
        name=user["name"],
    )