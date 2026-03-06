"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import {
  BuildingStorefrontIcon,
  ArrowLeftIcon,
  QrCodeIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  ShareIcon
} from '@heroicons/react/24/outline'

export default function MerchantPage() {
  const [name, setName] = useState("")
  const [merchant, setMerchant] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState<'form' | 'qr'>('form')

  const createMerchant = async () => {
    if (!name.trim()) return
    
    setLoading(true)
    
    try {
      const res = await fetch("/api/merchant/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
      })

      const data = await res.json()
      setMerchant(data.merchant)
      setStep('qr')
    } catch (error) {
      console.error("Failed to create merchant:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyMerchantId = () => {
    navigator.clipboard.writeText(merchant.merchantId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQR = () => {
  // Get the SVG element
  const svg = document.getElementById('merchant-qr')
  if (svg) {
    // Create a canvas element
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Create an image from the SVG
    const img = new Image()
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    
    img.onload = () => {
      // Set canvas dimensions
      canvas.width = img.width
      canvas.height = img.height
      
      // Draw image on canvas
      ctx?.drawImage(img, 0, 0)
      
      // Convert to PNG and download
      const pngUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `merchant-${merchant.merchantId}.png`
      link.href = pngUrl
      link.click()
      
      // Clean up
      URL.revokeObjectURL(url)
    }
    
    img.src = url
  }
}

const printQR = () => {
  const printWindow = window.open('', '_blank')
  if (printWindow && merchant) {
    // Get the SVG element
    const svg = document.getElementById('merchant-qr')
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Merchant QR Code - ${merchant.name}</title>
            <style>
              body { 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                min-height: 100vh; 
                margin: 0;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: white;
              }
              .container { 
                text-align: center; 
                padding: 2rem;
              }
              .qr-wrapper {
                margin: 2rem 0;
              }
              h2 { 
                color: #059669;
                margin-bottom: 0.5rem;
                font-size: 1.5rem;
              }
              .merchant-id {
                color: #4b5563;
                font-family: monospace;
                font-size: 0.875rem;
                background: #f3f4f6;
                padding: 0.5rem 1rem;
                border-radius: 0.5rem;
                display: inline-block;
                margin-top: 1rem;
              }
              .note {
                color: #9ca3af;
                font-size: 0.75rem;
                margin-top: 2rem;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>${merchant.name}</h2>
              <div class="qr-wrapper">
                ${svgData}
              </div>
              <p class="merchant-id">Merchant ID: ${merchant.merchantId}</p>
              <p class="note">Scan this QR code to make an anonymous payment</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }
}
  const resetForm = () => {
    setStep('form')
    setName("")
    setMerchant(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative max-w-2xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-100">
            <BuildingStorefrontIcon className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-medium text-gray-600">Merchant Onboarding</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' ? (
            /* Creation Form */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Hero Section */}
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-200"
                >
                  <BuildingStorefrontIcon className="w-12 h-12 text-white" />
                </motion.div>

                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-transparent bg-clip-text">
                  Create Your Merchant Account
                </h1>
                <p className="text-gray-500 text-lg max-w-md mx-auto">
                  Start accepting anonymous payments with zero-knowledge proofs. Generate a unique QR code for your customers.
                </p>
              </motion.div>

              {/* Main Card */}
              <motion.div 
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-100/50 overflow-hidden border border-white/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5" />
                    Merchant Details
                  </h2>
                </div>

                <div className="p-8">
                  {/* Benefits List */}
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                      { icon: "🛡️", text: "Privacy-first payments" },
                      { icon: "📱", text: "QR code payments" },
                      { icon: "🔒", text: "Zero-knowledge proofs" },
                      { icon: "⚡", text: "Instant settlements" }
                    ].map((benefit, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-center gap-2 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100"
                      >
                        <span className="text-xl">{benefit.icon}</span>
                        <span className="text-xs text-gray-600">{benefit.text}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Input Form */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Merchant Name
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                          <BuildingStorefrontIcon className="w-5 h-5" />
                        </div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your business name"
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-all text-lg"
                          onKeyPress={(e) => e.key === 'Enter' && createMerchant()}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        This name will be visible to customers when they pay
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={createMerchant}
                      disabled={loading || !name.trim()}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Merchant...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          Create Merchant Account
                        </span>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Info Panel */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-emerald-100 rounded-xl">
                    <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Why become a merchant?</h3>
                    <p className="text-sm text-gray-500">
                      Accept payments anonymously with zero-knowledge proofs. Your customers' privacy is protected 
                      while you receive instant, verified payments. No identity data stored, just pure transactions.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            /* QR Code Display */
            merchant && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                {/* Success Header */}
                <motion.div 
                  className="text-center mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <CheckCircleIcon className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Merchant Created! 🎉
                  </h2>
                  <p className="text-gray-500">
                    Your merchant account is ready. Share this QR code with customers.
                  </p>
                </motion.div>

                {/* QR Code Card */}
                <motion.div 
                  className="bg-white rounded-3xl shadow-2xl shadow-emerald-100/50 overflow-hidden border border-gray-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl">
                          <QrCodeIcon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-white">{merchant.name}</h3>
                      </div>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-xs text-white">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="p-8">
                    {/* Merchant ID */}
                    <div className="mb-8 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                      <label className="block text-xs text-gray-500 mb-2">Merchant ID</label>
                      <div className="flex items-center justify-between">
                        <code className="text-sm font-mono text-gray-700">{merchant.merchantId}</code>
                        <button
                          onClick={copyMerchantId}
                          className="relative p-2 hover:bg-white rounded-lg transition-colors group"
                          title="Copy merchant ID"
                        >
                          <DocumentDuplicateIcon className="w-5 h-5 text-gray-400 group-hover:text-emerald-500" />
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
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex flex-col items-center">
                      <motion.div 
                        className="relative p-6 bg-white rounded-2xl shadow-xl border-2 border-emerald-100"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-xs rounded-full">
                          Scan to Pay
                        </div>
                        <QRCodeSVG
                          id="merchant-qr"
                          value={`${window.location.origin}/pay/merchant?merchantId=${merchant.merchantId}`}
                          size={240}
                          level="H"
                          includeMargin={true}
                          className="rounded-lg"
                        />
                      </motion.div>

                      {/* Payment URL */}
                      <p className="mt-4 text-xs text-gray-400 text-center break-all max-w-sm">
                        {`${window.location.origin}/pay/merchant?merchantId=${merchant.merchantId}`}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-3 mt-8">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={downloadQR}
                        className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors group"
                      >
                        <ArrowDownTrayIcon className="w-5 h-5 text-gray-500 group-hover:text-emerald-500" />
                        <span className="text-xs text-gray-500 group-hover:text-emerald-600">Download</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={printQR}
                        className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors group"
                      >
                        <PrinterIcon className="w-5 h-5 text-gray-500 group-hover:text-emerald-500" />
                        <span className="text-xs text-gray-500 group-hover:text-emerald-600">Print</span>
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          navigator.share?.({
                            title: `${merchant.name} Payment QR`,
                            text: `Pay ${merchant.name} anonymously`,
                            url: `${window.location.origin}/pay/merchant?merchantId=${merchant.merchantId}`
                          }).catch(() => {})
                        }}
                        className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors group"
                      >
                        <ShareIcon className="w-5 h-5 text-gray-500 group-hover:text-emerald-500" />
                        <span className="text-xs text-gray-500 group-hover:text-emerald-600">Share</span>
                      </motion.button>
                    </div>

                    {/* Create Another Button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      onClick={resetForm}
                      className="w-full mt-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <BuildingStorefrontIcon className="w-5 h-5" />
                      Create Another Merchant
                    </motion.button>
                  </div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 grid grid-cols-2 gap-4"
                >
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <BanknotesIcon className="w-6 h-6 text-emerald-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-800">0</p>
                    <p className="text-xs text-gray-500">Today's Transactions</p>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <ShieldCheckIcon className="w-6 h-6 text-teal-500 mb-2" />
                    <p className="text-2xl font-bold text-gray-800">100%</p>
                    <p className="text-xs text-gray-500">Privacy Preserved</p>
                  </div>
                </motion.div>
              </motion.div>
            )
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