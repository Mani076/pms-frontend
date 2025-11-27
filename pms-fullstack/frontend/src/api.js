
// Ensure your backend is running on port 3002
const API_URL = "http://localhost:3002/api";

export const createDepartment = async (name) => {
  const response = await fetch(`${API_URL}/departments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to create department');
  }
  return response.json();
};
export const createStudent = (data) => API_URL.post('/students', data);
export const createUser = async (userData) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error('Failed to create user');
  }
  return response.json();
};

export const fetchAllocations = async () => {
  const response = await fetch(`${API_URL}/allocations`);
  return response.json();
};

export const fetchFaculty = async () => {
  const response = await fetch(`${API_URL}/faculty`);
  if (!response.ok) {
    throw new Error('Failed to fetch faculty');
  }
  return response.json();
};

export const fetchDepartments = async () => {
  const response = await fetch(`${API_URL}/departments`);
  return response.json();
};

export const createProject = async (projectData) => {
  const response = await fetch(`${API_URL}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData),
  });
  if (!response.ok) {
    throw new Error('Failed to create project');
  }
  return response.json();
};

export const fetchStudents = async () => {
  const response = await fetch(`${API_URL}/students`);
  if (!response.ok) throw new Error("Failed to fetch students");
  return response.json();
};

export const allocateStudent = async (data) => {
  const response = await fetch(`${API_URL}/allocations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Allocation failed');
  }
  return response.json();
};

export const changePassword = async (authId, oldPassword, newPassword) => {
  const response = await fetch(`${API_URL}/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ auth_id: parseInt(authId), old_password: oldPassword, new_password: newPassword }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || 'Failed to change password');
  }
  return response.json();
};

export const addSkill = async (studentId, skillName, level) => {
  const response = await fetch(`${API_URL}/student/skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
        student_id: parseInt(studentId), 
        skill_name: skillName, 
        level: level 
    }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to add skill');
  }
  return response.json();
};

export default API_URL;