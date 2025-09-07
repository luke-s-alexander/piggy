from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

class BalanceHistoryBase(BaseModel):
    account_id: UUID
    previous_balance: Decimal = Field(decimal_places=2)
    new_balance: Decimal = Field(decimal_places=2)
    change_amount: Decimal = Field(decimal_places=2)
    change_reason: Optional[str] = None
    notes: Optional[str] = None

class BalanceHistoryCreate(BalanceHistoryBase):
    pass

class BalanceHistory(BalanceHistoryBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True