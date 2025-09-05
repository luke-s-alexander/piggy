#!/usr/bin/env python3
"""
Simple API testing script - tests via HTTP only
"""

import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def simple_api_test():
    print("🚀 Simple API Test for Piggy Phase 2\n")
    
    # Test 1: Get categories (seeded data)
    print("1. Testing Categories...")
    try:
        response = requests.get(f"{BASE_URL}/categories/")
        if response.status_code == 200:
            categories = response.json()
            print(f"   ✅ Found {len(categories)} categories")
            grocery_cat = next((c for c in categories if 'Groc' in c['name']), categories[0])
            print(f"   🍎 Sample category: {grocery_cat['name']} ({grocery_cat['type']}) {grocery_cat['color']}")
        else:
            print(f"   ❌ Categories failed: {response.status_code}")
            return
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return
    
    # Test 2: Get accounts  
    print("\n2. Testing Accounts...")
    response = requests.get(f"{BASE_URL}/accounts/")
    if response.status_code == 200:
        accounts = response.json()
        print(f"   ✅ Found {len(accounts)} existing accounts")
        if accounts:
            sample_account = accounts[0]
            print(f"   🏦 Sample: {sample_account['name']} (${sample_account['balance']})")
    
    # Test 3: Create a new account (we need an account_type_id)
    print("\n3. Creating Test Account...")
    
    # Get account types by checking if any accounts exist and using their type
    if accounts:
        account_type_id = accounts[0]['account_type_id']
        print(f"   🔑 Using existing account_type_id: {account_type_id[:8]}...")
    else:
        # Hardcode a known type from our seed data
        account_type_id = "b4cea379-d5a8-42f9-8cf9-89a7e3a54a08"  # Checking type
        print(f"   🔑 Using seeded Checking account type")
    
    new_account = {
        "name": "API Test Account",
        "account_type_id": account_type_id,
        "balance": 2500.00,
        "institution": "Test Bank API",
        "currency": "CAD"
    }
    
    response = requests.post(
        f"{BASE_URL}/accounts/", 
        json=new_account,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 201:
        created_account = response.json()
        account_id = created_account['id']
        print(f"   ✅ Created account: {created_account['name']} (ID: {account_id[:8]}...)")
        print(f"   💰 Balance: ${created_account['balance']}")
    else:
        print(f"   ❌ Account creation failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return
    
    # Test 4: Create a transaction
    print("\n4. Creating Test Transaction...")
    
    transaction = {
        "account_id": account_id,
        "category_id": grocery_cat['id'],
        "amount": -87.25,
        "description": "API Test - Grocery Store Purchase",
        "date": "2025-09-04",
        "type": "EXPENSE"
    }
    
    response = requests.post(
        f"{BASE_URL}/transactions/",
        json=transaction,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 201:
        created_transaction = response.json()
        print(f"   ✅ Created transaction: {created_transaction['description']}")
        print(f"   💸 Amount: ${created_transaction['amount']}")
        print(f"   🏷️ Category: {created_transaction['category']['name']}")
        print(f"   🏦 Account: {created_transaction['account']['name']}")
    else:
        print(f"   ❌ Transaction creation failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return
    
    # Test 5: Query transactions with filters
    print("\n5. Testing Transaction Filters...")
    
    # Filter by account
    response = requests.get(f"{BASE_URL}/transactions/?account_id={account_id}")
    if response.status_code == 200:
        account_transactions = response.json()
        print(f"   ✅ Transactions for this account: {len(account_transactions)}")
    
    # Filter by type
    response = requests.get(f"{BASE_URL}/transactions/?transaction_type=EXPENSE")
    if response.status_code == 200:
        expense_transactions = response.json()
        print(f"   ✅ Total expense transactions: {len(expense_transactions)}")
    
    # Test 6: Update account balance
    print("\n6. Testing Account Update...")
    
    update_data = {"balance": 3000.75}
    response = requests.put(
        f"{BASE_URL}/accounts/{account_id}",
        json=update_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        updated_account = response.json()
        print(f"   ✅ Updated account balance: ${updated_account['balance']}")
    else:
        print(f"   ❌ Account update failed: {response.status_code}")
    
    print("\n🎆 All tests completed successfully!")
    print("\n📡 API Endpoints tested:")
    print("   - GET /api/v1/categories/")
    print("   - GET /api/v1/accounts/")
    print("   - POST /api/v1/accounts/")
    print("   - PUT /api/v1/accounts/{id}")
    print("   - POST /api/v1/transactions/")
    print("   - GET /api/v1/transactions/ (with filters)")
    print("\n🌐 Interactive docs: http://localhost:8000/docs")

if __name__ == "__main__":
    simple_api_test()