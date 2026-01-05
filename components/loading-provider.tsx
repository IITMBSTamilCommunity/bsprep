"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Loading } from "./loading"

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsLoading(true)
    const timeout = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timeout)
  }, [pathname])

  return (
    <>
      {isLoading && <Loading />}
      {children}
    </>
  )
}
