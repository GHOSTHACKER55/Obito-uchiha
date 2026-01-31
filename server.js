const mineflayer = require('mineflayer');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- CONFIGURATION ---
const bot = mineflayer.createBot({
    host: 'YOUR_SERVER_IP', 
    username: 'YOUR_EMAIL',
    auth: 'microsoft',
    version: false // Auto-detect version
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// --- BOT LOGIC ---
bot.on('spawn', () => {
    console.log("Bot spawned!");
    io.emit('chat', "SYSTEM: Bot has connected successfully.");
    
    // Anti-AFK: Move head slightly
    setInterval(() => {
        bot.look(bot.entity.yaw + 0.1, 0);
    }, 15000);
});

bot.on('messagestr', (message) => {
    io.emit('chat', message); // Send in-game chat to web dashboard
});

// Update stats every second
setInterval(() => {
    if (bot.entity) {
        io.emit('update', {
            health: Math.round(bot.health),
            food: Math.round(bot.food),
            pos: `${Math.round(bot.entity.position.x)}, ${Math.round(bot.entity.position.y)}, ${Math.round(bot.entity.position.z)}`
        });
    }
}, 1000);

bot.on('error', (err) => io.emit('chat', `ERROR: ${err.message}`));
bot.on('kicked', (reason) => io.emit('chat', `KICKED: ${reason}`));

server.listen(3000, () => {
    console.log('Dashboard running on http://localhost:3000');
});
