from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class SeatBase(BaseModel):
    number: int

class SeatCreate(SeatBase):
    pass

class Seat(SeatBase):
    id: int
    is_available: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class ReservationBase(BaseModel):
    customer_name: str

class ReservationCreate(ReservationBase):
    seat_id: int

class Reservation(ReservationBase):
    id: int
    seat_id: int
    reserved_at: datetime
    server_id: str
    ntp_synced: bool
    seat: Optional[Seat] = None
    
    class Config:
        from_attributes = True

class TimeLogBase(BaseModel):
    server_id: str
    ntp_synced: bool = False
    offset_seconds: float = 0.0

class TimeLogCreate(TimeLogBase):
    pass

class TimeLog(TimeLogBase):
    id: int
    timestamp: datetime
    ntp_server: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ConflictBase(BaseModel):
    seat_id: int
    time_difference_seconds: float

class Conflict(ConflictBase):
    id: int
    reservation_ids: str
    detected_at: datetime
    resolved: bool
    
    class Config:
        from_attributes = True

class SimulationRequest(BaseModel):
    server_id: str
    offset_seconds: float

class TimeStatusResponse(BaseModel):
    server_id: str
    current_time: datetime
    ntp_synced: bool
    offset_seconds: float
    last_sync: Optional[datetime] = None
