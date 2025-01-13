const CRYCLANS = require('./src/minecraft/bot');

try {
    const bot = new CRYCLANS();
} catch (err) {
    console.error('Критическая ошибка:', err);
}

process.on('uncaughtException', (err) => {
    console.error('Необработанная ошибка:', err);
}); 