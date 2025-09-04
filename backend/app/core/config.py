from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "duckdb:///data/piggy.db"
    debug: bool = True
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    
    class Config:
        env_file = ".env"

settings = Settings()