from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional

class BalanceHistoryBase(BaseModel):
    account_id: str
    previous_balance: Decimal = Field(decimal_places=2)
    new_balance: Decimal = Field(decimal_places=2)
    change_amount: Decimal = Field(decimal_places=2)
    change_reason: Optional[str] = None
    notes: Optional[str] = None

class BalanceHistoryCreate(BalanceHistoryBase):
    pass

class BalanceHistory(BalanceHistoryBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True