import uuid
from sqlalchemy.orm import Session
from app.core.database import engine, get_db_context, create_tables
from app.models import AccountType, Category

def create_default_account_types(db: Session):
    """Create default account types"""
    default_account_types = [
        AccountType(
            id=uuid.uuid4(),
            name="Checking",
            category="ASSET",
            sub_category="cash"
        ),
        AccountType(
            id=uuid.uuid4(),
            name="Savings",
            category="ASSET",
            sub_category="cash"
        ),
        AccountType(
            id=uuid.uuid4(),
            name="Credit Card",
            category="LIABILITY",
            sub_category="debt"
        ),
        AccountType(
            id=uuid.uuid4(),
            name="Investment",
            category="ASSET",
            sub_category="investment"
        ),
    ]
    
    for account_type in default_account_types:
        existing = db.query(AccountType).filter(AccountType.name == account_type.name).first()
        if not existing:
            db.add(account_type)
    
    db.commit()
    print(f"Created {len(default_account_types)} account types")

def create_default_categories(db: Session):
    """Create default transaction categories"""
    default_categories = [
        # Expense categories
        Category(id=uuid.uuid4(), name="Groceries", type="EXPENSE", color="#4F46E5"),
        Category(id=uuid.uuid4(), name="Eating Out", type="EXPENSE", color="#F59E0B"),
        Category(id=uuid.uuid4(), name="Transportation", type="EXPENSE", color="#10B981"),
        Category(id=uuid.uuid4(), name="Entertainment", type="EXPENSE", color="#EF4444"),
        Category(id=uuid.uuid4(), name="Utilities", type="EXPENSE", color="#8B5CF6"),
        Category(id=uuid.uuid4(), name="Shopping", type="EXPENSE", color="#F97316"),
        Category(id=uuid.uuid4(), name="Healthcare", type="EXPENSE", color="#06B6D4"),
        # Income categories
        Category(id=uuid.uuid4(), name="Salary", type="INCOME", color="#22C55E"),
        Category(id=uuid.uuid4(), name="Freelance", type="INCOME", color="#84CC16"),
        Category(id=uuid.uuid4(), name="Investment Returns", type="INCOME", color="#06B6D4"),
    ]
    
    for category in default_categories:
        existing = db.query(Category).filter(Category.name == category.name).first()
        if not existing:
            db.add(category)
    
    db.commit()
    print(f"Created {len(default_categories)} categories")

def init_database():
    """Initialize database with tables and seed data"""
    print("Creating database tables...")
    create_tables()
    
    print("Adding seed data...")
    with get_db_context() as db:
        create_default_account_types(db)
        create_default_categories(db)
    
    print("Database initialization complete!")

if __name__ == "__main__":
    init_database()