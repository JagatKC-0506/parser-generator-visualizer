import express from 'express';
import cors from 'cors';
import parserRoutes from './routes/parserRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', parserRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SLR Parser Generator API is running' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`SLR Parser Generator API running on port ${PORT}`);
});
