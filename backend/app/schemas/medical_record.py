from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class PatientMini(BaseModel):
    id: int
    name: str
    cpf: str

    model_config = {"from_attributes": True}


class AppointmentMini(BaseModel):
    id: int
    scheduled_at: datetime
    status: str
    patient_id: int
    patient: Optional[PatientMini] = None

    model_config = {"from_attributes": True}


class MedicalRecordBase(BaseModel):
    appointment_id: int
    chief_complaint: str
    evolution: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    prescription: Optional[str] = None


class MedicalRecordCreate(MedicalRecordBase):
    pass


class MedicalRecordUpdate(BaseModel):
    chief_complaint: Optional[str] = None
    evolution: Optional[str] = None
    diagnosis: Optional[str] = None
    treatment: Optional[str] = None
    prescription: Optional[str] = None


class MedicalRecordResponse(MedicalRecordBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    appointment: Optional[AppointmentMini] = None

    model_config = {"from_attributes": True}
