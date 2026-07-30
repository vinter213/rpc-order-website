"use strict";

(() => {
  const loadingStages = [
    { at: 0, message: "Проверка ядра RPC", module: "CORE 01/05" },
    { at: 17, message: "Загрузка визуальных ресурсов", module: "VISUAL 02/05" },
    { at: 39, message: "Синхронизация интерфейса", module: "UI 03/05" },
    { at: 63, message: "Подключение защищённых сервисов", module: "NETWORK 04/05" },
    { at: 84, message: "Финальная калибровка", module: "SYSTEM 05/05" },
    { at: 100, message: "Система готова", module: "ONLINE" }
  ];

  function initLoader() {
    const loader = document.getElementById("rpcLoader");
    const bar = document.getElementById("rpcLoaderBar");
    const percent = document.getElementById("rpcLoaderPercent");
    const message = document.getElementById("rpcLoaderMessage");
    const moduleLabel = document.getElementById("rpcLoaderModule");
    const skip = document.getElementById("rpcLoaderSkip");
    const canvas = document.getElementById("rpcLoaderParticles");

    if (!loader || !bar || !percent) {
      document.body.classList.remove("is-loading");
      return;
    }

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const startedAt = performance.now();
    const minimumDuration = reduceMotion ? 500 : 2850;
    let finished = false;
    let progress = 0;
    let progressFrame = 0;
    let particleFrame = 0;
    let resizeTimer = 0;
    let particles = [];
    let ctx = null;
    let width = 0;
    let height = 0;
    let dpr = 1;

    function stageFor(value) {
      let current = loadingStages[0];
      for (const stage of loadingStages) {
        if (value >= stage.at) current = stage;
      }
      return current;
    }

    function renderStage(value) {
      const stage = stageFor(value);
      if (message && message.textContent !== stage.message) {
        message.animate?.(
          [
            { opacity: 0.25, transform: "translateY(4px)" },
            { opacity: 1, transform: "translateY(0)" }
          ],
          { duration: 260, easing: "ease-out" }
        );
        message.textContent = stage.message;
      }
      if (moduleLabel) moduleLabel.textContent = stage.module;
    }

    function resizeCanvas() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx = canvas.getContext("2d", { alpha: true });
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(35, Math.min(90, Math.round((width * height) / 18000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: 0.15 + Math.random() * 0.85,
        size: 0.4 + Math.random() * 1.8,
        speed: 0.08 + Math.random() * 0.3,
        drift: (Math.random() - 0.5) * 0.08,
        phase: Math.random() * Math.PI * 2
      }));
    }

    function drawParticles(time = 0) {
      if (!ctx || !canvas || finished || reduceMotion) return;
      ctx.clearRect(0, 0, width, height);
      const centerX = width * 0.5;
      const centerY = height * 0.57;

      for (const particle of particles) {
        particle.y -= particle.speed * (0.55 + particle.z);
        particle.x += particle.drift + Math.sin(time * 0.00045 + particle.phase) * 0.025;

        if (particle.y < -12) {
          particle.y = height + Math.random() * 40;
          particle.x = Math.random() * width;
        }
        if (particle.x < -10) particle.x = width + 10;
        if (particle.x > width + 10) particle.x = -10;

        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const glow = Math.max(0, 1 - distance / Math.max(width, height));
        const alpha = 0.18 + particle.z * 0.46 + glow * 0.18;
        const radius = particle.size * (0.55 + particle.z);

        ctx.beginPath();
        ctx.fillStyle = `rgba(${155 + Math.round(particle.z * 65)}, ${78 + Math.round(particle.z * 55)}, 255, ${Math.min(0.82, alpha)})`;
        ctx.shadowBlur = 7 + particle.z * 12;
        ctx.shadowColor = "rgba(176, 76, 255, .72)";
        ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      particleFrame = requestAnimationFrame(drawParticles);
    }

    function setParallax(event) {
      if (reduceMotion || finished) return;
      const x = (event.clientX / Math.max(1, window.innerWidth) - 0.5) * 18;
      const y = (event.clientY / Math.max(1, window.innerHeight) - 0.5) * 14;
      loader.style.setProperty("--mx", `${x.toFixed(2)}px`);
      loader.style.setProperty("--my", `${y.toFixed(2)}px`);
    }

    function handleResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 120);
    }

    function cleanup() {
      cancelAnimationFrame(progressFrame);
      cancelAnimationFrame(particleFrame);
      clearTimeout(resizeTimer);
      window.removeEventListener("pointermove", setParallax);
      window.removeEventListener("resize", handleResize);
    }

    function closeLoader() {
      if (finished) return;
      finished = true;
      progress = 100;
      bar.style.width = "100%";
      percent.textContent = "100%";
      renderStage(100);
      loader.classList.add("is-complete");

      setTimeout(() => {
        loader.classList.add("is-hidden");
        document.body.classList.remove("is-loading");
      }, reduceMotion ? 40 : 620);

      setTimeout(() => {
        cleanup();
        loader.remove();
      }, reduceMotion ? 180 : 1500);
    }

    function updateProgress(now) {
      if (finished) return;
      const elapsed = now - startedAt;
      const normalized = Math.min(1, elapsed / minimumDuration);
      const eased = 1 - Math.pow(1 - normalized, 2.35);
      const target = Math.min(96, Math.round(eased * 96));

      progress += Math.max(0.25, (target - progress) * 0.085);
      progress = Math.min(progress, 96);
      const shown = Math.floor(progress);
      bar.style.width = `${progress.toFixed(2)}%`;
      percent.textContent = `${shown}%`;
      renderStage(shown);
      progressFrame = requestAnimationFrame(updateProgress);
    }

    skip?.addEventListener("click", closeLoader);
    window.addEventListener(
      "keydown",
      event => {
        if (event.key === "Enter" || event.key === "Escape") closeLoader();
      },
      { once: true }
    );
    window.addEventListener("pointermove", setParallax, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    if (canvas) {
      resizeCanvas();
      if (!reduceMotion) particleFrame = requestAnimationFrame(drawParticles);
    }

    const loaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise(resolve => window.addEventListener("load", resolve, { once: true }));

    Promise.all([
      loaded,
      new Promise(resolve => setTimeout(resolve, minimumDuration))
    ]).then(closeLoader);

    progressFrame = requestAnimationFrame(updateProgress);
  }

  document.addEventListener("DOMContentLoaded", initLoader, { once: true });
})();
