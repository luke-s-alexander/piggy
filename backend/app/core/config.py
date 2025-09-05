from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "duckdb:///data/piggy.db"
    debug: bool = True
    cors_origins: str = "http://localhost:3000,http://localhost:5173"
    
    @property
    def cors_origins_list(self) -> list[str]:
        """Convert comma-separated CORS origins to list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"

settings = Settings()