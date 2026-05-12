RPC ORDER WEBSITE NEON PRO PLUS
===============================

Добавлено:
1. Источник клиента в форме.
2. Проверка статуса заявки по номеру RPC-00024.
3. Discord / Telegram кнопки.
4. Блок отзывов.
5. Красивое окно успеха после отправки заявки.
6. Авто-сообщение клиенту с кнопкой копирования.
7. Переключатель тёмной / светлой темы.
8. Анимация при скролле.
9. Онлайн-чат-заглушка справа снизу.
10. Аватарка реагирует на движение мыши.

Файлы для GitHub сайта:
- index.html
- styles.css
- script.js
- config.js
- rpc-avatar.png
- README_RU.txt

Настройки:
Открой config.js и поменяй ссылки:
window.RPC_API_URL = "https://rpc-team-crm.onrender.com";
window.RPC_DISCORD_URL = "https://discord.gg/REPLACE_ME";
window.RPC_TELEGRAM_URL = "https://t.me/REPLACE_ME";

ВАЖНО:
Для проверки статуса заявки нужно обновить сервер CRM.
В архиве есть папка server_update_status_endpoint.
Её файлы надо загрузить в GitHub репозиторий сервера и сделать deploy на Render.

Render Static Site:
Root Directory: пусто
Build Command: echo no build
Publish Directory: .
