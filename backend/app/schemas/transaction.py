from pydantic import BaseModel, Field
from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from uuid import UUID
from .account import Account
from .category import Category

class TransactionBase(BaseModel):
    account_id: UUID
    category_id: UUID
    amount: Decimal = Field(decimal_places=2)
    description: str
    transaction_date: date
    type: str  # "INCOME" or "EXPENSE"

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    account_id: Optional[UUID] = None
    category_id: Optional[UUID] = None
    amount: Optional[Decimal] = None
    description: Optional[str] = None
    transaction_date: Optional[date] = None
    type: Optional[str] = None

class Transaction(TransactionBase):
    id: UUID
    ai_category_id: Optional[UUID] = None
    ai_confidence: Optional[float] = None
    is_ai_categorized: bool = False
    user_corrected: bool = False
    created_at: datetime
    updated_at: datetime
    account: Optional[Account] = None
    category: Optional[Category] = None
    
    class Config:
        from_attributes = True