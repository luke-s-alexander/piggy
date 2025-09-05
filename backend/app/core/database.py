from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from contextlib import contextmanager
from typing import Generator
import os
from .config import settings

# Ensure data directory exists
os.makedirs("data", exist_ok=True)

# Create DuckDB engine
engine = create_engine(
    settings.database_url,
    echo=settings.debug
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def get_db_context() -> Generator[Session, None, None]:
    """Context manager for database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """Create all tables in the database"""
    Base.metadata.create_all(bind=engine)