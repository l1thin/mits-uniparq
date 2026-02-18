import React from 'react';

export default function ScannerOverlay({ visible, onCancel }) {
  return (
    <div id="scanner-overlay" style={{ display: visible ? 'flex' : 'none' }}>
      <div className="scanner-frame">
        <div className="scan-laser" />
      </div>
      <p className="scanner-text">ANALYZING IMAGE...</p>
      <button className="btn-text" style={{ color: 'white', marginTop: 20 }} onClick={onCancel}>Cancel Scan</button>
    </div>
  );
}
