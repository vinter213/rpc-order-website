"use strict";

(() => {
  const VERSION = "2.0.0";
  const REMEMBER_KEY = "rpc_auth_remember_v2";
  const PENDING_EMAIL_KEY = "rpc_auth_pending_email_v2";
  const PENDING_NAME_KEY = "rpc_auth_pending_name_v2";
  const PENDING_MODE_KEY = "rpc_auth_pending_mode_v2";
  const OAUTH_RETURN_KEY = "rpc_auth_oauth_return_v2";
  const OAUTH_ACTION_KEY = "rpc_auth_oauth_action_v2";
  const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
  const ALLOWED_AVATAR_TYPES = new Map([
    ["image/jpeg", "jpg"],
    ["image/png", "png"],
    ["image/webp", "webp"]
  ]);

  const config = window.RPC_AUTH_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const modal = $("#rpcAuthModal");
  const loggedOutView = $("#rpcAuthLoggedOut");
  const loggedInView = $("#rpcAuthLoggedIn");
  const emailStep = $("#rpcAuthEmailStep");
  const codeStep = $("#rpcAuthCodeStep");
  const emailForm = $("#rpcAuthEmailForm");
  const codeForm = $("#rpcAuthCodeForm");
  const emailInput = $("#rpcAuthEmail");
  const nameInput = $("#rpcAuthName");
  const nameField = $("#rpcAuthNameField");
  const rememberInput = $("#rpcAuthRemember");
  const sendButton = $("#rpcAuthSendCode");
  const verifyButton = $("#rpcAuthVerifyCode");
  const resendButton = $("#rpcAuthResend");
  const backButton = $("#rpcAuthBack");
  const logoutButton = $("#rpcAuthLogout");
  const emailStatus = $("#rpcAuthEmailStatus");
  const codeStatus = $("#rpcAuthCodeStatus");
  const accountStatus = $("#rpcAuthAccountStatus");
  const codeEmail = $("#rpcAuthCodeEmail");
  const intro = $("#rpcAuthIntro");
  const modeHint = $("#rpcAuthModeHint");
  const socialTitle = $("#rpcAuthSocialTitle");
  const configWarning = $("#rpcAuthConfigWarning");
  const otpInputs = $$('[data-rpc-otp]');
  const modeButtons = $$('[data-rpc-auth-mode]');
  const socialLoginButtons = $$('[data-rpc-social-login]');
  const accountButtons = $$('[data-rpc-auth-open]');
  const accountLabels = $$('[data-rpc-auth-label]');
  const accountSubLabels = $$('[data-rpc-auth-subtitle]');
  const miniAvatarImages = $$('[data-rpc-auth-mini-avatar]');
  const miniAvatarFallbacks = $$('[data-rpc-auth-mini-fallback]');

  const accountName = $("#rpcAuthAccountName");
  const accountEmail = $("#rpcAuthAccountEmail");
  const accountId = $("#rpcAuthAccountId");
  const accountCreated = $("#rpcAuthAccountCreated");
  const accountInitials = $("#rpcAuthInitials");
  const accountAvatar = $("#rpcAuthAvatarImage");
  const avatarInput = $("#rpcAuthAvatarInput");
  const avatarChooseButton = $("#rpcAuthAvatarChoose");
  const avatarRemoveButton = $("#rpcAuthAvatarRemove");
  const profileForm = $("#rpcAuthProfileForm");
  const profileNameInput = $("#rpcAuthProfileName");
  const profileSaveButton = $("#rpcAuthProfileSave");
  const linkButtons = $$('[data-rpc-link-provider]');

  const dictionary = {
    ru: {
      openGuest: "Войти",
      openAccount: "Кабинет",
      guestSubtitle: "Вход или регистрация",
      accountSubtitle: "Аккаунт подтверждён",
      title: "Аккаунт RPC",
      loginTab: "Вход",
      registerTab: "Регистрация",
      loginIntro: "Введите почту от существующего аккаунта — мы отправим код для входа.",
      registerIntro: "Создайте аккаунт RPC. На почту придёт одноразовый код подтверждения.",
      loginHint: "Нет аккаунта? Перейдите во вкладку «Регистрация».",
      registerHint: "Аккаунт уже есть? Перейдите во вкладку «Вход».",
      name: "Имя / никнейм",
      namePlaceholder: "Как к вам обращаться",
      email: "Электронная почта",
      emailPlaceholder: "name@example.com",
      remember: "Оставаться в аккаунте на этом устройстве",
      loginSend: "Получить код для входа",
      registerSend: "Создать аккаунт",
      sending: "Отправляем код…",
      codeTitleLogin: "Код для входа",
      codeTitleRegister: "Подтвердите регистрацию",
      codeIntro: "Код отправлен на",
      verifyLogin: "Подтвердить и войти",
      verifyRegister: "Подтвердить и создать аккаунт",
      verifying: "Проверяем код…",
      resend: "Отправить код ещё раз",
      resendIn: "Новый код через {seconds} сек.",
      back: "Назад",
      invalidEmail: "Введите корректный адрес электронной почты.",
      invalidName: "Никнейм должен содержать от 2 до 32 символов.",
      codeSent: "Код отправлен. Проверьте папку «Спам», если письма нет.",
      loginSendFailed: "Не удалось отправить код. Проверьте, что аккаунт существует, либо откройте регистрацию.",
      registerSendFailed: "Не удалось создать аккаунт. Подождите и попробуйте ещё раз.",
      invalidCode: "Неверный или истёкший код. Проверьте цифры и попробуйте ещё раз.",
      sixDigits: "Введите все 6 цифр кода.",
      signedIn: "Вход выполнен.",
      registered: "Аккаунт создан и подтверждён.",
      verified: "Подтверждённый аккаунт",
      logout: "Выйти из аккаунта",
      logoutFailed: "Не удалось завершить сеанс. Перезагрузите страницу.",
      setup: "Регистрация не подключена. Укажите Supabase URL и Publishable Key в auth-config.js.",
      connectionFailed: "Не удалось подключиться к системе аккаунтов.",
      accountSince: "Аккаунт сохранён в RPC",
      close: "Закрыть",
      socialLogin: "Или войдите через",
      socialRegister: "Или зарегистрируйтесь через",
      google: "Google",
      discord: "Discord",
      oauthStarting: "Открываем {provider}…",
      oauthFailed: "Не удалось открыть авторизацию через {provider}.",
      providerSetup: "Провайдер не настроен в Supabase. Проверьте Google/Discord и Redirect URLs.",
      profileTitle: "Личный кабинет",
      profileSubtitle: "Настройте имя, аватар и способы входа.",
      nickname: "Никнейм",
      saveNickname: "Сохранить никнейм",
      saving: "Сохраняем…",
      profileSaved: "Никнейм сохранён.",
      profileSaveFailed: "Не удалось сохранить никнейм.",
      chooseAvatar: "Загрузить аватар",
      changeAvatar: "Сменить аватар",
      removeAvatar: "Удалить",
      avatarHelp: "PNG, JPG или WEBP до 2 МБ.",
      avatarInvalid: "Выберите PNG, JPG или WEBP размером до 2 МБ.",
      avatarUploading: "Загружаем аватар…",
      avatarSaved: "Аватар обновлён.",
      avatarRemoved: "Аватар удалён.",
      avatarFailed: "Не удалось загрузить аватар. Проверьте Storage и RLS.",
      avatarSetup: "Хранилище avatars не настроено. Выполните SUPABASE_ACCOUNT_SETUP.sql.",
      linkedAccounts: "Способы входа",
      linkedAccountsHint: "После привязки можно входить через Google или Discord.",
      emailProvider: "Почта",
      connected: "Привязан",
      connect: "Привязать",
      connecting: "Подключаем…",
      linkSuccess: "Аккаунт {provider} успешно привязан.",
      linkFailed: "Не удалось привязать {provider}.",
      manualLinking: "Включите Manual identity linking в настройках Supabase Auth.",
      accountId: "ID аккаунта",
      createdAt: "Создан",
      unknownDate: "—"
    },
    en: {
      openGuest: "Sign in",
      openAccount: "Dashboard",
      guestSubtitle: "Sign in or register",
      accountSubtitle: "Verified account",
      title: "RPC account",
      loginTab: "Sign in",
      registerTab: "Register",
      loginIntro: "Enter the email of an existing account and we will send a sign-in code.",
      registerIntro: "Create an RPC account. A one-time verification code will be sent by email.",
      loginHint: "No account? Open the Register tab.",
      registerHint: "Already registered? Open the Sign in tab.",
      name: "Name / nickname",
      namePlaceholder: "How should we address you?",
      email: "Email address",
      emailPlaceholder: "name@example.com",
      remember: "Keep me signed in on this device",
      loginSend: "Send sign-in code",
      registerSend: "Create account",
      sending: "Sending code…",
      codeTitleLogin: "Sign-in code",
      codeTitleRegister: "Confirm registration",
      codeIntro: "The code was sent to",
      verifyLogin: "Verify and sign in",
      verifyRegister: "Verify and create account",
      verifying: "Checking code…",
      resend: "Send another code",
      resendIn: "New code in {seconds} sec.",
      back: "Back",
      invalidEmail: "Enter a valid email address.",
      invalidName: "Nickname must be between 2 and 32 characters.",
      codeSent: "Code sent. Check Spam if the email is missing.",
      loginSendFailed: "Could not send a code. Check that the account exists or open registration.",
      registerSendFailed: "Could not create the account. Wait and try again.",
      invalidCode: "The code is invalid or expired. Check the digits and try again.",
      sixDigits: "Enter all 6 digits.",
      signedIn: "Signed in successfully.",
      registered: "Account created and verified.",
      verified: "Verified account",
      logout: "Sign out",
      logoutFailed: "Could not end the session. Reload the page.",
      setup: "Accounts are not connected. Add the Supabase URL and Publishable Key to auth-config.js.",
      connectionFailed: "Could not connect to the account service.",
      accountSince: "Account saved in RPC",
      close: "Close",
      socialLogin: "Or sign in with",
      socialRegister: "Or register with",
      google: "Google",
      discord: "Discord",
      oauthStarting: "Opening {provider}…",
      oauthFailed: "Could not start {provider} authorization.",
      providerSetup: "The provider is not configured in Supabase. Check Google/Discord and Redirect URLs.",
      profileTitle: "Account dashboard",
      profileSubtitle: "Manage your nickname, avatar, and sign-in methods.",
      nickname: "Nickname",
      saveNickname: "Save nickname",
      saving: "Saving…",
      profileSaved: "Nickname saved.",
      profileSaveFailed: "Could not save the nickname.",
      chooseAvatar: "Upload avatar",
      changeAvatar: "Change avatar",
      removeAvatar: "Remove",
      avatarHelp: "PNG, JPG, or WEBP up to 2 MB.",
      avatarInvalid: "Choose a PNG, JPG, or WEBP file up to 2 MB.",
      avatarUploading: "Uploading avatar…",
      avatarSaved: "Avatar updated.",
      avatarRemoved: "Avatar removed.",
      avatarFailed: "Could not upload the avatar. Check Storage and RLS.",
      avatarSetup: "The avatars bucket is not configured. Run SUPABASE_ACCOUNT_SETUP.sql.",
      linkedAccounts: "Sign-in methods",
      linkedAccountsHint: "After linking, you can sign in with Google or Discord.",
      emailProvider: "Email",
      connected: "Linked",
      connect: "Link",
      connecting: "Connecting…",
      linkSuccess: "{provider} has been linked.",
      linkFailed: "Could not link {provider}.",
      manualLinking: "Enable Manual identity linking in Supabase Auth settings.",
      accountId: "Account ID",
      createdAt: "Created",
      unknownDate: "—"
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
  let currentIdentities = [];
  let currentMode = safeStorage(sessionStorage, "getItem", PENDING_MODE_KEY) === "register" ? "register" : "login";
  let pendingEmail = safeStorage(sessionStorage, "getItem", PENDING_EMAIL_KEY) || "";
  let pendingName = safeStorage(sessionStorage, "getItem", PENDING_NAME_KEY) || "";
  let resendTimer = null;
  let resendRemaining = 0;

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validName(value) {
    const length = [...String(value || "").trim()].length;
    return length >= 2 && length <= 32;
  }

  function displayNameFor(user) {
    const metadata = user?.user_metadata || {};
    return String(
      metadata.display_name
      || metadata.full_name
      || metadata.name
      || user?.email?.split("@")[0]
      || "RPC User"
    ).trim();
  }

  function avatarUrlFor(user) {
    const metadata = user?.user_metadata || {};
    return String(metadata.rpc_avatar_url || metadata.avatar_url || metadata.picture || "").trim();
  }

  function avatarPathFor(user) {
    return String(user?.user_metadata?.rpc_avatar_path || "").trim();
  }

  function initialsFor(user) {
    const name = displayNameFor(user) || "RPC";
    const chunks = name.split(/\s+/).filter(Boolean);
    return (chunks.length > 1 ? `${chunks[0][0]}${chunks[1][0]}` : name.slice(0, 2)).toUpperCase();
  }

  function providerLabel(provider) {
    return provider === "google" ? text("google") : provider === "discord" ? text("discord") : provider;
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

  function dateLabel(value) {
    if (!value) return text("unknownDate");
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return text("unknownDate");
    return new Intl.DateTimeFormat(language() === "en" ? "en-US" : "ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
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
    modeButtons.forEach(button => { button.disabled = isCode; });
    if (isCode) {
      if (codeEmail) codeEmail.textContent = pendingEmail;
      requestAnimationFrame(() => otpInputs[0]?.focus());
    } else {
      requestAnimationFrame(() => currentMode === "register" ? nameInput?.focus() : emailInput?.focus());
    }
    updateDynamicCopy();
  }

  function setMode(mode, { clear = true } = {}) {
    currentMode = mode === "register" ? "register" : "login";
    safeStorage(sessionStorage, "setItem", PENDING_MODE_KEY, currentMode);
    modeButtons.forEach(button => {
      const active = button.dataset.rpcAuthMode === currentMode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
    });
    nameField?.toggleAttribute("hidden", currentMode !== "register");
    if (clear) setStatus(emailStatus, "");
    updateDynamicCopy();
  }

  function updateDynamicCopy() {
    if (intro) intro.textContent = text(currentMode === "register" ? "registerIntro" : "loginIntro");
    if (modeHint) modeHint.textContent = text(currentMode === "register" ? "registerHint" : "loginHint");
    if (socialTitle) socialTitle.textContent = text(currentMode === "register" ? "socialRegister" : "socialLogin");
    if (sendButton && !sendButton.disabled) sendButton.textContent = text(currentMode === "register" ? "registerSend" : "loginSend");
    if (verifyButton && !verifyButton.disabled) verifyButton.textContent = text(currentMode === "register" ? "verifyRegister" : "verifyLogin");
    const codeTitle = $("#rpcAuthCodeTitle");
    if (codeTitle) codeTitle.textContent = text(currentMode === "register" ? "codeTitleRegister" : "codeTitleLogin");
    socialLoginButtons.forEach(button => {
      const provider = button.dataset.rpcSocialLogin;
      const label = button.querySelector("b");
      if (label) label.textContent = providerLabel(provider);
    });
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
    if (resendRemaining > 0 && resendButton) resendButton.textContent = text("resendIn", { seconds: resendRemaining });
    else if (resendButton) resendButton.textContent = text("resend");
    updateDynamicCopy();
    renderProviderStatuses();
    if (currentUser) {
      if (accountCreated) accountCreated.textContent = dateLabel(currentUser.created_at);
      if (avatarChooseButton) avatarChooseButton.textContent = avatarUrlFor(currentUser) ? text("changeAvatar") : text("chooseAvatar");
    }
  }

  function renderAvatar(user) {
    const url = avatarUrlFor(user);
    const initials = initialsFor(user);
    if (accountInitials) {
      accountInitials.textContent = initials;
      accountInitials.hidden = Boolean(url);
    }
    if (accountAvatar) {
      accountAvatar.hidden = !url;
      if (url) accountAvatar.src = url;
      else accountAvatar.removeAttribute("src");
    }
    miniAvatarImages.forEach(image => {
      image.hidden = !url;
      if (url) image.src = url;
      else image.removeAttribute("src");
    });
    miniAvatarFallbacks.forEach(fallback => {
      fallback.hidden = Boolean(url);
      fallback.textContent = user ? initials : "◎";
    });
  }

  function renderProviderStatuses() {
    const providers = new Set(currentIdentities.map(identity => identity.provider));
    if (currentUser?.email) providers.add("email");
    $$('[data-rpc-provider-row]').forEach(row => {
      const provider = row.dataset.rpcProviderRow;
      const connected = providers.has(provider);
      row.classList.toggle("connected", connected);
      const status = row.querySelector('[data-rpc-provider-status]');
      if (status) status.textContent = connected ? text("connected") : text("connect");
      const button = row.querySelector('[data-rpc-link-provider]');
      if (button) {
        button.disabled = connected;
        button.textContent = connected ? text("connected") : text("connect");
      }
    });
  }

  async function refreshIdentities() {
    if (!client || !currentUser) {
      currentIdentities = [];
      renderProviderStatuses();
      return;
    }
    try {
      const { data, error } = await client.auth.getUserIdentities();
      if (error) throw error;
      currentIdentities = data?.identities || currentUser.identities || [];
    } catch (error) {
      console.warn("[RPC Auth] identities:", error);
      currentIdentities = currentUser.identities || [];
    }
    renderProviderStatuses();
  }

  function updateAccountUI(user, session = currentSession) {
    currentUser = user || null;
    currentSession = session || null;
    loggedOutView?.toggleAttribute("hidden", Boolean(currentUser));
    loggedInView?.toggleAttribute("hidden", !currentUser);
    document.body.classList.toggle("rpc-account-active", Boolean(currentUser));

    if (currentUser) {
      const name = displayNameFor(currentUser);
      if (accountName) accountName.textContent = name;
      if (accountEmail) accountEmail.textContent = currentUser.email || "";
      if (accountId) accountId.textContent = currentUser.id || "";
      if (accountCreated) accountCreated.textContent = dateLabel(currentUser.created_at);
      if (profileNameInput) profileNameInput.value = name;
      if (avatarChooseButton) avatarChooseButton.textContent = avatarUrlFor(currentUser) ? text("changeAvatar") : text("chooseAvatar");
      if (avatarRemoveButton) avatarRemoveButton.hidden = !avatarUrlFor(currentUser);
      accountButtons.forEach(button => button.classList.add("is-authenticated"));
      renderAvatar(currentUser);
      const orderName = $("#clientName");
      const reviewName = $("#reviewForm input[name='name']");
      if (orderName && !orderName.value.trim()) orderName.value = name;
      if (reviewName && !reviewName.value.trim()) reviewName.value = name;
      setTimeout(refreshIdentities, 0);
    } else {
      accountButtons.forEach(button => button.classList.remove("is-authenticated"));
      currentIdentities = [];
      renderAvatar(null);
      renderProviderStatuses();
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
      if (currentUser) profileNameInput?.focus();
      else if (pendingEmail) otpInputs[0]?.focus();
      else if (currentMode === "register") nameInput?.focus();
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

  async function sendCode({ resend = false } = {}) {
    if (!client) {
      setStatus(emailStatus, text("setup"), "error");
      return false;
    }

    const mode = resend ? (safeStorage(sessionStorage, "getItem", PENDING_MODE_KEY) || currentMode) : currentMode;
    const email = resend ? pendingEmail : normalizeEmail(emailInput?.value);
    const name = resend ? pendingName : String(nameInput?.value || "").trim().slice(0, 32);

    if (!validEmail(email)) {
      setStatus(emailStatus, text("invalidEmail"), "error");
      emailInput?.focus();
      return false;
    }
    if (mode === "register" && !validName(name)) {
      setStatus(emailStatus, text("invalidName"), "error");
      nameInput?.focus();
      return false;
    }

    const remember = Boolean(rememberInput?.checked);
    safeStorage(localStorage, "setItem", REMEMBER_KEY, remember ? "1" : "0");
    pendingEmail = email;
    pendingName = mode === "register" ? name : "";
    currentMode = mode === "register" ? "register" : "login";
    safeStorage(sessionStorage, "setItem", PENDING_EMAIL_KEY, pendingEmail);
    safeStorage(sessionStorage, "setItem", PENDING_NAME_KEY, pendingName);
    safeStorage(sessionStorage, "setItem", PENDING_MODE_KEY, currentMode);

    setBusy(sendButton, true, text("sending"), text(currentMode === "register" ? "registerSend" : "loginSend"));
    setStatus(emailStatus, "");
    setStatus(codeStatus, "");

    try {
      const options = { shouldCreateUser: currentMode === "register" };
      if (currentMode === "register" && pendingName) options.data = { display_name: pendingName };
      const { error } = await client.auth.signInWithOtp({ email, options });
      if (error) throw error;
      setStep("code");
      resetOtpInputs();
      setStatus(codeStatus, text("codeSent"), "success");
      startResendCountdown();
      return true;
    } catch (error) {
      console.error("[RPC Auth] send OTP:", error);
      const isRateLimit = /rate|seconds|limit/i.test(String(error?.message || ""));
      const message = isRateLimit
        ? String(error.message)
        : text(currentMode === "register" ? "registerSendFailed" : "loginSendFailed");
      setStatus(resend ? codeStatus : emailStatus, message, "error");
      return false;
    } finally {
      setBusy(sendButton, false, text("sending"), text(currentMode === "register" ? "registerSend" : "loginSend"));
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

    setBusy(verifyButton, true, text("verifying"), text(currentMode === "register" ? "verifyRegister" : "verifyLogin"));
    setStatus(codeStatus, "");
    try {
      const { data, error } = await client.auth.verifyOtp({
        email: pendingEmail,
        token,
        type: "email"
      });
      if (error) throw error;

      if (currentMode === "register" && pendingName && data.user?.user_metadata?.display_name !== pendingName) {
        const { data: updated, error: updateError } = await client.auth.updateUser({
          data: { display_name: pendingName }
        });
        if (!updateError && updated.user) data.user = updated.user;
      }

      const successMessage = text(currentMode === "register" ? "registered" : "signedIn");
      clearPendingAuth();
      resetOtpInputs();
      setStatus(codeStatus, successMessage, "success");
      updateAccountUI(data.user, data.session);
    } catch (error) {
      console.error("[RPC Auth] verify OTP:", error);
      setStatus(codeStatus, text("invalidCode"), "error");
      resetOtpInputs();
      otpInputs[0]?.focus();
    } finally {
      setBusy(verifyButton, false, text("verifying"), text(currentMode === "register" ? "verifyRegister" : "verifyLogin"));
    }
  }

  function clearPendingAuth() {
    safeStorage(sessionStorage, "removeItem", PENDING_EMAIL_KEY);
    safeStorage(sessionStorage, "removeItem", PENDING_NAME_KEY);
    pendingEmail = "";
    pendingName = "";
    clearInterval(resendTimer);
    resendTimer = null;
    resendRemaining = 0;
  }

  function oauthRedirectUrl() {
    const custom = String(config.oauthRedirectUrl || "").trim();
    if (/^https?:\/\//i.test(custom)) return custom;
    return `${location.origin}${location.pathname}`;
  }

  function rememberOAuthReturn(action) {
    const route = /^#[a-z0-9_-]+$/i.test(location.hash) ? location.hash : "#home";
    safeStorage(sessionStorage, "setItem", OAUTH_RETURN_KEY, route);
    safeStorage(sessionStorage, "setItem", OAUTH_ACTION_KEY, action);
  }

  function finishOAuthReturn() {
    const action = safeStorage(sessionStorage, "getItem", OAUTH_ACTION_KEY) || "";
    const returnRoute = safeStorage(sessionStorage, "getItem", OAUTH_RETURN_KEY) || "#home";
    const fragment = new URLSearchParams(location.hash.replace(/^#/, ""));
    const oauthError = fragment.get("error_description") || fragment.get("error");
    const hasAuthFragment = /(?:access_token|refresh_token|error_description|provider_token)=/i.test(location.hash);
    if (hasAuthFragment) {
      setTimeout(() => {
        const cleanUrl = `${location.pathname}${location.search}${returnRoute}`;
        history.replaceState(null, "", cleanUrl);
      }, 0);
    }
    if (action.startsWith("link:")) {
      const provider = action.split(":")[1];
      setStatus(
        accountStatus,
        oauthError
          ? text("linkFailed", { provider: providerLabel(provider) })
          : text("linkSuccess", { provider: providerLabel(provider) }),
        oauthError ? "error" : "success"
      );
      openModal();
    } else if (action.startsWith("signin:") && oauthError) {
      setStatus(emailStatus, text("oauthFailed", { provider: providerLabel(action.split(":")[1]) }), "error");
      openModal();
    }
    safeStorage(sessionStorage, "removeItem", OAUTH_ACTION_KEY);
    safeStorage(sessionStorage, "removeItem", OAUTH_RETURN_KEY);
  }

  async function signInWithProvider(provider) {
    if (!client) return;
    const button = socialLoginButtons.find(item => item.dataset.rpcSocialLogin === provider);
    if (button) button.disabled = true;
    setStatus(emailStatus, text("oauthStarting", { provider: providerLabel(provider) }));
    safeStorage(localStorage, "setItem", REMEMBER_KEY, rememberInput?.checked ? "1" : "0");
    rememberOAuthReturn(`signin:${provider}`);
    try {
      const { data, error } = await client.auth.signInWithOAuth({
        provider,
        options: { redirectTo: oauthRedirectUrl() }
      });
      if (error) throw error;
      if (data?.url) location.assign(data.url);
    } catch (error) {
      console.error(`[RPC Auth] OAuth ${provider}:`, error);
      const message = /provider|unsupported|enabled|redirect/i.test(String(error?.message || ""))
        ? text("providerSetup")
        : text("oauthFailed", { provider: providerLabel(provider) });
      setStatus(emailStatus, message, "error");
      safeStorage(sessionStorage, "removeItem", OAUTH_ACTION_KEY);
      safeStorage(sessionStorage, "removeItem", OAUTH_RETURN_KEY);
      if (button) button.disabled = false;
    }
  }

  async function linkProvider(provider) {
    if (!client || !currentUser) return;
    const button = linkButtons.find(item => item.dataset.rpcLinkProvider === provider);
    if (button) {
      button.disabled = true;
      button.textContent = text("connecting");
    }
    setStatus(accountStatus, text("oauthStarting", { provider: providerLabel(provider) }));
    rememberOAuthReturn(`link:${provider}`);
    try {
      const { data, error } = await client.auth.linkIdentity({
        provider,
        options: { redirectTo: oauthRedirectUrl() }
      });
      if (error) throw error;
      if (data?.url) location.assign(data.url);
    } catch (error) {
      console.error(`[RPC Auth] link ${provider}:`, error);
      const raw = String(error?.message || "");
      const message = /manual|linking|disabled/i.test(raw)
        ? text("manualLinking")
        : /provider|unsupported|enabled|redirect/i.test(raw)
          ? text("providerSetup")
          : text("linkFailed", { provider: providerLabel(provider) });
      setStatus(accountStatus, message, "error");
      safeStorage(sessionStorage, "removeItem", OAUTH_ACTION_KEY);
      safeStorage(sessionStorage, "removeItem", OAUTH_RETURN_KEY);
      if (button) {
        button.disabled = false;
        button.textContent = text("connect");
      }
    }
  }

  async function saveProfile(event) {
    event?.preventDefault();
    if (!client || !currentUser) return;
    const nickname = String(profileNameInput?.value || "").trim().slice(0, 32);
    if (!validName(nickname)) {
      setStatus(accountStatus, text("invalidName"), "error");
      profileNameInput?.focus();
      return;
    }
    setBusy(profileSaveButton, true, text("saving"), text("saveNickname"));
    setStatus(accountStatus, "");
    try {
      const { data, error } = await client.auth.updateUser({ data: { display_name: nickname } });
      if (error) throw error;
      updateAccountUI(data.user, currentSession);
      setStatus(accountStatus, text("profileSaved"), "success");
    } catch (error) {
      console.error("[RPC Auth] update profile:", error);
      setStatus(accountStatus, text("profileSaveFailed"), "error");
    } finally {
      setBusy(profileSaveButton, false, text("saving"), text("saveNickname"));
    }
  }

  async function uploadAvatar(file) {
    if (!client || !currentUser || !file) return;
    const extension = ALLOWED_AVATAR_TYPES.get(file.type);
    if (!extension || file.size <= 0 || file.size > MAX_AVATAR_BYTES) {
      setStatus(accountStatus, text("avatarInvalid"), "error");
      if (avatarInput) avatarInput.value = "";
      return;
    }

    const bucket = String(config.avatarBucket || "avatars");
    const path = `${currentUser.id}/avatar-${Date.now()}.${extension}`;
    const previousPath = avatarPathFor(currentUser);
    if (avatarChooseButton) avatarChooseButton.disabled = true;
    if (avatarRemoveButton) avatarRemoveButton.disabled = true;
    setStatus(accountStatus, text("avatarUploading"));

    try {
      const { error: uploadError } = await client.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false
      });
      if (uploadError) throw uploadError;

      const { data: publicData } = client.storage.from(bucket).getPublicUrl(path);
      const publicUrl = publicData?.publicUrl;
      if (!publicUrl) throw new Error("Public avatar URL was not created");

      const { data, error: userError } = await client.auth.updateUser({
        data: { rpc_avatar_url: publicUrl, rpc_avatar_path: path }
      });
      if (userError) {
        await client.storage.from(bucket).remove([path]);
        throw userError;
      }

      if (previousPath && previousPath !== path) {
        client.storage.from(bucket).remove([previousPath]).catch(error => {
          console.warn("[RPC Auth] old avatar cleanup:", error);
        });
      }

      updateAccountUI(data.user, currentSession);
      setStatus(accountStatus, text("avatarSaved"), "success");
    } catch (error) {
      console.error("[RPC Auth] avatar upload:", error);
      const raw = String(error?.message || "");
      setStatus(accountStatus, /bucket|row-level|policy|not found|permission|unauthorized/i.test(raw)
        ? text("avatarSetup")
        : text("avatarFailed"), "error");
    } finally {
      if (avatarChooseButton) avatarChooseButton.disabled = false;
      if (avatarRemoveButton) avatarRemoveButton.disabled = false;
      if (avatarInput) avatarInput.value = "";
    }
  }

  async function removeAvatar() {
    if (!client || !currentUser) return;
    const bucket = String(config.avatarBucket || "avatars");
    const previousPath = avatarPathFor(currentUser);
    if (avatarRemoveButton) avatarRemoveButton.disabled = true;
    setStatus(accountStatus, "");
    try {
      const { data, error } = await client.auth.updateUser({
        data: { rpc_avatar_url: null, rpc_avatar_path: null }
      });
      if (error) throw error;
      if (previousPath) {
        const { error: removeError } = await client.storage.from(bucket).remove([previousPath]);
        if (removeError) console.warn("[RPC Auth] avatar remove object:", removeError);
      }
      updateAccountUI(data.user, currentSession);
      setStatus(accountStatus, text("avatarRemoved"), "success");
    } catch (error) {
      console.error("[RPC Auth] avatar remove:", error);
      setStatus(accountStatus, text("avatarFailed"), "error");
    } finally {
      if (avatarRemoveButton) avatarRemoveButton.disabled = false;
    }
  }

  async function signOut() {
    if (!client) return;
    if (logoutButton) logoutButton.disabled = true;
    try {
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
      updateAccountUI(null, null);
      clearPendingAuth();
      setMode("login");
      setStep("email");
      if (emailInput) emailInput.value = "";
      if (nameInput) nameInput.value = "";
      closeModal();
    } catch (error) {
      console.error("[RPC Auth] sign out:", error);
      setStatus(accountStatus, text("logoutFailed"), "error");
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
  modal?.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });
  modeButtons.forEach(button => button.addEventListener("click", () => setMode(button.dataset.rpcAuthMode)));
  emailForm?.addEventListener("submit", event => { event.preventDefault(); sendCode(); });
  codeForm?.addEventListener("submit", event => { event.preventDefault(); verifyCode(); });
  resendButton?.addEventListener("click", () => sendCode({ resend: true }));
  backButton?.addEventListener("click", () => {
    clearPendingAuth();
    setStep("email");
    resetOtpInputs();
    setStatus(codeStatus, "");
  });
  socialLoginButtons.forEach(button => button.addEventListener("click", () => signInWithProvider(button.dataset.rpcSocialLogin)));
  linkButtons.forEach(button => button.addEventListener("click", () => linkProvider(button.dataset.rpcLinkProvider)));
  profileForm?.addEventListener("submit", saveProfile);
  avatarChooseButton?.addEventListener("click", () => avatarInput?.click());
  avatarInput?.addEventListener("change", () => uploadAvatar(avatarInput.files?.[0]));
  avatarRemoveButton?.addEventListener("click", removeAvatar);
  logoutButton?.addEventListener("click", signOut);
  bindOtpInputs();

  if (rememberInput) rememberInput.checked = rememberEnabled();
  setMode(currentMode, { clear: false });
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
    socialLoginButtons.forEach(button => { button.disabled = true; });
    setStatus(emailStatus, text("setup"), "error");
    console.warn("[RPC Auth] Configure auth-config.js before using accounts.");
  } else if (!window.supabase?.createClient) {
    configWarning?.removeAttribute("hidden");
    if (sendButton) sendButton.disabled = true;
    socialLoginButtons.forEach(button => { button.disabled = true; });
    setStatus(emailStatus, text("connectionFailed"), "error");
    console.error("[RPC Auth] Supabase client library was not loaded.");
  } else {
    client = window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey, {
      auth: {
        storage: hybridStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "implicit"
      }
    });

    client.auth.onAuthStateChange((event, session) => {
      setTimeout(() => {
        updateAccountUI(session?.user || null, session || null);
        if (["SIGNED_IN", "USER_UPDATED", "INITIAL_SESSION"].includes(event)) finishOAuthReturn();
      }, 0);
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
    signInWithProvider,
    linkProvider,
    uploadAvatar,
    saveProfile,
    configured: configured()
  };

  console.info(`[RPC Auth] loaded v${VERSION}`);
})();
