import React from 'react';

export default function ScannerOverlay({ visible, onCancel, error, onRetry }) {
  return (
    <div id="scanner-overlay" style={{ display: visible ? 'flex' : 'none' }}>
      {error ? (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ color: '#ff6b6b', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px', maxWidth: '80%' }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '15px' }}>
            {onRetry && (
              <button 
                style={{ padding: '10px 20px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', cursor: 'pointer' }} 
                onClick={onRetry}
              >
                Retry
              </button>
            )}
            <button className="btn-text" style={{ color: 'white', padding: '10px' }} onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="scanner-frame">
            <div className="scan-laser" />
          </div>
          <p className="scanner-text">ANALYZING IMAGE...</p>
          <button className="btn-text" style={{ color: 'white', marginTop: 20 }} onClick={onCancel}>Cancel Scan</button>
        </>
      )}
    </div>
  );
}
