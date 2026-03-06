"use client"
export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  BuildingStorefrontIcon,
  QrCodeIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'

export default function MerchantPayPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [merchantId, setMerchantId] = useState("")
  const [amount, setAmount] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasWallet, setHasWallet] = useState(true)
  const [merchantDetails, setMerchantDetails] = useState<any>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Check if wallet exists
    const secret = localStorage.getItem("zk_secret")
    if (!secret) {
      setHasWallet(false)
    }

    const id = searchParams.get("merchantId")
    if (id) {
      setMerchantId(id)
      // Simulate fetching merchant details
      setMerchantDetails({
        name: "Sample Store",
        rating: 4.5,
        transactions: 1234,
        verified: true
      })
    }
  }, [searchParams])

  const handlePay = async () => {
    if (!merchantId) {
      setError("Please enter a merchant ID")
      return
    }

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const secret = localStorage.getItem("zk_secret")
      
      if (!secret) {
        setError("Wallet not found. Please create a wallet first.")
        setLoading(false)
        return
      }

      const res = await fetch("/api/pay/merchant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          secret,
          amount: Number(amount),
          merchantId
        })
      })

      const data = await res.json()
      
      if (res.ok) {
        setResult(data)
      } else {
        setError(data.error || "Payment failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const copyMerchantId = () => {
    navigator.clipboard.writeText(merchantId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Number(value || 0))
  }

  if (!hasWallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-8 group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>

          <div className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 p-8 text-center border border-gray-100">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg">
              <ExclamationTriangleIcon className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              No Wallet Found
            </h2>
            <p className="text-gray-500 mb-8">
              You need an anonymous wallet to pay merchants.
            </p>
            
            <Link
              href="/wallet"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Create Wallet
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/merchant"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Merchants</span>
          </Link>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border border-indigo-100">
            <QrCodeIcon className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-medium text-gray-600">QR Payment</span>
          </div>
        </div>

        {/* Main Card */}
        <motion.div 
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-200/50 overflow-hidden border border-white/50"
          layout
        >
          {/* Card Header with Store decoration */}
          <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-10 overflow-hidden">
            <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute left-0 bottom-0 w-32 h-32 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            
            <div className="relative flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <BuildingStorefrontIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Pay a Merchant</h1>
                <p className="text-indigo-100 text-sm mt-1">Secure payment • Zero-knowledge proof</p>
              </div>
            </div>

            {/* QR Code Scanner Hint */}
            {searchParams.get("merchantId") && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-4 right-8 flex items-center gap-2 text-white/80 text-sm"
              >
                <QrCodeIcon className="w-4 h-4" />
                <span>QR code scanned</span>
              </motion.div>
            )}
          </div>

          {/* Payment Form */}
          <div className="p-8">
            {/* Merchant ID Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Merchant ID
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <BuildingStorefrontIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={merchantId}
                  onChange={(e) => {
                    setMerchantId(e.target.value)
                    setError(null)
                  }}
                  placeholder="Enter merchant ID or scan QR"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all font-mono text-sm"
                  readOnly={!!searchParams.get("merchantId")}
                />
                {merchantId && (
                  <button
                    onClick={copyMerchantId}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Copy merchant ID"
                  >
                    <DocumentDuplicateIcon className="w-5 h-5" />
                    {copied && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute -top-8 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded"
                      >
                        Copied!
                      </motion.span>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Merchant Details (if available) */}
            {merchantDetails && merchantId && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{merchantDetails.name}</h3>
                  {merchantDetails.verified && (
                    <span className="flex items-center gap-1 text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      <ShieldCheckIcon className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>⭐ {merchantDetails.rating}</span>
                  <span>🛍️ {merchantDetails.transactions}+ transactions</span>
                </div>
              </motion.div>
            )}

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <CurrencyDollarIcon className="w-5 h-5" />
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value)
                    setError(null)
                  }}
                  placeholder="Enter amount"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-none transition-all text-2xl font-medium"
                  min="1"
                  step="1"
                />
              </div>
              
              {/* Quick amount suggestions */}
              <div className="flex flex-wrap gap-2 mt-3">
                {[100, 500, 1000, 2000].map((suggested) => (
                  <button
                    key={suggested}
                    onClick={() => setAmount(suggested.toString())}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                  >
                    ₹{suggested}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Preview */}
            {amount && Number(amount) > 0 && merchantId && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment to</p>
                    <p className="font-mono text-sm text-gray-800">{merchantId.slice(0, 8)}...{merchantId.slice(-4)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                      {formatCurrency(amount)}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 rounded-xl border border-red-200 flex items-start gap-3"
                >
                  <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Privacy Notice */}
            <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 flex items-start gap-3">
              <LockClosedIcon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-indigo-700">
                The merchant will only receive the payment confirmation, not your identity or wallet details. 
                Your privacy is protected by zero-knowledge proofs.
              </p>
            </div>

            {/* Pay Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePay}
              disabled={loading || !merchantId || !amount}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Payment...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CreditCardIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Pay ₹{amount || '0'} Anonymously
                </span>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Result Modal */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setResult(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-8 py-6 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                    className="w-20 h-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4"
                  >
                    <CheckCircleIcon className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white">Payment Successful!</h2>
                </div>

                <div className="p-8">
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500">Merchant</span>
                      <span className="font-mono text-sm text-gray-800">
                        {merchantId.slice(0, 8)}...{merchantId.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500">Amount</span>
                      <span className="text-2xl font-bold text-gray-800">₹{result.amount || amount}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="font-mono text-sm text-gray-600">
                        {result.txId || 'ZK-' + Math.random().toString(36).substr(2, 9)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-500">Privacy</span>
                      <span className="flex items-center gap-1 text-green-600">
                        <ShieldCheckIcon className="w-4 h-4" />
                        <span className="text-sm">ZK-Protected</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setResult(null)
                        setAmount("")
                      }}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      New Payment
                    </button>
                    <Link
                      href="/explorer"
                      className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-2 gap-4"
        >
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <QrCodeIcon className="w-5 h-5 text-indigo-500 mb-2" />
            <h3 className="font-medium text-gray-800 mb-1">Scan QR Code</h3>
            <p className="text-xs text-gray-500">Merchant QR codes auto-fill the ID</p>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <ShieldCheckIcon className="w-5 h-5 text-purple-500 mb-2" />
            <h3 className="font-medium text-gray-800 mb-1">Private Payment</h3>
            <p className="text-xs text-gray-500">Your identity stays anonymous</p>
          </div>
        </motion.div>
      </motion.div>

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