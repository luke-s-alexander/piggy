from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid

class AccountType(Base):
    __tablename__ = "account_types"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True, nullable=False)  # "Checking", "Credit Card", "Investment"
    category = Column(String, nullable=False)  # "ASSET" or "LIABILITY"
    sub_category = Column(String, nullable=False)  # "cash", "investment", "debt", "real_estate"
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    accounts = relationship("Account", back_populates="account_type")