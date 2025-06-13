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

router = APIRouter()

@router.post("/reserve", response_model=Reservation)
def reserve_seat(
    reservation: ReservationCreate, 
    server_id: str = "server-1",
    db: Session = Depends(get_db)
):
    """Réserver un siège"""
    # Vérifier si le siège existe et est disponible
    seat = db.query(SeatModel).filter(SeatModel.id == reservation.seat_id).first()
    if not seat:
        raise HTTPException(status_code=404, detail="Seat not found")
    
    if not seat.is_available:
        raise HTTPException(status_code=400, detail="Seat is already reserved")
    
    # Obtenir le temps actuel (potentiellement avec décalage simulé)
    current_time, ntp_synced, offset = get_current_time(server_id)
    
    # Créer la réservation
    db_reservation = ReservationModel(
        seat_id=reservation.seat_id,
        customer_name=reservation.customer_name,
        reserved_at=current_time,
        server_id=server_id,
        ntp_synced=ntp_synced
    )
    
    # Marquer le siège comme indisponible
    seat.is_available = False
    
    db.add(db_reservation)
    db.commit()
    db.refresh(db_reservation)
    
    # Vérifier les conflits potentiels
    check_and_create_conflicts(db, reservation.seat_id)
    
    return db_reservation

@router.get("/", response_model=List[Reservation])
def get_reservations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Récupérer toutes les réservations"""
    reservations = db.query(ReservationModel).offset(skip).limit(limit).all()
    return reservations

@router.get("/conflicts", response_model=List[Conflict])
def get_conflicts(db: Session = Depends(get_db)):
    """Récupérer tous les conflits détectés"""
    conflicts = db.query(ConflictModel).all()
    return conflicts

@router.delete("/{reservation_id}")
def cancel_reservation(reservation_id: int, db: Session = Depends(get_db)):
    """Annuler une réservation"""
    reservation = db.query(ReservationModel).filter(ReservationModel.id == reservation_id).first()
    if not reservation:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    # Rendre le siège disponible
    seat = db.query(SeatModel).filter(SeatModel.id == reservation.seat_id).first()
    if seat:
        seat.is_available = True
    
    db.delete(reservation)
    db.commit()
    
    return {"message": "Reservation cancelled successfully"}

def check_and_create_conflicts(db: Session, seat_id: int):
    """Vérifier et créer des entrées de conflit pour un siège"""
    # Récupérer toutes les réservations pour ce siège dans les dernières 10 secondes
    time_threshold = datetime.utcnow() - timedelta(seconds=10)
    
    reservations = db.query(ReservationModel).filter(
        and_(
            ReservationModel.seat_id == seat_id,
            ReservationModel.reserved_at >= time_threshold
        )
    ).all()
    
    if len(reservations) > 1:
        # Conflit détecté !
        reservation_ids = [str(r.id) for r in reservations]
        
        # Calculer la différence de temps maximale
        times = [r.reserved_at for r in reservations]
        time_diff = (max(times) - min(times)).total_seconds()
        
        # Créer l'entrée de conflit
        conflict = ConflictModel(
            seat_id=seat_id,
            reservation_ids=json.dumps(reservation_ids),
            time_difference_seconds=time_diff
        )
        
        db.add(conflict)
        db.commit()
