from sqlalchemy import Column, String, Numeric, DateTime, Date, Boolean, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True)
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    description = Column(String, nullable=False)
    transaction_date = Column(Date, nullable=False)
    type = Column(String, nullable=False)  # "INCOME" or "EXPENSE"
    
    # AI categorization fields (for Phase 5)
    ai_category_id = Column(String, ForeignKey("categories.id"), nullable=True)
    ai_confidence = Column(Float, nullable=True)  # Confidence score 0.0-1.0
    is_ai_categorized = Column(Boolean, nullable=False, default=False)
    user_corrected = Column(Boolean, nullable=False, default=False)  # For ML training
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    account = relationship("Account", back_populates="transactions")
    category = relationship("Category", foreign_keys=[category_id])
    ai_category = relationship("Category", foreign_keys=[ai_category_id])