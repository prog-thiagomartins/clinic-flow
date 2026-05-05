from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.database import get_db
from app.models.medical_record import MedicalRecord
from app.models.appointment import Appointment
from app.schemas.medical_record import (
    MedicalRecordCreate,
    MedicalRecordUpdate,
    MedicalRecordResponse,
)

router = APIRouter(prefix="/medical-records", tags=["Prontuarios"])


def _record_with_relations(db: Session, record_id: int) -> Optional[MedicalRecord]:
    return (
        db.query(MedicalRecord)
        .options(joinedload(MedicalRecord.appointment).joinedload(Appointment.patient))
        .filter(MedicalRecord.id == record_id)
        .first()
    )


@router.get("/", response_model=List[MedicalRecordResponse])
def list_medical_records(
    patient_id: Optional[int] = Query(None, description="Filtrar por paciente"),
    appointment_id: Optional[int] = Query(None, description="Filtrar por consulta"),
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
):
    query = (
        db.query(MedicalRecord)
        .join(MedicalRecord.appointment)
        .options(joinedload(MedicalRecord.appointment).joinedload(Appointment.patient))
    )

    if patient_id is not None:
        query = query.filter(Appointment.patient_id == patient_id)

    if appointment_id is not None:
        query = query.filter(MedicalRecord.appointment_id == appointment_id)

    return (
        query.order_by(Appointment.scheduled_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/by-appointment/{appointment_id}", response_model=MedicalRecordResponse)
def get_by_appointment(appointment_id: int, db: Session = Depends(get_db)):
    record = (
        db.query(MedicalRecord)
        .options(joinedload(MedicalRecord.appointment).joinedload(Appointment.patient))
        .filter(MedicalRecord.appointment_id == appointment_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Prontuário não encontrado para esta consulta")
    return record


@router.get("/{record_id}", response_model=MedicalRecordResponse)
def get_medical_record(record_id: int, db: Session = Depends(get_db)):
    record = _record_with_relations(db, record_id)
    if not record:
        raise HTTPException(status_code=404, detail="Prontuário não encontrado")
    return record


@router.post("/", response_model=MedicalRecordResponse, status_code=201)
def create_medical_record(payload: MedicalRecordCreate, db: Session = Depends(get_db)):
    appointment = (
        db.query(Appointment).filter(Appointment.id == payload.appointment_id).first()
    )
    if not appointment:
        raise HTTPException(status_code=400, detail="Consulta não encontrada")

    existing = (
        db.query(MedicalRecord)
        .filter(MedicalRecord.appointment_id == payload.appointment_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Esta consulta já possui um prontuário (id: %d)" % existing.id,
        )

    record = MedicalRecord(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return _record_with_relations(db, record.id)


@router.put("/{record_id}", response_model=MedicalRecordResponse)
def update_medical_record(
    record_id: int,
    payload: MedicalRecordUpdate,
    db: Session = Depends(get_db),
):
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prontuário não encontrado")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(record, field, value)

    db.commit()
    db.refresh(record)
    return _record_with_relations(db, record.id)


@router.delete("/{record_id}", status_code=204)
def delete_medical_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prontuário não encontrado")
    db.delete(record)
    db.commit()
