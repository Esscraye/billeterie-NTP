from fastapi import APIRouter
from app.schemas import SimulationRequest
from app.services.time_service import (
    set_time_offset, 
    remove_time_offset, 
    get_time_offset,
    clear_all_offsets
)
from app.services.time_offsets_store import time_offsets  # 💥 Nouveau : import centralisé

router = APIRouter()

@router.post("/set-offset")
def set_server_time_offset(request: SimulationRequest):
    """Définir un décalage temporel pour un serveur"""
    set_time_offset(request.server_id, request.offset_seconds)
    return {
        "message": f"Time offset set for {request.server_id}",
        "server_id": request.server_id,
        "offset_seconds": request.offset_seconds
    }

@router.delete("/offset/{server_id}")
def remove_server_time_offset(server_id: str):
    """Supprimer le décalage temporel d'un serveur"""
    remove_time_offset(server_id)
    return {
        "message": f"Time offset removed for {server_id}",
        "server_id": server_id
    }

@router.get("/offsets")
def get_all_offsets():
    """Obtenir tous les décalages temporels actifs"""
    return {
        "offsets": time_offsets,
        "total_servers": len(time_offsets)
    }

@router.post("/start-demo")
def start_demo_simulation():
    """Démarrer une simulation de démonstration"""
    demo_offsets = {
        "server-1": 0.0,
        "server-2": -5.0,
        "server-3": 3.0,
        "server-4": -2.0,
    }
    for server_id, offset in demo_offsets.items():
        set_time_offset(server_id, offset)
    return {
        "message": "Demo simulation started",
        "servers_configured": demo_offsets
    }

@router.post("/stop-simulation")
def stop_simulation():
    """Arrêter toutes les simulations"""
    clear_all_offsets()
    return {
        "message": "All simulations stopped",
        "servers_reset": True
    }

@router.get("/scenarios")
def get_simulation_scenarios():
    """Obtenir les scénarios de simulation prédéfinis"""
    return {
        "minor_drift": {
            "description": "Léger décalage temporel",
            "servers": {
                "server-1": 0.0,
                "server-2": -1.0,
                "server-3": 0.5
            }
        },
        "major_drift": {
            "description": "Décalage temporel important",
            "servers": {
                "server-1": 0.0,
                "server-2": -10.0,
                "server-3": 5.0,
                "server-4": -3.0
            }
        },
        "extreme_drift": {
            "description": "Décalage temporel extrême",
            "servers": {
                "server-1": 0.0,
                "server-2": -30.0,
                "server-3": 15.0,
                "server-4": -8.0,
                "server-5": 12.0
            }
        }
    }

@router.post("/apply-scenario/{scenario_name}")
def apply_scenario(scenario_name: str):
    """Appliquer un scénario de simulation prédéfini"""
    scenarios = {
        "minor_drift": {
            "server-1": 0.0,
            "server-2": -1.0,
            "server-3": 0.5
        },
        "major_drift": {
            "server-1": 0.0,
            "server-2": -10.0,
            "server-3": 5.0,
            "server-4": -3.0
        },
        "extreme_drift": {
            "server-1": 0.0,
            "server-2": -30.0,
            "server-3": 15.0,
            "server-4": -8.0,
            "server-5": 12.0
        }
    }

    if scenario_name not in scenarios:
        return {"error": "Scenario not found"}

    scenario_offsets = scenarios[scenario_name]
    for server_id, offset in scenario_offsets.items():
        set_time_offset(server_id, offset)

    return {
        "message": f"Scenario '{scenario_name}' applied successfully",
        "servers_configured": scenario_offsets
    }
