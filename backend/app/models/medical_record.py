from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
from app.database import Base


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(
        Integer,
        ForeignKey("appointments.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    chief_complaint = Column(Text, nullable=False)
    evolution = Column(Text, nullable=True)
    diagnosis = Column(String(255), nullable=True)
    treatment = Column(Text, nullable=True)
    prescription = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    appointment = relationship(
        "Appointment",
        backref=backref("medical_record", uselist=False, cascade="all, delete-orphan"),
    )
