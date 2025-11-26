import axios from 'axios';

// Ensure your backend is running on port 3002
const API = axios.create({ baseURL: 'http://localhost:3002/api' });

export const fetchAllocations = () => API.get('/allocations');
export const fetchStudents = () => API.get('/students');
export const createStudent = (data) => API.post('/students', data);
export const createProject = (data) => API.post('/projects', data);

export default API;