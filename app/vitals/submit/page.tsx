'use client';

import React, { useState, useEffect } from 'react';

export default function SubmitVitalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<{id: number, name: string}[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<{id: number, name: string} | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [validation, setValidation] = useState<Record<string, string>>({});
  const [prediction, setPrediction] = useState<{ pred_flag: number; p_flag: number } | null>(null);

  const [formValues, setFormValues] = useState({
    age_years: '',
    heart_rate: '',
    resp_rate: '',
    temp_f: '',
    spo2_pct: '',
    systolic_bp: '',
    diastolic_bp: '',
    height_ft: '',
    height_in: '',
    weight_lb: '',
    pain_0_10: '',
  });

  // Mock de pacientes (Isso viria do seu banco via Prisma no futuro)
  const patients = [
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Mary Johnson' },
    { id: 3, name: 'Robert Williams' },
    { id: 4, name: 'Patricia Brown' },
    { id: 5, name: 'Michael Davis' }
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 0) {
      setFilteredPatients(patients.filter(p => p.name.toLowerCase().includes(value.toLowerCase())));
    } else {
      setFilteredPatients([]);
    }
  };

  const selectPatient = (p: {id: number, name: string}) => {
    setSelectedPatient(p);
    setSearchTerm(p.name);
    setFilteredPatients([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return alert('Selecione um paciente');

    setValidation({});
    setPrediction(null);

    const payload = {
      age_years: Number(formValues.age_years),
      heart_rate: Number(formValues.heart_rate),
      resp_rate: Number(formValues.resp_rate),
      temp_f: Number(formValues.temp_f),
      spo2_pct: Number(formValues.spo2_pct),
      systolic_bp: Number(formValues.systolic_bp),
      diastolic_bp: Number(formValues.diastolic_bp),
      height_ft: Number(formValues.height_ft),
      height_in: Number(formValues.height_in),
      weight_lb: Number(formValues.weight_lb),
      pain_0_10: Number(formValues.pain_0_10),
    };

    try {
      const res = await fetch('/api/vitals/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Erro ao enviar os dados');

      if (data?.prediction) {
        setPrediction({ pred_flag: data.prediction.pred_flag, p_flag: data.prediction.p_flag });
      }

      setShowModal(true);
    } catch (error: any) {
      alert(error?.message || 'Erro ao enviar os dados');
    }
  };

  const updateField = (key: keyof typeof formValues) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues(prev => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          color: 'white', padding: '25px', borderRadius: '15px', marginBottom: '30px' 
        }}>
          <h1 style={{ margin: 0, fontSize: '28px' }}>Submit Patient Vitals</h1>
          <p style={{ opacity: 0.9 }}>Student Portal - Clinical Management System</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Patient Selection */}
          <div style={cardStyle}>
            <h2 style={titleStyle}>Patient Selection</h2>
            <div style={{ position: 'relative' }}>
              <label style={labelStyle}>Search Patient Name</label>
              <input 
                type="text" 
                value={searchTerm} 
                onChange={handleSearch} 
                placeholder="Start typing..." 
                style={inputStyle} 
              />
              {filteredPatients.length > 0 && (
                <div style={autocompleteStyle}>
                  {filteredPatients.map(p => (
                    <div key={p.id} onClick={() => selectPatient(p)} style={itemStyle}>{p.name}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Vitals Check Info */}
          <div style={cardStyle}>
            <h2 style={titleStyle}>Vitals Measurements</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={labelStyle}>Age (years)</label>
                <input type="number" required style={inputStyle} value={formValues.age_years} onChange={updateField('age_years')} />
              </div>
              <div>
                <label style={labelStyle}>Heart Rate (bpm)</label>
                <input type="number" required style={inputStyle} value={formValues.heart_rate} onChange={updateField('heart_rate')} />
              </div>
              <div>
                <label style={labelStyle}>Respiratory Rate (rpm)</label>
                <input type="number" required style={inputStyle} value={formValues.resp_rate} onChange={updateField('resp_rate')} />
              </div>
              <div>
                <label style={labelStyle}>Temperature (°F)</label>
                <input type="number" step="0.1" required style={inputStyle} value={formValues.temp_f} onChange={updateField('temp_f')} />
              </div>
              <div>
                <label style={labelStyle}>Pulse Oximetry (%)</label>
                <input type="number" required style={inputStyle} value={formValues.spo2_pct} onChange={updateField('spo2_pct')} />
              </div>
              <div>
                <label style={labelStyle}>Pain (0-10)</label>
                <input type="number" required style={inputStyle} value={formValues.pain_0_10} onChange={updateField('pain_0_10')} />
              </div>
              <div>
                <label style={labelStyle}>Systolic BP (mmHg)</label>
                <input type="number" required style={inputStyle} value={formValues.systolic_bp} onChange={updateField('systolic_bp')} />
              </div>
              <div>
                <label style={labelStyle}>Diastolic BP (mmHg)</label>
                <input type="number" required style={inputStyle} value={formValues.diastolic_bp} onChange={updateField('diastolic_bp')} />
              </div>
              <div>
                <label style={labelStyle}>Height (ft)</label>
                <input type="number" required style={inputStyle} value={formValues.height_ft} onChange={updateField('height_ft')} />
              </div>
              <div>
                <label style={labelStyle}>Height (in)</label>
                <input type="number" required style={inputStyle} value={formValues.height_in} onChange={updateField('height_in')} />
              </div>
              <div>
                <label style={labelStyle}>Weight (lb)</label>
                <input type="number" required style={inputStyle} value={formValues.weight_lb} onChange={updateField('weight_lb')} />
              </div>
            </div>
          </div>

          <button type="submit" style={btnStyle}>Submit Vitals</button>
        </form>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ fontSize: '50px', color: '#28a745' }}>✓</div>
            <h2>Submission Complete!</h2>
            <p>The submitted vitals are complete and recorded.</p>
            {prediction && (
              <p style={{ marginTop: '10px' }}>
                Risk: <strong>{prediction.pred_flag === 1 ? 'High' : 'Low'}</strong> — Probability: {prediction.p_flag.toFixed(4)}
              </p>
            )}
            <button onClick={() => setShowModal(false)} style={btnStyle}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos rápidos convertidos do original
const cardStyle: React.CSSProperties = { background: 'white', borderRadius: '15px', padding: '30px', marginBottom: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' };
const titleStyle: React.CSSProperties = { fontSize: '18px', borderBottom: '2px solid #667eea', paddingBottom: '10px', marginBottom: '20px' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none' };
const btnStyle: React.CSSProperties = { width: '100%', padding: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const autocompleteStyle: React.CSSProperties = { position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '2px solid #667eea', zIndex: 10 };
const itemStyle: React.CSSProperties = { padding: '10px', cursor: 'pointer' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
const modalContentStyle: React.CSSProperties = { background: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', maxWidth: '400px' };
