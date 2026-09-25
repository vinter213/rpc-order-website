"use strict";

/**
 * RPC Recruitment
 * Frontend for https://rpc-order-website.onrender.com/
 *
 * Server endpoint is already deployed in Supabase:
 * https://kltlmugbsyavyauexxyv.supabase.co/functions/v1/rpc-recruitment
 */
(() => {
  const RECRUITMENT_ENDPOINT =
    "https://kltlmugbsyavyauexxyv.supabase.co/functions/v1/rpc-recruitment";

  const PUBLIC_CONFIG_ENDPOINT =
    "https://rpc-telegrambot.onrender.com/api/public-config";

  const NOTICE_DELAY_MS = 1300;
  const LATER_HIDE_MS = 24 * 60 * 60 * 1000;
  const SENT_HIDE_MS = 30 * 24 * 60 * 60 * 1000;

  const STORAGE_KEY = "rpc_recruitment_notice_until_v2";

  const i18n = {
    ru: {
      kicker: "RPC · НАБОР В КОМАНДУ",
      title: "Ищем новых сотрудников",
      description:
        "Если ты работаешь с VRChat, Unity, 3D, аватарами, мирами или смежными направлениями — оставь заявку.",
      apply: "Подать заявку",
      later: "Позже",
      modalKicker: "RPC RECRUITMENT",
      modalTitle: "Заявка в команду",
      modalDescription:
        "Заполни форму. После отправки заявка сохранится в RPC и придёт сотрудникам в Discord.",
      name: "Имя / ник",
      discord: "Discord",
      age: "Возраст",
      direction: "Направление",
      chooseDirection: "Выбери направление",
      experience: "Опыт",
      experiencePlaceholder:
        "Что умеешь, с чем работал, какие проекты делал",
      portfolio: "Портфолио",
      availability: "Сколько времени готов уделять",
      availabilityPlaceholder: "Например: 3–4 часа в день",
      motivation: "Почему хочешь работать в RPC",
      security: "ЗАЩИТА ОТ СПАМА",
      securityLoading: "Загрузка проверки…",
      securityReady: "Проверка пройдена.",
      securityOptional: "Дополнительная проверка не требуется.",
      send: "Отправить заявку →",
      sending: "Отправляем заявку…",
      sentDiscord:
        "✅ Заявка {code} отправлена. Команда RPC получила уведомление в Discord.",
      sentSaved:
        "✅ Заявка {code} сохранена. Discord-уведомление пока не настроено на сервере.",
      failed: "Не удалось отправить заявку: {error}",
      invalidDiscord:
        "Укажи Discord username, например @username.",
      close: "Закрыть",
    },
    en: {
      kicker: "RPC · TEAM RECRUITMENT",
      title: "We are looking for new team members",
      description:
        "If you work with VRChat, Unity, 3D, avatars, worlds, or related areas, send us an application.",
      apply: "Apply",
      later: "Later",
      modalKicker: "RPC RECRUITMENT",
      modalTitle: "Join the RPC team",
      modalDescription:
        "Complete the form. Your application will be saved in RPC and sent to the team in Discord.",
      name: "Name / nickname",
      discord: "Discord",
      age: "Age",
      direction: "Role",
      chooseDirection: "Choose a role",
      experience: "Experience",
      experiencePlaceholder:
        "What you can do, tools you use, and projects you have worked on",
      portfolio: "Portfolio",
      availability: "Availability",
      availabilityPlaceholder: "For example: 3–4 hours per day",
      motivation: "Why do you want to join RPC?",
      security: "SPAM PROTECTION",
      securityLoading: "Loading verification…",
      securityReady: "Verification completed.",
      securityOptional: "Additional verification is not required.",
      send: "Send application →",
      sending: "Sending application…",
      sentDiscord:
        "✅ Application {code} sent. The RPC team received a Discord notification.",
      sentSaved:
        "✅ Application {code} saved. Discord notifications are not configured on the server yet.",
      failed: "Could not send the application: {error}",
      invalidDiscord:
        "Enter a Discord username, for example @username.",
      close: "Close",
    },
  };

  function language() {
    return document.documentElement.lang === "en" ? "en" : "ru";
  }

  function t(key, vars = {}) {
    let value = i18n[language()][key] || i18n.ru[key] || key;
    for (const [name, replacement] of Object.entries(vars)) {
      value = value.replaceAll(`{${name}}`, String(replacement));
    }
    return value;
  }

  function errorText(code) {
    const ru = {
      REQUIRED_FIELDS: "заполни обязательные поля",
      DISCORD_INVALID: "неверно указан Discord username",
      TURNSTILE_FAILED: "проверка безопасности не пройдена",
      RATE_LIMIT: "слишком много заявок. Попробуй позже",
      DATABASE_ERROR: "ошибка базы данных",
      INVALID_JSON: "ошибка данных формы",
      SEND_FAILED: "ошибка соединения с сервером",
    };
    const en = {
      REQUIRED_FIELDS: "complete all required fields",
      DISCORD_INVALID: "invalid Discord username",
      TURNSTILE_FAILED: "security verification failed",
      RATE_LIMIT: "too many applications. Try again later",
      DATABASE_ERROR: "database error",
      INVALID_JSON: "invalid form data",
      SEND_FAILED: "server connection error",
    };
    return (language() === "en" ? en : ru)[code] || code || "unknown error";
  }

  const style = document.createElement("style");
  style.dataset.rpcRecruitment = "v2";
  style.textContent = `
    .rpc-recruitment-toast{
      position:fixed;right:28px;bottom:28px;z-index:9000;
      width:min(440px,calc(100vw - 32px));padding:20px;
      border:1px solid rgba(138,92,255,.45);border-radius:22px;
      background:
        radial-gradient(circle at 100% 0%,rgba(128,77,255,.16),transparent 38%),
        linear-gradient(160deg,rgba(15,17,30,.98),rgba(8,10,18,.985));
      box-shadow:0 24px 70px rgba(0,0,0,.5),0 0 42px rgba(120,70,255,.14);
      backdrop-filter:blur(18px);
      animation:rpcRecruitIn .45s cubic-bezier(.2,.8,.2,1) both
    }
    .rpc-recruitment-toast h3{margin:0 0 8px;font-size:21px;color:#fff}
    .rpc-recruitment-toast p{margin:0;color:#b8bfd3;line-height:1.55}
    .rpc-recruitment-kicker{
      display:block;margin-bottom:8px;font-size:11px;font-weight:800;
      letter-spacing:.16em;color:#a486ff
    }
    .rpc-recruitment-live{
      display:inline-flex;align-items:center;gap:7px;margin-bottom:11px;
      padding:5px 9px;border-radius:999px;background:rgba(103,76,255,.11);
      border:1px solid rgba(133,102,255,.18);font-size:11px;color:#c7baff
    }
    .rpc-recruitment-live::before{
      content:"";width:7px;height:7px;border-radius:50%;background:#8f6cff;
      box-shadow:0 0 13px rgba(143,108,255,.8)
    }
    .rpc-recruitment-actions{display:flex;gap:10px;margin-top:17px}
    .rpc-recruitment-actions button{
      border:0;border-radius:12px;padding:11px 14px;font-weight:800;cursor:pointer
    }
    .rpc-recruitment-primary{
      flex:1;background:linear-gradient(135deg,#7452ff,#a879ff);color:#fff;
      box-shadow:0 8px 28px rgba(117,80,255,.2)
    }
    .rpc-recruitment-secondary{
      background:#171a27;color:#cdd3e4;border:1px solid #292d3d!important
    }

    .rpc-recruitment-modal{
      position:fixed;inset:0;z-index:9100;display:none;place-items:center;padding:20px;
      background:rgba(3,5,10,.79);backdrop-filter:blur(13px)
    }
    .rpc-recruitment-modal.open{display:grid}
    .rpc-recruitment-card{
      width:min(780px,100%);max-height:92vh;overflow:auto;
      border:1px solid rgba(138,92,255,.4);border-radius:24px;
      background:
        radial-gradient(circle at 90% -10%,rgba(127,78,255,.13),transparent 34%),
        #0d101a;
      box-shadow:0 28px 90px rgba(0,0,0,.62);padding:26px
    }
    .rpc-recruitment-head{
      display:flex;justify-content:space-between;gap:16px;align-items:flex-start;
      margin-bottom:20px
    }
    .rpc-recruitment-head h2{margin:3px 0 7px;color:#fff}
    .rpc-recruitment-head p{margin:0;color:#9da5ba;line-height:1.5}
    .rpc-recruitment-close{
      flex:0 0 39px;width:39px;height:39px;border-radius:11px;border:1px solid #2c3040;
      background:#161a27;color:#fff;font-size:22px;cursor:pointer
    }
    .rpc-recruitment-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .rpc-recruitment-field{display:flex;flex-direction:column;gap:7px}
    .rpc-recruitment-field.full{grid-column:1/-1}
    .rpc-recruitment-field label{font-size:12px;font-weight:700;color:#aeb5ca}
    .rpc-recruitment-field input,
    .rpc-recruitment-field select,
    .rpc-recruitment-field textarea{
      width:100%;box-sizing:border-box;border:1px solid #292e40;border-radius:12px;
      background:#121622;color:#fff;padding:12px 13px;outline:none
    }
    .rpc-recruitment-field select option{background:#121622;color:#fff}
    .rpc-recruitment-field textarea{min-height:112px;resize:vertical}
    .rpc-recruitment-field input:focus,
    .rpc-recruitment-field select:focus,
    .rpc-recruitment-field textarea:focus{
      border-color:#805cff;box-shadow:0 0 0 3px rgba(128,92,255,.12)
    }
    .rpc-recruitment-security{
      margin-top:15px;padding:13px;border:1px solid #252a3b;border-radius:14px;background:#10141f
    }
    .rpc-recruitment-security strong{
      display:block;margin-bottom:8px;font-size:10px;letter-spacing:.14em;color:#8f79e9
    }
    .rpc-recruitment-security p{margin:7px 0 0;font-size:12px;color:#8f98ad}
    .rpc-recruitment-turnstile{min-height:0}
    .rpc-recruitment-submit{
      width:100%;margin-top:16px;border:0;border-radius:13px;padding:13px 16px;
      background:linear-gradient(135deg,#7452ff,#a879ff);color:#fff;font-weight:900;
      cursor:pointer;box-shadow:0 10px 30px rgba(117,80,255,.2)
    }
    .rpc-recruitment-submit:disabled{opacity:.55;cursor:wait}
    .rpc-recruitment-status{min-height:24px;margin-top:12px;font-size:13px;color:#adb4ca}
    .rpc-recruitment-status.ok{color:#7ee2a8}
    .rpc-recruitment-status.error{color:#ff8e9b}
    .rpc-recruitment-hp{
      position:absolute!important;left:-9999px!important;opacity:0!important;
      pointer-events:none!important
    }
    @keyframes rpcRecruitIn{
      from{opacity:0;transform:translateY(18px) scale(.98)}
      to{opacity:1;transform:none}
    }
    @media(max-width:700px){
      .rpc-recruitment-toast{right:16px;bottom:16px}
      .rpc-recruitment-grid{grid-template-columns:1fr}
      .rpc-recruitment-card{padding:20px}
      .rpc-recruitment-actions{flex-direction:column}
    }
    @media(prefers-reduced-motion:reduce){
      .rpc-recruitment-toast{animation:none}
    }
  `;
  document.head.append(style);

  const toast = document.createElement("aside");
  toast.className = "rpc-recruitment-toast";
  toast.innerHTML = `
    <span class="rpc-recruitment-live">RPC TEAM</span>
    <span class="rpc-recruitment-kicker">${t("kicker")}</span>
    <h3>${t("title")}</h3>
    <p>${t("description")}</p>
    <div class="rpc-recruitment-actions">
      <button class="rpc-recruitment-primary" type="button">${t("apply")}</button>
      <button class="rpc-recruitment-secondary" type="button">${t("later")}</button>
    </div>
  `;

  const modal = document.createElement("div");
  modal.className = "rpc-recruitment-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <section class="rpc-recruitment-card" role="dialog" aria-modal="true"
      aria-label="${t("modalTitle")}">
      <div class="rpc-recruitment-head">
        <div>
          <span class="rpc-recruitment-kicker">${t("modalKicker")}</span>
          <h2>${t("modalTitle")}</h2>
          <p>${t("modalDescription")}</p>
        </div>
        <button class="rpc-recruitment-close" type="button"
          aria-label="${t("close")}">×</button>
      </div>

      <form id="rpcRecruitmentForm" novalidate>
        <input class="rpc-recruitment-hp" type="text" name="website"
          tabindex="-1" autocomplete="off">

        <div class="rpc-recruitment-grid">
          <div class="rpc-recruitment-field">
            <label>${t("name")} *</label>
            <input name="name" maxlength="80" required autocomplete="nickname">
          </div>

          <div class="rpc-recruitment-field">
            <label>${t("discord")} *</label>
            <input name="discord" maxlength="100" placeholder="@username"
              required autocomplete="off">
          </div>

          <div class="rpc-recruitment-field">
            <label>${t("age")}</label>
            <input name="age" type="number" min="14" max="99" inputmode="numeric">
          </div>

          <div class="rpc-recruitment-field">
            <label>${t("direction")} *</label>
            <select name="direction" required>
              <option value="">${t("chooseDirection")}</option>
              <option>Level Designer</option>
              <option>3D Artist</option>
              <option>Avatar Creator</option>
              <option>Unity / Udon</option>
              <option>Programmer</option>
              <option>UI / Graphic Designer</option>
              <option>Video / Content</option>
              <option>Community / Support</option>
              <option>Другое / Other</option>
            </select>
          </div>

          <div class="rpc-recruitment-field full">
            <label>${t("experience")} *</label>
            <textarea name="experience" minlength="10" maxlength="2000" required
              placeholder="${t("experiencePlaceholder")}"></textarea>
          </div>

          <div class="rpc-recruitment-field full">
            <label>${t("portfolio")}</label>
            <input name="portfolioUrl" maxlength="600"
              placeholder="https://...">
          </div>

          <div class="rpc-recruitment-field full">
            <label>${t("availability")}</label>
            <input name="availability" maxlength="1000"
              placeholder="${t("availabilityPlaceholder")}">
          </div>

          <div class="rpc-recruitment-field full">
            <label>${t("motivation")} *</label>
            <textarea name="motivation" minlength="10" maxlength="2000"
              required></textarea>
          </div>
        </div>

        <div class="rpc-recruitment-security">
          <strong>${t("security")}</strong>
          <div class="rpc-recruitment-turnstile" id="rpcRecruitmentTurnstile"></div>
          <p id="rpcRecruitmentSecurityStatus">${t("securityLoading")}</p>
        </div>

        <button class="rpc-recruitment-submit" type="submit">${t("send")}</button>
        <div class="rpc-recruitment-status" aria-live="polite"></div>
      </form>
    </section>
  `;

  document.body.append(modal);

  const form = modal.querySelector("#rpcRecruitmentForm");
  const status = modal.querySelector(".rpc-recruitment-status");
  const submit = modal.querySelector(".rpc-recruitment-submit");
  const securityStatus = modal.querySelector("#rpcRecruitmentSecurityStatus");

  let turnstileToken = "";
  let turnstileWidget = null;
  let turnstileRequired = false;

  const open = () => {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    toast.remove();
    setTimeout(() => form.querySelector('input[name="name"]')?.focus(), 60);
  };

  const close = () => {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
  };

  toast.querySelector(".rpc-recruitment-primary").addEventListener("click", open);
  toast.querySelector(".rpc-recruitment-secondary").addEventListener("click", () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now() + LATER_HIDE_MS));
    toast.remove();
  });

  modal.querySelector(".rpc-recruitment-close").addEventListener("click", close);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) close();
  });

  async function waitForTurnstile(timeout = 7000) {
    const started = Date.now();
    while (!window.turnstile && Date.now() - started < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 80));
    }
    return window.turnstile || null;
  }

  async function initTurnstile() {
    try {
      const response = await fetch(PUBLIC_CONFIG_ENDPOINT, { cache: "no-store" });
      const config = await response.json();

      if (!config?.turnstileConfigured || !config?.turnstileSiteKey) {
        turnstileRequired = false;
        securityStatus.textContent = t("securityOptional");
        return;
      }

      const turnstile = await waitForTurnstile();
      if (!turnstile) {
        turnstileRequired = false;
        securityStatus.textContent = t("securityOptional");
        return;
      }

      turnstileRequired = true;
      turnstileWidget = turnstile.render("#rpcRecruitmentTurnstile", {
        sitekey: config.turnstileSiteKey,
        theme: "dark",
        size: "flexible",
        language: language(),
        callback(token) {
          turnstileToken = token;
          securityStatus.textContent = t("securityReady");
        },
        "expired-callback"() {
          turnstileToken = "";
          securityStatus.textContent = t("securityLoading");
        },
        "error-callback"() {
          turnstileToken = "";
          securityStatus.textContent = t("securityLoading");
        },
      });
    } catch (error) {
      console.warn("RPC Recruitment Turnstile:", error);
      turnstileRequired = false;
      securityStatus.textContent = t("securityOptional");
    }
  }

  function validDiscord(value) {
    return /^@?[A-Za-z0-9_.]{2,32}$/.test(String(value || "").trim());
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    status.className = "rpc-recruitment-status";
    status.textContent = "";

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const discordInput = form.elements.discord;
    if (!validDiscord(discordInput.value)) {
      status.className = "rpc-recruitment-status error";
      status.textContent = t("invalidDiscord");
      discordInput.focus();
      return;
    }

    if (turnstileRequired && !turnstileToken) {
      status.className = "rpc-recruitment-status error";
      status.textContent = t("securityLoading");
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    data.sourceUrl = location.href;
    data.language = language();
    data.turnstileToken = turnstileToken;

    submit.disabled = true;
    submit.textContent = t("sending");
    status.textContent = t("sending");

    try {
      const response = await fetch(RECRUITMENT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "SEND_FAILED");
      }

      status.className = "rpc-recruitment-status ok";
      status.textContent = result.discordSent
        ? t("sentDiscord", { code: result.shortCode || "RPC" })
        : t("sentSaved", { code: result.shortCode || "RPC" });

      form.reset();
      turnstileToken = "";

      if (window.turnstile && turnstileWidget !== null) {
        try {
          window.turnstile.reset(turnstileWidget);
        } catch (_) {}
      }

      localStorage.setItem(STORAGE_KEY, String(Date.now() + SENT_HIDE_MS));
    } catch (error) {
      console.error("RPC Recruitment:", error);
      status.className = "rpc-recruitment-status error";
      status.textContent = t("failed", { error: errorText(error.message) });
    } finally {
      submit.disabled = false;
      submit.textContent = t("send");
    }
  });

  initTurnstile();

  const hiddenUntil = Number(localStorage.getItem(STORAGE_KEY) || 0);
  if (!hiddenUntil || hiddenUntil <= Date.now()) {
    setTimeout(() => {
      if (!document.body.contains(toast)) document.body.append(toast);
    }, NOTICE_DELAY_MS);
  }
})();
