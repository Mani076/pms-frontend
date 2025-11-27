import React, { useState, useEffect } from 'react';
import { createUser, fetchDepartments, createDepartment } from '../api'; // Import createDepartment
import { motion } from 'framer-motion';
import { FaUserPlus, FaUserTie, FaBuilding, FaSync, FaPlus } from 'react-icons/fa';

const AdminDashboard = () => {
  const [member, setMember] = useState({ 
    firstName: '', lastName: '', email: '', role: 'student', deptId: '' 
  });
  const [departments, setDepartments] = useState([]);
  const [newDeptName, setNewDeptName] = useState(''); // State for new department

  // Load Departments on mount
  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
        const data = await fetchDepartments();
        if (Array.isArray(data)) {
            setDepartments(data);
        } else {
            setDepartments([]); 
        }
    } catch (err) {
        console.error("Failed to load departments", err);
    }
  };

  const handleAddDepartment = async (e) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;

    try {
        await createDepartment(newDeptName);
        alert('Department Added!');
        setNewDeptName('');
        loadDepartments(); // Refresh list
    } catch (err) {
        alert(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser(member);
      alert(`${member.role} added successfully!`);
      setMember({ firstName: '', lastName: '', email: '', role: 'student', deptId: '' });
      loadDepartments(); 
    } catch (err) {
      alert('Error adding member. Email might exist.');
    }
  };

  return (
    <div className="container">
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
            <div style={{ background: '#764ba2', padding: '12px', borderRadius: '50%', color: 'white' }}>
                <FaUserTie size={28} />
            </div>
            <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            {/* LEFT COLUMN: Department Overview */}
            <div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px' }}>
                    <h3 style={{ margin:0 }}><FaBuilding /> Department Status</h3>
                    <button onClick={loadDepartments} style={{ padding:'5px 10px', fontSize:'0.8rem' }}><FaSync/></button>
                </div>
                
                {/* Add Department Form */}
                <form onSubmit={handleAddDepartment} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <input 
                        placeholder="New Dept Name..." 
                        value={newDeptName}
                        onChange={(e) => setNewDeptName(e.target.value)}
                        style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', flex: 1 }}
                    />
                    <button type="submit" style={{ padding: '8px 12px', background: '#27ae60', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer' }}>
                        <FaPlus />
                    </button>
                </form>

                <table className="simple-table" style={{ fontSize: '0.9rem' }}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Current Head (HOD)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {departments.map(dept => (
                            <tr key={dept.id}>
                                <td style={{ fontWeight:'bold', textAlign:'center' }}>{dept.id}</td>
                                <td>{dept.name}</td>
                                <td style={{ 
                                    color: dept.head_name === "No Head Assigned" ? '#e74c3c' : '#27ae60',
                                    fontWeight: '500'
                                }}>
                                    {dept.head_name}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '10px' }}>
                    * Use the <strong>ID</strong> above when assigning users to a department.
                </p>
            </div>

            {/* RIGHT COLUMN: Add Member Form (Keep existing) */}
            <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '15px', border: '1px solid #eee' }}>
                <h3 style={{ marginTop: 0 }}><FaUserPlus /> Add New Member</h3>
                <form onSubmit={handleSubmit} className="simple-form">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
                        type="email"
                        value={member.email} 
                        onChange={e => setMember({...member, email: e.target.value})} 
                        required
                    />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Role</label>
                            <select value={member.role} onChange={e => setMember({...member, role: e.target.value})}>
                                <option value="student">Student</option>
                                <option value="guide">Faculty Guide</option>
                                <option value="head">Department Head</option>
                            </select>
                        </div>
                        <div>
                             <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Dept ID</label>
                             <input 
                                type="number"
                                placeholder="ID"
                                value={member.deptId} 
                                onChange={e => setMember({...member, deptId: e.target.value})} 
                                required
                            />
                        </div>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit" 
                        style={{ marginTop: '10px', width: '100%' }}
                    >
                        Create Account
                    </motion.button>
                </form>
            </div>

        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;