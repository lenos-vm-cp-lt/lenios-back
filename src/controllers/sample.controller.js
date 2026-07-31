import { successResponse } from '../utils/response.js';

export const getHealthCheck = (req, res) => {
  successResponse(res, 200, 'Leños Rellenos API is operational', {
    timestamp: new Date().toISOString(),
  });
};
