import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import Account as AccountModel
from app.schemas import Account, AccountCreate, AccountUpdate

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
    for field, value in update_data.items():
        setattr(account, field, value)
    
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