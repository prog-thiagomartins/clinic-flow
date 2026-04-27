from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import date, datetime
import re

class PatientBase(BaseModel):
    name: str
    cpf: str
    birth_date: date
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None

    @field_validator("cpf")
    @classmethod
    def validate_cpf(cls, v):
        cpf = re.sub(r"\D", "", v)
        if len(cpf) != 11:
            raise ValueError("CPF deve ter 11 dígitos")
        return f"{cpf[:3]}.{cpf[3:6]}.{cpf[6:9]}-{cpf[9:]}"

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v):
        phone = re.sub(r"\D", "", v)
        if len(phone) < 10 or len(phone) > 11:
            raise ValueError("Telefone inválido")
        return v

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    notes: Optional[str] = None
    birth_date: Optional[date] = None

class PatientResponse(PatientBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
