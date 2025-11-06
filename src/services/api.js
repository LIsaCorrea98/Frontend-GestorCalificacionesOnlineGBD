// API base configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  // Handle empty responses (like 204 No Content)
  if (response.status === 204) {
    return {};
  }
  
  // Try to parse JSON, but handle cases where response might not be JSON
  let data;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    // If it's not JSON, return empty object for successful responses
    if (response.ok) {
      return {};
    }
    throw new Error(`Error parsing response: ${e.message}`);
  }
  
  if (!response.ok) {
    const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
    
    // Handle authentication errors
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    throw new Error(errorMessage);
  }
  return data;
};

// API client object
const api = {
  // Authentication
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(response);
  },

  async register(userData) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Teacher endpoints
  async uploadCSV(file, courseCode, courseName, description) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseCode', courseCode);
    formData.append('courseName', courseName);
    formData.append('description', description);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/teacher/upload-csv`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return handleResponse(response);
  },

  async createCourse(courseData) {
    const response = await fetch(`${API_BASE_URL}/teacher/courses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });
    return handleResponse(response);
  },

  async getTeacherCourses() {
    const response = await fetch(`${API_BASE_URL}/teacher/courses`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async getCourseDetails(courseId) {
    const response = await fetch(`${API_BASE_URL}/teacher/courses/${courseId}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async getCourseStatistics(courseId) {
    const response = await fetch(`${API_BASE_URL}/teacher/courses/${courseId}/statistics`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Student endpoints
  async getStudentCourses() {
    const response = await fetch(`${API_BASE_URL}/student/courses`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async getStudentGradesForCourse(courseId) {
    const response = await fetch(`${API_BASE_URL}/student/courses/${courseId}/grades`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  async getAllStudentGrades() {
    const response = await fetch(`${API_BASE_URL}/student/grades`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

export default api;

