(function () {
  const C = window.SITE_CONFIG;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const paras = (arr) => (arr || []).map((p) => `<p>${esc(p)}</p>`).join("");
  const safeSrc = (u) => (/^(https?:\/\/|assets\/|\/)/.test(u || "") ? u : "assets/nuance.webp");

  async function loadContent() {
    try {
      const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY);
      const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 5000));
      const { data, error } = await Promise.race([sb.from("site_content").select("data").eq("id", C.CONTENT_ID).maybeSingle(), timeout]);
      if (!error && data && data.data) return data.data;
    } catch (e) { /* hors-ligne ou table absente : contenu par défaut */ }
    return window.DEFAULT_CONTENT;
  }

  const cards = (items, cls = "") =>
    `<div class="grid ${cls}">${(items || []).map((i) => `<article class="card"><h3>${esc(i.titre)}</h3><p>${esc(i.texte)}</p></article>`).join("")}</div>`;

  const people = (items) =>
    `<div class="grid people">${(items || []).map((p) => `
      <article class="card person">
        <div class="tags"><span class="tag">${esc(p.lien)}</span><span class="tag soft">${esc(p.statut)}</span></div>
        <h3>${esc(p.nom)}</h3><p>${esc(p.texte)}</p>
      </article>`).join("")}</div>`;

  const quote = (q) => (q ? `<blockquote>« ${esc(q)} »</blockquote>` : "");
  const section = (id, title, body, kicker = "") =>
    `<section id="${id}" class="sec"><div class="wrap"><header class="sec-head">${kicker ? `<span class="kicker">${esc(kicker)}</span>` : ""}<h2>${esc(title)}</h2><span class="rule"></span></header>${body}</div></section>`;

  function render(d) {
    const i = d.identite || {};
    const facts = [
      ["Lunes", i.lunes], ["Clan", i.clan], ["Sexe", i.sexe], ["Orientation", i.orientation],
      ["Taille", i.taille], ["Poids", i.poids], ["Rang", i.rang], ["Joueur·se", i.pseudo_joueur],
    ].filter((f) => f[1]);
    const pct = (v, max) => Math.max(0, Math.min(100, (Number(v) / max) * 100));

    const hero = `
      <section id="top" class="hero">
        <div class="wrap hero-grid">
          <div class="hero-text">
            <span class="kicker">Clan de l'Ombre · ${esc(i.lunes)}</span>
            <h1>${esc(i.nom)}</h1>
            <p class="sub">${esc(i.sous_titre)}</p>
            ${quote(i.citation)}
            <div class="stats">
              <div class="stat"><span>PV</span><div class="bar"><i style="width:${pct(i.pv, 100)}%"></i></div><b>${esc(i.pv)}</b></div>
              <div class="stat pa"><span>PA</span><div class="bar"><i style="width:${pct(i.pa, 10)}%"></i></div><b>${esc(i.pa)}</b></div>
            </div>
          </div>
          <figure class="portrait"><div class="frame"><img src="${esc(safeSrc(i.image))}" alt="Nuance de Lait, lykoï crème aux yeux verts"></div></figure>
        </div>
      </section>
      <section id="identite" class="sec alt"><div class="wrap"><dl class="facts">${facts.map((f) => `<div><dt>${esc(f[0])}</dt><dd>${esc(f[1])}</dd></div>`).join("")}</dl></div></section>`;

    const noms = section("noms", "Nomenclature", `<ol class="names">${(d.noms || []).map((n) => `
      <li><span class="step">${esc(n.etape)}</span><strong>${esc(n.nom)}</strong>${n.texte ? `<p>${esc(n.texte)}</p>` : ""}</li>`).join("")}</ol>`, "Ses noms");

    const c = d.caractere || {};
    const caractere = section("caractere", "Caractère", `<div class="prose">${paras(c.description)}</div>
      <h3 class="sub-h">Qualités</h3>${cards(c.qualites, "good")}<h3 class="sub-h">Défauts</h3>${cards(c.defauts, "flaw")}`, "Personnalité");

    const g = d.gouts || {};
    const gouts = section("gouts", "Goûts & habitudes",
      `<h3 class="sub-h">Ce qu'il aime</h3>${cards(g.aime)}<h3 class="sub-h">Ce qu'il déteste</h3>${cards(g.deteste, "flaw")}
       <h3 class="sub-h">Ses peurs</h3>${cards(g.peurs)}<h3 class="sub-h">Ses habitudes</h3>${cards(g.habitudes, "good")}`, "Ses petits plaisirs");

    const p = d.physique || {};
    const h = p.handicap || {}, a = p.accessoires || {};
    const physique = section("physique", "Apparence physique", `
      <div class="prose">${paras(p.description)}</div>
      <h3 class="sub-h">Points forts</h3>${cards(p.forts, "good")}
      <h3 class="sub-h">Points faibles</h3>${cards(p.faibles, "flaw")}
      <h3 class="sub-h">Handicap</h3>${quote(h.citation)}<p>${esc(h.intro)}</p><ul class="list">${(h.points || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      <h3 class="sub-h">Accessoires</h3>${quote(a.citation)}${cards(a.points)}
      <h3 class="sub-h">Cicatrices</h3>${paras(p.cicatrices)}`, "Une silhouette de lait");

    const r = d.relations || {};
    const relations = section("relations", "Lignée & relations", `
      <h3 class="sub-h">Famille</h3>${people(r.famille)}
      <h3 class="sub-h">Cœur & compagnons</h3>${people(r.conjoints)}
      <h3 class="sub-h">Descendance</h3>${people(r.descendance)}
      <h3 class="sub-h">Mentorat</h3>${people(r.mentorat)}`, "Ceux qui comptent");

    const histoire = section("histoire", "Histoire", `<div class="prose story">${paras(d.histoire)}</div>`, "Lore");

    const v = d.convictions || {};
    const cl = v.clan || {}, ac = v.autres_clans || {}, et = v.etoiles || {};
    const convictions = section("convictions", "Convictions & loyauté", `
      <h3 class="sub-h">Relation au clan</h3>${quote(cl.citation)}<div class="prose">${paras(cl.paragraphes)}</div>
      <h3 class="sub-h">Avis sur les autres clans</h3><p>${esc(ac.intro)}</p>${cards((ac.clans || []).map((x) => ({ titre: x.nom, texte: x.texte })))}
      <h3 class="sub-h">Croyance — Clan des Étoiles</h3>${quote(et.citation)}<div class="prose">${paras(et.paragraphes)}</div>`, "Foi & rancœurs");

    document.getElementById("app").innerHTML = hero + noms + caractere + gouts + physique + relations + histoire + convictions;
    document.getElementById("credits").textContent = i.credits || "";
    document.title = `${i.nom} — ${i.clan}`;

    const links = [["noms", "Noms"], ["caractere", "Caractère"], ["gouts", "Goûts"], ["physique", "Physique"], ["relations", "Relations"], ["histoire", "Histoire"], ["convictions", "Convictions"]];
    document.getElementById("menu").innerHTML = links.map((l) => `<a href="#${l[0]}">${l[1]}</a>`).join("");
  }

  const burger = document.querySelector(".burger");
  burger.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    burger.setAttribute("aria-expanded", open);
  });
  document.getElementById("menu").addEventListener("click", () => document.body.classList.remove("menu-open"));

  loadContent().then(render);
})();
