"use client";

import React from "react";

import { useState } from "react";
import { CheckCircle2, Info, UserPlus, Activity, Ruler } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import Link from "next/link";

type FormData = {
  patientName: string;
  patientDOB: string;
  patientGender: string;
  patientRelationship: string;
  height: string;
  weight: string;
  shoes: string;
  pulseOximetry: string;
  temperature: string;
  pulse: string;
  respiration: string;
  bloodPressure: string;
};

const initialData: FormData = {
  patientName: "",
  patientDOB: "",
  patientGender: "",
  patientRelationship: "",
  height: "",
  weight: "",
  shoes: "",
  pulseOximetry: "",
  temperature: "",
  pulse: "",
  respiration: "",
  bloodPressure: ""
};

export default function RegisterPatientPage() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialData);

  const handleChange = (key: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const patientAge = Math.floor(
      (new Date().getTime() - new Date(formData.patientDOB).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
    );

    const patientData = {
      student_id: null,
      name: formData.patientName,
      relationship: formData.patientRelationship,
      age: patientAge,
      gender: formData.patientGender
    };

    const token = localStorage.getItem("gv-token");

    const patientRegisterResponse = await fetch("/api/patient/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(patientData)
    });

    if (!patientRegisterResponse.ok) {
      const errorData = await patientRegisterResponse.json();
      alert("Error registering patient: " + errorData.message);
      return;
    }

    const {
      data: { id: patientId }
    } = await patientRegisterResponse.json();

    const [systolic, diastolic] = formData.bloodPressure.split("/").map(v => parseInt(v) || 0);

    const saveCorrectVitalsResponse = await fetch(`/api/patient/${patientId}/correct-vitals`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        bloodPressureSys: systolic,
        bloodPressureDia: diastolic,
        heartRate: parseInt(formData.pulse) || 0,
        temperature: parseFloat(formData.temperature),
        respiratoryRate: parseInt(formData.respiration) || 0,
        oxygenSaturation: parseInt(formData.pulseOximetry) || 0
      })
    });

    if (!saveCorrectVitalsResponse.ok) {
      const errorData = await saveCorrectVitalsResponse.json();
      alert("Error saving correct vitals: " + errorData.message);
      return;
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData(initialData);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            Register Patient & Correct Vitals
          </h1>
          <p className="text-muted-foreground text-lg">
            Teacher Portal — Add patients with reference vital signs for student evaluations.
          </p>
        </div>

        <Alert className="mb-6 border-primary/30 bg-accent/10">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            Register the patient with correct vital signs. Students will use these values as a reference baseline.
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Patient Information */}
          <Card className="border-border shadow-md">
            <CardHeader className="pb-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-foreground">Patient Information</CardTitle>
                  <CardDescription>Basic patient identification details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="patientName">Patient Name *</Label>
                  <Input
                    id="patientName"
                    type="text"
                    required
                    placeholder="Full name"
                    value={formData.patientName}
                    onChange={e => handleChange("patientName", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="patientDOB">Date of Birth *</Label>
                  <Input
                    id="patientDOB"
                    type="date"
                    required
                    value={formData.patientDOB}
                    onChange={e => handleChange("patientDOB", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="patientGender">Gender *</Label>
                  <Select 
                    value={formData.patientGender} 
                    onValueChange={value => handleChange("patientGender", value)} 
                    required
                  >
                    <SelectTrigger id="patientGender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="patientRelationship">Relationship</Label>
                  <Input
                    id="patientRelationship"
                    type="text"
                    placeholder="e.g., Family, Friend"
                    value={formData.patientRelationship}
                    onChange={e => handleChange("patientRelationship", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Measurements */}
          <Card className="border-border shadow-md">
            <CardHeader className="pb-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <Ruler className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-foreground">Physical Measurements</CardTitle>
                  <CardDescription>Record the patient&apos;s physical attributes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="height">Height (feet) *</Label>
                  <Input
                    id="height"
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 5.8"
                    value={formData.height}
                    onChange={e => handleChange("height", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="weight">Weight (lbs) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 165"
                    value={formData.weight}
                    onChange={e => handleChange("weight", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="shoes">Wearing Shoes *</Label>
                  <Select value={formData.shoes} onValueChange={value => handleChange("shoes", value)} required>
                    <SelectTrigger id="shoes">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="with">With shoes</SelectItem>
                      <SelectItem value="without">Without shoes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Correct Vital Signs */}
          <Card className="border-border shadow-md">
            <CardHeader className="pb-4 bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg text-foreground">Correct Vital Signs (Reference)</CardTitle>
                  <CardDescription>Enter the correct baseline values for grading</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pulseOximetry">SpO₂ (%) *</Label>
                  <Input
                    id="pulseOximetry"
                    type="number"
                    required
                    placeholder="e.g. 98"
                    min="0"
                    max="100"
                    value={formData.pulseOximetry}
                    onChange={e => handleChange("pulseOximetry", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="temperature">Temperature (°F) *</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 98.6"
                    value={formData.temperature}
                    onChange={e => handleChange("temperature", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pulse">Pulse (BPM) *</Label>
                  <Input
                    id="pulse"
                    type="number"
                    required
                    placeholder="e.g. 72"
                    value={formData.pulse}
                    onChange={e => handleChange("pulse", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="respiration">Respiration (RPM) *</Label>
                  <Input
                    id="respiration"
                    type="number"
                    required
                    placeholder="e.g. 16"
                    value={formData.respiration}
                    onChange={e => handleChange("respiration", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="bloodPressure">Blood Pressure (Systolic/Diastolic) *</Label>
                  <Input
                    id="bloodPressure"
                    type="text"
                    required
                    placeholder="e.g. 120/80"
                    value={formData.bloodPressure}
                    onChange={e => handleChange("bloodPressure", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Format: Systolic/Diastolic (e.g., 120/80)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4 flex-col sm:flex-row sm:justify-end">
            <Link href="/dashboard">
              <Button type="button" variant="outline" size="lg" className="w-full sm:w-auto">
                Cancel
              </Button>
            </Link>
            <Button type="submit" size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              Confirm and Register Patient
            </Button>
          </div>
        </form>

      {/* Success Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
              <CheckCircle2 className="h-10 w-10 text-accent" />
            </div>
            <DialogTitle className="text-2xl text-foreground">Registration Successful</DialogTitle>
            <DialogDescription className="text-base">
              The patient has been registered with reference vitals.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient</span>
                <span className="font-semibold text-foreground">{formData.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Blood Pressure</span>
                <span className="font-semibold text-foreground">{formData.bloodPressure} mmHg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temperature</span>
                <span className="font-semibold text-foreground">{formData.temperature}°F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pulse</span>
                <span className="font-semibold text-foreground">{formData.pulse} BPM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">SpO₂</span>
                <span className="font-semibold text-foreground">{formData.pulseOximetry}%</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={closeModal} className="w-full bg-primary hover:bg-primary/90" size="lg">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
