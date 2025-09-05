#!/usr/bin/env python3
"""
API testing script for Piggy Phase 2
Tests all CRUD operations on all endpoints
"""

import requests
import json
from datetime import date

BASE_URL = "http://localhost:8000/api/v1"

def test_api_endpoints():
    print("🚀 Testing Piggy API Endpoints...\n")
    
    # Test 1: Health check
    print("1. Testing health endpoints...")
    try:
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print(f"   ✅ Health check: {response.json()}")
        else:
            print(f"   ❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Health check error: {e}")
        return
    
    # Test 2: Categories (should have seed data)
    print("\n2. Testing Categories API...")
    try:
        response = requests.get(f"{BASE_URL}/categories/")
        if response.status_code == 200:
            categories = response.json()
            print(f"   ✅ GET categories: {len(categories)} found")
            
            # Find a grocery category for later use
            grocery_cat = next((c for c in categories if c['name'] == 'Groceries'), None)
            salary_cat = next((c for c in categories if c['name'] == 'Salary'), None)
            
            if grocery_cat:
                print(f"      - Sample expense: {grocery_cat['name']} ({grocery_cat['color']})")
            if salary_cat:
                print(f"      - Sample income: {salary_cat['name']} ({salary_cat['color']})")
        else:
            print(f"   ❌ GET categories failed: {response.status_code}")
            return
    except Exception as e:
        print(f"   ❌ Categories API error: {e}")
        return
    
    # Test 3: Account Types (should have seed data)
    print("\n3. Testing Account Types...")
    try:
        # We don't have a dedicated endpoint, but let's test via database
        from app.core.database import get_db_context
        from app.models import AccountType
        
        with get_db_context() as db:
            account_types = db.query(AccountType).all()
            checking_type = next((at for at in account_types if at.name == 'Checking'), None)
            
            if checking_type:
                print(f"   ✅ Account types available: {len(account_types)}")
                print(f"      - Sample: {checking_type.name} ({checking_type.category}/{checking_type.sub_category})")
            else:
                print(f"   ❌ No checking account type found")
                return
    except Exception as e:
        print(f"   ❌ Account types error: {e}")
        return
    
    # Test 4: Accounts CRUD
    print("\n4. Testing Accounts CRUD...")
    try:
        # GET all accounts (might be empty or have test data)
        response = requests.get(f"{BASE_URL}/accounts/")
        if response.status_code == 200:
            existing_accounts = response.json()
            print(f"   ✅ GET accounts: {len(existing_accounts)} found")
        else:
            print(f"   ❌ GET accounts failed: {response.status_code}")
            return
        
        # POST new account
        new_account_data = {
            "name": "API Test Savings Account",
            "account_type_id": checking_type.id,
            "balance": 5000.50,
            "institution": "Test API Bank",
            "currency": "CAD"
        }
        
        response = requests.post(
            f"{BASE_URL}/accounts/",
            json=new_account_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            created_account = response.json()
            account_id = created_account['id']
            print(f"   ✅ POST account created: {created_account['name']} (${created_account['balance']})")
            
            # GET specific account
            response = requests.get(f"{BASE_URL}/accounts/{account_id}")
            if response.status_code == 200:
                account = response.json()
                print(f"   ✅ GET specific account: {account['name']}")
            else:
                print(f"   ❌ GET specific account failed: {response.status_code}")
            
            # PUT update account
            update_data = {"balance": 6000.75}
            response = requests.put(
                f"{BASE_URL}/accounts/{account_id}",
                json=update_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                updated_account = response.json()
                print(f"   ✅ PUT account updated: balance now ${updated_account['balance']}")
            else:
                print(f"   ❌ PUT account failed: {response.status_code}")
        
        else:
            print(f"   ❌ POST account failed: {response.status_code} - {response.text}")
            return
            
    except Exception as e:
        print(f"   ❌ Accounts CRUD error: {e}")
        return
    
    # Test 5: Transactions CRUD
    print("\n5. Testing Transactions CRUD...")
    try:
        # POST new transaction
        transaction_data = {
            "account_id": account_id,
            "category_id": grocery_cat['id'],
            "amount": -125.50,
            "description": "API Test - Whole Foods Market",
            "date": str(date.today()),
            "type": "EXPENSE"
        }
        
        response = requests.post(
            f"{BASE_URL}/transactions/",
            json=transaction_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 201:
            created_transaction = response.json()
            transaction_id = created_transaction['id']
            print(f"   ✅ POST transaction created: {created_transaction['description']} (${created_transaction['amount']})")
            
            # Test filtering
            response = requests.get(f"{BASE_URL}/transactions/?account_id={account_id}")
            if response.status_code == 200:
                filtered_transactions = response.json()
                print(f"   ✅ GET transactions filtered by account: {len(filtered_transactions)} found")
            
            response = requests.get(f"{BASE_URL}/transactions/?transaction_type=EXPENSE")
            if response.status_code == 200:
                expense_transactions = response.json()
                print(f"   ✅ GET transactions filtered by type: {len(expense_transactions)} expenses")
            
        else:
            print(f"   ❌ POST transaction failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"   ❌ Transactions CRUD error: {e}")
    
    # Test 6: Validation errors
    print("\n6. Testing validation...")
    try:
        # Invalid account data
        invalid_account = {
            "name": "",  # Empty name should fail
            "account_type_id": "invalid-id",
            "balance": "not-a-number"
        }
        
        response = requests.post(
            f"{BASE_URL}/accounts/",
            json=invalid_account,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 422:
            print(f"   ✅ Validation working: rejected invalid data ({response.status_code})")
        else:
            print(f"   ⚠️ Unexpected validation response: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Validation test error: {e}")
    
    print("\n🎉 API testing complete!")
    print("\n📊 You can also test interactively at: http://localhost:8000/docs")

if __name__ == "__main__":
    test_api_endpoints()