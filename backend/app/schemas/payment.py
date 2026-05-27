from pydantic import BaseModel, field_validator
from typing import Optional, Literal
from datetime import datetime


PaymentStatus = Literal["pendente", "pago", "cancelado"]
PaymentMethod = Literal["dinheiro", "pix", "cartao_debito", "cartao_credito", "transferencia"]


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


class PaymentBase(BaseModel):
    appointment_id: int
    amount: float
    status: PaymentStatus = "pendente"
    method: Optional[PaymentMethod] = None
    paid_at: Optional[datetime] = None
    notes: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError("Valor deve ser maior que zero")
        return v


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    amount: Optional[float] = None
    status: Optional[PaymentStatus] = None
    method: Optional[PaymentMethod] = None
    paid_at: Optional[datetime] = None
    notes: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Valor deve ser maior que zero")
        return v


class PaymentResponse(PaymentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    appointment: Optional[AppointmentMini] = None

    model_config = {"from_attributes": True}


class PaymentSummaryResponse(BaseModel):
    total_received: float
    total_pending: float
    count_paid: int
    count_pending: int
