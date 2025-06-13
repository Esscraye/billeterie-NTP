from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://postgres:example@postgres:5432/ticketdb"
    secret_key: str = "your-secret-key-here"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # NTP settings
    ntp_server: str = "pool.ntp.org"
    time_sync_interval: int = 300  # 5 minutes
    
    # Simulation settings
    max_seats: int = 100
    simulation_enabled: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()
