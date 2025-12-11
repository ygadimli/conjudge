import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth';
import problemRoutes from './routes/problems';
import submissionRoutes from './routes/submissions';
import dashboardRoutes from './routes/dashboard';
import battleRoutes from './routes/battles';
import userRoutes from './routes/users';
import contestRoutes from './routes/contests';
import friendsRoutes from './routes/friends';
import adminRoutes from './routes/admin';
import announcementRoutes from './routes/announcements';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/announcements', announcementRoutes);

import brainTypeRoutes from './routes/braintype';
app.use('/api/braintype', brainTypeRoutes);

// Static files (Avatars)
import path from 'path';
app.use('/avatars', express.static(path.join(__dirname, '../public/avatars')));

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'ConJudge API is running' });
});

// Socket.IO for real-time battles
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-battle', (battleId) => {
        socket.join(`battle-${battleId}`);
        console.log(`User ${socket.id} joined battle ${battleId}`);
    });

    socket.on('submit-solution', (data) => {
        // Handle real-time solution submission
        io.to(`battle-${data.battleId}`).emit('solution-submitted', {
            userId: data.userId,
            problemId: data.problemId,
            status: data.status
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`🚀 ConJudge Backend running on port ${PORT}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});

export { io };
