RPC ORDERS v3 — FRONTEND
========================

Загрузи ВСЕ файлы из этого архива в корень GitHub-репозитория статического сайта с заменой старых:

index.html
styles.css
app.js
rpc-avatar.png
site-preview.png

Render Static Site:
Build Command: echo "No build required"
Publish Directory: .

Что добавлено:
- переключатель RU / EN;
- сохранение языка в браузере;
- передача выбранного языка на сайт правил;
- Cloudflare Turnstile для тикетов и отзывов;
- строгая проверка Telegram;
- клиентская проверка форматов и размеров файлов;
- готовая система декоративных PNG-аватаров без самих изображений;
- адаптация декоративных персонажей под телефон и reduced motion.

ВАЖНО: защита Turnstile настраивается на API-сервере, а не в файлах сайта.
API должен вернуть ключ через:
https://rpc-telegrambot.onrender.com/api/public-config

ДЕКОРАТИВНЫЕ АВАТАРЫ
--------------------
Пока массив DECORATIVE_CHARACTERS в app.js пустой, поэтому на сайте ничего лишнего не показывается.
Позже добавь PNG в GitHub и внеси записи в массив:

const DECORATIVE_CHARACTERS = [
  {
    page: "home",
    src: "decor-home-right.png",
    side: "right",
    top: "8%",
    offset: "-35px",
    width: "390px",
    opacity: 0.86,
    animation: "float-slow",
    mobile: "hide",
    depth: 1
  }
];

page: home / prices / works / reviews / faq / order
side: left / right
animation: float-slow / breathe / drift
mobile: "hide" скроет крупного персонажа на телефоне.
Изображения не нажимаются и не перекрывают интерфейс.


АВТОМАТИЧЕСКАЯ ВАЛЮТА
----------------------
Сайт получает страну и курсы через endpoint /api/currency серверного API.
Поддерживаются KZT, RUB, USD, EUR и GBP. Выбор посетителя сохраняется в браузере.
Основные цены задаются в KZT через data-price-kzt в index.html.
Пример: data-price-kzt="5000".
