const API_URL = "https://rpc-team-crm.onrender.com";

const cursorGlow = document.getElementById("cursorGlow");
window.addEventListener("mousemove", (e) => {
  if (!cursorGlow) return;
  cursorGlow.style.left = `${e.clientX}px`;
  cursorGlow.style.top = `${e.clientY}px`;
});

const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
if (menuBtn && nav) {
  menuBtn.addEventListener("click", () => nav.classList.toggle("open"));
}

const reveals = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("show");
  });
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const raw = await res.text();
  let body = raw;
  try { body = JSON.parse(raw); } catch {}

  if (!res.ok) {
    throw new Error(typeof body === "string" ? body : JSON.stringify(body));
  }

  return body;
}

const orderForm = document.getElementById("orderForm");

if (orderForm) {
  orderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      client_name: document.getElementById("clientName")?.value?.trim() || "",
      contact: document.getElementById("clientContact")?.value?.trim() || "",
      service: document.getElementById("service")?.value || "",
      price: document.getElementById("price")?.value?.trim() || "",
      deadline: document.getElementById("deadline")?.value?.trim() || "",
      source: document.getElementById("source")?.value || "Сайт",
      description: document.getElementById("description")?.value?.trim() || "",
      status: "new",
      created_from: "rpc-order-site"
    };

    if (!payload.client_name || !payload.contact) {
      setMessage("err", "Заполни имя и контакт.");
      return;
    }

    setMessage("", "Отправляю заявку...");

    const endpoints = [
      "/orders",
      "/api/orders",
      "/create-order",
      "/order"
    ];

    let lastError = null;

    for (const endpoint of endpoints) {
      try {
        await postJson(API_URL.replace(/\/$/, "") + endpoint, payload);
        setMessage("ok", "Заявка отправлена. Скоро свяжемся с тобой.");
        orderForm.reset();
        return;
      } catch (err) {
        lastError = err;
      }
    }

    setMessage(
      "err",
      "Не удалось отправить заявку. Проверь API сервера. " + (lastError?.message || "")
    );
  });
}
