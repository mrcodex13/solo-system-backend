require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');
const { startScheduler } = require('./scheduler');

const app = express();

/* ---------------------------
   CORS Configuration
---------------------------- */
app.use(cors({
  origin: "https://solo-system-frontend.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

/* ---------------------------
   Middleware
---------------------------- */
app.use(express.json());

/* ---------------------------
   Routes
---------------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'System Online ◈' });
});

/* ---------------------------
   Database & Server Start
---------------------------- */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('◈ MongoDB connected');

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`◈ Server running on port ${PORT}`);
      startScheduler();
    });
  })
  .catch(err => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });