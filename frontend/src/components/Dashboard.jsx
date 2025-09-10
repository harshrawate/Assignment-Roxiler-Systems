"use client"

import { useState, useEffect } from "react"
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react"

const Dashboard = ({ selectedMonth }) => {
  const [statistics, setStatistics] = useState({
    totalSaleAmount: 0,
    totalSoldItems: 0,
    totalNotSoldItems: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStatistics()
  }, [selectedMonth])

  const fetchStatistics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/statistics?month=${selectedMonth}`)
      const data = await response.json()
      console.log("API response:", data)

      // ✅ Handle both possible shapes: {totalSaleAmount,...} or {statistics:{...}}
      if (data.statistics) {
        setStatistics(data.statistics)
      } else {
        setStatistics(data)
      }
    } catch (error) {
      console.error("Error fetching statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      title: "Total Sales",
      value: `$${(statistics.totalSaleAmount ?? 0).toFixed(2)}`,
      icon: DollarSign,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      title: "Items Sold",
      value: statistics.totalSoldItems ?? 0,
      icon: ShoppingCart,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "Items Not Sold",
      value: statistics.totalNotSoldItems ?? 0,
      icon: Package,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
    },
    {
      title: "Total Items",
      value: (statistics.totalSoldItems ?? 0) + (statistics.totalNotSoldItems ?? 0),
      icon: TrendingUp,
      color: "bg-violet-500",
      bgColor: "bg-violet-50",
      textColor: "text-violet-700",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 animate-pulse">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-slate-200 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard Overview</h2>
        <p className="text-slate-600">
          Monthly statistics for {new Date(2024, selectedMonth - 1).toLocaleString("default", { month: "long" })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={index}
              className={`${card.bgColor} rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Sales Conversion Rate</span>
              <span className="font-semibold text-slate-900">
                {statistics.totalSoldItems + statistics.totalNotSoldItems > 0
                  ? (
                      ((statistics.totalSoldItems ?? 0) /
                        ((statistics.totalSoldItems ?? 0) + (statistics.totalNotSoldItems ?? 0))) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    statistics.totalSoldItems + statistics.totalNotSoldItems > 0
                      ? ((statistics.totalSoldItems ?? 0) /
                          ((statistics.totalSoldItems ?? 0) + (statistics.totalNotSoldItems ?? 0))) *
                        100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Average Sale Value</span>
              <span className="font-semibold text-slate-900">
                $
                {statistics.totalSoldItems > 0
                  ? ((statistics.totalSaleAmount ?? 0) / (statistics.totalSoldItems ?? 0)).toFixed(2)
                  : "0.00"}
              </span>
            </div>
            <div className="text-sm text-slate-500">Based on {statistics.totalSoldItems ?? 0} sold items</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
