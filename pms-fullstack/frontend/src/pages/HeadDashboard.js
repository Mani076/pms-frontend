import React, { useEffect, useState } from 'react';
import { fetchAllocations, createProject } from '../api';
import { motion } from 'framer-motion';
import { FaTasks, FaClipboardList, FaChalkboardTeacher } from 'react-icons/fa';

const HeadDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '', guideId: '' });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    fetchAllocations()
      .then(res => setProjects(res.data))
      .catch(err => console.error("Error loading projects:", err));
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      await createProject(newProject);
      alert('Project Allocated Successfully');
      setNewProject({ name: '', description: '', guideId: '' });
      loadData(); // Refresh list immediately
    } catch (error) {
      alert('Error allocating project');
    }
  };

  return (
    <div className="container">
      {/* Allocator Section */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '30px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaTasks size={24} color="#764ba2" />
            <h2 style={{ margin: 0 }}>Project Allocator</h2>
        </div>
        <p style={{ color: '#666' }}>Create new problem statements and assign faculty guides.</p>
        
        <form onSubmit={handleAllocate} className="simple-form" style={{ maxWidth: '100%' }}>
          <input 
            placeholder="Project Title" 
            value={newProject.name} 
            onChange={e => setNewProject({...newProject, name: e.target.value})}
            required
          />
          <input 
            placeholder="Problem Description" 
            value={newProject.description} 
            onChange={e => setNewProject({...newProject, description: e.target.value})}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaChalkboardTeacher color="#764ba2" />
            <input 
                type="number"
                placeholder="Assign Guide ID (e.g. 501)" 
                value={newProject.guideId} 
                onChange={e => setNewProject({...newProject, guideId: e.target.value})}
                required
                style={{ flex: 1 }}
            />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} type="submit">Allocate Project</motion.button>
        </form>
      </motion.div>

      {/* Review Section */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaClipboardList size={24} color="#764ba2" />
            <h3 style={{ margin: 0 }}>All Active Projects</h3>
        </div>
        
        <table className="simple-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Guide</th>
              <th>Status</th>
              <th>Team Members</th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ? projects.map(p => (
              <tr key={p.project_id}>
                <td style={{ fontWeight: '600' }}>{p.projectName}</td>
                <td>{p.guideName || 'Unassigned'}</td>
                <td>
                    <span style={{ 
                        background: p.status === 'In Progress' ? '#d4edda' : '#fff3cd',
                        color: p.status === 'In Progress' ? '#155724' : '#856404',
                        padding: '5px 10px', borderRadius: '15px', fontSize: '0.85rem'
                    }}>
                        {p.status}
                    </span>
                </td>
                <td>
                  {/* Fixed Logic: Safely check for team members */}
                  {p.teamMembers && p.teamMembers.length > 0 
                    ? p.teamMembers.map(m => m.name).join(', ') 
                    : <span style={{ color: '#999', fontStyle: 'italic' }}>No Students</span>
                  }
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" style={{ textAlign: 'center' }}>No projects found.</td></tr>
            )}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};

export default HeadDashboard;