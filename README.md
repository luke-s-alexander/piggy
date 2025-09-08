# Piggy

A personal finance web application for tracking spending, income, and net worth with AI-powered transaction categorization.

## Features

- **Account Management**: Track multiple financial accounts (checking, savings, credit cards, investments)
- **Transaction Tracking**: Log and categorize financial transactions
- **AI Categorization**: Automated transaction categorization with machine learning
- **Budget Management**: Set and track budgets with monthly breakdowns
- **Net Worth Dashboard**: Visualize financial trends over time
- **Multi-Currency Support**: Handle different currencies

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Recharts
- **Backend**: Python FastAPI + SQLAlchemy + PostgreSQL
- **AI/ML**: scikit-learn + spaCy for transaction categorization

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### Backend Setup

```bash
# Clone the repository
gh repo clone luke-s-alexander/piggy
cd piggy/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the development server (includes automatic database initialization)
uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

```bash
# In a new terminal
cd piggy/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Documentation

Once the backend is running, visit:
- **Interactive API docs**: http://localhost:8000/docs
- **Alternative docs**: http://localhost:8000/redoc

## Development

### Database

The application uses PostgreSQL. The database is automatically initialized with:
- Default account types (Checking, Savings, Credit Card, Investment, etc.)
- Transaction categories (Groceries, Entertainment, Salary, etc.)

Database file location: `backend/data/piggy.db`

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Frontend tests  
cd frontend
npm test
```

### Project Structure

```
piggy/
├── backend/           # Python FastAPI application
│   ├── app/
│   │   ├── api/       # API routes
│   │   ├── models/    # Database models
│   │   ├── services/  # Business logic
│   │   └── core/      # Configuration
│   └── data/          # Database files
└── frontend/          # React TypeScript application
    └── src/
        ├── components/  # React components
        ├── types/      # TypeScript definitions
        └── services/   # API client
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
