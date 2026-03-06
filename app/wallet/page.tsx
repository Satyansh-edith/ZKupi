"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import SHA256 from "crypto-js/sha256"
import { v4 as uuidv4 } from "uuid"
import { 
  ShieldCheckIcon, 
  KeyIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  WalletIcon
} from '@heroicons/react/24/outline'

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState(false)

  async function generateWallet() {
    setLoading(true)
    
    // Simulate loading for better UX
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const secret = uuidv4()
    const commitment = SHA256(secret).toString()

    const res = await fetch("/api/wallet/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        commitment
      })
    })

    const data = await res.json()

    localStorage.setItem("zk_secret", secret)

    setWallet({
      secret,
      commitment,
      balance: data.wallet.balance
    })
    setLoading(false)
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const resetWallet = () => {
    if (window.confirm('Are you sure you want to reset? Your current wallet will be lost.')) {
      setWallet(null)
      localStorage.removeItem("zk_secret")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/"
            className="group flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          
          {wallet && (
            <button
              onClick={resetWallet}
              className="text-sm text-red-500 hover:text-red-600 transition-colors"
            >
              Reset Wallet
            </button>
          )}
        </div>

        {/* Main Card */}
        <motion.div 
          className="bg-white rounded-3xl shadow-2xl shadow-blue-100/50 overflow-hidden border border-gray-100"
          layout
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <WalletIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Anonymous Wallet</h1>
                  <p className="text-blue-100 text-sm">Zero-Knowledge Privacy</p>
                </div>
              </div>
              <ShieldCheckIcon className="w-8 h-8 text-white/80" />
            </div>
          </div>

          {/* Card Body */}
          <div className="p-8">
            {/* Info Banner */}
            <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-blue-100 rounded-lg">
                  <ExclamationTriangleIcon className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">
                  Your wallet is generated locally. The secret key is stored only in your browser. 
                  Never share your secret with anyone!
                </p>
              </div>
            </div>

            {/* Generate Button */}
            {!wallet && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-200"
                >
                  <KeyIcon className="w-12 h-12 text-white" />
                </motion.div>

                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                  Create Your Anonymous Wallet
                </h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  Generate a new wallet with a unique secret key. Your identity remains completely private.
                </p>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={generateWallet}
                  disabled={loading}
                  className="relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Wallet...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <KeyIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      Generate New Wallet
                    </span>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* Wallet Details */}
            <AnimatePresence mode="wait">
              {wallet && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Balance Card */}
                  <motion.div 
                    className="mb-8 p-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl text-white shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <p className="text-blue-100 text-sm mb-2">Current Balance</p>
                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-4xl font-bold">₹{wallet.balance}</span>
                        <span className="text-blue-100 ml-2">INR</span>
                      </div>
                      <div className="p-2 bg-white/20 rounded-xl">
                        <WalletIcon className="w-6 h-6" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Secret Key Section */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secret Key
                    </label>
                    <div className="relative group">
                      <div className="w-full p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl font-mono text-sm break-all pr-24">
                        {showSecret ? wallet.secret : '••••••••••••••••••••••••••••••••'}
                      </div>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        <button
                          onClick={() => setShowSecret(!showSecret)}
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                          title={showSecret ? "Hide secret" : "Show secret"}
                        >
                          {showSecret ? (
                            <EyeSlashIcon className="w-4 h-4 text-gray-500" />
                          ) : (
                            <EyeIcon className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(wallet.secret, 'secret')}
                          className="p-2 hover:bg-white rounded-lg transition-colors relative"
                          title="Copy secret"
                        >
                          <DocumentDuplicateIcon className="w-4 h-4 text-gray-500" />
                          {copied === 'secret' && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute -top-8 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded"
                            >
                              Copied!
                            </motion.span>
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <ExclamationTriangleIcon className="w-3 h-3" />
                      Save this secret! You'll need it to access your wallet.
                    </p>
                  </div>

                  {/* Commitment Section */}
                  <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commitment Hash
                    </label>
                    <div className="relative group">
                      <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm text-gray-600 break-all pr-12">
                        {wallet.commitment}
                      </div>
                      <button
                        onClick={() => copyToClipboard(wallet.commitment, 'commitment')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy commitment"
                      >
                        <DocumentDuplicateIcon className="w-4 h-4 text-gray-500" />
                        {copied === 'commitment' && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute -top-8 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded"
                          >
                            Copied!
                          </motion.span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <Link
                      href="/pay/merchant"
                      className="group p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl text-center hover:shadow-lg transition-all"
                    >
                      <span className="block text-purple-600 font-medium mb-1">Pay Merchant</span>
                      <span className="text-xs text-gray-500">Scan QR to pay</span>
                    </Link>
                    <Link
                      href="/explorer"
                      className="group p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-center hover:shadow-lg transition-all"
                    >
                      <span className="block text-green-600 font-medium mb-1">View History</span>
                      <span className="text-xs text-gray-500">Check transactions</span>
                    </Link>
                  </div>

                  {/* Success Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200 flex items-center gap-3"
                  >
                    <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <p className="text-sm text-green-700">
                      Wallet created successfully! Your anonymous identity is now active.
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Security Tips */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { icon: "🔐", text: "Secret key never leaves your device" },
            { icon: "🔄", text: "One-time generation for maximum security" },
            { icon: "👁️", text: "Transactions are publicly verifiable" }
          ].map((tip, index) => (
            <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
              <span className="text-2xl">{tip.icon}</span>
              <span className="text-sm text-gray-600">{tip.text}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}