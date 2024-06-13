import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './Router/AdminRouter.js';
import billListRoutes from './Router/BillListRouter.js';
import billRoutes from './Router/BillRouter.js';
import itemRoutes from './Router/ItemRouter.js';
import auth from './Middelware/authMiddelware.js'

const app = express();
dotenv.config();

// Enable CORS for all routes
app.use(cors({
    origin: [`${process.env.DATABASE_URL}`, "http://localhost:3000" , 'http://192.168.1.4:3000' , 'http://192.168.1.8:3000'], 
    credentials: true // Enable CORS credentials
}));

app.use(express.json({ limit: '50mb' }));

// Importing routes
app.use('/api/auth', authRoutes);
app.use('/api/bill-list', billListRoutes);
app.use('/api/bill', billRoutes);
app.use('/api/item', itemRoutes);

const PORT = process.env.PORT;
console.log(PORT);
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
