from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Numeric
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
from app.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(
        Integer,
        ForeignKey("appointments.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(20), nullable=False, default="pendente")
    method = Column(String(20), nullable=True)
    paid_at = Column(DateTime(timezone=False), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    appointment = relationship(
        "Appointment",
        backref=backref("payment", uselist=False, cascade="all, delete-orphan"),
    )
