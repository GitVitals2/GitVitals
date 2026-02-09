"use client"

import React from "react"

import { useState } from "react"
import { Search, CheckCircle2, AlertTriangle } from "lucide-react"
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

const patients = [
  { id: 1, name: "John Smith" },
  { id: 2, name: "Mary Johnson" },
  { id: 3, name: "Robert Williams" },
  { id: 4, name: "Patricia Brown" },
  { id: 5, name: "Michael Davis" },
]

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

const fields: { key: keyof FormValues; label: string; placeholder: string; step?: string }[] = [
  { key: "age_years", label: "Age (years)", placeholder: "e.g. 35" },
  { key: "heart_rate", label: "Heart Rate (bpm)", placeholder: "e.g. 72" },
  { key: "resp_rate", label: "Respiratory Rate (rpm)", placeholder: "e.g. 16" },
  { key: "temp_f", label: "Temperature (F)", placeholder: "e.g. 98.6", step: "0.1" },
  { key: "spo2_pct", label: "Pulse Oximetry (%)", placeholder: "e.g. 98" },
  { key: "pain_0_10", label: "Pain (0-10)", placeholder: "e.g. 3" },
  { key: "systolic_bp", label: "Systolic BP (mmHg)", placeholder: "e.g. 120" },
  { key: "diastolic_bp", label: "Diastolic BP (mmHg)", placeholder: "e.g. 80" },
  { key: "height_ft", label: "Height (ft)", placeholder: "e.g. 5" },
  { key: "height_in", label: "Height (in)", placeholder: "e.g. 10" },
  { key: "weight_lb", label: "Weight (lb)", placeholder: "e.g. 165" },
]

export default function SubmitVitalsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPatients, setFilteredPatients] = useState<typeof patients>([])
  const [selectedPatient, setSelectedPatient] = useState<(typeof patients)[0] | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [prediction, setPrediction] = useState<{ pred_flag: number; p_flag: number } | null>(null)
  const [formValues, setFormValues] = useState<FormValues>(initialValues)

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    if (value.length > 0) {
      setFilteredPatients(patients.filter((p) => p.name.toLowerCase().includes(value.toLowerCase())))
    } else {
      setFilteredPatients([])
    }
  }

  const selectPatient = (p: (typeof patients)[0]) => {
    setSelectedPatient(p)
    setSearchTerm(p.name)
    setFilteredPatients([])
  }

  const updateField = (key: keyof FormValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return

    const payload = Object.fromEntries(
      Object.entries(formValues).map(([k, v]) => [k, Number(v)])
    )

    try {
      const res = await fetch("/api/vitals/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data?.prediction) {
        setPrediction({ pred_flag: data.prediction.pred_flag, p_flag: data.prediction.p_flag })
      }
      setShowModal(true)
    } catch {
      setShowModal(true)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Submit Patient Vitals</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Record vital signs for a registered patient. All fields are required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Patient Selection */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Patient Selection</CardTitle>
            <CardDescription>Search and select the patient you are examining</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Label htmlFor="patient-search" className="sr-only">
                Search patient
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="patient-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Start typing a patient name..."
                  className="pl-9"
                />
              </div>
              {filteredPatients.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-lg border border-border bg-card shadow-md">
                  {filteredPatients.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => selectPatient(p)}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
              {selectedPatient && (
                <p className="mt-2 text-sm text-primary">
                  Selected: <span className="font-medium">{selectedPatient.name}</span>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vitals Measurements */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Vitals Measurements</CardTitle>
            <CardDescription>Enter all measured vital signs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.key} className="flex flex-col gap-1.5">
                  <Label htmlFor={field.key} className="text-sm">
                    {field.label}
                  </Label>
                  <Input
                    id={field.key}
                    type="number"
                    step={field.step}
                    required
                    placeholder={field.placeholder}
                    value={formValues[field.key]}
                    onChange={updateField(field.key)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto sm:self-end"
          disabled={!selectedPatient}
        >
          Submit Vitals
        </Button>
      </form>

      {/* Success Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle>Submission Complete</DialogTitle>
            <DialogDescription>
              The vitals have been recorded successfully.
            </DialogDescription>
          </DialogHeader>
          {prediction && (
            <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
              <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Risk Level: {prediction.pred_flag === 1 ? "High" : "Low"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Probability: {prediction.p_flag.toFixed(4)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowModal(false)} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
