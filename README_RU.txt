RPC ORDER WEBSITE NEON PRO
==========================

Готовый сайт в стиле RPC / RedPad Creator.

Файлы:
- index.html
- styles.css
- script.js
- config.js
- assets/rpc-avatar.png

Как проверить:
1. Открой index.html двойным кликом.
2. Заполни форму.
3. Если сервер обновлён и есть /public/orders, заявка попадёт в CRM.

Важно:
Перед отправкой заявок сервер CRM должен иметь endpoint:
POST /public/orders

Если ссылка сервера другая:
Открой config.js и поменяй:
window.RPC_API_URL = "https://rpc-team-crm.onrender.com";

Как выложить на Render Static Site:
1. Создай отдельный GitHub репозиторий для сайта.
2. Загрузи туда файлы сайта.
3. Render -> New -> Static Site.
4. Build Command можно пустой или echo no build.
5. Publish Directory: .
