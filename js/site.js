(function () {
  const C = window.SITE_CONFIG;
  const $ = (s, r = document) => r.querySelector(s);
  const app = $("#app");
  let D = null;

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const paras = (arr) => (arr || []).map((p, i) => `<p class="rv" style="--i:${i}">${esc(p)}</p>`).join("");
  const safeSrc = (u) => (/^(https?:\/\/|assets\/|\/)/.test(u || "") ? u : "");
  const safeLink = (u) => (/^https?:\/\//.test(u || "") ? u : "");
  const slug = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const isArr = Array.isArray;

  /* ---------- données ---------- */
  async function loadContent() {
    const base = JSON.parse(JSON.stringify(window.DEFAULT_CONTENT));
    try {
      const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY);
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 5000));
      const { data, error } = await Promise.race([sb.from("site_content").select("data").eq("id", C.CONTENT_ID).maybeSingle(), timeout]);
      if (!error && data && data.data) {
        const saved = data.data;
        for (const k of Object.keys(saved)) {
          // anciennes données : relations était un objet, c'est maintenant une liste
          if (isArr(base[k]) !== isArr(saved[k])) continue;
          base[k] = saved[k];
        }
      }
    } catch (e) { /* hors-ligne ou table absente : contenu par défaut */ }
    return base;
  }

  /* ---------- appréciations ---------- */
  const HR = '<b class="h r">♥</b>', HG = '<b class="h g">♥</b>';
  const APP = {
    pos1: { g: "pos", n: 1, label: "Appréciation positive", html: HR },
    pos2: { g: "pos", n: 2, label: "Appréciation positive", html: HR + HR },
    pos3: { g: "pos", n: 3, label: "Appréciation positive", html: HR + HR + HR },
    neg1: { g: "neg", n: -1, label: "Aversion", html: HG },
    neg2: { g: "neg", n: -2, label: "Aversion", html: HG + HG },
    neg3: { g: "neg", n: -3, label: "Aversion", html: HG + HG + HG },
    neutre: { g: "neutre", n: 0, label: "Neutre", html: HR + HG },
    respect: { g: "respect", n: 2, label: "Respect", html: '<b class="h s">★</b>' },
    mort: { g: "mort", n: null, label: "Décédé(e)", html: '<b class="h d">🕊</b>' },
  };
  const appr = (k) => APP[k] || APP.neutre;
  const apprBadge = (k) => `<span class="appr appr-${appr(k).g}" title="${esc(appr(k).label)}">${appr(k).html}</span>`;
  const phasesOf = (r) => [...(r.phases || [])].sort((a, b) => (Number(a.age) || 0) - (Number(b.age) || 0));
  const latest = (r) => { const p = phasesOf(r); return p[p.length - 1] || { age: "", appreciation: "neutre", description: "" }; };

  /* ---------- éléments communs ---------- */
  const quote = (q) => (q ? `<blockquote class="rv">« ${esc(q)} »</blockquote>` : "");
  const title = (kicker, h, sub = "") =>
    `<header class="page-head"><span class="kicker rv">${esc(kicker)}</span><h1 class="rv" style="--i:1">${esc(h)}</h1>${sub ? `<p class="lead rv" style="--i:2">${esc(sub)}</p>` : ""}</header>`;
  const cards = (items, cls = "") =>
    `<div class="grid ${cls}">${(items || []).map((i, n) => `<article class="card tilt rv" style="--i:${n % 6}"><h3>${esc(i.titre)}</h3><p>${esc(i.texte)}</p></article>`).join("")}</div>`;
  const subh = (t) => `<h2 class="sub-h rv">${esc(t)}</h2>`;
  const empty = (t) => `<p class="empty rv">${esc(t)}</p>`;
  const initials = (n) => n.split(/[\s'’-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  const hue = (n) => [...n].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);
  const avatar = (r, cls = "") => {
    const src = safeSrc(r.image);
    return src
      ? `<span class="avatar ${cls}"><img src="${esc(src)}" alt="${esc(r.nom)}" loading="lazy"></span>`
      : `<span class="avatar mono ${cls}" style="--hue:${hue(r.nom)}">${esc(initials(r.nom))}</span>`;
  };

  /* ---------- pages ---------- */
  function pageHome() {
    const i = D.identite;
    let n0 = 0;
    const letters = i.nom.split(" ").map((w) => `<span class="w">${[...w].map((c) => `<span class="ch" style="--n:${n0++}">${esc(c)}</span>`).join("")}</span>`).join('<span class="sp"> </span>');
    const traits = [...(D.caractere.qualites || []), ...(D.caractere.defauts || [])].map((t) => t.titre);
    const marquee = [...traits, ...traits].map((t) => `<span>${esc(t)}</span><i>✦</i>`).join("");
    const living = D.relations.filter((r) => latest(r).appreciation !== "mort").length;
    const portals = [
      ["#/personnage", "Le personnage", "Caractère, physique, histoire et convictions de la reine de l'Ombre.", "✦", ""],
      ["#/relations", "Relations", "Famille, amis, rivaux : l'évolution de chaque lien au fil des lunes.", "♥", `${D.relations.length} liens`],
      ["#/fils", "Fils RP", "Tous les fils role-play, en cours ou terminés.", "✎", `${D.fils.length} fils`],
      ["#/galerie", "Galerie", "Illustrations et images de Nuance de Lait.", "❀", `${D.galerie.length} images`],
    ];
    return `
    <section class="hero">
      <div class="wrap hero-grid">
        <div class="hero-text">
          <span class="kicker rv">Clan de l'Ombre · ${esc(i.rang.split("—")[0].trim())}</span>
          <h1 class="big" aria-label="${esc(i.nom)}">${letters}</h1>
          <p class="sub rv" style="--i:3">${esc(i.sous_titre)}</p>
          ${quote(i.citation)}
          <div class="cta rv" style="--i:4">
            <a class="btn primary" href="#/personnage">Découvrir Nuance</a>
            <a class="btn ghost" href="#/relations">Ses relations</a>
          </div>
          <div class="stats">
            <div class="stat"><span>PV</span><div class="bar"><i style="--w:${Math.min(100, Number(i.pv))}%"></i></div><b data-count="${Number(i.pv) || 0}">0</b></div>
            <div class="stat pa"><span>PA</span><div class="bar"><i style="--w:${Math.min(100, Number(i.pa) * 10)}%"></i></div><b data-count="${Number(i.pa) || 0}">0</b></div>
          </div>
        </div>
        <figure class="portrait" aria-hidden="false">
          <div class="aura"></div><div class="ring"></div>
          <div class="cat"><img src="${esc(safeSrc(i.image) || "assets/nuance.webp")}" alt="${esc(i.nom)}, lykoï crème aux yeux verts"></div>
          <span class="petal p1">❀</span><span class="petal p2">✦</span><span class="petal p3">❀</span><span class="petal p4">✦</span>
        </figure>
      </div>
      <a class="scroll-hint" href="#portals" onclick="document.getElementById('portals').scrollIntoView({behavior:'smooth'});return false">défiler ↓</a>
    </section>

    <div class="marquee" aria-hidden="true"><div class="track">${marquee}</div></div>

    <section class="wrap numbers">
      <div class="num rv"><b data-count="${parseInt(i.lunes) || 0}">0</b><span>lunes</span></div>
      <div class="num rv" style="--i:1"><b data-count="${D.relations.length}">0</b><span>relations</span></div>
      <div class="num rv" style="--i:2"><b data-count="${living}">0</b><span>vivant(e)s</span></div>
      <div class="num rv" style="--i:3"><b data-count="${D.fils.length}">0</b><span>fils RP</span></div>
    </section>

    <section id="portals" class="wrap portals">
      ${portals.map((p, n) => `<a class="portal tilt rv" style="--i:${n}" href="${p[0]}"><span class="p-ico">${p[3]}</span><h2>${p[1]}</h2><p>${p[2]}</p>${p[4] ? `<em>${p[4]}</em>` : ""}<span class="arrow">→</span></a>`).join("")}
    </section>

    <section class="wrap manifesto">
      <div class="rv"><span class="kicker">En quelques mots</span>
      <p class="big-quote">${esc((D.caractere.description || [""])[0])}</p></div>
    </section>`;
  }

  const SUBS = [["apercu", "Aperçu"], ["caractere", "Caractère"], ["gouts", "Goûts & habitudes"], ["physique", "Physique"], ["histoire", "Histoire"], ["convictions", "Convictions"]];

  function pagePerso(sub) {
    sub = SUBS.some((s) => s[0] === sub) ? sub : "apercu";
    const i = D.identite;
    const tabs = `<nav class="tabs rv" aria-label="Sous-pages">${SUBS.map((s) => `<a href="#/personnage/${s[0]}" class="${s[0] === sub ? "on" : ""}">${s[1]}</a>`).join("")}</nav>`;
    let body = "";
    if (sub === "apercu") {
      const facts = [["Lunes", i.lunes], ["Clan", i.clan], ["Sexe", i.sexe], ["Orientation", i.orientation], ["Taille", i.taille], ["Poids", i.poids], ["Rang", i.rang], ["Joueur·se", i.pseudo_joueur]].filter((f) => f[1]);
      body = `<dl class="facts">${facts.map((f, n) => `<div class="tilt rv" style="--i:${n}"><dt>${esc(f[0])}</dt><dd>${esc(f[1])}</dd></div>`).join("")}</dl>
        ${subh("Nomenclature")}
        <ol class="names">${(D.noms || []).map((n, k) => `<li class="tilt rv" style="--i:${k}"><span class="step">${esc(n.etape)}</span><strong>${esc(n.nom)}</strong>${n.texte ? `<p>${esc(n.texte)}</p>` : ""}</li>`).join("")}</ol>`;
    } else if (sub === "caractere") {
      const c = D.caractere;
      body = `<div class="prose">${paras(c.description)}</div>${subh("Qualités")}${cards(c.qualites, "good")}${subh("Défauts")}${cards(c.defauts, "flaw")}`;
    } else if (sub === "gouts") {
      const g = D.gouts;
      body = `${subh("Ce qu'il aime")}${cards(g.aime, "good")}${subh("Ce qu'il déteste")}${cards(g.deteste, "flaw")}${subh("Ses peurs")}${cards(g.peurs)}${subh("Ses habitudes")}${cards(g.habitudes, "good")}`;
    } else if (sub === "physique") {
      const p = D.physique, h = p.handicap || {}, a = p.accessoires || {};
      body = `<div class="prose">${paras(p.description)}</div>${subh("Points forts")}${cards(p.forts, "good")}${subh("Points faibles")}${cards(p.faibles, "flaw")}
        ${subh("Handicap")}${quote(h.citation)}<p class="rv">${esc(h.intro)}</p><ul class="list">${(h.points || []).map((x) => `<li class="rv">${esc(x)}</li>`).join("")}</ul>
        ${subh("Accessoires")}${quote(a.citation)}${cards(a.points)}${subh("Cicatrices")}<div class="prose">${paras(p.cicatrices)}</div>`;
    } else if (sub === "histoire") {
      body = `<ol class="timeline">${(D.histoire || []).map((t, n) => `<li class="rv"><span class="dot">${n + 1}</span><p>${esc(t)}</p></li>`).join("")}</ol>`;
    } else {
      const v = D.convictions, cl = v.clan || {}, ac = v.autres_clans || {}, et = v.etoiles || {};
      body = `${subh("Relation au clan")}${quote(cl.citation)}<div class="prose">${paras(cl.paragraphes)}</div>
        ${subh("Avis sur les autres clans")}<p class="rv">${esc(ac.intro)}</p>${cards((ac.clans || []).map((x) => ({ titre: x.nom, texte: x.texte })))}
        ${subh("Croyance — Clan des Étoiles")}${quote(et.citation)}<div class="prose">${paras(et.paragraphes)}</div>`;
    }
    return `<section class="wrap page">${title("Le personnage", SUBS.find((s) => s[0] === sub)[1], sub === "apercu" ? i.sous_titre : "")}${tabs}${body}</section>`;
  }

  /* --- relations --- */
  const relState = { q: "", clan: "", type: "", grp: "" };
  const LEGEND = [["pos3", "Appréciation positive", "♥ · ♥♥ · ♥♥♥"], ["neg3", "Aversion", "🩶 · 🩶🩶 · 🩶🩶🩶"], ["neutre", "Neutre", ""], ["respect", "Respect", ""], ["mort", "Décédé(e)", ""]];

  function relCard(r, n) {
    const l = latest(r);
    return `<a class="rel tilt rv" style="--i:${n % 8}" href="#/relations/${slug(r.nom)}">
      ${avatar(r)}<div class="rel-body"><h3>${esc(r.nom)}</h3>
      <p class="muted">${esc(r.lien)}${r.clan ? " · " + esc(r.clan) : ""}</p>
      <div class="rel-foot">${apprBadge(l.appreciation)}<span class="tag ${r.type === "PJ" ? "pj" : ""}">${esc(r.type || "PNJ")}</span>${r.rang ? `<span class="tag soft">${esc(r.rang)}</span>` : ""}</div></div></a>`;
  }
  function relFiltered() {
    const q = relState.q.trim().toLowerCase();
    return D.relations.filter((r) => {
      if (relState.clan && r.clan !== relState.clan) return false;
      if (relState.type && (r.type || "PNJ") !== relState.type) return false;
      if (relState.grp && appr(latest(r).appreciation).g !== relState.grp) return false;
      return !q || [r.nom, r.lien, r.clan, r.rang, r.joueur].join(" ").toLowerCase().includes(q);
    });
  }
  function pageRelations() {
    const clans = [...new Set(D.relations.map((r) => r.clan).filter(Boolean))];
    const sel = (id, opts, cur, all) => `<select id="${id}" aria-label="${all}"><option value="">${all}</option>${opts.map((o) => `<option value="${esc(o[0])}" ${o[0] === cur ? "selected" : ""}>${esc(o[1])}</option>`).join("")}</select>`;
    return `<section class="wrap page">${title("Ceux qui comptent", "Relations", "Chaque lien est daté : l'appréciation évolue avec les lunes.")}
      <div class="legend rv">${LEGEND.map((l) => `<span class="lg">${APP[l[0]].html}<em>${l[1]}</em></span>`).join("")}</div>
      <div class="filters rv">
        <input id="rq" type="search" placeholder="Rechercher un nom, un clan, un rang…" value="${esc(relState.q)}">
        ${sel("rc", clans.map((c) => [c, c]), relState.clan, "Tous les clans")}
        ${sel("rt", [["PNJ", "PNJ"], ["PJ", "PJ (joueur·se)"]], relState.type, "PNJ & PJ")}
        ${sel("rg", [["pos", "Appréciation positive"], ["neg", "Aversion"], ["neutre", "Neutre"], ["respect", "Respect"], ["mort", "Décédé(e)s"]], relState.grp, "Toutes appréciations")}
      </div>
      <div id="rel-list"></div></section>`;
  }
  function fillRelList() {
    const list = relFiltered();
    $("#rel-list").innerHTML = list.length ? `<div class="grid rels">${list.map(relCard).join("")}</div>` : empty("Aucune relation ne correspond à ces filtres.");
    FX.observe($("#rel-list"));
  }
  function bindRelations() {
    $("#rq").oninput = (e) => { relState.q = e.target.value; fillRelList(); };
    $("#rc").onchange = (e) => { relState.clan = e.target.value; fillRelList(); };
    $("#rt").onchange = (e) => { relState.type = e.target.value; fillRelList(); };
    $("#rg").onchange = (e) => { relState.grp = e.target.value; fillRelList(); };
    fillRelList();
  }

  function graph(ph) {
    const pts = ph.filter((p) => appr(p.appreciation).n !== null);
    if (pts.length < 2) return "";
    const ages = pts.map((p) => Number(p.age) || 0), a0 = Math.min(...ages), a1 = Math.max(...ages) || 1;
    const X = (a) => 40 + ((a - a0) / (a1 - a0 || 1)) * 520, Y = (n) => 90 - n * 26;
    const d = pts.map((p, i) => `${i ? "L" : "M"}${X(Number(p.age) || 0)},${Y(appr(p.appreciation).n)}`).join(" ");
    return `<svg class="graph rv" viewBox="0 0 600 180" role="img" aria-label="Évolution de l'appréciation">
      <line x1="30" x2="580" y1="90" y2="90" class="axis"/><text x="6" y="30" class="lab">♥</text><text x="6" y="160" class="lab">🩶</text>
      <path d="${d}" class="curve"/>
      ${pts.map((p) => `<g><circle cx="${X(Number(p.age) || 0)}" cy="${Y(appr(p.appreciation).n)}" r="6" class="pt"/><text x="${X(Number(p.age) || 0)}" y="${Y(appr(p.appreciation).n) + (appr(p.appreciation).n >= 0 ? -14 : 24)}" text-anchor="middle" class="lab">${esc(p.age)} l.</text></g>`).join("")}
    </svg>`;
  }
  function pageRelation(id) {
    const r = D.relations.find((x) => slug(x.nom) === id);
    if (!r) return `<section class="wrap page">${title("Relations", "Introuvable")}<p><a class="btn" href="#/relations">← Toutes les relations</a></p></section>`;
    const ph = phasesOf(r), l = latest(r);
    return `<section class="wrap page">
      <a class="back rv" href="#/relations">← Toutes les relations</a>
      <header class="rel-hero rv">${avatar(r, "xl")}
        <div><span class="kicker">${esc(r.lien)}</span><h1>${esc(r.nom)}</h1>
        <div class="rel-foot">${apprBadge(l.appreciation)}<span class="muted">${esc(appr(l.appreciation).label)}</span></div>
        <div class="chips">${r.clan ? `<span class="tag">${esc(r.clan)}</span>` : ""}${r.rang ? `<span class="tag soft">${esc(r.rang)}</span>` : ""}
        <span class="tag ${r.type === "PJ" ? "pj" : ""}">${esc(r.type || "PNJ")}${r.type === "PJ" && r.joueur ? " · " + esc(r.joueur) : ""}</span></div></div></header>
      ${subh("Évolution du lien")}${graph(ph)}
      <ol class="timeline phases">${ph.map((p) => `<li class="rv"><span class="dot age">${esc(p.age)}<small>lunes</small></span>
        <div class="phase tilt"><div class="phase-top">${apprBadge(p.appreciation)}<span class="muted">${esc(appr(p.appreciation).label)}</span></div><p>${esc(p.description)}</p></div></li>`).join("")}</ol>
    </section>`;
  }

  /* --- fils rp --- */
  const filState = { s: "" };
  function pageFils() {
    const sel = filState.s;
    const list = D.fils.filter((f) => !sel || (f.statut || "").toLowerCase().replace("é", "e").startsWith(sel));
    const n = (s) => D.fils.filter((f) => (f.statut || "").toLowerCase().replace("é", "e").startsWith(s)).length;
    return `<section class="wrap page">${title("Role-play", "Fils RP", "Tous les fils de Nuance de Lait, du plus récent au plus ancien.")}
      <nav class="tabs rv">${[["", `Tous (${D.fils.length})`], ["en cours", `En cours (${n("en cours")})`], ["termine", `Terminés (${n("termine")})`]].map((t) => `<a href="#/fils" data-s="${t[0]}" class="${sel === t[0] ? "on" : ""}">${t[1]}</a>`).join("")}</nav>
      ${list.length ? `<div class="grid fils">${list.map((f, k) => {
        const live = (f.statut || "").toLowerCase().startsWith("en cours"), link = safeLink(f.lien);
        return `<article class="card fil tilt rv" style="--i:${k % 6}">
          <div class="fil-top"><span class="status ${live ? "live" : ""}">${esc(f.statut || "—")}</span>${f.lunes !== "" && f.lunes != null ? `<span class="muted">${esc(f.lunes)} lunes</span>` : ""}</div>
          <h3>${esc(f.titre)}</h3><p>${esc(f.description)}</p>
          <div class="chips">${(f.participants || []).map((p) => `<span class="tag soft">${esc(p)}</span>`).join("")}</div>
          ${link ? `<a class="btn small primary" href="${esc(link)}" target="_blank" rel="noopener noreferrer">Ouvrir sur Discord ↗</a>` : ""}</article>`;
      }).join("")}</div>` : empty(D.fils.length ? "Aucun fil dans cette catégorie." : "Aucun fil pour le moment — ils apparaîtront ici dès qu'ils seront ajoutés depuis le dashboard.")}</section>`;
  }

  /* --- galerie --- */
  function pageGalerie() {
    const g = D.galerie.filter((x) => safeSrc(x.image));
    return `<section class="wrap page">${title("Illustrations", "Galerie", "Nuance de Lait en images.")}
      ${g.length ? `<div class="masonry">${g.map((x, k) => `<figure class="shot tilt rv" style="--i:${k % 6}" data-k="${k}"><img src="${esc(safeSrc(x.image))}" alt="${esc(x.titre)}" loading="lazy"><figcaption>${esc(x.titre)}</figcaption></figure>`).join("")}</div>` : empty("La galerie est vide pour le moment.")}</section>`;
  }
  let lbIndex = 0, lbList = [];
  function lb(k) {
    const b = $("#lightbox"); lbIndex = (k + lbList.length) % lbList.length;
    const x = lbList[lbIndex];
    $("img", b).src = safeSrc(x.image); $("img", b).alt = x.titre;
    $("figcaption", b).textContent = [x.titre, x.description].filter(Boolean).join(" — ");
    b.hidden = false; document.body.classList.add("noscroll");
  }
  const lbClose = () => { $("#lightbox").hidden = true; document.body.classList.remove("noscroll"); };
  $("#lightbox").addEventListener("click", (e) => {
    if (e.target.matches(".lb-close") || e.target.id === "lightbox") lbClose();
    if (e.target.matches(".prev")) lb(lbIndex - 1);
    if (e.target.matches(".next")) lb(lbIndex + 1);
  });
  addEventListener("keydown", (e) => {
    if ($("#lightbox").hidden) return;
    if (e.key === "Escape") lbClose(); if (e.key === "ArrowLeft") lb(lbIndex - 1); if (e.key === "ArrowRight") lb(lbIndex + 1);
  });

  /* ---------- routeur ---------- */
  const NAV = [["", "Accueil"], ["personnage", "Personnage"], ["relations", "Relations"], ["fils", "Fils RP"], ["galerie", "Galerie"]];
  function buildNav() {
    $("#menu").innerHTML = NAV.map((n) => `<a href="#/${n[0]}" data-r="${n[0]}">${n[1]}</a>`).join("") + '<span class="pill"></span>';
  }
  function markNav(r) {
    document.querySelectorAll("#menu a").forEach((a) => a.classList.toggle("on", a.dataset.r === r));
    const on = $("#menu a.on"), pill = $("#menu .pill");
    if (on) { pill.style.width = on.offsetWidth + "px"; pill.style.transform = `translateX(${on.offsetLeft}px)`; pill.style.opacity = 1; } else pill.style.opacity = 0;
  }

  let first = true, token = 0;
  async function route() {
    if (!D) return;
    const parts = (location.hash.replace(/^#\/?/, "") || "").split("/").map(decodeURIComponent);
    const [r = "", a = ""] = parts;
    let html, after = () => {};
    if (r === "personnage") html = pagePerso(a);
    else if (r === "relations") { if (a) html = pageRelation(a); else { html = pageRelations(); after = bindRelations; } }
    else if (r === "fils") { html = pageFils(); after = () => document.querySelectorAll("[data-s]").forEach((el) => el.addEventListener("click", (e) => { e.preventDefault(); filState.s = el.dataset.s; route(); })); }
    else if (r === "galerie") { html = pageGalerie(); after = () => { lbList = D.galerie.filter((x) => safeSrc(x.image)); document.querySelectorAll(".shot").forEach((s) => s.addEventListener("click", () => lb(Number(s.dataset.k)))); }; }
    else html = pageHome();

    const my = ++token;
    if (!first) { app.classList.add("leave"); await new Promise((res) => setTimeout(res, 200)); if (my !== token) return; }
    first = false;
    app.innerHTML = html; app.classList.remove("leave"); app.classList.add("enter");
    document.body.dataset.page = r || "home";
    document.body.classList.remove("menu-open"); $("#burger").setAttribute("aria-expanded", "false");
    markNav(r); scrollTo(0, 0); after(); FX.observe(app);
    setTimeout(() => app.classList.remove("enter"), 700);
    document.title = (r ? { personnage: "Personnage", relations: "Relations", fils: "Fils RP", galerie: "Galerie" }[r] + " — " : "") + D.identite.nom;
  }

  /* ---------- interface ---------- */
  $("#burger").addEventListener("click", () => {
    const o = document.body.classList.toggle("menu-open"); $("#burger").setAttribute("aria-expanded", o);
  });
  const themeBtn = $("#theme");
  const setTheme = (t) => { document.documentElement.dataset.theme = t; themeBtn.textContent = t === "night" ? "☀" : "☾"; try { localStorage.setItem("nl-theme", t); } catch (e) {} };
  setTheme(document.documentElement.dataset.theme === "night" ? "night" : "day");
  themeBtn.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "night" ? "day" : "night"));
  addEventListener("scroll", () => $("#nav").classList.toggle("stuck", scrollY > 20), { passive: true });
  addEventListener("resize", () => markNav((location.hash.replace(/^#\/?/, "").split("/")[0]) || ""));
  addEventListener("hashchange", route);

  buildNav();
  loadContent().then((d) => {
    D = d; $("#credits").textContent = d.identite.credits || "";
    route();
  });
})();
