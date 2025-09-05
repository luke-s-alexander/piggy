from pydantic import BaseModel, Field
from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from .account import Account
from .category import Category

class TransactionBase(BaseModel):
    account_id: str
    category_id: str
    amount: Decimal = Field(decimal_places=2)
    description: str
    date: date
    type: str  # "INCOME" or "EXPENSE"

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    account_id: Optional[str] = None
    category_id: Optional[str] = None
    amount: Optional[Decimal] = None
    description: Optional[str] = None
    date: Optional[date] = None
    type: Optional[str] = None

class Transaction(TransactionBase):
    id: str
    ai_category_id: Optional[str] = None
    ai_confidence: Optional[float] = None
    is_ai_categorized: bool = False
    user_corrected: bool = False
    created_at: datetime
    updated_at: datetime
    account: Optional[Account] = None
    category: Optional[Category] = None
    
    class Config:
        from_attributes = True