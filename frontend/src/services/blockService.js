import api from './api';

export const blockService = {
  // ===== BLOCK MANAGEMENT =====
  
  // Fetch all maintenance blocks
  async getAllBlocks() {
    try {
      const res = await api.get('/blocks');
      return res.data.data; // Unwrap the data field
    } catch (error) {
      console.error('Failed to fetch blocks:', error);
      throw error;
    }
  },

  // Fetch a specific block by ID
  async getBlockById(blockId) {
    try {
      const res = await api.get(`/blocks/${blockId}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to fetch block ${blockId}:`, error);
      throw error;
    }
  },

  // Submit a new block request with conflict check
  async createBlock(blockPayload) {
    try {
      const res = await api.post('/blocks', blockPayload);
      return res.data.data;
    } catch (error) {
      console.error('Failed to create block:', error);
      throw error;
    }
  },

  // Approve block and assign AI-recommended window
  async approveBlock(blockId, allocationPayload = {}) {
    try {
      const res = await api.put(`/blocks/${blockId}/approve`, allocationPayload);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to approve block ${blockId}:`, error);
      throw error;
    }
  },

  // Reject block request with reason
  async rejectBlock(blockId, reason) {
    try {
      const res = await api.put(`/blocks/${blockId}/reject`, { reason });
      return res.data.data;
    } catch (error) {
      console.error(`Failed to reject block ${blockId}:`, error);
      throw error;
    }
  },

  // Get AI recommendations for a block
  async getRecommendations(blockId) {
    try {
      const res = await api.get(`/blocks/${blockId}/recommendations`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to fetch recommendations for block ${blockId}:`, error);
      throw error;
    }
  },

  // Pre-check conflicts for arbitrary proposed window
  async checkConflicts(trackId, startTime, endTime) {
    try {
      const res = await api.get('/blocks/conflicts/check', {
        params: { trackId, startTime, endTime },
      });
      return res.data.data;
    } catch (error) {
      console.error('Failed to check conflicts:', error);
      throw error;
    }
  },

  // Get corridor-wide optimization plan
  async getCorridorPlan() {
    try {
      const res = await api.get('/blocks/corridor-plan');
      return res.data.data;
    } catch (error) {
      console.error('Failed to fetch corridor plan:', error);
      throw error;
    }
  },

  // ===== ASSET MANAGEMENT =====

  // Fetch all assets
  async getAssets(trackId = null) {
    try {
      const params = trackId ? { trackId } : {};
      const res = await api.get('/assets', { params });
      return res.data.data;
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      throw error;
    }
  },

  // Fetch a specific asset
  async getAssetById(assetId) {
    try {
      const res = await api.get(`/assets/${assetId}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to fetch asset ${assetId}:`, error);
      throw error;
    }
  },

  // Fetch degraded assets requiring maintenance (< 70% health)
  async getCriticalAssets(threshold = 70) {
    try {
      const res = await api.get('/assets/health-alerts', {
        params: { threshold },
      });
      return res.data.data;
    } catch (error) {
      console.error('Failed to fetch critical assets:', error);
      throw error;
    }
  },

  // Get shadow blocking opportunities
  async getShadowOpportunities(trackId, currentAssetId = null) {
    try {
      const params = currentAssetId ? { currentAssetId } : {};
      const res = await api.get(`/assets/track/${trackId}/shadow-opportunities`, { params });
      return res.data.data;
    } catch (error) {
      console.error(`Failed to fetch shadow opportunities for track ${trackId}:`, error);
      throw error;
    }
  },

  // ===== SCHEDULE & TRACK MANAGEMENT =====

  // Fetch all schedules
  async getSchedules(trackId = null) {
    try {
      const params = trackId ? { trackId } : {};
      const res = await api.get('/schedules', { params });
      return res.data.data;
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      throw error;
    }
  },

  // Fetch a specific schedule
  async getScheduleById(scheduleId) {
    try {
      const res = await api.get(`/schedules/${scheduleId}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to fetch schedule ${scheduleId}:`, error);
      throw error;
    }
  },

  // Fetch all tracks
  async getTracks() {
    try {
      const res = await api.get('/tracks');
      return res.data.data;
    } catch (error) {
      console.error('Failed to fetch tracks:', error);
      throw error;
    }
  },

  // Fetch a specific track
  async getTrackById(trackId) {
    try {
      const res = await api.get(`/tracks/${trackId}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to fetch track ${trackId}:`, error);
      throw error;
    }
  },

  // ===== TRAIN MANAGEMENT =====

  // Fetch all trains
  async getTrains() {
    try {
      const res = await api.get('/trains');
      return res.data.data;
    } catch (error) {
      console.error('Failed to fetch trains:', error);
      throw error;
    }
  },

  // Fetch a specific train
  async getTrainById(trainId) {
    try {
      const res = await api.get(`/trains/${trainId}`);
      return res.data.data;
    } catch (error) {
      console.error(`Failed to fetch train ${trainId}:`, error);
      throw error;
    }
  },

  // ===== REPORTS & KPIS =====

  // Fetch executive KPI summary (track availability, delay minutes saved, block counts)
  async getKpiSummary() {
    try {
      const res = await api.get('/reports/kpi-summary');
      return res.data.data;
    } catch (error) {
      console.error('Failed to fetch KPI summary:', error);
      throw error;
    }
  },

  // Fetch track availability report (per track or system-wide)
  async getTrackAvailability(trackId = null, days = 30) {
    try {
      const params = { days };
      if (trackId) params.trackId = trackId;
      const res = await api.get('/reports/asset-availability', { params });
      return res.data.data;
    } catch (error) {
      console.error('Failed to fetch track availability:', error);
      throw error;
    }
  },
};