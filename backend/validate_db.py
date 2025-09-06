#!/usr/bin/env python3
"""
Database validation script for Piggy Phase 2
Run this to verify database structure and seed data
"""

import duckdb
from app.core.database import get_db_context
from app.models import AccountType, Category, Account, Transaction
from sqlalchemy import text

def validate_database():
    print("🔍 Validating Piggy Database...\n")
    
    # Test 1: Database connection
    print("1. Testing database connection...")
    try:
        with get_db_context() as db:
            result = db.execute(text("SELECT 1 as test")).fetchone()
            print(f"   ✅ Database connection successful: {result[0]}")
    except Exception as e:
        print(f"   ❌ Database connection failed: {e}")
        return
    
    # Test 2: Check tables exist
    print("\n2. Checking table structure...")
    with get_db_context() as db:
        tables = ['account_types', 'categories', 'accounts', 'transactions']
        for table in tables:
            try:
                result = db.execute(text(f"SELECT COUNT(*) FROM {table}")).fetchone()
                print(f"   ✅ Table '{table}' exists with {result[0]} records")
            except Exception as e:
                print(f"   ❌ Table '{table}' issue: {e}")
    
    # Test 3: Validate seed data
    print("\n3. Validating seed data...")
    with get_db_context() as db:
        # Account types
        account_types = db.query(AccountType).all()
        print(f"   ✅ Account Types: {len(account_types)} found")
        for at in account_types:
            print(f"      - {at.name} ({at.category}/{at.sub_category})")
        
        # Categories
        categories = db.query(Category).all()
        income_cats = [c for c in categories if c.type == 'INCOME']
        expense_cats = [c for c in categories if c.type == 'EXPENSE']
        print(f"   ✅ Categories: {len(income_cats)} income, {len(expense_cats)} expense")
        for cat in income_cats:
            print(f"      - {cat.name} (INCOME) {cat.color}")
        for cat in expense_cats[:3]:  # Show first 3
            print(f"      - {cat.name} (EXPENSE) {cat.color}")
        if len(expense_cats) > 3:
            print(f"      ... and {len(expense_cats) - 3} more expense categories")
    
    # Test 4: Test relationships
    print("\n4. Testing relationships...")
    with get_db_context() as db:
        accounts = db.query(Account).all()
        transactions = db.query(Transaction).all()
        print(f"   ✅ Accounts: {len(accounts)}")
        print(f"   ✅ Transactions: {len(transactions)}")
        
        if transactions:
            tx = transactions[0]
            print(f"   ✅ Sample transaction relationship test:")
            print(f"      Transaction: {tx.description}")
            print(f"      Account: {tx.account.name if tx.account else 'Not loaded'}")
            print(f"      Category: {tx.category.name if tx.category else 'Not loaded'}")
    
    # Test 5: Raw DuckDB query test
    print("\n5. Testing DuckDB directly...")
    try:
        conn = duckdb.connect('data/piggy.db')
        result = conn.execute("""
            SELECT 
                at.name as account_type,
                at.category,
                COUNT(*) as account_count
            FROM account_types at
            LEFT JOIN accounts a ON a.account_type_id = at.id
            GROUP BY at.name, at.category
            ORDER BY at.category, at.name
        """).fetchall()
        
        print("   ✅ Account type distribution:")
        for row in result:
            print(f"      - {row[0]} ({row[1]}): {row[2]} accounts")
        
        conn.close()
    except Exception as e:
        print(f"   ❌ DuckDB direct query failed: {e}")
    
    print("\n🎉 Database validation complete!")

if __name__ == "__main__":
    validate_database()