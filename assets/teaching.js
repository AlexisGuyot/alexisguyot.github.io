/* ==========================================================================
   teaching.js — Rendu dynamique des Course Cards depuis data/courses.js
   ========================================================================== */
(function () {
  "use strict";

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }
  function lang() { return (window.AG && window.AG.getLang()) || "fr"; }
  function tr(key) { return (window.AG && window.AG.t(key)) || key; }
  function L(obj) { return obj ? (obj[lang()] || obj.fr || "") : ""; }

  function render() {
    const list = document.getElementById("course-list");
    if (!list || !window.COURSES) return;

    list.innerHTML = window.COURSES.map((c) => {
      const tags = (c.tags || []).map((t) =>
        '<button type="button" class="tag-chip" data-tag="' + esc(t.toLowerCase()) +
        '" data-filter-for="courses">#' + esc(t) + "</button>"
      ).join("");

      const accId = "acc-" + esc(c.id);
      const focus = c.focus
        ? '<button type="button" class="bib-btn mt-4" data-accordion="' + accId + '" aria-expanded="false">' +
            '<span data-i18n="teach.focus">' + esc(tr("teach.focus")) + "</span>" +
            '<svg data-chevron class="h-3.5 w-3.5 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>' +
          "</button>" +
          '<div id="' + accId + '" class="acc-panel"><div>' +
            '<p class="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed dark:bg-night/60">' + esc(L(c.focus)) + "</p>" +
          "</div></div>"
        : "";

      return (
        '<article class="card reveal reveal-in flex flex-col" data-tags="' + esc((c.tags || []).map((t) => t.toLowerCase()).join(",")) + '">' +
          '<p class="eyebrow">' + esc(L(c.level)) + " · " + esc(L(c.institution)) + "</p>" +
          '<h3 class="mt-2 font-display text-lg font-semibold text-ink dark:text-slate-100">' + esc(L(c.title)) + "</h3>" +
          '<p class="mt-2 text-sm leading-relaxed">' + esc(L(c.desc)) + "</p>" +
          '<div class="mt-3 flex flex-wrap items-center gap-2">' + tags +
            (c.github
              ? '<a href="' + esc(c.github) + '" target="_blank" rel="noopener" class="bib-btn ml-auto">' +
                '<svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.17-.02-2.12-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 015.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.27 5.68.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A10.52 10.52 0 0023.5 12C23.5 5.65 18.35.5 12 .5z"/></svg>' +
                '<span data-i18n="common.github">' + esc(tr("common.github")) + "</span> ↗</a>"
              : "") +
          "</div>" + focus +
        "</article>"
      );
    }).join("");

    // Ré-applique le filtre actif après re-rendu (ex : changement de langue)
    if (window.AG) window.AG.applyTagFilter("courses");
  }

  document.addEventListener("ag:ready", render);
  document.addEventListener("ag:langchange", render);
  if (document.readyState === "complete") render();
})();
