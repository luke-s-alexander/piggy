import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'dashboard' },
  { name: 'Accounts', href: '/accounts', icon: 'account_balance' },
  { name: 'Transactions', href: '/transactions', icon: 'currency_exchange' },
  { name: 'Categories', href: '/categories', icon: 'label' },
  { name: 'Budget', href: '/budget', icon: 'savings' },
  { name: 'Reports', href: '/reports', icon: 'query_stats' },
]

export default function Navigation() {
  const location = useLocation()

  return (
    <div className="bg-primary text-white w-64 min-h-screen">
      <div className="p-4">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🐷</span>
          Piggy
        </h1>
      </div>
      <nav className="mt-8">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-r-3xl mr-4 transition-colors',
                  location.pathname === item.href
                    ? 'bg-secondary text-white'
                    : 'text-white/80 hover:bg-secondary/80 hover:text-white'
                )}
              >
                <span className="material-icons text-lg">{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}