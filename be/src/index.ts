import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.get('/api/v1', (req, res) => {
  res.json({
    message: 'Insurance System API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      customers: '/api/v1/customers',
      policies: '/api/v1/policies',
      claims: '/api/v1/claims',
      products: '/api/v1/products',
      quotes: '/api/v1/quotes',
      payments: '/api/v1/payments',
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Insurance System API running on port ${PORT}`);
});

export default app;
