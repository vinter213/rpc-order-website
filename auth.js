"use strict";

(() => {
  const VERSION = "1.0.0";
  const REMEMBER_KEY = "rpc_auth_remember_v1";
  const PENDING_EMAIL_KEY = "rpc_auth_pending_email_v1";
  const PENDING_NAME_KEY = "rpc_auth_pending_name_v1";

  const config = window.RPC_AUTH_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const modal = $("#rpcAuthModal");
  const dialog = $("#rpcAuthDialog");
  const loggedOutView = $("#rpcAuthLoggedOut");
  const loggedInView = $("#rpcAuthLoggedIn");
  const emailStep = $("#rpcAuthEmailStep");
  const codeStep = $("#rpcAuthCodeStep");
  const emailForm = $("#rpcAuthEmailForm");
  const codeForm = $("#rpcAuthCodeForm");
  const emailInput = $("#rpcAuthEmail");
  const nameInput = $("#rpcAuthName");
  const rememberInput = $("#rpcAuthRemember");
  const sendButton = $("#rpcAuthSendCode");
  const verifyButton = $("#rpcAuthVerifyCode");
  const resendButton = $("#rpcAuthResend");
  const backButton = $("#rpcAuthBack");
  const logoutButton = $("#rpcAuthLogout");
  const emailStatus = $("#rpcAuthEmailStatus");
  const codeStatus = $("#rpcAuthCodeStatus");
  const codeEmail = $("#rpcAuthCodeEmail");
  const accountName = $("#rpcAuthAccountName");
  const accountEmail = $("#rpcAuthAccountEmail");
  const accountInitials = $("#rpcAuthInitials");
  const configWarning = $("#rpcAuthConfigWarning");
  const otpInputs = $$("[data-rpc-otp]");
  const accountButtons = $$("[data-rpc-auth-open]");
  const accountLabels = $$("[data-rpc-auth-label]");
  const accountSubLabels = $$("[data-rpc-auth-subtitle]");

  const dictionary = {
    ru: {
      openGuest: "Войти",
      openAccount: "Аккаунт",
      guestSubtitle: "Регистрация по почте",
      accountSubtitle: "Почта подтверждена",
      title: "Аккаунт RPC",
      intro: "Введите почту — мы отправим одноразовый код из 6 цифр.",
      name: "Имя / никнейм",
      namePlaceholder: "Как к вам обращаться",
      email: "Электронная почта",
      emailPlaceholder: "name@example.com",
      remember: "Оставаться в аккаунте на этом устройстве",
      send: "Получить код",
      sending: "Отправляем код…",
      codeTitle: "Введите код",
      codeIntro: "Код отправлен на",
      verify: "Подтвердить и войти",
      verifying: "Проверяем код…",
      resend: "Отправить код ещё раз",
      resendIn: "Новый код через {seconds} сек.",
      back: "Изменить почту",
      invalidEmail: "Введите корректный адрес электронной почты.",
      codeSent: "Код отправлен. Проверьте папку «Спам», если письма нет.",
      sendFailed: "Не удалось отправить код. Подождите и попробуйте ещё раз.",
      invalidCode: "Неверный или истёкший код. Проверьте цифры и попробуйте ещё раз.",
      sixDigits: "Введите все 6 цифр кода.",
      signedIn: "Почта подтверждена. Вход выполнен.",
      verified: "Почта подтверждена",
      logout: "Выйти из аккаунта",
      logoutFailed: "Не удалось завершить сеанс. Перезагрузите страницу.",
      setup: "Регистрация ещё не подключена. Укажите Supabase URL и Publishable Key в auth-config.js.",
      connectionFailed: "Не удалось подключиться к системе аккаунтов.",
      accountSince: "Аккаунт сохранён в RPC",
      close: "Закрыть"
    },
    en: {
      openGuest: "Sign in",
      openAccount: "Account",
      guestSubtitle: "Email registration",
      accountSubtitle: "Email verified",
      title: "RPC account",
      intro: "Enter your email and we will send a one-time 6-digit code.",
      name: "Name / nickname",
      namePlaceholder: "How should we address you?",
      email: "Email address",
      emailPlaceholder: "name@example.com",
      remember: "Keep me signed in on this device",
      send: "Send code",
      sending: "Sending code…",
      codeTitle: "Enter the code",
      codeIntro: "The code was sent to",
      verify: "Verify and sign in",
      verifying: "Checking code…",
      resend: "Send another code",
      resendIn: "New code in {seconds} sec.",
      back: "Change email",
      invalidEmail: "Enter a valid email address.",
      codeSent: "Code sent. Check Spam if the email is missing.",
      sendFailed: "Could not send the code. Wait and try again.",
      invalidCode: "The code is invalid or expired. Check the digits and try again.",
      sixDigits: "Enter all 6 digits.",
      signedIn: "Email verified. You are signed in.",
      verified: "Email verified",
      logout: "Sign out",
      logoutFailed: "Could not end the session. Reload the page.",
      setup: "Accounts are not connected yet. Add the Supabase URL and Publishable Key to auth-config.js.",
      connectionFailed: "Could not connect to the account service.",
      accountSince: "Account saved in RPC",
      close: "Close"
    }
  };

  function language() {
    return document.documentElement.lang === "en" ? "en" : "ru";
  }

  function text(key, values = {}) {
    let value = dictionary[language()][key] || dictionary.ru[key] || key;
    Object.entries(values).forEach(([name, replacement]) => {
      value = value.replaceAll(`{${name}}`, String(replacement));
    });
    return value;
  }

  function safeStorage(storage, method, ...args) {
    try {
      return storage?.[method]?.(...args) ?? null;
    } catch {
      return null;
    }
  }

  function rememberEnabled() {
    return safeStorage(localStorage, "getItem", REMEMBER_KEY) !== "0";
  }

  const hybridStorage = {
    getItem(key) {
      const primary = rememberEnabled() ? localStorage : sessionStorage;
      return safeStorage(primary, "getItem", key);
    },
    setItem(key, value) {
      const persistent = rememberEnabled();
      const primary = persistent ? localStorage : sessionStorage;
      const secondary = persistent ? sessionStorage : localStorage;
      safeStorage(primary, "setItem", key, value);
      safeStorage(secondary, "removeItem", key);
    },
    removeItem(key) {
      safeStorage(localStorage, "removeItem", key);
      safeStorage(sessionStorage, "removeItem", key);
    }
  };

  function configured() {
    const url = String(config.supabaseUrl || "");
    const key = String(config.supabasePublishableKey || "");
    return /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)
      && key.length > 30
      && !url.includes("PASTE_")
      && !key.includes("PASTE_");
  }

  let client = null;
  let currentUser = null;
  let currentSession = null;
  let pendingEmail = safeStorage(sessionStorage, "getItem", PENDING_EMAIL_KEY) || "";
  let pendingName = safeStorage(sessionStorage, "getItem", PENDING_NAME_KEY) || "";
  let resendTimer = null;
  let resendRemaining = 0;

  function initialsFor(user) {
    const name = String(user?.user_metadata?.display_name || user?.email || "RPC").trim();
    const chunks = name.split(/\s+/).filter(Boolean);
    return (chunks.length > 1 ? `${chunks[0][0]}${chunks[1][0]}` : name.slice(0, 2)).toUpperCase();
  }

  function displayNameFor(user) {
    return String(user?.user_metadata?.display_name || user?.email?.split("@")[0] || "RPC User");
  }

  function setStatus(element, message = "", kind = "") {
    if (!element) return;
    element.textContent = message;
    element.className = `rpc-auth-status${kind ? ` ${kind}` : ""}`;
  }

  function setBusy(button, busy, busyLabel, normalLabel) {
    if (!button) return;
    button.disabled = Boolean(busy);
    button.textContent = busy ? busyLabel : normalLabel;
  }

  function resetOtpInputs() {
    otpInputs.forEach(input => { input.value = ""; });
  }

  function getOtp() {
    return otpInputs.map(input => input.value).join("");
  }

  function setStep(step) {
    const isCode = step === "code";
    emailStep?.toggleAttribute("hidden", isCode);
    codeStep?.toggleAttribute("hidden", !isCode);
    if (isCode) {
      if (codeEmail) codeEmail.textContent = pendingEmail;
      requestAnimationFrame(() => otpInputs[0]?.focus());
    } else {
      requestAnimationFrame(() => emailInput?.focus());
    }
  }

  function updateStaticLanguage() {
    $$('[data-auth-i18n]').forEach(element => {
      const key = element.dataset.authI18n;
      if (key) element.textContent = text(key);
    });
    $$('[data-auth-placeholder]').forEach(element => {
      const key = element.dataset.authPlaceholder;
      if (key) element.setAttribute("placeholder", text(key));
    });
    $$('[data-auth-aria]').forEach(element => {
      const key = element.dataset.authAria;
      if (key) element.setAttribute("aria-label", text(key));
    });
    accountLabels.forEach(label => { label.textContent = currentUser ? text("openAccount") : text("openGuest"); });
    accountSubLabels.forEach(label => { label.textContent = currentUser ? text("accountSubtitle") : text("guestSubtitle"); });
    if (resendRemaining > 0) resendButton.textContent = text("resendIn", { seconds: resendRemaining });
    else if (resendButton) resendButton.textContent = text("resend");
    if (sendButton && !sendButton.disabled) sendButton.textContent = text("send");
    if (verifyButton && !verifyButton.disabled) verifyButton.textContent = text("verify");
  }

  function updateAccountUI(user, session = currentSession) {
    currentUser = user || null;
    currentSession = session || null;
    loggedOutView?.toggleAttribute("hidden", Boolean(currentUser));
    loggedInView?.toggleAttribute("hidden", !currentUser);
    document.body.classList.toggle("rpc-account-active", Boolean(currentUser));

    if (currentUser) {
      if (accountName) accountName.textContent = displayNameFor(currentUser);
      if (accountEmail) accountEmail.textContent = currentUser.email || "";
      if (accountInitials) accountInitials.textContent = initialsFor(currentUser);
      accountButtons.forEach(button => button.classList.add("is-authenticated"));
      const name = displayNameFor(currentUser);
      const orderName = $("#clientName");
      const reviewName = $("#reviewForm input[name='name']");
      if (orderName && !orderName.value.trim()) orderName.value = name;
      if (reviewName && !reviewName.value.trim()) reviewName.value = name;
    } else {
      accountButtons.forEach(button => button.classList.remove("is-authenticated"));
    }

    updateStaticLanguage();
    window.dispatchEvent(new CustomEvent("rpc-auth-change", {
      detail: { user: currentUser, session: currentSession }
    }));
  }

  function openModal() {
    if (!modal) return;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("rpc-auth-open");
    if (!currentUser && pendingEmail) setStep("code");
    requestAnimationFrame(() => {
      if (currentUser) logoutButton?.focus();
      else if (pendingEmail) otpInputs[0]?.focus();
      else emailInput?.focus();
    });
  }

  function closeModal() {
    modal?.classList.remove("open");
    modal?.setAttribute("aria-hidden", "true");
    document.body.classList.remove("rpc-auth-open");
  }

  function startResendCountdown(seconds = Number(config.otpCooldownSeconds) || 60) {
    clearInterval(resendTimer);
    resendRemaining = Math.max(1, Math.floor(seconds));
    if (resendButton) resendButton.disabled = true;
    const tick = () => {
      if (resendButton) resendButton.textContent = text("resendIn", { seconds: resendRemaining });
      resendRemaining -= 1;
      if (resendRemaining < 0) {
        clearInterval(resendTimer);
        resendTimer = null;
        if (resendButton) {
          resendButton.disabled = false;
          resendButton.textContent = text("resend");
        }
      }
    };
    tick();
    resendTimer = setInterval(tick, 1000);
  }

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function sendCode({ resend = false } = {}) {
    if (!client) {
      setStatus(emailStatus, text("setup"), "error");
      return false;
    }

    const email = resend ? pendingEmail : normalizeEmail(emailInput?.value);
    const name = resend ? pendingName : String(nameInput?.value || "").trim().slice(0, 80);
    if (!validEmail(email)) {
      setStatus(emailStatus, text("invalidEmail"), "error");
      emailInput?.focus();
      return false;
    }

    const remember = Boolean(rememberInput?.checked);
    safeStorage(localStorage, "setItem", REMEMBER_KEY, remember ? "1" : "0");
    pendingEmail = email;
    pendingName = name;
    safeStorage(sessionStorage, "setItem", PENDING_EMAIL_KEY, pendingEmail);
    safeStorage(sessionStorage, "setItem", PENDING_NAME_KEY, pendingName);

    setBusy(sendButton, true, text("sending"), text("send"));
    setStatus(emailStatus, "");
    setStatus(codeStatus, "");

    try {
      const options = { shouldCreateUser: true };
      if (name) options.data = { display_name: name };
      const { error } = await client.auth.signInWithOtp({ email, options });
      if (error) throw error;
      setStep("code");
      resetOtpInputs();
      setStatus(codeStatus, text("codeSent"), "success");
      startResendCountdown();
      return true;
    } catch (error) {
      console.error("[RPC Auth] send OTP:", error);
      const message = /rate|seconds|limit/i.test(String(error?.message || ""))
        ? String(error.message)
        : text("sendFailed");
      setStatus(resend ? codeStatus : emailStatus, message, "error");
      return false;
    } finally {
      setBusy(sendButton, false, text("sending"), text("send"));
    }
  }

  async function verifyCode() {
    if (!client) {
      setStatus(codeStatus, text("setup"), "error");
      return;
    }
    const token = getOtp();
    if (!/^\d{6}$/.test(token)) {
      setStatus(codeStatus, text("sixDigits"), "error");
      otpInputs.find(input => !input.value)?.focus();
      return;
    }

    setBusy(verifyButton, true, text("verifying"), text("verify"));
    setStatus(codeStatus, "");
    try {
      const { data, error } = await client.auth.verifyOtp({
        email: pendingEmail,
        token,
        type: "email"
      });
      if (error) throw error;

      if (pendingName && data.user?.user_metadata?.display_name !== pendingName) {
        const { data: updated, error: updateError } = await client.auth.updateUser({
          data: { display_name: pendingName }
        });
        if (!updateError && updated.user) data.user = updated.user;
      }

      safeStorage(sessionStorage, "removeItem", PENDING_EMAIL_KEY);
      safeStorage(sessionStorage, "removeItem", PENDING_NAME_KEY);
      pendingEmail = "";
      pendingName = "";
      clearInterval(resendTimer);
      resendTimer = null;
      resendRemaining = 0;
      resetOtpInputs();
      setStatus(codeStatus, text("signedIn"), "success");
      updateAccountUI(data.user, data.session);
    } catch (error) {
      console.error("[RPC Auth] verify OTP:", error);
      setStatus(codeStatus, text("invalidCode"), "error");
      resetOtpInputs();
      otpInputs[0]?.focus();
    } finally {
      setBusy(verifyButton, false, text("verifying"), text("verify"));
    }
  }

  async function signOut() {
    if (!client) return;
    if (logoutButton) logoutButton.disabled = true;
    try {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
      updateAccountUI(null, null);
      setStep("email");
      if (emailInput) emailInput.value = "";
      if (nameInput) nameInput.value = "";
      closeModal();
    } catch (error) {
      console.error("[RPC Auth] sign out:", error);
      setStatus($("#rpcAuthAccountStatus"), text("logoutFailed"), "error");
    } finally {
      if (logoutButton) logoutButton.disabled = false;
    }
  }

  function bindOtpInputs() {
    otpInputs.forEach((input, index) => {
      input.addEventListener("input", () => {
        input.value = input.value.replace(/\D/g, "").slice(-1);
        if (input.value && index < otpInputs.length - 1) otpInputs[index + 1].focus();
        if (getOtp().length === 6) verifyButton?.focus();
      });
      input.addEventListener("keydown", event => {
        if (event.key === "Backspace" && !input.value && index > 0) otpInputs[index - 1].focus();
        if (event.key === "ArrowLeft" && index > 0) otpInputs[index - 1].focus();
        if (event.key === "ArrowRight" && index < otpInputs.length - 1) otpInputs[index + 1].focus();
      });
      input.addEventListener("paste", event => {
        const digits = event.clipboardData?.getData("text").replace(/\D/g, "").slice(0, 6) || "";
        if (!digits) return;
        event.preventDefault();
        otpInputs.forEach((field, fieldIndex) => { field.value = digits[fieldIndex] || ""; });
        otpInputs[Math.min(digits.length, 6) - 1]?.focus();
      });
    });
  }

  accountButtons.forEach(button => button.addEventListener("click", openModal));
  $$('[data-rpc-auth-close]').forEach(element => element.addEventListener("click", closeModal));
  modal?.addEventListener("keydown", event => {
    if (event.key === "Escape") closeModal();
  });
  emailForm?.addEventListener("submit", event => { event.preventDefault(); sendCode(); });
  codeForm?.addEventListener("submit", event => { event.preventDefault(); verifyCode(); });
  resendButton?.addEventListener("click", () => sendCode({ resend: true }));
  backButton?.addEventListener("click", () => {
    pendingEmail = "";
    pendingName = "";
    safeStorage(sessionStorage, "removeItem", PENDING_EMAIL_KEY);
    safeStorage(sessionStorage, "removeItem", PENDING_NAME_KEY);
    clearInterval(resendTimer);
    resendTimer = null;
    resendRemaining = 0;
    setStep("email");
    resetOtpInputs();
    setStatus(codeStatus, "");
  });
  logoutButton?.addEventListener("click", signOut);
  bindOtpInputs();

  if (rememberInput) rememberInput.checked = rememberEnabled();
  if (pendingEmail) {
    if (emailInput) emailInput.value = pendingEmail;
    if (nameInput) nameInput.value = pendingName;
    setStep("code");
  } else {
    setStep("email");
  }

  const languageObserver = new MutationObserver(updateStaticLanguage);
  languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  updateStaticLanguage();

  if (!configured()) {
    configWarning?.removeAttribute("hidden");
    if (sendButton) sendButton.disabled = true;
    setStatus(emailStatus, text("setup"), "error");
    console.warn("[RPC Auth] Configure auth-config.js before using email login.");
  } else if (!window.supabase?.createClient) {
    configWarning?.removeAttribute("hidden");
    if (sendButton) sendButton.disabled = true;
    setStatus(emailStatus, text("connectionFailed"), "error");
    console.error("[RPC Auth] Supabase client library was not loaded.");
  } else {
    client = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey, {
      auth: {
        storage: hybridStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    client.auth.onAuthStateChange((_event, session) => {
      updateAccountUI(session?.user || null, session || null);
    });

    client.auth.getSession().then(({ data, error }) => {
      if (error) console.warn("[RPC Auth] session:", error);
      updateAccountUI(data?.session?.user || null, data?.session || null);
    }).catch(error => console.warn("[RPC Auth] session:", error));
  }

  window.RPC_AUTH = {
    version: VERSION,
    get user() { return currentUser; },
    get session() { return currentSession; },
    get client() { return client; },
    open: openModal,
    close: closeModal,
    signOut,
    sendCode,
    verifyCode,
    configured: configured()
  };

  console.info(`[RPC Auth] loaded v${VERSION}`);
})();
