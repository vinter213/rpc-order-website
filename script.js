const form = document.getElementById("orderForm");
const statusBox = document.getElementById("statusBox");
const year = document.getElementById("year");
const themeToggle = document.getElementById("themeToggle");
const statusForm = document.getElementById("statusForm");
const statusResult = document.getElementById("statusResult");
const orderIdInput = document.getElementById("orderIdInput");
const chatToggle = document.getElementById("chatToggle");
const chatPanel = document.getElementById("chatPanel");
const discordBtn = document.getElementById("discordBtn");
const telegramBtn = document.getElementById("telegramBtn");
const discordModalBtn = document.getElementById("discordModalBtn");
const telegramModalBtn = document.getElementById("telegramModalBtn");
const successModal = document.getElementById("successModal");
const closeModal = document.getElementById("closeModal");
const successText = document.getElementById("successText");
const autoMessage = document.getElementById("autoMessage");
const copyMessage = document.getElementById("copyMessage");
const avatarShell = document.getElementById("avatarShell");

year.textContent = new Date().getFullYear();

const savedTheme = localStorage.getItem("rpc-theme") || "dark";
document.documentElement.dataset.theme = savedTheme;
themeToggle.textContent = savedTheme === "dark" ? "☾" : "☀";

const discordUrl = window.RPC_DISCORD_URL || "#";
const telegramUrl = window.RPC_TELEGRAM_URL || "#";
discordBtn.href = discordUrl;
telegramBtn.href = telegramUrl;
discordModalBtn.href = discordUrl;
telegramModalBtn.href = telegramUrl;

function setStatus(text, ok = false) {
  statusBox.textContent = text;
  statusBox.className = "status-box " + (ok ? "ok" : "err");
}

function getApiUrl() {
  const apiUrl = (window.RPC_API_URL || "").replace(/\/$/, "");
  if (!apiUrl) throw new Error("Не указан RPC_API_URL в config.js");
  return apiUrl;
}

function normalizeOrderId(value) {
  const match = String(value || "").match(/\d+/);
  return match ? match[0] : "";
}

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("rpc-theme", next);
  themeToggle.textContent = next === "dark" ? "☾" : "☀";
});

chatToggle.addEventListener("click", () => {
  chatPanel.classList.toggle("hidden");
});

closeModal.addEventListener("click", () => {
  successModal.classList.add("hidden");
});

copyMessage.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(autoMessage.value);
    copyMessage.textContent = "Скопировано ✓";
    setTimeout(() => copyMessage.textContent = "Скопировать сообщение", 1400);
  } catch {
    autoMessage.select();
    document.execCommand("copy");
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());
  const budget = Number(data.budget || 0);

  const payload = {
    client_name: data.client_name,
    contact: data.contact,
    service: data.service,
    price: budget,
    prepaid: 0,
    status: "new",
    worker_id: null,
    deadline: data.deadline || "",
    notes:
      "ЗАЯВКА С САЙТА RPC\n\n" +
      "Контакт: " + data.contact + "\n" +
      "Бюджет: " + (data.budget || "не указан") + "\n" +
      "Срок: " + (data.deadline || "не указан") + "\n" +
      "Источник клиента: " + (data.source || "не указан") + "\n\n" +
      data.notes
  };

  try {
    setStatus("Отправляю заявку в RPC CRM...", true);

    const res = await fetch(getApiUrl() + "/public/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    let result = {};
    try { result = await res.json(); } catch (_) {}

    if (!res.ok) {
      throw new Error(result.detail || "Сервер не принял заявку");
    }

    const rpcId = "RPC-" + String(result.id).padStart(5, "0");
    const message =
      "Привет! Я оставил заявку на сайте RPC.\n" +
      "Номер заявки: #" + rpcId + "\n" +
      "Услуга: " + data.service + "\n" +
      "Контакт: " + data.contact + "\n" +
      "Бюджет: " + (data.budget || "не указан") + "\n" +
      "Срок: " + (data.deadline || "не указан");

    form.reset();
    setStatus("Заявка отправлена. Номер заявки: #" + rpcId, true);

    successText.textContent = "Номер заявки: #" + rpcId;
    autoMessage.value = message;
    successModal.classList.remove("hidden");
  } catch (err) {
    setStatus("Не получилось отправить: " + err.message, false);
  }
});

statusForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = normalizeOrderId(orderIdInput.value);

  if (!id) {
    statusResult.innerHTML = "Введите номер заявки, например <b>RPC-00024</b>.";
    return;
  }

  try {
    statusResult.textContent = "Проверяю заявку...";
    const res = await fetch(getApiUrl() + "/public/orders/" + id);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || "Заявка не найдена");
    }

    statusResult.innerHTML =
      "<b>Заявка #" + "RPC-" + String(data.id).padStart(5, "0") + "</b><br>" +
      "Клиент: " + escapeHtml(data.client_name || "—") + "<br>" +
      "Услуга: " + escapeHtml(data.service || "—") + "<br>" +
      "Статус: <b>" + escapeHtml(data.status || "new") + "</b><br>" +
      "Дедлайн: " + escapeHtml(data.deadline || "не указан") + "<br>" +
      "Создана: " + escapeHtml(data.created_at || "—");
  } catch (err) {
    statusResult.textContent = "Не получилось проверить: " + err.message;
  }
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (s) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[s]));
}

// Scroll reveal animation
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Hero avatar reacts to mouse
document.addEventListener("mousemove", (e) => {
  if (!avatarShell) return;
  const x = (e.clientX / window.innerWidth - 0.5) * 10;
  const y = (e.clientY / window.innerHeight - 0.5) * 10;
  avatarShell.style.transform = `translateY(-8px) rotateX(${-y}deg) rotateY(${x}deg)`;
});
