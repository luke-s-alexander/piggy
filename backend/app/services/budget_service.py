from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from decimal import Decimal
from datetime import datetime
import uuid

from app.models.budget import Budget, BudgetLineItem
from app.models.category import Category
from app.models.transaction import Transaction
from app.schemas.budget import (
    BudgetCreate, BudgetUpdate, BudgetLineItemCreate, BudgetLineItemUpdate,
    BudgetSummary, MonthlyBudgetProgress
)


class BudgetService:
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_budget(self, budget_data: BudgetCreate) -> Budget:
        """Create a new budget with line items"""
        # Calculate total amount from line items
        total_amount = sum(item.yearly_amount for item in budget_data.line_items)
        
        # Create budget
        db_budget = Budget(
            id=uuid.uuid4(),
            year=budget_data.year,
            name=budget_data.name,
            total_amount=total_amount,
            is_active=True
        )
        
        self.db.add(db_budget)
        self.db.flush()  # Get the ID
        
        # Create line items
        for item_data in budget_data.line_items:
            monthly_amount = item_data.yearly_amount / 12
            
            line_item = BudgetLineItem(
                id=uuid.uuid4(),
                budget_id=db_budget.id,
                category_id=item_data.category_id,
                yearly_amount=item_data.yearly_amount,
                monthly_amount=monthly_amount
            )
            self.db.add(line_item)
        
        self.db.commit()
        self.db.refresh(db_budget)
        return db_budget
    
    def get_budget_by_id(self, budget_id: uuid.UUID) -> Optional[Budget]:
        """Get budget by ID"""
        return self.db.query(Budget).filter(Budget.id == budget_id).first()
    
    def get_budget_by_year(self, year: int) -> Optional[Budget]:
        """Get budget by year"""
        return self.db.query(Budget).filter(Budget.year == year).first()
    
    def get_all_budgets(self, skip: int = 0, limit: int = 100) -> List[Budget]:
        """Get all budgets with pagination"""
        return self.db.query(Budget).offset(skip).limit(limit).all()
    
    def update_budget(self, budget_id: uuid.UUID, budget_data: BudgetUpdate) -> Optional[Budget]:
        """Update budget basic information"""
        db_budget = self.get_budget_by_id(budget_id)
        if not db_budget:
            return None
        
        update_data = budget_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_budget, field, value)
        
        self.db.commit()
        self.db.refresh(db_budget)
        return db_budget
    
    def delete_budget(self, budget_id: uuid.UUID) -> bool:
        """Delete budget and all line items"""
        db_budget = self.get_budget_by_id(budget_id)
        if not db_budget:
            return False
        
        self.db.delete(db_budget)
        self.db.commit()
        return True
    
    def add_budget_line_item(self, budget_id: uuid.UUID, item_data: BudgetLineItemCreate) -> Optional[BudgetLineItem]:
        """Add a line item to existing budget"""
        db_budget = self.get_budget_by_id(budget_id)
        if not db_budget:
            return None
        
        # Check if category already exists in budget
        existing = self.db.query(BudgetLineItem).filter(
            BudgetLineItem.budget_id == budget_id,
            BudgetLineItem.category_id == item_data.category_id
        ).first()
        
        if existing:
            return None  # Category already has a budget line item
        
        monthly_amount = item_data.yearly_amount / 12
        
        line_item = BudgetLineItem(
            id=uuid.uuid4(),
            budget_id=budget_id,
            category_id=item_data.category_id,
            yearly_amount=item_data.yearly_amount,
            monthly_amount=monthly_amount
        )
        
        self.db.add(line_item)
        
        # Update budget total
        db_budget.total_amount += item_data.yearly_amount
        
        self.db.commit()
        self.db.refresh(line_item)
        return line_item
    
    def update_budget_line_item(self, line_item_id: uuid.UUID, item_data: BudgetLineItemUpdate) -> Optional[BudgetLineItem]:
        """Update budget line item"""
        line_item = self.db.query(BudgetLineItem).filter(BudgetLineItem.id == line_item_id).first()
        if not line_item:
            return None
        
        old_amount = line_item.yearly_amount
        
        update_data = item_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(line_item, field, value)
        
        # Recalculate monthly amount if yearly amount changed
        if 'yearly_amount' in update_data:
            line_item.monthly_amount = line_item.yearly_amount / 12
            
            # Update budget total
            budget = self.get_budget_by_id(line_item.budget_id)
            if budget:
                budget.total_amount = budget.total_amount - old_amount + line_item.yearly_amount
        
        self.db.commit()
        self.db.refresh(line_item)
        return line_item
    
    def delete_budget_line_item(self, line_item_id: uuid.UUID) -> bool:
        """Delete budget line item"""
        line_item = self.db.query(BudgetLineItem).filter(BudgetLineItem.id == line_item_id).first()
        if not line_item:
            return False
        
        # Update budget total
        budget = self.get_budget_by_id(line_item.budget_id)
        if budget:
            budget.total_amount -= line_item.yearly_amount
        
        self.db.delete(line_item)
        self.db.commit()
        return True
    
    def get_budget_summary(self, budget_id: uuid.UUID) -> Optional[BudgetSummary]:
        """Get budget summary with actual spending"""
        budget = self.get_budget_by_id(budget_id)
        if not budget:
            return None
        
        # Get total spent for the budget year
        total_spent = self.db.query(func.sum(Transaction.amount)).filter(
            Transaction.type == "EXPENSE",
            extract('year', Transaction.transaction_date) == budget.year
        ).scalar() or Decimal('0')
        
        remaining = budget.total_amount - total_spent
        progress_percentage = float((total_spent / budget.total_amount) * 100) if budget.total_amount > 0 else 0
        
        # Get category-wise spending
        category_spending = self.db.query(
            Category.id,
            Category.name,
            func.sum(Transaction.amount).label('spent')
        ).join(Transaction, Category.id == Transaction.category_id).filter(
            Transaction.type == "EXPENSE",
            extract('year', Transaction.transaction_date) == budget.year
        ).group_by(Category.id, Category.name).all()
        
        categories_summary = []
        for line_item in budget.line_items:
            spent = Decimal('0')
            for cat_spend in category_spending:
                if cat_spend[0] == line_item.category_id:
                    spent = cat_spend[2] or Decimal('0')
                    break
            
            categories_summary.append({
                'category_id': str(line_item.category_id),
                'category_name': line_item.category.name if line_item.category else 'Unknown',
                'budgeted': float(line_item.yearly_amount),
                'spent': float(spent),
                'remaining': float(line_item.yearly_amount - spent),
                'progress_percentage': float((spent / line_item.yearly_amount) * 100) if line_item.yearly_amount > 0 else 0
            })
        
        return BudgetSummary(
            budget=budget,
            total_spent=total_spent,
            remaining=remaining,
            progress_percentage=progress_percentage,
            categories_summary=categories_summary
        )
    
    def get_monthly_budget_progress(self, budget_id: uuid.UUID, month: int) -> Optional[MonthlyBudgetProgress]:
        """Get budget progress for specific month"""
        budget = self.get_budget_by_id(budget_id)
        if not budget:
            return None
        
        # Calculate monthly budgeted amount
        monthly_budgeted = budget.total_amount / 12
        
        # Get actual spending for the month
        monthly_spent = self.db.query(func.sum(Transaction.amount)).filter(
            Transaction.type == "EXPENSE",
            extract('year', Transaction.transaction_date) == budget.year,
            extract('month', Transaction.transaction_date) == month
        ).scalar() or Decimal('0')
        
        remaining = monthly_budgeted - monthly_spent
        progress_percentage = float((monthly_spent / monthly_budgeted) * 100) if monthly_budgeted > 0 else 0
        
        # Get category-wise monthly spending
        category_spending = self.db.query(
            Category.id,
            Category.name,
            func.sum(Transaction.amount).label('spent')
        ).join(Transaction, Category.id == Transaction.category_id).filter(
            Transaction.type == "EXPENSE",
            extract('year', Transaction.transaction_date) == budget.year,
            extract('month', Transaction.transaction_date) == month
        ).group_by(Category.id, Category.name).all()
        
        categories = []
        for line_item in budget.line_items:
            spent = Decimal('0')
            for cat_spend in category_spending:
                if cat_spend[0] == line_item.category_id:
                    spent = cat_spend[2] or Decimal('0')
                    break
            
            categories.append({
                'category_id': str(line_item.category_id),
                'category_name': line_item.category.name if line_item.category else 'Unknown',
                'monthly_budget': float(line_item.monthly_amount),
                'spent': float(spent),
                'remaining': float(line_item.monthly_amount - spent),
                'progress_percentage': float((spent / line_item.monthly_amount) * 100) if line_item.monthly_amount > 0 else 0
            })
        
        return MonthlyBudgetProgress(
            month=month,
            year=budget.year,
            budgeted_amount=monthly_budgeted,
            spent_amount=monthly_spent,
            remaining_amount=remaining,
            progress_percentage=progress_percentage,
            categories=categories
        )