"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { 
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  LockClosedIcon,
  ServerStackIcon,
  DocumentCheckIcon,
  ArrowLeftIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

export default function ProofPage() {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1000),
      setTimeout(() => setStep(2), 2000),
      setTimeout(() => setStep(3), 3000)
    ]

    // Progress bar animation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100
        return prev + 1
      })
    }, 30)

    return () => {
      timers.forEach(clearTimeout)
      clearInterval(interval)
    }
  }, [])

  const steps = [
    {
      icon: <LockClosedIcon className="w-6 h-6" />,
      title: "Generating cryptographic proof",
      description: "Creating zero-knowledge proof from your transaction",
      color: "from-blue-400 to-blue-500",
      lightColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      icon: <ServerStackIcon className="w-6 h-6" />,
      title: "Submitting proof to network",
      description: "Broadcasting to verification nodes",
      color: "from-purple-400 to-purple-500",
      lightColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      icon: <DocumentCheckIcon className="w-6 h-6" />,
      title: "Verifying on blockchain",
      description: "Validating without revealing identity",
      color: "from-green-400 to-green-500",
      lightColor: "bg-green-50",
      textColor: "text-green-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          {/* Back button */}
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-8 group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>

          {/* Main Card */}
          <motion.div 
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-200/50 overflow-hidden border border-white/50"
            layout
          >
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      Zero Knowledge Proof
                    </h1>
                    <p className="text-blue-100 text-sm">
                      Privacy-preserving verification
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <SparklesIcon className="w-6 h-6 text-white/80" />
                </motion.div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Verification Progress</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>

              {/* Steps Visualization */}
              <div className="relative mb-12">
                {/* Connection Line */}
                <div className="absolute top-8 left-0 w-full h-0.5 bg-gray-200">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${(step / 2) * 100}%` }}
                  />
                </div>

                {/* Step Indicators */}
                <div className="relative flex justify-between">
                  {steps.map((s, index) => (
                    <motion.div 
                      key={index}
                      className="flex flex-col items-center"
                      initial={{ scale: 0.8 }}
                      animate={{ 
                        scale: step >= index ? 1 : 0.8,
                        opacity: step >= index ? 1 : 0.5
                      }}
                    >
                      <motion.div 
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-3 ${
                          step > index 
                            ? 'bg-gradient-to-r from-green-400 to-green-500' 
                            : step === index
                            ? `bg-gradient-to-r ${s.color}`
                            : 'bg-gray-200'
                        } shadow-lg`}
                        animate={step === index ? {
                          scale: [1, 1.1, 1],
                          transition: { duration: 0.5, repeat: Infinity }
                        } : {}}
                      >
                        {step > index ? (
                          <CheckCircleIcon className="w-8 h-8 text-white" />
                        ) : (
                          <div className="text-white">
                            {s.icon}
                          </div>
                        )}
                      </motion.div>
                      <span className={`text-xs font-medium ${
                        step >= index ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        Step {index + 1}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Current Step Details */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center"
                >
                  {step < 3 ? (
                    <>
                      {/* Active Step */}
                      <motion.div 
                        className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${steps[step].color} p-4 shadow-lg`}
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 2, -2, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="text-white">
                          {steps[step].icon}
                        </div>
                      </motion.div>

                      <h2 className="text-2xl font-bold text-gray-800 mb-3">
                        {steps[step].title}
                      </h2>
                      <p className="text-gray-500 mb-6">
                        {steps[step].description}
                      </p>

                      {/* Loading Animation */}
                      <div className="flex justify-center gap-2 mb-8">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className={`w-3 h-3 rounded-full bg-gradient-to-r ${steps[step].color}`}
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [1, 0.5, 1]
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.3
                            }}
                          />
                        ))}
                      </div>

                      {/* ZK Proof Simulation */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <ArrowPathIcon className="w-4 h-4 text-gray-500 animate-spin" />
                          <span className="text-sm text-gray-600">Simulating ZK-SNARK proof...</span>
                        </div>
                        <div className="space-y-2">
                          {[1, 2, 3].map((i) => (
                            <motion.div
                              key={i}
                              className="h-2 bg-gray-200 rounded-full overflow-hidden"
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 1, delay: i * 0.2 }}
                            >
                              <motion.div 
                                className={`h-full bg-gradient-to-r ${steps[step].color}`}
                                initial={{ x: "-100%" }}
                                animate={{ x: "0%" }}
                                transition={{ duration: 1, delay: i * 0.2 }}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    // Completion State
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <div className="w-28 h-28 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-3xl flex items-center justify-center shadow-xl shadow-green-200">
                        <CheckCircleIcon className="w-14 h-14 text-white" />
                      </div>

                      <h2 className="text-3xl font-bold text-gray-800 mb-3">
                        Payment Confirmed! 🎉
                      </h2>
                      <p className="text-gray-500 mb-6">
                        Your transaction has been verified without revealing your identity
                      </p>

                      {/* Transaction Details */}
                      <div className="max-w-sm mx-auto mb-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Transaction ID:</span>
                          <span className="font-mono text-green-600">0x7f3a...8b2d</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-bold text-green-600">₹1,500</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Time:</span>
                          <span className="text-gray-800">{new Date().toLocaleTimeString()}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 justify-center">
                        <Link
                          href="/wallet"
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
                        >
                          Back to Wallet
                        </Link>
                        <Link
                          href="/explorer"
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                        >
                          View Transaction
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Security Note */}
              {step < 3 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3"
                >
                  <ShieldCheckIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-700">
                    Your identity remains private throughout this process. The network verifies 
                    the proof without ever seeing your actual data.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Footer */}
          {step < 3 && (
            <p className="text-center text-sm text-gray-400 mt-8">
              This is a simulation • Zero-knowledge proofs ensure complete privacy
            </p>
          )}
        </motion.div>
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