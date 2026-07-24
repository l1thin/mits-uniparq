import React from 'react';

export default function ResultModal({ visible, data, onClose }) {
  if (!visible || !data) return null;

  const formatPlate = (str) => {
    if (!str) return '';
    return str.replace(/([a-zA-Z]{2})(\d{1,2})([a-zA-Z]{1,3})(\d{4})/, "$1 $2 $3 $4");
  };

  const rowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid var(--gray-medium, #e5e7eb)'
  };

  const labelStyle = {
    color: 'var(--gray-dark, #4b5563)',
    fontSize: '0.95rem',
    fontWeight: '500'
  };

  const valueStyle = {
    color: '#111827',
    fontWeight: '600',
    textAlign: 'right'
  };

  return (
    <div id="result-modal" style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-dark)' }} onClick={onClose}>
            <i data-lucide="x"></i> ✕
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-red) 0%, var(--dark-red) 100%)',
            color: 'white',
            fontWeight: '700',
            fontSize: '1.6rem',
            padding: '12px 24px',
            borderRadius: '8px',
            display: 'inline-block',
            letterSpacing: '2px',
            boxShadow: '0 4px 10px rgba(220, 38, 38, 0.25)'
          }}>
            {formatPlate(data.plate)}
          </div>
        </div>

        <div style={rowStyle}>
          <span style={labelStyle}>Name</span>
          <span style={valueStyle}>{data.student_name || data.name || "Not available"}</span>
        </div>
        <div style={rowStyle}>
          <span style={labelStyle}>Branch</span>
          <span style={valueStyle}>{data.branch || data.dept || data.department || "Not available"}</span>
        </div>
        {data.model && (
          <div style={rowStyle}>
            <span style={labelStyle}>Vehicle Model</span>
            <span style={valueStyle}>{data.model}</span>
          </div>
        )}
        <div style={{ ...rowStyle, borderBottom: 'none' }}>
          <span style={labelStyle}>Contact</span>
          <span style={valueStyle}>
            {data.student_contact || data.phone ? (
              <a href={`tel:${data.student_contact || data.phone}`} style={{ color: 'var(--primary-red)', textDecoration: 'none' }}>
                <span style={{ marginRight: '6px' }}>📞</span>
                {data.student_contact || data.phone}
              </a>
            ) : "Not available"}
          </span>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '3px solid var(--primary-red)' }}>
          <div style={{ marginBottom: '12px' }}>
            <span style={{ 
              fontSize: '0.85rem', 
              color: 'var(--primary-red)', 
              fontWeight: '700', 
              textTransform: 'uppercase', 
              letterSpacing: '1px' 
            }}>
              Faculty Advisor
            </span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Name</span>
            <span style={valueStyle}>{data.faculty_advisor_name || "Not available"}</span>
          </div>
          <div style={{ ...rowStyle, borderBottom: 'none' }}>
            <span style={labelStyle}>Contact</span>
            <span style={valueStyle}>
              {data.faculty_advisor_contact ? (
                <a href={`tel:${data.faculty_advisor_contact}`} style={{ color: 'var(--primary-red)', textDecoration: 'none' }}>
                  <span style={{ marginRight: '6px' }}>📞</span>
                  {data.faculty_advisor_contact}
                </a>
              ) : "Not available"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
