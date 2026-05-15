const SERVER_URL = "https://rpc-team-crm.onrender.com";

const cursorGlow = document.getElementById("cursorGlow");
window.addEventListener("mousemove", (e) => {
  cursorGlow.style.left = e.clientX + "px";
  cursorGlow.style.top = e.clientY + "px";
});

const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

revealItems.forEach((el) => revealObserver.observe(el));

document.querySelectorAll(".service-card, .panel").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

const form = document.getElementById("orderForm");
const statusBox = document.getElementById("formStatus");

function setStatus(text, type) {
  statusBox.textContent = text;
  statusBox.className = "status " + (type || "");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = form.querySelector("button[type='submit']");
  const oldText = btn.innerHTML;

  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());

  // ВАЖНО: серверный фикс понимает и budget, и price.
  // Поэтому отправляем оба поля, чтобы Telegram точно показал бюджет клиента.
  data.price = data.budget || "";
  data.client_budget = data.budget || "";
  data.source = data.source || "Сайт";
  data.status = "new";

  try {
    btn.disabled = true;
    btn.innerHTML = "<span>Отправляю...</span>";
    setStatus("Отправляю заявку в RPC CRM...", "");

    const res = await fetch(`${SERVER_URL}/public/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const text = await res.text();
    let json = {};
    try { json = JSON.parse(text); } catch {}

    if (!res.ok || json.ok === false) {
      throw new Error(json.detail || json.message || text || `Ошибка ${res.status}`);
    }

    setStatus("Заявка отправлена. Я скоро свяжусь с тобой.", "ok");
    form.reset();

    btn.animate([
      { transform: "scale(1)" },
      { transform: "scale(1.04)" },
      { transform: "scale(1)" }
    ], { duration: 420, easing: "ease-out" });

  } catch (err) {
    console.error(err);
    setStatus("Не получилось отправить заявку: " + err.message, "err");
  } finally {
    btn.disabled = false;
    btn.innerHTML = oldText;
  }
});


// === RPC EASTER EGGS ===
const secretPaw = document.getElementById("secretPaw");
const secretModal = document.getElementById("secretModal");
const secretClose = document.getElementById("secretClose");
const rpcToast = document.getElementById("rpcToast");

function openSecret() {
  if (rpcToast) {
    rpcToast.classList.add("show");
    clearTimeout(window.__rpcToastTimer);
    window.__rpcToastTimer = setTimeout(() => rpcToast.classList.remove("show"), 4200);
  }

  // Через небольшой момент открывается полное окно с кодом скидки.
  setTimeout(() => {
    secretModal.classList.add("open");
    document.body.classList.add("rpc-secret-mode");
  }, 450);
}

function closeSecret() {
  secretModal.classList.remove("open");
}

if (secretPaw && secretModal) {
  secretPaw.addEventListener("click", openSecret);
}

if (secretClose) {
  secretClose.addEventListener("click", closeSecret);
}

if (secretModal) {
  secretModal.addEventListener("click", (e) => {
    if (e.target === secretModal) closeSecret();
  });
}

let rpcTyped = "";
window.addEventListener("keydown", (e) => {
  rpcTyped += e.key.toLowerCase();
  rpcTyped = rpcTyped.slice(-16);

  // Обычное "RPC" больше не открывает пасхалку.
  // Секретные слова для своих:
  if (
    rpcTyped.includes("slime") ||
    rpcTyped.includes("vinter") ||
    rpcTyped.includes("skull294") ||
    rpcTyped.includes("rpc294")
  ) {
    openSecret();
  }

  if (e.key === "Escape") {
    closeSecret();
  }
});

// маленькая пасхалка в консоли
console.log("%cRPC: secret hidden deeper 😈", "color:#ff2bbf;font-size:18px;font-weight:900;");
