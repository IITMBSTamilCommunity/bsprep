"use client"

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { 
  MapPin, 
  Calendar, 
  Globe, 
  Github, 
  Linkedin,
  Mail,
  Edit3,
  Save,
  X,
  Plus,
  Trash2,
  FolderGit2,
  Briefcase,
  GraduationCap
} from 'lucide-react'

interface Project {
  id: string
  title: string
  description: string
  url: string
  tags: string[]
}

interface Experience {
  id: string
  position: string
  company: string
  duration: string
  description: string
}

interface Education {
  id: string
  degree: string
  institution: string
  duration: string
  description: string
}

export default function ProfilePage() {
  const [isEditMode, setIsEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  
  const [profileData, setProfileData] = useState({
    full_name: '',
    username: '',
    email: '',
    about: '',
    location: '',
    portfolio: '',
    github: '',
    linkedin: '',
    avatar_url: '',
    banner_url: '',
    joined_date: new Date().toISOString(),
  })

  const [projects, setProjects] = useState<Project[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [educations, setEducations] = useState<Education[]>([])

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfileData({
          full_name: data.full_name || '',
          username: data.username || '',
          email: data.email || user.email || '',
          about: data.about || '',
          location: data.location || '',
          portfolio: data.portfolio || '',
          github: data.github || '',
          linkedin: data.linkedin || '',
          avatar_url: data.avatar_url || '',
          banner_url: data.banner_url || '',
          joined_date: data.created_at || new Date().toISOString(),
        })

        // Parse JSON arrays
        if (data.projects) {
          try {
            setProjects(typeof data.projects === 'string' ? JSON.parse(data.projects) : data.projects)
          } catch (e) {
            setProjects([])
          }
        }
        if (data.experiences) {
          try {
            setExperiences(typeof data.experiences === 'string' ? JSON.parse(data.experiences) : data.experiences)
          } catch (e) {
            setExperiences([])
          }
        }
        if (data.educations) {
          try {
            setEducations(typeof data.educations === 'string' ? JSON.parse(data.educations) : data.educations)
          } catch (e) {
            setEducations([])
          }
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...profileData,
          projects: JSON.stringify(projects),
          experiences: JSON.stringify(experiences),
          educations: JSON.stringify(educations),
        }),
      })

      if (response.ok) {
        setIsEditMode(false)
        await fetchProfile()
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const addProject = () => {
    setProjects([...projects, {
      id: Date.now().toString(),
      title: '',
      description: '',
      url: '',
      tags: []
    }])
  }

  const removeProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id))
  }

  const updateProject = (id: string, field: string, value: any) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const addExperience = () => {
    setExperiences([...experiences, {
      id: Date.now().toString(),
      position: '',
      company: '',
      duration: '',
      description: ''
    }])
  }

  const removeExperience = (id: string) => {
    setExperiences(experiences.filter(e => e.id !== id))
  }

  const updateExperience = (id: string, field: string, value: string) => {
    setExperiences(experiences.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  const addEducation = () => {
    setEducations([...educations, {
      id: Date.now().toString(),
      degree: '',
      institution: '',
      duration: '',
      description: ''
    }])
  }

  const removeEducation = (id: string) => {
    setEducations(educations.filter(e => e.id !== id))
  }

  const updateEducation = (id: string, field: string, value: string) => {
    setEducations(educations.map(e => e.id === id ? { ...e, [field]: value } : e))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto">
        {/* Header with Mode Toggle */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800">
          <h1 className="text-2xl font-bold">Profile</h1>
          <div className="flex gap-2">
            {isEditMode ? (
              <>
                <Button
                  onClick={() => {
                    setIsEditMode(false)
                    fetchProfile()
                  }}
                  variant="outline"
                  className="border-slate-700 text-white hover:bg-slate-900"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-500 hover:to-green-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditMode(true)}
                className="bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-500 hover:to-green-500"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Banner */}
        <div className="relative h-48 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600">
          {profileData.banner_url && (
            <img src={profileData.banner_url} alt="Banner" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Profile Photo */}
        <div className="px-6 -mt-16 mb-4">
          <div className="relative inline-block">
            <div className="w-32 h-32 rounded-full border-4 border-black overflow-hidden bg-slate-800">
              {profileData.avatar_url ? (
                <img src={profileData.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-slate-500">
                  {profileData.full_name?.charAt(0) || '?'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 pb-6 space-y-6">
          {/* Basic Info Section */}
          <Card className="bg-slate-900 border-slate-800 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Basic Information
            </h2>
            
            {isEditMode ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Full Name</label>
                  <Input
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                    className="bg-black border-slate-700 text-white"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Username</label>
                  <Input
                    value={profileData.username}
                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                    className="bg-black border-slate-700 text-white"
                    placeholder="@username"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Email</label>
                  <Input
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="bg-black border-slate-700 text-white"
                    placeholder="email@example.com"
                    type="email"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">About</label>
                  <Textarea
                    value={profileData.about}
                    onChange={(e) => setProfileData({...profileData, about: e.target.value})}
                    className="bg-black border-slate-700 text-white resize-none"
                    placeholder="Tell us about yourself"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Location</label>
                  <Input
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    className="bg-black border-slate-700 text-white"
                    placeholder="City, Country"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <h3 className="text-2xl font-bold text-white">{profileData.full_name || 'Your Name'}</h3>
                  <p className="text-slate-400">@{profileData.username || 'username'}</p>
                </div>
                {profileData.about && (
                  <p className="text-slate-300">{profileData.about}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                  {profileData.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {profileData.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(profileData.joined_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Social Links Section */}
          <Card className="bg-slate-900 border-slate-800 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Social Links
            </h2>
            
            {isEditMode ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Portfolio</label>
                  <Input
                    value={profileData.portfolio}
                    onChange={(e) => setProfileData({...profileData, portfolio: e.target.value})}
                    className="bg-black border-slate-700 text-white"
                    placeholder="https://yoursite.com"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">GitHub</label>
                  <Input
                    value={profileData.github}
                    onChange={(e) => setProfileData({...profileData, github: e.target.value})}
                    className="bg-black border-slate-700 text-white"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">LinkedIn</label>
                  <Input
                    value={profileData.linkedin}
                    onChange={(e) => setProfileData({...profileData, linkedin: e.target.value})}
                    className="bg-black border-slate-700 text-white"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {profileData.portfolio && (
                  <a href={profileData.portfolio} target="_blank" rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-blue-400 hover:underline">
                    <Globe className="w-4 h-4" />
                    Portfolio
                  </a>
                )}
                {profileData.github && (
                  <a href={profileData.github} target="_blank" rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-blue-400 hover:underline">
                    <Github className="w-4 h-4" />
                    GitHub
                  </a>
                )}
                {profileData.linkedin && (
                  <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-blue-400 hover:underline">
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {!profileData.portfolio && !profileData.github && !profileData.linkedin && (
                  <p className="text-slate-500">No social links added yet</p>
                )}
              </div>
            )}
          </Card>

          {/* Projects Section */}
          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FolderGit2 className="w-5 h-5" />
                Projects
              </h2>
              {isEditMode && (
                <Button onClick={addProject} size="sm" variant="outline" className="border-slate-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Project
                </Button>
              )}
            </div>
            
            {isEditMode ? (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 border border-slate-700 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <Input
                          value={project.title}
                          onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                          className="bg-black border-slate-700 text-white"
                          placeholder="Project Title"
                        />
                        <Input
                          value={project.url}
                          onChange={(e) => updateProject(project.id, 'url', e.target.value)}
                          className="bg-black border-slate-700 text-white"
                          placeholder="Project URL"
                        />
                        <Textarea
                          value={project.description}
                          onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                          className="bg-black border-slate-700 text-white resize-none"
                          placeholder="Project Description"
                          rows={2}
                        />
                        <Input
                          value={project.tags.join(', ')}
                          onChange={(e) => updateProject(project.id, 'tags', e.target.value.split(',').map(t => t.trim()))}
                          className="bg-black border-slate-700 text-white"
                          placeholder="Tags (comma separated)"
                        />
                      </div>
                      <Button
                        onClick={() => removeProject(project.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {projects.length === 0 && (
                  <p className="text-slate-500 text-center py-4">No projects added yet</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="p-4 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
                    <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noopener noreferrer" 
                        className="text-blue-400 text-sm hover:underline">
                        {project.url}
                      </a>
                    )}
                    <p className="text-slate-300 mt-2">{project.description}</p>
                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {project.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {projects.length === 0 && (
                  <p className="text-slate-500 text-center py-4">No projects to display</p>
                )}
              </div>
            )}
          </Card>

          {/* Experience Section */}
          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Experience
              </h2>
              {isEditMode && (
                <Button onClick={addExperience} size="sm" variant="outline" className="border-slate-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Experience
                </Button>
              )}
            </div>
            
            {isEditMode ? (
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="p-4 border border-slate-700 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <Input
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          className="bg-black border-slate-700 text-white"
                          placeholder="Position"
                        />
                        <Input
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          className="bg-black border-slate-700 text-white"
                          placeholder="Company"
                        />
                        <Input
                          value={exp.duration}
                          onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                          className="bg-black border-slate-700 text-white"
                          placeholder="Duration (e.g., Jan 2023 - Present)"
                        />
                        <Textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                          className="bg-black border-slate-700 text-white resize-none"
                          placeholder="Description"
                          rows={2}
                        />
                      </div>
                      <Button
                        onClick={() => removeExperience(exp.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {experiences.length === 0 && (
                  <p className="text-slate-500 text-center py-4">No experience added yet</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="p-4 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{exp.position}</h3>
                        <p className="text-slate-400">{exp.company}</p>
                        <p className="text-slate-500 text-sm">{exp.duration}</p>
                        {exp.description && (
                          <p className="text-slate-300 mt-2">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {experiences.length === 0 && (
                  <p className="text-slate-500 text-center py-4">No experience to display</p>
                )}
              </div>
            )}
          </Card>

          {/* Education Section */}
          <Card className="bg-slate-900 border-slate-800 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </h2>
              {isEditMode && (
                <Button onClick={addEducation} size="sm" variant="outline" className="border-slate-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Education
                </Button>
              )}
            </div>
            
            {isEditMode ? (
              <div className="space-y-4">
                {educations.map((edu) => (
                  <div key={edu.id} className="p-4 border border-slate-700 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <Input
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          className="bg-black border-slate-700 text-white"
                          placeholder="Degree/Program"
                        />
                        <Input
                          value={edu.institution}
                          onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                          className="bg-black border-slate-700 text-white"
                          placeholder="Institution"
                        />
                        <Input
                          value={edu.duration}
                          onChange={(e) => updateEducation(edu.id, 'duration', e.target.value)}
                          className="bg-black border-slate-700 text-white"
                          placeholder="Duration (e.g., 2020 - 2024)"
                        />
                        <Textarea
                          value={edu.description}
                          onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                          className="bg-black border-slate-700 text-white resize-none"
                          placeholder="Description (optional)"
                          rows={2}
                        />
                      </div>
                      <Button
                        onClick={() => removeEducation(edu.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {educations.length === 0 && (
                  <p className="text-slate-500 text-center py-4">No education added yet</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {educations.map((edu) => (
                  <div key={edu.id} className="p-4 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{edu.degree}</h3>
                        <p className="text-slate-400">{edu.institution}</p>
                        <p className="text-slate-500 text-sm">{edu.duration}</p>
                        {edu.description && (
                          <p className="text-slate-300 mt-2">{edu.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {educations.length === 0 && (
                  <p className="text-slate-500 text-center py-4">No education to display</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
