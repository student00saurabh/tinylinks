exports.healthCheck = (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "TinyLinks server is running",
    timestamp: new Date().toISOString(),
  });
};
