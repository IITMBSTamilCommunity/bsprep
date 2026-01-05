# Database Migration Guide

## Profile Page Enhancement (Twitter/X-style Layout)

### New Features Added:
1. Banner image support - Users can upload and crop a banner image for their profile
2. Username field - Custom @username display
3. Full name field - Separate full name field
4. Email field - User email display
5. Location field - User location (e.g., "Mumbai, India")

### Migration Required:

Run the following SQL script in your Supabase dashboard:

```sql
-- Navigate to: Supabase Dashboard > SQL Editor
-- Paste and run: scripts/005_add_profile_columns.sql
```

Or manually run these commands:

```sql
ALTER TABLE user_profiles_extended
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_extended_username 
ON user_profiles_extended(username) WHERE username IS NOT NULL;
```

### Files Modified:
1. `app/dashboard/profile/page.tsx` - Completely redesigned with Twitter/X-style layout
2. `app/api/profile/route.ts` - Added new fields to API endpoints
3. `scripts/005_add_profile_columns.sql` - New migration script

### New UI Features:
- Large banner image spanning full width
- Profile photo overlapping banner in bottom left
- Clean header with name, @username
- Bio section with 160 character limit
- Info badges (location, joined date)
- Social links (portfolio, GitHub, LinkedIn) with icons
- Edit mode with dedicated upload buttons for banner and profile photo
- Separate image cropping for banner (16:9) and profile photo (1:1 circular)

### Testing:
1. Apply the migration
2. Navigate to `/dashboard/profile`
3. Click "Edit profile"
4. Upload banner image (hover over banner area)
5. Upload profile photo (hover over profile circle)
6. Fill in username, bio, location, and social links
7. Save changes

### Browser Compatibility:
- Modern browsers with ES6+ support
- Canvas API for image cropping
- File Reader API for image preview
