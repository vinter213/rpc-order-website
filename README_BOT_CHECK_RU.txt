RPC ORDER SITE — BOT CHECK READY

Что добавлено:
1. Cloudflare Turnstile в форму заявки.
2. Honeypot-поле website — пользователь его не видит, бот часто заполняет.
3. started_at — защита от мгновенной отправки формы.
4. app.js теперь отправляет turnstile_token на backend.
5. BACKEND_BOT_CHECK_FASTAPI.py.txt — готовая вставка для Python/FastAPI backend CRM.

ВАЖНО:
Фронт сам по себе не защищает сайт. Нужно обязательно вставить backend-патч в CRM server.

Что заменить в index.html:
Найди:
PASTE_TURNSTILE_SITE_KEY_HERE

Замени на Cloudflare Turnstile Site Key.

Что добавить в Render backend CRM:
Environment variable:
TURNSTILE_SECRET_KEY=твой_secret_key_из_cloudflare

Где взять ключи:
Cloudflare Dashboard → Turnstile → Add widget → Managed → добавить домен сайта → взять Site Key и Secret Key.

Какие файлы загрузить на сайт:
- index.html
- style.css
- app.js
- rpc_site_api.js
- rpc-avatar.png

Что сделать на backend:
Открыть BACKEND_BOT_CHECK_FASTAPI.py.txt и вставить код в main.py backend CRM.

Проверка:
1. Открой сайт.
2. В форме должна появиться проверка Cloudflare.
3. Заполни форму руками.
4. Отправь заявку.
5. Если backend-патч стоит правильно — заявка уйдёт в CRM/Telegram.

Если будет ошибка:
- "Антибот не настроен на сервере" → не добавлен TURNSTILE_SECRET_KEY в Render.
- "Подтвердите проверку" → не заменён SITE_KEY или виджет не загрузился.
- "Антибот-проверка провалена" → SITE_KEY и SECRET_KEY от разных виджетов или домен не добавлен в Cloudflare.
