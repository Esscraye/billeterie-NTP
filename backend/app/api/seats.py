from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import Seat as SeatModel
from app.schemas import Seat, SeatCreate

router = APIRouter()

@router.get("/", response_model=List[Seat])
def get_seats(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Récupérer tous les sièges"""
    seats = db.query(SeatModel).offset(skip).limit(limit).all()
    return seats

@router.post("/", response_model=Seat)
def create_seat(seat: SeatCreate, db: Session = Depends(get_db)):
    """Créer un nouveau siège"""
    # Vérifier si le siège existe déjà
    existing_seat = db.query(SeatModel).filter(SeatModel.number == seat.number).first()
    if existing_seat:
        raise HTTPException(status_code=400, detail="Seat number already exists")
    
    db_seat = SeatModel(**seat.dict())
    db.add(db_seat)
    db.commit()
    db.refresh(db_seat)
    return db_seat

@router.get("/{seat_id}", response_model=Seat)
def get_seat(seat_id: int, db: Session = Depends(get_db)):
    """Récupérer un siège par ID"""
    seat = db.query(SeatModel).filter(SeatModel.id == seat_id).first()
    if seat is None:
        raise HTTPException(status_code=404, detail="Seat not found")
    return seat

@router.post("/initialize")
def initialize_seats(total_seats: int = 100, db: Session = Depends(get_db)):
    """Initialiser les sièges (pour le setup initial)"""
    # Supprimer les sièges existants
    db.query(SeatModel).delete()
    
    # Créer les nouveaux sièges
    for i in range(1, total_seats + 1):
        seat = SeatModel(number=i, is_available=True)
        db.add(seat)
    
    db.commit()
    return {"message": f"{total_seats} seats initialized successfully"}
