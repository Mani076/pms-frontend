import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FaPowerOff } from 'react-icons/fa'; // Import Logout Icon
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import HeadDashboard from './pages/HeadDashboard';
import GuideDashboard from './pages/GuideDashboard';
import './App.css';

// Fancy Student Dashboard
const StudentDashboard = () => (
    <div className="container">
         <div className="card">
            <h2>🎓 My Mini Project Progress</h2>
            <div style={{ padding: '20px', background: '#f0f4ff', borderRadius: '10px', borderLeft: '5px solid #764ba2' }}>
                <h3 style={{ margin: 0 }}>Project: AI Based Traffic Control</h3>
                <p>Status: <span style={{ color: 'green', fontWeight: 'bold' }}>In Progress</span></p>
                <p>Guide: Prof. Smith</p>
            </div>
         </div>
    </div>
);

function App() {
  const [userRole, setUserRole] = useState(null);

  const handleLogout = () => {
    setUserRole(null);
    window.location.href = '/';
  }

  return (
    <Router>
      {userRole && (
        <nav>
          <span>🚀 PMS System <small style={{ opacity: 0.8, fontSize: '0.8rem' }}>| {userRole.toUpperCase()}</small></span>
          <button 
            onClick={handleLogout} 
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '8px 15px'
            }}
          >
            <FaPowerOff /> Logout
          </button>
        </nav>
      )}
      
      <Routes>
        <Route path="/" element={<Login setUserRole={setUserRole} />} />
        
        {/* Protected Routes */}
        <Route path="/admin" element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/head" element={userRole === 'head' ? <HeadDashboard /> : <Navigate to="/" />} />
        <Route path="/guide" element={userRole === 'guide' ? <GuideDashboard /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={userRole === 'student' ? <StudentDashboard /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;