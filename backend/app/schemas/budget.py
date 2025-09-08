from pydantic import BaseModel, validator
from typing import List, Optional
from decimal import Decimal
from datetime import datetime
import uuid
from app.schemas.category import Category


class BudgetLineItemBase(BaseModel):
    category_id: uuid.UUID
    yearly_amount: Decimal
    
    @validator('yearly_amount')
    def yearly_amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Yearly amount must be positive')
        return v


class BudgetLineItemCreate(BudgetLineItemBase):
    pass


class BudgetLineItemUpdate(BaseModel):
    category_id: Optional[uuid.UUID] = None
    yearly_amount: Optional[Decimal] = None
    
    @validator('yearly_amount')
    def yearly_amount_must_be_positive(cls, v):
        if v is not None and v <= 0:
            raise ValueError('Yearly amount must be positive')
        return v


class BudgetLineItem(BudgetLineItemBase):
    id: uuid.UUID
    budget_id: uuid.UUID
    monthly_amount: Decimal
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BudgetLineItemWithCategory(BudgetLineItem):
    category: Category  # Category information


class BudgetBase(BaseModel):
    year: int
    name: str
    
    @validator('year')
    def year_must_be_reasonable(cls, v):
        current_year = datetime.now().year
        if v < current_year - 10 or v > current_year + 10:
            raise ValueError(f'Year must be between {current_year - 10} and {current_year + 10}')
        return v


class BudgetCreate(BudgetBase):
    line_items: List[BudgetLineItemCreate] = []


class BudgetUpdate(BaseModel):
    year: Optional[int] = None
    name: Optional[str] = None
    is_active: Optional[bool] = None
    
    @validator('year')
    def year_must_be_reasonable(cls, v):
        if v is not None:
            current_year = datetime.now().year
            if v < current_year - 10 or v > current_year + 10:
                raise ValueError(f'Year must be between {current_year - 10} and {current_year + 10}')
        return v


class Budget(BudgetBase):
    id: uuid.UUID
    total_amount: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class BudgetWithLineItems(Budget):
    line_items: List[BudgetLineItemWithCategory] = []


class BudgetSummary(BaseModel):
    budget: Budget
    total_spent: Decimal
    remaining: Decimal
    progress_percentage: float
    categories_summary: List[dict]


class MonthlyBudgetProgress(BaseModel):
    month: int
    year: int
    budgeted_amount: Decimal
    spent_amount: Decimal
    remaining_amount: Decimal
    progress_percentage: float
    categories: List[dict]