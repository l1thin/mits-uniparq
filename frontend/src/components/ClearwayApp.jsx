import React, { useEffect, useState } from 'react';
import './Clearway.css';
import ScannerOverlay from './ScannerOverlay';
import ManualInput from './ManualInput';
import ResultModal from './ResultModal';

const MOCK_DB = [
  { plate: 'KL08AB1234', name: 'Rahul Sharma', dept: 'CSE - Year 3', model: 'Hyundai i20', phone: '9876543210' },
  { plate: 'KL07BN4532', name: 'Anjali Menon', dept: 'ECE - Faculty', model: 'Honda Activa', phone: '9123456780' },
  { plate: 'TN99XZ0000', name: 'Dr. Vinod K.', dept: 'Principal', model: 'Toyota Fortuner', phone: '9988776655' }
];

export default function ClearwayApp() {
  const [view, setView] = useState('login');
  const [scannerVisible, setScannerVisible] = useState(false);
  const [manualVisible, setManualVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    if (window && window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }, [view, scannerVisible, manualVisible, resultVisible]);

  const handleLogin = (e) => {
    e && e.preventDefault && e.preventDefault();
    // simple fake auth
    setView('dashboard');
  };

  const logout = () => {
    if (window.confirm('Log out of Security Console?')) {
      setView('login');
      setResultVisible(false);
    }
  };

  const startScanner = () => {
    setScannerVisible(true);

    setTimeout(() => {
      setScannerVisible(false);
      const randomCar = MOCK_DB[Math.floor(Math.random() * MOCK_DB.length)];
      showResult(randomCar);
    }, 3000);
  };

  const closeScanner = () => setScannerVisible(false);

  const openManualInput = () => setManualVisible(true);
  const closeManualInput = () => setManualVisible(false);

  const processManualInput = (value) => {
    const inputVal = (value || '').toUpperCase().replace(/\s/g, '');
    const found = MOCK_DB.find(car => car.plate === inputVal);
    if (found) {
      setManualVisible(false);
      showResult(found);
    } else {
      window.alert('Vehicle not found in registered database.');
    }
  };

  const showResult = (data) => {
    setResultData(data);
    setResultVisible(true);
  };

  const closeResultModal = () => setResultVisible(false);

  const contactAction = (type) => {
    if (type === 'call') {
      window.alert("📞 Connecting to Central Switchboard...\n\n(Student's number is hidden for privacy)");
    } else {
      window.alert("💬 Sending Automated Warning SMS:\n\n'Please move your vehicle immediately from Block A.'");
    }
  };

  // formatPlate is handled inside ResultModal; no-op here.

  return (
    <div className="clearway-root">
      <div className="bg-circles">
        <div className="circle c1"></div>
        <div className="circle c2"></div>
      </div>

      <div className="app-container">
        <section id="login-view" className={`view ${view === 'login' ? 'active' : ''}`}>
          <div className="logo-area">
            <i data-lucide="shield-check" className="logo-icon"></i>
            <h1>CLEARWAY</h1>
            <p>Smart Campus Parking Security</p>
          </div>

          <form className="login-card" id="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <i data-lucide="user"></i>
              <input type="text" id="username" placeholder="Officer ID" defaultValue="SEC-01" required />
            </div>
            <div className="input-group">
              <i data-lucide="lock"></i>
              <input type="password" id="password" placeholder="Password" defaultValue="123456" required />
            </div>
            <button type="submit" className="btn-primary">Login to System <i data-lucide="arrow-right"></i></button>
          </form>
        </section>

        <section id="dashboard-view" className={`view ${view === 'dashboard' ? 'active' : ''}`}>
          <header>
            <div className="user-profile">
              <div className="avatar">S</div>
              <div className="user-info">
                <h3>Security Officer</h3>
                <p>Gate 1 • Online</p>
              </div>
            </div>
            <button className="btn-icon" onClick={logout}><i data-lucide="log-out"></i></button>
          </header>

          <h4 className="section-title">Quick Actions</h4>

          <div className="action-grid">
            <div className="action-card" onClick={startScanner}>
              <div className="card-icon"><i data-lucide="camera" size="24"></i></div>
              <div className="card-text"><h3>Scan Number Plate</h3><p>Use camera OCR to identify vehicle</p></div>
            </div>

            <div className="action-card" onClick={openManualInput}>
              <div className="card-icon" style={{ background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)' }}><i data-lucide="keyboard" size="24"></i></div>
              <div className="card-text"><h3>Manual Entry</h3><p>Type vehicle number manually</p></div>
            </div>

            <div className="action-card" style={{ opacity: 0.6 }}>
              <div className="card-icon" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}><i data-lucide="file-text" size="24"></i></div>
              <div className="card-text"><h3>Recent Logs</h3><p>View past activity (Admin only)</p></div>
            </div>
          </div>
        </section>

        <ScannerOverlay visible={scannerVisible} onCancel={closeScanner} />
        <ManualInput visible={manualVisible} onClose={closeManualInput} onSubmit={processManualInput} />
        <ResultModal visible={resultVisible} data={resultData} onClose={closeResultModal} onContact={contactAction} />
      </div>
    </div>
  );
}
