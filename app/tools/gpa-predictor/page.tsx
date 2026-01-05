"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, TrendingUp } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { courseData } from "@/lib/gpa/course-data"
import { Course } from "@/lib/gpa/types"
import { calculateScore } from "@/lib/gpa/calculate-score"

interface GradePrediction {
  grade: string
  gradePoints: number
  requiredScore: number
  possible: boolean
}

export default function GPAPredictor() {
  const [selectedDegree, setSelectedDegree] = useState<"data-science" | "electronic-systems" | "">("")
  const [selectedLevel, setSelectedLevel] = useState<"foundation" | "diploma" | "degree" | "">("")
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [formValues, setFormValues] = useState<Record<string, number>>({})
  const [predictions, setPredictions] = useState<GradePrediction[]>([])

  const availableLevels = selectedDegree
    ? Array.from(new Set(courseData.filter((c) => c.degree === selectedDegree).map((c) => c.level)))
    : []

  const availableCourses = selectedDegree && selectedLevel
      ? courseData.filter((c) => c.degree === selectedDegree && c.level === selectedLevel)
      : []

  const calculateRequiredScore = (targetScore: number): number | null => {
    if (!selectedCourse) return null
    
    for (let f = 0; f <= 100; f += 0.1) {
      const testValues = { ...formValues, F: f }
      try {
        const calculatedScore = calculateScore(selectedCourse.id, testValues)
        if (calculatedScore >= targetScore) {
          return Math.ceil(f * 10) / 10
        }
      } catch {
        return null
      }
    }
    return null
  }

  const handlePredict = () => {
    if (!selectedCourse) return

    const gradeBoundaries = [
      { grade: "S", points: 10, minScore: 90 },
      { grade: "A", points: 9, minScore: 80 },
      { grade: "B", points: 8, minScore: 70 },
      { grade: "C", points: 7, minScore: 60 },
      { grade: "D", points: 6, minScore: 50 },
      { grade: "E", points: 4, minScore: 40 },
    ]

    const newPredictions: GradePrediction[] = gradeBoundaries.map((boundary) => {
      const required = calculateRequiredScore(boundary.minScore)
      return {
        grade: boundary.grade,
        gradePoints: boundary.points,
        requiredScore: required !== null ? required : 101,
        possible: required !== null && required <= 100,
      }
    })

    setPredictions(newPredictions)
  }

  return (
    <div className="min-h-screen">
      <Navbar isAuthenticated={false} />
      
      <div className="container mx-auto px-4 py-20">
        <Link 
          href="/tools"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-[#51b206] transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Tools
        </Link>

        <div className="text-center mb-12">
          <TrendingUp className="w-12 h-12 text-[#51b206] mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">GPA Predictor</h1>
          <p className="text-slate-400 text-lg">Predict what you need in your final exam</p>
        </div>

        <Card className="bg-black/80 backdrop-blur-sm border border-slate-800 shadow-2xl max-w-5xl mx-auto">
          <CardHeader className="border-b border-slate-800 pb-6">
            <CardTitle className="text-3xl">Predict Your Required Scores</CardTitle>
            <p className="text-slate-400 text-sm mt-2">Find out what you need in your final exam to achieve your target grade</p>
          </CardHeader>
          <CardContent className="space-y-8 pt-8">
            {/* Course Selection */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[#51b206]">Step 1: Select Course</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Degree Program</Label>
                  <Select value={selectedDegree} onValueChange={(v) => {
                    setSelectedDegree(v as any)
                    setSelectedLevel("")
                    setSelectedCourse(null)
                    setPredictions([])
                  }}>
                    <SelectTrigger className="h-11 bg-white/5 border-slate-700">
                      <SelectValue placeholder="Choose degree" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-slate-700">
                      <SelectItem value="data-science">Data Science</SelectItem>
                      <SelectItem value="electronic-systems">Electronic Systems</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Level</Label>
                  <Select value={selectedLevel} onValueChange={(v) => {
                    setSelectedLevel(v as any)
                    setSelectedCourse(null)
                    setPredictions([])
                  }} disabled={!selectedDegree}>
                    <SelectTrigger className="h-11 bg-white/5 border-slate-700">
                      <SelectValue placeholder="Choose level" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-slate-700">
                      {availableLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Course</Label>
                  <Select value={selectedCourse?.id || ""} onValueChange={(id) => {
                    const course = availableCourses.find((c) => c.id === id)
                    setSelectedCourse(course || null)
                    setFormValues({})
                    setPredictions([])
                  }} disabled={!selectedLevel}>
                    <SelectTrigger className="h-11 bg-white/5 border-slate-700">
                      <SelectValue placeholder="Choose course" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-slate-700">
                      {availableCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {selectedCourse && (
              <>
                {/* Score Entry */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[#51b206]">Step 2: Enter Current Scores</h3>
                  <div className="bg-white/5 border border-slate-800 rounded-lg p-6">
                    <p className="text-sm text-slate-400 mb-4">Enter all your scores excluding the final exam (F):</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedCourse.formFields.filter(f => f.id !== 'F').map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label className="text-sm font-medium flex justify-between">
                            <span>{field.label}</span>
                            <span className="text-slate-500 text-xs">Max: {field.max}</span>
                          </Label>
                          <Input
                            type="number"
                            placeholder={`Enter score (0 - ${field.max})`}
                            value={formValues[field.id] || ""}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(Number(e.target.value), field.max))
                              setFormValues({ ...formValues, [field.id]: val })
                            }}
                            className="h-11 bg-black/50 border-slate-700"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Predict Button */}
                <Button onClick={handlePredict} className="w-full h-12 bg-[#51b206] hover:bg-[#51b206]/90 text-base font-semibold">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Predict Required Scores
                </Button>

                {predictions.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold mb-2">Required Final Exam Scores</h3>
                      <p className="text-slate-400 text-sm">Based on your current scores, here's what you need in the final exam</p>
                    </div>
                    
                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-slate-800">
                      {/* Table Header */}
                      <div className="grid grid-cols-4 gap-4 bg-gradient-to-r from-[#3e3098] to-[#51b206] p-4">
                        <div className="text-center">
                          <p className="text-white font-bold text-sm uppercase tracking-wide">Target Grade</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold text-sm uppercase tracking-wide">Grade Points</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold text-sm uppercase tracking-wide">Required Score</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-bold text-sm uppercase tracking-wide">Status</p>
                        </div>
                      </div>
                      
                      {/* Table Rows */}
                      <div className="bg-black/50">
                        {predictions.map((pred, index) => (
                          <div
                            key={pred.grade}
                            className={`grid grid-cols-4 gap-4 p-4 border-b border-slate-800 hover:bg-white/5 transition-colors ${
                              index === predictions.length - 1 ? 'border-b-0' : ''
                            }`}
                          >
                            <div className="text-center flex items-center justify-center">
                              <span className="text-3xl font-bold text-white">{pred.grade}</span>
                            </div>
                            <div className="text-center flex items-center justify-center">
                              <div>
                                <p className="text-2xl font-bold text-slate-300">{pred.gradePoints}</p>
                                <p className="text-xs text-slate-500">points</p>
                              </div>
                            </div>
                            <div className="text-center flex items-center justify-center">
                              {pred.possible ? (
                                <div>
                                  <p className="text-3xl font-bold text-[#51b206]">{pred.requiredScore.toFixed(1)}%</p>
                                  <p className="text-xs text-slate-400">out of 100</p>
                                </div>
                              ) : (
                                <p className="text-lg font-semibold text-slate-600">---</p>
                              )}
                            </div>
                            <div className="text-center flex items-center justify-center">
                              {pred.possible ? (
                                pred.requiredScore <= 40 ? (
                                  <span className="px-4 py-2 bg-[#51b206]/20 border border-[#51b206]/50 text-[#51b206] rounded-full text-sm font-semibold">
                                    ✓ Easy
                                  </span>
                                ) : pred.requiredScore <= 70 ? (
                                  <span className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/50 text-yellow-500 rounded-full text-sm font-semibold">
                                    ⚡ Moderate
                                  </span>
                                ) : pred.requiredScore <= 90 ? (
                                  <span className="px-4 py-2 bg-orange-500/20 border border-orange-500/50 text-orange-500 rounded-full text-sm font-semibold">
                                    ⚠️ Challenging
                                  </span>
                                ) : (
                                  <span className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-full text-sm font-semibold">
                                    🔥 Very Hard
                                  </span>
                                )
                              ) : (
                                <span className="px-4 py-2 bg-slate-700/20 border border-slate-700 text-slate-400 rounded-full text-sm font-semibold">
                                  ✗ Not Possible
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="bg-white/5 border border-slate-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-slate-300 mb-3">📊 Score Difficulty Legend:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#51b206]"></span>
                          <span className="text-slate-400">0-40%: Easy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                          <span className="text-slate-400">41-70%: Moderate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                          <span className="text-slate-400">71-90%: Challenging</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-500"></span>
                          <span className="text-slate-400">91-100%: Very Hard</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  )
}
