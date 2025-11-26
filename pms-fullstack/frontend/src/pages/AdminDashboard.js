import React, { useState } from 'react';
import { createStudent } from '../api';
import { motion } from 'framer-motion';
import { FaUserPlus, FaUserTie } from 'react-icons/fa';

const AdminDashboard = () => {
  const [member, setMember] = useState({ firstName: '', lastName: '', email: '', role: 'student' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createStudent(member);
      alert(`${member.role} added successfully!`);
      setMember({ firstName: '', lastName: '', email: '', role: 'student' });
    } catch (err) {
      alert('Error adding member.');
    }
  };

  return (
    <div className="container">
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <div style={{ background: '#764ba2', padding: '10px', borderRadius: '50%', color: 'white' }}>
                <FaUserTie size={24} />
            </div>
            <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
        </div>

        <div style={{ background: 'rgba(118, 75, 162, 0.1)', padding: '20px', borderRadius: '15px' }}>
            <h3><FaUserPlus /> Add New Member</h3>
            <form onSubmit={handleSubmit} className="simple-form" style={{ maxWidth: '100%' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <input 
                    placeholder="First Name" 
                    value={member.firstName} 
                    onChange={e => setMember({...member, firstName: e.target.value})} 
                    required
                />
                <input 
                    placeholder="Last Name" 
                    value={member.lastName} 
                    onChange={e => setMember({...member, lastName: e.target.value})} 
                    required
                />
            </div>
            <input 
                placeholder="Email Address" 
                value={member.email} 
                onChange={e => setMember({...member, email: e.target.value})} 
                required
            />
            <label style={{ fontWeight: '600', marginTop: '10px' }}>Assign Role:</label>
            <select value={member.role} onChange={e => setMember({...member, role: e.target.value})}>
                <option value="student">Student</option>
                <option value="guide">Faculty Guide</option>
                <option value="head">Department Head</option>
            </select>
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                type="submit" 
                style={{ marginTop: '15px' }}
            >
                Create Account
            </motion.button>
            </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;