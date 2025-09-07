from sqlalchemy import Column, String, Numeric, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid

class Account(Base):
    __tablename__ = "accounts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)  # "Chase Checking", "Wealthsimple RRSP"
    account_type_id = Column(UUID(as_uuid=True), ForeignKey("account_types.id"), nullable=False)
    balance = Column(Numeric(12, 2), nullable=False, default=0)  # Current balance
    institution = Column(String, nullable=True)  # "Chase Bank", "Wealthsimple"
    account_number = Column(String, nullable=True)  # Last 4 digits
    currency = Column(String, nullable=False, default="CAD")  # Account currency
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now())
    
    # PostgreSQL-optimized indexes
    __table_args__ = (
        Index('idx_account_type', 'account_type_id'),
        Index('idx_account_active', 'is_active'),
        Index('idx_account_name', 'name'),
    )
    
    # Relationships
    account_type = relationship("AccountType", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account")
    balance_history = relationship("BalanceHistory", back_populates="account")