import { Suspense } from 'react'
import MerchantPayContent from './MerchantPayContent'

export const dynamic = 'force-dynamic'

export default function MerchantPayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment page...</p>
        </div>
      </div>
    }>
      <MerchantPayContent />
    </Suspense>
  )
}