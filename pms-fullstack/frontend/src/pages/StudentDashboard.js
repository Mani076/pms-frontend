import React, { useEffect, useState } from 'react';
import { addSkill } from '../api'; // Import new function
import { motion } from 'framer-motion';
import { FaUniversity, FaChalkboardTeacher, FaProjectDiagram, FaCode, FaPlus } from 'react-icons/fa';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]); // State for Skills List
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newSkill, setNewSkill] = useState('');
  const [newLevel, setNewLevel] = useState('Intermediate');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
        const res = await fetch(`http://localhost:3002/api/student/${userId}`);
        const data = await res.json();
        if (res.ok) {
            setProfile(data.profile);
            setSkills(data.skills || []); // Save skills from response
        }
    } catch (err) {
        console.error("Failed to load profile");
    } finally {
        setLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    const userId = localStorage.getItem('userId');
    try {
        await addSkill(userId, newSkill, newLevel);
        setNewSkill('');
        loadProfile(); // Refresh to show new skill
    } catch (err) {
        alert("Failed to add skill");
    }
  };

  if (loading) return <div className="center-box">Loading Profile...</div>;

  return (
    <div className="container">
         {/* 1. Header Card */}
         <motion.div 
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: '25px' }}
         >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <div style={{ background: '#e0c6f5', padding: '15px', borderRadius: '50%' }}>
                     <FaUniversity size={30} color="#764ba2" />
                </div>
                <div>
                    <h2 style={{ margin: 0 }}>Hello, {profile?.first_name}</h2>
                    <p style={{ margin: 0, color: '#666' }}>{profile?.department} Department</p>
                </div>
            </div>
         </motion.div>

         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
            
            {/* 2. Project Status Section */}
            <motion.div 
                className="card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaProjectDiagram /> Project Status
                </h3>
                
                {profile?.project_name ? (
                    <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '10px', borderLeft: '4px solid #764ba2' }}>
                        <h2 style={{ color: '#764ba2', margin: '10px 0' }}>{profile.project_name}</h2>
                        <p><strong>Status:</strong> 
                            <span style={{ 
                                marginLeft: '10px', padding: '4px 12px', borderRadius: '20px', 
                                background: profile.status === 'In Progress' ? '#d4edda' : '#fff3cd',
                                color: profile.status === 'In Progress' ? '#155724' : '#856404',
                                fontWeight: 'bold', fontSize: '0.9rem'
                            }}>
                                {profile.status}
                            </span>
                        </p>
                        <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaChalkboardTeacher /> <strong>Guide:</strong> {profile.guide_name || "Not Assigned"}
                        </p>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                        <p>🚫 No Project Assigned Yet</p>
                    </div>
                )}
            </motion.div>

            {/* 3. NEW: Skills Section */}
            <motion.div 
                className="card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
            >
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCode /> My Skills
                </h3>

                {/* Add Skill Form */}
                <form onSubmit={handleAddSkill} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input 
                        placeholder="Add Skill (e.g. React)" 
                        value={newSkill}
                        onChange={e => setNewSkill(e.target.value)}
                        style={{ flex: 1, padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    <select 
                        value={newLevel} 
                        onChange={e => setNewLevel(e.target.value)}
                        style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                    >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Expert</option>
                    </select>
                    <button type="submit" style={{ padding: '8px 12px', background: '#764ba2', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                        <FaPlus />
                    </button>
                </form>

                {/* Skills List */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {skills.length > 0 ? skills.map((s, index) => (
                        <div key={index} style={{ background: '#f0f4ff', padding: '8px 15px', borderRadius: '20px', border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong>{s.skill_name}</strong>
                            <span style={{ fontSize: '0.8rem', color: '#666', background: 'white', padding: '2px 8px', borderRadius: '10px' }}>
                                {s.proficiency_level}
                            </span>
                        </div>
                    )) : (
                        <p style={{ color: '#999', fontStyle: 'italic' }}>No skills added yet.</p>
                    )}
                </div>
            </motion.div>

         </div>
    </div>
  );
};

export default StudentDashboard;