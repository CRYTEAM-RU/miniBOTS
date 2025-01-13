const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class CRYCLANS {
    constructor() {
        this.bot = null;
        this.isConnected = false;
        this.isLoggedIn = false;
        this.loginAttempts = 0;
        this.maxLoginAttempts = 3;
        this.rl = null;
        
        // Задержки
        this.delays = {
            beforeLogin: 3000,     // 3 секунды перед логином
            afterLogin: 5000,      // 5 секунд после логина
            beforeServer: 3000,    // 3 секунды перед переходом на сервер
            afterServer: 10000,    // 10 секунд после перехода на сервер
            beforeWarp: 5000,       // 5 секунд перед варпом
            reconnectDelay: 5000    // 5 секунд перед переподключением
        };

        this.startBot();
        this.initConsoleInput();
    }

    initConsoleInput() {
        // Создаем интерфейс readline только если его еще нет
        if (!this.rl) {
            this.rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
                prompt: 'Команда > '
            });

            console.log('\n=== Консоль управления ботом ===');
            console.log('Доступные команды:');
            console.log('!help - список команд');
            console.log('!status - статус бота');
            console.log('Любой другой текст будет отправлен от имени бота');
            console.log('=====================================\n');

            this.rl.prompt();

            this.rl.on('line', (line) => {
                const command = line.trim();
                if (!command) {
                    this.rl.prompt();
                    return;
                }

                this.handleConsoleInput(command);
                this.rl.prompt();
            });
        }
    }

    async handleConsoleInput(command) {
        try {
            if (command.startsWith('!')) {
                await this.handleConsoleCommand(command.slice(1));
            } else if (this.bot && this.bot.entity) {
                this.bot.chat(command);
                console.log(`[БОТ] Отправлено: ${command}`);
            } else {
                console.log('[ОШИБКА] Бот не подключен');
            }
        } catch (err) {
            console.error('Ошибка при выполнении команды:', err);
        }
    }

    startBot() {
        try {
            console.log('Запуск бота...');
            
            this.bot = mineflayer.createBot({
                host: 'pUpsuk_Semen.aternos.me',
                username: 'CRYT',
                version: '1.20.1',
                auth: 'offline',
                checkTimeoutInterval: 60000,
                hideErrors: true
            });

            this.initializeBot();
        } catch (err) {
            console.error('Ошибка при создании бота:', err);
        }
    }

    initializeBot() {
        this.bot.on('spawn', () => {
            console.log('Бот подключился к серверу');
            this.isConnected = true;
            this.login();
        });

        this.bot.on('message', async (message) => {
            const text = message.toString().toLowerCase();
            console.log('[СЕРВЕР]', message.toString());

            if (text.includes('успешно авторизован') || text.includes('successfully logged')) {
                console.log('Успешная авторизация, выполняем последовательность команд...');
                this.isLoggedIn = true;
                await this.executeLoginSequence();
            }

            if (text.includes('пожалуйста, авторизуйтесь') || text.includes('please login')) {
                if (!this.isLoggedIn) {
                    console.log('Отправка команды авторизации...');
                    await this.sendCommandWithRetry('/login 123123', this.delays.beforeLogin);
                }
            }
        });

        this.bot.on('error', (err) => {
            console.error('Ошибка бота:', err);
            if (err.code === 'ECONNRESET') {
                console.log('Соединение сброшено, переподключение...');
                this.reconnect();
            } else {
                this.isConnected = false;
            }
        });

        this.bot.on('end', () => {
            console.log('Соединение разорвано');
            this.isConnected = false;
            this.reconnect();
        });

        // Обработка ошибок парсинга JSON
        this.bot.on('entitySpawn', (entity) => {
            try {
                // Проверяем, есть ли данные о скине
                if (entity.skin) {
                    const skinData = JSON.parse(entity.skin); // Пример, как это может выглядеть
                }
            } catch (err) {
                console.error('Ошибка парсинга данных скина:', err);
            }
        });
    }

    reconnect() {
        setTimeout(() => {
            console.log('Попытка переподключения...');
            this.startBot();
        }, this.delays.reconnectDelay);
    }

    async sendCommandWithRetry(command, delay) {
        let success = false;
        while (!success && this.loginAttempts < this.maxLoginAttempts) {
            this.bot.chat(command);
            console.log(`Команда отправлена: ${command}`);
            await this.sleep(delay);
            this.loginAttempts++;

            if (this.isLoggedIn) {
                success = true;
            }
        }

        if (!success) {
            console.log('Превышено количество попыток отправки команды.');
        }
    }

    async executeLoginSequence() {
        try {
            // Ждем после авторизации
            await this.sleep(this.delays.afterLogin);
            console.log('Отправка команды перехода на сервер...');
            await this.sendCommandWithRetry('/s8', this.delays.beforeServer);

            // Ждем перехода на сервер
            await this.sleep(this.delays.afterServer);
            console.log('Отправка команды варпа...');
            await this.sendCommandWithRetry('/warp JusticeBot', this.delays.beforeWarp);

            console.log('Последовательность входа завершена');
        } catch (err) {
            console.error('Ошибка при выполнении последовательности входа:', err);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    handleConsoleCommand(command) {
        switch (command.toLowerCase()) {
            case 'help':
                console.log('\n=== Команды консоли ===');
                console.log('!help - показать это сообщение');
                console.log('!status - показать статус бота');
                console.log('!quit - выключить бота');
                console.log('!reconnect - переподключить бота');
                console.log('!blacklist - показать черный список');
                console.log('!addbl <ник> - добавить в ЧС');
                console.log('!removebl <ник> - удалить из ЧС');
                console.log('=====================\n');
                break;

            case 'status':
                const status = this.bot && this.bot.entity ? 'Подключен' : 'Отключен';
                console.log(`\nСтатус бота: ${status}`);
                if (this.bot && this.bot.entity) {
                    console.log(`Ник: ${this.bot.username}`);
                    console.log(`Здоровье: ${this.bot.health}`);
                    console.log(`Позиция: ${JSON.stringify(this.bot.entity.position)}`);
                }
                console.log('');
                break;

            case 'quit':
                console.log('Выключение бота...');
                if (this.bot) this.bot.end();
                process.exit(0);
                break;

            case 'reconnect':
                console.log('Переподключение...');
                if (this.bot) this.bot.end();
                this.startBot();
                break;

            default:
                console.log('Неизвестная команда. Используйте !help для списка команд');
        }
    }

    login() {
        this.loginAttempts = 0; // Сброс счетчика попыток
        this.sendCommandWithRetry('/login 123123', this.delays.beforeLogin);
    }
}

module.exports = CRYCLANS; 