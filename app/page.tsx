import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { AnimatedBackground } from "@/components/animated-background"
import { BookOpen, Users, TrendingUp, CheckCircle, Zap, Award, Sparkles, ArrowRight } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <AnimatedBackground />
      <Navbar isAuthenticated={false} />

      <section className="relative overflow-hidden pt-20 md:pt-32 pb-20 md:pb-40">
        {/* Background gradient orbs */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 mb-16">
            {/* Badge with animation */}
            <div className="inline-block px-4 py-2 glass rounded-full border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <p className="text-sm font-semibold text-white">Welcome to IITM BS Learning Platform</p>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              <span className="block text-white mb-3">Learn IITM BS</span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                With Mentors by Your Side
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Expert-led learning, community support, and peer mentorship for IITM BS students. Master concepts, solve
              doubts, and ace your exams with our comprehensive platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/auth/sign-up">
                <Button className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button className="glass text-white px-8 py-6 text-lg rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-20">
            {[
              { label: "Active Students", value: "2,500+" },
              { label: "Expert Mentors", value: "150+" },
              { label: "Study Materials", value: "500+" },
            ].map((stat, i) => (
              <div
                key={i}
                className="group glass rounded-xl p-6 md:p-8 text-center hover:bg-white/10 transition-all duration-300 cursor-default card-3d"
              >
                <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent group-hover:drop-shadow-lg transition-all">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-400 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">Three simple steps to transform your learning</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Access Materials",
                description: "Get comprehensive notes and video lectures from experienced mentors",
                icon: BookOpen,
              },
              {
                number: "02",
                title: "Connect with Mentors",
                description: "Request personalized guidance and get doubts solved in real-time",
                icon: Users,
              },
              {
                number: "03",
                title: "Track Progress",
                description: "Practice with quizzes and compete on the leaderboard",
                icon: TrendingUp,
              },
            ].map((step, i) => (
              <div
                key={i}
                className="group relative glass rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-300 card-3d overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-blue-600/0 to-purple-600/0 group-hover:from-purple-600/10 group-hover:via-blue-600/20 group-hover:to-purple-600/10 transition-all duration-300" />

                <div className="relative">
                  <div className="text-5xl font-bold text-white/20 mb-4 group-hover:text-purple-400/30 transition-colors">
                    {step.number}
                  </div>
                  <step.icon className="w-10 h-10 text-purple-400 mb-4 group-hover:text-yellow-400 transition-colors" />
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-32 bg-white/5 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose IITM Learning?</h2>
            <p className="text-slate-400 text-lg">Everything you need to succeed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "Study Materials", desc: "500+ curated notes and resources" },
              { icon: CheckCircle, title: "Live Classes", desc: "Weekly mentoring sessions" },
              { icon: Zap, title: "Practice Quizzes", desc: "200+ questions with solutions" },
              { icon: Award, title: "Certifications", desc: "Earn recognition badges" },
              { icon: Users, title: "Community", desc: "Connect with 2500+ students" },
              { icon: TrendingUp, title: "Analytics", desc: "Track your growth in detail" },
            ].map((feature, i) => (
              <Card
                key={i}
                className="glass border-white/10 hover:border-purple-500/50 group card-3d overflow-hidden transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-blue-600/0 group-hover:from-purple-600/5 group-hover:to-blue-600/10 transition-all" />
                <CardContent className="pt-6 relative">
                  <feature.icon className="w-8 h-8 text-purple-400 mb-4 group-hover:text-yellow-400 group-hover:scale-110 transition-all" />
                  <h3 className="font-bold text-lg text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 group-hover:text-slate-300 transition-colors text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center glass rounded-3xl p-12 md:p-16 border border-white/10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of IITM BS students accelerating their journey with expert mentorship and community support.
          </p>
          <Link href="/auth/sign-up">
            <Button className="group bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-12 py-7 text-lg rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/50">
              Get Started Now – It's Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
