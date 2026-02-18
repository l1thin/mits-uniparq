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
          <span>Owner Name</span>
          <strong id="res-name">{data.name}</strong>
        </div>
        <div className="info-row">
          <span>Department</span>
          <strong id="res-dept">{data.dept || data.department}</strong>
        </div>
        <div className="info-row">
          <span>Vehicle Model</span>
          <strong id="res-model">{data.model}</strong>
        </div>

        <div className="contact-actions">
          <button className="btn-call" onClick={() => onContact('call')}>
            <i data-lucide="phone"></i> Call
          </button>
          <button className="btn-msg" onClick={() => onContact('msg')}>
            <i data-lucide="message-square"></i> SMS
          </button>
        </div>

        <p style={{ marginTop: 15, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <i data-lucide="lock" size="12" style={{ display: 'inline', verticalAlign: 'middle' }}></i>
          Privacy Mode: Number masked
        </p>
      </div>
    </div>
  );
}
