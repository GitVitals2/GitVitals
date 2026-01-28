'use client';

import React, { useState, useEffect } from 'react';

export default function SubmitVitalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<{id: number, name: string}[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<{id: number, name: string} | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [validation, setValidation] = useState<Record<string, string>>({});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return alert('Selecione um paciente');

    // Simulação de Validação do Backend
    const mockValidation = {
      dob: Math.random() > 0.2 ? 'OK' : 'NOK',
      height: Math.random() > 0.2 ? 'OK' : 'NOK',
      weight: Math.random() > 0.2 ? 'OK' : 'NOK',
      oximetry: Math.random() > 0.2 ? 'OK' : 'NOK',
      temperature: Math.random() > 0.2 ? 'OK' : 'NOK',
      bp: Math.random() > 0.2 ? 'OK' : 'NOK',
    };
    
    setValidation(mockValidation);

    const allOk = Object.values(mockValidation).every(v => v === 'OK');
    if (allOk) setShowModal(true);
    else alert('Alguns sinais estão fora do padrão. Verifique os campos marcados com X.');
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
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Temperature (°F)</label>
                <input type="number" step="0.1" required style={inputStyle} />
                <span style={{ position: 'absolute', right: '10px', top: '35px', color: validation.temperature === 'OK' ? 'green' : 'red' }}>
                  {validation.temperature === 'OK' ? '✓' : validation.temperature === 'NOK' ? '✗' : ''}
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <label style={labelStyle}>Pulse Oximetry (%)</label>
                <input type="number" required style={inputStyle} />
                <span style={{ position: 'absolute', right: '10px', top: '35px', color: validation.oximetry === 'OK' ? 'green' : 'red' }}>
                  {validation.oximetry === 'OK' ? '✓' : validation.oximetry === 'NOK' ? '✗' : ''}
                </span>
              </div>
            </div>
            <div style={{ marginTop: '20px', position: 'relative' }}>
              <label style={labelStyle}>Blood Pressure (mmHg)</label>
              <input type="text" placeholder="120/80" required style={inputStyle} />
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
