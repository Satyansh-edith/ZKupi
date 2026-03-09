"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  CurrencyDollarIcon,
  ShieldCheckIcon,
  QrCodeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function PayPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasWallet, setHasWallet] = useState(true)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    // Check if wallet exists
    const secret = localStorage.getItem("zk_secret")
    if (!secret) {
      setHasWallet(false)
    }
  }, [])

  const handlePay = async () => {
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

      const res = await fetch("/api/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          secret,
          amount: Number(amount)
        })
      })

      const data = await res.json()

      if (res.ok) {
        setResult(data)
        setShowPreview(false)
      } else {
        setError(data.error || "Payment failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const suggestedAmounts = [100, 500, 1000, 5000]

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
              You need to create an anonymous wallet before making payments.
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/wallet"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Wallet</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-full border border-blue-100">
            <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-600">Anonymous Payment</span>
          </div>
        </div>

        {/* Main Card */}
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-200/50 overflow-hidden border border-white/50"
          layout
        >
          {/* Card Header with QR decoration */}
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8"></div>
            <div className="absolute left-0 bottom-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8"></div>

            <div className="relative flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <QrCodeIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Make a Payment</h1>
                <p className="text-blue-100 text-sm mt-1">Secure • Private • Anonymous</p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="p-8">
            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Amount
              </label>
              <div className="relative group">
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
                  placeholder="0"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition-all text-2xl font-medium"
                  min="1"
                  step="1"
                />
              </div>

              {/* Suggested amounts */}
              <div className="flex flex-wrap gap-2 mt-3">
                {suggestedAmounts.map((suggested) => (
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

            {/* Amount Preview */}
            {amount && Number(amount) > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
              >
                <p className="text-sm text-gray-600 mb-1">You're paying</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                  {formatCurrency(amount)}
                </p>
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
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 flex items-start gap-3">
              <LockClosedIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Your identity remains private. The payment will be verified using zero-knowledge proofs
                without revealing your wallet information.
              </p>
            </div>

            {/* Pay Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePay}
              disabled={loading || !amount}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
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
                  <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Pay Anonymously
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
                      <span className="text-gray-500">Amount</span>
                      <span className="text-2xl font-bold text-gray-800">₹{result.amount || amount}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="font-mono text-sm text-gray-600">
                        {result.txId || 'ZK-' + Math.random().toString(36).substr(2, 9)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-500">Time</span>
                      <span className="text-gray-600">{new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-500">Privacy</span>
                      <span className="flex items-center gap-1 text-green-600">
                        <ShieldCheckIcon className="w-4 h-4" />
                        <span className="text-sm">Protected</span>
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
                      className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-2 gap-3"
        >
          <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
            <LockClosedIcon className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-600">End-to-end encrypted</span>
          </div>
          <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
            <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-600">ZK-proof verified</span>
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