# Supabase Setup Guide for BSPrep Platform

## Overview
This guide will help you set up the complete Supabase backend for the BSPrep course platform with authentication, course management, enrollments, and user profiles.

## Step 1: Create Supabase Tables

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the SQL script: `scripts/004_create_courses_tables.sql`

This will create:
- `courses` table - Store all course data
- `enrollments` table - Track user course enrollments  
- `user_profiles_extended` table - Extended user profile information
- Row Level Security (RLS) policies for all tables
- Sample course data (8 courses)

## Step 2: Verify Tables Created

In Supabase Dashboard > Table Editor, you should see:

### courses table
- id (text, primary key)
- title, description, level, type, weeks, price
- thumbnail, instructor, students_count
- created_at, updated_at

### enrollments table
- id (uuid, primary key)
- user_id (references auth.users)
- course_id (references courses)
- enrolled_at, payment_status
- Unique constraint on (user_id, course_id)

### user_profiles_extended table
- id (references auth.users)
- photo_url, github, linkedin, portfolio
- about, education
- created_at, updated_at

## Step 3: Test the Setup

### Test 1: View Courses (Public)
- Visit `/courses` - should load courses from Supabase
- All 8 courses should be visible

### Test 2: Authentication
- Sign up for a new account
- Login should work

### Test 3: Enroll in Free Course
1. Login to your account
2. Go to any free qualifier course (Math 1, Stats 1, CT, or English 1)
3. Click "Enroll Now - Free" button
4. Should see success message
5. Go to Dashboard > Courses > My Courses
6. Course should appear in "My Courses" tab

### Test 4: Profile Management
1. Go to Dashboard > Profile
2. Upload a profile photo
3. Add GitHub, LinkedIn, Portfolio links
4. Fill in About Me and Education
5. Click "Save Changes"
6. Refresh page - data should persist

### Test 5: Paid Course Flow
1. Go to any foundation course (Math 2, Stats 2, Python, English 2)
2. Click "Enroll Now - Premium" button
3. Should redirect to payment page at `/payment/[courseId]`
4. Payment page should show course details and price

## API Routes Created

### /api/enroll
**POST** - Enroll in a course
- Body: `{ "courseId": "qualifier-math-1" }`
- Returns: enrollment record
- For free courses: creates enrollment immediately
- For paid courses: creates enrollment with payment_status='pending'

**DELETE** - Unenroll from a course
- Query param: `?courseId=qualifier-math-1`
- Returns: success message

### /api/profile
**GET** - Fetch user profile
- Returns: user profile data

**POST** - Update user profile
- Body: `{ "photo_url", "github", "linkedin", "portfolio", "about", "education" }`
- Returns: updated profile

## File Structure Created

```
app/
├── api/
│   ├── enroll/
│   │   └── route.ts          # Enrollment API
│   └── profile/
│       └── route.ts          # Profile API
├── courses/
│   └── [courseId]/
│       └── page.tsx          # Updated with Supabase
├── dashboard/
│   ├── courses/
│   │   └── page.tsx          # Fetch from Supabase
│   ├── profile/
│   │   └── page.tsx          # Connected to API
│   └── page.tsx              # Plain dashboard
├── payment/
│   └── [courseId]/
│       └── page.tsx          # Payment page
└── ...

scripts/
└── 004_create_courses_tables.sql  # Database schema
```

## Key Features Implemented

✅ **Course Management**
- Fetch all courses from Supabase database
- Display courses with real data (title, description, price, etc.)
- Filter by level and type

✅ **Enrollment System**
- Check enrollment status from database
- Enroll in free courses (instant)
- Redirect to payment for paid courses
- Enrollment tracking per user

✅ **User Profiles**
- Upload profile photo (base64 stored)
- Add social links (GitHub, LinkedIn, Portfolio)
- About me section (500 char limit)
- Education information
- Data persisted in Supabase

✅ **Authentication Gates**
- All course content requires login
- Unenrolled users see locked weeks
- Enrolled users can access course content

✅ **Dashboard**
- My Courses tab (shows enrolled courses)
- Explore Courses tab (shows available courses)
- Real-time enrollment status

## Environment Variables Required

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Next Steps (Optional Enhancements)

1. **Payment Integration**
   - Integrate Razorpay/Stripe in payment page
   - Update enrollment payment_status after payment
   
2. **Photo Upload to Storage**
   - Use Supabase Storage instead of base64
   - Create storage bucket for profile photos
   
3. **Course Progress Tracking**
   - Add `course_progress` table
   - Track completed videos/weeks
   
4. **Course Content Management**
   - Add `course_content` table for videos
   - Fetch videos from database instead of hardcoded

## Troubleshooting

### Error: "Failed to fetch courses"
- Check Supabase connection
- Verify RLS policies are enabled
- Check browser console for errors

### Error: "Unauthorized" on enrollment
- Make sure user is logged in
- Check JWT token is valid
- Verify RLS policies allow user access

### Profile not saving
- Check API route logs
- Verify user_profiles_extended table exists
- Check if user ID matches auth.users

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard > Logs
2. Check browser console for errors
3. Verify all SQL scripts ran successfully
4. Test API routes directly in browser/Postman
