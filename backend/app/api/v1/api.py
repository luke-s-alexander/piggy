from fastapi import APIRouter

from .accounts import router as accounts_router
from .account_types import router as account_types_router
from .categories import router as categories_router
from .transactions import router as transactions_router

api_router = APIRouter()

api_router.include_router(accounts_router, prefix="/accounts", tags=["accounts"])
api_router.include_router(account_types_router, prefix="/account-types", tags=["account-types"])
api_router.include_router(categories_router, prefix="/categories", tags=["categories"])
api_router.include_router(transactions_router, prefix="/transactions", tags=["transactions"])