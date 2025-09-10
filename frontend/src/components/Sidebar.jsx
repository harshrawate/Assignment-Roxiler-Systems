"use client"

import { LayoutDashboard, Table, BarChart3, PieChart, X } from "lucide-react"

const Sidebar = ({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "transactions", label: "Transactions", icon: Table },
    { id: "statistics", label: "Statistics", icon: BarChart3 },
    { id: "charts", label: "Charts", icon: PieChart },
  ]

  return (
    <aside
      className={`
      fixed top-0 left-0 z-50 w-64 h-full bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
      ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0
    `}
    >
      <div className="flex items-center justify-between p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">R</span>
          </div>
          <span className="font-semibold text-slate-900">Roxiler</span>
        </div>

        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id

            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                    ${
                      isActive
                        ? "bg-violet-100 text-violet-700 font-medium"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
