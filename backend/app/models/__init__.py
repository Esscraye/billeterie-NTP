from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Float, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Seat(Base):
    __tablename__ = "seats"
    
    id = Column(Integer, primary_key=True, index=True)
    number = Column(Integer, unique=True, nullable=False, index=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    reservations = relationship("Reservation", back_populates="seat")

class Reservation(Base):
    __tablename__ = "reservations"
    
    id = Column(Integer, primary_key=True, index=True)
    seat_id = Column(Integer, ForeignKey("seats.id"))
    customer_name = Column(String, nullable=False)
    reserved_at = Column(DateTime(timezone=True), server_default=func.now())
    server_id = Column(String, default="server-1")  # Identifiant du serveur
    ntp_synced = Column(Boolean, default=False)
    
    # Relations
    seat = relationship("Seat", back_populates="reservations")

class TimeLog(Base):
    __tablename__ = "time_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    server_id = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    ntp_synced = Column(Boolean, default=False)
    offset_seconds = Column(Float, default=0.0)
    ntp_server = Column(String, default="pool.ntp.org")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Conflict(Base):
    __tablename__ = "conflicts"
    
    id = Column(Integer, primary_key=True, index=True)
    seat_id = Column(Integer, ForeignKey("seats.id"))
    reservation_ids = Column(Text)  # JSON string des IDs de réservations en conflit
    detected_at = Column(DateTime(timezone=True), server_default=func.now())
    time_difference_seconds = Column(Float)
    resolved = Column(Boolean, default=False)
    
    # Relations
    seat = relationship("Seat")
