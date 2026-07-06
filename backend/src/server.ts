import express from 'express';
import cors from 'cors';
import * as path from 'path';
import dotenv from 'dotenv';

// Import routers
import authRouter from './routes/auth';
import appsRouter from './routes/apps';
import reviewsRouter from './routes/reviews';
import categoriesRouter from './routes/categories';
import blogRouter from './routes/blog';
import wishlistRouter from './routes/wishlist';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: '*', // For local dev, allow all. In production, configure to Next.js domain.
  exposedHeaders: ['X-SHA256-Checksum'],
}));

app.use(express.json());

// Serve static uploads
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));
console.log(`Serving uploads statically from: ${uploadsPath}`);

// API Routing
app.use('/api/auth', authRouter);
app.use('/api/apps', appsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/blog', blogRouter);
app.use('/api/wishlist', wishlistRouter);

// Basic Health Check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express Error Handler:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server successfully started on http://localhost:${PORT}`);
});
