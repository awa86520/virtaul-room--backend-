const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { connectRedis, redisClient } = require('./config/redis');
const authRoutes = require('./routes/authRoutes');
const dealRoutes = require('./routes/dealRoutes');
const chatRoutes = require('./routes/chatRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

global.io = io;


connectDB();

(async () => {
    await connectRedis();
    global.redisClient = redisClient;
})();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/payments', paymentRoutes);

const users = {}; 

io.on('connection', (socket) => {
    console.log(' User connected:', socket.id);

    socket.on('joinRoom', async ({ dealId, userId }) => {
        socket.join(dealId);
        users[userId] = socket.id;
        console.log(` User ${userId} joined deal room: ${dealId}`);
        
        await redisClient.set(`user:${userId}:room`, dealId);
        io.to(dealId).emit('userJoined', { userId, message: "User joined the room" });
    });

    socket.on('sendMessage', async (message) => {
        io.to(message.dealId).emit('receiveMessage', message);
        await redisClient.lpush(`messages:${message.dealId}`, JSON.stringify(message));
    });

    socket.on('typing', ({ dealId, userId }) => {
        socket.to(dealId).emit('userTyping', { userId });
    });

    socket.on('readMessage', async ({ dealId, messageId, userId }) => {
        io.to(dealId).emit('messageRead', { messageId, userId });
        await redisClient.hset(`readReceipts:${dealId}`, messageId, userId);
    });

    socket.on('disconnect', async () => {
        console.log(' User disconnected:', socket.id);
        for (const [userId, socketId] of Object.entries(users)) {
            if (socketId === socket.id) {
                delete users[userId];
                await redisClient.del(`user:${userId}:room`);
                break;
            }
        }
    });
});

module.exports = { app, server, io };
