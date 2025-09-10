const BarChart = ({ data }) => {
  const maxCount = Math.max(...data.map((item) => item.count))

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          <div className="w-20 text-sm text-slate-600 font-medium">${item.range}</div>
          <div className="flex-1 bg-slate-200 rounded-full h-6 relative overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-500 to-violet-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%` }}
            >
              {item.count > 0 && <span className="text-white text-xs font-medium">{item.count}</span>}
            </div>
          </div>
          <div className="w-12 text-sm text-slate-900 font-semibold text-right">{item.count}</div>
        </div>
      ))}
    </div>
  )
}

export default BarChart
