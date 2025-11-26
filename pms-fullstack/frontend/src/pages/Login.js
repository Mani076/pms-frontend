import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // Animation library
import { FaUserGraduate, FaChalkboardTeacher, FaUserShield, FaUniversity } from 'react-icons/fa'; // Icons

const Login = ({ setUserRole }) => {
  const [role, setRole] = useState('student');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setUserRole(role);
    if (role === 'admin') navigate('/admin');
    else if (role === 'head') navigate('/head');
    else if (role === 'guide') navigate('/guide');
    else navigate('/dashboard');
  };

  return (
    <div className="center-box">
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            {/* Dynamic Icon based on selection */}
            {role === 'student' && <FaUserGraduate size={50} color="#764ba2" />}
            {role === 'guide' && <FaChalkboardTeacher size={50} color="#764ba2" />}
            {role === 'head' && <FaUniversity size={50} color="#764ba2" />}
            {role === 'admin' && <FaUserShield size={50} color="#764ba2" />}
        </div>
        
        <h2 style={{ textAlign: 'center' }}>Welcome to PMS</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Please select your role to continue</p>

        <form onSubmit={handleLogin} className="simple-form">
          <label style={{ fontWeight: 'bold' }}>I am a:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Student</option>
            <option value="guide">Faculty Guide</option>
            <option value="head">Department Head</option>
            <option value="admin">Admin</option>
          </select>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
          >
            Enter Dashboard
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;