# Piggy - Personal Finance App
**Project Plan & Architecture Document**

## 📊 Current Status

🚀 **Phase 1 Complete**: Development environment fully set up and operational  
🚀 **Phase 2 Complete**: Core Data Layer - Database models, API routes, and migrations implemented  
🚀 **Phase 3 Complete**: Account Management - Enhanced UI, validation, soft delete, and user interactions
🔧 **Next**: Phase 4 - Transaction Management (transaction entry forms, listing, and category management)

---

## 📋 Project Overview

Piggy is a personal finance web application that helps users track their spending, income, and net worth across multiple financial institutions. Users can monitor their financial health through categorized assets and liabilities, create and track budgets, and leverage AI-powered transaction categorization for effortless expense management.

**Target**: Local web application (initially), with potential for future deployment

---

## 🛠 Tech Stack

### Frontend
- **React 18** + **TypeScript** - Component-based UI with type safety
- **Tailwind CSS** - Utility-first styling framework  
- **Recharts** - Financial data visualizations and charts
- **React Router** - Client-side routing
- **React Hook Form** - Form handling and validation

### Backend
- **Python 3.11+** + **FastAPI** - Modern, fast API framework with automatic validation
- **SQLAlchemy** - Powerful ORM with excellent async support
- **Pydantic** - Data validation and serialization (built into FastAPI)
- **DuckDB** - Analytical database optimized for financial queries and reporting
- **Alembic** - Database migrations

### AI & Machine Learning
- **spaCy** - Natural language processing for transaction categorization
- **scikit-learn** - Machine learning for improving categorization over time
- **pandas** - Data analysis and manipulation
- **Alternative**: **OpenAI API** for advanced categorization

### Development Tools
- **Vite** - Fast frontend build tool
- **ESLint** + **Prettier** - Code linting and formatting
- **pytest** - Python testing framework
- **Jest** - Frontend testing

---

## ✨ Core Features (MVP)

### 1. Account Management
- ✅ Add/edit financial accounts (checking, savings, credit cards, investments, loans)
- ✅ Categorize accounts as assets or liabilities  
- ✅ Set account types (cash, investments, real estate, debt, etc.)
- ✅ Track current account balances

### 2. Transaction Management
- ✅ Manually add income and expense transactions
- ✅ Categorize transactions (groceries, utilities, salary, etc.)
- ✅ Edit and delete existing transactions
- ✅ Associate transactions with specific accounts

### 3. Net Worth Dashboard
- ✅ Calculate total assets minus liabilities
- ✅ Net worth trend visualization over time
- ✅ Asset vs liability breakdown (pie charts)
- ✅ Category-wise asset breakdown (investments, cash, real estate)

### 4. Basic Reports
- ✅ Monthly spending breakdown by category
- ✅ Income vs expenses trends
- ✅ Account balances summary

### 5. Budget Management 
- ✅ Create yearly budgets with category-wise allocations
- ✅ Automatic monthly distribution of yearly budget amounts
- ✅ Budget vs actual tracking with visual progress indicators
- ✅ Budget categories sync with transaction categories
- ✅ Multi-year budget comparison and rollover functionality

### 6. Smart Transaction Categorization (AI-Powered)
- ✅ Automatic categorization based on merchant names and descriptions
- ✅ Machine learning improvement from user corrections
- ✅ Confidence scoring with manual review for uncertain categorizations
- ✅ Custom rules engine for personal spending patterns
- ✅ Merchant database with common categorization patterns

---

## 👤 User Stories

**Account Management:**
- As a user, I want to add my bank accounts so I can track my cash balances
- As a user, I want to add investment accounts so I can monitor my portfolio value
- As a user, I want to categorize accounts (cash, investments, real estate, debt) for net worth analysis

**Transaction Tracking:**
- As a user, I want transactions to be automatically categorized so I don't have to manually assign each one
- As a user, I want to correct auto-categorizations so the system learns my preferences
- As a user, I want to manually enter transactions when needed
- As a user, I want to edit past transactions to correct mistakes

**Budget Management:**
- As a user, I want to create a yearly budget so I can plan my spending by category
- As a user, I want to see my monthly budget vs actual spending so I can stay on track
- As a user, I want to see budget progress visualizations so I can assess my financial discipline
- As a user, I want to roll over unused budget amounts to carry forward savings

**Financial Insights:**
- As a user, I want to see my net worth trend over time so I can track financial progress
- As a user, I want to see spending breakdowns by category so I can understand my habits
- As a user, I want a dashboard overview so I can quickly assess my financial health

---

## 🏗 Project Architecture

### Folder Structure
```
piggy/
├── README.md
├── LICENSE
├── PROJECT_PLAN.md
├── requirements.txt             # Python dependencies
├── 
├── frontend/                    # React + TypeScript app
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/             # Basic UI elements
│   │   │   ├── charts/         # Chart components
│   │   │   └── forms/          # Form components
│   │   ├── pages/              # Route pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Accounts.tsx
│   │   │   ├── Transactions.tsx
│   │   │   ├── Budget.tsx
│   │   │   └── Reports.tsx
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API calls to backend
│   │   ├── types/              # TypeScript type definitions
│   │   ├── utils/              # Helper functions
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                     # Python + FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI app entry point
│   │   ├── api/                # API routes
│   │   │   ├── __init__.py
│   │   │   ├── accounts.py
│   │   │   ├── transactions.py
│   │   │   ├── budget.py
│   │   │   ├── categories.py
│   │   │   └── reports.py
│   │   ├── models/             # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── account.py
│   │   │   ├── transaction.py
│   │   │   ├── budget.py
│   │   │   └── category.py
│   │   ├── services/           # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── account_service.py
│   │   │   ├── transaction_service.py
│   │   │   ├── budget_service.py
│   │   │   └── categorization_service.py
│   │   ├── ml/                 # Machine learning components
│   │   │   ├── __init__.py
│   │   │   ├── categorizer.py
│   │   │   ├── rules_engine.py
│   │   │   └── model_trainer.py
│   │   ├── core/               # Core configuration
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   └── database.py
│   │   └── utils/              # Helper functions
│   ├── alembic/                # Database migrations
│   ├── requirements.txt
│   └── pyproject.toml
│
└── data/                        # DuckDB database location
    ├── piggy.db
    └── models/                  # ML model storage
```

### API Design
**RESTful endpoints:**
- `GET/POST /api/accounts` - Account management
- `GET/POST/PUT/DELETE /api/transactions` - Transaction CRUD
- `POST /api/transactions/categorize` - AI categorization
- `GET/POST/PUT /api/budget` - Budget management
- `GET /api/categories` - Transaction categories
- `GET /api/reports/net-worth` - Net worth data for charts
- `GET /api/reports/spending` - Spending analysis
- `GET /api/reports/budget-vs-actual` - Budget performance

---

## 🗃 Database Schema

### Core Entity Tables

```sql
-- Account types for categorization
CREATE TABLE account_types (
    id VARCHAR PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,  -- "Checking", "Credit Card", "Investment"
    category VARCHAR NOT NULL,     -- "ASSET" or "LIABILITY"
    sub_category VARCHAR NOT NULL, -- "cash", "investment", "debt", "real_estate"
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Financial accounts
CREATE TABLE accounts (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,          -- "Chase Checking", "Wealthsimple RRSP"
    account_type_id VARCHAR NOT NULL,
    balance DECIMAL(12, 2) NOT NULL, -- Current balance (derived from latest holdings)
    institution VARCHAR,            -- "Chase Bank", "Wealthsimple"
    account_number VARCHAR,         -- Last 4 digits
    currency VARCHAR DEFAULT 'CAD', -- Account currency
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (account_type_id) REFERENCES account_types(id)
);

-- Individual holdings within accounts (stocks, ETFs, cash positions, etc.)
CREATE TABLE holdings (
    id VARCHAR PRIMARY KEY,
    account_id VARCHAR NOT NULL,
    symbol VARCHAR,                 -- "XIC", "AAPL", "CASH-CAD", null for loans/debt
    name VARCHAR NOT NULL,          -- "iShares Core Canadian Index ETF", "Canadian Dollar Cash"
    holding_type VARCHAR NOT NULL,  -- "ETF", "STOCK", "BOND", "CASH", "MUTUAL_FUND", "CRYPTO", "OTHER"
    currency VARCHAR DEFAULT 'CAD', -- Holding currency
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    UNIQUE(account_id, symbol)      -- One holding per symbol per account
);

-- Transaction categories
CREATE TABLE categories (
    id VARCHAR PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,   -- "Groceries", "Salary", "Utilities"
    type VARCHAR NOT NULL,          -- "INCOME" or "EXPENSE"
    color VARCHAR,                  -- For UI visualization
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual transactions
CREATE TABLE transactions (
    id VARCHAR PRIMARY KEY,
    account_id VARCHAR NOT NULL,
    category_id VARCHAR NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description VARCHAR NOT NULL,
    date DATE NOT NULL,
    type VARCHAR NOT NULL,          -- "INCOME" or "EXPENSE"
    ai_category_id VARCHAR,         -- AI suggested category
    ai_confidence FLOAT,            -- Confidence score 0.0-1.0
    is_ai_categorized BOOLEAN DEFAULT false,
    user_corrected BOOLEAN DEFAULT false, -- For ML training
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (ai_category_id) REFERENCES categories(id)
);

-- Yearly budgets
CREATE TABLE budgets (
    id VARCHAR PRIMARY KEY,
    year INTEGER UNIQUE NOT NULL,
    name VARCHAR NOT NULL,          -- "2024 Budget"
    total_amount DECIMAL(12, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Budget allocation per category
CREATE TABLE budget_line_items (
    id VARCHAR PRIMARY KEY,
    budget_id VARCHAR NOT NULL,
    category_id VARCHAR NOT NULL,
    yearly_amount DECIMAL(12, 2) NOT NULL,
    monthly_amount DECIMAL(12, 2) NOT NULL, -- yearly_amount / 12
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (budget_id) REFERENCES budgets(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    UNIQUE(budget_id, category_id)
);

-- Categorization rules and patterns
CREATE TABLE categorization_rules (
    id VARCHAR PRIMARY KEY,
    pattern VARCHAR NOT NULL,       -- "McDonald's", "AMZN", etc.
    category_id VARCHAR NOT NULL,
    confidence FLOAT NOT NULL,      -- Rule confidence
    is_user_defined BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### Historical Tracking (Hybrid Approach)

**Single Source of Truth:** Only `holding_snapshots` table stores actual data  
**Performance:** Database views provide fast aggregations without storage overhead  
**Flexibility:** Easy to modify aggregation logic without backfilling data  

```sql
-- ONLY table that stores historical data (single source of truth)
CREATE TABLE holding_snapshots (
    id VARCHAR PRIMARY KEY,
    holding_id VARCHAR NOT NULL,
    date DATE NOT NULL,
    quantity DECIMAL(15, 6),        -- Shares/units owned (null for debt/cash balances)
    unit_price DECIMAL(12, 4),      -- Price per share/unit (null for debt/cash)
    book_value DECIMAL(12, 2),      -- Total cost basis
    market_value DECIMAL(12, 2) NOT NULL, -- Current market value or balance
    currency VARCHAR DEFAULT 'CAD',
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (holding_id) REFERENCES holdings(id),
    UNIQUE(holding_id, date)
);

-- VIEWS for aggregated data (no storage overhead, always consistent)

-- Account balances over time (aggregated from holdings)
CREATE VIEW account_balances_by_date AS
SELECT 
    h.account_id,
    hs.date,
    SUM(hs.market_value) as total_value,
    a.name as account_name,
    a.institution,
    hs.currency
FROM holding_snapshots hs
JOIN holdings h ON hs.holding_id = h.id
JOIN accounts a ON h.account_id = a.id
GROUP BY h.account_id, hs.date, a.name, a.institution, hs.currency;

-- Account type totals over time 
CREATE VIEW account_type_balances_by_date AS
SELECT 
    at.id as account_type_id,
    at.name as account_type_name,
    at.category,
    at.sub_category,
    hs.date,
    SUM(hs.market_value) as total_value,
    COUNT(DISTINCT a.id) as account_count,
    hs.currency
FROM holding_snapshots hs
JOIN holdings h ON hs.holding_id = h.id
JOIN accounts a ON h.account_id = a.id
JOIN account_types at ON a.account_type_id = at.id
WHERE a.is_active = true
GROUP BY at.id, at.name, at.category, at.sub_category, hs.date, hs.currency;

-- Net worth over time (highest level aggregation)
CREATE VIEW net_worth_by_date AS
SELECT
    hs.date,
    SUM(CASE WHEN at.category = 'ASSET' THEN hs.market_value ELSE 0 END) as total_assets,
    SUM(CASE WHEN at.category = 'LIABILITY' THEN hs.market_value ELSE 0 END) as total_liabilities,
    SUM(CASE WHEN at.category = 'ASSET' THEN hs.market_value ELSE 0 END) - 
    SUM(CASE WHEN at.category = 'LIABILITY' THEN hs.market_value ELSE 0 END) as net_worth,
    -- Category breakdowns
    SUM(CASE WHEN at.sub_category = 'cash' THEN hs.market_value ELSE 0 END) as cash_and_cash_equivalents,
    SUM(CASE WHEN at.sub_category = 'investment' THEN hs.market_value ELSE 0 END) as investments,
    SUM(CASE WHEN at.sub_category = 'real_estate' THEN hs.market_value ELSE 0 END) as real_estate,
    SUM(CASE WHEN at.sub_category = 'debt' THEN hs.market_value ELSE 0 END) as debt,
    hs.currency
FROM holding_snapshots hs
JOIN holdings h ON hs.holding_id = h.id  
JOIN accounts a ON h.account_id = a.id
JOIN account_types at ON a.account_type_id = at.id
WHERE a.is_active = true
GROUP BY hs.date, hs.currency;
```

### Example Queries for Your Use Cases

```sql
-- Track XIC ETF performance in Wealthsimple RRSP between specific dates
SELECT 
    h.name,
    a.name as account_name,
    start_snap.market_value as start_value,
    end_snap.market_value as end_value,
    end_snap.market_value - start_snap.market_value as growth,
    ROUND((end_snap.market_value - start_snap.market_value) / start_snap.market_value * 100, 2) as growth_percent
FROM holdings h
JOIN accounts a ON h.account_id = a.id
JOIN holding_snapshots start_snap ON h.id = start_snap.holding_id AND start_snap.date = '2025-01-08'
JOIN holding_snapshots end_snap ON h.id = end_snap.holding_id AND end_snap.date = '2025-04-06'
WHERE h.symbol = 'XIC' AND a.name LIKE '%RRSP%';

-- All investment accounts performance over time (using view)
SELECT date, total_value as total_investments
FROM account_type_balances_by_date
WHERE sub_category = 'investment'
ORDER BY date;

-- Net worth trend with category breakdown (using view)
SELECT date, net_worth, investments, cash_and_cash_equivalents, debt
FROM net_worth_by_date
ORDER BY date;

-- Individual holdings within an account over time
SELECT 
    h.symbol,
    h.name,
    hs.date,
    hs.market_value,
    hs.quantity,
    hs.unit_price
FROM holdings h
JOIN holding_snapshots hs ON h.id = hs.holding_id
JOIN accounts a ON h.account_id = a.id
WHERE a.name = 'Wealthsimple RRSP'
ORDER BY h.symbol, hs.date;
```

---

## 🚀 Development Phases

### Phase 1: Project Setup & Foundation ✅ **COMPLETED**
- [x] Initialize frontend (React + TypeScript + Tailwind)
- [x] Initialize backend (Python + FastAPI)
- [x] Set up DuckDB database with SQLAlchemy
- [x] Create basic project structure and build scripts
- [x] Set up development environment and tooling

**Implementation Notes:**
- Node.js upgraded to v22.19.0 for Vite 7.x compatibility
- Fixed Tailwind PostCSS configuration with @tailwindcss/postcss plugin
- Both development servers running with hot reload (backend:8000, frontend:5173)
- FastAPI automatic documentation available at /docs endpoint
- Alembic migrations configured for database schema management

### Phase 2: Core Data Layer ✅ **COMPLETED**
**Database Implementation:**
- [x] Configure DuckDB with SQLAlchemy (update database.py for proper DuckDB setup)
- [x] Create simplified core models first:
  - [x] `Account` model (basic fields, defer complex holdings)
  - [x] `Category` model (transaction categories)  
  - [x] `Transaction` model (basic version without AI fields)
  - [x] `AccountType` model (asset/liability classification)
- [x] Set up Alembic migrations with proper DuckDB configuration
- [x] Create database initialization script with seed data

**API Foundation:**
- [x] Implement API versioning structure (`/api/v1/`)
- [x] Build core CRUD endpoints:
  - [x] `GET/POST/PUT/DELETE /api/v1/accounts` (full account CRUD)
  - [x] `GET/POST /api/v1/categories` (manage categories)
  - [x] `GET/POST /api/v1/transactions` (basic transaction CRUD)
- [x] Add Pydantic schemas for request/response validation
- [x] Implement basic error handling middleware
- [x] Add database dependency injection pattern

**Testing Foundation:**
- [x] Set up pytest with database fixtures
- [x] Create test database configuration
- [x] Basic API endpoint tests

**Phase 2 Success Criteria:**
- [x] Database created with core tables (verify with DuckDB CLI)
- [x] API endpoints return proper JSON responses
- [x] Can create accounts via API (`POST /api/v1/accounts`)
- [x] Can create transactions via API (`POST /api/v1/transactions`)  
- [x] Frontend can successfully call backend APIs
- [x] Basic form for adding accounts renders
- [x] All tests pass (`pytest` in backend)

**Implementation Notes:**
- DuckDB database successfully created at `backend/data/piggy.db` with proper SQLAlchemy configuration
- Full CRUD API endpoints working with proper Pydantic validation and database relationships
- Seed data includes account types (Checking, Savings, Credit Card) and transaction categories (Groceries, Salary, etc.)
- Database queries showing proper ORM relationships and data persistence
- FastAPI automatic documentation available at `/docs` endpoint

**Demo Capability:** ✅ VERIFIED
Add a bank account, create a transaction, verify data persists across server restarts.

**Defer to Later Phases:**
- Complex holdings/snapshots models → Phase 7
- AI categorization fields → Phase 5  
- Budget-related models → Phase 6

### Phase 3: Account Management ✅ **COMPLETED**
- [x] Build account management UI (add, edit, list accounts)
- [x] Implement account type selection and categorization  
- [x] Create account balance tracking
- [x] Add account deactivation functionality (soft delete)
- [x] Enhanced form validation with real-time feedback
- [x] Confirmation dialogs for critical operations
- [x] Comprehensive error handling and user-friendly messages
- [x] Account reactivation functionality

**Implementation Notes:**
- Soft delete pattern implemented - accounts marked as `is_active=false` instead of hard delete
- ConfirmationDialog component created for reusable user confirmations
- Real-time field-level validation with structured server-side error responses
- Visual indicators for inactive accounts with deactivate/reactivate actions
- Balance history tracking integration for account updates
- Enhanced API validation with detailed error messages

**Demo Capability:** ✅ VERIFIED
Full account lifecycle management with validation, deactivation, and reactivation.

### Phase 4: Transaction Management (Week 3)
**Current Phase** - Detailed Todo List:
1. [ ] Build transaction entry form with account and category selection
2. [ ] Add transaction editing functionality with validation and transaction deletion with confirmation dialog
3. [ ] Create category management interface for adding/editing/deleting categories
4. [ ] Implement transaction listing page with sorting and filtering and search functionality
5. [ ] Add transaction summary statistics (total income, expenses, net) and implement transaction type indicators (income vs expense) with visual styling

### Phase 5: AI Transaction Categorization (Week 3)
- [ ] Build rule-based categorization engine
- [ ] Implement ML categorization model with scikit-learn
- [ ] Create confidence scoring system
- [ ] Add user feedback loop for model improvement
- [ ] Build categorization review UI

### Phase 6: Budget Management (Week 4)
- [ ] Build budget creation and management UI
- [ ] Implement yearly to monthly budget distribution
- [ ] Create budget vs actual tracking
- [ ] Add budget progress visualizations
- [ ] Implement budget rollover functionality

### Phase 7: Net Worth Dashboard (Week 4-5)
- [ ] Build net worth calculation logic
- [ ] Create net worth trend charts with Recharts
- [ ] Implement asset/liability breakdown visualizations
- [ ] Add category-wise breakdowns
- [ ] Build comprehensive dashboard

### Phase 8: Reports & Polish (Week 5)
- [ ] Build spending analysis reports
- [ ] Add date range filtering
- [ ] Implement responsive design
- [ ] Add data export functionality
- [ ] Testing and bug fixes

---

## 🤖 AI Categorization Implementation

```python
# Hybrid categorization system
class TransactionCategorizer:
    def __init__(self):
        self.rule_engine = RuleBasedCategorizer()
        self.ml_model = MLCategorizer()
        self.confidence_threshold = 0.7
    
    def categorize(self, description: str) -> CategoryResult:
        # Try rule-based first (highest confidence)
        rule_result = self.rule_engine.categorize(description)
        if rule_result.confidence > 0.9:
            return rule_result
            
        # Fall back to ML model
        ml_result = self.ml_model.predict(description)
        return ml_result
    
    def learn_from_correction(self, description: str, correct_category: str):
        """Improve model from user corrections"""
        self.ml_model.add_training_example(description, correct_category)
        if len(self.ml_model.training_queue) >= 10:
            self.ml_model.retrain()

# Rule-based categorization for common patterns
class RuleBasedCategorizer:
    def __init__(self):
        self.rules = [
            (r"mcdonalds?|mcd|burger king|kfc", "Eating Out", 0.95),
            (r"amazon|amzn", "Shopping", 0.90),
            (r"gas|shell|exxon|chevron", "Transportation", 0.95),
            (r"grocery|kroger|safeway|whole foods", "Groceries", 0.95),
        ]
```

---

## 🔮 Future Features (Post-MVP)

- **Bank API Integration**: Automatic transaction import via Plaid or similar
- **Advanced AI**: GPT-powered transaction analysis and financial insights
- **Investment Tracking**: Portfolio performance and allocation analysis
- **Bill Reminders**: Recurring transaction notifications
- **Multi-User Support**: Family/household financial tracking
- **Mobile App**: React Native companion app
- **Cloud Deployment**: Multi-user SaaS version
- **Advanced Analytics**: Predictive spending and savings models

---

## 🚦 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn package manager

### Initial Setup Commands
```bash
# Set up backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install fastapi uvicorn sqlalchemy duckdb pandas scikit-learn spacy
pip install alembic pydantic python-multipart

# Set up frontend
cd ../frontend
npx create-react-app . --template typescript
npm install tailwindcss react-router-dom recharts react-hook-form

# Initialize database
cd ../backend
alembic init alembic
# Configure alembic.ini to use DuckDB
```

### 🔄 Database Implementation Strategy

**Phase 2 (MVP Schema):**
- Core entities only: `accounts`, `account_types`, `categories`, `transactions`
- Simple direct relationships
- Basic balance tracking in accounts table

**Phase 6 (Add Budgets):**
- Add `budgets` and `budget_line_items` tables

**Phase 7 (Advanced Holdings Tracking):**
- Implement full `holdings` and `holding_snapshots` architecture
- Migrate from simple account balances to sophisticated tracking
- Create database views for historical aggregation

**Migration Path:**
- Each phase includes Alembic migrations to evolve schema
- Backward compatibility maintained between phases
- Data preservation during schema evolution

### 📦 Dependency Addition Timeline

**Phase 1 (Foundation):** ✅ COMPLETE
- Basic React + TypeScript + Tailwind
- FastAPI + SQLAlchemy + DuckDB  
- Development tooling

**Phase 2 (Core Data):**
- `react-hook-form` - For account/transaction forms
- `axios` - API communication
- Backend: No new dependencies needed

**Phase 3 (Account Management):**
- `react-router-dom` - Navigation between pages

**Phase 5 (AI Categorization):**
- `@tanstack/react-query` - Advanced state management  
- Backend: spaCy and scikit-learn (already included)

**Phase 7 (Dashboard/Charts):**
- `recharts` - Financial visualizations
- `date-fns` - Date manipulation for reports

*Rationale: Prevents dependency bloat and maintains focus per phase*

### 🔧 Development Configuration

**Database Setup (Phase 2):**
```bash
# Configure DuckDB path
mkdir -p data/
# Database will be created automatically at: data/piggy.db

# Set up migrations
cd backend
alembic revision --autogenerate -m "Initial core models" 
alembic upgrade head
```

**Environment Variables:**
```bash
# backend/.env (create this file)
DATABASE_URL=duckdb:///data/piggy.db
DEBUG=true
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

**API Testing:**
```bash
# Test backend health
curl http://localhost:8000/health

# Access automatic API docs  
open http://localhost:8000/docs
```

---

## 📊 Why This Tech Stack?

### Python + FastAPI
- **Familiarity**: You're more comfortable with Python
- **Data Science Ecosystem**: pandas, numpy, scikit-learn for financial analytics
- **Modern API Framework**: FastAPI provides automatic validation, documentation
- **Performance**: FastAPI is one of the fastest Python frameworks

### DuckDB
- **Analytics Optimized**: Perfect for financial reporting and aggregations
- **Fast Queries**: Columnar storage excels at time-series analysis
- **Simple Deployment**: Embedded database like SQLite but faster for analytics
- **SQL Compatible**: Easy migration from/to other databases

### React + TypeScript
- **Type Safety**: Critical for financial data integrity
- **Rich Ecosystem**: Excellent charting and UI libraries
- **Developer Experience**: Great tooling and debugging

---

## 📝 Notes & Considerations

- **Security**: All financial data stored locally initially
- **Data Precision**: Using Decimal types for accurate financial calculations
- **AI Ethics**: User corrections improve personal model, no data shared
- **Performance**: DuckDB's columnar storage optimized for financial queries
- **Scalability**: Architecture supports future cloud deployment
- **Testing Strategy**: Unit tests for business logic, integration tests for API
- **Backup**: Regular database backups for data protection

---

*Last updated: September 4, 2025*
*This document will be updated as the project evolves*