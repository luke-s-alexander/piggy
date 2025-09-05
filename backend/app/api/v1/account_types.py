from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import AccountType as AccountTypeModel
from app.schemas import AccountType

router = APIRouter()

@router.get("/", response_model=List[AccountType])
def get_account_types(db: Session = Depends(get_db)):
    """Get all account types"""
    return db.query(AccountTypeModel).all()