// RPC public website connector
// Put this file into rpc-order-website and include it before </body>:
// <script src="rpc_site_api.js"></script>

const RPC_API_URL = window.RPC_API_URL || "https://rpc-team-crm.onrender.com";

async function rpcCreateOrder(order) {
  const res = await fetch(`${RPC_API_URL}/public/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: order.client_name || order.name || "Клиент с сайта",
      contact: order.contact || "",
      service: order.service || "Не указано",
      price: Number(order.price || order.budget || 0),
      deadline: order.deadline || "",
      notes: order.notes || order.description || "",
      source: order.source || "Сайт RPC"
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Ошибка отправки заявки");
  return data;
}

async function rpcLoadQueue() {
  const res = await fetch(`${RPC_API_URL}/public/queue`);
  if (!res.ok) throw new Error("Не удалось загрузить очередь");
  return await res.json();
}

// Auto-bind example: any form with id="rpc-order-form"
// Required input names: name/client_name, contact, service, budget/price, deadline, description/notes.
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("rpc-order-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = Object.fromEntries(fd.entries());
    const submit = form.querySelector("button[type='submit']");
    const oldText = submit ? submit.textContent : "";
    try {
      if (submit) { submit.disabled = true; submit.textContent = "Отправка..."; }
      const result = await rpcCreateOrder(payload);
      alert(`Заявка отправлена! Номер: ${result.order.public_id || result.order.id}`);
      form.reset();
    } catch (err) {
      alert(err.message || "Ошибка отправки");
    } finally {
      if (submit) { submit.disabled = false; submit.textContent = oldText; }
    }
  });
});
