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
          base[k] = !isArr(saved[k]) && saved[k] && typeof saved[k] === "object" ? { ...base[k], ...saved[k] } : saved[k];
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
  // Une période = polarité (pos1-3 / neg1-3, optionnelle) + drapeaux optionnels neutre / respect / mort.
  // Les anciennes valeurs appreciation: "neutre" | "respect" | "mort" restent comprises.
  function appr(p) {
    const a = (p && p.appreciation) || "";
    const pol = /^(pos|neg)[123]$/.test(a) ? a : "";
    const neutre = !!(p && p.neutre) || a === "neutre", respect = !!(p && p.respect) || a === "respect", mort = !!(p && p.mort) || a === "mort";
    const n = pol ? (pol[0] === "p" ? 1 : -1) * Number(pol[3]) : 0;
    let html = pol ? (n > 0 ? HR : HG).repeat(Math.abs(n)) : "";
    if (neutre) html += HR + HG;
    if (respect) html += APP.respect.html;
    if (mort) html += APP.mort.html;
    if (!html) html = HR + HG;
    const lab = [pol ? (n > 0 ? "Appréciation positive" : "Aversion") : "", neutre ? "Neutre" : "", respect ? "Respect" : "", mort ? "Décédé(e)" : ""].filter(Boolean);
    return { pol, n, neutre, respect, mort, html, label: lab.join(" · ") || "Neutre", g: pol ? (n > 0 ? "pos" : "neg") : neutre ? "neutre" : respect ? "respect" : mort ? "mort" : "neutre" };
  }
  const apprBadge = (p) => `<span class="appr appr-${appr(p).g}" title="${esc(appr(p).label)}">${appr(p).html}</span>`;
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
  const pct = (v, max) => Math.max(0, Math.min(100, (Number(v) / Number(max)) * 100));
  function pageHome() {
    const i = D.identite;
    const P = D.purgatoire, dead = P && P.actif, verdict = dead ? purgCalc() : null;
    let n0 = 0;
    const letters = i.nom.split(" ").map((w) => `<span class="w">${[...w].map((c) => `<span class="ch" style="--n:${n0++}">${esc(c)}</span>`).join("")}</span>`).join('<span class="sp"> </span>');
    const traits = [...(D.caractere.qualites || []), ...(D.caractere.defauts || [])].map((t) => t.titre);
    const marquee = [...traits, ...traits].map((t) => `<span>${esc(t)}</span><i>✦</i>`).join("");
    const living = D.relations.filter((r) => !appr(latest(r)).mort).length;
    const portals = [
      ["#/personnage", "Le personnage", "Caractère, physique, histoire et convictions de la reine de l'Ombre.", "✦", ""],
      ["#/relations", "Relations", "Famille, amis, rivaux : l'évolution de chaque lien au fil des lunes.", "♥", `${D.relations.length} liens`],
      ["#/fils", "Fils RP", "Tous les fils role-play, en cours ou terminés.", "✎", `${D.fils.length} fils`],
      ["#/galerie", "Galerie", "Illustrations et images de Nuance de Lait.", "❀", `${D.galerie.length} images`],
      ...(dead ? [["#/purgatoire", "Le Purgatoire", "Le formulaire d'évaluation de l'âme : Clan des Étoiles ou Forêt Sombre ?", "✨", verdict.etoiles ? "Verdict : Clan des Étoiles" : "Verdict : Forêt Sombre"]] : []),
    ];
    return `
    <section class="hero">
      <div class="wrap hero-grid">
        <div class="hero-text">
          <span class="kicker rv">Clan de l'Ombre · ${esc(i.rang.split("—")[0].trim())}</span>
          ${dead ? `<a class="rip rv" href="#/purgatoire">🕊 Décédé à ${esc(P.infos.age)} lunes · ${verdict.etoiles ? "Rejoint le Clan des Étoiles ✨" : "Condamné à la Forêt Sombre 🌑"}</a>` : ""}
          <h1 class="big" aria-label="${esc(i.nom)}">${letters}</h1>
          <p class="sub rv" style="--i:3">${esc(i.sous_titre)}</p>
          ${quote(i.citation)}
          <div class="cta rv" style="--i:4">
            <a class="btn primary" href="#/personnage">Découvrir Nuance</a>
            <a class="btn ghost" href="#/relations">Ses relations</a>
          </div>
          <div class="stats">
            <div class="stat"><span>PV</span><div class="bar"><i style="--w:${pct(i.pv, i.pv_max || 50)}%"></i></div><b><span data-count="${Number(i.pv) || 0}">0</span>/${esc(i.pv_max || 50)}</b></div>
            <div class="stat pa"><span>PA</span><div class="bar"><i style="--w:${pct(i.pa, i.pa_max || 5)}%"></i></div><b><span data-count="${Number(i.pa) || 0}">0</span>/${esc(i.pa_max || 5)}</b></div>
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
      ${portals.map((p, n) => `<a class="portal tilt rv ${p[0] === "#/purgatoire" ? "wide" : ""}" style="--i:${n}" href="${p[0]}"><span class="p-ico">${p[3]}</span><h2>${p[1]}</h2><p>${p[2]}</p>${p[4] ? `<em>${p[4]}</em>` : ""}<span class="arrow">→</span></a>`).join("")}
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
      const facts = [["Statut", i.statut], ["Cause du décès", i.cause_deces], ["Lunes", i.lunes], ["Clan", i.clan], ["Sexe", i.sexe], ["Orientation", i.orientation], ["Taille", i.taille], ["Poids", i.poids], ["Rang", i.rang], ["Joueur·se", i.pseudo_joueur]].filter((f) => f[1]);
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
  const LEGEND = [["pos3", "Appréciation positive (1 à 3 ♥)", ""], ["neg3", "Aversion (1 à 3 ♥)", ""], ["neutre", "Neutre (optionnel)", ""], ["respect", "Respect (optionnel)", ""], ["mort", "Décédé(e) (optionnel)", ""]];
  const RSUBS = [["apercu", "Vue d'ensemble"], ["famille", "Famille"], ["autres", "Autres relations"]];
  const isFam = (r) => r.groupe === "famille";
  const rlink = (r) => `#/relations/r/${slug(r.nom)}`;
  const legend = () => `<div class="legend rv">${LEGEND.map((l) => `<span class="lg">${APP[l[0]].html}<em>${l[1]}</em></span>`).join("")}</div>`;

  function relCard(r, n) {
    const l = latest(r);
    return `<a class="rel tilt rv" style="--i:${n % 8}" href="${rlink(r)}">
      ${avatar(r)}<div class="rel-body"><h3>${esc(r.nom)}</h3>
      <p class="muted">${esc(r.lien)}${r.clan ? " · " + esc(r.clan) : ""}</p>
      <div class="rel-foot">${apprBadge(l)}<span class="tag ${r.type === "PJ" ? "pj" : ""}">${esc(r.type || "PNJ")}</span>${r.rang ? `<span class="tag soft">${esc(r.rang)}</span>` : ""}</div></div></a>`;
  }
  function relFiltered(fam) {
    const q = relState.q.trim().toLowerCase();
    return D.relations.filter((r) => {
      if (isFam(r) !== fam) return false;
      if (relState.clan && r.clan !== relState.clan) return false;
      if (relState.type && (r.type || "PNJ") !== relState.type) return false;
      if (relState.grp) { const a = appr(latest(r)); if (!({ pos: a.n > 0, neg: a.n < 0, neutre: a.neutre, respect: a.respect, mort: a.mort })[relState.grp]) return false; }
      return !q || [r.nom, r.lien, r.clan, r.rang, r.joueur].join(" ").toLowerCase().includes(q);
    });
  }

  /* frise des relations : une ligne par relation, une colonne par tranche de 6 lunes */
  const STEP = 6;
  const lifeMax = () => Math.max(parseInt(D.identite.age_deces) || 0, parseInt(D.identite.lunes) || 0, ...D.relations.flatMap((r) => (r.phases || []).map((p) => Number(p.age) || 0)));
  function matrix(list) {
    if (!list.length) return empty("Aucune relation dans cette catégorie.");
    const cols = Math.ceil((lifeMax() + 1) / STEP);
    const sorted = [...list].sort((a, b) => (Number(phasesOf(a)[0]?.age) || 0) - (Number(phasesOf(b)[0]?.age) || 0));
    const head = `<div class="mx-head" style="--cols:${cols}"><span></span>${Array.from({ length: cols }, (_, c) => `<span>${c % 2 === 0 ? c * STEP : ""}</span>`).join("")}</div>`;
    const rows = sorted.map((r, n) => {
      const ph = phasesOf(r);
      const cells = Array.from({ length: cols }, (_, c) => {
        const lo = c * STEP, hi = lo + STEP - 1;
        const act = [...ph].reverse().find((p) => (Number(p.age) || 0) <= hi);
        if (!act) return '<i class="mx-cell none"></i>';
        const a = appr(act);
        const first = (Number(act.age) || 0) >= lo;
        const mark = first ? (a.mort ? "🕊" : a.respect ? "★" : "") : "";
        return `<i class="mx-cell g-${a.g} n-${Math.abs(a.n || 0)}${a.mort ? " dead" : ""}" title="${esc(r.nom)} — ${esc(lo)}-${esc(hi)} lunes : ${esc(a.label)}">${mark}</i>`;
      }).join("");
      return `<a class="mx-row rv" style="--cols:${cols};--i:${n % 8}" href="${rlink(r)}"><span class="mx-name">${esc(r.nom)}<small>${esc(r.lien)}</small></span>${cells}</a>`;
    }).join("");
    return `<div class="mx-wrap"><div class="mx">${head}${rows}</div></div><p class="muted mx-axis">Âge de Nuance de Lait en lunes → chaque case est une tranche de ${STEP} lunes.</p>`;
  }
  function summary() {
    const count = (fam) => {
      const o = { pos: 0, neg: 0, neutre: 0, respect: 0, mort: 0 };
      D.relations.filter((r) => isFam(r) === fam).forEach((r) => o[appr(latest(r)).g]++);
      return o;
    };
    const names = { pos: "Positive", neg: "Aversion", neutre: "Neutre", respect: "Respect", mort: "Décédé(e)" };
    const bar = (title, o) => {
      const tot = Object.values(o).reduce((a, b) => a + b, 0) || 1;
      return `<div class="sum rv"><h3>${title} <em>${tot === 1 && !Object.values(o).some(Boolean) ? 0 : Object.values(o).reduce((a, b) => a + b, 0)}</em></h3>
        <div class="stack">${Object.keys(o).filter((k) => o[k]).map((k) => `<span class="seg g-${k}" style="flex:${o[k]}" title="${names[k]} : ${o[k]}">${o[k]}</span>`).join("")}</div>
        <div class="stack-leg">${Object.keys(o).filter((k) => o[k]).map((k) => `<span><i class="dotc g-${k}"></i>${names[k]} ${o[k]}</span>`).join("")}</div></div>`;
    };
    const all = D.relations.map((r) => appr(latest(r)));
    const extra = `<p class="muted rv">🕊 ${all.filter((a) => a.mort).length} décédé(e)s · ★ ${all.filter((a) => a.respect).length} avec respect · ♥♥ ${all.filter((a) => a.neutre).length} neutre(s) — en plus de la polarité positive ou négative.</p>`;
    return `<div class="sums">${bar("Famille", count(true))}${bar("Autres relations", count(false))}</div>${extra}`;
  }

  function pageRelations(sub) {
    sub = RSUBS.some((s) => s[0] === sub) ? sub : "apercu";
    const tabs = `<nav class="tabs rv">${RSUBS.map((s) => `<a href="#/relations/${s[0]}" class="${s[0] === sub ? "on" : ""}">${s[1]}</a>`).join("")}</nav>`;
    const head = title("Ceux qui comptent", "Relations", "Chaque lien est daté : l'appréciation évolue avec les lunes.");
    if (sub === "apercu") {
      return `<section class="wrap page">${head}${tabs}${legend()}${summary()}
        ${subh("Famille")}${matrix(D.relations.filter(isFam))}
        ${subh("Autres relations")}${matrix(D.relations.filter((r) => !isFam(r)))}</section>`;
    }
    const pool = D.relations.filter((r) => isFam(r) === (sub === "famille"));
    const clans = [...new Set(pool.map((r) => r.clan).filter(Boolean))];
    const sel = (id, opts, cur, all) => `<select id="${id}" aria-label="${all}"><option value="">${all}</option>${opts.map((o) => `<option value="${esc(o[0])}" ${o[0] === cur ? "selected" : ""}>${esc(o[1])}</option>`).join("")}</select>`;
    return `<section class="wrap page">${head}${tabs}${legend()}
      <div class="filters rv">
        <input id="rq" type="search" placeholder="Rechercher un nom, un clan, un rang…" value="${esc(relState.q)}">
        ${sel("rc", clans.map((c) => [c, c]), relState.clan, "Tous les clans")}
        ${sel("rt", [["PNJ", "PNJ"], ["PJ", "PJ (joueur·se)"]], relState.type, "PNJ & PJ")}
        ${sel("rg", [["pos", "Appréciation positive"], ["neg", "Aversion"], ["neutre", "Neutre"], ["respect", "Respect"], ["mort", "Décédé(e)s"]], relState.grp, "Toutes appréciations")}
      </div><div id="rel-list"></div></section>`;
  }
  function bindRelations(sub) {
    const fam = sub === "famille";
    const fill = () => {
      const list = relFiltered(fam);
      $("#rel-list").innerHTML = list.length ? `<div class="grid rels">${list.map(relCard).join("")}</div>` : empty("Aucune relation ne correspond à ces filtres.");
      FX.observe($("#rel-list"));
    };
    $("#rq").oninput = (e) => { relState.q = e.target.value; fill(); };
    $("#rc").onchange = (e) => { relState.clan = e.target.value; fill(); };
    $("#rt").onchange = (e) => { relState.type = e.target.value; fill(); };
    $("#rg").onchange = (e) => { relState.grp = e.target.value; fill(); };
    fill();
  }

  function graph(ph) {
    const pts = ph.filter((p) => appr(p).n !== null);
    if (pts.length < 2) return "";
    const ages = pts.map((p) => Number(p.age) || 0), a0 = Math.min(...ages), a1 = Math.max(...ages) || 1;
    const X = (a) => 40 + ((a - a0) / (a1 - a0 || 1)) * 520, Y = (n) => 90 - n * 26;
    const d = pts.map((p, i) => `${i ? "L" : "M"}${X(Number(p.age) || 0)},${Y(appr(p).n)}`).join(" ");
    return `<svg class="graph rv" viewBox="0 0 600 180" role="img" aria-label="Évolution de l'appréciation">
      <line x1="30" x2="580" y1="90" y2="90" class="axis"/><text x="6" y="30" class="lab">♥</text><text x="6" y="160" class="lab">♥</text>
      <path d="${d}" class="curve"/>
      ${pts.map((p) => `<g><circle cx="${X(Number(p.age) || 0)}" cy="${Y(appr(p).n)}" r="6" class="pt"/><text x="${X(Number(p.age) || 0)}" y="${Y(appr(p).n) + (appr(p).n >= 0 ? -14 : 24)}" text-anchor="middle" class="lab">${esc(p.age)} l.</text></g>`).join("")}
    </svg>`;
  }
  function pageRelation(id) {
    const r = D.relations.find((x) => slug(x.nom) === id);
    if (!r) return `<section class="wrap page">${title("Relations", "Introuvable")}<p><a class="btn" href="#/relations">← Toutes les relations</a></p></section>`;
    const ph = phasesOf(r), l = latest(r);
    return `<section class="wrap page">
      <a class="back rv" href="#/relations/${isFam(r) ? "famille" : "autres"}">← ${isFam(r) ? "Famille" : "Autres relations"}</a>
      <header class="rel-hero rv">${avatar(r, "xl")}
        <div><span class="kicker">${esc(r.lien)}</span><h1>${esc(r.nom)}</h1>
        <div class="rel-foot">${apprBadge(l)}<span class="muted">${esc(appr(l).label)}</span></div>
        <div class="chips">${r.clan ? `<span class="tag">${esc(r.clan)}</span>` : ""}${r.rang ? `<span class="tag soft">${esc(r.rang)}</span>` : ""}
        <span class="tag ${r.type === "PJ" ? "pj" : ""}">${esc(r.type || "PNJ")}${r.type === "PJ" && r.joueur ? " · " + esc(r.joueur) : ""}</span></div></div></header>
      ${subh("Évolution du lien")}${graph(ph)}
      <ol class="timeline phases">${ph.map((p) => `<li class="rv"><span class="dot age">${esc(p.age)}<small>lunes</small></span>
        <div class="phase tilt"><div class="phase-top">${apprBadge(p)}<span class="muted">${esc(appr(p).label)}</span></div><p>${esc(p.description)}</p></div></li>`).join("")}</ol>
    </section>`;
  }

  /* --- purgatoire --- */
  function purgCalc() {
    const P = D.purgatoire; let neg = 0, pos = 0;
    const add = (n) => { n = Number(n) || 0; if (n >= 0) neg += n; else pos += n; };
    const sec = (s) => [...(s.negatifs || []), ...(s.positifs || [])].reduce((a, it) => a + (it.coche ? Number(it.points) || 0 : 0), 0);
    (P.sections || []).forEach((s) => [...(s.negatifs || []), ...(s.positifs || [])].forEach((it) => it.coche && add(it.points)));
    ["bonne", "mauvaise"].forEach((k) => { const x = (P.staff || {})[k]; if (x && x.applicable) add(x.points); });
    const total = neg + pos, seuil = Number(P.seuil) || 15;
    return { neg, pos, total, seuil, etoiles: total <= seuil, sec };
  }
  const sgn = (n) => (n > 0 ? "+" + n : String(n));
  function pagePurgatoire() {
    const P = D.purgatoire, c = purgCalc(), i = P.infos || {};
    const lo = Math.min(-30, c.total - 10), hi = Math.max(30, c.total + 10), pct = (v) => ((v - lo) / (hi - lo)) * 100;
    const info = [["Nom", i.nom], ["Joueur·se", i.joueur], ["Clan / Groupe", i.clan], ["Rang au décès", i.rang], ["Cause du décès", i.cause], ["Âge au décès", i.age + " lunes"]];
    const items = (arr) => (arr || []).map((it) => `<li class="${it.coche ? "on" : ""}"><span class="box">${it.coche ? "✔" : ""}</span><span class="lbl"><b>${esc(it.libelle)}</b><small>${esc(it.detail)}</small></span><span class="pts">${sgn(Number(it.points) || 0)}</span></li>`).join("");
    const sections = (P.sections || []).map((s, n) => `
      <article class="purg-sec tilt rv" style="--i:${n % 4}">
        <header><h3>${esc(s.icone)} ${esc(["I", "II", "III", "IV", "V"][n])}. ${esc(s.titre)}</h3><span class="sec-total ${c.sec(s) <= 0 ? "good" : "bad"}">${sgn(c.sec(s))} pts</span></header>
        <div class="two"><div><h4>Points négatifs</h4><ul class="checks">${items(s.negatifs)}</ul></div><div><h4>Points positifs</h4><ul class="checks pos">${items(s.positifs)}</ul></div></div>
      </article>`).join("");
    const st = P.staff || {};
    const staff = (k, t) => `<div class="card rv"><h3>${t}</h3><p>${st[k] && st[k].applicable ? "✔ Applicable" : "☐ Non applicable"} · ${sgn(Number((st[k] || {}).points) || 0)} pts</p>${st[k] && st[k].justification ? `<p>${esc(st[k].justification)}</p>` : ""}</div>`;
    return `<section class="wrap page purg">${title("Après la vie", "Le Purgatoire", "Évaluation de l'âme de Nuance de Lait par le staff.")}
      <div class="verdict ${c.etoiles ? "stars" : "dark"} rv">
        <div class="v-ico">${c.etoiles ? "✨" : "🌑"}</div>
        <div><span class="kicker">Destination finale</span><h2>${c.etoiles ? "Le Clan des Étoiles" : "La Forêt Sombre"}</h2><p>${c.etoiles ? "L'âme est méritante." : "L'âme est corrompue."}</p></div>
        <div class="v-score"><b data-count="${Math.abs(c.total)}">0</b><span>${c.total < 0 ? "−" : ""}score final</span></div>
      </div>
      <div class="gauge rv" style="--pos:${pct(c.total).toFixed(1)}%;--thr:${pct(c.seuil).toFixed(1)}%">
        <div class="g-track"><span class="g-thr"><em>seuil ${c.seuil}</em></span><span class="mk"><i>${c.total}</i></span></div>
        <div class="g-lab"><span>✨ Clan des Étoiles</span><span>🌑 Forêt Sombre</span></div>
      </div>
      ${subh("Informations de l'OC")}
      <dl class="facts">${info.map((f, n) => `<div class="rv" style="--i:${n}"><dt>${esc(f[0])}</dt><dd>${esc(f[1])}</dd></div>`).join("")}</dl>
      ${subh("Barème détaillé")}<div class="purg-grid">${sections}</div>
      ${subh("V. Note staff")}<div class="grid">${staff("bonne", "Bonne cause non listée")}${staff("mauvaise", "Mauvaise cause non listée")}</div>
      ${subh("Calcul final")}
      <div class="calc rv"><div><span>Points négatifs</span><b>${sgn(c.neg)}</b></div><div><span>Points positifs</span><b>${sgn(c.pos)}</b></div><div class="res"><span>Score final</span><b>${sgn(c.total)}</b></div></div>
      <div class="dest rv"><div class="${!c.etoiles ? "on" : ""}">🌑 Score &gt; ${c.seuil}<br><b>La Forêt Sombre</b><small>L'âme est corrompue.</small></div>
      <div class="${c.etoiles ? "on" : ""}">✨ Score ≤ ${c.seuil}<br><b>Le Clan des Étoiles</b><small>L'âme est méritante.</small></div></div>
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
  const navItems = () => (D && D.purgatoire && D.purgatoire.actif ? [...NAV, ["purgatoire", "Purgatoire"]] : NAV);
  function buildNav() {
    $("#menu").innerHTML = navItems().map((n) => `<a href="#/${n[0]}" data-r="${n[0]}">${n[1]}</a>`).join("") + '<span class="pill"></span>';
  }
  function markNav(r) {
    document.querySelectorAll("#menu a").forEach((a) => a.classList.toggle("on", a.dataset.r === r));
    const on = $("#menu a.on"), pill = $("#menu .pill");
    if (!pill) return;
    if (on) { pill.style.width = on.offsetWidth + "px"; pill.style.transform = `translateX(${on.offsetLeft}px)`; pill.style.opacity = 1; } else pill.style.opacity = 0;
  }

  let first = true, token = 0;
  async function route() {
    if (!D) return;
    const parts = (location.hash.replace(/^#\/?/, "") || "").split("/").map(decodeURIComponent);
    const [r = "", a = ""] = parts;
    let html, after = () => {};
    if (r === "personnage") html = pagePerso(a);
    else if (r === "relations") {
      if (a === "r" && parts[2]) html = pageRelation(parts[2]);
      else { const sub = a === "famille" || a === "autres" ? a : "apercu"; html = pageRelations(sub); if (sub !== "apercu") after = () => bindRelations(sub); }
    }
    else if (r === "purgatoire" && D.purgatoire) html = pagePurgatoire();
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
    document.title = (r ? { personnage: "Personnage", relations: "Relations", fils: "Fils RP", galerie: "Galerie", purgatoire: "Purgatoire" }[r] + " — " : "") + D.identite.nom;
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
  if (document.fonts) document.fonts.ready.then(() => markNav((location.hash.replace(/^#\/?/, "").split("/")[0]) || ""));

  loadContent().then((d) => {
    D = d; buildNav(); document.body.classList.toggle("dead", !!(d.purgatoire && d.purgatoire.actif)); $("#credits").textContent = d.identite.credits || "";
    route();
  });
})();
