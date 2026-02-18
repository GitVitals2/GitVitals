"use client"

import React, { useState, useEffect } from "react"
import { CheckCircle2, AlertTriangle, Activity, ChevronsUpDown, Check, User } from "lucide-react"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

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
  const [open, setOpen] = useState(false)
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
        {/* Patient Selection */}
        <Card className="border-border shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-foreground">Patient Selection</CardTitle>
                <CardDescription>Choose a patient to record vital signs</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <Label htmlFor="patient-combobox">Patient Name *</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="patient-combobox"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-11 text-left font-normal"
                  >
                    {selectedPatient ? (
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        {selectedPatient.name}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Select a patient...</span>
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search patient name..." />
                    <CommandList>
                      <CommandEmpty>No patient found.</CommandEmpty>
                      <CommandGroup>
                        {allPatients.map((patient) => (
                          <CommandItem
                            key={patient.id}
                            value={patient.name}
                            onSelect={() => {
                              setSelectedPatient(patient)
                              setOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedPatient?.id === patient.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {patient.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedPatient && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  <span>Selected: <strong className="text-foreground">{selectedPatient.name}</strong></span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vitals Measurements */}
        <Card className="border-border shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-foreground">Vitals Measurements</CardTitle>
                <CardDescription>Enter all measured vital signs with units</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {physicalFields.map((field) => (
                <div key={field.key} className="flex flex-col gap-2">
                  <Label htmlFor={field.key} className="text-sm font-medium text-foreground">
                    {field.label}
                    {field.unit && <span className="ml-1.5 text-muted-foreground">({field.unit})</span>}
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
              <div className="flex flex-col gap-2">
                <Label htmlFor="shoes" className="text-sm font-medium text-foreground">
                  Wearing Shoes
                </Label>
                <Select value={formValues.shoes} onValueChange={updateSelect("shoes")}
                >
                  <SelectTrigger id="shoes">
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
                  <Label htmlFor={field.key} className="text-sm font-medium text-foreground">
                    {field.label}
                    {field.unit && <span className="ml-1.5 text-muted-foreground">({field.unit})</span>}
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
              <Label htmlFor="blood_pressure" className="text-sm font-medium text-foreground">
                Blood Pressure (mmHg)
              </Label>
              <Input
                id="blood_pressure"
                type="text"
                required
                placeholder="120/80"
                value={formValues.blood_pressure}
                onChange={updateField("blood_pressure")}
              />
              <p className="text-xs text-muted-foreground">Format: Systolic/Diastolic (e.g., 120/80)</p>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto sm:self-end bg-primary hover:bg-primary/90"
        >
          <Activity className="mr-2 h-5 w-5" />
          Submit & Analyze Vitals
        </Button>
      </form>

      {/* Success Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
              <CheckCircle2 className="h-10 w-10 text-accent" />
            </div>
            <DialogTitle className="text-2xl text-foreground">Submission Complete</DialogTitle>
            <DialogDescription className="text-base">
              The vitals have been recorded successfully and analyzed by the system.
            </DialogDescription>
          </DialogHeader>
          {prediction && (
            <div className={`flex items-start gap-4 rounded-lg p-4 border ${
              prediction.pred_flag === 1 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }`}>
              <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${
                prediction.pred_flag === 1 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`} />
              <div>
                <p className="font-semibold text-foreground">
                  Risk Assessment: {prediction.pred_flag === 1 ? "High Risk" : "Low Risk"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  System Confidence: {(prediction.p_flag * 100).toFixed(2)}%
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
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
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
