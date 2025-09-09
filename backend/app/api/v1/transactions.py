import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from datetime import date
from decimal import Decimal

from app.core.database import get_db
from app.models import Transaction as TransactionModel
from app.schemas import Transaction, TransactionCreate, TransactionUpdate

router = APIRouter()

@router.get("/", response_model=List[Transaction])
def get_transactions(
    account_id: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    transaction_type: Optional[str] = Query(None),
    min_amount: Optional[Decimal] = Query(None),
    max_amount: Optional[Decimal] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("transaction_date"),
    sort_order: Optional[str] = Query("desc"),
    limit: Optional[int] = Query(100),
    offset: Optional[int] = Query(0),
    db: Session = Depends(get_db)
):
    """Get transactions with advanced filtering, searching, sorting and pagination"""
    query = db.query(TransactionModel)
    
    # Apply filters
    if account_id:
        query = query.filter(TransactionModel.account_id == account_id)
    if category_id:
        query = query.filter(TransactionModel.category_id == category_id)
    if start_date:
        query = query.filter(TransactionModel.transaction_date >= start_date)
    if end_date:
        query = query.filter(TransactionModel.transaction_date <= end_date)
    if transaction_type:
        query = query.filter(TransactionModel.type == transaction_type)
    if min_amount is not None:
        query = query.filter(TransactionModel.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(TransactionModel.amount <= max_amount)
    
    # Apply search
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(
            or_(
                func.lower(TransactionModel.description).like(search_term),
                # Note: We'd need to join with account/category for searching by name
                # For now, just search description
            )
        )
    
    # Apply sorting
    if sort_by and hasattr(TransactionModel, sort_by):
        sort_column = getattr(TransactionModel, sort_by)
        if sort_order.lower() == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(TransactionModel.transaction_date.desc())
    
    # Apply pagination
    query = query.offset(offset).limit(limit)
    
    return query.all()

@router.get("/{transaction_id}", response_model=Transaction)
def get_transaction(transaction_id: str, db: Session = Depends(get_db)):
    """Get a specific transaction"""
    transaction = db.query(TransactionModel).filter(TransactionModel.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@router.post("/", response_model=Transaction, status_code=201)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    """Create a new transaction"""
    transaction_data = transaction.dict()
    transaction_data["id"] = str(uuid.uuid4())
    
    db_transaction = TransactionModel(**transaction_data)
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@router.put("/{transaction_id}", response_model=Transaction)
def update_transaction(
    transaction_id: str, 
    transaction_update: TransactionUpdate, 
    db: Session = Depends(get_db)
):
    """Update a transaction"""
    transaction = db.query(TransactionModel).filter(TransactionModel.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    update_data = transaction_update.dict(exclude_unset=True)
    
    try:
        # Update all provided fields (Pydantic schema handles validation)
        for field, value in update_data.items():
            setattr(transaction, field, value)
        
        db.commit()
        db.refresh(transaction)
        return transaction
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update transaction: {str(e)}"
        )

@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: str, db: Session = Depends(get_db)):
    """Delete a transaction"""
    transaction = db.query(TransactionModel).filter(TransactionModel.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}

@router.get("/summary")
def get_transaction_summary(
    account_id: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    transaction_type: Optional[str] = Query(None),
    min_amount: Optional[Decimal] = Query(None),
    max_amount: Optional[Decimal] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get transaction summary statistics with same filters as main endpoint"""
    query = db.query(TransactionModel)
    
    # Apply same filters as main endpoint
    if account_id:
        query = query.filter(TransactionModel.account_id == account_id)
    if category_id:
        query = query.filter(TransactionModel.category_id == category_id)
    if start_date:
        query = query.filter(TransactionModel.transaction_date >= start_date)
    if end_date:
        query = query.filter(TransactionModel.transaction_date <= end_date)
    if transaction_type:
        query = query.filter(TransactionModel.type == transaction_type)
    if min_amount is not None:
        query = query.filter(TransactionModel.amount >= min_amount)
    if max_amount is not None:
        query = query.filter(TransactionModel.amount <= max_amount)
    
    if search:
        search_term = f"%{search.lower()}%"
        query = query.filter(func.lower(TransactionModel.description).like(search_term))
    
    transactions = query.all()
    
    total_count = len(transactions)
    total_income = sum(t.amount for t in transactions if t.type == "INCOME")
    total_expense = sum(t.amount for t in transactions if t.type == "EXPENSE")
    net_amount = total_income - total_expense
    
    return {
        "total_count": total_count,
        "total_income": float(total_income),
        "total_expense": float(total_expense),
        "net_amount": float(net_amount)
    }