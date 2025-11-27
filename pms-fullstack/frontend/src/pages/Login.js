import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaEnvelope, FaUserShield } from 'react-icons/fa';

// Ensure this matches your backend URL
const API_URL = "http://localhost:3002/api"; 

const Login = ({ setUserRole }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUserRole(data.role);
        // Optional: Persist login
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userId', data.user_id);
        localStorage.setItem('authId', data.auth_id);
        if (data.role === 'admin') navigate('/admin');
        else if (data.role === 'head') navigate('/head');
        else if (data.role === 'guide') navigate('/guide');
        else navigate('/dashboard'); 
      } else {
        setError(data.detail || 'Login failed');
      }
    } catch (err) {
      setError('Server connection failed.');
    }
  };

  return (
    <div className="center-box">
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: '400px', width: '100%' }} // Limit width for better look
      >
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
             <FaUserShield size={50} color="#764ba2" />
        </div>
        
        <h2 style={{ textAlign: 'center', margin: '0 0 10px 0' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '0.9rem' }}>
          Enter your credentials to access your account
        </p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleLogin} className="simple-form">
          
          {/* Email Field */}
          <div className="input-wrapper">
             <FaEnvelope className="input-icon" />
             <input 
               type="email" 
               required 
               value={email} 
               onChange={(e) => setEmail(e.target.value)} 
               placeholder="Email Address"
             />
          </div>
          
          {/* Password Field */}
          <div className="input-wrapper">
             <FaLock className="input-icon" />
             <input 
               type="password" 
               required 
               value={password} 
               onChange={(e) => setPassword(e.target.value)} 
               placeholder="Password"
             />
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            style={{ marginTop: '10px' }}
          >
            Sign In
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;