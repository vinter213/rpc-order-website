RPC ORDERS — ФАЙЛЫ ДЛЯ GITHUB PAGES

В архиве НЕТ папок. Загрузите в репозиторий rpc-orders все файлы из архива:
- index.html
- styles.css
- app.js
- rpc-avatar.png
- site-preview.png
- README.txt

GitHub:
1. Создайте публичный репозиторий с названием rpc-orders.
2. Add file -> Upload files.
3. Выберите все файлы из этого архива.
4. Commit changes.
5. Settings -> Pages -> Deploy from a branch.
6. Branch: main, folder: / (root), Save.

Сайт правил должен находиться в отдельном репозитории rpc-rules. Ссылки между сайтами определяются автоматически.

ВАЖНО: GitHub Pages — статический хостинг. Токен Telegram-бота нельзя помещать в app.js. Сейчас форма открывает Telegram @ViNter294 с готовым текстом. Для отправки через бота укажите безопасный внешний API в константе TICKET_API_URL в app.js.
