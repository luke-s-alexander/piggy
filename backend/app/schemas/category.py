from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CategoryBase(BaseModel):
    name: str
    type: str  # "INCOME" or "EXPENSE"
    color: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    color: Optional[str] = None

class Category(CategoryBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True