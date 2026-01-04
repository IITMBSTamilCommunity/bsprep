"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { Bell, User, Menu, X } from "lucide-react"

interface NavbarProps {
  isAuthenticated?: boolean
  userRole?: string
}

export function Navbar({ isAuthenticated = false, userRole = "student" }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      supabase.auth.getUser().then(({ data }) => setUser(data.user))
    }
  }, [isAuthenticated])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <nav
      className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
        scrolled ? "border-b border-slate-200 shadow-sm" : "border-b border-slate-100"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="font-bold text-lg hidden sm:inline bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              IITM BS
            </span>
          </Link>

          {/* Desktop Navigation */}
          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-8">
              <Link href="#" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">
                Home
              </Link>
              <Link href="#features" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">
                Features
              </Link>
              <Link href="#mentors" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">
                Mentors
              </Link>
              <Link href="#" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">
                About
              </Link>
            </div>
          )}

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">
                Dashboard
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">
                Study
              </Link>
              <Link
                href="/dashboard/quizzes"
                className="text-sm font-medium text-slate-700 hover:text-blue-600 transition"
              >
                Practice
              </Link>
              <Link href="#" className="text-sm font-medium text-slate-700 hover:text-blue-600 transition">
                Doubts
              </Link>
              <Link
                href="/dashboard/leaderboard"
                className="text-sm font-medium text-slate-700 hover:text-blue-600 transition"
              >
                Leaderboard
              </Link>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <button className="relative p-2 text-slate-600 hover:text-blue-600 transition">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-lg transition">
                      <User className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium text-slate-700">{user?.email}</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/profile" className="cursor-pointer">
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg transition text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {!isAuthenticated && (
              <>
                <Link href="#" className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600">
                  Home
                </Link>
                <Link
                  href="#features"
                  className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
                >
                  Features
                </Link>
                <Link
                  href="#mentors"
                  className="block px-4 py-2 text-sm font-medium text-slate-700 hover:text-blue-600"
                >
                  Mentors
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
