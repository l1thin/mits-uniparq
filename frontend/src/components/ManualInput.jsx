import React, { useState, useEffect } from 'react';

export default function ManualInput({ visible, onClose, onSubmit }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (!visible) setValue('');
  }, [visible]);

  return (
    <div id="manual-input" className={visible ? 'active' : ''}>
      <h3 style={{ marginBottom: '1rem' }}>Enter Vehicle Details</h3>
      <div className="input-group">
        <i data-lucide="car"></i>
        <input type="text" id="manual-plate-input" placeholder="e.g. KL 08 AB 1234" value={value} onChange={e => setValue(e.target.value)} />
      </div>
      <button className="btn-primary" onClick={() => onSubmit(value)}>Search Database</button>
      <button className="btn-text" onClick={onClose}>Cancel</button>
    </div>
  );
}
