from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class AccountType(Base):
    __tablename__ = "account_types"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)  # "Checking", "Credit Card", "Investment"
    category = Column(String, nullable=False)  # "ASSET" or "LIABILITY"
    sub_category = Column(String, nullable=False)  # "cash", "investment", "debt", "real_estate"
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    accounts = relationship("Account", back_populates="account_type")