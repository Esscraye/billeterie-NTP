from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import reservations, seats, time, simulation
from app.core.config import settings
from app.core.database import create_tables

app = FastAPI(
    title="Ticket Reservation NTP Demo",
    description="API démontrant l'importance de la synchronisation NTP",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(seats.router, prefix="/api/seats", tags=["seats"])
app.include_router(reservations.router, prefix="/api/reservations", tags=["reservations"])
app.include_router(time.router, prefix="/api/time", tags=["time"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["simulation"])

@app.on_event("startup")
async def startup_event():
    """Initialisation au démarrage"""
    await create_tables()

@app.get("/")
async def root():
    return {
        "message": "Ticket Reservation NTP Demo API",
        "docs": "/docs",
        "version": "1.0.0"
    }
