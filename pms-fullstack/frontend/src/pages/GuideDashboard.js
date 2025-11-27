import React, { useEffect, useState } from 'react';
import { fetchAllocations } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaChartLine, FaClipboardList } from 'react-icons/fa';

const GuideDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
        const userId = localStorage.getItem('userId');
        try {
            const res = await fetchAllocations();
            // Filter: Only show projects where guide_id matches logged in user
            // We use == because localStorage is string and API is int
            const myProjects = res.data.filter(p => p.guide_id === userId);
            setProjects(myProjects);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    loadProjects();
  }, []);

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaClipboardList size={28} color="#764ba2" />
            <h2 style={{ margin: 0 }}>Faculty Guide Dashboard</h2>
        </div>
        
        {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', marginTop: '20px', background: '#f9f9f9', borderRadius: '10px' }}>
                <h3>No Projects Assigned</h3>
                <p style={{ color: '#666' }}>You have not been assigned as a guide to any project teams yet.</p>
            </div>
        ) : (
            <>
                <p style={{ marginTop: '10px', color: '#666' }}>Select a team below to view details.</p>
                <div className="button-group" style={{ marginTop: '20px' }}>
                {projects.map(p => (
                    <motion.button 
                        key={p.project_id} 
                        onClick={() => setSelectedProject(p)}
                        whileHover={{ scale: 1.05, background: '#764ba2', color: 'white' }}
                        whileTap={{ scale: 0.95 }}
                        style={{ 
                            background: selectedProject?.project_id === p.project_id ? '#764ba2' : 'white',
                            color: selectedProject?.project_id === p.project_id ? 'white' : '#764ba2',
                            border: '1px solid #764ba2'
                        }}
                    >
                    {p.projectName}
                    </motion.button>
                ))}
                </div>
            </>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedProject && (
            <motion.div 
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                style={{ marginTop: '20px', borderLeft: '5px solid #764ba2' }}
            >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{selectedProject.projectName}</h3>
                <span style={{ fontSize: '2rem', opacity: 0.2 }}><FaChartLine /></span>
            </div>
            
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', margin: '20px 0' }}>
                <p><strong>Description:</strong> {selectedProject.description || "No description provided."}</p>
                <p><strong>Status:</strong> {selectedProject.status}</p>
            </div>

            <h4><FaUsers /> Team Members</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '10px' }}>
                {selectedProject.teamMembers && selectedProject.teamMembers.length > 0 ? (
                    selectedProject.teamMembers.map(m => (
                    <div key={m.id} style={{ background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{m.name}</div>
                        <div style={{ color: '#777', fontSize: '0.9rem' }}>{m.email}</div>
                        <div style={{ color: '#aaa', fontSize: '0.8rem' }}>{m.phone || "No Phone"}</div>
                    </div>
                    ))
                ) : (
                    <p style={{ fontStyle: 'italic', color: '#999' }}>No students have been allocated to this project yet.</p>
                )}
            </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuideDashboard;