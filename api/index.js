import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from '../server/routes.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/api', routes);

export default app;