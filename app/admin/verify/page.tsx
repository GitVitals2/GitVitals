'use client';

import React, { useState } from 'react';

// Mock de dados (No futuro virão do Prisma/Banco de Dados)
const MOCK_CORRECT = {
  dob: '1985-03-15', height: 5.8, weight: 165, shoes: 'without', 
  spo2: 98, temp: 98.6, pulse: 72, resp: 16, bp: '120/80'
};

const MOCK_SUBMISSIONS = [
  { id: 1, student: 'John Doe', datetime: '2025-01-20 09:30', dob: '1985-03-15', height: 5.8, weight: 165, shoes: 'without', spo2: 98, temp: 98.6, pulse: 72, resp: 16, bp: '120/80' },
  { id: 2, student: 'Jane Smith', datetime: '2025-01-21 10:15', dob: '1985-03-14', height: 5.7, weight: 163, shoes: 'without', spo2: 97, temp: 98.4, pulse: 70, resp: 15, bp: '118/78' }
];

export default function VerifySubmissionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  const getMatchIcon = (submitted: any, correct: any) => {
    const isMatch = String(submitted) === String(correct);
    return isMatch 
      ? <span style={{ color: '#28a745', marginLeft: '5px' }}>✓</span> 
      : <span style={{ color: '#dc3545', marginLeft: '5px' }}>✗</span>;
  };

  return (
    <div style={{ backgroundColor: '#f5f7fa', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        <div style={headerStyle}>
          <h1 style={{ margin: 0, fontSize: '28px' }}>Verify Student Submissions</h1>
          <p style={{ opacity: 0.9 }}>Teacher Portal - Audit System</p>
        </div>

        {/* Search Section */}
        <div style={cardStyle}>
          <h2 style={titleStyle}>Search Submissions</h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Student Name</label>
              <input 
                type="text" 
                placeholder="Type name..." 
                style={inputStyle} 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowResults(true)}
              style={{ ...btnStyle, width: 'auto', padding: '12px 30px' }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Results Table */}
        {showResults && (
          <div style={cardStyle}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#667eea', color: 'white' }}>
                    <th style={thStyle}>Student / Date</th>
                    <th style={thStyle}>DOB</th>
                    <th style={thStyle}>Height</th>
                    <th style={thStyle}>Weight</th>
                    <th style={thStyle}>SpO2</th>
                    <th style={thStyle}>Temp</th>
                    <th style={thStyle}>BP</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Linha de Referência (Gabarito) */}
                  <tr style={{ background: '#d4edda', fontWeight: 'bold' }}>
                    <td style={tdStyle}>REFERENCE VALUES</td>
                    <td style={tdStyle}>{MOCK_CORRECT.dob}</td>
                    <td style={tdStyle}>{MOCK_CORRECT.height}</td>
                    <td style={tdStyle}>{MOCK_CORRECT.weight}</td>
                    <td style={tdStyle}>{MOCK_CORRECT.spo2}</td>
                    <td style={tdStyle}>{MOCK_CORRECT.temp}</td>
                    <td style={tdStyle}>{MOCK_CORRECT.bp}</td>
                  </tr>
                  
                  {/* Submissões dos Alunos */}
                  {MOCK_SUBMISSIONS.map((sub) => (
                    <tr key={sub.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={tdStyle}>
                        {sub.student}<br/>
                        <small style={{ color: '#666' }}>{sub.datetime}</small>
                      </td>
                      <td style={tdStyle}>{sub.dob} {getMatchIcon(sub.dob, MOCK_CORRECT.dob)}</td>
                      <td style={tdStyle}>{sub.height} {getMatchIcon(sub.height, MOCK_CORRECT.height)}</td>
                      <td style={tdStyle}>{sub.weight} {getMatchIcon(sub.weight, MOCK_CORRECT.weight)}</td>
                      <td style={tdStyle}>{sub.spo2} {getMatchIcon(sub.spo2, MOCK_CORRECT.spo2)}</td>
                      <td style={tdStyle}>{sub.temp} {getMatchIcon(sub.temp, MOCK_CORRECT.temp)}</td>
                      <td style={tdStyle}>{sub.bp} {getMatchIcon(sub.bp, MOCK_CORRECT.bp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Estilos reutilizados e adaptados
const headerStyle: React.CSSProperties = { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', padding: '25px', borderRadius: '15px', marginBottom: '30px' };
const cardStyle: React.CSSProperties = { background: 'white', borderRadius: '15px', padding: '30px', marginBottom: '20px', boxShadow: '0 5px 20px rgba(0,0,0,0.08)' };
const titleStyle: React.CSSProperties = { fontSize: '20px', borderBottom: '2px solid #667eea', paddingBottom: '10px', marginBottom: '20px' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: '8px', fontSize: '14px', color: '#555', fontWeight: 'bold' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px', outline: 'none' };
const btnStyle: React.CSSProperties = { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' };
const thStyle: React.CSSProperties = { padding: '12px', textAlign: 'left' };
const tdStyle: React.CSSProperties = { padding: '12px', borderBottom: '1px solid #eee' };
