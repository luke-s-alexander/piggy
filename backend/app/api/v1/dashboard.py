from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Annotated, Dict, Any

from app.core.database import get_db
from app.services.net_worth_service import NetWorthService
from app.schemas import (
    NetWorthSummary, NetWorthTrend, AssetLiabilityBreakdown,
    CategoryBreakdown
)

router = APIRouter()


@router.get("/", response_model=Dict[str, Any])
async def get_dashboard_data(
    db: Annotated[Session, Depends(get_db)],
    time_range: Annotated[str, Query(description="Time range for trend data", regex="^(1M|3M|6M|1Y|ALL)$")] = "6M",
    comparison_days: Annotated[int, Query(description="Days to compare against for summary", ge=1, le=365)] = 30
) -> Dict[str, Any]:
    """
    Get all dashboard data in a single API call for better performance.
    Returns net worth summary, trend data, and breakdowns.
    """
    try:
        # Get all data in parallel (though this is synchronous, it's still efficient)
        summary_data = NetWorthService.get_net_worth_summary(db, comparison_days)
        trend_data = NetWorthService.calculate_net_worth_trend(db, time_range)
        asset_liability_data = NetWorthService.get_asset_liability_breakdown(db)
        category_data = NetWorthService.get_category_breakdown(db)
        
        # Format response
        dashboard_data = {
            "summary": NetWorthSummary(**summary_data),
            "trend": {
                "time_range": time_range,
                "data_points": trend_data
            },
            "asset_liability_breakdown": {
                "breakdown": asset_liability_data
            },
            "category_breakdown": {
                "categories": category_data
            }
        }
        
        return dashboard_data
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error loading dashboard data: {str(e)}"
        )


@router.get("/summary", response_model=NetWorthSummary)
async def get_dashboard_summary(
    db: Annotated[Session, Depends(get_db)],
    comparison_days: Annotated[int, Query(description="Days to compare against", ge=1, le=365)] = 30
) -> NetWorthSummary:
    """Get net worth summary for dashboard cards"""
    try:
        summary_data = NetWorthService.get_net_worth_summary(db, comparison_days)
        return NetWorthSummary(**summary_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading dashboard summary: {str(e)}")


@router.get("/trend", response_model=NetWorthTrend)
async def get_dashboard_trend(
    db: Annotated[Session, Depends(get_db)],
    time_range: Annotated[str, Query(description="Time range", regex="^(1M|3M|6M|1Y|ALL)$")] = "6M"
) -> NetWorthTrend:
    """Get net worth trend data for dashboard chart"""
    try:
        trend_data = NetWorthService.calculate_net_worth_trend(db, time_range)
        return NetWorthTrend(time_range=time_range, data_points=trend_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading dashboard trend: {str(e)}")


@router.get("/asset-liability", response_model=AssetLiabilityBreakdown)
async def get_dashboard_asset_liability(
    db: Annotated[Session, Depends(get_db)]
) -> AssetLiabilityBreakdown:
    """Get asset/liability breakdown for dashboard pie chart"""
    try:
        breakdown_data = NetWorthService.get_asset_liability_breakdown(db)
        return AssetLiabilityBreakdown(breakdown=breakdown_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading asset/liability breakdown: {str(e)}")


@router.get("/categories", response_model=CategoryBreakdown)
async def get_dashboard_categories(
    db: Annotated[Session, Depends(get_db)]
) -> CategoryBreakdown:
    """Get category breakdown for dashboard bar chart"""
    try:
        category_data = NetWorthService.get_category_breakdown(db)
        return CategoryBreakdown(categories=category_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error loading category breakdown: {str(e)}")