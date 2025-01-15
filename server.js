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
    customLog('INFO', 'New player connected!');
    players.push(ws);
    ws.send(JSON.stringify({ message: 'Welcome to the 3D game!' }));
    ws.on('message', (message) => {
        customLog('INFO', 'Received: ' + message);  
        try {
            const data = JSON.parse(message);
            players.forEach(player => {
                if (player !== ws) {
                    player.send(JSON.stringify({ update: data }));
                }
            });
        } catch (error) {
            customLog('ERROR', 'Error parsing message: ' + error);
            ws.send(JSON.stringify({ error: 'Invalid message format.' }));
        }
    });
    ws.on('close', () => {
        customLog('INFO', 'Player disconnected');
        const index = players.indexOf(ws);
        if (index > -1) {
            players.splice(index, 1);
        }
    });
    ws.on('error', (error) => {
        customLog('ERROR', 'WebSocket error: ' + error);
    });
});
wss.on('error', (error) => {
    customLog('ERROR', 'WebSocket server error: ' + error);
});
customLog('SUCCESS', 'WebSocket server started');
customLog('INFO', `Listening on port ws://localhost:${process.env.WS_PORT || 15999}`);