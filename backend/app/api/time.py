from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas import TimeStatusResponse, TimeLogCreate
from app.models import TimeLog as TimeLogModel
from app.services.time_service import get_current_time, sync_with_ntp

router = APIRouter()

@router.get("/status", response_model=TimeStatusResponse)
def get_time_status(server_id: str = "server-1", db: Session = Depends(get_db)):
    """Obtenir le statut de synchronisation temporelle"""
    current_time, ntp_synced, offset = get_current_time(server_id)
    
    # Récupérer la dernière synchronisation
    last_log = db.query(TimeLogModel).filter(
        TimeLogModel.server_id == server_id
    ).order_by(TimeLogModel.created_at.desc()).first()
    
    return TimeStatusResponse(
        server_id=server_id,
        current_time=current_time,
        ntp_synced=ntp_synced,
        offset_seconds=offset,
        last_sync=last_log.created_at if last_log else None
    )

@router.post("/sync")
def force_ntp_sync(server_id: str = "server-1", db: Session = Depends(get_db)):
    """Forcer une synchronisation NTP"""
    success, offset = sync_with_ntp()
    
    # Enregistrer le log de synchronisation
    time_log = TimeLogModel(
        server_id=server_id,
        ntp_synced=success,
        offset_seconds=offset
    )
    
    db.add(time_log)
    db.commit()
    
    return {
        "success": success,
        "offset_seconds": offset,
        "message": "NTP sync completed" if success else "NTP sync failed"
    }
