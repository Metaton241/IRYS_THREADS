@echo off
echo Запускаем Chrome без ограничений безопасности...
start chrome --disable-web-security --user-data-dir="%TEMP%\chrome_dev" file:///%cd%/index.html

echo Для тестирования приложения откройте: file:///%cd%/index.html
