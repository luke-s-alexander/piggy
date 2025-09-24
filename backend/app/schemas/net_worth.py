from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime


class AccountSummary(BaseModel):
    """Summary of an individual account"""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    name: str
    type: str
    balance: float


class NetWorthCurrent(BaseModel):
    """Current net worth snapshot"""
    model_config = ConfigDict(from_attributes=True)
    
    net_worth: float = Field(..., description="Current net worth (assets - liabilities)")
    total_assets: float = Field(..., description="Total value of all assets")
    total_liabilities: float = Field(..., description="Total value of all liabilities")
    asset_accounts: List[AccountSummary] = Field(default_factory=list, description="List of asset accounts")
    liability_accounts: List[AccountSummary] = Field(default_factory=list, description="List of liability accounts")
    calculation_date: str = Field(..., description="ISO timestamp when calculation was performed")


class NetWorthTrendPoint(BaseModel):
    """Single data point in net worth trend"""
    model_config = ConfigDict(from_attributes=True)
    
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    net_worth: float = Field(..., description="Net worth on this date")
    assets: float = Field(..., description="Total assets on this date")
    liabilities: float = Field(..., description="Total liabilities on this date")


class NetWorthTrend(BaseModel):
    """Net worth trend over time"""
    model_config = ConfigDict(from_attributes=True)
    
    time_range: str = Field(..., description="Time range (1M, 3M, 6M, 1Y, ALL)")
    data_points: List[NetWorthTrendPoint] = Field(..., description="Historical net worth data points")


class AssetLiabilityBreakdownItem(BaseModel):
    """Asset or liability breakdown item"""
    model_config = ConfigDict(from_attributes=True)
    
    name: str = Field(..., description="Category name (Assets or Liabilities)")
    value: float = Field(..., description="Total value")
    color: str = Field(..., description="CSS color variable")
    icon: str = Field(..., description="Material icon name")


class AssetLiabilityBreakdown(BaseModel):
    """Breakdown of assets vs liabilities"""
    model_config = ConfigDict(from_attributes=True)
    
    breakdown: List[AssetLiabilityBreakdownItem] = Field(..., description="Asset/liability breakdown items")


class CategoryBreakdownItem(BaseModel):
    """Category breakdown item"""
    model_config = ConfigDict(from_attributes=True)
    
    name: str = Field(..., description="Account type name")
    assets: float = Field(..., description="Asset value for this category")
    liabilities: float = Field(..., description="Liability value for this category")
    net: float = Field(..., description="Net value (assets - liabilities)")
    icon: str = Field(..., description="Material icon name")


class CategoryBreakdown(BaseModel):
    """Breakdown by account type categories"""
    model_config = ConfigDict(from_attributes=True)
    
    categories: List[CategoryBreakdownItem] = Field(..., description="Category breakdown items")


class NetWorthPeriodComparison(BaseModel):
    """Net worth comparison data"""
    model_config = ConfigDict(from_attributes=True)
    
    net_worth: float = Field(..., description="Net worth for the period")
    total_assets: float = Field(..., description="Total assets for the period")
    total_liabilities: float = Field(..., description="Total liabilities for the period")
    period_days: int = Field(..., description="Number of days in the comparison period")


class NetWorthChanges(BaseModel):
    """Changes in net worth metrics"""
    model_config = ConfigDict(from_attributes=True)
    
    net_worth: float = Field(..., description="Absolute change in net worth")
    net_worth_percent: float = Field(..., description="Percentage change in net worth")
    assets: float = Field(..., description="Absolute change in assets")
    assets_percent: float = Field(..., description="Percentage change in assets")
    liabilities: float = Field(..., description="Absolute change in liabilities")
    liabilities_percent: float = Field(..., description="Percentage change in liabilities")


class NetWorthSummary(BaseModel):
    """Complete net worth summary with comparisons"""
    model_config = ConfigDict(from_attributes=True)
    
    current: NetWorthCurrent = Field(..., description="Current net worth data")
    previous_period: NetWorthPeriodComparison = Field(..., description="Previous period data for comparison")
    changes: NetWorthChanges = Field(..., description="Changes between current and previous period")