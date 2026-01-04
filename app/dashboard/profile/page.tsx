'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { User, Upload, Github, Linkedin, Globe, GraduationCap } from 'lucide-react'

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    photo_url: '',
    github: '',
    linkedin: '',
    portfolio: '',
    about: '',
    education: '',
  })

  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const { profile } = await response.json()
        if (profile) {
          setProfileData({
            photo_url: profile.photo_url || '',
            github: profile.github || '',
            linkedin: profile.linkedin || '',
            portfolio: profile.portfolio || '',
            about: profile.about || '',
            education: profile.education || '',
          })
          if (profile.photo_url) {
            setPhotoPreview(profile.photo_url)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
        setProfileData(prev => ({ ...prev, photo_url: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        alert('Profile saved successfully!')
      } else {
        alert('Failed to save profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:from-slate-950 dark:via-purple-950/10 dark:to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3e3098] mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-slate-50 dark:from-slate-950 dark:via-purple-950/10 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Profile</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your personal information and showcase your achievements
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Photo Card */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Photo
            </h2>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#3e3098] to-purple-600 flex items-center justify-center overflow-hidden">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-white" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="photo" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Upload Photo
                </Label>
                <div className="flex gap-3">
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="flex-1"
                  />
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>
          </Card>

          {/* Social Links Card */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Social Links</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="github" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Github className="w-4 h-4" />
                  GitHub
                </Label>
                <Input
                  id="github"
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={profileData.github}
                  onChange={(e) => handleInputChange('github', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="linkedin" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/in/yourusername"
                  value={profileData.linkedin}
                  onChange={(e) => handleInputChange('linkedin', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="portfolio" className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  <Globe className="w-4 h-4" />
                  Portfolio Website
                </Label>
                <Input
                  id="portfolio"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  value={profileData.portfolio}
                  onChange={(e) => handleInputChange('portfolio', e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* About Me Card */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">About Me</h2>
            <div>
              <Label htmlFor="about" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Tell us about yourself
              </Label>
              <Textarea
                id="about"
                placeholder="Write a brief bio about yourself, your interests, and goals..."
                rows={6}
                value={profileData.about}
                onChange={(e) => handleInputChange('about', e.target.value)}
                className="resize-none"
                maxLength={500}
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                {profileData.about.length}/500 characters
              </p>
            </div>
          </Card>

          {/* Education Card */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Education
            </h2>
            <div>
              <Label htmlFor="education" className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Educational Background
              </Label>
              <Textarea
                id="education"
                placeholder="Share your educational qualifications, degrees, certifications..."
                rows={4}
                value={profileData.education}
                onChange={(e) => handleInputChange('education', e.target.value)}
                className="resize-none"
              />
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => fetchProfile()} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#3e3098] hover:bg-[#3e3098]/90 text-white px-8"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
