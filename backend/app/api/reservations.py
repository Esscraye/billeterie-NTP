from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List
from datetime import datetime, timedelta
import json

from app.core.database import get_db
from app.models import Reservation as ReservationModel, Seat as SeatModel, Conflict as ConflictModel
from app.schemas import Reservation, ReservationCreate, Conflict
from app.services.time_service import get_current_time
from app.services.time_offsets_store import time_offsets

router = APIRouter()

@router.post("/reserve", response_model=Reservation)
def reserve_seat(
    reservation: ReservationCreate, 
    server_id: str = "server-1",
    db: Session = Depends(get_db)
):
    """Réserver un siège"""
    seat = db.query(SeatModel).filter(SeatModel.id == reservation.seat_id).first()
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")

    if not seat.is_available:
        # Autoriser si récente réservation concurrente (ex: autre serveur)
        last_res = db.query(ReservationModel).filter(
            ReservationModel.seat_id == reservation.seat_id
        ).order_by(ReservationModel.reserved_at.desc()).first()

        if last_res:
            now, _, _ = get_current_time(server_id)
            delta = abs((now - last_res.reserved_at).total_seconds())
            if delta > 10:
                raise HTTPException(status_code=400, detail="Seat is already reserved")
        else:
            raise HTTPException(status_code=400, detail="Seat is already reserved")

    current_time, ntp_synced, offset = get_current_time(server_id)

    db_reservation = ReservationModel(
        seat_id=reservation.seat_id,
        customer_name=reservation.customer_name,
        reserved_at=current_time,
        server_id=server_id,
        ntp_synced=ntp_synced
    )

    seat.is_available = False

    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)

    check_and_create_conflicts(db, reservation.seat_id)

    return db_reservation

@router.get("/", response_model=List[Reservation])
def get_reservations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(ReservationModel).offset(skip).limit(limit).all()

@router.get("/conflicts", response_model=List[Conflict])
def get_conflicts(db: Session = Depends(get_db)):
    return db.query(ConflictModel).all()

@router.delete("/{reservation_id}")
def cancel_reservation(reservation_id: int, db: Session = Depends(get_db)):
    reservation = db.query(ReservationModel).filter(ReservationModel.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")

    seat = db.query(SeatModel).filter(SeatModel.id == reservation.seat_id).first()
    if seat:
        seat.is_available = True

    db.delete(reservation)
    db.commit()
    return {"message": "Reservation cancelled successfully"}

def check_and_create_conflicts(db: Session, seat_id: int):
    """Détecter un conflit réel basé sur les heures corrigées du drift"""

    reservations = db.query(ReservationModel).filter(
        ReservationModel.seat_id == seat_id
    ).order_by(ReservationModel.reserved_at.desc()).limit(10).all()

    if len(reservations) <= 1:
        return

    corrected_times = []
    offsets = []
    for r in reservations:
        offset = time_offsets.get(r.server_id, 0.0)
        offsets.append(offset)
        corrected_time = r.reserved_at - timedelta(seconds=offset)
        corrected_times.append(corrected_time)

    # Pas de conflit s’il n’y a qu’un seul offset (i.e. serveurs synchronisés)
    if len(set(offsets)) <= 1:
        return

    time_diff = (max(corrected_times) - min(corrected_times)).total_seconds()

    if time_diff <= 10:
        reservation_ids = [str(r.id) for r in reservations]

        conflict = ConflictModel(
            seat_id=seat_id,
            reservation_ids=json.dumps(reservation_ids),
            time_difference_seconds=time_diff
        )

        db.add(conflict)
        db.commit()
