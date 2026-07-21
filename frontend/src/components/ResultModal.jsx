import React from 'react';

export default function ResultModal({ visible, data, onClose, onContact }) {
  if (!visible || !data) return null;

  const formatPlate = (str) => {
    return str.replace(/([a-zA-Z]{2})(\d{2})([a-zA-Z]{1,2})(\d{4})/, "$1 $2 $3 $4");
  };

  return (
    <div id="result-modal" style={{ display: 'flex' }}>
      <div className="result-card">
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-icon" style={{ background: 'none', color: 'var(--text-muted)' }} onClick={onClose}><i data-lucide="x"></i></button>
        </div>

        <div className="plate-display" id="res-plate">{formatPlate(data.plate)}</div>

        <div className="info-row">
          <span>Student Name</span>
          <strong id="res-name">{data.student_name || data.name || "Not available"}</strong>
        </div>
        <div className="info-row">
          <span>Branch</span>
          <strong id="res-dept">{data.branch || data.dept || data.department || "Not available"}</strong>
        </div>
        {data.model && (
          <div className="info-row">
            <span>Vehicle Model</span>
            <strong id="res-model">{data.model}</strong>
          </div>
        )}
        <div className="info-row">
          <span>Student Contact</span>
          <strong id="res-contact">
            {data.student_contact || data.phone ? (
              <a href={`tel:${data.student_contact || data.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                <i data-lucide="phone" size="14" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}></i>
                {data.student_contact || data.phone}
              </a>
            ) : "Not available"}
          </strong>
        </div>

        <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #e5e7eb' }}>
          <div className="info-row" style={{ marginBottom: '5px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>FACULTY ADVISOR</span>
          </div>
          <div className="info-row">
            <span>Name</span>
            <strong>{data.faculty_advisor_name || "Not available"}</strong>
          </div>
          <div className="info-row">
            <span>Contact</span>
            <strong>
              {data.faculty_advisor_contact ? (
                <a href={`tel:${data.faculty_advisor_contact}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  <i data-lucide="phone" size="14" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }}></i>
                  {data.faculty_advisor_contact}
                </a>
              ) : "Not available"}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
