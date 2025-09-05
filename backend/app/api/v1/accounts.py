import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from typing import List
from decimal import Decimal, InvalidOperation

from app.core.database import get_db
from app.models import Account as AccountModel
from app.schemas import Account, AccountCreate, AccountUpdate

router = APIRouter()

def validate_account_data(data: AccountCreate | AccountUpdate) -> List[str]:
    """Validate account data and return list of error messages"""
    errors = []
    
    # Name validation
    if hasattr(data, 'name') and data.name is not None:
        if not data.name.strip():
            errors.append("Account name is required")
        elif len(data.name.strip()) < 2:
            errors.append("Account name must be at least 2 characters")
        elif len(data.name.strip()) > 100:
            errors.append("Account name must be less than 100 characters")
    
    # Balance validation
    if hasattr(data, 'balance') and data.balance is not None:
        try:
            balance = Decimal(str(data.balance))
            if balance < Decimal('-999999999.99') or balance > Decimal('999999999.99'):
                errors.append("Balance must be between -999,999,999.99 and 999,999,999.99")
        except (InvalidOperation, ValueError):
            errors.append("Balance must be a valid number")
    
    # Institution validation
    if hasattr(data, 'institution') and data.institution is not None:
        if len(data.institution.strip()) > 100:
            errors.append("Institution name must be less than 100 characters")
    
    # Account number validation
    if hasattr(data, 'account_number') and data.account_number is not None:
        if data.account_number.strip() and not data.account_number.strip().isdigit():
            errors.append("Account number must contain only digits")
        elif len(data.account_number.strip()) > 4:
            errors.append("Account number must be 4 digits or less")
    
    return errors

@router.get("/", response_model=List[Account])
def get_accounts(db: Session = Depends(get_db), include_inactive: bool = False):
    """Get all accounts (active by default)"""
    query = db.query(AccountModel)
    if not include_inactive:
        query = query.filter(AccountModel.is_active == True)
    return query.all()

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
    # Validate input data
    validation_errors = validate_account_data(account)
    if validation_errors:
        raise HTTPException(
            status_code=422, 
            detail={
                "message": "Validation failed",
                "errors": validation_errors
            }
        )
    
    # Check if account type exists
    if account.account_type_id:
        from app.models import AccountType as AccountTypeModel
        account_type = db.query(AccountTypeModel).filter(
            AccountTypeModel.id == account.account_type_id
        ).first()
        if not account_type:
            raise HTTPException(
                status_code=400,
                detail="Invalid account type ID"
            )
    
    try:
        account_data = account.dict()
        account_data["id"] = str(uuid.uuid4())
        
        db_account = AccountModel(**account_data)
        db.add(db_account)
        db.commit()
        db.refresh(db_account)
        return db_account
    
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Account creation failed due to data integrity constraints"
        )
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while creating account"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while creating the account"
        )

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
    
    # Validate input data
    validation_errors = validate_account_data(account_update)
    if validation_errors:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Validation failed",
                "errors": validation_errors
            }
        )
    
    # Check if account type exists (if being updated)
    if hasattr(account_update, 'account_type_id') and account_update.account_type_id:
        from app.models import AccountType as AccountTypeModel
        account_type = db.query(AccountTypeModel).filter(
            AccountTypeModel.id == account_update.account_type_id
        ).first()
        if not account_type:
            raise HTTPException(
                status_code=400,
                detail="Invalid account type ID"
            )
    
    try:
        update_data = account_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(account, field, value)
        
        db.commit()
        db.refresh(account)
        return account
        
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Account update failed due to data integrity constraints"
        )
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while updating account"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while updating the account"
        )

@router.delete("/{account_id}")
def delete_account(account_id: str, db: Session = Depends(get_db)):
    """Deactivate an account (soft delete)"""
    account = db.query(AccountModel).filter(AccountModel.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if not account.is_active:
        raise HTTPException(status_code=400, detail="Account is already deactivated")
    
    try:
        account.is_active = False
        db.commit()
        return {"message": "Account deactivated successfully"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while deactivating account"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while deactivating the account"
        )

@router.post("/{account_id}/reactivate")
def reactivate_account(account_id: str, db: Session = Depends(get_db)):
    """Reactivate a deactivated account"""
    account = db.query(AccountModel).filter(AccountModel.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if account.is_active:
        raise HTTPException(status_code=400, detail="Account is already active")
    
    try:
        account.is_active = True
        db.commit()
        return {"message": "Account reactivated successfully"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while reactivating account"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while reactivating the account"
        )