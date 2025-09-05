import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import Account as AccountModel, BalanceHistory as BalanceHistoryModel
from app.schemas import Account, AccountCreate, AccountUpdate, BalanceHistory, BalanceHistoryCreate

router = APIRouter()

@router.get("/", response_model=List[Account])
def get_accounts(db: Session = Depends(get_db)):
    """Get all accounts"""
    return db.query(AccountModel).all()

@router.get("/{account_id}", response_model=Account)
def get_account(account_id: str, db: Session = Depends(get_db)):
    """Get a specific account"""
    account = db.query(AccountModel).filter(AccountModel.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.post("/", response_model=Account, status_code=201)
def create_account(account: AccountCreate, db: Session = Depends(get_db)):
    """Create a new account"""
    account_data = account.dict()
    account_data["id"] = str(uuid.uuid4())
    
    db_account = AccountModel(**account_data)
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@router.put("/{account_id}", response_model=Account)
def update_account(
    account_id: str, 
    account_update: AccountUpdate, 
    db: Session = Depends(get_db)
):
    """Update an account"""
    account = db.query(AccountModel).filter(AccountModel.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    update_data = account_update.dict(exclude_unset=True)
    
    # Track balance changes for history
    old_balance = account.balance
    
    for field, value in update_data.items():
        setattr(account, field, value)
    
    # Create balance history record if balance changed
    if 'balance' in update_data and account.balance != old_balance:
        change_amount = account.balance - old_balance
        balance_history = BalanceHistoryModel(
            id=str(uuid.uuid4()),
            account_id=account_id,
            previous_balance=old_balance,
            new_balance=account.balance,
            change_amount=change_amount,
            change_reason="manual_update",
            notes="Balance updated via API"
        )
        db.add(balance_history)
    
    db.commit()
    db.refresh(account)
    return account

@router.delete("/{account_id}")
def delete_account(account_id: str, db: Session = Depends(get_db)):
    """Delete an account"""
    account = db.query(AccountModel).filter(AccountModel.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    db.delete(account)
    db.commit()
    return {"message": "Account deleted successfully"}

@router.get("/{account_id}/balance-history", response_model=List[BalanceHistory])
def get_account_balance_history(account_id: str, db: Session = Depends(get_db)):
    """Get balance history for a specific account"""
    account = db.query(AccountModel).filter(AccountModel.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    balance_history = db.query(BalanceHistoryModel).filter(
        BalanceHistoryModel.account_id == account_id
    ).order_by(BalanceHistoryModel.created_at.desc()).all()
    
    return balance_history