from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AccountTypeBase(BaseModel):
    name: str
    category: str  # "ASSET" or "LIABILITY"
    sub_category: str  # "cash", "investment", "debt", "real_estate"

class AccountTypeCreate(AccountTypeBase):
    pass

class AccountTypeUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None

class AccountType(AccountTypeBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True