from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
import uuid

from app.core.database import get_db
from app.services.budget_service import BudgetService
from app.schemas.budget import (
    Budget, BudgetCreate, BudgetUpdate, BudgetWithLineItems,
    BudgetLineItem, BudgetLineItemCreate, BudgetLineItemUpdate,
    BudgetSummary, MonthlyBudgetProgress
)
from app.models.budget import Budget as BudgetModel, BudgetLineItem as BudgetLineItemModel


router = APIRouter()


@router.post("/", response_model=Budget, status_code=status.HTTP_201_CREATED)
def create_budget(budget: BudgetCreate, db: Session = Depends(get_db)):
    """Create a new budget"""
    service = BudgetService(db)
    
    # Check if budget for this year already exists
    existing = service.get_budget_by_year(budget.year)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Budget for year {budget.year} already exists"
        )
    
    return service.create_budget(budget)


@router.get("/", response_model=List[Budget])
def get_budgets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all budgets"""
    service = BudgetService(db)
    return service.get_all_budgets(skip, limit)


@router.get("/dashboard")
def get_dashboard_data(month: int = None, db: Session = Depends(get_db)):
    """Get dashboard data for active budget with YTD calculations"""
    from datetime import datetime
    
    # Use current month if not specified
    if month is None:
        month = datetime.now().month
    
    # Validate month
    if month < 1 or month > 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Month must be between 1 and 12"
        )
    
    service = BudgetService(db)
    dashboard_data = service.get_dashboard_data(month)
    
    if not dashboard_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active budget found"
        )
    
    return dashboard_data


@router.get("/active", response_model=Budget)
def get_active_budget(db: Session = Depends(get_db)):
    """Get the currently active budget"""
    service = BudgetService(db)
    
    active_budget = service.get_active_budget()
    if not active_budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active budget found"
        )
    
    return active_budget


@router.get("/{budget_id}", response_model=BudgetWithLineItems)
def get_budget(budget_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get budget by ID with line items"""
    budget = db.query(BudgetModel).options(
        joinedload(BudgetModel.line_items).joinedload(BudgetLineItemModel.category)
    ).filter(BudgetModel.id == budget_id).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    return budget


@router.get("/year/{year}", response_model=BudgetWithLineItems)
def get_budget_by_year(year: int, db: Session = Depends(get_db)):
    """Get budget by year with line items"""
    budget = db.query(BudgetModel).options(
        joinedload(BudgetModel.line_items).joinedload(BudgetLineItemModel.category)
    ).filter(BudgetModel.year == year).first()
    
    if not budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Budget for year {year} not found"
        )
    
    return budget


@router.put("/{budget_id}", response_model=Budget)
def update_budget(budget_id: uuid.UUID, budget_update: BudgetUpdate, db: Session = Depends(get_db)):
    """Update budget"""
    service = BudgetService(db)
    
    # Check if year change conflicts with existing budget
    if budget_update.year is not None:
        existing = service.get_budget_by_year(budget_update.year)
        if existing and existing.id != budget_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Budget for year {budget_update.year} already exists"
            )
    
    updated_budget = service.update_budget(budget_id, budget_update)
    if not updated_budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    return updated_budget


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(budget_id: uuid.UUID, db: Session = Depends(get_db)):
    """Delete budget"""
    service = BudgetService(db)
    
    if not service.delete_budget(budget_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )


@router.post("/{budget_id}/line-items", response_model=BudgetLineItem, status_code=status.HTTP_201_CREATED)
def add_budget_line_item(budget_id: uuid.UUID, item: BudgetLineItemCreate, db: Session = Depends(get_db)):
    """Add line item to budget"""
    service = BudgetService(db)
    
    line_item = service.add_budget_line_item(budget_id, item)
    if not line_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found or category already has a budget line item"
        )
    
    return line_item


@router.put("/line-items/{line_item_id}", response_model=BudgetLineItem)
def update_budget_line_item(line_item_id: uuid.UUID, item_update: BudgetLineItemUpdate, db: Session = Depends(get_db)):
    """Update budget line item"""
    service = BudgetService(db)
    
    updated_item = service.update_budget_line_item(line_item_id, item_update)
    if not updated_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget line item not found"
        )
    
    return updated_item


@router.delete("/line-items/{line_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget_line_item(line_item_id: uuid.UUID, db: Session = Depends(get_db)):
    """Delete budget line item"""
    service = BudgetService(db)
    
    if not service.delete_budget_line_item(line_item_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget line item not found"
        )


@router.get("/{budget_id}/summary", response_model=BudgetSummary)
def get_budget_summary(budget_id: uuid.UUID, db: Session = Depends(get_db)):
    """Get budget summary with actual vs budgeted spending"""
    service = BudgetService(db)
    
    summary = service.get_budget_summary(budget_id)
    if not summary:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    return summary


@router.get("/{budget_id}/monthly/{month}", response_model=MonthlyBudgetProgress)
def get_monthly_budget_progress(budget_id: uuid.UUID, month: int, db: Session = Depends(get_db)):
    """Get monthly budget progress"""
    if month < 1 or month > 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Month must be between 1 and 12"
        )
    
    service = BudgetService(db)
    
    progress = service.get_monthly_budget_progress(budget_id, month)
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    return progress


@router.put("/{budget_id}/set-active", response_model=Budget)
def set_active_budget(budget_id: uuid.UUID, db: Session = Depends(get_db)):
    """Set a budget as active"""
    service = BudgetService(db)
    
    active_budget = service.set_active_budget(budget_id)
    if not active_budget:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget not found"
        )
    
    return active_budget