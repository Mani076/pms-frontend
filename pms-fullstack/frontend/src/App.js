import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FaPowerOff, FaKey, FaTimes } from 'react-icons/fa'; // Import Key Icon
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import HeadDashboard from './pages/HeadDashboard';
import GuideDashboard from './pages/GuideDashboard';
import StudentDashboard from './pages/StudentDashboard';
import { changePassword } from './api'; // Import API function
import './App.css';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [showPwdModal, setShowPwdModal] = useState(false); // Modal State

  // Restore session
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role) setUserRole(role);
  }, []);

  const handleLogout = () => {
    setUserRole(null);
    localStorage.clear();
    window.location.href = '/';
  }

  return (
    <Router>
      {userRole && (
        <nav>
          <span style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            🚀 PMS System 
            <span style={{ background:'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>
                {userRole.toUpperCase()}
            </span>
          </span>
          
          <div style={{ display: 'flex', gap: '10px' }}>
              {/* CHANGE PASSWORD BUTTON */}
              <button 
                onClick={() => setShowPwdModal(true)}
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', boxShadow: 'none' 
                }}
              >
                <FaKey /> Change Password
              </button>

              <button 
                onClick={handleLogout} 
                style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 15px', boxShadow: 'none' 
                }}
              >
                <FaPowerOff /> Logout
              </button>
          </div>
        </nav>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showPwdModal && (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '15px', width: '350px', position: 'relative' }}>
                <button 
                    onClick={() => setShowPwdModal(false)}
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', color: '#333', boxShadow: 'none', padding: '5px' }}
                >
                    <FaTimes size={18}/>
                </button>
                <h3 style={{ marginTop: 0, textAlign: 'center' }}>Change Password</h3>
                <ChangePasswordForm onClose={() => setShowPwdModal(false)} />
            </div>
        </div>
      )}
      
      <Routes>
        <Route path="/" element={<Login setUserRole={setUserRole} />} />
        <Route path="/admin" element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/head" element={userRole === 'head' ? <HeadDashboard /> : <Navigate to="/" />} />
        <Route path="/guide" element={userRole === 'guide' ? <GuideDashboard /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={userRole === 'student' ? <StudentDashboard /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

// Internal Component for the Form Logic
const ChangePasswordForm = ({ onClose }) => {
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const authId = localStorage.getItem('authId');
        try {
            await changePassword(authId, oldPass, newPass);
            alert("Password Changed Successfully!");
            onClose();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="simple-form">
            <input 
                type="password" placeholder="Current Password" required 
                value={oldPass} onChange={e => setOldPass(e.target.value)}
            />
            <input 
                type="password" placeholder="New Password" required 
                value={newPass} onChange={e => setNewPass(e.target.value)}
            />
            <button type="submit" style={{ marginTop: '10px', width: '100%' }}>Update Password</button>
        </form>
    );
};

export default App;