const form = document.getElementById("orderForm");
const statusBox = document.getElementById("statusBox");

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
      "ЗАЯВКА С САЙТА\\n\\n" +
      "Контакт: " + data.contact + "\\n" +
      "Бюджет: " + (data.budget || "не указан") + "\\n\\n" +
      data.notes
  };

  try {
    setStatus("Отправляю заявку...", true);

    const res = await fetch(window.RPC_API_URL.replace(/\/$/, "") + "/public/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    let result = {};
    try { result = await res.json(); } catch (_) {}

    if (!res.ok) {
      throw new Error(result.detail || "Ошибка отправки заявки");
    }

    form.reset();
    setStatus("Заявка отправлена. Мы скоро свяжемся с тобой. Номер заявки: #" + result.id, true);
  } catch (err) {
    setStatus("Не получилось отправить: " + err.message, false);
  }
});
