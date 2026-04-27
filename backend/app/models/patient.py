from sqlalchemy import Column, Integer, String, Date, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    cpf = Column(String(14), unique=True, nullable=False, index=True)
    birth_date = Column(Date, nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(150), nullable=True)
    address = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
