@echo off
set /p HOST="server IP: "
set /p USERNAME="Nick: "
set /p VERSION="version(primer 1.20 1.20.1): "

echo Запуск бота с параметрами:
echo Хост: %HOST%
echo Никнейм: %USERNAME%
echo Версия: %VERSION%

cd /d "%USERPROFILE%\Desktop\scripts\mine\BlazeX"  // Укажите путь
npm start -- %HOST% %USERNAME% %VERSION%
pause
