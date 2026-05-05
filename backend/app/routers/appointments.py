from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime, date, time, timedelta
from app.database import get_db
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
)

router = APIRouter(prefix="/appointments", tags=["Agendamentos"])


def _find_conflicts(
    db: Session,
    patient_id: int,
    scheduled_at: datetime,
    duration_minutes: int,
    exclude_id: Optional[int] = None,
):
    """Retorna agendamentos do mesmo paciente cujo intervalo se sobrepõe ao novo."""
    new_end = scheduled_at + timedelta(minutes=duration_minutes)
    query = db.query(Appointment).filter(
        Appointment.patient_id == patient_id,
        Appointment.status == "agendado",
    )
    if exclude_id is not None:
        query = query.filter(Appointment.id != exclude_id)

    conflicts = []
    for appt in query.all():
        appt_end = appt.scheduled_at + timedelta(minutes=appt.duration_minutes)
        if appt.scheduled_at < new_end and scheduled_at < appt_end:
            conflicts.append(appt)
    return conflicts


@router.get("/", response_model=List[AppointmentResponse])
def list_appointments(
    appointment_date: Optional[date] = Query(None, alias="date", description="Filtrar por data (YYYY-MM-DD)"),
    patient_id: Optional[int] = Query(None, description="Filtrar por paciente"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
):
    query = db.query(Appointment).options(joinedload(Appointment.patient))

    if appointment_date:
        day_start = datetime.combine(appointment_date, time.min)
        day_end = datetime.combine(appointment_date, time.max)
        query = query.filter(and_(Appointment.scheduled_at >= day_start, Appointment.scheduled_at <= day_end))

    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)

    if status:
        query = query.filter(Appointment.status == status)

    return query.order_by(Appointment.scheduled_at.asc()).offset(skip).limit(limit).all()


@router.get("/check-conflict")
def check_conflict(
    patient_id: int,
    scheduled_at: datetime,
    duration_minutes: int = 30,
    exclude_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """Endpoint usado pelo frontend para avisar (não bloquear) sobre conflito de horário."""
    conflicts = _find_conflicts(db, patient_id, scheduled_at, duration_minutes, exclude_id)
    return {
        "has_conflict": len(conflicts) > 0,
        "conflicts": [
            {
                "id": c.id,
                "scheduled_at": c.scheduled_at.isoformat(),
                "duration_minutes": c.duration_minutes,
            }
            for c in conflicts
        ],
    }


@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    appt = (
        db.query(Appointment)
        .options(joinedload(Appointment.patient))
        .filter(Appointment.id == appointment_id)
        .first()
    )
    if not appt:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    return appt


@router.post("/", response_model=AppointmentResponse, status_code=201)
def create_appointment(payload: AppointmentCreate, db: Session = Depends(get_db)):
    patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
    if not patient:
        raise HTTPException(status_code=400, detail="Paciente não encontrado")

    db_appt = Appointment(**payload.model_dump())
    db.add(db_appt)
    db.commit()
    db.refresh(db_appt)
    db.refresh(db_appt, attribute_names=["patient"])
    return db_appt


@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    payload: AppointmentUpdate,
    db: Session = Depends(get_db),
):
    db_appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appt:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")

    if payload.patient_id is not None:
        patient = db.query(Patient).filter(Patient.id == payload.patient_id).first()
        if not patient:
            raise HTTPException(status_code=400, detail="Paciente não encontrado")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(db_appt, field, value)

    db.commit()
    db.refresh(db_appt)
    db.refresh(db_appt, attribute_names=["patient"])
    return db_appt


@router.delete("/{appointment_id}", status_code=204)
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    db_appt = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not db_appt:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado")
    db.delete(db_appt)
    db.commit()
