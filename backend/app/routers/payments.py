from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date, time
from app.database import get_db
from app.models.payment import Payment
from app.models.appointment import Appointment
from app.schemas.payment import PaymentCreate, PaymentUpdate, PaymentResponse, PaymentSummaryResponse

router = APIRouter(prefix="/payments", tags=["Financeiro"])


def _payment_with_relations(db: Session, payment_id: int) -> Optional[Payment]:
    return (
        db.query(Payment)
        .options(joinedload(Payment.appointment).joinedload(Appointment.patient))
        .filter(Payment.id == payment_id)
        .first()
    )


@router.get("/", response_model=List[PaymentResponse])
def list_payments(
    status: Optional[str] = Query(None, description="Filtrar por status"),
    patient_id: Optional[int] = Query(None, description="Filtrar por paciente"),
    skip: int = 0,
    limit: int = 200,
    db: Session = Depends(get_db),
):
    query = (
        db.query(Payment)
        .join(Payment.appointment)
        .options(joinedload(Payment.appointment).joinedload(Appointment.patient))
    )
    if status:
        query = query.filter(Payment.status == status)
    if patient_id is not None:
        query = query.filter(Appointment.patient_id == patient_id)
    return (
        query.order_by(Appointment.scheduled_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


@router.get("/summary", response_model=PaymentSummaryResponse)
def payments_summary(
    start: Optional[date] = Query(None, description="Data inicial (paid_at)"),
    end: Optional[date] = Query(None, description="Data final (paid_at)"),
    db: Session = Depends(get_db),
):
    paid_query = db.query(Payment).filter(Payment.status == "pago")
    if start:
        paid_query = paid_query.filter(Payment.paid_at >= datetime.combine(start, time.min))
    if end:
        paid_query = paid_query.filter(Payment.paid_at <= datetime.combine(end, time.max))

    paid = paid_query.all()
    pending = db.query(Payment).filter(Payment.status == "pendente").all()

    total_received = sum(float(p.amount) for p in paid)
    total_pending = sum(float(p.amount) for p in pending)
    return {
        "total_received": round(total_received, 2),
        "total_pending": round(total_pending, 2),
        "count_paid": len(paid),
        "count_pending": len(pending),
    }


@router.get("/by-appointment/{appointment_id}", response_model=PaymentResponse)
def get_by_appointment(appointment_id: int, db: Session = Depends(get_db)):
    payment = (
        db.query(Payment)
        .options(joinedload(Payment.appointment).joinedload(Appointment.patient))
        .filter(Payment.appointment_id == appointment_id)
        .first()
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado para esta consulta")
    return payment


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = _payment_with_relations(db, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    return payment


@router.post("/", response_model=PaymentResponse, status_code=201)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)):
    appointment = db.query(Appointment).filter(Appointment.id == payload.appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=400, detail="Consulta não encontrada")

    existing = db.query(Payment).filter(Payment.appointment_id == payload.appointment_id).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Esta consulta já possui um pagamento (id: %d)" % existing.id,
        )

    data = payload.model_dump()
    if data.get("status") == "pago" and not data.get("paid_at"):
        data["paid_at"] = datetime.utcnow()

    payment = Payment(**data)
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return _payment_with_relations(db, payment.id)


@router.put("/{payment_id}", response_model=PaymentResponse)
def update_payment(payment_id: int, payload: PaymentUpdate, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(payment, field, value)

    # Se virou "pago" e não há data registrada, marca agora
    if payment.status == "pago" and payment.paid_at is None:
        payment.paid_at = datetime.utcnow()

    db.commit()
    db.refresh(payment)
    return _payment_with_relations(db, payment.id)


@router.delete("/{payment_id}", status_code=204)
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Pagamento não encontrado")
    db.delete(payment)
    db.commit()
