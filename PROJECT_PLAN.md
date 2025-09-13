# Piggy - Personal Finance App
**Project Plan & Architecture Document**

## 📊 Current Status

🚀 **Phase 1 Complete**: Development environment fully set up and operational  
🚀 **Phase 2 Complete**: Core Data Layer - Database models, API routes, and migrations implemented  
🚀 **Phase 3 Complete**: Account Management - Enhanced UI, validation, soft delete, and user interactions  
🚀 **Phase 4 Complete**: Transaction Management - Full CRUD operations, category management, and search functionality  
🚀 **Phase 5 Complete**: Budget Management - Yearly budgets, monthly tracking, dashboard with YTD calculations  
🚀 **Phase 6 Complete**: Bulk Import & Enhanced Transaction Management - Table view, bulk operations, CSV import, enhanced search  

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
- **PostgreSQL** - Robust relational database with ACID compliance for reliable financial data
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
│   │   │   ├── accounts.py      # ✅ Implemented
│   │   │   ├── transactions.py # ✅ Implemented  
│   │   │   ├── budget.py       # ✅ Implemented
│   │   │   ├── categories.py   # ✅ Implemented
│   │   │   ├── account_types.py # ✅ Implemented
│   │   │   └── reports.py      # 🔄 Future
│   │   ├── models/             # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── account.py      # ✅ Implemented
│   │   │   ├── transaction.py  # ✅ Implemented
│   │   │   ├── budget.py       # ✅ Implemented
│   │   │   ├── category.py     # ✅ Implemented
│   │   │   ├── account_type.py # ✅ Implemented
│   │   │   └── balance_history.py # ✅ Implemented (not holdings-based)
│   │   ├── services/           # Business logic
│   │   │   ├── __init__.py
│   │   │   └── budget_service.py # ✅ Only service implemented so far
│   │   ├── ml/                 # 🔄 Future - AI categorization components
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
└── data/                        # ML model storage
    └── models/                  # ML model storage (PostgreSQL database hosted separately)
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
-- Account types for categorization (✅ IMPLEMENTED)
CREATE TABLE account_types (
    id UUID PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,  -- "Checking", "Credit Card", "Investment"
    category VARCHAR NOT NULL,     -- "ASSET" or "LIABILITY"
    sub_category VARCHAR NOT NULL, -- "cash", "investment", "debt", "real_estate"
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Financial accounts (✅ IMPLEMENTED)
CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,          -- "Chase Checking", "Wealthsimple RRSP"
    account_type_id UUID NOT NULL,
    balance DECIMAL(12, 2) NOT NULL, -- Current balance (updated directly)
    institution VARCHAR,            -- "Chase Bank", "Wealthsimple"
    account_number VARCHAR,         -- Last 4 digits
    currency VARCHAR DEFAULT 'CAD', -- Account currency
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (account_type_id) REFERENCES account_types(id)
);

-- Balance history tracking (✅ IMPLEMENTED - simpler approach than holdings)
CREATE TABLE balance_history (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL,
    previous_balance DECIMAL(12, 2) NOT NULL, -- Balance before change
    new_balance DECIMAL(12, 2) NOT NULL,      -- Balance after change  
    change_amount DECIMAL(12, 2) NOT NULL,    -- Amount of change (+/-)
    change_reason VARCHAR,                    -- "manual_update", "transaction", "correction"
    notes TEXT,                               -- Additional context
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

-- Transaction categories (✅ IMPLEMENTED)
CREATE TABLE categories (
    id UUID PRIMARY KEY,
    name VARCHAR UNIQUE NOT NULL,   -- "Groceries", "Salary", "Utilities"
    type VARCHAR NOT NULL,          -- "INCOME" or "EXPENSE"
    color VARCHAR,                  -- For UI visualization
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Individual transactions (✅ IMPLEMENTED)
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    account_id UUID NOT NULL,
    category_id UUID NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    description VARCHAR NOT NULL,
    transaction_date DATE NOT NULL,
    type VARCHAR NOT NULL,          -- "INCOME" or "EXPENSE"
    ai_category_id UUID,            -- AI suggested category (prepared for future)
    ai_confidence FLOAT,            -- Confidence score 0.0-1.0 (prepared for future)
    is_ai_categorized BOOLEAN DEFAULT false,  -- (prepared for future)
    user_corrected BOOLEAN DEFAULT false,     -- For ML training (prepared for future)
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (account_id) REFERENCES accounts(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (ai_category_id) REFERENCES categories(id)
);

-- Yearly budgets (✅ IMPLEMENTED)
CREATE TABLE budgets (
    id UUID PRIMARY KEY,
    year INTEGER NOT NULL,
    name VARCHAR NOT NULL,          -- "2024 Budget"
    total_amount DECIMAL(12, 2) NOT NULL,
    is_active BOOLEAN DEFAULT false, -- Only one active budget per year
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Budget allocation per category (✅ IMPLEMENTED)
CREATE TABLE budget_line_items (
    id UUID PRIMARY KEY,
    budget_id UUID NOT NULL,
    category_id UUID NOT NULL,
    yearly_amount DECIMAL(12, 2) NOT NULL,
    monthly_amount DECIMAL(12, 2) NOT NULL, -- yearly_amount / 12
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (budget_id) REFERENCES budgets(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    UNIQUE(budget_id, category_id)
);

-- Categorization rules and patterns (🔄 FUTURE - for AI implementation)
CREATE TABLE categorization_rules (
    id UUID PRIMARY KEY,
    pattern VARCHAR NOT NULL,       -- "McDonald's", "AMZN", etc.
    category_id UUID NOT NULL,
    confidence FLOAT NOT NULL,      -- Rule confidence
    is_user_defined BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### Historical Balance Tracking (Simple Approach)

**Current Implementation:** Simple balance change tracking via `balance_history`  
**Future Enhancement:** Could expand to holdings-based tracking for investment accounts  
**Performance:** Direct queries against balance_history for account balance trends  

```sql
-- Example: Account balance trends over time
SELECT 
    a.name as account_name,
    bh.created_at::date as date,
    bh.new_balance,
    bh.change_amount,
    bh.change_reason
FROM balance_history bh
JOIN accounts a ON bh.account_id = a.id
WHERE a.id = ?
ORDER BY bh.created_at;

-- Example: Net worth calculation (current implementation)
SELECT 
    SUM(CASE WHEN at.category = 'ASSET' THEN a.balance ELSE 0 END) as total_assets,
    SUM(CASE WHEN at.category = 'LIABILITY' THEN a.balance ELSE 0 END) as total_liabilities,
    SUM(CASE WHEN at.category = 'ASSET' THEN a.balance ELSE 0 END) - 
    SUM(CASE WHEN at.category = 'LIABILITY' THEN a.balance ELSE 0 END) as net_worth
FROM accounts a
JOIN account_types at ON a.account_type_id = at.id
WHERE a.is_active = true;
```

### Example Queries for Current Use Cases

```sql
-- Transaction analysis by category and date range
SELECT 
    c.name as category,
    c.type,
    SUM(t.amount) as total_amount,
    COUNT(*) as transaction_count,
    AVG(t.amount) as avg_amount
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.transaction_date BETWEEN '2024-01-01' AND '2024-12-31'
GROUP BY c.id, c.name, c.type
ORDER BY total_amount DESC;

-- Monthly budget vs actual analysis
SELECT 
    EXTRACT(month from t.transaction_date) as month,
    c.name as category,
    bli.monthly_amount as budgeted,
    COALESCE(SUM(t.amount), 0) as actual_spent,
    bli.monthly_amount - COALESCE(SUM(t.amount), 0) as remaining
FROM budget_line_items bli
JOIN categories c ON bli.category_id = c.id
JOIN budgets b ON bli.budget_id = b.id
LEFT JOIN transactions t ON c.id = t.category_id 
    AND t.type = 'EXPENSE'
    AND EXTRACT(year from t.transaction_date) = b.year
    AND EXTRACT(month from t.transaction_date) = 1  -- Example for January
WHERE b.is_active = true
GROUP BY month, c.id, c.name, bli.monthly_amount
ORDER BY category;
```

---

## 🚀 Development Phases

### Phase 1: Project Setup & Foundation ✅ **COMPLETED**
- [x] Initialize frontend (React + TypeScript + Tailwind)
- [x] Initialize backend (Python + FastAPI)
- [x] Set up PostgreSQL database with SQLAlchemy
- [x] Create basic project structure and build scripts
- [x] Set up development environment and tooling

**Implementation Notes:**
- Node.js upgraded to v22.19.0 for Vite 7.x compatibility
- Fixed Tailwind PostCSS configuration with @tailwindcss/postcss plugin
- Both development servers running with hot reload (backend:8000, frontend:5173)
- FastAPI automatic documentation available at /docs endpoint
- Alembic migrations configured for database schema management
- **Database Migration**: Successfully migrated from DuckDB to PostgreSQL for better ACID compliance and transactional reliability

### Phase 2: Core Data Layer ✅ **COMPLETED**
**Database Implementation:**
- [x] Configure PostgreSQL with SQLAlchemy (migrated from DuckDB for better ACID compliance)
- [x] Create simplified core models first:
  - [x] `Account` model (basic fields, defer complex holdings)
  - [x] `Category` model (transaction categories)  
  - [x] `Transaction` model (basic version without AI fields)
  - [x] `AccountType` model (asset/liability classification)
- [x] Set up Alembic migrations with proper PostgreSQL configuration
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
- PostgreSQL database successfully configured with proper SQLAlchemy configuration and native UUID support
- Full CRUD API endpoints working with proper Pydantic validation and database relationships
- Seed data includes account types (Checking, Savings, Credit Card) and transaction categories (Groceries, Salary, etc.)
- Database queries showing proper ORM relationships and data persistence
- FastAPI automatic documentation available at `/docs` endpoint
- **Migration Benefits**: Fixed constraint violation issues that occurred with DuckDB's OLAP architecture during UPDATE operations

**Defer to Later Phases:**
- AI categorization fields → Phase 10  
- Budget-related models → Phase 5

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


### Phase 4: Transaction Management ✅ **COMPLETED**
- [X] Build transaction entry form with account and category selection
- [X] Add transaction editing functionality with validation and transaction deletion with confirmation dialog
- [X] Create category management interface for adding/editing/deleting categories
- [X] Implement transaction listing page with sorting and filtering and search functionality
- [X] Add transaction summary statistics (total income, expenses, net) and implement transaction type indicators (income vs expense) with visual styling

**Implementation Notes:**
- Full CRUD operations for transactions with proper validation
- Category management with add/edit/delete functionality
- Advanced search and filtering capabilities
- Transaction type indicators with visual styling
- Confirmation dialogs for critical operations

### Phase 5: Budget Management ✅ **COMPLETED**
- [X] Build budget creation and management UI
- [X] Implement yearly to monthly budget distribution
- [X] Create budget vs actual tracking with YTD calculations
- [X] Add budget progress visualizations and dashboard
- [X] Active budget management (only one active per year)
- [X] Editing existing budgets: add categories, change amounts and set budget active/inactive
- [X] Annual/monthly toggle functionality across all components
- [X] Visual styling: off target rows in red, on target in green, near target yellow

**Implementation Notes:**
- Complete budget service with dashboard data aggregation
- YTD (Year-to-Date) calculations through any selected month
- Visual progress indicators and color-coded budget status
- BudgetDashboard and BudgetDetails components with comprehensive UI

### Phase 6: Bulk Import & Enhanced Transaction Management ✅ **COMPLETED**
- [X] Redesign transaction page for faster editing: 
  - [X] use a table format with headers. control sorting using header. make header sticky on scroll through table. 
  - [X] filter on transaction date, category, etc. 
  - [X] Edit fields directly from main listing page 
  - [X] condense design to fit more transactions per page
- [X] Bulk load transactions using standard csv template
- [X] Edit multiple transactions at once.
- [X] Enhanced search by description, category, and account name

**Implementation Notes:**
- Complete transaction table redesign with sortable headers and inline editing
- Advanced filtering system with date ranges, amounts, accounts, and categories
- Bulk operations: select multiple transactions for editing or deletion
- CSV import with preview functionality and error validation
- Enhanced search across description, account names, and category names
- Bulk edit modal with intuitive UX for field selection and value input
- Transaction summary statistics with real-time filtering updates

### Phase 7: Net Worth Dashboard
- [ ] Build net worth calculation logic
- [ ] Create net worth trend charts with Recharts
- [ ] Implement asset/liability breakdown visualizations
- [ ] Add category-wise breakdowns
- [ ] Build comprehensive dashboard

### Phase 8: Reports & Polish
- [ ] Build spending analysis reports
- [ ] Add date range filtering
- [ ] Implement responsive design
- [ ] Testing and bug fixes

### Phase 9: Advanced transactions import
- [ ] Load transaction file formats from popular banks
    - User selects their bank on import modal
    - System has knowledge of the transaction export file formats for each bank
    - System automatically maps fields in the imported file correctly based on the bank
- [ ] Testing and bug fixes

### Phase 10: AI Transaction Categorization
- [ ] Build rule-based categorization engine
- [ ] Implement ML categorization model with scikit-learn
- [ ] Create confidence scoring system
- [ ] Add user feedback loop for model improvement
- [ ] Build categorization review UI

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
pip install fastapi uvicorn sqlalchemy psycopg2-binary asyncpg pandas scikit-learn spacy
pip install alembic pydantic python-multipart

# Set up frontend
cd ../frontend
npx create-react-app . --template typescript
npm install tailwindcss react-router-dom recharts react-hook-form

# Initialize database
cd ../backend
alembic init alembic
# Configure alembic.ini to use PostgreSQL
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
# Configure PostgreSQL
# Ensure PostgreSQL is running and database 'piggy_dev' exists
# Connection: postgresql://piggy:piggy@localhost:5432/piggy_dev

# Set up migrations
cd backend
alembic revision --autogenerate -m "Initial core models" 
alembic upgrade head
```

**Environment Variables:**
```bash
# backend/.env (create this file)
DATABASE_URL=postgresql://piggy:piggy@localhost:5432/piggy_dev
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

### PostgreSQL
- **ACID Compliance**: Essential for financial data integrity and consistency
- **Mature Ecosystem**: Robust, battle-tested database with excellent tooling
- **Advanced Features**: Native UUID support, excellent indexing, and full SQL compliance
- **Scalability**: Handles both transactional and analytical workloads efficiently
- **Reliability**: Superior handling of concurrent transactions and constraint enforcement

### React + TypeScript
- **Type Safety**: Critical for financial data integrity
- **Rich Ecosystem**: Excellent charting and UI libraries
- **Developer Experience**: Great tooling and debugging

---

## 📝 Notes & Considerations

- **Security**: All financial data stored locally initially
- **Data Precision**: Using Decimal types for accurate financial calculations
- **AI Ethics**: User corrections improve personal model, no data shared
- **Performance**: PostgreSQL's mature query optimizer and indexing for reliable financial operations
- **Scalability**: Architecture supports future cloud deployment
- **Testing Strategy**: Unit tests for business logic, integration tests for API
- **Backup**: Regular database backups for data protection

---

*Last updated: September 9, 2025*
*This document will be updated as the project evolves*
