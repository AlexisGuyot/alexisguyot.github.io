/* ==========================================================================
   bibtex.js — Parseur BibTeX minimaliste + rendu des publications
   - Charge publications.bib (fetch), avec repli intégré si file://
   - Parse les entrées @type{key, field = {...}}
   - Génère les cartes, les filtres (année / type / tags) et le bouton
     « Citer / BibTeX » (copie de l'entrée brute).
   - Injecte du JSON-LD Schema.org (ScholarlyArticle) pour le SEO.
   Aucune dépendance externe.
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ */
  /* Repli si publications.bib est inaccessible (ouverture en file://)  */
  /* ------------------------------------------------------------------ */
  const FALLBACK_BIB = `
@phdthesis{Guyot2024,
  TITLE = {{Un cadre robuste pour la pr{é}vention d'erreurs dans les workflows d'analyse des data lakes}},
  AUTHOR = {Guyot, Alexis},
  URL = {https://hal.science/tel-05044527},
  NUMBER = {2024UBFCK040},
  PAGES = {71 - 81},
  SCHOOL = {{Universit{é} Bourgogne Franche-Comt{é}}},
  YEAR = {2024},
  MONTH = Nov,
  DOI = {10.70675/ef162f88zededz4cecza95czd734ea2f7945},
  KEYWORDS = {Data Lakes ; Analytical Workflows ; Big Data ; Type Theory ; Category Theory},
  TYPE = {Theses},
  PDF = {https://hal.science/tel-05044527v2/file/136900_GUYOT_2024_archivage.pdf},
  HAL_ID = {tel-05044527},
  HAL_VERSION = {v2},
}
`;

  /* ------------------------------------------------------------------ */
  /* 1. PARSEUR                                                         */
  /* ------------------------------------------------------------------ */
  function parseBibTeX(text) {
    const entries = [];
    let i = 0;
    const n = text.length;

    while (i < n) {
      const at = text.indexOf("@", i);
      if (at === -1) break;

      // Type d'entrée
      let j = at + 1;
      while (j < n && /[a-zA-Z]/.test(text[j])) j++;
      const type = text.slice(at + 1, j).toLowerCase();
      while (j < n && /\s/.test(text[j])) j++;
      if (text[j] !== "{") { i = at + 1; continue; }
      if (type === "comment" || type === "preamble" || type === "string") {
        i = skipBalanced(text, j);
        continue;
      }

      // Clé de citation
      let k = j + 1;
      while (k < n && text[k] !== "," && text[k] !== "}") k++;
      const key = text.slice(j + 1, k).trim();

      // Corps balancé { ... }
      const end = skipBalanced(text, j);
      const body = text.slice(k + 1, end - 1);
      const fields = parseFields(body);

      entries.push({
        type,
        key,
        fields,
        raw: text.slice(at, end).trim(),
      });
      i = end;
    }
    return entries;
  }

  /** Avance depuis une accolade ouvrante jusqu'après son accolade fermante. */
  function skipBalanced(text, openIdx) {
    let depth = 0;
    for (let i = openIdx; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") {
        depth--;
        if (depth === 0) return i + 1;
      }
    }
    return text.length;
  }

  function parseFields(body) {
    const fields = {};
    let i = 0;
    const n = body.length;
    while (i < n) {
      // nom du champ
      while (i < n && /[\s,]/.test(body[i])) i++;
      let start = i;
      while (i < n && /[a-zA-Z_\-]/.test(body[i])) i++;
      const name = body.slice(start, i).toLowerCase();
      if (!name) break;
      while (i < n && /\s/.test(body[i])) i++;
      if (body[i] !== "=") break;
      i++;
      while (i < n && /\s/.test(body[i])) i++;

      // valeur : {…}, "…" ou nombre/mot nu
      let value = "";
      if (body[i] === "{") {
        let depth = 0, j = i;
        for (; j < n; j++) {
          if (body[j] === "{") depth++;
          else if (body[j] === "}") { depth--; if (depth === 0) { j++; break; } }
        }
        value = body.slice(i + 1, j - 1);
        i = j;
      } else if (body[i] === '"') {
        let j = i + 1;
        while (j < n && body[j] !== '"') j++;
        value = body.slice(i + 1, j);
        i = j + 1;
      } else {
        let j = i;
        while (j < n && body[j] !== "," && body[j] !== "\n") j++;
        value = body.slice(i, j).trim();
        i = j;
      }
      fields[name] = cleanLatex(value);
      // jusqu'à la virgule suivante
      while (i < n && body[i] !== ",") i++;
      i++;
    }
    return fields;
  }

  /** Nettoyage léger des accents/commandes LaTeX les plus courants. */
  function cleanLatex(s) {
    return s
      .replace(/\{\\'e\}|\\'e/g, "é").replace(/\{\\'E\}|\\'E/g, "É")
      .replace(/\{\\`e\}|\\`e/g, "è").replace(/\{\\\^e\}|\\\^e/g, "ê")
      .replace(/\{\\'a\}|\\'a/g, "á").replace(/\{\\`a\}|\\`a/g, "à")
      .replace(/\{\\c\{c\}\}|\\c\{c\}/g, "ç")
      .replace(/\\&/g, "&").replace(/[{}]/g, "")
      .replace(/\s+/g, " ").trim();
  }

  function formatAuthors(raw) {
    if (!raw) return "";
    return raw.split(/\s+and\s+/i).map((a) => {
      const parts = a.split(",");
      return parts.length === 2 ? (parts[1].trim() + " " + parts[0].trim()) : a.trim();
    }).join(", ");
  }

  const TYPE_LABELS = {
    fr: { article: "Revue", inproceedings: "Conférence", phdthesis: "Thèse", book: "Ouvrage", incollection: "Chapitre", techreport: "Rapport", misc: "Divers", mastersthesis: "Mémoire" },
    en: { article: "Journal", inproceedings: "Conference", phdthesis: "PhD thesis", book: "Book", incollection: "Chapter", techreport: "Report", misc: "Misc", mastersthesis: "Master thesis" },
  };

  /* ------------------------------------------------------------------ */
  /* 2. ÉTAT + RENDU                                                    */
  /* ------------------------------------------------------------------ */
  const state = { entries: [], year: "", type: "", tag: "" };

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s || "";
    return d.innerHTML;
  }

  function lang() { return (window.AG && window.AG.getLang()) || "fr"; }
  function tr(key) { return (window.AG && window.AG.t(key)) || key; }

  function entryTags(e) {
    return (e.fields.keywords || "").split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  }

  function visibleEntries() {
    return state.entries.filter((e) => {
      if (state.year && e.fields.year !== state.year) return false;
      if (state.type && e.type !== state.type) return false;
      if (state.tag && !entryTags(e).map((t) => t.toLowerCase()).includes(state.tag)) return false;
      return true;
    });
  }

  function render() {
    const list = document.getElementById("pub-list");
    if (!list) return;
    const L = lang();
    const items = visibleEntries().sort((a, b) => (b.fields.year || "").localeCompare(a.fields.year || ""));

    if (!items.length) {
      list.innerHTML = '<p class="text-slate-500 dark:text-slate-400 italic py-6">' + esc(tr("res.pubs.empty")) + "</p>";
      return;
    }

    list.innerHTML = items.map((e) => {
      const venue = e.fields.booktitle || e.fields.journal || e.fields.school || e.fields.publisher || "";
      const typeLabel = (TYPE_LABELS[L] && TYPE_LABELS[L][e.type]) || e.type;
      const tags = entryTags(e).map((t) =>
        '<button type="button" class="tag-chip" data-pub-tag="' + esc(t.toLowerCase()) + '"' +
        (state.tag === t.toLowerCase() ? ' data-active="1"' : "") + ">#" + esc(t) + "</button>"
      ).join("");
      const doi = e.fields.doi
        ? '<a class="pub-doi" href="https://doi.org/' + esc(e.fields.doi) + '" target="_blank" rel="noopener">DOI ↗</a>'
        : "";
      return (
        '<article class="pub-card reveal reveal-in" itemscope itemtype="https://schema.org/ScholarlyArticle">' +
          '<div class="flex flex-wrap items-center gap-2 mb-2">' +
            '<span class="pub-type">' + esc(typeLabel) + "</span>" +
            '<span class="pub-year" itemprop="datePublished">' + esc(e.fields.year || "") + "</span>" +
          "</div>" +
          '<h3 class="font-display text-lg font-semibold leading-snug text-ink dark:text-slate-100" itemprop="headline">' + esc(e.fields.title || e.key) + "</h3>" +
          '<p class="mt-1 text-sm text-slate-600 dark:text-slate-300" itemprop="author">' + esc(formatAuthors(e.fields.author)) + "</p>" +
          (venue ? '<p class="mt-1 text-sm italic text-slate-500 dark:text-slate-400" itemprop="isPartOf">' + esc(venue) + "</p>" : "") +
          '<div class="mt-3 flex flex-wrap items-center gap-2">' + tags + doi +
            '<button type="button" class="bib-btn" data-copy-bibtex="' + esc(e.raw) + '">' +
              '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3"/></svg>' +
              '<span data-copy-label>' + esc(tr("common.cite")) + "</span>" +
            "</button>" +
          "</div>" +
        "</article>"
      );
    }).join("");
  }

  function buildFilters() {
    const yearSel = document.getElementById("pub-filter-year");
    const typeSel = document.getElementById("pub-filter-type");
    if (!yearSel || !typeSel) return;
    const L = lang();
    const all = tr("common.all");

    const years = [...new Set(state.entries.map((e) => e.fields.year).filter(Boolean))].sort().reverse();
    const types = [...new Set(state.entries.map((e) => e.type))];

    yearSel.innerHTML = '<option value="">' + esc(all) + "</option>" +
      years.map((y) => '<option value="' + esc(y) + '"' + (state.year === y ? " selected" : "") + ">" + esc(y) + "</option>").join("");
    typeSel.innerHTML = '<option value="">' + esc(all) + "</option>" +
      types.map((t) => '<option value="' + esc(t) + '"' + (state.type === t ? " selected" : "") + ">" +
        esc((TYPE_LABELS[L] && TYPE_LABELS[L][t]) || t) + "</option>").join("");
  }

  /* ------------------------------------------------------------------ */
  /* 3. SEO — Injection JSON-LD ScholarlyArticle                        */
  /* ------------------------------------------------------------------ */
  function injectJsonLd() {
    const data = state.entries.map((e) => ({
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      headline: e.fields.title || e.key,
      author: (e.fields.author || "").split(/\s+and\s+/i).map((name) => ({ "@type": "Person", name: cleanLatex(name) })),
      datePublished: e.fields.year || undefined,
      isPartOf: e.fields.booktitle || e.fields.journal || undefined,
      identifier: e.fields.doi ? "https://doi.org/" + e.fields.doi : undefined,
    }));
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  /* ------------------------------------------------------------------ */
  /* 4. INITIALISATION                                                  */
  /* ------------------------------------------------------------------ */
  function boot(bibText, fromFallback) {
    state.entries = parseBibTeX(bibText);
    const notice = document.getElementById("pub-notice");
    if (notice) {
      notice.textContent = fromFallback ? tr("res.pubs.error") : "";
      notice.classList.toggle("hidden", !fromFallback);
    }
    buildFilters();
    render();
    injectJsonLd();
  }

  function init() {
    const list = document.getElementById("pub-list");
    if (!list) return; // pas sur cette page

    fetch("publications.bib")
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
      .then((text) => boot(text, false))
      .catch(() => boot(FALLBACK_BIB, true));

    // Filtres select
    document.addEventListener("change", (ev) => {
      if (ev.target.id === "pub-filter-year") { state.year = ev.target.value; render(); }
      if (ev.target.id === "pub-filter-type") { state.type = ev.target.value; render(); }
    });
    // Filtres par tag (délégation)
    document.addEventListener("click", (ev) => {
      const chip = ev.target.closest("[data-pub-tag]");
      if (!chip) return;
      const tag = chip.getAttribute("data-pub-tag");
      state.tag = state.tag === tag ? "" : tag;
      render();
    });
    // Re-rendu si changement de langue (une fois les entrées chargées)
    document.addEventListener("ag:langchange", () => {
      if (state.entries.length) { buildFilters(); render(); }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Exposé pour tests éventuels
  window.AGBib = { parseBibTeX };
})();
