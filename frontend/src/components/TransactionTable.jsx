"use client"

import { useState, useEffect } from "react"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

const TransactionTable = ({ selectedMonth, searchTerm, setSearchTerm }) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 10

  useEffect(() => {
    fetchTransactions()
  }, [selectedMonth, searchTerm, currentPage])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `http://localhost:5000/api/transactions?page=${currentPage}&limit=${itemsPerPage}&search=${searchTerm}&month=${selectedMonth}`,
      )
      const data = await response.json()
      console.log("API response:", data)

      // Safe fallback values
      setTransactions(Array.isArray(data.transactions) ? data.transactions : [])
      setTotalPages(data.totalPages || 1)
      setTotalCount(data.totalCount || 0)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setTransactions([])
      setTotalPages(1)
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="h-6 bg-slate-200 rounded w-48 mb-4 animate-pulse"></div>
          <div className="h-10 bg-slate-200 rounded w-80 animate-pulse"></div>
        </div>
        <div className="p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 py-4 border-b border-slate-100 last:border-b-0">
              <div className="h-4 bg-slate-200 rounded flex-1 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded w-16 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Transactions</h2>
        <p className="text-slate-600">Manage and view all transaction records</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-slate-600">
              Showing {Array.isArray(transactions) ? transactions.length : 0} of {totalCount || 0} transactions
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">ID</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Title</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Description</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Price</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Category</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Status</th>
                <th className="text-left py-3 px-6 font-semibold text-slate-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(transactions) && transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-4 px-6 text-slate-900 font-medium">#{transaction.id}</td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-900 truncate max-w-xs">{transaction.title || "N/A"}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-slate-600 truncate max-w-xs">{transaction.description || "—"}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      ${typeof transaction.price === "number" ? transaction.price.toFixed(2) : "0.00"}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {transaction.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.sold ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {transaction.sold ? "Sold" : "Not Sold"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {transaction.dateOfSale
                        ? new Date(transaction.dateOfSale).toLocaleDateString()
                        : "No Date"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-slate-500">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + Math.max(1, currentPage - 2)
              if (page > totalPages) return null

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? "bg-violet-600 text-white"
                      : "border border-slate-300 hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {page}
                </button>
              )
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionTable
