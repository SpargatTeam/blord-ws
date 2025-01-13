/////
///// Coded by Comical
///// Blockman Launcher Project@NEXT
/////
//// imports
/// logging
const { customLog } = require('./server/code/logger.js');
/// app
const path = require('path');
const os = require('os');
const fs = require('fs');
const WebSocket = require('ws');
//// configs
require('dotenv').config({ path: './ws.env' });
const wss = new WebSocket.Server({ port: process.env.WS_PORT || 15999 });
//// server
const players = [];
wss.on('connection', (ws) => {
    console.log('New player connected!');
    players.push(ws);
    ws.send(JSON.stringify({ message: 'Welcome to the 3D game!' }));
    ws.on('message', (message) => {
        console.log('Received:', message);
        const data = JSON.parse(message);
        players.forEach(player => {
            if (player !== ws) {
                player.send(JSON.stringify({ update: data }));
            }
        });
    });
    ws.on('close', () => {
        console.log('Player disconnected');
        const index = players.indexOf(ws);
        if (index > -1) {
            players.splice(index, 1);
        }
    });
});
customLog('SUCCESS', 'WebSocket server started');
customLog('INFO', `Listening on port ws://localhost:${process.env.WS_PORT || 15999}`);