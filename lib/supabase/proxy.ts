import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function parseCsv(value: string | undefined) {
  return (value || "")
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)
}

function getEmailDomain(email: string) {
  const at = email.lastIndexOf("@")
  return at >= 0 ? email.slice(at + 1).toLowerCase() : ""
}

function isEmailAllowedForGoogle(email: string) {
  const lower = (email || "").toLowerCase()
  const adminEmails = parseCsv(process.env.ADMIN_EMAIL_WHITELIST)
  if (adminEmails.includes(lower)) return true
  const studentDomains = parseCsv(process.env.STUDENT_EMAIL_DOMAINS)
  const domain = getEmailDomain(lower)
  if (studentDomains.includes(domain)) return true
  return false
}

function deriveRoleFromEmail(email: string) {
  const lower = (email || "").toLowerCase()
  const adminEmails = parseCsv(process.env.ADMIN_EMAIL_WHITELIST)
  if (adminEmails.includes(lower)) return "admin"

  const studentDomains = parseCsv(process.env.STUDENT_EMAIL_DOMAINS)
  const domain = getEmailDomain(lower)
  if (studentDomains.includes(domain)) return "student"

  return "user"
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Enforce Google OAuth: only allow student-domain or admin-whitelist emails.
  // Also ensure `user_profiles_extended` exists and holds the canonical role.
  try {
    const email = user?.email ?? ""

    const provider = (user as any)?.app_metadata?.provider
    if (user && provider === "google" && !isEmailAllowedForGoogle(email)) {
      // Clear auth cookies and redirect to login.
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("error", "google_not_allowed")
      return NextResponse.redirect(url)
    }

    const derivedRole = deriveRoleFromEmail(email)

    let finalRole = derivedRole
    if (user) {
      const { data: existing } = await supabase
        .from("user_profiles_extended")
        .select("role")
        .eq("id", user.id)
        .single()

      const existingRole = (existing as any)?.role as string | null | undefined
      // Never downgrade existing roles (except admin whitelist -> force admin)
      if (existingRole) {
        finalRole = existingRole
      }

      // If admin email is whitelisted, force admin.
      if (derivedRole === "admin") {
        finalRole = "admin"
      } else if (derivedRole === "student" && (!existingRole || existingRole === "user")) {
        // Promote user->student if eligible.
        finalRole = "student"
      }
    }

    if (user) {
      // Upsert minimal profile info (will create row if missing).
      await supabase
        .from("user_profiles_extended")
        .upsert(
          {
            id: user.id,
            email: email || null,
            role: finalRole,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        )
    }

    // Protect routes: require auth for /dashboard, require admin for admin area
    const pathname = request.nextUrl.pathname
    if (pathname.startsWith("/dashboard") && !user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }

    if (pathname.startsWith("/dashboard/admin") && finalRole !== "admin") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
  } catch (err) {
    // Ignore errors here to avoid breaking navigation; leave original response
    console.error("Session proxy role upsert error:", err)
  }

  return supabaseResponse
}
