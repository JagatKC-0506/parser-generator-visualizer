import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import parserRoutes from './routes/parserRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api', parserRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SLR Parser Generator API is running' });
});

const distPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`SLR Parser Generator API running on port ${PORT}`);
  });
}
