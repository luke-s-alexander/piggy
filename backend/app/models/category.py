from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)  # "Groceries", "Salary", "Utilities"
    type = Column(String, nullable=False)  # "INCOME" or "EXPENSE"
    color = Column(String, nullable=True)  # For UI visualization
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())