from sqlalchemy import Column, String, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)  # "Chase Checking", "Wealthsimple RRSP"
    account_type_id = Column(String, ForeignKey("account_types.id"), nullable=False)
    balance = Column(Numeric(12, 2), nullable=False, default=0)  # Current balance
    institution = Column(String, nullable=True)  # "Chase Bank", "Wealthsimple"
    account_number = Column(String, nullable=True)  # Last 4 digits
    currency = Column(String, nullable=False, default="CAD")  # Account currency
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    account_type = relationship("AccountType", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account")