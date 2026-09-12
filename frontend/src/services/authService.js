import api from './api';

export const authService = {
  // Known demo personas metadata for offline demo resilience and full profile display
  DEMO_USERS: {
    delhi_controller: {
      userId: 1,
      username: 'delhi_controller',
      fullName: 'Rajesh Sharma',
      role: 'STATION_MASTER',
      designation: 'Chief Section Controller (Delhi - Ghaziabad)',
      stationAssigned: 'NDLS',
      department: 'OPERATIONS',
      email: 'controller.delhi@nr.railnet.gov.in',
    },
    pway_engineer_civil: {
      userId: 2,
      username: 'pway_engineer_civil',
      fullName: 'Vikram Malhotra',
      role: 'MAINTENANCE_ENGINEER',
      designation: 'Senior Section Engineer (P-Way / Track & Bridge)',
      stationAssigned: 'SBB',
      department: 'ENGINEERING',
      email: 'sse.pway.sbb@nr.railnet.gov.in',
    },
    snt_engineer_delhi: {
      userId: 3,
      username: 'snt_engineer_delhi',
      fullName: 'Amitabh Saxena',
      role: 'MAINTENANCE_ENGINEER',
      designation: 'Senior Section Engineer (Signal & Telecom)',
      stationAssigned: 'GZB',
      department: 'SIGNAL_TELECOM',
      email: 'sse.snt.gzb@nr.railnet.gov.in',
    },
    trd_engineer_ohe: {
      userId: 4,
      username: 'trd_engineer_ohe',
      fullName: 'Sunil Deshmukh',
      role: 'MAINTENANCE_ENGINEER',
      designation: 'Senior Section Engineer (TRD / 25kV OHE)',
      stationAssigned: 'ANVT',
      department: 'ELECTRICAL',
      email: 'sse.trd.delhi@nr.railnet.gov.in',
    },
    drm_delhi: {
      userId: 5,
      username: 'drm_delhi',
      fullName: 'Divisional Railway Manager (DRM)',
      role: 'ADMIN',
      designation: 'DRM Delhi Division',
      stationAssigned: 'NDLS',
      department: 'OPERATIONS',
      email: 'drm@delhi.railnet.gov.in',
    },
  },

  // Login with username and password
  async login(username, password) {
    try {
      const res = await api.post('/auth/login', { username, password });
      const apiUser = res.data.data;
      const token = apiUser.token || apiUser.jwtToken;
      const demoMeta = this.DEMO_USERS[username] || {};

      const user = {
        ...demoMeta,
        ...apiUser,
        fullName: apiUser.fullName || demoMeta.fullName || username,
        department: apiUser.department || demoMeta.department || 'OPERATIONS',
        designation: apiUser.designation || demoMeta.designation || 'Railway Officer',
        stationAssigned: apiUser.stationAssigned || demoMeta.stationAssigned || 'NDLS',
        token: token || 'offline-mock-jwt-token',
        jwtToken: token || 'offline-mock-jwt-token',
      };

      if (user.token) {
        localStorage.setItem('jwtToken', user.token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return user;
    } catch (error) {
      console.warn('[Auth] Backend login unavailable or error, checking demo persona fallback...', error);
      
      // Offline fallback: If username matches a demo persona, allow seamless offline demo
      if (this.DEMO_USERS[username]) {
        const demoUser = {
          ...this.DEMO_USERS[username],
          token: 'offline-mock-jwt-token',
          jwtToken: 'offline-mock-jwt-token',
        };
        localStorage.setItem('jwtToken', demoUser.token);
        localStorage.setItem('user', JSON.stringify(demoUser));
        return demoUser;
      }
      throw error;
    }
  },

  // Get current user info
  async getCurrentUser() {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) throw new Error('No user logged in');

      const res = await api.get('/auth/me', {
        params: { userId: user.userId },
      });
      return res.data.data;
    } catch (error) {
      // Return local stored user if backend unavailable
      const stored = this.getUser();
      if (stored) return stored;
      throw error;
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
  },

  // Check if user is logged in
  isAuthenticated() {
    return !!localStorage.getItem('jwtToken');
  },

  // Get stored user
  getUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
};

export default authService;
