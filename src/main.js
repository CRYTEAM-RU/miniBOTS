const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;
let botProcess;
let isLoggedIn = false; // Флаг для отслеживания состояния авторизации

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile('index.html'); // Убедитесь, что путь правильный
    mainWindow.webContents.openDevTools(); // Открывает консоль разработчика
}

app.whenReady().then(createWindow);

ipcMain.on('start-bot', (event, { username, password, host }) => {
    // Сохранение настроек в файл
    const settings = { username, password, host };
    fs.writeFileSync(path.join(__dirname, 'settings.json'), JSON.stringify(settings));

    // Запуск бота
    botProcess = spawn('npm', ['start'], { cwd: 'path/to/your/bot' });

    botProcess.stdout.on('data', (data) => {
        const message = data.toString();
        event.sender.send('bot-output', message);

        // Проверка на успешную авторизацию
        if (message.includes('успешно авторизован') || message.includes('successfully logged')) {
            isLoggedIn = true; // Устанавливаем флаг авторизации
        }

        // Отключаем временно спам команды /login
        /*
        // Проверка на необходимость авторизации
        if (message.includes('пожалуйста, авторизуйтесь') || message.includes('please login')) {
            if (!isLoggedIn) { // Проверяем, авторизован ли бот
                console.log('Отправка команды авторизации...');
                botProcess.stdin.write(`/login ${password}\n`); // Отправляем команду логина
            }
        }
        */
    });

    botProcess.stderr.on('data', (data) => {
        event.sender.send('bot-output', data.toString());
    });

    botProcess.on('close', (code) => {
        event.sender.send('bot-output', `Bot exited with code ${code}`);
    });
});