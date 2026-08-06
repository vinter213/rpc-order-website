RPC ORDERS — ГОТОВАЯ СБОРКА ДЛЯ GITHUB / RENDER

ВАЖНО:
В архиве нет папок. Все файлы лежат на одном уровне и должны быть загружены
прямо в корень репозитория GitHub.

КАК ЗАГРУЗИТЬ:
1. Распакуйте архив.
2. Откройте репозиторий сайта на GitHub.
3. Нажмите Add file -> Upload files.
4. Выделите ВСЕ распакованные файлы и перетащите их в окно GitHub.
5. Подтвердите замену файлов с одинаковыми именами.
6. Нажмите Commit changes.
7. Дождитесь завершения деплоя Render.

НЕ ЗАГРУЖАЙТЕ САМ ZIP-АРХИВ В РЕПОЗИТОРИЙ.
Нужно загрузить именно файлы из архива.

ПРОВЕРКА ПОСЛЕ ДЕПЛОЯ:
- https://rpc-order-website.onrender.com/
- https://rpc-order-website.onrender.com/og-image.png
- https://rpc-order-website.onrender.com/robots.txt
- https://rpc-order-website.onrender.com/sitemap.xml

ПРОВЕРКА КАРТОЧКИ DISCORD:
Отправьте новую ссылку с параметром для обхода кеша, например:
https://rpc-order-website.onrender.com/?preview=10

SEO v9.0.0 уже подключён в index.html. Open Graph-теги находятся прямо
в исходном HTML, поэтому Discord, Telegram и другие сервисы смогут прочитать
название, описание и изображение без выполнения JavaScript.

АККАУНТЫ / РЕГИСТРАЦИЯ:
Перед публикацией откройте AUTH_SETUP.txt и заполните auth-config.js.
Без Project URL и Publishable Key от Supabase окно аккаунта будет показано,
но отправка кода будет отключена.

ПРОВЕРКА АККАУНТОВ ПОСЛЕ НАСТРОЙКИ:
- нажмите «Войти»;
- введите почту и получите 6-значный код;
- после проверки в Console команда window.RPC_AUTH.user должна вернуть пользователя.
