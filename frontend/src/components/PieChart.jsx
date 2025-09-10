const PieChart = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0)
  const colors = [
    "bg-violet-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-indigo-500",
    "bg-pink-500",
  ]

  return (
    <div className="space-y-4">
      {/* Simple visual representation */}
      <div className="grid grid-cols-2 gap-4">
        {data.map((item, index) => {
          const percentage = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0
          return (
            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{item.category}</div>
                <div className="text-xs text-slate-600">
                  {percentage}% ({item.count} items)
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress bars for better visualization */}
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.count / total) * 100 : 0
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">{item.category}</span>
                <span className="text-slate-900 font-medium">{item.count}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${colors[index % colors.length].replace("bg-", "bg-")}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default PieChart
