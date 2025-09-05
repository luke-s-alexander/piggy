# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Piggy is a personal finance web application for tracking spending, income, and net worth with AI-powered transaction categorization. The project follows a monorepo structure with React TypeScript frontend and Python FastAPI backend using DuckDB for analytical queries.

## Workflow
- Always use a todo list and solve sequentially

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Recharts + React Router
- **Backend**: Python 3.11+ + FastAPI + SQLAlchemy + DuckDB + Alembic
- **AI/ML**: spaCy + scikit-learn + pandas (or OpenAI API alternative)
- **Testing**: pytest (backend), Jest (frontend)

### Project Structure
```
piggy/
├── frontend/          # React TypeScript app
├── backend/           # Python FastAPI app
│   ├── app/
│   │   ├── api/       # API routes (accounts, transactions, budget, etc.)
│   │   ├── models/    # SQLAlchemy models
│   │   ├── services/  # Business logic layer
│   │   ├── ml/        # AI categorization (categorizer, rules_engine, model_trainer)
│   │   ├── core/      # Configuration and database setup
│   │   └── utils/     # Helper functions
│   └── alembic/       # Database migrations
└── data/              # DuckDB database and ML model storage
```

### Core Database Entities
- **accounts**: Financial accounts with account_type classification (asset/liability)
- **holdings**: Individual assets within accounts (XIC ETF, cash positions, etc.)
- **transactions**: Financial transactions with AI categorization fields (ai_category_id, ai_confidence, user_corrected)
- **budgets + budget_line_items**: Yearly budgets with monthly distribution
- **categories**: Transaction categories with income/expense types
- **categorization_rules**: Rule-based patterns for AI categorization

### Historical Tracking (Hybrid Approach)
- **holding_snapshots**: Single source of truth for all historical balance data
- **Database views**: Aggregate holdings into account/account-type/net-worth levels without storage overhead
- **Benefits**: Data consistency, query simplicity, DuckDB analytical performance

## Development Commands

Since this is a new project, standard commands will be:

### Backend (when implemented)
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload  # Run development server
pytest                        # Run tests
alembic upgrade head          # Apply database migrations
```

### Frontend (when implemented)  
```bash
cd frontend
npm install
npm run dev                   # Run development server
npm run build                # Build for production
npm test                     # Run tests
npm run lint                 # Lint code
```

## AI Categorization System

The project uses a hybrid AI approach:
1. **Rule-based categorizer**: High-confidence pattern matching (McDonald's → Eating Out)
2. **ML categorizer**: scikit-learn model that learns from user corrections
3. **Confidence scoring**: Transactions below threshold require manual review
4. **Learning loop**: User corrections improve the ML model over time

Key implementation in `backend/app/ml/categorizer.py`:
- `TransactionCategorizer` orchestrates rule-based and ML approaches
- `RuleBasedCategorizer` handles common merchant patterns  
- ML model retrains every 10 user corrections

## Financial Data Considerations

- Use `Decimal(12, 2)` for all monetary values to ensure precision
- DuckDB is optimized for analytical queries (reports, aggregations, time-series)
- Net worth = total assets - total liabilities, tracked over time
- Budget amounts distribute yearly allocation across 12 months automatically
- Transaction categories must align between budgets and actual spending

## Development Phases

Current status: **Phase 1** (Project Setup)

The project is planned in 8 phases:
1. **Foundation**: Set up frontend/backend structure and tooling
2. **Data Layer**: Database schema, models, basic API routes  
3. **Account Management**: Add/edit accounts with asset/liability categorization
4. **Transaction Management**: CRUD operations with category assignment
5. **AI Categorization**: Implement hybrid rule-based + ML system
6. **Budget Management**: Yearly budgets with monthly tracking
7. **Net Worth Dashboard**: Visualizations and trend analysis
8. **Reports & Polish**: Advanced analytics and final touches

Refer to PROJECT_PLAN.md for detailed phase breakdown and user stories.

## Git and Repository Management

### CRITICAL: Never Commit Dependencies or Generated Files

**Golden Rule**: If it can be regenerated from other files in the repo (like `requirements.txt` or `package.json`), it should NOT be committed.

### ❌ NEVER Commit These:
- **Python**: `venv/`, `__pycache__/`, `*.pyc`, `*.pyo`, `.env`
- **Node.js**: `node_modules/`, `npm-debug.log*`, `yarn-error.log*`
- **Build outputs**: `dist/`, `build/`, `.next/`, coverage reports
- **IDE files**: `.vscode/`, `.idea/`, `*.swp`, `.DS_Store`
- **Database files**: `*.db`, `*.sqlite`, `data/*.duckdb` (unless sample data)
- **Logs**: `*.log`, `logs/`

### ✅ Safe Git Workflow:
1. **Always check before committing**:
   ```bash
   git status              # See what's staged
   git diff --staged      # Review all changes
   ```

2. **Add files selectively** (avoid `git add .` unless certain):
   ```bash
   git add backend/app/ backend/requirements.txt  # Specific paths
   git add frontend/src/ frontend/package.json    # Not node_modules/
   ```

3. **Trust the .gitignore**: The project has comprehensive ignore rules, but verify large commits

### Why This Matters:
- **Repository size**: Dependencies can add 100MB+ per commit
- **Push failures**: GitHub rejects pushes over ~100MB
- **Cross-platform issues**: Compiled dependencies don't work across systems  
- **Version conflicts**: Different developers may have different dependency versions

### Recovery from Mistakes:
If you accidentally commit large files:
```bash
# Remove from staging (before commit)
git restore --staged problematic-directory/

# Remove from last commit (after commit, before push)
git reset --soft HEAD~1

# For already pushed commits, use git-filter-branch or BFG Repo Cleaner
```

**Remember**: Dependencies are meant to be ephemeral and recreatable. Source code is permanent and valuable.