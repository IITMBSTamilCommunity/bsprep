-- Optional RPC to compute leaderboard: top users by average score (across all attempts)
+CREATE OR REPLACE FUNCTION leaderboard_top_users()
+RETURNS TABLE(user_id uuid, avg_score numeric, attempts_count int, email text, full_name text) AS $$
+BEGIN
+  RETURN QUERY
+  SELECT
+    a.user_id,
+    AVG(a.score) as avg_score,
+    COUNT(*) as attempts_count,
+    up.email,
+    up.full_name
+  FROM quiz_attempts a
+  LEFT JOIN user_profiles_extended up ON up.id = a.user_id
+  WHERE a.user_id IS NOT NULL
+  GROUP BY a.user_id, up.email, up.full_name
+  ORDER BY avg_score DESC
+  LIMIT 50;
+END;
+$$ LANGUAGE plpgsql;
+
*** End Patch