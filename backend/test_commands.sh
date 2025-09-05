#!/bin/bash
# Manual API testing commands for Piggy Phase 2

echo "🧪 Piggy API Test Commands"
echo "==========================="
echo ""

BASE_URL="http://localhost:8000/api/v1"

echo "1. Get all categories (seeded data):"
echo "curl -X GET $BASE_URL/categories/"
echo ""

echo "2. Get all accounts:"
echo "curl -X GET $BASE_URL/accounts/"
echo ""

echo "3. Create a new account:"
echo 'curl -X POST "$BASE_URL/accounts/" \'
echo '  -H "Content-Type: application/json" \'
echo '  -d \'{
echo '    "name": "My Test Savings",'
echo '    "account_type_id": "d107de9b-5fe7-4d45-bf64-ded2d3cd356f",'
echo '    "balance": 1500.00,'
echo '    "institution": "My Bank",'
echo '    "currency": "CAD"'
echo '  }\''
echo ""

echo "4. Get all transactions:"
echo "curl -X GET $BASE_URL/transactions/"
echo ""

echo "5. Create a transaction (replace ACCOUNT_ID and CATEGORY_ID):"
echo 'curl -X POST "$BASE_URL/transactions/" \'
echo '  -H "Content-Type: application/json" \'
echo '  -d \'{
echo '    "account_id": "YOUR_ACCOUNT_ID",'
echo '    "category_id": "14fb0d79-2dad-4e92-8976-44e50582f137",'
echo '    "amount": -45.67,'
echo '    "description": "Coffee shop visit",'
echo '    "date": "2025-09-04",'
echo '    "type": "EXPENSE"'
echo '  }\''
echo ""

echo "6. Filter transactions by type:"
echo "curl -X GET '$BASE_URL/transactions/?transaction_type=EXPENSE'"
echo ""

echo "7. Open interactive API documentation:"
echo "open http://localhost:8000/docs"
echo ""

echo "📋 Account Type IDs (from seed data):"
echo "- Checking: b4cea379-d5a8-42f9-8cf9-89a7e3a54a08"
echo "- Savings: d107de9b-5fe7-4d45-bf64-ded2d3cd356f"
echo "- Credit Card: 950b36ad-7b5d-4714-b47e-060379b4224f"
echo "- Investment: 5d6def5c-6352-4612-83fc-321ee16c37d8"
echo ""
echo "📋 Sample Category IDs:"
echo "- Groceries (expense): 14fb0d79-2dad-4e92-8976-44e50582f137"
echo "- Salary (income): 0483ec05-efe4-403f-b20e-789e04640959"