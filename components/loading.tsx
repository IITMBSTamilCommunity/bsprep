"use client"

export function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="text-center">
        {/* Animated Logo */}
        <div className="mb-8 relative">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#3e3098] to-[#51b206] animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <img 
              src="/logo.jpeg" 
              alt="IITM BS Logo" 
              className="w-20 h-20 rounded-full object-cover animate-spin-slow"
            />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white">Loading...</h3>
          <div className="flex justify-center gap-1">
            <span className="w-2 h-2 bg-[#3e3098] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-[#51b206] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-[#3e3098] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  )
}
