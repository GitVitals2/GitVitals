"use client"

import React, { useState, useEffect } from "react"
import { Search, CheckCircle2, AlertTriangle, Activity } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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
}

type FormValues = {
  age_years: string
  heart_rate: string
  resp_rate: string
  temp_f: string
  spo2_pct: string
  systolic_bp: string
  diastolic_bp: string
  height_ft: string
  height_in: string
  weight_lb: string
  pain_0_10: string
}

const initialValues: FormValues = {
  age_years: "",
  heart_rate: "",
  resp_rate: "",
  temp_f: "",
  spo2_pct: "",
  systolic_bp: "",
  diastolic_bp: "",
  height_ft: "",
  height_in: "",
  weight_lb: "",
  pain_0_10: "",
}

const fields: { key: keyof FormValues; label: string; placeholder: string; step?: string; unit?: string }[] = [
  { key: "age_years", label: "Age", placeholder: "35", unit: "years" },
  { key: "heart_rate", label: "Heart Rate", placeholder: "72", unit: "bpm" },
  { key: "resp_rate", label: "Respiratory Rate", placeholder: "16", unit: "rpm" },
  { key: "temp_f", label: "Temperature", placeholder: "98.6", step: "0.1", unit: "°F" },
  { key: "spo2_pct", label: "Pulse Oximetry", placeholder: "98", unit: "%" },
  { key: "pain_0_10", label: "Pain Level", placeholder: "3", unit: "0-10" },
  { key: "systolic_bp", label: "Systolic BP", placeholder: "120", unit: "mmHg" },
  { key: "diastolic_bp", label: "Diastolic BP", placeholder: "80", unit: "mmHg" },
  { key: "height_ft", label: "Height (ft)", placeholder: "5", unit: "ft" },
  { key: "height_in", label: "Height (in)", placeholder: "10", unit: "in" },
  { key: "weight_lb", label: "Weight", placeholder: "165", unit: "lb" },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchTerm || searchTerm.trim().length === 0) {
      alert('Please enter a patient name')
      return
    }

    const userEmail = localStorage.getItem('gv-email')
    if (!userEmail) {
      alert('User session not found. Please log in again.')
      return
    }

    const payload = {
      userEmail,
      patientName: searchTerm.trim(),
      ...Object.fromEntries(
        Object.entries(formValues).map(([k, v]) => [k, Number(v)])
      )
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
        <Card className="border-border shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50 transition-all hover:shadow-3xl backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 animate-in fade-in slide-in-from-bottom-8 duration-700">
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
                <div className="absolute left-0 right-0 top-full z-10 mt-2 overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-2">
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
              {fields.map((field) => (
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
