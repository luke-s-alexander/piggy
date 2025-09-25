from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, text

from app.models import Account, AccountType, BalanceHistory


class NetWorthService:
    """Service for calculating net worth and related financial metrics"""

    @staticmethod
    def calculate_current_net_worth(db: Session) -> Dict[str, Any]:
        """Calculate current net worth summary"""
        
        # Get all active accounts with their types
        accounts = (
            db.query(Account, AccountType)
            .join(AccountType)
            .filter(Account.is_active == True)
            .all()
        )
        
        total_assets = Decimal('0')
        total_liabilities = Decimal('0')
        asset_accounts = []
        liability_accounts = []
        
        for account, account_type in accounts:
            balance = Decimal(str(account.balance))
            
            if account_type.category == 'ASSET':
                total_assets += balance
                asset_accounts.append({
                    'id': str(account.id),
                    'name': account.name,
                    'type': account_type.name,
                    'balance': float(balance)
                })
            elif account_type.category == 'LIABILITY':
                # For liabilities, we store the positive balance but count it as negative for net worth
                total_liabilities += balance
                liability_accounts.append({
                    'id': str(account.id),
                    'name': account.name,
                    'type': account_type.name,
                    'balance': float(balance)
                })
        
        net_worth = total_assets - total_liabilities
        
        return {
            'net_worth': float(net_worth),
            'total_assets': float(total_assets),
            'total_liabilities': float(total_liabilities),
            'asset_accounts': asset_accounts,
            'liability_accounts': liability_accounts,
            'calculation_date': datetime.now().isoformat()
        }

    @staticmethod
    def calculate_net_worth_trend(db: Session, time_range: str = '6M') -> List[Dict[str, Any]]:
        """Calculate net worth trend over time using balance history"""
        
        # Determine date range
        end_date = datetime.now()
        if time_range == '1M':
            start_date = end_date - timedelta(days=30)
            interval_days = 2
        elif time_range == '3M':
            start_date = end_date - timedelta(days=90)
            interval_days = 7
        elif time_range == '6M':
            start_date = end_date - timedelta(days=180)
            interval_days = 14
        elif time_range == '1Y':
            start_date = end_date - timedelta(days=365)
            interval_days = 30
        else:  # ALL
            start_date = end_date - timedelta(days=730)
            interval_days = 30
        
        # Get balance history for the date range
        balance_history = (
            db.query(BalanceHistory)
            .join(Account)
            .filter(
                and_(
                    BalanceHistory.created_at >= start_date,
                    Account.is_active == True
                )
            )
            .order_by(BalanceHistory.created_at)
            .all()
        )
        
        # If no balance history, return current balances as single point
        if not balance_history:
            current = NetWorthService.calculate_current_net_worth(db)
            return [{
                'date': end_date.strftime('%Y-%m-%d'),
                'net_worth': current['net_worth'],
                'assets': current['total_assets'],
                'liabilities': current['total_liabilities']
            }]
        
        # Group balance changes by date and calculate daily net worth
        daily_balances = {}
        account_balances = {}
        
        # Initialize with current balances and work backwards
        current_accounts = db.query(Account).filter(Account.is_active == True).all()
        for account in current_accounts:
            account_balances[account.id] = Decimal(str(account.balance))
        
        # Process balance history in reverse to reconstruct historical balances
        for history in reversed(balance_history):
            date_key = history.created_at.strftime('%Y-%m-%d')
            account_id = history.account_id
            
            # Reconstruct balance at this point in time
            if account_id not in account_balances:
                account_balances[account_id] = Decimal(str(history.new_balance))
            
            # Store the balance state at this date
            if date_key not in daily_balances:
                daily_balances[date_key] = dict(account_balances)
            
            # Update balance for previous dates
            account_balances[account_id] = Decimal(str(history.previous_balance))
        
        # Calculate net worth for each date
        trend_data = []
        
        # Get account types for asset/liability classification
        account_types = {
            account.id: account.account_type.category 
            for account in db.query(Account).join(AccountType).filter(Account.is_active == True).all()
        }
        
        # Generate data points at regular intervals
        current_date = start_date
        while current_date <= end_date:
            date_key = current_date.strftime('%Y-%m-%d')
            
            # Find closest historical data
            closest_balances = None
            min_diff = None
            
            for hist_date, balances in daily_balances.items():
                hist_datetime = datetime.strptime(hist_date, '%Y-%m-%d')
                diff = abs((hist_datetime - current_date).days)
                
                if min_diff is None or diff < min_diff:
                    min_diff = diff
                    closest_balances = balances
            
            # Use current balances if no historical data found
            if closest_balances is None:
                closest_balances = account_balances
            
            # Calculate net worth for this date
            assets = Decimal('0')
            liabilities = Decimal('0')
            
            for account_id, balance in closest_balances.items():
                if account_id in account_types:
                    if account_types[account_id] == 'ASSET':
                        assets += balance
                    elif account_types[account_id] == 'LIABILITY':
                        liabilities += balance
            
            net_worth = assets - liabilities
            
            trend_data.append({
                'date': date_key,
                'net_worth': float(net_worth),
                'assets': float(assets),
                'liabilities': float(liabilities)
            })
            
            current_date += timedelta(days=interval_days)
        
        return trend_data

    @staticmethod
    def get_asset_liability_breakdown(db: Session) -> List[Dict[str, Any]]:
        """Get breakdown of assets vs liabilities"""
        
        current = NetWorthService.calculate_current_net_worth(db)
        
        breakdown = []
        if current['total_assets'] > 0:
            breakdown.append({
                'name': 'Assets',
                'value': current['total_assets'],
                'color': 'var(--color-secondary)',
                'icon': 'account_balance'
            })
        
        if current['total_liabilities'] > 0:
            breakdown.append({
                'name': 'Liabilities',
                'value': current['total_liabilities'],
                'color': 'var(--color-accent)',
                'icon': 'credit_card'
            })
        
        return breakdown

    @staticmethod
    def get_category_breakdown(db: Session) -> List[Dict[str, Any]]:
        """Get breakdown by account type categories"""
        
        # Get accounts grouped by account type
        result = (
            db.query(
                AccountType.name,
                AccountType.category,
                func.sum(Account.balance).label('total_balance')
            )
            .join(Account)
            .filter(Account.is_active == True)
            .group_by(AccountType.id, AccountType.name, AccountType.category)
            .all()
        )
        
        # Map account type to appropriate icons
        type_icons = {
            'Checking': 'account_balance',
            'Savings': 'savings',
            'Investment': 'trending_up',
            'Credit Card': 'credit_card',
            'Loan': 'money_off',
            'Mortgage': 'home'
        }
        
        breakdown = []
        for name, category, total_balance in result:
            balance = Decimal(str(total_balance or 0))
            
            if category == 'ASSET':
                assets = float(balance)
                liabilities = 0
                net = float(balance)
            else:  # LIABILITY
                assets = 0
                liabilities = float(balance)
                net = -float(balance)  # Negative for net worth calculation
            
            breakdown.append({
                'name': name,
                'assets': assets,
                'liabilities': liabilities,
                'net': net,
                'icon': type_icons.get(name, 'account_balance_wallet')
            })
        
        # Sort by net value descending
        breakdown.sort(key=lambda x: x['net'], reverse=True)
        
        return breakdown

    @staticmethod
    def get_net_worth_summary(db: Session, previous_period_days: int = 30) -> Dict[str, Any]:
        """Get net worth summary with comparison to previous period"""
        
        current = NetWorthService.calculate_current_net_worth(db)
        
        # Calculate previous period comparison
        previous_date = datetime.now() - timedelta(days=previous_period_days)
        
        # Find balance history closest to previous period
        previous_balances = {}
        
        # Get all balance history entries before the previous date
        history_entries = (
            db.query(BalanceHistory)
            .join(Account)
            .filter(
                and_(
                    BalanceHistory.created_at <= previous_date,
                    Account.is_active == True
                )
            )
            .order_by(BalanceHistory.created_at.desc())
            .all()
        )
        
        # Get the most recent balance for each account before the previous date
        for entry in history_entries:
            if entry.account_id not in previous_balances:
                previous_balances[entry.account_id] = entry.new_balance
        
        # Calculate previous net worth
        previous_assets = Decimal('0')
        previous_liabilities = Decimal('0')
        
        if previous_balances:
            accounts = (
                db.query(Account, AccountType)
                .join(AccountType)
                .filter(
                    and_(
                        Account.is_active == True,
                        Account.id.in_(previous_balances.keys())
                    )
                )
                .all()
            )
            
            for account, account_type in accounts:
                balance = Decimal(str(previous_balances.get(account.id, 0)))
                
                if account_type.category == 'ASSET':
                    previous_assets += balance
                elif account_type.category == 'LIABILITY':
                    previous_liabilities += balance
        
        previous_net_worth = previous_assets - previous_liabilities
        
        # Calculate changes
        net_worth_change = Decimal(str(current['net_worth'])) - previous_net_worth
        asset_change = Decimal(str(current['total_assets'])) - previous_assets
        liability_change = Decimal(str(current['total_liabilities'])) - previous_liabilities
        
        # Calculate percentage changes
        net_worth_change_pct = 0.0
        asset_change_pct = 0.0
        liability_change_pct = 0.0
        
        if previous_net_worth != 0:
            net_worth_change_pct = float((net_worth_change / previous_net_worth) * 100)
        
        if previous_assets != 0:
            asset_change_pct = float((asset_change / previous_assets) * 100)
        
        if previous_liabilities != 0:
            liability_change_pct = float((liability_change / previous_liabilities) * 100)
        
        return {
            'current': current,
            'previous_period': {
                'net_worth': float(previous_net_worth),
                'total_assets': float(previous_assets),
                'total_liabilities': float(previous_liabilities),
                'period_days': previous_period_days
            },
            'changes': {
                'net_worth': float(net_worth_change),
                'net_worth_percent': round(net_worth_change_pct, 2),
                'assets': float(asset_change),
                'assets_percent': round(asset_change_pct, 2),
                'liabilities': float(liability_change),
                'liabilities_percent': round(liability_change_pct, 2)
            }
        }