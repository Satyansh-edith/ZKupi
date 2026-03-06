"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ShieldCheckIcon, 
  CreditCardIcon, 
  QrCodeIcon,
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
  LockClosedIcon,
  UserGroupIcon,
  GlobeAltIcon,
  SparklesIcon,
  RocketLaunchIcon,
  FingerPrintIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

export default function Home() {
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const features = [
    {
      icon: <LockClosedIcon className="w-6 h-6" />,
      title: "Anonymous Wallets",
      description: "Wallets are created using secret commitments instead of real identities.",
      gradient: "from-blue-400 to-cyan-400",
      lightColor: "bg-blue-50",
      iconColor: "text-blue-500"
    },
    {
      icon: <QrCodeIcon className="w-6 h-6" />,
      title: "QR Based Merchant Payments",
      description: "Merchants generate QR codes which users can scan to make payments.",
      gradient: "from-purple-400 to-pink-400",
      lightColor: "bg-purple-50",
      iconColor: "text-purple-500"
    },
    {
      icon: <FingerPrintIcon className="w-6 h-6" />,
      title: "Zero Knowledge Proof Simulation",
      description: "Payments are validated using simulated cryptographic proofs without revealing identity.",
      gradient: "from-amber-400 to-orange-400",
      lightColor: "bg-amber-50",
      iconColor: "text-amber-500"
    },
    {
      icon: <MagnifyingGlassIcon className="w-6 h-6" />,
      title: "Public Transaction Explorer",
      description: "Transactions are publicly visible but the payer remains completely anonymous.",
      gradient: "from-emerald-400 to-teal-400",
      lightColor: "bg-emerald-50",
      iconColor: "text-emerald-500"
    }
  ]

  const architectureItems = [
    { label: "User Secret", icon: "🔐", gradient: "from-blue-400 to-blue-500" },
    { label: "Commitment Hash", icon: "🔑", gradient: "from-purple-400 to-purple-500" },
    { label: "ZK Proof", icon: "✅", gradient: "from-amber-400 to-amber-500" },
    { label: "Network Verification", icon: "🌐", gradient: "from-green-400 to-green-500" },
    { label: "Transaction Explorer", icon: "🔍", gradient: "from-gray-400 to-gray-500" }
  ]

  const stats = [
    { label: "Active Wallets", value: "10K+", change: "+25%" },
    { label: "Transactions", value: "50K+", change: "+40%" },
    { label: "Merchants", value: "500+", change: "+15%" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <motion.div 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="max-w-4xl mx-auto text-center pt-20 pb-16 px-4"
      >
        <motion.div variants={fadeInUp}>
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 mb-8 shadow-lg shadow-blue-100/50 border border-blue-100">
            <SparklesIcon className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              Privacy-First Payment System
            </span>
          </div>
        </motion.div>

        <motion.h1 
          variants={fadeInUp}
          className="text-6xl md:text-7xl font-bold mb-6"
        >
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            ZK-UPI Privacy
          </span>
        </motion.h1>

        <motion.p 
          variants={fadeInUp}
          className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
        >
          A privacy-preserving digital payment system using simulated Zero-Knowledge Proofs. 
          Transactions are verified without revealing user identity.
        </motion.p>

        {/* Stats */}
        <motion.div 
          variants={fadeInUp}
          className="flex justify-center gap-8 mb-12"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
              <div className="text-xs text-green-500 font-medium">{stat.change}</div>
            </div>
          ))}
        </motion.div>

        {/* Demo Buttons */}
        <motion.div 
          variants={fadeInUp}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/wallet"
            className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-xl hover:shadow-blue-200/50 transition-all duration-300 transform hover:-translate-y-1 font-medium flex items-center gap-2"
          >
            <RocketLaunchIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Create Wallet
          </Link>

          <Link
            href="/merchant"
            className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-xl hover:shadow-purple-200/50 transition-all duration-300 transform hover:-translate-y-1 font-medium flex items-center gap-2"
          >
            <CreditCardIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Create Merchant
          </Link>

          <Link
            href="/explorer"
            className="group px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-xl hover:shadow-green-200/50 transition-all duration-300 transform hover:-translate-y-1 font-medium flex items-center gap-2"
          >
            <MagnifyingGlassIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Transaction Explorer
          </Link>
        </motion.div>

        {/* Floating elements decoration */}
        <div className="relative mt-16">
          <div className="absolute inset-0 flex justify-center">
            <div className="w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
        </div>
      </motion.div>

      {/* Architecture Section */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto mt-32 px-4 relative"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            System Architecture
          </h2>
          <p className="text-gray-500">How your privacy is protected</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          {architectureItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className={`px-6 py-3 bg-gradient-to-r ${item.gradient} text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2`}
            >
              <span>{item.icon}</span>
              <span className="text-sm font-medium">{item.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-white rounded-2xl shadow-lg border border-gray-100 max-w-2xl mx-auto"
        >
          <p className="text-gray-600 text-center">
            The system verifies payments using cryptographic commitments instead of identities. 
            This allows transactions to be validated while preserving user privacy.
          </p>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="max-w-6xl mx-auto mt-32 px-4"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            Features
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Everything you need for private, secure transactions in one beautiful package
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className={`w-14 h-14 rounded-xl ${feature.lightColor} p-3 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <div className={feature.iconColor}>
                  {feature.icon}
                </div>
              </div>

              <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative element */}
              <div className="mt-4 flex items-center gap-2">
                <div className={`w-12 h-1 bg-gradient-to-r ${feature.gradient} rounded-full`} />
                <ArrowTopRightOnSquareIcon className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto mt-32 px-4"
      >
        <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-8 opacity-90">Join thousands of users enjoying private payments</p>
          <Link
            href="/wallet"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-bold"
          >
            <RocketLaunchIcon className="w-5 h-5" />
            Create Your First Wallet
          </Link>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center mt-32 py-8"
      >
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <ShieldCheckIcon className="w-4 h-4" />
          <span>Built for Hackathon Demo • Privacy-First Payments</span>
        </div>
        <div className="flex justify-center gap-4 mt-4 text-sm text-gray-400">
          <Link href="/privacy" className="hover:text-blue-500 transition-colors">Privacy</Link>
          <Link href="/terms" className="hover:text-blue-500 transition-colors">Terms</Link>
          <Link href="/contact" className="hover:text-blue-500 transition-colors">Contact</Link>
        </div>
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
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}