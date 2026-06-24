from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.routers import auth, reports, doctor, chat

settings = get_settings()

app = FastAPI(
    title="MediAI — Medical Report Assistant",
    description="AI-powered medical report analysis for patients and doctors",
    version="1.0.0",
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173",
                   "https://mediai-git-main-ashishak2506.vercel.app",
                   "https://mediai-mxy3t9fah-ashishak2506.vercel.app",],

    allow_origin_regex=r"https://mediai-.*-ashishak2506\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(doctor.router)
app.include_router(chat.router)


# ── Health check ───────────────────────────────────────────────────────────────
@app.get("/", tags=["health"])
async def root():
    return {"status": "ok", "message": "MediAI API is running"}


@app.get("/health", tags=["health"])
async def health():
    return {"status": "healthy", "version": "1.0.0"}