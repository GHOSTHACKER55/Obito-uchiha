const mineflayer = require('mineflayer');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

io.on('connection', (socket) => {
    let bot;

    socket.on('start-bot', (data) => {
        if (bot) bot.quit(); // Restart if already running

        bot = mineflayer.createBot({
            host: data.host,
            username: data.username,
            auth: 'microsoft' // Required for paid accounts
        });

        bot.on('spawn', () => {
            io.emit('chat', `[SYSTEM] Connected to ${data.host} as ${data.username}`);
            
            // Anti-AFK Routine: Micro-movement
            setInterval(() => {
                if(bot.entity) {
                    bot.setControlState('jump', true);
                    setTimeout(() => bot.setControlState('jump', false), 200);
                }
            }, 50000); 
        });

        bot.on('messagestr', (msg) => io.emit('chat', msg));
        
        bot.on('error', (err) => io.emit('chat', `[ERROR] ${err.message}`));
        bot.on('kicked', (reason) => io.emit('chat', `[KICKED] ${reason}`));

        // Send stats to UI
        setInterval(() => {
            if (bot && bot.entity) {
                io.emit('update', {
                    health: Math.round(bot.health),
                    food: Math.round(bot.food),
                    pos: `${Math.round(bot.entity.position.x)}, ${Math.round(bot.entity.position.y)}, ${Math.round(bot.entity.position.z)}`
                });
            }
        }, 1000);
    });
});

server.listen(3000, () => {
    console.log('Control panel ready: http://localhost:3000');
});
