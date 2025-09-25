from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Annotated

from app.core.database import get_db
from app.services.net_worth_service import NetWorthService
from app.schemas import (
    NetWorthCurrent, NetWorthTrend, NetWorthTrendPoint,
    AssetLiabilityBreakdown, AssetLiabilityBreakdownItem,
    CategoryBreakdown, CategoryBreakdownItem,
    NetWorthSummary
)

router = APIRouter()


@router.get("/net-worth/current", response_model=NetWorthCurrent)
async def get_current_net_worth(
    db: Annotated[Session, Depends(get_db)]
) -> NetWorthCurrent:
    """Get current net worth snapshot"""
    try:
        data = NetWorthService.calculate_current_net_worth(db)
        return NetWorthCurrent(**data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating net worth: {str(e)}")


@router.get("/net-worth/trend", response_model=NetWorthTrend)
async def get_net_worth_trend(
    db: Annotated[Session, Depends(get_db)],
    time_range: Annotated[str, Query(description="Time range", regex="^(1M|3M|6M|1Y|ALL)$")] = "6M"
) -> NetWorthTrend:
    """Get net worth trend over specified time period"""
    try:
        trend_data = NetWorthService.calculate_net_worth_trend(db, time_range)
        data_points = [NetWorthTrendPoint(**point) for point in trend_data]
        return NetWorthTrend(time_range=time_range, data_points=data_points)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating net worth trend: {str(e)}")


@router.get("/net-worth/summary", response_model=NetWorthSummary)
async def get_net_worth_summary(
    db: Annotated[Session, Depends(get_db)],
    comparison_days: Annotated[int, Query(description="Days to compare against", ge=1, le=365)] = 30
) -> NetWorthSummary:
    """Get complete net worth summary with period comparison"""
    try:
        summary_data = NetWorthService.get_net_worth_summary(db, comparison_days)
        return NetWorthSummary(**summary_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating net worth summary: {str(e)}")


@router.get("/asset-liability-breakdown", response_model=AssetLiabilityBreakdown)
async def get_asset_liability_breakdown(
    db: Annotated[Session, Depends(get_db)]
) -> AssetLiabilityBreakdown:
    """Get breakdown of assets vs liabilities"""
    try:
        breakdown_data = NetWorthService.get_asset_liability_breakdown(db)
        breakdown_items = [AssetLiabilityBreakdownItem(**item) for item in breakdown_data]
        return AssetLiabilityBreakdown(breakdown=breakdown_items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating asset/liability breakdown: {str(e)}")


@router.get("/category-breakdown", response_model=CategoryBreakdown)
async def get_category_breakdown(
    db: Annotated[Session, Depends(get_db)]
) -> CategoryBreakdown:
    """Get breakdown by account type categories"""
    try:
        category_data = NetWorthService.get_category_breakdown(db)
        category_items = [CategoryBreakdownItem(**item) for item in category_data]
        return CategoryBreakdown(categories=category_items)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating category breakdown: {str(e)}")