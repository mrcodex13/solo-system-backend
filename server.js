require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const { startScheduler } = require('./scheduler'); // ← ADD THIS

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);
app.get('/', (req, res) => res.json({ status: 'System Online ◈' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('◈ MongoDB connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`◈ Server running on port ${PORT}`);
      startScheduler(); // ← ADD THIS
    });
  })
  .catch(err => { console.error('DB connection failed:', err.message); process.exit(1); });