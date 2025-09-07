from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
import uuid

class BalanceHistory(Base):
    __tablename__ = "balance_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    account_id = Column(UUID(as_uuid=True), ForeignKey("accounts.id"), nullable=False)
    previous_balance = Column(Numeric(12, 2), nullable=False)  # Balance before change
    new_balance = Column(Numeric(12, 2), nullable=False)       # Balance after change
    change_amount = Column(Numeric(12, 2), nullable=False)     # Amount of change (+/-)
    change_reason = Column(String, nullable=True)              # "manual_update", "transaction", "correction"
    notes = Column(Text, nullable=True)                        # Additional context
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    account = relationship("Account", back_populates="balance_history")