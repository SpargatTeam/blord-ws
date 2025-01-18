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
const requestIp = require('request-ip');
//// configs
require('dotenv').config({ path: './ws.env' });
const wss = new WebSocket.Server({ port: process.env.WS_PORT || 15999 });
//// server
/// players
const playersPath = './storage/db/users.json'; // we load user list
if (!fs.existsSync(playersPath)) {
    fs.writeFileSync(playersPath, JSON.stringify([]), 'utf-8');
}
let players = JSON.parse(fs.readFileSync(playersPath, 'utf-8')); // loaded player list
// Load users from the same path
const usersPath = './storage/db/users.json';
let users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
setInterval(() => {
    try {
        const updatedPlayers = JSON.parse(fs.readFileSync(playersPath, 'utf-8'));
        if (JSON.stringify(updatedPlayers) !== JSON.stringify(players)) {
            customLog('INFO', 'Players list updated');
            players = updatedPlayers;
        }
        // Also update users list periodically
        const updatedUsers = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
        if (JSON.stringify(updatedUsers) !== JSON.stringify(users)) {
            customLog('INFO', 'Users list updated');
            users = updatedUsers;
        }
    } catch (error) {
        customLog('ERROR', "Error loading players or users list: " + error);
    }
}, 5000);  // we check at 5 seconds for modifications

/// on connection
wss.on('connection', (ws, req) => {
    const clientIp = requestIp.getClientIp(req);
    customLog('INFO', 'New player connected');
    ws.send(JSON.stringify({ start: 'loading' }));
    ws.on('message', (message) => {
        customLog('INFO', 'Received: ' + message); 
        try {
            const data = JSON.parse(message); 
            const { id, token } = data; 
            // Find user by id and token with strict type conversion
            const user = users.find(u => 
                String(u.id) === String(id) && 
                u.accessToken === token
            );
            if (user) {
                ws.user = user; 
                ws.send(JSON.stringify({ start: 'connected', username: user.name })); // connect right user
                customLog('INFO', `${user.name} connected`);
                wss.clients.forEach(client => {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            chat: `${user.name} has joined the game.`,
                            userId: user.id
                        }));
                    }
                });
            } else {
                // More detailed debug logging for failed authentication
                customLog('INFO', `Authentication failed. Searched for user with ID ${id} and token ${token}`);
                customLog('INFO', `Available users: ${JSON.stringify(users.map(u => ({ id: u.id, token: u.accessToken })))}`);
                
                ws.send(JSON.stringify({ start: 'disconnect' })); // disconnect invalid user
                ws.close();
                customLog('INFO', 'Invalid user credentials, disconnecting...');
            }
        } catch (error) {
            customLog('ERROR', 'Error parsing message: ' + error);
            ws.send(JSON.stringify({ error: 'Invalid message format.' }));
        }
    });    
    ws.on('close', () => {
        if (ws.user) {
            customLog('INFO', `${ws.user.id} disconnected`);
            // Safely broadcast disconnection to other clients
            wss.clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    try {
                        client.send(JSON.stringify({ 
                            chat: `${ws.user.name} has disconnected.`, 
                            userId: ws.user.id 
                        }));
                    } catch (error) {
                        customLog('ERROR', `Error broadcasting disconnection: ${error}`);
                    }
                }
            });
            // Remove the disconnected user from players if it exists
            players = players.filter(player => player.ws !== ws);
        } else {
            customLog('INFO', 'Player disconnected, but no user found.');
        }
    });
    ws.on('error', (error) => {
        customLog('ERROR', 'WebSocket error: ' + error); // we don't let server close, whatever happens
    });
});
customLog('SUCCESS', 'WebSocket server started');
customLog('INFO', `Listening on port ws://localhost:${process.env.WS_PORT || 15999}`);