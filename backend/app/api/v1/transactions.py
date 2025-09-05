import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

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
    db: Session = Depends(get_db)
):
    """Get transactions with optional filters"""
    query = db.query(TransactionModel)
    
    if account_id:
        query = query.filter(TransactionModel.account_id == account_id)
    if category_id:
        query = query.filter(TransactionModel.category_id == category_id)
    if start_date:
        query = query.filter(TransactionModel.date >= start_date)
    if end_date:
        query = query.filter(TransactionModel.date <= end_date)
    if transaction_type:
        query = query.filter(TransactionModel.type == transaction_type)
    
    return query.order_by(TransactionModel.date.desc()).all()

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
    for field, value in update_data.items():
        setattr(transaction, field, value)
    
    db.commit()
    db.refresh(transaction)
    return transaction

@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: str, db: Session = Depends(get_db)):
    """Delete a transaction"""
    transaction = db.query(TransactionModel).filter(TransactionModel.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}