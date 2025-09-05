import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import Category as CategoryModel
from app.schemas import Category, CategoryCreate, CategoryUpdate

router = APIRouter()

@router.get("/", response_model=List[Category])
def get_categories(db: Session = Depends(get_db)):
    """Get all categories"""
    return db.query(CategoryModel).all()

@router.get("/{category_id}", response_model=Category)
def get_category(category_id: str, db: Session = Depends(get_db)):
    """Get a specific category"""
    category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.post("/", response_model=Category, status_code=201)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category"""
    category_data = category.dict()
    category_data["id"] = str(uuid.uuid4())
    
    db_category = CategoryModel(**category_data)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.put("/{category_id}", response_model=Category)
def update_category(
    category_id: str, 
    category_update: CategoryUpdate, 
    db: Session = Depends(get_db)
):
    """Update a category"""
    category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    update_data = category_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}")
def delete_category(category_id: str, db: Session = Depends(get_db)):
    """Delete a category"""
    category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(category)
    db.commit()
    return {"message": "Category deleted successfully"}