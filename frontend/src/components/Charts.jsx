"use client"

import { useState, useEffect } from "react"
import BarChart from "./BarChart"
import PieChart from "./PieChart"

const Charts = ({ selectedMonth }) => {
  const [barChartData, setBarChartData] = useState([])
  const [pieChartData, setPieChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChartData()
  }, [selectedMonth])

  const fetchChartData = async () => {
    try {
      setLoading(true)
      const [barResponse, pieResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/bar-chart?month=${selectedMonth}`),
        fetch(`http://localhost:5000/api/pie-chart?month=${selectedMonth}`),
      ])

      const barData = await barResponse.json()
      const pieData = await pieResponse.json()

      // ✅ Ensure both are arrays
      setBarChartData(Array.isArray(barData) ? barData : barData.data || [])
      setPieChartData(Array.isArray(pieData) ? pieData : pieData.data || [])
    } catch (error) {
      console.error("Error fetching chart data:", error)
      setBarChartData([])
      setPieChartData([])
    } finally {
      setLoading(false)
    }
  }

  const monthName = new Date(2024, selectedMonth - 1).toLocaleString("default", { month: "long" })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="h-6 bg-slate-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="h-64 bg-slate-200 rounded animate-pulse"></div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
            <div className="h-6 bg-slate-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="h-64 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Charts & Analytics</h2>
        <p className="text-slate-600">Visual representation of data for {monthName} 2024</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Price Range Distribution</h3>
          <BarChart data={barChartData} />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Category Distribution</h3>
          <PieChart data={pieChartData} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Price Range Insights</h3>
          <div className="space-y-3">
            {barChartData.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-slate-600">${item.range}</span>
                <span className="font-semibold text-slate-900">{item.count} items</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Categories</h3>
          <div className="space-y-3">
            {pieChartData.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-slate-600">{item.category}</span>
                <span className="font-semibold text-slate-900">{item.count} items</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Charts
