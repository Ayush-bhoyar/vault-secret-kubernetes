const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres-service',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'appdb',
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
});

app.get('/', (_req, res) => {
  res.json({ message: 'Application is running' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/db', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS current_time');
    res.json({
      database: 'connected',
      currentTime: result.rows[0].current_time,
    });
  } catch (error) {
    console.error('Database connection failed:', error.message);
    res.status(500).json({
      database: 'connection_failed',
      error: error.message,
    });
  }
});

process.on('SIGTERM', async () => {
  await pool.end();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
