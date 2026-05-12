const form = document.getElementById("orderForm");
const statusBox = document.getElementById("statusBox");
const year = document.getElementById("year");

year.textContent = new Date().getFullYear();

function setStatus(text, ok = false) {
  statusBox.textContent = text;
  statusBox.className = "status-box " + (ok ? "ok" : "err");
}

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
      "ЗАЯВКА С САЙТА RPC\\n\\n" +
      "Контакт: " + data.contact + "\\n" +
      "Бюджет: " + (data.budget || "не указан") + "\\n" +
      "Срок: " + (data.deadline || "не указан") + "\\n\\n" +
      data.notes
  };

  try {
    setStatus("Отправляю заявку в RPC CRM...", true);

    const apiUrl = (window.RPC_API_URL || "").replace(/\/$/, "");
    if (!apiUrl) throw new Error("Не указан RPC_API_URL в config.js");

    const res = await fetch(apiUrl + "/public/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    let result = {};
    try { result = await res.json(); } catch (_) {}

    if (!res.ok) {
      throw new Error(result.detail || "Сервер не принял заявку");
    }

    form.reset();
    setStatus("Заявка отправлена. Номер заявки: #" + result.id + ". Мы скоро свяжемся с тобой.", true);
  } catch (err) {
    setStatus("Не получилось отправить: " + err.message, false);
  }
});
