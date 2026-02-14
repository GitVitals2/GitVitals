"use client";

import React from "react";

import { useState } from "react";
import { CheckCircle2, Info } from "lucide-react";
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
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Register Patient & Correct Vitals
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Teacher Portal — Add patients with reference vital signs for student evaluations.
        </p>
      </div>

      <Alert className="border-primary/20 bg-accent">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-accent-foreground">
          Register the patient with correct vital signs. Students will use these values as a reference baseline.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Patient Information */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Patient Information</CardTitle>
            <CardDescription>Basic patient identification details</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="patientName">Patient Name</Label>
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
              <Label htmlFor="patientDOB">Date of Birth</Label>
              <Input
                id="patientDOB"
                type="date"
                required
                value={formData.patientDOB}
                onChange={e => handleChange("patientDOB", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Physical Measurements */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Physical Measurements</CardTitle>
            <CardDescription>Record the patient&apos;s physical attributes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="height">Height (feet)</Label>
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
                <Label htmlFor="weight">Weight (lbs)</Label>
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
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              <Label htmlFor="shoes">Wearing Shoes</Label>
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
          </CardContent>
        </Card>

        {/* Correct Vital Signs */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-foreground">Correct Vital Signs (Reference)</CardTitle>
            <CardDescription>Enter the correct baseline values for grading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pulseOximetry">SpO2 (%)</Label>
                <Input
                  id="pulseOximetry"
                  type="number"
                  required
                  placeholder="e.g. 98"
                  value={formData.pulseOximetry}
                  onChange={e => handleChange("pulseOximetry", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="temperature">Temperature (F)</Label>
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
                <Label htmlFor="pulse">Pulse (BPM)</Label>
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
                <Label htmlFor="respiration">Respiration (RPM)</Label>
                <Input
                  id="respiration"
                  type="number"
                  required
                  placeholder="e.g. 16"
                  value={formData.respiration}
                  onChange={e => handleChange("respiration", e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-1.5">
              <Label htmlFor="bloodPressure">Blood Pressure</Label>
              <Input
                id="bloodPressure"
                type="text"
                required
                placeholder="e.g. 120/80"
                value={formData.bloodPressure}
                onChange={e => handleChange("bloodPressure", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full sm:w-auto sm:self-end">
          Confirm and Register Patient
        </Button>
      </form>

      {/* Success Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="items-center text-center">
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle>Registration Successful</DialogTitle>
            <DialogDescription>The patient has been registered with reference vitals.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted p-4 text-sm">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient</span>
                <span className="font-medium text-foreground">{formData.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Blood Pressure</span>
                <span className="font-medium text-foreground">{formData.bloodPressure} mmHg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Temperature</span>
                <span className="font-medium text-foreground">{formData.temperature} F</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={closeModal} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
