/////
///// Coded by Comical
///// Blockman Launcher Project@NEXT
/////
const fs = require('fs');
const path = require('path');
const COLORS = {
    INFO: '\x1b[37m',    // Alb
    SUCCESS: '\x1b[32m', // Verde
    ERROR: '\x1b[31m',   // Roșu
    WARNING: '\x1b[33m', // Galben
    RESET: '\x1b[0m'     // Resetare culoare
};
const getFormattedDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return {
        date: `${year}.${month}.${day}`,
        time: `${hours}:${minutes}`
    };
};
const logToFile = (type, message) => {
    const now = new Date();
    const { date, time } = getFormattedDate(now);
    const logDir = path.join(process.cwd(), 'storage', 'db', 'logs', 'server');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    const logFilePath = path.join(logDir, `server_${date.replace(/\./g, '_')}.log`);
    const logMessage = `[${date} ${time}] [${type}]: ${message}\n`;
    fs.appendFileSync(logFilePath, logMessage);
};
const customLog = (type, message) => {
    const now = new Date();
    const { date, time } = getFormattedDate(now);
    const color = COLORS[type.toUpperCase()] || COLORS.INFO;
    const reset = COLORS.RESET;
    console.log(`${color}[${date} ${time}] [${type}]: ${message}${reset}`);
    logToFile(type, message);
};
module.exports = {
    customLog
};
// Exemplu de utilizare:
// const { customLog } = require('./logger.js');
// customLog('INFO', 'Acesta este un mesaj informativ.');
// customLog('SUCCESS', 'Operațiunea a fost realizată cu succes.');
// customLog('ERROR', 'A apărut o eroare.');
// customLog('WARNING', 'Atenție! Verificați configurarea.');