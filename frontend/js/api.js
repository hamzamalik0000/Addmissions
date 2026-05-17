const BASE_URL = 'http://localhost:5000/api';

const api = {
  getHeaders: () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  },

  handleResponse: async (response) => {
    if (response.status === 401) {
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      if (typeof app !== 'undefined' && app.navigate) {
        app.navigate('auth-page');
        if (typeof app.showToast === 'function') {
          app.showToast('Session expired. Please log in again.', 'error');
        }
      }
      throw new Error('Unauthorized');
    }
    
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  },

  get: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: api.getHeaders()
      });
      return await api.handleResponse(response);
    } catch (error) {
      console.error(`API GET ${endpoint} error:`, error);
      throw error;
    }
  },

  post: async (endpoint, body) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: api.getHeaders(),
        body: JSON.stringify(body)
      });
      return await api.handleResponse(response);
    } catch (error) {
      console.error(`API POST ${endpoint} error:`, error);
      throw error;
    }
  },

  put: async (endpoint, body) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: api.getHeaders(),
        body: JSON.stringify(body)
      });
      return await api.handleResponse(response);
    } catch (error) {
      console.error(`API PUT ${endpoint} error:`, error);
      throw error;
    }
  },

  delete: async (endpoint) => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: api.getHeaders()
      });
      return await api.handleResponse(response);
    } catch (error) {
      console.error(`API DELETE ${endpoint} error:`, error);
      throw error;
    }
  }
};
