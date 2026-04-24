import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';

  res.status(200).json({
    status: 'OK',
    server: 'Running',
    database: dbStatus,
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});


export default router;
