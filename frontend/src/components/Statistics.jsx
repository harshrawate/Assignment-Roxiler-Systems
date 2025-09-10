"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"

const Statistics = ({ selectedMonth }) => {
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

      // ✅ Ensure defaults if API misses values
      setStatistics({
        totalSaleAmount: typeof data.totalSaleAmount === "number" ? data.totalSaleAmount : 0,
        totalSoldItems: typeof data.totalSoldItems === "number" ? data.totalSoldItems : 0,
        totalNotSoldItems: typeof data.totalNotSoldItems === "number" ? data.totalNotSoldItems : 0,
      })
    } catch (error) {
      console.error("Error fetching statistics:", error)
      setStatistics({ totalSaleAmount: 0, totalSoldItems: 0, totalNotSoldItems: 0 })
    } finally {
      setLoading(false)
    }
  }

  const monthName = new Date(2024, selectedMonth - 1).toLocaleString("default", { month: "long" })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-64 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
              <div className="h-12 bg-slate-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const totalItems = statistics.totalSoldItems + statistics.totalNotSoldItems
  const conversionRate = totalItems > 0 ? (statistics.totalSoldItems / totalItems) * 100 : 0
  const averageSaleValue = statistics.totalSoldItems > 0
    ? statistics.totalSaleAmount / statistics.totalSoldItems
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Statistics</h2>
        <p className="text-slate-600">Detailed statistics for {monthName} 2024</p>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Sale Amount */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">Total Sale Amount</h3>
          <p className="text-3xl font-bold text-green-900">
            ${typeof statistics.totalSaleAmount === "number" ? statistics.totalSaleAmount.toFixed(2) : "0.00"}
          </p>
          <p className="text-sm text-green-700 mt-2">Revenue generated this month</p>
        </div>

        {/* Total Sold Items */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-8 border border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Sold Items</h3>
          <p className="text-3xl font-bold text-blue-900">{statistics.totalSoldItems}</p>
          <p className="text-sm text-blue-700 mt-2">Items successfully sold</p>
        </div>

        {/* Total Not Sold Items */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-8 border border-orange-200">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <TrendingDown className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-orange-800 mb-2">Total Not Sold Items</h3>
          <p className="text-3xl font-bold text-orange-900">{statistics.totalNotSoldItems}</p>
          <p className="text-sm text-orange-700 mt-2">Items still in inventory</p>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Conversion Rate</span>
              <span className="font-semibold text-slate-900">{conversionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${conversionRate}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-600">Average Sale Value</span>
              <span className="font-semibold text-slate-900">
                ${typeof averageSaleValue === "number" ? averageSaleValue.toFixed(2) : "0.00"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Total Items</span>
              <span className="font-semibold text-slate-900">{totalItems}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Sales Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-slate-600">Sold Items</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-slate-900">{statistics.totalSoldItems}</div>
                <div className="text-sm text-slate-500">
                  {totalItems > 0 ? ((statistics.totalSoldItems / totalItems) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-slate-600">Not Sold Items</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-slate-900">{statistics.totalNotSoldItems}</div>
                <div className="text-sm text-slate-500">
                  {totalItems > 0 ? ((statistics.totalNotSoldItems / totalItems) * 100).toFixed(1) : 0}%
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="flex justify-between items-center">
                <span className="font-medium text-slate-700">Revenue per Item</span>
                <span className="font-semibold text-slate-900">
                  ${totalItems > 0 && typeof statistics.totalSaleAmount === "number"
                    ? (statistics.totalSaleAmount / totalItems).toFixed(2)
                    : "0.00"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Statistics
