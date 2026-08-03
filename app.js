"use strict";

const API_BASE = "https://rpc-telegrambot.onrender.com";
const TICKET_API_URL = `${API_BASE}/api/tickets`;
const RULES_BASE_URL = "https://rpc-rules.onrender.com/";
const LANGUAGE_KEY = "rpc_language_v1";
const CURRENCY_KEY = "rpc_currency_v1";
const SUPPORTED_CURRENCIES = ["KZT", "RUB", "USD", "EUR", "GBP"];
const FALLBACK_CURRENCY_RATES = { KZT: 1, RUB: 0.1695, USD: 0.00209, EUR: 0.00182, GBP: 0.00157 };

const uiText = {
  ru: {
    fillRequired: "Заполните обязательные поля.",
    telegramInvalid: "Укажите Telegram в формате @username.",
    selectFilesMax: "Можно прикрепить не более {count} файлов.",
    fileTooLarge: "Файл «{name}» больше 10 МБ.",
    totalTooLarge: "Суммарный размер файлов превышает 30 МБ.",
    fileTypeBlocked: "Файл «{name}» имеет запрещённый формат.",
    noFiles: "Файлы не выбраны",
    sending: "Отправка…",
    sendingFiles: "Отправка заявки и файлов…",
    ticketSent: "Тикет {id} отправлен.{files} Мы свяжемся с вами в Telegram.",
    filesSent: " Файлов отправлено: {count}.",
    ticketFallbackError: "Не удалось отправить тикет. Напишите напрямую @ViNter294.",
    submitTicket: "Отправить тикет →",
    statsSynced: "Данные синхронизированы для всех посетителей",
    statsUnavailable: "Статистика временно недоступна",
    reviewsLoading: "Загрузка отзывов…",
    noReviews: "Пока нет опубликованных отзывов. Можно оставить первый.",
    reviewsLoadError: "Не удалось загрузить отзывы. Попробуйте позже.",
    reviewPublished: "Отзыв опубликован. Спасибо.",
    reviewModeration: "Отзыв отправлен на проверку. Спасибо.",
    reviewSendError: "Не удалось отправить отзыв.",
    submitReview: "Отправить отзыв →",
    orderSecurityLoading: "Загрузка проверки безопасности…",
    reviewSecurityLoading: "Загрузка проверки безопасности…",
    securityReady: "Проверка пройдена.",
    securityRequired: "Подтвердите, что вы не робот.",
    securityUnavailable: "Защита формы не настроена. Сообщите администрации.",
    securityExpired: "Проверка истекла. Пройдите её ещё раз.",
    categoryFallback: "Заказ RPC",
    workImageAlt: "{title}, изображение {index}",
    galleryWork: "Работа RPC",
    removeFile: "Удалить {name}",
    configured: "Защита активна",
    currencyDetecting: "Определяем страну и валюту…",
    currencyAuto: "Автовыбор: {currency} · {country}",
    currencyManual: "Выбрано вручную: {currency}",
    currencyFallback: "Валюта по умолчанию: {currency}",
    currencyPriceFrom: "от",
    currencyCustomQuote: "по расчёту",
    currencyRateNote: "Цены пересчитаны ориентировочно по курсу на {date}. Итоговая стоимость фиксируется после обсуждения.",
    currencyRateFallback: "Показан резервный ориентировочный курс. Итоговая стоимость фиксируется после обсуждения.",
    currencyCountryUnknown: "не определено",
    budgetPlaceholder: "Например: {example}",
    onlineLocale: "ru-RU"
  },
  en: {
    fillRequired: "Complete all required fields.",
    telegramInvalid: "Enter Telegram in the @username format.",
    selectFilesMax: "You can attach no more than {count} files.",
    fileTooLarge: "The file “{name}” is larger than 10 MB.",
    totalTooLarge: "The total file size exceeds 30 MB.",
    fileTypeBlocked: "The file “{name}” has a blocked format.",
    noFiles: "No files selected",
    sending: "Sending…",
    sendingFiles: "Sending the request and files…",
    ticketSent: "Ticket {id} has been sent.{files} We will contact you on Telegram.",
    filesSent: " Files sent: {count}.",
    ticketFallbackError: "Could not send the ticket. Contact @ViNter294 directly.",
    submitTicket: "Send ticket →",
    statsSynced: "Statistics are synchronized for all visitors",
    statsUnavailable: "Statistics are temporarily unavailable",
    reviewsLoading: "Loading reviews…",
    noReviews: "There are no published reviews yet. You can leave the first one.",
    reviewsLoadError: "Could not load reviews. Try again later.",
    reviewPublished: "Your review has been published. Thank you.",
    reviewModeration: "Your review was sent for moderation. Thank you.",
    reviewSendError: "Could not submit the review.",
    submitReview: "Submit review →",
    orderSecurityLoading: "Loading security verification…",
    reviewSecurityLoading: "Loading security verification…",
    securityReady: "Verification completed.",
    securityRequired: "Confirm that you are not a robot.",
    securityUnavailable: "Form protection is not configured. Contact the administrator.",
    securityExpired: "Verification expired. Complete it again.",
    categoryFallback: "RPC commission",
    workImageAlt: "{title}, image {index}",
    galleryWork: "RPC project",
    removeFile: "Remove {name}",
    configured: "Protection is active",
    currencyDetecting: "Detecting country and currency…",
    currencyAuto: "Auto-selected: {currency} · {country}",
    currencyManual: "Selected manually: {currency}",
    currencyFallback: "Default currency: {currency}",
    currencyPriceFrom: "from",
    currencyCustomQuote: "custom quote",
    currencyRateNote: "Prices are approximate and converted using rates updated on {date}. The final price is agreed after discussion.",
    currencyRateFallback: "Fallback approximate rates are shown. The final price is agreed after discussion.",
    currencyCountryUnknown: "not detected",
    budgetPlaceholder: "For example: {example}",
    onlineLocale: "en-US"
  }
};

const staticEnglish = {
  "Главная":"Home","Прайс-лист":"Pricing","Валюта":"Currency","Определяем страну…":"Detecting country…","Наши работы":"Our work","Отзывы":"Reviews","Создать заказ":"Create order","Правила":"Rules","Создать тикет":"Create ticket","Онлайн":"Online",
  "Принимаем заказы":"Commissions open","Ответ обычно в Telegram":"We usually reply on Telegram","VRCHAT · АВАТАРЫ · МИРЫ":"VRCHAT · AVATARS · WORLDS","Создаём проекты,":"We create projects","которые выделяются":"that stand out",
  "Аватары, миры, Udon-системы, оптимизация и Quest-версии. Опишите задачу — заявка попадёт напрямую команде RPC.":"Avatars, worlds, Udon systems, optimization, and Quest versions. Describe your task and the request will go directly to the RPC team.",
  "Открыть правила":"Open rules","Правила хранятся на отдельном сайте документации":"The rules are stored on a separate documentation website","уникальных посетителей":"unique visitors","сейчас на сайте":"online now","опубликованных отзывов":"published reviews","Синхронизация статистики…":"Synchronizing statistics…",
  "УСЛУГИ":"SERVICES","Выберите категорию":"Choose a category","Смотреть прайс →":"View pricing →","VRChat-аватар":"VRChat avatar","VRChat-мир":"VRChat world","VRChat-аватары":"VRChat avatars","Настройка, кастомизация, функции, PhysBone и визуальные эффекты.":"Setup, customization, features, PhysBone, and visual effects.","Оформить заказ →":"Create order →","VRChat-миры":"VRChat worlds","Локации, освещение, интерактив, Udon-системы и оптимизация.":"Locations, lighting, interactions, Udon systems, and optimization.","Quest-версия":"Quest version","Подготовка аватаров и миров под ограничения Android / Quest.":"Preparing avatars and worlds for Android / Quest limits.","Оптимизация":"Optimization","Материалы, текстуры, полигоны, PhysBone и производительность.":"Materials, textures, polygons, PhysBone, and performance.",
  "ПРОЦЕСС":"PROCESS","Как всё проходит":"How it works","Категория":"Category","Выбираете нужную услугу.":"Choose the required service.","Читаете условия категории.":"Read the category rules.","Тикет":"Ticket","Описываете задачу.":"Describe your task.","Связь":"Contact","Мы отвечаем в Telegram.":"We reply on Telegram.","ПОРТФОЛИО":"PORTFOLIO","Посмотреть наши работы":"View our work",
  "УСЛУГИ И СТОИМОСТЬ":"SERVICES AND PRICING","Финальная стоимость зависит от сложности, исходных материалов и сроков. Точная цена определяется после обсуждения.":"The final price depends on complexity, source materials, and deadlines. The exact cost is determined after discussion.","от 5 000 ₸":"from 5,000 ₸","Загрузка и базовая настройка":"Upload and basic setup","Добавление ассетов и функций":"Adding assets and features","Меню, анимации и PhysBone":"Menus, animations, and PhysBone","PC / Quest подготовка":"PC / Quest preparation","Заказать →":"Order →","по расчёту":"custom quote","Создание локации":"Location creation","Освещение и атмосфера":"Lighting and atmosphere","Udon и интерактив":"Udon and interactions","Оптимизация PC / Quest":"PC / Quest optimization","от 3 000 ₸":"from 3,000 ₸","Quest-портирование":"Quest porting","Мобильные материалы":"Mobile materials","Сжатие текстур":"Texture compression","Оптимизация мешей":"Mesh optimization","Проверка ограничений SDK":"SDK limit checks","от 2 000 ₸":"from 2,000 ₸","Исправления":"Fixes","Ошибки Unity и SDK":"Unity and SDK errors","Оптимизация проекта":"Project optimization","Настройка систем":"System setup","Консультация по проекту":"Project consultation","Цены являются ориентировочными и редактируются в файле":"Prices are approximate and can be edited in","Цены являются ориентировочными. Основная валюта — KZT; пересчёт выполняется автоматически.":"Prices are approximate. KZT is the base currency; conversion is automatic.","Курсы:":"Rates:",
  "Примеры оформления и визуального направления. Здесь можно заменить изображения на собственные работы.":"Examples of presentation and visual direction. Replace these images with your own projects.","2 фото":"2 images","Система заказов и документации.":"Commission and documentation system.","Фирменный визуальный стиль.":"Brand visual identity.","Добавьте проект":"Add a project","Укажите несколько файлов в data-images.":"Add multiple files in data-images.",
  "Загрузка отзывов…":"Loading reviews…","МНЕНИЯ КЛИЕНТОВ":"CLIENT FEEDBACK","Отзывы загружаются с общей базы данных, поэтому все посетители видят один и тот же список.":"Reviews are loaded from a shared database, so every visitor sees the same list.","средняя оценка":"average rating","Обновить":"Refresh","ОСТАВИТЬ ОТЗЫВ":"LEAVE A REVIEW","Расскажите о заказе":"Tell us about your commission","Имя / никнейм":"Name / nickname","Функции / системы":"Features / systems","Другое":"Other","Оценка":"Rating","★★★★★ — отлично":"★★★★★ — excellent","★★★★☆ — хорошо":"★★★★☆ — good","★★★☆☆ — нормально":"★★★☆☆ — average","★★☆☆☆ — есть замечания":"★★☆☆☆ — needs improvement","★☆☆☆☆ — плохо":"★☆☆☆☆ — poor","Текст отзыва":"Review text","ЗАЩИТА ОТ СПАМА":"SPAM PROTECTION","Загрузка проверки безопасности…":"Loading security verification…","Отправить отзыв →":"Submit review →","Отзыв может появиться сразу или после проверки — зависит от настроек модерации.":"The review may appear immediately or after moderation, depending on the current settings.",
  "ПОМОЩЬ":"HELP","Частые вопросы":"Frequently asked questions","Основные юридические и рабочие условия находятся на отдельном сайте правил.":"The main legal and working terms are available on the separate rules website.","Когда начинается работа?":"When does work begin?","После обсуждения задачи, согласования стоимости и получения предоплаты.":"After the task, price, and advance payment are agreed.","Сколько правок входит в заказ?":"How many revisions are included?","Две небольшие правки. Серьёзные изменения и полная переделка считаются отдельно.":"Two minor revisions are included. Major changes and complete reworks are priced separately.","Можно заказать Quest-версию?":"Can I order a Quest version?","Да. Quest-портирование можно выбрать отдельной категорией или добавить к основному заказу.":"Yes. Quest porting can be selected as a separate category or added to the main commission.","Куда приходит заявка?":"Where is the request sent?","После отправки форма передаёт заявку и вложения защищённому серверу, а сервер отправляет их владельцу через Telegram-бота.":"The form sends the request and attachments to a protected server, which forwards them through a Telegram bot.","Статистика посещений общая для всех?":"Are visitor statistics shared?","Да. Счётчик хранится в общей базе данных, а сайт регулярно обновляет значения для всех посетителей.":"Yes. The counter is stored in a shared database and updated for all visitors.","Можно получить Unity-проект?":"Can I receive the Unity project?","Да, когда это заранее согласовано и не нарушает лицензии используемых ассетов.":"Yes, when agreed in advance and when it does not violate asset licenses.","Как защищены формы?":"How are forms protected?","Формы защищены серверной проверкой, ограничением частоты запросов, проверкой файлов и Cloudflare Turnstile.":"Forms are protected by server-side validation, rate limits, file checks, and Cloudflare Turnstile.","Все правила ↗":"All rules ↗","Создать тикет →":"Create ticket →",
  "НОВЫЙ ЗАКАЗ":"NEW COMMISSION","Заполните форму. Перед отправкой необходимо ознакомиться с правилами.":"Complete the form. You must read the rules before submitting.","Бюджет":"Budget","Описание заказа":"Commission description","ФАЙЛЫ К ТИКЕТУ":"TICKET ATTACHMENTS","До 5 файлов, не более 10 МБ каждый и 30 МБ суммарно.":"Up to 5 files, no more than 10 MB each and 30 MB total.","Выбрать файлы":"Select files","Файлы не выбраны":"No files selected","Открыть документацию с правилами ↗":"Open rules documentation ↗","Я ознакомился(-ась) с":"I have read the","правилами":"rules","и согласен(-на) с условиями.":"and agree to the terms.","Отправить тикет":"Send ticket","КОНТАКТ":"CONTACT","После отправки заявка автоматически придёт владельцу через Telegram-бота.":"After submission, the request is automatically delivered to the owner through the Telegram bot.","Открыть Telegram ↗":"Open Telegram ↗","ДОКУМЕНТАЦИЯ":"DOCUMENTATION","Единая ссылка":"Single rules hub","На сайте правил пользователь выбирает категорию: аватары или миры.":"On the rules website, the user chooses the avatar or world category.","Перейти к правилам ↗":"Open rules ↗","Работа RPC":"RPC project","Листайте стрелками, колёсиком или свайпом":"Use arrows, mouse wheel, or swipe","Всего посетителей:":"Total visitors:"
};

const placeholderEnglish = {
  "Как вас подписать":"How should we display your name?",
  "Что заказывали и как прошла работа?":"What did you order and how did it go?",
  "Например: 30 000 ₸":"For example: 30,000 ₸",
  "Как к вам обращаться":"How should we address you?",
  "Опишите задачу, желаемый результат, сроки и приложите ссылки на референсы...":"Describe the task, desired result, deadlines, and add reference links...",
  "Выберите категорию":"Choose a category"
};

const originalTextNodes = [];
const originalAttributes = [];
let currentLanguage = "ru";

function formatMessage(template, values = {}) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, String(value)), template);
}
function t(key, values) {
  return formatMessage(uiText[currentLanguage]?.[key] || uiText.ru[key] || key, values);
}
function captureTranslatableContent() {
  if (originalTextNodes.length) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (["SCRIPT", "STYLE"].includes(node.parentElement?.tagName)) return NodeFilter.FILTER_REJECT;
      return node.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  while (walker.nextNode()) originalTextNodes.push({ node: walker.currentNode, value: walker.currentNode.nodeValue });
  document.querySelectorAll("[placeholder], [aria-label], [title]").forEach(element => {
    ["placeholder", "aria-label", "title"].forEach(attribute => {
      if (element.hasAttribute(attribute)) originalAttributes.push({ element, attribute, value: element.getAttribute(attribute) });
    });
  });
}
function translateTextValue(value, language) {
  if (language === "ru") return value;
  const leading = value.match(/^\s*/)?.[0] || "";
  const trailing = value.match(/\s*$/)?.[0] || "";
  const core = value.trim();
  return leading + (staticEnglish[core] || core) + trailing;
}
function translateAttributeValue(value, language) {
  if (language === "ru") return value;
  return placeholderEnglish[value] || staticEnglish[value] || value;
}
function getQueryLanguage() {
  const query = new URLSearchParams(location.search).get("lang");
  return query === "en" || query === "ru" ? query : null;
}
function updateRulesLinks() {
  const url = new URL(RULES_BASE_URL);
  url.searchParams.set("lang", currentLanguage);
  document.querySelectorAll('[id^="rulesLink"], #rulesInline').forEach(link => { link.href = url.toString(); });
}
function applyLanguage(language, persist = true) {
  currentLanguage = language === "en" ? "en" : "ru";
  document.documentElement.lang = currentLanguage;
  if (persist) localStorage.setItem(LANGUAGE_KEY, currentLanguage);
  captureTranslatableContent();
  originalTextNodes.forEach(item => { item.node.nodeValue = translateTextValue(item.value, currentLanguage); });
  originalAttributes.forEach(item => { item.element.setAttribute(item.attribute, translateAttributeValue(item.value, currentLanguage)); });
  window.RPC_SEO?.update({ language: currentLanguage });
  document.querySelectorAll("[data-language]").forEach(button => button.classList.toggle("active", button.dataset.language === currentLanguage));
  updateRulesLinks();
  updateDynamicLanguage();
  renderTurnstileWidgets(true);
}

document.querySelectorAll("[data-language]").forEach(button => button.addEventListener("click", () => applyLanguage(button.dataset.language)));

const categoryLabels = {
  ru: { avatar:"VRChat-аватар", world:"VRChat-мир", quest:"Quest-версия", optimization:"Оптимизация", functions:"Функции / системы", other:"Другое" },
  en: { avatar:"VRChat avatar", world:"VRChat world", quest:"Quest version", optimization:"Optimization", functions:"Features / systems", other:"Other" }
};


const currencySelects = [...document.querySelectorAll("[data-currency-select]")];
const currencyHints = [...document.querySelectorAll("[data-currency-hint]")];
const currencyRateNote = document.getElementById("currencyRateNote");
const budgetInput = document.getElementById("budget");
let currentCurrency = "KZT";
let currencyRates = { ...FALLBACK_CURRENCY_RATES };
let currencyState = {
  countryCode: null,
  autoDetected: false,
  manual: false,
  source: "fallback",
  updatedAt: null
};

function validCurrency(value) {
  const code = String(value || "").toUpperCase();
  return SUPPORTED_CURRENCIES.includes(code) ? code : null;
}

function currencyLocale(currency) {
  if (currentLanguage === "en") return currency === "GBP" ? "en-GB" : "en-US";
  if (currency === "KZT") return "ru-KZ";
  if (currency === "RUB") return "ru-RU";
  return "ru-RU";
}

function formatCurrencyValue(value, currency = currentCurrency) {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  const maximumFractionDigits = ["KZT", "RUB"].includes(currency) || safeValue >= 100 ? 0 : 2;
  return new Intl.NumberFormat(currencyLocale(currency), {
    style: "currency",
    currency,
    currencyDisplay: "symbol",
    minimumFractionDigits: 0,
    maximumFractionDigits
  }).format(safeValue);
}

function convertedPrice(kztAmount, currency = currentCurrency) {
  const rate = Number(currencyRates[currency]);
  return Number(kztAmount) * (Number.isFinite(rate) && rate > 0 ? rate : 1);
}

function rateDateLabel(value) {
  const parsed = value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString(uiText[currentLanguage].onlineLocale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function budgetExample(currency = currentCurrency) {
  const examples = { KZT: 30000, RUB: 5000, USD: 100, EUR: 100, GBP: 100 };
  return formatCurrencyValue(examples[currency] || 100, currency);
}

function renderCurrencyUI() {
  currencySelects.forEach(select => { select.value = currentCurrency; });

  document.querySelectorAll("[data-price-kzt]").forEach(element => {
    const amount = Number(element.dataset.priceKzt || 0);
    element.textContent = `${t("currencyPriceFrom")} ${formatCurrencyValue(convertedPrice(amount))}`;
  });
  document.querySelectorAll("[data-price-custom]").forEach(element => {
    element.textContent = t("currencyCustomQuote");
  });

  const country = currencyState.countryCode || t("currencyCountryUnknown");
  const hint = currencyState.manual
    ? t("currencyManual", { currency: currentCurrency })
    : currencyState.autoDetected
      ? t("currencyAuto", { currency: currentCurrency, country })
      : t("currencyFallback", { currency: currentCurrency });
  currencyHints.forEach(element => { element.textContent = hint; });

  if (currencyRateNote) {
    currencyRateNote.textContent = currencyState.source === "fallback"
      ? t("currencyRateFallback")
      : t("currencyRateNote", { date: rateDateLabel(currencyState.updatedAt) });
  }
  if (budgetInput) budgetInput.placeholder = t("budgetPlaceholder", { example: budgetExample() });
}

function selectCurrency(currency, { persist = true, manual = true } = {}) {
  const safeCurrency = validCurrency(currency) || "KZT";
  currentCurrency = safeCurrency;
  currencyState.manual = manual;
  if (persist) localStorage.setItem(CURRENCY_KEY, safeCurrency);
  renderCurrencyUI();
}

currencySelects.forEach(select => {
  select.addEventListener("change", () => selectCurrency(select.value, { persist: true, manual: true }));
});

async function loadCurrencyConfiguration() {
  currencyHints.forEach(element => { element.textContent = t("currencyDetecting"); });
  const savedCurrency = validCurrency(localStorage.getItem(CURRENCY_KEY));
  try {
    const query = new URLSearchParams({
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      locale: navigator.language || ""
    });
    const response = await fetch(`${API_BASE}/api/currency?${query}`, { cache: "no-store" });
    const result = await readJsonResponse(response);
    const receivedRates = result.rates && typeof result.rates === "object" ? result.rates : {};
    currencyRates = { ...FALLBACK_CURRENCY_RATES };
    SUPPORTED_CURRENCIES.forEach(code => {
      const rate = Number(receivedRates[code]);
      if (Number.isFinite(rate) && rate > 0) currencyRates[code] = rate;
    });
    currencyState = {
      countryCode: String(result.countryCode || "").toUpperCase() || null,
      autoDetected: !savedCurrency && Boolean(result.autoDetected),
      manual: Boolean(savedCurrency),
      source: String(result.source || "fallback"),
      updatedAt: result.updatedAt || null
    };
    currentCurrency = savedCurrency || validCurrency(result.currency) || "KZT";
  } catch (error) {
    console.warn("Currency:", error);
    currentCurrency = savedCurrency || "KZT";
    currencyRates = { ...FALLBACK_CURRENCY_RATES };
    currencyState = {
      countryCode: null,
      autoDetected: false,
      manual: Boolean(savedCurrency),
      source: "fallback",
      updatedAt: null
    };
  }
  renderCurrencyUI();
}

const pages = [...document.querySelectorAll("[data-page]")];
const navLinks = [...document.querySelectorAll("[data-route]")];
const sidebar = document.querySelector(".sidebar");
const menuButton = document.getElementById("menuButton");

function showPage(route) {
  const safe = pages.some(page => page.dataset.page === route) ? route : "home";
  pages.forEach(page => page.classList.toggle("active-page", page.dataset.page === safe));
  navLinks.forEach(link => link.classList.toggle("active", link.dataset.route === safe));
  sidebar?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
  window.RPC_SEO?.update({ route: safe, language: currentLanguage });
  if (safe === "reviews") loadReviews();
}
function routeFromHash() {
  const hash = location.hash.replace("#", "").split("?")[0] || "home";
  showPage(hash);
}
window.addEventListener("hashchange", routeFromHash);
routeFromHash();

menuButton?.addEventListener("click", () => {
  const open = sidebar?.classList.toggle("open") || false;
  menuButton.setAttribute("aria-expanded", String(open));
});
document.addEventListener("click", event => {
  if (innerWidth <= 760 && sidebar?.classList.contains("open") && !sidebar.contains(event.target) && !menuButton?.contains(event.target)) {
    sidebar.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  }
});

const categorySelect = document.getElementById("category");
function openOrder(category) {
  location.hash = "order";
  setTimeout(() => { if (categorySelect && category) categorySelect.value = category; }, 0);
}
document.querySelectorAll("[data-category]").forEach(button => button.addEventListener("click", () => openOrder(button.dataset.category)));

document.addEventListener("contextmenu", event => { if (event.target.closest(".protected-image")) event.preventDefault(); });
document.querySelectorAll(".protected-image").forEach(image => image.addEventListener("dragstart", event => event.preventDefault()));
window.addEventListener("pointermove", event => {
  document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
  document.documentElement.style.setProperty("--decor-shift-x", `${(event.clientX / innerWidth - .5) * 8}px`);
  document.documentElement.style.setProperty("--decor-shift-y", `${(event.clientY / innerHeight - .5) * 6}px`);
}, { passive:true });

// Decorative avatars are intentionally empty for now. Add transparent PNG files later.
// Example:
// { page:"home", src:"decor-home-right.png", side:"right", top:"8%", width:"390px", opacity:.86, animation:"float-slow", mobile:"hide" }
const DECORATIVE_CHARACTERS = [];
function renderDecorativeCharacters() {
  document.querySelectorAll(".site-character-layer").forEach(layer => layer.remove());
  const grouped = new Map();
  DECORATIVE_CHARACTERS.forEach(item => {
    if (!item.src || !item.page) return;
    if (!grouped.has(item.page)) grouped.set(item.page, []);
    grouped.get(item.page).push(item);
  });
  grouped.forEach((items, pageName) => {
    const page = document.querySelector(`[data-page="${CSS.escape(pageName)}"]`);
    if (!page) return;
    const layer = document.createElement("div");
    layer.className = "site-character-layer";
    items.forEach((item, index) => {
      const image = document.createElement("img");
      image.src = item.src;
      image.alt = "";
      image.draggable = false;
      image.className = `site-character ${item.animation || "float-slow"} ${item.mobile === "hide" ? "hide-mobile" : ""}`;
      image.style.setProperty("--character-top", item.top || "auto");
      image.style.setProperty("--character-bottom", item.bottom || "auto");
      image.style.setProperty("--character-left", item.side === "left" ? (item.offset || "-30px") : "auto");
      image.style.setProperty("--character-right", item.side === "right" ? (item.offset || "-30px") : "auto");
      image.style.setProperty("--character-width", item.width || "320px");
      image.style.setProperty("--character-opacity", String(item.opacity ?? .78));
      image.style.setProperty("--character-delay", `${item.delay ?? index * -.8}s`);
      image.style.setProperty("--character-rotate", `${item.rotate ?? 0}deg`);
      image.style.setProperty("--character-depth", String(item.depth ?? 1));
      layer.append(image);
    });
    page.append(layer);
  });
}
renderDecorativeCharacters();

const description = document.getElementById("description");
const counter = document.getElementById("counter");
description?.addEventListener("input", () => { counter.textContent = String(description.value.length); });

const agreement = document.getElementById("agreement");
const submitButton = document.getElementById("submitButton");
const reviewSubmit = document.getElementById("reviewSubmit");
const orderSecurityStatus = document.getElementById("orderSecurityStatus");
const reviewSecurityStatus = document.getElementById("reviewSecurityStatus");
const orderStartedAt = document.getElementById("orderFormStartedAt");
const reviewStartedAt = document.getElementById("reviewFormStartedAt");
let orderTurnstileToken = "";
let reviewTurnstileToken = "";
let orderTurnstileWidget = null;
let reviewTurnstileWidget = null;
let turnstileConfig = null;
let turnstileRendering = false;

if (orderStartedAt) orderStartedAt.value = String(Date.now());
if (reviewStartedAt) reviewStartedAt.value = String(Date.now());

function updateOrderSubmitState() {
  if (submitButton) submitButton.disabled = !agreement?.checked || !orderTurnstileToken;
}
function updateReviewSubmitState() {
  if (reviewSubmit) reviewSubmit.disabled = !reviewTurnstileToken;
}
agreement?.addEventListener("change", updateOrderSubmitState);

async function waitForTurnstile(timeoutMs = 10000) {
  const started = Date.now();
  while (!window.turnstile && Date.now() - started < timeoutMs) await new Promise(resolve => setTimeout(resolve, 80));
  return window.turnstile || null;
}
async function loadPublicConfig() {
  try {
    const response = await fetch(`${API_BASE}/api/public-config`, { cache:"no-store" });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "CONFIG_FAILED");
    turnstileConfig = result;
  } catch (error) {
    console.error("Public config:", error);
    turnstileConfig = { turnstileConfigured:false, turnstileRequired:true };
  }
}
async function renderTurnstileWidgets(force = false) {
  if (turnstileRendering) return;
  turnstileRendering = true;
  try {
    if (!turnstileConfig) await loadPublicConfig();
    const turnstile = await waitForTurnstile();
    if (!turnstileConfig?.turnstileConfigured || !turnstile || !turnstileConfig.turnstileSiteKey) {
      orderTurnstileToken = "";
      reviewTurnstileToken = "";
      if (orderSecurityStatus) orderSecurityStatus.textContent = t("securityUnavailable");
      if (reviewSecurityStatus) reviewSecurityStatus.textContent = t("securityUnavailable");
      updateOrderSubmitState(); updateReviewSubmitState();
      return;
    }
    if (force) {
      if (orderTurnstileWidget !== null) try { turnstile.remove(orderTurnstileWidget); } catch {}
      if (reviewTurnstileWidget !== null) try { turnstile.remove(reviewTurnstileWidget); } catch {}
      orderTurnstileWidget = null; reviewTurnstileWidget = null;
      document.getElementById("orderTurnstile")?.replaceChildren();
      document.getElementById("reviewTurnstile")?.replaceChildren();
    }
    orderTurnstileToken = ""; reviewTurnstileToken = "";
    const common = { sitekey:turnstileConfig.turnstileSiteKey, theme:"dark", size:"flexible", language:currentLanguage };
    if (orderTurnstileWidget === null && document.getElementById("orderTurnstile")) {
      orderTurnstileWidget = turnstile.render("#orderTurnstile", {
        ...common,
        callback(token) { orderTurnstileToken = token; if (orderSecurityStatus) orderSecurityStatus.textContent = t("securityReady"); updateOrderSubmitState(); },
        "expired-callback"() { orderTurnstileToken = ""; if (orderSecurityStatus) orderSecurityStatus.textContent = t("securityExpired"); updateOrderSubmitState(); },
        "error-callback"() { orderTurnstileToken = ""; if (orderSecurityStatus) orderSecurityStatus.textContent = t("securityRequired"); updateOrderSubmitState(); }
      });
    }
    if (reviewTurnstileWidget === null && document.getElementById("reviewTurnstile")) {
      reviewTurnstileWidget = turnstile.render("#reviewTurnstile", {
        ...common,
        callback(token) { reviewTurnstileToken = token; if (reviewSecurityStatus) reviewSecurityStatus.textContent = t("securityReady"); updateReviewSubmitState(); },
        "expired-callback"() { reviewTurnstileToken = ""; if (reviewSecurityStatus) reviewSecurityStatus.textContent = t("securityExpired"); updateReviewSubmitState(); },
        "error-callback"() { reviewTurnstileToken = ""; if (reviewSecurityStatus) reviewSecurityStatus.textContent = t("securityRequired"); updateReviewSubmitState(); }
      });
    }
    if (orderSecurityStatus) orderSecurityStatus.textContent = t("securityRequired");
    if (reviewSecurityStatus) reviewSecurityStatus.textContent = t("securityRequired");
    updateOrderSubmitState(); updateReviewSubmitState();
  } finally { turnstileRendering = false; }
}

const ticketFiles = document.getElementById("ticketFiles");
const fileList = document.getElementById("fileList");
const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_BYTES = 30 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = new Set(["png","jpg","jpeg","webp","gif","pdf","zip","rar","7z","mp4","mov","unitypackage","blend","fbx","obj"]);
let selectedFiles = [];
function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} ${currentLanguage === "en" ? "KB" : "КБ"}`;
  return `${(bytes / 1024 / 1024).toFixed(1)} ${currentLanguage === "en" ? "MB" : "МБ"}`;
}
function syncFileInput() {
  if (!ticketFiles || typeof DataTransfer === "undefined") return;
  const transfer = new DataTransfer(); selectedFiles.forEach(file => transfer.items.add(file)); ticketFiles.files = transfer.files;
}
function renderFiles() {
  if (!fileList) return;
  fileList.replaceChildren();
  if (!selectedFiles.length) { const empty=document.createElement("span"); empty.textContent=t("noFiles"); fileList.append(empty); return; }
  selectedFiles.forEach((file,index) => {
    const chip=document.createElement("div"); chip.className="file-chip";
    const text=document.createElement("span"); text.textContent=`${file.name} · ${formatBytes(file.size)}`;
    const remove=document.createElement("button"); remove.type="button"; remove.setAttribute("aria-label",t("removeFile",{name:file.name})); remove.textContent="×";
    remove.addEventListener("click",()=>{ selectedFiles.splice(index,1); syncFileInput(); renderFiles(); });
    chip.append(text,remove); fileList.append(chip);
  });
}
ticketFiles?.addEventListener("change", () => {
  const files=[...ticketFiles.files]; const total=files.reduce((sum,file)=>sum+file.size,0); const oversized=files.find(file=>file.size>MAX_FILE_BYTES);
  const blocked=files.find(file=>!ALLOWED_FILE_EXTENSIONS.has(file.name.split(".").pop()?.toLowerCase() || ""));
  if (files.length>MAX_FILES) { alert(t("selectFilesMax",{count:MAX_FILES})); ticketFiles.value=""; selectedFiles=[]; }
  else if (oversized) { alert(t("fileTooLarge",{name:oversized.name})); ticketFiles.value=""; selectedFiles=[]; }
  else if (total>MAX_TOTAL_BYTES) { alert(t("totalTooLarge")); ticketFiles.value=""; selectedFiles=[]; }
  else if (blocked) { alert(t("fileTypeBlocked",{name:blocked.name})); ticketFiles.value=""; selectedFiles=[]; }
  else selectedFiles=files;
  renderFiles();
});

function validTelegram(value) { return /^@[A-Za-z0-9_]{5,32}$/.test(String(value || "").trim()); }
const orderForm=document.getElementById("orderForm");
const formStatus=document.getElementById("formStatus");
orderForm?.addEventListener("submit", async event => {
  event.preventDefault(); formStatus.className="form-status"; formStatus.textContent="";
  if (orderForm.elements.website.value) return;
  if (!orderForm.checkValidity()) { orderForm.reportValidity(); formStatus.className="form-status error"; formStatus.textContent=t("fillRequired"); return; }
  if (!validTelegram(orderForm.elements.clientTelegram.value)) { formStatus.className="form-status error"; formStatus.textContent=t("telegramInvalid"); orderForm.elements.clientTelegram.focus(); return; }
  if (!orderTurnstileToken) { formStatus.className="form-status error"; formStatus.textContent=t("securityRequired"); return; }
  const payload=new FormData(orderForm); payload.set("agreement",String(Boolean(agreement?.checked))); payload.set("source",location.href); payload.set("turnstileToken",orderTurnstileToken); payload.set("language",currentLanguage); payload.set("displayCurrency",currentCurrency); payload.set("currencyCountry",currencyState.countryCode||""); payload.set("currencySelection",currencyState.manual?"manual":(currencyState.autoDetected?"auto":"default")); payload.set("currencyRateUpdatedAt",currencyState.updatedAt||"");
  submitButton.disabled=true; submitButton.textContent=selectedFiles.length?t("sendingFiles"):t("sending");
  try {
    const response=await fetch(TICKET_API_URL,{method:"POST",body:payload}); const result=await response.json().catch(()=>({})); if(!response.ok||!result.ok) throw new Error(result.error||t("ticketFallbackError"));
    formStatus.className="form-status success"; formStatus.textContent=t("ticketSent",{id:result.ticketId,files:result.filesSent?t("filesSent",{count:result.filesSent}):""});
    orderForm.reset(); selectedFiles=[]; renderFiles(); counter.textContent="0"; if(orderStartedAt)orderStartedAt.value=String(Date.now()); orderTurnstileToken=""; if(window.turnstile&&orderTurnstileWidget!==null)window.turnstile.reset(orderTurnstileWidget);
  } catch(error) { console.error(error); formStatus.className="form-status error"; formStatus.textContent=error.message||t("ticketFallbackError"); }
  finally { submitButton.textContent=t("submitTicket"); updateOrderSubmitState(); }
});

const visitorStorageKey="rpc_visitor_id_v1";
let visitorId=localStorage.getItem(visitorStorageKey);
if(!visitorId){visitorId=crypto.randomUUID?.()||`rpc-${Date.now()}-${Math.random().toString(16).slice(2)}`;localStorage.setItem(visitorStorageKey,visitorId);}
const totalVisitors=document.getElementById("totalVisitors"),onlineUsers=document.getElementById("onlineUsers"),totalReviews=document.getElementById("totalReviews"),footerVisitors=document.getElementById("footerVisitors"),statsStatus=document.getElementById("statsStatus");
function setStats(data){const locale=uiText[currentLanguage].onlineLocale;const visitors=Number(data.totalVisitors||0).toLocaleString(locale),online=Number(data.onlineUsers||0).toLocaleString(locale),reviews=Number(data.approvedReviews||0).toLocaleString(locale);if(totalVisitors)totalVisitors.textContent=visitors;if(onlineUsers)onlineUsers.textContent=online;if(totalReviews)totalReviews.textContent=reviews;if(footerVisitors)footerVisitors.textContent=visitors;if(statsStatus)statsStatus.textContent=t("statsSynced");}
async function readJsonResponse(response){const result=await response.json().catch(()=>({}));if(!response.ok||result.ok===false)throw new Error(result.error||"Server error");return result;}
async function loadStats(){try{const response=await fetch(`${API_BASE}/api/stats`,{cache:"no-store"});setStats(await readJsonResponse(response));}catch(error){console.warn("Stats:",error);if(statsStatus)statsStatus.textContent=t("statsUnavailable");}}
async function registerVisit(){try{const response=await fetch(`${API_BASE}/api/visit`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({visitorId})});setStats(await readJsonResponse(response));}catch(error){console.warn("Visit:",error);loadStats();}}
async function sendPresence(){if(document.visibilityState!=="visible")return;try{const response=await fetch(`${API_BASE}/api/presence`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({visitorId})});setStats(await readJsonResponse(response));}catch(error){console.warn("Presence:",error);}}
registerVisit(); setInterval(loadStats,30000); setInterval(sendPresence,55000); document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")sendPresence();});

const reviewsList=document.getElementById("reviewsList"),reviewAverage=document.getElementById("reviewAverage"),reviewForm=document.getElementById("reviewForm"),reviewStatus=document.getElementById("reviewStatus"),refreshReviews=document.getElementById("refreshReviews");
let reviewsLoaded=false; let latestReviews=[];
function makeReviewCard(review){const card=document.createElement("article");card.className="review-card";const top=document.createElement("div");top.className="review-card-top";const identity=document.createElement("div");const avatar=document.createElement("span");avatar.className="review-avatar";avatar.textContent=(review.name||"R").trim().charAt(0).toUpperCase();const person=document.createElement("div");const name=document.createElement("strong");name.textContent=review.name;const type=document.createElement("small");type.textContent=categoryLabels[currentLanguage][review.project_type]||t("categoryFallback");person.append(name,type);identity.append(avatar,person);const stars=document.createElement("span");stars.className="review-stars";stars.setAttribute("aria-label",`${review.rating} / 5`);stars.textContent="★".repeat(review.rating)+"☆".repeat(5-review.rating);const text=document.createElement("p");text.textContent=review.body;const date=document.createElement("time");const parsed=new Date(review.created_at);date.dateTime=parsed.toISOString();date.textContent=parsed.toLocaleDateString(uiText[currentLanguage].onlineLocale,{day:"2-digit",month:"long",year:"numeric"});top.append(identity,stars);card.append(top,text,date);return card;}
function renderReviewsFromCache(){if(!reviewsList)return;reviewsList.replaceChildren();if(!latestReviews.length){const empty=document.createElement("div");empty.className="review-empty";empty.textContent=t("noReviews");reviewsList.append(empty);if(reviewAverage)reviewAverage.textContent="—";}else{latestReviews.forEach(review=>reviewsList.append(makeReviewCard(review)));const average=latestReviews.reduce((sum,review)=>sum+Number(review.rating||0),0)/latestReviews.length;if(reviewAverage)reviewAverage.textContent=`${average.toFixed(1)} / 5`;}}
async function loadReviews(force=false){if(reviewsLoaded&&!force)return;if(!reviewsList)return;reviewsList.innerHTML=`<div class="review-empty">${t("reviewsLoading")}</div>`;try{const response=await fetch(`${API_BASE}/api/reviews`,{cache:"no-store"});const result=await readJsonResponse(response);latestReviews=Array.isArray(result.reviews)?result.reviews:[];renderReviewsFromCache();reviewsLoaded=true;if(totalReviews)totalReviews.textContent=Number(result.count||latestReviews.length).toLocaleString(uiText[currentLanguage].onlineLocale);}catch(error){console.error(error);reviewsList.innerHTML=`<div class="review-empty error">${t("reviewsLoadError")}</div>`;}}
refreshReviews?.addEventListener("click",()=>{reviewsLoaded=false;loadReviews(true);loadStats();});
reviewForm?.addEventListener("submit",async event=>{event.preventDefault();reviewStatus.className="form-status";reviewStatus.textContent="";if(reviewForm.elements.website.value)return;if(!reviewForm.checkValidity())return reviewForm.reportValidity();if(!reviewTurnstileToken){reviewStatus.className="form-status error";reviewStatus.textContent=t("securityRequired");return;}reviewSubmit.disabled=true;reviewSubmit.textContent=t("sending");const data=Object.fromEntries(new FormData(reviewForm).entries());data.turnstileToken=reviewTurnstileToken;data.language=currentLanguage;try{const response=await fetch(`${API_BASE}/api/reviews`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});const result=await readJsonResponse(response);reviewStatus.className="form-status success";reviewStatus.textContent=result.published?t("reviewPublished"):t("reviewModeration");reviewForm.reset();if(reviewStartedAt)reviewStartedAt.value=String(Date.now());reviewTurnstileToken="";if(window.turnstile&&reviewTurnstileWidget!==null)window.turnstile.reset(reviewTurnstileWidget);reviewsLoaded=false;if(result.published)await loadReviews(true);loadStats();}catch(error){console.error(error);reviewStatus.className="form-status error";reviewStatus.textContent=error.message||t("reviewSendError");}finally{reviewSubmit.textContent=t("submitReview");updateReviewSubmitState();}});
loadReviews();

const galleryModal=document.getElementById("galleryModal"),galleryImage=document.getElementById("galleryImage"),galleryTitle=document.getElementById("galleryTitle"),galleryCounter=document.getElementById("galleryCounter"),galleryPrev=document.querySelector(".gallery-prev"),galleryNext=document.querySelector(".gallery-next");let galleryItems=[],galleryIndex=0,touchStartX=0,lastWheelAt=0;
function updateGallery(){if(!galleryItems.length||!galleryImage)return;galleryIndex=(galleryIndex+galleryItems.length)%galleryItems.length;galleryImage.classList.add("changing");setTimeout(()=>{galleryImage.src=galleryItems[galleryIndex];galleryImage.alt=t("workImageAlt",{title:galleryTitle?.textContent||t("galleryWork"),index:galleryIndex+1});galleryCounter.textContent=`${galleryIndex+1} / ${galleryItems.length}`;galleryPrev.hidden=galleryItems.length<2;galleryNext.hidden=galleryItems.length<2;galleryImage.classList.remove("changing");},80);}
function openGallery(card){const images=(card.dataset.images||"").split("|").map(value=>value.trim()).filter(Boolean);if(!images.length)return;galleryItems=images;galleryIndex=0;galleryTitle.textContent=card.dataset.workTitle||card.querySelector("h2")?.textContent||t("galleryWork");galleryModal.classList.add("open");galleryModal.setAttribute("aria-hidden","false");document.body.classList.add("gallery-open");updateGallery();document.querySelector(".gallery-close")?.focus();}
function closeGallery(){galleryModal?.classList.remove("open");galleryModal?.setAttribute("aria-hidden","true");document.body.classList.remove("gallery-open");if(galleryImage)galleryImage.src="";}
function moveGallery(step){if(galleryItems.length<2)return;galleryIndex+=step;updateGallery();}
document.querySelectorAll(".gallery-work").forEach(card=>card.querySelector(".work-image-button")?.addEventListener("click",()=>openGallery(card)));document.querySelectorAll("[data-gallery-close]").forEach(button=>button.addEventListener("click",closeGallery));galleryPrev?.addEventListener("click",()=>moveGallery(-1));galleryNext?.addEventListener("click",()=>moveGallery(1));document.addEventListener("keydown",event=>{if(!galleryModal?.classList.contains("open"))return;if(event.key==="Escape")closeGallery();if(event.key==="ArrowLeft")moveGallery(-1);if(event.key==="ArrowRight")moveGallery(1);});galleryModal?.addEventListener("touchstart",event=>{touchStartX=event.changedTouches[0]?.clientX||0;},{passive:true});galleryModal?.addEventListener("touchend",event=>{const endX=event.changedTouches[0]?.clientX||0,delta=endX-touchStartX;if(Math.abs(delta)>45)moveGallery(delta>0?-1:1);},{passive:true});galleryModal?.addEventListener("wheel",event=>{if(galleryItems.length<2||Math.abs(event.deltaY)<8)return;const now=Date.now();if(now-lastWheelAt<450)return;lastWheelAt=now;moveGallery(event.deltaY>0?1:-1);},{passive:true});

function updateDynamicLanguage(){
  renderFiles();
  renderCurrencyUI();
  if (statsStatus && !statsStatus.textContent.includes("—")) loadStats();
  if (reviewsLoaded) renderReviewsFromCache();
  if (orderSecurityStatus) orderSecurityStatus.textContent = orderTurnstileToken ? t("securityReady") : (turnstileConfig?.turnstileConfigured ? t("securityRequired") : t("orderSecurityLoading"));
  if (reviewSecurityStatus) reviewSecurityStatus.textContent = reviewTurnstileToken ? t("securityReady") : (turnstileConfig?.turnstileConfigured ? t("securityRequired") : t("reviewSecurityLoading"));
  if (submitButton && !submitButton.disabled) submitButton.textContent=t("submitTicket");
  if (reviewSubmit && !reviewSubmit.disabled) reviewSubmit.textContent=t("submitReview");
}

document.getElementById("year").textContent=String(new Date().getFullYear());
const initialLanguage=getQueryLanguage()||localStorage.getItem(LANGUAGE_KEY)||((navigator.language||"").toLowerCase().startsWith("en")?"en":"ru");
applyLanguage(initialLanguage,false);
loadCurrencyConfiguration();
renderTurnstileWidgets();
