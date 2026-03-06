"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  MagnifyingGlassIcon,
  ArrowLeftIcon,
  DocumentMagnifyingGlassIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  KeyIcon,
  ArrowPathIcon,
  FunnelIcon,
  ChartBarIcon,
  EyeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

export default function ExplorerPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalVolume: 0,
    uniqueMerchants: 0,
    avgTransaction: 0
  })
  const [selectedTx, setSelectedTx] = useState<any>(null)
  const [sortConfig, setSortConfig] = useState<{
    key: string,
    direction: 'asc' | 'desc'
  }>({ key: 'timestamp', direction: 'desc' })

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    if (transactions.length > 0) {
      // Filter transactions based on search
      const filtered = transactions.filter(tx => 
        tx.commitment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.merchantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.amount.toString().includes(searchTerm)
      )
      
      // Sort transactions
      const sorted = [...filtered].sort((a, b) => {
        if (sortConfig.key === 'timestamp') {
          return sortConfig.direction === 'asc' 
            ? a.timestamp - b.timestamp
            : b.timestamp - a.timestamp
        }
        if (sortConfig.key === 'amount') {
          return sortConfig.direction === 'asc'
            ? a.amount - b.amount
            : b.amount - a.amount
        }
        return 0
      })
      
      setFilteredTransactions(sorted)
    }
  }, [transactions, searchTerm, sortConfig])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/transactions")
      const data = await res.json()
      
      setTransactions(data.transactions)
      
      // Calculate stats
      const total = data.transactions.reduce((sum: number, tx: any) => sum + tx.amount, 0)
      const uniqueMerchants = new Set(data.transactions.map((tx: any) => tx.merchantId)).size
      
      setStats({
        totalTransactions: data.transactions.length,
        totalVolume: total,
        uniqueMerchants,
        avgTransaction: total / data.transactions.length || 0
      })
    } catch (error) {
      console.error("Failed to load transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)
    
    if (seconds < 60) return `${seconds} seconds ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  const formatCommitment = (commitment: string) => {
    return `${commitment.slice(0, 8)}...${commitment.slice(-6)}`
  }

  const toggleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-full border border-indigo-100">
            <DocumentMagnifyingGlassIcon className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-medium text-gray-600">Transaction Explorer</span>
          </div>
        </div>

        {/* Title Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 text-transparent bg-clip-text">
            Privacy Transaction Explorer
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            Explore anonymous transactions on the ZK-UPI network. All transactions are publicly verifiable 
            while maintaining complete payer privacy.
          </p>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <ChartBarIcon className="w-8 h-8 text-indigo-500" />
              <span className="text-xs text-gray-400">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.totalTransactions}</p>
            <p className="text-sm text-gray-500">Transactions</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <CurrencyDollarIcon className="w-8 h-8 text-green-500" />
              <span className="text-xs text-gray-400">Volume</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">₹{stats.totalVolume.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Total Volume</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <BuildingStorefrontIcon className="w-8 h-8 text-purple-500" />
              <span className="text-xs text-gray-400">Merchants</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{stats.uniqueMerchants}</p>
            <p className="text-sm text-gray-500">Unique Merchants</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <ClockIcon className="w-8 h-8 text-amber-500" />
              <span className="text-xs text-gray-400">Average</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">₹{Math.round(stats.avgTransaction)}</p>
            <p className="text-sm text-gray-500">Avg Transaction</p>
          </div>
        </motion.div>

        {/* Privacy Explanation Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 rounded-2xl p-6 border border-indigo-100"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 bg-white rounded-xl shadow-sm">
              <ShieldCheckIcon className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                Privacy Architecture
                <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">ZK-Powered</span>
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Transactions are recorded using cryptographic commitments instead of user identities. 
                This allows payments to be verified without revealing who made the payment. Each transaction 
                is publicly visible but the payer remains completely anonymous.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex flex-wrap gap-4 items-center justify-between"
        >
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by commitment, merchant ID, or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all shadow-sm"
            />
          </div>
          
          <button
            onClick={() => loadTransactions()}
            className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ArrowPathIcon className={`w-5 h-5 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm text-gray-600">Refresh</span>
          </button>
        </motion.div>

        {/* Transactions Table Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-indigo-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    <button 
                      onClick={() => toggleSort('commitment')}
                      className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                    >
                      <KeyIcon className="w-4 h-4" />
                      Commitment
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    Merchant ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    <button 
                      onClick={() => toggleSort('amount')}
                      className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                    >
                      <CurrencyDollarIcon className="w-4 h-4" />
                      Amount
                      {sortConfig.key === 'amount' && (
                        <span className="text-xs">
                          {sortConfig.direction === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    <button 
                      onClick={() => toggleSort('timestamp')}
                      className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
                    >
                      <ClockIcon className="w-4 h-4" />
                      Time
                      {sortConfig.key === 'timestamp' && (
                        <span className="text-xs">
                          {sortConfig.direction === 'desc' ? '↓' : '↑'}
                        </span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                    <span className="flex items-center gap-2">
                      <EyeIcon className="w-4 h-4" />
                      Details
                    </span>
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, i) => (
                    <motion.tr 
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedTx(tx)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {formatCommitment(tx.commitment)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-600">
                          {tx.merchantId.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-800">₹{tx.amount}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">
                            {new Date(tx.timestamp).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(tx.timestamp)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          className="p-1 hover:bg-indigo-100 rounded-lg transition-colors"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTx(tx)
                          }}
                        >
                          <EyeIcon className="w-4 h-4 text-indigo-500" />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <DocumentMagnifyingGlassIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No transactions found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <ShieldCheckIcon className="w-3 h-3" />
              All transactions are anonymized
            </p>
          </div>
        </motion.div>

        {/* Transaction Detail Modal */}
        <AnimatePresence>
          {selectedTx && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedTx(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
                  <h3 className="text-lg font-semibold text-white">Transaction Details</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Commitment Hash</label>
                      <div className="p-3 bg-gray-50 rounded-lg font-mono text-xs break-all">
                        {selectedTx.commitment}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Merchant ID</label>
                        <div className="p-3 bg-gray-50 rounded-lg font-mono text-xs">
                          {selectedTx.merchantId}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Amount</label>
                        <div className="p-3 bg-green-50 rounded-lg font-medium text-green-700">
                          ₹{selectedTx.amount}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Timestamp</label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        {new Date(selectedTx.timestamp).toLocaleString()}
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg flex items-start gap-2">
                      <InformationCircleIcon className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-indigo-700">
                        This transaction is publicly visible but the payer remains anonymous. 
                        The commitment hash cannot be linked to any identity.
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedTx(null)}
                    className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  )
}