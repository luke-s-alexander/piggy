import uuid
import io
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal, InvalidOperation

from app.core.database import get_db
from app.models import Transaction as TransactionModel, Account as AccountModel, Category as CategoryModel
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
    try:
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
        total_income = sum(float(t.amount) for t in transactions if t.type == "INCOME")
        total_expense = sum(float(t.amount) for t in transactions if t.type == "EXPENSE")
        net_amount = total_income - total_expense
        
        return {
            "total_count": total_count,
            "total_income": total_income,
            "total_expense": total_expense,
            "net_amount": net_amount
        }
    except Exception as e:
        # Return default values if there's an error
        return {
            "total_count": 0,
            "total_income": 0.0,
            "total_expense": 0.0,
            "net_amount": 0.0
        }

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

@router.get("/import/template")
def download_import_template():
    """Download CSV import template"""
    template_path = "/Users/lalexander/projects/piggy/backend/app/templates/transaction_import_template.csv"
    return FileResponse(
        path=template_path,
        filename="transaction_import_template.csv",
        media_type="text/csv"
    )

@router.post("/import/preview")
async def preview_transactions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Preview transactions from CSV, XLS, or XLSX file before importing"""
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    file_extension = file.filename.lower().split('.')[-1]
    if file_extension not in ['csv', 'xls', 'xlsx']:
        raise HTTPException(
            status_code=400, 
            detail="File must be CSV, XLS, or XLSX format"
        )
    
    try:
        contents = await file.read()
        
        # Read the file into a pandas DataFrame
        if file_extension == 'csv':
            df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        # Validate required columns
        required_columns = ['transaction_date', 'description', 'amount', 'type', 'account_name', 'category_name']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Process each row for validation
        valid_count = 0
        errors = []
        preview_transactions = []
        
        for index, row in df.iterrows():
            try:
                # Validate and parse data
                transaction_date = pd.to_datetime(row['transaction_date']).date()
                description = str(row['description']).strip()
                amount = Decimal(str(row['amount']))
                transaction_type = str(row['type']).upper().strip()
                account_name = str(row['account_name']).strip()
                category_name = str(row['category_name']).strip()
                
                # Validate transaction type
                if transaction_type not in ['INCOME', 'EXPENSE']:
                    errors.append(f"Row {index + 2}: Invalid type '{transaction_type}'. Must be INCOME or EXPENSE")
                    continue
                
                # Find account by name
                account = db.query(AccountModel).filter(AccountModel.name == account_name).first()
                if not account:
                    errors.append(f"Row {index + 2}: Account '{account_name}' not found")
                    continue
                
                # Find category by name and type
                category = db.query(CategoryModel).filter(
                    CategoryModel.name == category_name,
                    CategoryModel.type == transaction_type
                ).first()
                if not category:
                    errors.append(f"Row {index + 2}: Category '{category_name}' with type '{transaction_type}' not found")
                    continue
                
                # If we get here, the transaction is valid
                valid_count += 1
                
                # Add to preview (limit to first 10)
                if len(preview_transactions) < 10:
                    preview_transactions.append({
                        "transaction_date": transaction_date.isoformat(),
                        "description": description,
                        "amount": float(amount),
                        "type": transaction_type,
                        "account_name": account_name,
                        "category_name": category_name
                    })
                
            except (ValueError, InvalidOperation, TypeError) as e:
                errors.append(f"Row {index + 2}: Data validation error - {str(e)}")
                continue
            except Exception as e:
                errors.append(f"Row {index + 2}: Unexpected error - {str(e)}")
                continue
        
        return {
            "valid_count": valid_count,
            "total_rows": len(df),
            "errors": errors,
            "preview_transactions": preview_transactions
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="File is empty")
    except pd.errors.ParserError:
        raise HTTPException(status_code=400, detail="Unable to parse file. Please check the format")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")

@router.post("/import")
async def import_transactions(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Import transactions from CSV, XLS, or XLSX file"""
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    file_extension = file.filename.lower().split('.')[-1]
    if file_extension not in ['csv', 'xls', 'xlsx']:
        raise HTTPException(
            status_code=400, 
            detail="File must be CSV, XLS, or XLSX format"
        )
    
    try:
        contents = await file.read()
        
        # Read the file into a pandas DataFrame
        if file_extension == 'csv':
            df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        else:
            df = pd.read_excel(io.BytesIO(contents))
        
        # Validate required columns
        required_columns = ['transaction_date', 'description', 'amount', 'type', 'account_name', 'category_name']
        missing_columns = [col for col in required_columns if col not in df.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Process each row
        imported_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Validate and parse data
                transaction_date = pd.to_datetime(row['transaction_date']).date()
                description = str(row['description']).strip()
                amount = Decimal(str(row['amount']))
                transaction_type = str(row['type']).upper().strip()
                account_name = str(row['account_name']).strip()
                category_name = str(row['category_name']).strip()
                
                # Validate transaction type
                if transaction_type not in ['INCOME', 'EXPENSE']:
                    errors.append(f"Row {index + 2}: Invalid type '{transaction_type}'. Must be INCOME or EXPENSE")
                    continue
                
                # Find account by name
                account = db.query(AccountModel).filter(AccountModel.name == account_name).first()
                if not account:
                    errors.append(f"Row {index + 2}: Account '{account_name}' not found")
                    continue
                
                # Find category by name and type
                category = db.query(CategoryModel).filter(
                    CategoryModel.name == category_name,
                    CategoryModel.type == transaction_type
                ).first()
                if not category:
                    errors.append(f"Row {index + 2}: Category '{category_name}' with type '{transaction_type}' not found")
                    continue
                
                # Create transaction
                db_transaction = TransactionModel(
                    id=uuid.uuid4(),
                    account_id=account.id,
                    category_id=category.id,
                    amount=amount,
                    description=description,
                    transaction_date=transaction_date,
                    type=transaction_type
                )
                
                db.add(db_transaction)
                imported_count += 1
                
            except (ValueError, InvalidOperation, TypeError) as e:
                errors.append(f"Row {index + 2}: Data validation error - {str(e)}")
                continue
            except Exception as e:
                errors.append(f"Row {index + 2}: Unexpected error - {str(e)}")
                continue
        
        # Commit if there are valid transactions
        if imported_count > 0:
            db.commit()
        else:
            db.rollback()
        
        return {
            "imported_count": imported_count,
            "total_rows": len(df),
            "errors": errors
        }
        
    except pd.errors.EmptyDataError:
        raise HTTPException(status_code=400, detail="File is empty")
    except pd.errors.ParserError:
        raise HTTPException(status_code=400, detail="Unable to parse file. Please check the format")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Import failed: {str(e)}")