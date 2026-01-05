import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch top users from the leaderboard RPC
  const { data, error } = await supabase.rpc("leaderboard_top_users")

  if (error) {
    console.error("Error fetching leaderboard:", error)
    return NextResponse.json({ error: "Failed to fetch scholarships data" }, { status: 500 })
  }

  // Take top 3
  const top3 = data ? data.slice(0, 3) : []

  return NextResponse.json({ topScorers: top3 })
}
