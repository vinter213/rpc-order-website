"use strict";

// Защищённый сервер, который отправляет заявки в Telegram-бота.
const TICKET_API_URL = "https://rpc-order-bot-vinter294.onrender.com/api/tickets";
const RULES_URL = "https://rpc-rules.onrender.com/";

const pages = [...document.querySelectorAll("[data-page]")];
const navLinks = [...document.querySelectorAll("[data-route]")];
const sidebar = document.querySelector(".sidebar");
const menuButton = document.getElementById("menuButton");

document.querySelectorAll('[id^="rulesLink"], #rulesInline').forEach(link => {
  link.href = RULES_URL;
});

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

// Отключаем стандартное меню только на изображениях.
document.addEventListener("contextmenu", event => {
  if (event.target.closest(".protected-image")) event.preventDefault();
});
document.querySelectorAll(".protected-image").forEach(image => {
  image.addEventListener("dragstart", event => event.preventDefault());
});

const description = document.getElementById("description");
const counter = document.getElementById("counter");
description?.addEventListener("input", () => {
  counter.textContent = String(description.value.length);
});

const agreement = document.getElementById("agreement");
const submitButton = document.getElementById("submitButton");
agreement?.addEventListener("change", () => {
  submitButton.disabled = !agreement.checked;
});

const form = document.getElementById("orderForm");
const status = document.getElementById("formStatus");

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
  submitButton.disabled = true;
  submitButton.textContent = "Отправка...";

  try {
    const response = await fetch(TICKET_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        agreement: agreement.checked,
        source: location.href
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      throw new Error(result.error || "Не удалось отправить заявку");
    }

    status.className = "form-status success";
    status.textContent = `Тикет ${result.ticketId} отправлен. Мы свяжемся с вами в Telegram.`;
    form.reset();
    counter.textContent = "0";
  } catch (error) {
    console.error(error);
    status.className = "form-status error";
    status.textContent = "Не удалось отправить тикет. Напишите напрямую @ViNter294.";
  } finally {
    submitButton.textContent = "Отправить тикет →";
    submitButton.disabled = !agreement.checked;
  }
});

document.getElementById("year").textContent = String(new Date().getFullYear());
