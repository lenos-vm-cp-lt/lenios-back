export const getHealthCheck = (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Leños Rellenos API is operational',
    timestamp: new Date().toISOString(),
  });
};
