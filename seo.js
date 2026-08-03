"use strict";

/**
 * RPC SEO module.
 * When the production domain changes, update siteUrl here and in
 * robots.txt / sitemap.xml. Hash sections remain part of one canonical page.
 */
(() => {
  const config = {
    version: "9.0.0",
    siteUrl: "https://rpc-order-website.onrender.com",
    siteName: "RPC • RedPad Creator",
    image: "/og-image.png",
    defaultRoute: "home",
    pages: {
      ru: {
        home: {
          title: "RPC • RedPad Creator — VRChat-аватары и миры на заказ",
          description: "Заказ VRChat-аватаров и миров, Udon-систем, оптимизации и Quest-версий от команды RPC • RedPad Creator."
        },
        prices: {
          title: "Цены на VRChat-аватары и миры — RPC",
          description: "Прайс RPC на VRChat-аватары, миры, Quest-портирование, оптимизацию и дополнительные системы."
        },
        works: {
          title: "Работы RPC — портфолио VRChat-проектов",
          description: "Портфолио команды RPC • RedPad Creator: VRChat-аватары, миры, визуальные эффекты и системы."
        },
        reviews: {
          title: "Отзывы клиентов RPC • RedPad Creator",
          description: "Отзывы клиентов о заказах VRChat-аватаров, миров, Quest-версий и оптимизации у команды RPC."
        },
        faq: {
          title: "FAQ по заказам VRChat-проектов — RPC",
          description: "Ответы на частые вопросы о сроках, правках, Quest-версиях, оплате и передаче файлов в RPC."
        },
        order: {
          title: "Заказать VRChat-аватар или мир — RPC",
          description: "Создайте тикет на разработку VRChat-аватара, мира, Quest-версии, оптимизацию или дополнительные системы."
        }
      },
      en: {
        home: {
          title: "RPC • RedPad Creator — VRChat Avatar & World Commissions",
          description: "Commission VRChat avatars, worlds, Udon systems, optimization, and Quest versions from RPC • RedPad Creator."
        },
        prices: {
          title: "VRChat Avatar & World Pricing — RPC",
          description: "RPC pricing for VRChat avatars, worlds, Quest porting, optimization, and additional systems."
        },
        works: {
          title: "RPC Portfolio — VRChat Projects",
          description: "Explore RPC • RedPad Creator projects: VRChat avatars, worlds, visual effects, and systems."
        },
        reviews: {
          title: "RPC • RedPad Creator Client Reviews",
          description: "Client reviews for VRChat avatar, world, Quest porting, and optimization commissions by RPC."
        },
        faq: {
          title: "VRChat Commission FAQ — RPC",
          description: "Answers about timelines, revisions, Quest versions, payment, and project files for RPC commissions."
        },
        order: {
          title: "Commission a VRChat Avatar or World — RPC",
          description: "Create a ticket for a VRChat avatar, world, Quest version, optimization, or custom systems."
        }
      }
    }
  };

  function absolute(path = "/") {
    return new URL(path, `${config.siteUrl}/`).toString();
  }

  function setMeta(selector, attribute, value) {
    const element = document.querySelector(selector);
    if (element && value) element.setAttribute(attribute, value);
  }

  function getRoute() {
    const route = location.hash.replace(/^#/, "").split("?")[0];
    return config.pages.ru[route] ? route : config.defaultRoute;
  }

  function getLanguage() {
    return document.documentElement.lang === "en" ? "en" : "ru";
  }

  function canonicalFor(language) {
    const url = new URL(`${config.siteUrl}/`);
    if (language === "en") url.searchParams.set("lang", "en");
    return url.toString();
  }

  function update({ route = getRoute(), language = getLanguage() } = {}) {
    const safeLanguage = language === "en" ? "en" : "ru";
    const safeRoute = config.pages[safeLanguage][route] ? route : config.defaultRoute;
    const page = config.pages[safeLanguage][safeRoute];
    const canonical = canonicalFor(safeLanguage);
    const locale = safeLanguage === "en" ? "en_US" : "ru_RU";

    document.title = page.title;
    setMeta('meta[name="description"]', "content", page.description);
    setMeta('meta[property="og:title"]', "content", page.title);
    setMeta('meta[property="og:description"]', "content", page.description);
    setMeta('meta[property="og:url"]', "content", canonical);
    setMeta('meta[property="og:locale"]', "content", locale);
    setMeta('meta[name="twitter:title"]', "content", page.title);
    setMeta('meta[name="twitter:description"]', "content", page.description);
    setMeta('link[rel="canonical"]', "href", canonical);

    const structuredPage = document.getElementById("rpc-page-schema");
    if (structuredPage) {
      structuredPage.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: page.title,
        description: page.description,
        isPartOf: { "@id": `${config.siteUrl}/#website` },
        about: { "@id": `${config.siteUrl}/#organization` },
        primaryImageOfPage: { "@id": `${config.siteUrl}/#primaryimage` },
        inLanguage: safeLanguage === "en" ? "en" : "ru"
      });
    }
  }

  window.RPC_SEO = Object.freeze({ version: config.version, update, config });
  console.info(`[RPC SEO] loaded v${config.version}`);
  update();
})();
