from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers.patients import router as patients_router
from app.routers.appointments import router as appointments_router
from app.routers.medical_records import router as medical_records_router
from app.routers.payments import router as payments_router
import app.models  # noqa: F401 — garante que os models são registrados

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ClinicFlow API",
    description="Sistema de gestão para profissionais autônomos de saúde",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients_router, prefix="/api")
app.include_router(appointments_router, prefix="/api")
app.include_router(medical_records_router, prefix="/api")
app.include_router(payments_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "ClinicFlow API está rodando!", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok"}
