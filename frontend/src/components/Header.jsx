"use client"

import { Menu, Calendar } from "lucide-react"

const Header = ({ selectedMonth, setSelectedMonth, months, setSidebarOpen }) => {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">Roxiler Systems</h1>
            <p className="text-sm text-slate-600">Transaction Management Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-600" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number.parseInt(e.target.value))}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}

export default Header
