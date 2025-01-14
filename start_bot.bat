@echo off
set /p HOST="Введите хост: "
set /p USERNAME="Введите никнейм: "
set /p VERSION="Введите версию: "

echo Запуск бота с параметрами:
echo Хост: %HOST%
echo Никнейм: %USERNAME%
echo Версия: %VERSION%

cd /d "%USERPROFILE%\Desktop\scripts\mine\BlazeX"  // Укажите путь
npm start -- %HOST% %USERNAME% %VERSION%
pause
