"use client"

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="orb orb-blue top-20 left-10 animate-pulse" style={{ animationDuration: "6s" }} />
      <div className="orb orb-gold top-40 right-20 animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="orb orb-blue bottom-20 left-1/3 animate-pulse" style={{ animationDuration: "7s" }} />
      <div className="orb orb-gold bottom-40 right-1/4 animate-pulse" style={{ animationDuration: "9s" }} />

      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 mix-blend-overlay" />
    </div>
  )
}
