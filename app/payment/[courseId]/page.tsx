'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CreditCard, Lock, Check } from 'lucide-react'
import Link from 'next/link'

const courseData: Record<string, any> = {
  'foundation-math-2': {
    title: 'Mathematics for Data Science II',
    price: '₹2,500',
    weeks: 12,
  },
  'foundation-stats-2': {
    title: 'Statistics for Data Science II',
    price: '₹2,500',
    weeks: 12,
  },
  'foundation-programming-python': {
    title: 'Programming in Python',
    price: '₹3,000',
    weeks: 12,
  },
  'foundation-english-2': {
    title: 'English II',
    price: '₹2,000',
    weeks: 12,
  },
}

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string
  const course = courseData[courseId]

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:from-slate-950 dark:via-purple-950/10 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Course Not Found</h1>
          <Link href="/courses">
            <Button>Back to Courses</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handlePayment = () => {
    // TODO: Integrate with actual payment gateway (Razorpay, Stripe, etc.)
    alert('Payment gateway integration coming soon! For now, this is a demo.')
    // After successful payment, redirect to course page
    // router.push(`/courses/${courseId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:from-slate-950 dark:via-purple-950/10 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link 
          href={`/courses/${courseId}`}
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-[#3e3098] transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Course
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Summary */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Complete Your Enrollment</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              You're one step away from starting your learning journey
            </p>

            <Card className="p-6 mb-6">
              <Badge className="bg-blue-500 text-white mb-4">Foundation Course</Badge>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{course.title}</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#51b206] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">12 weeks of comprehensive content</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#51b206] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Expert-led video lectures</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#51b206] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Practice assignments and quizzes</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#51b206] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Certificate of completion</span>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[#51b206] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">Lifetime access to course materials</span>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">Total Amount</span>
                  <span className="text-3xl font-bold text-[#3e3098]">{course.price}</span>
                </div>
              </div>
            </Card>

            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Lock className="w-4 h-4" />
              <span>Secure payment processing</span>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <Card className="p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Details
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <Button
                  onClick={handlePayment}
                  className="w-full bg-[#3e3098] hover:bg-[#3e3098]/90 text-white py-6 text-lg font-semibold"
                >
                  Pay {course.price}
                </Button>

                <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                  By completing this purchase, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </Card>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 <strong>Note:</strong> This is a demo payment page. In production, this would integrate with a secure payment gateway like Razorpay or Stripe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
