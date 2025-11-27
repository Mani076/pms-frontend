import React, { useEffect, useState } from 'react';
import { fetchAllocations, createProject, fetchFaculty, fetchStudents, allocateStudent } from '../api';
import { motion } from 'framer-motion';
import { FaTasks, FaClipboardList, FaChalkboardTeacher, FaLink } from 'react-icons/fa';

const HeadDashboard = () => {
  // State for Data
  const [projects, setProjects] = useState([]);
  const [guides, setGuides] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for Forms
  const [newProject, setNewProject] = useState({ name: '', description: '', guideId: '' });
  const [allocData, setAllocData] = useState({ projectId: '', studentId: '' });

  // Load all necessary data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allocRes, facultyRes, studentRes] = await Promise.all([
        fetchAllocations(),
        fetchFaculty(),
        fetchStudents()
      ]);
      
      setProjects(Array.isArray(allocRes) ? allocRes : (allocRes.data || []));
      setGuides(Array.isArray(facultyRes) ? facultyRes : []);
      setStudents(Array.isArray(studentRes) ? studentRes : []);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handler: Create New Project
  const handleAllocate = async (e) => {
    e.preventDefault();
    if (!newProject.guideId) {
      alert("Please select a Faculty Guide.");
      return;
    }

    try {
      await createProject(newProject);
      alert('Project Allocated Successfully!');
      setNewProject({ name: '', description: '', guideId: '' });
      loadData(); // Refresh list
    } catch (error) {
      alert('Error creating project. Ensure backend is running.');
    }
  };

  // Handler: Allocate Student to Project
  const handleStudentAllocation = async (e) => {
    e.preventDefault();
    if (!allocData.projectId || !allocData.studentId) {
        alert("Please select both a Project and a Student.");
        return;
    }

    try {
        await allocateStudent({
            project_id: parseInt(allocData.projectId),
            student_id: parseInt(allocData.studentId)
        });
        alert("Student allocated successfully!");
        setAllocData({ projectId: '', studentId: '' });
        loadData(); // Refresh list
    } catch (err) {
        alert(`Error: ${err.message}`);
    }
  };

  if (loading) return <div className="container">Loading Dashboard...</div>;

  return (
    <div className="container">
      
      {/* SECTION 1: CREATE PROJECT (Project Allocator) */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: '30px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <div style={{ background: '#764ba2', padding: '10px', borderRadius: '50%', color: 'white' }}>
                 <FaTasks size={24} />
            </div>
            <h2 style={{ margin: 0 }}>Project Allocator</h2>
        </div>
        <p style={{ color: '#666', marginBottom: '20px' }}>Create new problem statements and assign faculty guides.</p>
        
        <form onSubmit={handleAllocate} className="simple-form" style={{ maxWidth: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
             <div className="input-group">
                 <label>Project Title</label>
                 <input 
                    placeholder="e.g. AI Traffic Control" 
                    value={newProject.name} 
                    onChange={e => setNewProject({...newProject, name: e.target.value})}
                    required
                 />
             </div>

             <div className="input-group">
                  <label style={{ marginBottom: '5px', display: 'block', fontWeight: 'bold' }}>Assign Faculty Guide</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FaChalkboardTeacher color="#764ba2" size={20} />
                      <select 
                          value={newProject.guideId} 
                          onChange={e => setNewProject({...newProject, guideId: e.target.value})}
                          required
                          disabled={guides.length === 0}
                          style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }}
                      >
                          <option value="">-- Select a Faculty Member --</option>
                          {guides.map(guide => (
                              <option key={guide.faculty_id} value={guide.faculty_id}>
                                  {guide.first_name} {guide.last_name} ({guide.designation})
                              </option>
                          ))}
                      </select>
                  </div>
              </div>
          </div>

          <div className="input-group">
              <label>Description</label>
              <input 
                placeholder="Brief description of the problem statement..." 
                value={newProject.description} 
                onChange={e => setNewProject({...newProject, description: e.target.value})}
              />
          </div>
          
          <motion.button whileHover={{ scale: 1.02 }} type="submit" style={{ marginTop: '15px' }}>
            Create Project
          </motion.button>
        </form>
      </motion.div>

      {/* SECTION 2: ALLOCATE STUDENTS */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{ marginBottom: '30px', borderLeft: '5px solid #667eea' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom:'20px' }}>
            <div style={{ background: '#667eea', padding: '10px', borderRadius: '50%', color: 'white' }}>
                <FaLink size={24} />
            </div>
            <div>
                <h2 style={{ margin: 0 }}>Allocate Students</h2>
                <small style={{ color: '#666' }}>Add students to existing projects</small>
            </div>
        </div>

        <form onSubmit={handleStudentAllocation} className="simple-form">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                
                {/* Project Dropdown */}
                <div className="input-group">
                    <label>Select Project</label>
                    <select 
                        value={allocData.projectId} 
                        onChange={e => setAllocData({...allocData, projectId: e.target.value})}
                        required
                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }}
                    >
                        <option value="">-- Choose Project --</option>
                        {projects.map(p => (
                            <option key={p.project_id} value={p.project_id}>{p.projectName}</option>
                        ))}
                    </select>
                </div>

                {/* Student Dropdown (WITH SKILLS) */}
                <div className="input-group">
                    <label>Select Student</label>
                    <select 
                        value={allocData.studentId} 
                        onChange={e => setAllocData({...allocData, studentId: e.target.value})}
                        required
                        style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', width: '100%' }}
                    >
                        <option value="">-- Choose Student --</option>
                        {students.map(s => (
                            <option 
                                key={s.student_id} 
                                value={s.student_id} 
                                disabled={s.is_allocated}
                                style={{ color: s.is_allocated ? '#ccc' : '#000' }}
                            >
                                {s.first_name} {s.last_name} 
                                {s.is_allocated ? " (Already Allocated)" : ` — Skills: ${s.skills_str || "None"}`}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <motion.button 
                whileHover={{ scale: 1.02 }} 
                type="submit"
                style={{ marginTop: '15px', background: 'linear-gradient(to right, #667eea, #764ba2)' }}
            >
                Add Student to Team
            </motion.button>
        </form>
      </motion.div>

      {/* SECTION 3: ACTIVE PROJECTS TABLE */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <FaClipboardList size={24} color="#764ba2" />
            <h3 style={{ margin: 0 }}>Active Projects Overview</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
            <table className="simple-table">
            <thead>
                <tr>
                <th>Project Name</th>
                <th>Guide Assigned</th>
                <th>Status</th>
                <th>Team Members</th>
                </tr>
            </thead>
            <tbody>
                {projects.length > 0 ? projects.map(p => (
                <tr key={p.project_id}>
                    <td style={{ fontWeight: '600', color: '#333' }}>{p.projectName}</td>
                    <td>{p.guideName || 'Unassigned'}</td>
                    <td>
                        <span style={{ 
                            background: p.status === 'In Progress' ? '#d4edda' : '#fff3cd',
                            color: p.status === 'In Progress' ? '#155724' : '#856404',
                            padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600'
                        }}>
                            {p.status}
                        </span>
                    </td>
                    <td>
                        {p.teamMembers && p.teamMembers.length > 0 ? (
                            <span style={{ fontSize: '0.9rem' }}>
                                {p.teamMembers.map(m => m.name).join(', ')}
                            </span>
                        ) : (
                            <span style={{ color: '#aaa', fontStyle: 'italic', fontSize: '0.9rem' }}>Pending Allocation</span>
                        )}
                    </td>
                </tr>
                )) : (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>No projects found. Create one above!</td></tr>
                )}
            </tbody>
            </table>
        </div>
      </motion.div>
    </div>
  );
};

export default HeadDashboard;