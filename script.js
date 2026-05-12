const $ = id => document.getElementById(id);

const i18n = {
  ru: {
    nav_services:"Услуги", nav_queue:"Очередь", nav_status:"Статус", nav_order:"Заказать",
    portal_btn:"Личный кабинет", hero_title:"Закажи VRChat<br />работу у <span>RPC</span>",
    hero_text:"Аватары, миры, шейдеры, оптимизация и дизайн любой сложности. Качество, скорость и стиль — в каждой работе.",
    cta_order:"Оставить заявку", cta_portal:"Открыть кабинет",
    trust_1:"предоплата", trust_2:"правки бесплатно", trust_3:"приём заявок",
    services_title:"Услуги", services_sub:"Выбери направление, а детали допишешь в заявке.",
    queue_title:"Очередь", queue_sub:"Загрузка команды сейчас.", queue_new:"Новые", queue_work:"В работе", queue_review:"Проверка", queue_slots:"Свободные слоты", queue_refresh:"Обновить очередь",
    order_title:"Пошаговая заявка", order_sub:"Заполни 4 шага. Заявка попадёт в RPC CRM.",
    field_name:"Ваше имя", field_contact:"Контакт", field_service:"Услуга", field_source:"Откуда узнали?", field_budget:"Цена / бюджет", prepay_text:"Примерная предоплата 40%:", field_deadline:"Дедлайн", field_desc:"Описание",
    prev:"Назад", next:"Дальше", send_order:"Отправить заявку", status_title:"Проверить статус заявки", status_sub:"Введи номер заявки, например RPC-00024.", check:"Проверить",
    sent_title:"Заявка отправлена!", auto_msg:"Авто-сообщение клиенту", copy:"Скопировать сообщение", go_portal:"Открыть личный кабинет"
  },
  en: {
    nav_services:"Services", nav_queue:"Queue", nav_status:"Status", nav_order:"Order",
    portal_btn:"Client portal", hero_title:"Order VRChat<br />work from <span>RPC</span>",
    hero_text:"Avatars, worlds, shaders, optimization and design of any complexity. Quality, speed and style in every order.",
    cta_order:"Send request", cta_portal:"Open portal",
    trust_1:"prepayment", trust_2:"free revisions", trust_3:"requests",
    services_title:"Services", services_sub:"Choose a direction and describe the details.",
    queue_title:"Queue", queue_sub:"Current team workload.", queue_new:"New", queue_work:"In work", queue_review:"Review", queue_slots:"Free slots", queue_refresh:"Refresh queue",
    order_title:"Step-by-step order", order_sub:"Fill 4 steps. Request goes to RPC CRM.",
    field_name:"Your name", field_contact:"Contact", field_service:"Service", field_source:"Where did you find us?", field_budget:"Price / budget", prepay_text:"Estimated 40% prepayment:", field_deadline:"Deadline", field_desc:"Description",
    prev:"Back", next:"Next", send_order:"Send request", status_title:"Check order status", status_sub:"Enter order number, e.g. RPC-00024.", check:"Check",
    sent_title:"Request sent!", auto_msg:"Auto message", copy:"Copy message", go_portal:"Open client portal"
  }
};

let state = {
  lang: localStorage.getItem("rpc-lang") || "ru",
  theme: localStorage.getItem("rpc-theme") || "dark",
  currency: localStorage.getItem("rpc-currency") || "RUB",
  step: 1
};

$("year").textContent = new Date().getFullYear();
document.documentElement.dataset.theme = state.theme;
$("themeToggle").textContent = state.theme === "dark" ? "☾" : "☀";
$("currencySelect").value = state.currency;
$("langToggle").textContent = state.lang === "ru" ? "EN" : "RU";

const portalUrl = window.RPC_CLIENT_PORTAL_URL || "#";
$("portalLinkTop").href = portalUrl;
$("portalHeroBtn").href = portalUrl;
$("goPortalAfterOrder").href = portalUrl;
$("discordBtn").href = window.RPC_DISCORD_URL || "#";
$("telegramBtn").href = window.RPC_TELEGRAM_URL || "#";

function apiUrl(){ return (window.RPC_API_URL || "").replace(/\/$/, ""); }
function currencyInfo(){ return (window.RPC_CURRENCY_RATES || {})[state.currency] || {symbol:"₽", rate:1}; }
function money(v){ const c = currencyInfo(); return Math.round(Number(v||0)*c.rate).toLocaleString("ru-RU") + " " + c.symbol; }
function esc(v){ return String(v).replace(/[&<>"']/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[s])); }
function oid(v){ const m = String(v||"").match(/\d+/); return m ? m[0] : ""; }
function setBox(el,t,ok=false){ el.textContent=t; el.className="status-box " + (ok ? "ok" : "err"); }

function applyI18n(){
  const d = i18n[state.lang];
  document.querySelectorAll("[data-i18n]").forEach(el => { if(d[el.dataset.i18n]) el.textContent = d[el.dataset.i18n]; });
  document.querySelectorAll("[data-i18n-html]").forEach(el => { if(d[el.dataset.i18nHtml]) el.innerHTML = d[el.dataset.i18nHtml]; });
}
applyI18n();

$("themeToggle").onclick = () => {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("rpc-theme", state.theme);
  document.documentElement.dataset.theme = state.theme;
  $("themeToggle").textContent = state.theme === "dark" ? "☾" : "☀";
};

$("langToggle").onclick = () => {
  state.lang = state.lang === "ru" ? "en" : "ru";
  localStorage.setItem("rpc-lang", state.lang);
  $("langToggle").textContent = state.lang === "ru" ? "EN" : "RU";
  applyI18n(); showStep(state.step);
};

$("currencySelect").onchange = () => {
  state.currency = $("currencySelect").value;
  localStorage.setItem("rpc-currency", state.currency);
  updatePrepay();
};

function showStep(s){
  state.step = Math.max(1, Math.min(4, s));
  document.querySelectorAll(".wizard-screen").forEach(el => el.classList.toggle("active", Number(el.dataset.step) === state.step));
  const p = state.step * 25;
  $("stepText").textContent = (state.lang === "ru" ? "Шаг " : "Step ") + state.step + " / 4";
  $("progressPercent").textContent = p + "%";
  $("progressFill").style.width = p + "%";
  $("prevStep").disabled = state.step === 1;
  $("nextStep").classList.toggle("hidden", state.step === 4);
  $("submitOrder").classList.toggle("hidden", state.step !== 4);
}
$("nextStep").onclick = () => showStep(state.step + 1);
$("prevStep").onclick = () => showStep(state.step - 1);
showStep(1);

$("orderForm").budget.addEventListener("input", updatePrepay);
function updatePrepay(){ $("prepayValue").textContent = money(Number($("orderForm").budget.value || 0) * 0.4); }

$("orderForm").addEventListener("submit", async e => {
  e.preventDefault();
  const f = $("orderForm");
  const d = Object.fromEntries(new FormData(f).entries());
  const payload = {
    client_name: d.client_name,
    contact: d.contact,
    service: d.service,
    price: Number(d.budget || 0),
    prepaid: 0,
    status: "new",
    worker_id: null,
    deadline: d.deadline || "",
    notes: "ЗАЯВКА С САЙТА RPC\n\nКонтакт: "+d.contact+"\nБюджет: "+(d.budget||"не указан")+"\nВалюта: "+state.currency+"\nСрок: "+(d.deadline||"не указан")+"\nИсточник: "+(d.source||"не указан")+"\n\n"+d.notes
  };
  try{
    setBox($("statusBox"), "Отправляю заявку...", true);
    const res = await fetch(apiUrl()+"/public/orders", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)});
    const result = await res.json();
    if(!res.ok) throw new Error(result.detail || "Server error");
    const rpcId = "RPC-" + String(result.id).padStart(5,"0");
    $("successText").textContent = "Номер заявки: #" + rpcId;
    $("autoMessage").value = "Привет! Я оставил заявку на сайте RPC.\nНомер заявки: #"+rpcId+"\nУслуга: "+d.service+"\nБюджет: "+(d.budget||"не указан")+" "+state.currency+"\nСрок: "+(d.deadline||"не указан");
    $("successModal").classList.remove("hidden");
    f.reset(); updatePrepay(); showStep(1); loadQueue();
    setBox($("statusBox"), "Заявка отправлена: #" + rpcId, true);
  }catch(err){ setBox($("statusBox"), "Ошибка: " + err.message, false); }
});

$("statusForm").addEventListener("submit", async e => {
  e.preventDefault();
  const id = oid($("orderIdInput").value);
  if(!id){ $("statusResult").textContent = "Введите номер заявки"; return; }
  try{
    $("statusResult").textContent = "Проверяю...";
    const res = await fetch(apiUrl()+"/public/orders/"+id);
    const d = await res.json();
    if(!res.ok) throw new Error(d.detail || "Not found");
    $("statusResult").innerHTML = `<b>#RPC-${String(d.id).padStart(5,"0")}</b><br>Service: ${esc(d.service)}<br>Status: <b>${esc(d.status)}</b><br>Deadline: ${esc(d.deadline||"—")}<br>Created: ${esc(d.created_at||"—")}`;
  }catch(err){ $("statusResult").textContent = "Ошибка: " + err.message; }
});

async function loadQueue(){
  try{
    const res = await fetch(apiUrl()+"/public/queue");
    const q = await res.json();
    if(!res.ok) throw new Error();
    $("queueNew").textContent = q.new ?? "0";
    $("queueWork").textContent = q.in_work ?? "0";
    $("queueReview").textContent = q.review ?? "0";
    $("queueSlots").textContent = q.free_slots ?? "0";
  }catch{ $("queueNew").textContent=$("queueWork").textContent=$("queueReview").textContent=$("queueSlots").textContent="—"; }
}
$("refreshQueue").onclick = loadQueue;
loadQueue();

$("closeModal").onclick = () => $("successModal").classList.add("hidden");
$("copyMessage").onclick = async () => {
  try{ await navigator.clipboard.writeText($("autoMessage").value); $("copyMessage").textContent="Скопировано ✓"; setTimeout(()=>$("copyMessage").textContent=i18n[state.lang].copy,1400); }
  catch{ $("autoMessage").select(); document.execCommand("copy"); }
};
$("chatToggle").onclick = () => $("chatPanel").classList.toggle("hidden");

const observer = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) e.target.classList.add("visible"); }), {threshold:.12});
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
document.addEventListener("mousemove", e => {
  const a = $("avatarShell"); if(!a) return;
  const x = (e.clientX/window.innerWidth-.5)*10, y=(e.clientY/window.innerHeight-.5)*10;
  a.style.transform = `translateY(-8px) rotateX(${-y}deg) rotateY(${x}deg)`;
});
