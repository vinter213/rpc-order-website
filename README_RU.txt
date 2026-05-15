RPC ORDER SITE ANIMATED + TELEGRAM BUDGET FIX

1) Для сайта rpc-order-website загрузи файлы:
- index.html
- style.css
- app.js
- rpc-avatar.png

Все файлы должны лежать в корне репозитория сайта, без папок.

2) Для сервера rpc-team-crm:
Открой main.py и найди функцию:
def rpc_public_order_send_telegram(order: dict):

Замени эту функцию на код из файла:
BACKEND_TELEGRAM_BUDGET_FIX.py.txt

Потом Commit changes и Render Deploy.

Что исправлено:
- Бюджет клиента теперь отправляется в Telegram как "Бюджет клиента".
- Сайт стал живее: glow за мышкой, анимации появления, hover эффекты, плавающая аватарка, живые карточки.
- Форма отправляет budget, price и client_budget, чтобы сервер точно увидел сумму.
