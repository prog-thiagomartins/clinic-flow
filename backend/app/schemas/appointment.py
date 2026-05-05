from pydantic import BaseModel, field_validator
from typing import Optional, Literal
from datetime import datetime

AppointmentStatus = Literal["agendado", "realizado", "cancelado"]

class PatientNested(BaseModel):
    id: int
    name: str
    cpf: str
    phone: str

    model_config = {"from_attributes": True}

class AppointmentBase(BaseModel):
    patient_id: int
    scheduled_at: datetime
    duration_minutes: int = 30
    status: AppointmentStatus = "agendado"
    notes: Optional[str] = None

    @field_validator("duration_minutes")
    @classmethod
    def validate_duration(cls, v):
        if v <= 0:
            raise ValueError("Duração deve ser maior que zero")
        if v > 600:
            raise ValueError("Duração não pode exceder 600 minutos")
        return v

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    patient_id: Optional[int] = None
    scheduled_at: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    status: Optional[AppointmentStatus] = None
    notes: Optional[str] = None

class AppointmentResponse(AppointmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    patient: Optional[PatientNested] = None

    model_config = {"from_attributes": True}
