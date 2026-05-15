const API_URL = "https://rpc-team-crm.onrender.com";

const cursorGlow = document.getElementById("cursorGlow");
window.addEventListener("mousemove", (e) => {
  if (!cursorGlow) return;
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top = `${e.clientY}px`;
});

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
if (menuBtn && nav) menuBtn.addEventListener("click", () => nav.classList.toggle("open"));

const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add("show"); });
}, { threshold: 0.12 });
reveals.forEach((el) => observer.observe(el));

function setMessage(type, text) {
  const box = document.getElementById("formMessage");
  if (!box) return;
  box.className = "form-message " + (type || "");
  box.textContent = text;
}

async function postJson(url, data) {
  const res = await fetch(url, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const raw = await res.text();
  let body = raw;
  try { body = JSON.parse(raw); } catch {}

  if (!res.ok) {
    const msg = typeof body === "string" ? body : JSON.stringify(body);
    throw new Error(`${res.status} ${res.statusText}: ${msg}`);
  }
  return body;
}

async function sendOrder(payload) {
  const endpoints = ["/public/order", "/public/orders", "/orders/public", "/api/public/orders"];
  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      return await postJson(API_URL.replace(/\/$/, "") + endpoint, payload);
    } catch (err) {
      lastError = err;
      console.warn("[RPC] endpoint failed:", endpoint, err);
    }
  }
  throw lastError || new Error("No endpoint worked");
}

const orderForm = document.getElementById("orderForm");
const submitBtn = document.getElementById("submitBtn");

if (orderForm) {
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      client_name: document.getElementById("clientName")?.value?.trim() || "",
      name: document.getElementById("clientName")?.value?.trim() || "",
      contact: document.getElementById("clientContact")?.value?.trim() || "",
      service: document.getElementById("service")?.value || "",
      price: document.getElementById("price")?.value?.trim() || "",
      budget: document.getElementById("price")?.value?.trim() || "",
      deadline: document.getElementById("deadline")?.value?.trim() || "",
      source: document.getElementById("source")?.value || "Сайт",
      description: document.getElementById("description")?.value?.trim() || "",
      notes: document.getElementById("description")?.value?.trim() || "",
      status: "new",
      created_from: "rpc-order-website"
    };

    if (!payload.client_name || !payload.contact || !payload.service) {
      setMessage("err", "Заполни имя, контакт и услугу.");
      return;
    }

    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Отправляю...";
      }
      setMessage("", "Отправляю заявку в RPC Team CRM...");
      await sendOrder(payload);
      setMessage("ok", "Заявка отправлена. Проверь CRM и Telegram.");
      orderForm.reset();
    } catch (err) {
      console.error("[RPC] order submit error:", err);
      setMessage("err", "Заявка не отправилась. Нужно установить BACKEND_PUBLIC_ORDER_PATCH.py в rpc-team-crm. Ошибка: " + (err?.message || err));
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Отправить заявку ↗";
      }
    }
  });
}
