from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional
from .account_type import AccountType

class AccountBase(BaseModel):
    name: str
    account_type_id: str
    balance: Decimal = Field(default=Decimal('0.00'), decimal_places=2)
    institution: Optional[str] = None
    account_number: Optional[str] = None
    currency: str = "CAD"
    is_active: bool = True

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    account_type_id: Optional[str] = None
    balance: Optional[Decimal] = None
    institution: Optional[str] = None
    account_number: Optional[str] = None
    currency: Optional[str] = None
    is_active: Optional[bool] = None

class Account(AccountBase):
    id: str
    created_at: datetime
    updated_at: datetime
    account_type: Optional[AccountType] = None
    
    class Config:
        from_attributes = True