"use strict";

// Для внешнего API Telegram-бота укажите URL здесь. Пустое значение использует прямое открытие Telegram.
const TICKET_API_URL = "";
const TELEGRAM_USERNAME = "ViNter294";
const RULES_REPOSITORY = "rpc-rules";

const pages = [...document.querySelectorAll("[data-page]")];
const navLinks = [...document.querySelectorAll("[data-route]")];
const sidebar = document.querySelector(".sidebar");
const menuButton = document.getElementById("menuButton");

function siblingSite(repo, localPort) {
  const host = location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return `${location.protocol}//${host}:${localPort}/`;
  if (host.endsWith("github.io")) return `${location.origin}/${repo}/`;
  return `${location.origin.replace(/\/$/, "")}/${repo}/`;
}

const rulesUrl = siblingSite(RULES_REPOSITORY, 3001);
document.querySelectorAll('[id^="rulesLink"], #rulesInline').forEach(link => link.href = rulesUrl);

function showPage(route) {
  const safe = pages.some(p => p.dataset.page === route) ? route : "home";
  pages.forEach(page => page.classList.toggle("active-page", page.dataset.page === safe));
  navLinks.forEach(link => link.classList.toggle("active", link.dataset.route === safe));
  if (sidebar) sidebar.classList.remove("open");
  if (menuButton) menuButton.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function routeFromHash() {
  const hash = location.hash.replace("#", "").split("?")[0] || "home";
  showPage(hash);
}
window.addEventListener("hashchange", routeFromHash);
routeFromHash();

menuButton?.addEventListener("click", () => {
  const open = sidebar.classList.toggle("open");
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
  setTimeout(() => {
    if (categorySelect && category) categorySelect.value = category;
  }, 0);
}
document.querySelectorAll("[data-category]").forEach(button => {
  button.addEventListener("click", () => openOrder(button.dataset.category));
});

// Запрещаем обычное контекстное меню только на изображениях.
document.addEventListener("contextmenu", event => {
  if (event.target.closest(".protected-image")) event.preventDefault();
});

document.querySelectorAll(".protected-image").forEach(image => {
  image.addEventListener("dragstart", event => event.preventDefault());
});

const description = document.getElementById("description");
const counter = document.getElementById("counter");
description?.addEventListener("input", () => counter.textContent = String(description.value.length));

const agreement = document.getElementById("agreement");
const submitButton = document.getElementById("submitButton");
agreement?.addEventListener("change", () => submitButton.disabled = !agreement.checked);

const form = document.getElementById("orderForm");
const status = document.getElementById("formStatus");

function ticketText(data) {
  const labels = {avatar:"VRChat-аватар",world:"VRChat-мир",quest:"Quest-версия",optimization:"Оптимизация",functions:"Функции / системы",other:"Другое"};
  const ticket = `RPC-${new Date().toISOString().slice(2,10).replaceAll("-","")}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;
  return [
    "🔥 Новый заказ RPC",
    "",
    `Номер тикета: ${ticket}`,
    `Категория: ${labels[data.category] || data.category}`,
    `Имя: ${data.clientName}`,
    `Telegram: ${data.clientTelegram}`,
    `Бюджет: ${data.budget || "не указан"}`,
    "",
    "Описание:",
    data.description,
    "",
    "С правилами согласен(-на): Да"
  ].join("\n");
}

form?.addEventListener("submit", async event => {
  event.preventDefault();
  status.className = "form-status";
  status.textContent = "";

  if (form.elements.website.value) return;
  if (!form.checkValidity()) {
    form.reportValidity();
    status.className = "form-status error";
    status.textContent = "Заполните обязательные поля.";
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  const text = ticketText(data);
  submitButton.disabled = true;
  submitButton.textContent = "Подготовка...";

  try {
    if (TICKET_API_URL) {
      const response = await fetch(TICKET_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, agreement: true, source: location.href })
      });
      if (!response.ok) throw new Error("API request failed");
      status.className = "form-status success";
      status.textContent = "Тикет отправлен команде RPC.";
      form.reset();
      counter.textContent = "0";
    } else {
      await navigator.clipboard?.writeText(text).catch(() => {});
      const telegramUrl = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(text)}`;
      window.open(telegramUrl, "_blank", "noopener,noreferrer");
      status.className = "form-status success";
      status.textContent = "Telegram открыт. Текст заявки также скопирован в буфер обмена.";
    }
  } catch (error) {
    console.error(error);
    status.className = "form-status error";
    status.textContent = "Не удалось отправить. Напишите напрямую @ViNter294.";
  } finally {
    submitButton.textContent = "Отправить тикет →";
    submitButton.disabled = !agreement.checked;
  }
});

document.getElementById("year").textContent = String(new Date().getFullYear());
