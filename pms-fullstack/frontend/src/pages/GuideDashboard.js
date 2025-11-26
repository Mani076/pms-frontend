import React, { useEffect, useState } from 'react';
import { fetchAllocations } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaChartLine } from 'react-icons/fa';

const GuideDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchAllocations().then(res => setProjects(res.data));
  }, []);

  return (
    <div className="container">
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2><FaUsers /> Faculty Guide Dashboard</h2>
        <p>Select a team below to view their detailed progress.</p>
        
        <div className="button-group">
          {projects.map(p => (
            <motion.button 
                key={p.project_id} 
                onClick={() => setSelectedProject(p)}
                whileHover={{ scale: 1.05, background: '#764ba2', color: 'white' }}
                whileTap={{ scale: 0.95 }}
                style={{ 
                    background: selectedProject?.project_id === p.project_id ? '#764ba2' : 'white',
                    color: selectedProject?.project_id === p.project_id ? 'white' : '#764ba2',
                }}
            >
              {p.projectName}
            </motion.button>
          ))}
        </div>
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
                <h3>{selectedProject.projectName}</h3>
                <span style={{ fontSize: '2rem', opacity: 0.2 }}><FaChartLine /></span>
            </div>
            
            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                <p><strong>Description:</strong> {selectedProject.description}</p>
                <p><strong>Current Status:</strong> {selectedProject.status}</p>
            </div>

            <h4>Team Members:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {selectedProject.teamMembers && selectedProject.teamMembers.length > 0 ? (
                    selectedProject.teamMembers.map(m => (
                    <div key={m.id} style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
                        <strong>{m.name}</strong><br/>
                        <small style={{ color: '#777' }}>{m.email}</small>
                    </div>
                    ))
                ) : (
                    <p>No members allocated.</p>
                )}
            </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GuideDashboard;