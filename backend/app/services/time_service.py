import ntplib
from datetime import datetime, timedelta
import time
from typing import Tuple
from app.services.time_offsets_store import time_offsets

def get_current_time(server_id: str = "server-1") -> Tuple[datetime, bool, float]:
    """
    Obtenir le temps actuel pour un serveur donné
    Retourne: (timestamp, ntp_synced, offset_seconds)
    """
    base_time = datetime.utcnow()
    
    # Appliquer le décalage simulé si configuré
    if server_id in time_offsets:
        offset = time_offsets[server_id]
        adjusted_time = base_time + timedelta(seconds=offset)
        return adjusted_time, False, offset
    
    # Temps normal (considéré comme synchronisé NTP)
    return base_time, True, 0.0

def sync_with_ntp(ntp_server: str = "pool.ntp.org") -> Tuple[bool, float]:
    """
    Synchroniser avec un serveur NTP
    Retourne: (success, offset_seconds)
    """
    try:
        client = ntplib.NTPClient()
        response = client.request(ntp_server, version=3)
        
        # Calculer le décalage
        offset = response.offset
        
        return True, offset
    except Exception as e:
        print(f"Erreur de synchronisation NTP: {e}")
        return False, 0.0

def set_time_offset(server_id: str, offset_seconds: float):
    """Définir un décalage temporel pour simulation"""
    time_offsets[server_id] = offset_seconds

def remove_time_offset(server_id: str):
    """Supprimer le décalage temporel pour un serveur"""
    if server_id in time_offsets:
        del time_offsets[server_id]

def get_time_offset(server_id: str) -> float:
    """Obtenir le décalage actuel d'un serveur"""
    return time_offsets.get(server_id, 0.0)

def clear_all_offsets():
    """Supprimer tous les décalages"""
    time_offsets.clear()
