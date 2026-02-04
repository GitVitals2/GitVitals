'use client';

import React, { useState } from 'react';

export default function RegisterPatientPage() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(() => {
    const now = new Date();
    return {
      patientName: '',
      patientDOB: '',
      checkDate: now.toISOString().split('T')[0],
      checkTime: now.toTimeString().slice(0, 5),
      height: '',
      weight: '',
      shoes: '',
      pulseOximetry: '',
      temperature: '',
      pulse: '',
      respiration: '',
      bloodPressure: ''
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui no futuro você conectará com o Prisma/API para salvar o paciente
    console.log('Registrando paciente:', formData);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    if (confirm('Deseja registrar outro paciente?')) {
      window.location.reload();
    }
  };

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={headerStyle}>
          <h1 style={{ margin: 0, fontSize: '28px' }}>Register Patient & Correct Vitals</h1>
          <p style={{ opacity: 0.9 }}>Teacher Portal - Clinical Management System</p>
        </div>

        <div style={infoBoxStyle}>
          <p>📋 <strong>Nota:</strong> Cadastre o paciente com os sinais vitais corretos. Os alunos usarão estes dados como referência.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Informações Pessoais */}
          <div style={cardStyle}>
            <h2 style={titleStyle}>👤 Patient Information</h2>
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Patient Name *</label>
              <input type="text" id="patientName" required style={inputStyle} onChange={handleChange} />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Date of Birth *</label>
              <input type="date" id="patientDOB" required style={inputStyle} onChange={handleChange} />
            </div>
          </div>

          {/* Medições Físicas */}
          <div style={cardStyle}>
            <h2 style={titleStyle}>📏 Physical Measurements</h2>
            <div style={grid2Style}>
              <div>
                <label style={labelStyle}>Height (feet) *</label>
                <input type="number" id="height" step="0.1" required style={inputStyle} onChange={handleChange} />
              </div>
              <div>
                <label style={labelStyle}>Weight (lbs) *</label>
                <input type="number" id="weight" step="0.1" required style={inputStyle} onChange={handleChange} />
              </div>
            </div>
            <div style={{ marginTop: '15px' }}>
              <label style={labelStyle}>Wearing Shoes *</label>
              <select id="shoes" required style={inputStyle} onChange={handleChange}>
                <option value="">Select...</option>
                <option value="with">With shoes</option>
                <option value="without">Without shoes</option>
              </select>
            </div>
          </div>

          {/* Sinais Vitais de Referência */}
          <div style={cardStyle}>
            <h2 style={titleStyle}>❤️ Correct Vital Signs (Reference)</h2>
            <div style={grid2Style}>
              <input type="number" id="pulseOximetry" placeholder="SpO2 %" required style={inputStyle} onChange={handleChange} />
              <input type="number" id="temperature" placeholder="Temp °F" required style={inputStyle} onChange={handleChange} />
              <input type="number" id="pulse" placeholder="Pulse BPM" required style={inputStyle} onChange={handleChange} />
              <input type="number" id="respiration" placeholder="Resp RPM" required style={inputStyle} onChange={handleChange} />
            </div>
            <input type="text" id="bloodPressure" placeholder="Blood Pressure (120/80)" required style={{ ...inputStyle, marginTop: '15px' }} onChange={handleChange} />
          </div>

          <button type="submit" style={btnStyle}>Confirm and Register Patient</button>
        </form>
      </div>

      {/* Modal de Sucesso */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ fontSize: '50px', color: '#28a745' }}>✓</div>
            <h2>Registration Successful!</h2>
            <div style={{ textAlign: 'left', background: '#f8f9fa', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
              <p><strong>Paciente:</strong> {formData.patientName}</p>
              <p><strong>Pressão:</strong> {formData.bloodPressure} mmHg</p>
              <p><strong>Temp:</strong> {formData.temperature} °F</p>
            </div>
            <button onClick={closeModal} style={btnStyle}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Estilos
const headerStyle: React.CSSProperties = { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '25px', borderRadius: '15px', marginBottom: '20px' };
const infoBoxStyle: React.CSSProperties = { background: '#e7f3ff', borderLeft: '4px solid #2196f3', padding: '15px', borderRadius: '8px', marginBottom: '25px' };
const cardStyle: React.CSSProperties = { background: 'white', borderRadius: '15px', padding: '30px', marginBottom: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' };
const titleStyle: React.CSSProperties = { fontSize: '18px', borderBottom: '2px solid #667eea', paddingBottom: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555', fontWeight: 'bold' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none', marginBottom: '5px' };
const grid2Style: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' };
const btnStyle: React.CSSProperties = { width: '100%', padding: '15px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const modalOverlayStyle: React.CSSProperties = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 };
const modalContentStyle: React.CSSProperties = { background: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', maxWidth: '450px', width: '90%' };
