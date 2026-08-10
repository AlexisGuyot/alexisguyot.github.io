/* ==========================================================================
   app.js — Site d'Alexis Guyot
   Gère : thème clair/sombre, langue FR/EN, filtres par tags,
   copie BibTeX, accordéons, navigation mobile, animations d'apparition.
   Aucune dépendance. 100% statique.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* 1. THÈME (clair / sombre)                                          */
  /* Le pré-init anti-flash est inliné dans le <head> de chaque page.   */
  /* ------------------------------------------------------------------ */
  const THEME_KEY = "ag-theme";

  function currentTheme() {
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  }

  function applyTheme(theme) {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    });
  }

  function initTheme() {
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        applyTheme(currentTheme() === "dark" ? "light" : "dark");
      });
    });
    // Suit la préférence système tant que l'utilisateur n'a rien choisi.
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* 2. LANGUE (FR / EN) — dictionnaire dans assets/i18n.js             */
  /* ------------------------------------------------------------------ */
  const LANG_KEY = "ag-lang";

  function getLang() {
    return localStorage.getItem(LANG_KEY) || "fr";
  }

  function t(key, lang) {
    lang = lang || getLang();
    const dict = (window.I18N && window.I18N[lang]) || {};
    return dict[key];
  }

  function applyLang(lang) {
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute("lang", lang);

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const val = t(el.getAttribute("data-i18n"), lang);
      if (val !== undefined) el.textContent = val;
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const val = t(el.getAttribute("data-i18n-html"), lang);
      if (val !== undefined) el.innerHTML = val;
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const val = t(el.getAttribute("data-i18n-placeholder"), lang);
      if (val !== undefined) el.setAttribute("placeholder", val);
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const val = t(el.getAttribute("data-i18n-aria"), lang);
      if (val !== undefined) el.setAttribute("aria-label", val);
    });

    // État visuel du switch FR/EN
    document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
      const active = btn.getAttribute("data-lang-switch") === lang;
      btn.classList.toggle("lang-active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    // Certains rendus dynamiques (cours, publications) dépendent de la langue.
    document.dispatchEvent(new CustomEvent("ag:langchange", { detail: { lang } }));
  }

  function initLang() {
    document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
      btn.addEventListener("click", () => applyLang(btn.getAttribute("data-lang-switch")));
    });
    applyLang(getLang());
  }

  /* ------------------------------------------------------------------ */
  /* 3. FILTRAGE PAR TAGS                                               */
  /* Une grille : [data-filter-grid="nom"]                              */
  /* Ses cartes : [data-tags="tag1,tag2"]                               */
  /* Les boutons : [data-tag="tag1"][data-filter-for="nom"]             */
  /* Cliquer sur un tag actif le désactive (retour à "tout").           */
  /* ------------------------------------------------------------------ */
  const activeTagByGrid = {};

  function applyTagFilter(gridName) {
    const grid = document.querySelector('[data-filter-grid="' + gridName + '"]');
    if (!grid) return;
    const active = activeTagByGrid[gridName] || null;

    grid.querySelectorAll("[data-tags]").forEach((card) => {
      const tags = (card.getAttribute("data-tags") || "")
        .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      const show = !active || tags.includes(active);
      if (show) {
        card.classList.remove("card-hidden");
        card.removeAttribute("aria-hidden");
      } else {
        card.classList.add("card-hidden");
        card.setAttribute("aria-hidden", "true");
      }
    });

    document.querySelectorAll('[data-filter-for="' + gridName + '"]').forEach((btn) => {
      const isActive = btn.getAttribute("data-tag").toLowerCase() === active;
      btn.classList.toggle("tag-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function initTagFilters() {
    document.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-tag][data-filter-for]");
      if (!btn) return;
      const gridName = btn.getAttribute("data-filter-for");
      const tag = btn.getAttribute("data-tag").toLowerCase();
      activeTagByGrid[gridName] = activeTagByGrid[gridName] === tag ? null : tag;
      applyTagFilter(gridName);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. PRESSE-PAPIER (bouton « Citer / BibTeX »)                       */
  /* ------------------------------------------------------------------ */
  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Repli pour file:// ou vieux navigateurs
    return new Promise((resolve, reject) => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy") ? resolve() : reject();
      } catch (e) {
        reject(e);
      } finally {
        ta.remove();
      }
    });
  }

  function flashCopied(btn) {
    const label = btn.querySelector("[data-copy-label]") || btn;
    const original = label.textContent;
    label.textContent = t("common.copied") || "Copié !";
    btn.classList.add("copy-ok");
    setTimeout(() => {
      label.textContent = original;
      btn.classList.remove("copy-ok");
    }, 1600);
  }

  function initClipboard() {
    document.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-copy-bibtex]");
      if (!btn) return;
      copyToClipboard(btn.getAttribute("data-copy-bibtex"))
        .then(() => flashCopied(btn))
        .catch(() => alert("Copie impossible dans ce contexte."));
    });
  }

  /* ------------------------------------------------------------------ */
  /* 5. ACCORDÉONS (déroulé pédagogique, etc.)                          */
  /* Bouton [data-accordion="idCible"] → bascule #idCible               */
  /* ------------------------------------------------------------------ */
  function initAccordions() {
    document.addEventListener("click", (ev) => {
      const btn = ev.target.closest("[data-accordion]");
      if (!btn) return;
      const panel = document.getElementById(btn.getAttribute("data-accordion"));
      if (!panel) return;
      const open = panel.classList.toggle("acc-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      const chev = btn.querySelector("[data-chevron]");
      if (chev) chev.classList.toggle("rotate-180", open);
    });
  }

  /* ------------------------------------------------------------------ */
  /* 6. NAVIGATION MOBILE + lien actif                                  */
  /* ------------------------------------------------------------------ */
  function initNav() {
    const burger = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-nav-menu]");
    if (burger && menu) {
      burger.addEventListener("click", () => {
        const open = menu.classList.toggle("nav-open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }
    // Lien actif selon le fichier courant
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll("[data-nav-link]").forEach((a) => {
      if ((a.getAttribute("href") || "").toLowerCase() === path) {
        a.classList.add("nav-active");
        a.setAttribute("aria-current", "page");
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /* 7. APPARITION AU DÉFILEMENT (respecte prefers-reduced-motion)      */
  /* ------------------------------------------------------------------ */
  function initReveal() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("reveal-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("reveal-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------ */
  /* Initialisation                                                     */
  /* ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initLang();
    initTagFilters();
    initClipboard();
    initAccordions();
    initNav();
    initReveal();
    document.dispatchEvent(new CustomEvent("ag:ready"));
  });

  // Petites API exposées aux autres scripts (bibtex.js, teaching)
  window.AG = { t, getLang, applyTagFilter, activeTagByGrid, initReveal };
})();
