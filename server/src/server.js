import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`Finz AI-Native Financial Review Server`);
      console.log(`Running on port: http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start Finz backend server:', err);
    process.exit(1);
  }
}

startServer();
