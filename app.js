"use strict";

const API_BASE = "https://rpc-telegrambot.onrender.com";
const TICKET_API_URL = `${API_BASE}/api/tickets`;
const RULES_URL = "https://rpc-rules.onrender.com/";

const pages = [...document.querySelectorAll("[data-page]")];
const navLinks = [...document.querySelectorAll("[data-route]")];
const sidebar = document.querySelector(".sidebar");
const menuButton = document.getElementById("menuButton");

const categoryLabels = {
  avatar: "VRChat-аватар",
  world: "VRChat-мир",
  quest: "Quest-версия",
  optimization: "Оптимизация",
  functions: "Функции / системы",
  other: "Другое"
};

document.querySelectorAll('[id^="rulesLink"], #rulesInline').forEach(link => {
  link.href = RULES_URL;
});

function showPage(route) {
  const safe = pages.some(page => page.dataset.page === route) ? route : "home";
  pages.forEach(page => page.classList.toggle("active-page", page.dataset.page === safe));
  navLinks.forEach(link => link.classList.toggle("active", link.dataset.route === safe));
  sidebar?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "smooth" });
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
  if (
    innerWidth <= 760 &&
    sidebar?.classList.contains("open") &&
    !sidebar.contains(event.target) &&
    !menuButton?.contains(event.target)
  ) {
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

// Мягкий свет следует за курсором без тяжёлой графики.
window.addEventListener("pointermove", event => {
  document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
  document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);
}, { passive: true });

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

// Файлы тикета.
const ticketFiles = document.getElementById("ticketFiles");
const fileList = document.getElementById("fileList");
const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_BYTES = 30 * 1024 * 1024;
let selectedFiles = [];

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`;
  return `${(bytes / 1024 / 1024).toFixed(1)} МБ`;
}

function syncFileInput() {
  if (!ticketFiles || typeof DataTransfer === "undefined") return;
  const transfer = new DataTransfer();
  selectedFiles.forEach(file => transfer.items.add(file));
  ticketFiles.files = transfer.files;
}

function renderFiles() {
  if (!fileList) return;
  fileList.replaceChildren();
  if (!selectedFiles.length) {
    const empty = document.createElement("span");
    empty.textContent = "Файлы не выбраны";
    fileList.append(empty);
    return;
  }

  selectedFiles.forEach((file, index) => {
    const chip = document.createElement("div");
    chip.className = "file-chip";

    const text = document.createElement("span");
    text.textContent = `${file.name} · ${formatBytes(file.size)}`;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.setAttribute("aria-label", `Удалить ${file.name}`);
    remove.textContent = "×";
    remove.addEventListener("click", () => {
      selectedFiles.splice(index, 1);
      syncFileInput();
      renderFiles();
    });

    chip.append(text, remove);
    fileList.append(chip);
  });
}

ticketFiles?.addEventListener("change", () => {
  const files = [...ticketFiles.files];
  const total = files.reduce((sum, file) => sum + file.size, 0);
  const oversized = files.find(file => file.size > MAX_FILE_BYTES);

  if (files.length > MAX_FILES) {
    alert(`Можно прикрепить не более ${MAX_FILES} файлов.`);
    ticketFiles.value = "";
    selectedFiles = [];
  } else if (oversized) {
    alert(`Файл «${oversized.name}» больше 10 МБ.`);
    ticketFiles.value = "";
    selectedFiles = [];
  } else if (total > MAX_TOTAL_BYTES) {
    alert("Суммарный размер файлов превышает 30 МБ.");
    ticketFiles.value = "";
    selectedFiles = [];
  } else {
    selectedFiles = files;
  }
  renderFiles();
});

const orderForm = document.getElementById("orderForm");
const formStatus = document.getElementById("formStatus");

orderForm?.addEventListener("submit", async event => {
  event.preventDefault();
  formStatus.className = "form-status";
  formStatus.textContent = "";

  if (orderForm.elements.website.value) return;
  if (!orderForm.checkValidity()) {
    orderForm.reportValidity();
    formStatus.className = "form-status error";
    formStatus.textContent = "Заполните обязательные поля.";
    return;
  }

  const payload = new FormData(orderForm);
  payload.set("agreement", String(Boolean(agreement?.checked)));
  payload.set("source", location.href);

  submitButton.disabled = true;
  submitButton.textContent = selectedFiles.length ? "Отправка заявки и файлов…" : "Отправка…";

  try {
    const response = await fetch(TICKET_API_URL, {
      method: "POST",
      body: payload
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) throw new Error(result.error || "Не удалось отправить заявку");

    formStatus.className = "form-status success";
    const fileNote = result.filesSent ? ` Файлов отправлено: ${result.filesSent}.` : "";
    formStatus.textContent = `Тикет ${result.ticketId} отправлен.${fileNote} Мы свяжемся с вами в Telegram.`;
    orderForm.reset();
    selectedFiles = [];
    renderFiles();
    counter.textContent = "0";
  } catch (error) {
    console.error(error);
    formStatus.className = "form-status error";
    formStatus.textContent = error.message || "Не удалось отправить тикет. Напишите напрямую @ViNter294.";
  } finally {
    submitButton.textContent = "Отправить тикет →";
    submitButton.disabled = !agreement?.checked;
  }
});

// Общая статистика и присутствие.
const visitorStorageKey = "rpc_visitor_id_v1";
let visitorId = localStorage.getItem(visitorStorageKey);
if (!visitorId) {
  visitorId = crypto.randomUUID?.() || `rpc-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(visitorStorageKey, visitorId);
}

const totalVisitors = document.getElementById("totalVisitors");
const onlineUsers = document.getElementById("onlineUsers");
const totalReviews = document.getElementById("totalReviews");
const footerVisitors = document.getElementById("footerVisitors");
const statsStatus = document.getElementById("statsStatus");

function setStats(data) {
  const visitors = Number(data.totalVisitors || 0).toLocaleString("ru-RU");
  const online = Number(data.onlineUsers || 0).toLocaleString("ru-RU");
  const reviews = Number(data.approvedReviews || 0).toLocaleString("ru-RU");
  if (totalVisitors) totalVisitors.textContent = visitors;
  if (onlineUsers) onlineUsers.textContent = online;
  if (totalReviews) totalReviews.textContent = reviews;
  if (footerVisitors) footerVisitors.textContent = visitors;
  if (statsStatus) statsStatus.textContent = "Данные синхронизированы для всех посетителей";
}

async function readJsonResponse(response) {
  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok === false) throw new Error(result.error || "Ошибка сервера");
  return result;
}

async function loadStats() {
  try {
    const response = await fetch(`${API_BASE}/api/stats`, { cache: "no-store" });
    setStats(await readJsonResponse(response));
  } catch (error) {
    console.warn("Stats:", error);
    if (statsStatus) statsStatus.textContent = "Статистика временно недоступна";
  }
}

async function registerVisit() {
  try {
    const response = await fetch(`${API_BASE}/api/visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId })
    });
    setStats(await readJsonResponse(response));
  } catch (error) {
    console.warn("Visit:", error);
    loadStats();
  }
}

async function sendPresence() {
  if (document.visibilityState !== "visible") return;
  try {
    const response = await fetch(`${API_BASE}/api/presence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId })
    });
    setStats(await readJsonResponse(response));
  } catch (error) {
    console.warn("Presence:", error);
  }
}

registerVisit();
setInterval(loadStats, 30_000);
setInterval(sendPresence, 55_000);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") sendPresence();
});

// Отзывы.
const reviewsList = document.getElementById("reviewsList");
const reviewAverage = document.getElementById("reviewAverage");
const reviewForm = document.getElementById("reviewForm");
const reviewStatus = document.getElementById("reviewStatus");
const reviewSubmit = document.getElementById("reviewSubmit");
const refreshReviews = document.getElementById("refreshReviews");
let reviewsLoaded = false;

function makeReviewCard(review) {
  const card = document.createElement("article");
  card.className = "review-card";

  const top = document.createElement("div");
  top.className = "review-card-top";

  const identity = document.createElement("div");
  const avatar = document.createElement("span");
  avatar.className = "review-avatar";
  avatar.textContent = (review.name || "R").trim().charAt(0).toUpperCase();
  const person = document.createElement("div");
  const name = document.createElement("strong");
  name.textContent = review.name;
  const type = document.createElement("small");
  type.textContent = categoryLabels[review.project_type] || "Заказ RPC";
  person.append(name, type);
  identity.append(avatar, person);

  const stars = document.createElement("span");
  stars.className = "review-stars";
  stars.setAttribute("aria-label", `${review.rating} из 5`);
  stars.textContent = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

  const text = document.createElement("p");
  text.textContent = review.body;

  const date = document.createElement("time");
  const parsed = new Date(review.created_at);
  date.dateTime = parsed.toISOString();
  date.textContent = parsed.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });

  top.append(identity, stars);
  card.append(top, text, date);
  return card;
}

async function loadReviews(force = false) {
  if (reviewsLoaded && !force) return;
  if (!reviewsList) return;
  reviewsList.innerHTML = '<div class="review-empty">Загрузка отзывов…</div>';

  try {
    const response = await fetch(`${API_BASE}/api/reviews`, { cache: "no-store" });
    const result = await readJsonResponse(response);
    const reviews = Array.isArray(result.reviews) ? result.reviews : [];
    reviewsList.replaceChildren();

    if (!reviews.length) {
      const empty = document.createElement("div");
      empty.className = "review-empty";
      empty.textContent = "Пока нет опубликованных отзывов. Можно оставить первый.";
      reviewsList.append(empty);
      if (reviewAverage) reviewAverage.textContent = "—";
    } else {
      reviews.forEach(review => reviewsList.append(makeReviewCard(review)));
      const average = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
      if (reviewAverage) reviewAverage.textContent = `${average.toFixed(1)} / 5`;
    }

    reviewsLoaded = true;
    if (totalReviews) totalReviews.textContent = Number(result.count || reviews.length).toLocaleString("ru-RU");
  } catch (error) {
    console.error(error);
    reviewsList.innerHTML = '<div class="review-empty error">Не удалось загрузить отзывы. Попробуйте позже.</div>';
  }
}

refreshReviews?.addEventListener("click", () => {
  reviewsLoaded = false;
  loadReviews(true);
  loadStats();
});

reviewForm?.addEventListener("submit", async event => {
  event.preventDefault();
  reviewStatus.className = "form-status";
  reviewStatus.textContent = "";
  if (reviewForm.elements.website.value) return;
  if (!reviewForm.checkValidity()) return reviewForm.reportValidity();

  reviewSubmit.disabled = true;
  reviewSubmit.textContent = "Отправка…";
  const data = Object.fromEntries(new FormData(reviewForm).entries());

  try {
    const response = await fetch(`${API_BASE}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const result = await readJsonResponse(response);
    reviewStatus.className = "form-status success";
    reviewStatus.textContent = result.published
      ? "Отзыв опубликован. Спасибо."
      : "Отзыв отправлен на проверку. Спасибо.";
    reviewForm.reset();
    reviewsLoaded = false;
    if (result.published) await loadReviews(true);
    loadStats();
  } catch (error) {
    console.error(error);
    reviewStatus.className = "form-status error";
    reviewStatus.textContent = error.message || "Не удалось отправить отзыв.";
  } finally {
    reviewSubmit.disabled = false;
    reviewSubmit.textContent = "Отправить отзыв →";
  }
});

loadReviews();

// Галерея портфолио: полноэкранный просмотр, листание и свайпы.
const galleryModal = document.getElementById("galleryModal");
const galleryImage = document.getElementById("galleryImage");
const galleryTitle = document.getElementById("galleryTitle");
const galleryCounter = document.getElementById("galleryCounter");
const galleryPrev = document.querySelector(".gallery-prev");
const galleryNext = document.querySelector(".gallery-next");
let galleryItems = [];
let galleryIndex = 0;
let touchStartX = 0;
let lastWheelAt = 0;

function updateGallery() {
  if (!galleryItems.length || !galleryImage) return;
  galleryIndex = (galleryIndex + galleryItems.length) % galleryItems.length;
  galleryImage.classList.add("changing");
  window.setTimeout(() => {
    galleryImage.src = galleryItems[galleryIndex];
    galleryImage.alt = `${galleryTitle?.textContent || "Работа RPC"}, изображение ${galleryIndex + 1}`;
    galleryCounter.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
    galleryPrev.hidden = galleryItems.length < 2;
    galleryNext.hidden = galleryItems.length < 2;
    galleryImage.classList.remove("changing");
  }, 80);
}

function openGallery(card) {
  const images = (card.dataset.images || "").split("|").map(value => value.trim()).filter(Boolean);
  if (!images.length) return;
  galleryItems = images;
  galleryIndex = 0;
  galleryTitle.textContent = card.dataset.workTitle || card.querySelector("h2")?.textContent || "Работа RPC";
  galleryModal.classList.add("open");
  galleryModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("gallery-open");
  updateGallery();
  document.querySelector(".gallery-close")?.focus();
}

function closeGallery() {
  galleryModal?.classList.remove("open");
  galleryModal?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("gallery-open");
  if (galleryImage) galleryImage.src = "";
}

function moveGallery(step) {
  if (galleryItems.length < 2) return;
  galleryIndex += step;
  updateGallery();
}

document.querySelectorAll(".gallery-work").forEach(card => {
  card.querySelector(".work-image-button")?.addEventListener("click", () => openGallery(card));
});

document.querySelectorAll("[data-gallery-close]").forEach(button => button.addEventListener("click", closeGallery));
galleryPrev?.addEventListener("click", () => moveGallery(-1));
galleryNext?.addEventListener("click", () => moveGallery(1));

document.addEventListener("keydown", event => {
  if (!galleryModal?.classList.contains("open")) return;
  if (event.key === "Escape") closeGallery();
  if (event.key === "ArrowLeft") moveGallery(-1);
  if (event.key === "ArrowRight") moveGallery(1);
});

galleryModal?.addEventListener("touchstart", event => {
  touchStartX = event.changedTouches[0]?.clientX || 0;
}, { passive: true });

galleryModal?.addEventListener("touchend", event => {
  const endX = event.changedTouches[0]?.clientX || 0;
  const delta = endX - touchStartX;
  if (Math.abs(delta) > 45) moveGallery(delta > 0 ? -1 : 1);
}, { passive: true });

galleryModal?.addEventListener("wheel", event => {
  if (galleryItems.length < 2 || Math.abs(event.deltaY) < 8) return;
  const now = Date.now();
  if (now - lastWheelAt < 450) return;
  lastWheelAt = now;
  moveGallery(event.deltaY > 0 ? 1 : -1);
}, { passive: true });

document.getElementById("year").textContent = String(new Date().getFullYear());
