"use client"

import React, { useState, useEffect } from "react"
import { Search, CheckCircle2, AlertTriangle, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type Patient = {
  id: string
  name: string
  age?: number | null
}

type FormValues = {
  height_ft: string
  weight_lb: string
  shoes: string
  spo2_pct: string
  temp_f: string
  heart_rate: string
  resp_rate: string
  blood_pressure: string
}

const initialValues: FormValues = {
  height_ft: "",
  weight_lb: "",
  shoes: "",
  spo2_pct: "",
  temp_f: "",
  heart_rate: "",
  resp_rate: "",
  blood_pressure: "",
}

const vitalFields: { key: keyof FormValues; label: string; placeholder: string; step?: string; unit?: string }[] = [
  { key: "spo2_pct", label: "SpO2", placeholder: "98", unit: "%" },
  { key: "temp_f", label: "Temperature", placeholder: "98.6", step: "0.1", unit: "F" },
  { key: "heart_rate", label: "Pulse", placeholder: "72", unit: "BPM" },
  { key: "resp_rate", label: "Respiration", placeholder: "16", unit: "RPM" },
]

const physicalFields: { key: keyof FormValues; label: string; placeholder: string; step?: string; unit?: string }[] = [
  { key: "height_ft", label: "Height", placeholder: "5.8", step: "0.1", unit: "feet" },
  { key: "weight_lb", label: "Weight", placeholder: "165", step: "0.1", unit: "lbs" },
]

export default function SubmitVitalsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [prediction, setPrediction] = useState<{ pred_flag: number; p_flag: number } | null>(null)
  const [formValues, setFormValues] = useState<FormValues>(initialValues)
  const [allPatients, setAllPatients] = useState<Patient[]>([])

  useEffect(() => {
    async function loadPatients() {
      try {
        const response = await fetch('/api/patients/list')
        if (response.ok) {
          const data = await response.json()
          setAllPatients(data.patients || [])
        }
      } catch (error) {
        console.error('Failed to load patients:', error)
      }
    }
    loadPatients()
  }, [])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (value.length > 0) {
      setFilteredPatients(allPatients.filter((p) => p.name.toLowerCase().includes(value.toLowerCase())))
    } else {
      setFilteredPatients([])
    }
  }

  const selectPatient = (p: Patient) => {
    setSelectedPatient(p)
    setSearchTerm(p.name)
    setFilteredPatients([])
  }

  const updateField = (key: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const updateSelect = (key: keyof FormValues) => (value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }

  const parseBloodPressure = (value: string) => {
    const parts = value.split("/").map((part) => Number(part.trim()))
    if (parts.length !== 2 || parts.some((part) => Number.isNaN(part) || part <= 0)) {
      return null
    }
    return { systolic: parts[0], diastolic: parts[1] }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedPatient) {
      alert('Please select a patient from the list')
      return
    }

    const userEmail = localStorage.getItem('gv-email')
    if (!userEmail) {
      alert('User session not found. Please log in again.')
      return
    }

    if (!formValues.shoes) {
      alert('Please select whether the patient is wearing shoes')
      return
    }

    const bloodPressure = parseBloodPressure(formValues.blood_pressure)
    if (!bloodPressure) {
      alert('Please enter blood pressure in the format 120/80')
      return
    }

    const heightValue = Number(formValues.height_ft)
    if (Number.isNaN(heightValue) || heightValue <= 0) {
      alert('Please enter a valid height in feet')
      return
    }

    const heightFeet = Math.floor(heightValue)
    const heightInches = Math.round((heightValue - heightFeet) * 12)

    const payload = {
      userEmail,
      patientName: selectedPatient.name,
      age_years: Number(selectedPatient.age ?? 0),
      heart_rate: Number(formValues.heart_rate),
      resp_rate: Number(formValues.resp_rate),
      temp_f: Number(formValues.temp_f),
      spo2_pct: Number(formValues.spo2_pct),
      systolic_bp: bloodPressure.systolic,
      diastolic_bp: bloodPressure.diastolic,
      height_ft: heightFeet,
      height_in: heightInches,
      weight_lb: Number(formValues.weight_lb),
      pain_0_10: 0,
    }

    try {
      const res = await fetch("/api/vitals/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Submission failed')
      }
      
      const data = await res.json()
      if (data?.prediction) {
        setPrediction({ pred_flag: data.prediction.pred_flag, p_flag: data.prediction.p_flag })
      }
      setShowModal(true)
      
      setFormValues(initialValues)
      setSearchTerm('')
      setSelectedPatient(null)
    } catch (error) {
      console.error("Submission error:", error)
      alert('Error submitting vitals: ' + error.message)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Activity className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Submit Patient Vitals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Record vital signs for a registered patient with automated risk assessment.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Patient Search */}
        <Card className="relative z-20 border-border shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-all hover:shadow-3xl backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-foreground font-bold">
              <Search className="h-6 w-6 text-teal-600" />
              Patient Selection
            </CardTitle>
            <CardDescription className="text-base">Search and select a patient to enter vitals for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Label htmlFor="patient-search" className="sr-only">
                Search patient
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  id="patient-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Start typing a patient name..."
                  className="pl-10 pr-4 py-6 text-base border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
              {filteredPatients.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-2">
                  {filteredPatients.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPatient(p)}
                      className="flex w-full items-center gap-3 px-5 py-3.5 text-left text-base font-medium text-foreground transition-colors hover:bg-teal-50 dark:hover:bg-teal-900/20 border-b last:border-b-0 border-slate-100 dark:border-slate-700"
                    >
                      <CheckCircle2 className="h-5 w-5 text-teal-600" />
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
              {selectedPatient && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-2 border-teal-200 dark:border-teal-800 px-5 py-4 shadow-lg shadow-teal-500/10">
                  <CheckCircle2 className="h-6 w-6 text-teal-600 flex-shrink-0" />
                  <p className="text-base font-bold text-teal-700 dark:text-teal-300">
                    Selected: {selectedPatient.name}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vitals Measurements */}
        <Card className="border-border shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-all hover:shadow-3xl backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-foreground font-bold">
              <Activity className="h-6 w-6 text-teal-600" />
              Vitals Measurements
            </CardTitle>
            <CardDescription className="text-base">Enter all measured vital signs with units</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {physicalFields.map((field) => (
                <div key={field.key} className="flex flex-col gap-2">
                  <Label htmlFor={field.key} className="text-sm font-semibold text-foreground">
                    {field.label}
                    {field.unit && <span className="ml-1.5 text-muted-foreground font-medium">({field.unit})</span>}
                  </Label>
                  <Input
                    id={field.key}
                    type="number"
                    step={field.step}
                    required
                    placeholder={field.placeholder}
                    value={formValues[field.key]}
                    onChange={updateField(field.key)}
                    className="transition-all py-3 text-base border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              ))}
              <div className="flex flex-col gap-2">
                <Label htmlFor="shoes" className="text-sm font-semibold text-foreground">
                  Wearing Shoes
                </Label>
                <Select value={formValues.shoes} onValueChange={updateSelect("shoes")}
                >
                  <SelectTrigger id="shoes" className="h-12 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="with">With shoes</SelectItem>
                    <SelectItem value="without">Without shoes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {vitalFields.map((field) => (
                <div key={field.key} className="flex flex-col gap-2">
                  <Label htmlFor={field.key} className="text-sm font-semibold text-foreground">
                    {field.label}
                    {field.unit && <span className="ml-1.5 text-muted-foreground font-medium">({field.unit})</span>}
                  </Label>
                  <Input
                    id={field.key}
                    type="number"
                    step={field.step}
                    required
                    placeholder={field.placeholder}
                    value={formValues[field.key]}
                    onChange={updateField(field.key)}
                    className="transition-all py-3 text-base border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <Label htmlFor="blood_pressure" className="text-sm font-semibold text-foreground">
                Blood Pressure (mmHg)
              </Label>
              <Input
                id="blood_pressure"
                type="text"
                required
                placeholder="120/80"
                value={formValues.blood_pressure}
                onChange={updateField("blood_pressure")}
                className="transition-all py-3 text-base border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          size="lg"
          className="w-full py-6 text-lg font-bold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-xl shadow-teal-500/30 transition-all duration-200 hover:shadow-2xl hover:shadow-teal-500/40 hover:-translate-y-1 rounded-xl sm:w-auto sm:self-end"
        >
          <Activity className="mr-2 h-6 w-6" />
          Submit & Analyze Vitals
        </Button>
      </form>

      {/* Success Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md backdrop-blur-sm bg-white/95 dark:bg-slate-800/95 border-2">
          <DialogHeader className="items-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/30">
              <CheckCircle2 className="h-9 w-9 text-white animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-bold">Submission Complete</DialogTitle>
            <DialogDescription className="text-base">
              The vitals have been recorded successfully and analyzed by the system.
            </DialogDescription>
          </DialogHeader>
          {prediction && (
            <div className={`flex items-start gap-4 rounded-xl p-5 border-2 ${
              prediction.pred_flag === 1 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                : 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800'
            }`}>
              <AlertTriangle className={`h-6 w-6 shrink-0 mt-0.5 ${
                prediction.pred_flag === 1 ? 'text-red-600 dark:text-red-400' : 'text-teal-600 dark:text-teal-400'
              }`} />
              <div>
                <p className="text-base font-bold text-foreground">
                  Risk Assessment: {prediction.pred_flag === 1 ? "High Risk" : "Low Risk"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground font-medium">
                  System Confidence: {(prediction.p_flag * 100).toFixed(2)}%
                </p>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {prediction.pred_flag === 1 
                    ? "The vitals indicate elevated risk. Consider immediate clinical review." 
                    : "The vitals appear within normal ranges based on analysis."}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={() => setShowModal(false)} 
              className="w-full py-3 text-base font-semibold bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-lg shadow-teal-500/30"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
