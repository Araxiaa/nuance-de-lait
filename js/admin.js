(function () {
  const C = window.SITE_CONFIG;
  const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY);
  const $ = (s, r = document) => r.querySelector(s);
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const isArr = Array.isArray;
  const DRAFT = "nl-draft-v1";

  /* petit constructeur DOM */
  function h(tag, props, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(props || {})) {
      if (k === "class") e.className = v;
      else if (k === "html") e.innerHTML = v;
      else if (k === "value") e.value = v;
      else if (k.startsWith("on")) e[k] = v;
      else if (v === true) e.setAttribute(k, "");
      else if (v !== false && v != null) e.setAttribute(k, v);
    }
    kids.flat().forEach((c) => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c)); });
    return e;
  }

  /* ---------- données ---------- */
  const APPR = [
    ["pos3", "♥♥♥", "Positive forte"], ["pos2", "♥♥", "Positive"], ["pos1", "♥", "Positive légère"],
    ["neutre", "♥♥", "Neutre"], ["respect", "★", "Respect"],
    ["neg1", "♥", "Aversion légère"], ["neg2", "♥♥", "Aversion"], ["neg3", "♥♥♥", "Aversion forte"], ["mort", "🕊", "Décédé(e)"],
  ];
  const apprHtml = (k) => {
    if (k === "respect") return '<span class="h-s">★</span>';
    if (k === "mort") return "🕊";
    if (k === "neutre") return '<span class="h-r">♥</span><span class="h-g">♥</span>';
    const n = +k.slice(-1) || 1;
    return `<span class="${k.startsWith("neg") ? "h-g" : "h-r"}">${"♥".repeat(n)}</span>`;
  };
  const SELECTS = {
    appreciation: APPR.map((a) => [a[0], a[2]]),
    groupe: [["famille", "Famille"], ["autres", "Autres relations"]],
    type: [["PNJ", "PNJ"], ["PJ", "PJ (joueur·se)"]],
    statut: [["En cours", "En cours"], ["Terminé", "Terminé"]],
  };
  const LABELS = {
    nom: "Nom", texte: "Texte", titre: "Titre", lien: "Lien", statut: "Statut", etape: "Étape", age: "Âge (lunes)", lunes: "Lunes de Nuance",
    joueur: "Joueur·se (si PJ)", coche: "Case cochée", libelle: "Libellé", detail: "Précision", points: "Points", seuil: "Seuil (Forêt Sombre au-dessus)",
    actif: "OC décédé(e) — active la page Purgatoire", applicable: "Applicable", justification: "Justification", pv_max: "PV max", pa_max: "PA max",
    cause_deces: "Cause du décès", age_deces: "Âge au décès", sous_titre: "Sous-titre", pseudo_joueur: "Pseudo du joueur", rang: "Rang", clan: "Clan",
  };
  const label = (k) => LABELS[k] || (String(k).charAt(0).toUpperCase() + String(k).slice(1).replace(/_/g, " "));
  const SAMPLES = {
    phases: { age: 0, appreciation: "neutre", description: "" },
    fils: { titre: "", lien: "", participants: [], lunes: 0, description: "", statut: "En cours" },
    galerie: { titre: "", image: "", description: "" },
  };

  let state = null, saved = "", dirty = false;
  const curAge = () => parseInt(state.identite.age_deces) || parseInt(state.identite.lunes) || 0;

  function toast(msg, err) {
    const t = $("#toast"); t.textContent = msg; t.className = "toast show" + (err ? " err" : "");
    clearTimeout(toast.t); toast.t = setTimeout(() => (t.className = "toast"), 3200);
  }
  function touch() {
    const now = JSON.stringify(state);
    dirty = now !== saved;
    const s = $("#status");
    s.className = "status " + (dirty ? "dirty" : "clean");
    s.textContent = dirty ? "● Modifications non enregistrées" : "✓ Tout est enregistré";
    $("#btn-save").disabled = !dirty;
    try { dirty ? localStorage.setItem(DRAFT, now) : localStorage.removeItem(DRAFT); } catch (e) {}
  }

  /* ---------- connexion ---------- */
  async function checkAdmin() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return showLogin();
    const { data: ok, error } = await sb.rpc("is_admin");
    if (error || ok !== true) {
      await sb.auth.signOut();
      return showLogin(error ? "Base non configurée (voir supabase/setup.sql)." : "Ce compte Discord n'est pas autorisé.");
    }
    $("#who").textContent = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "Admin";
    $("#login").hidden = true; $("#dash").hidden = false;
    await load();
  }
  function showLogin(msg) { $("#dash").hidden = true; $("#login").hidden = false; $("#login-msg").textContent = msg || ""; }
  $("#btn-login").onclick = () => sb.auth.signInWithOAuth({ provider: "discord", options: { redirectTo: location.origin + location.pathname } });

  async function load() {
    const { data } = await sb.from("site_content").select("data").eq("id", C.CONTENT_ID).maybeSingle();
    state = clone(window.DEFAULT_CONTENT);
    const s = data?.data || {};
    for (const k of Object.keys(s)) {
      if (isArr(state[k]) !== isArr(s[k])) continue;
      state[k] = !isArr(s[k]) && s[k] && typeof s[k] === "object" ? { ...state[k], ...s[k] } : s[k];
    }
    saved = JSON.stringify(state);
    try {
      const d = localStorage.getItem(DRAFT);
      if (d && d !== saved && confirm("Des modifications non enregistrées ont été retrouvées sur cet appareil. Les restaurer ?")) state = JSON.parse(d);
    } catch (e) {}
    view = localStorage.getItem("nl-view") || "relations";
    touch(); drawSide(); drawView();
  }
  async function save() {
    $("#btn-save").disabled = true;
    const { error } = await sb.from("site_content").upsert({ id: C.CONTENT_ID, data: state, updated_at: new Date().toISOString() });
    if (error) { toast("Erreur : " + error.message, true); return touch(); }
    saved = JSON.stringify(state); touch(); toast("Enregistré ✓ — le site est à jour");
  }
  $("#btn-save").onclick = save;
  addEventListener("keydown", (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") { e.preventDefault(); if (dirty) save(); } });
  addEventListener("beforeunload", (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

  $("#btn-more").onclick = (ev) => {
    document.querySelectorAll(".menu-pop").forEach((m) => m.remove());
    const r = ev.currentTarget.getBoundingClientRect();
    const item = (t, fn) => h("button", { onclick: () => { pop.remove(); fn(); } }, t);
    const pop = h("div", { class: "menu-pop", style: `top:${r.bottom + 6}px;right:${innerWidth - r.right}px` },
      item("⬇ Exporter en JSON (sauvegarde)", () => {
        const a = h("a", { href: URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" })), download: "nuance-de-lait.json" });
        a.click(); URL.revokeObjectURL(a.href);
      }),
      item("⬆ Importer un JSON", () => {
        const f = h("input", { type: "file", accept: "application/json" });
        f.onchange = async () => { try { state = JSON.parse(await f.files[0].text()); touch(); drawSide(); drawView(); toast("Importé — pensez à enregistrer"); } catch (e) { toast("Fichier invalide", true); } };
        f.click();
      }),
      item("↺ Revenir aux valeurs par défaut", () => {
        if (confirm("Remplacer tout le contenu par les valeurs par défaut du site ? (Rien n'est enregistré avant de cliquer sur Enregistrer.)")) { state = clone(window.DEFAULT_CONTENT); touch(); drawSide(); drawView(); }
      }),
      item("⎋ Se déconnecter", async () => { await sb.auth.signOut(); location.reload(); }));
    document.body.append(pop);
    setTimeout(() => addEventListener("click", () => pop.remove(), { once: true }), 0);
  };

  /* ---------- champs ---------- */
  function change(o) { touch(); o && o.on && o.on(); }
  function field(obj, key, o = {}) {
    const v = obj[key], lab = o.label || (isArr(obj) ? "Texte" : label(key));
    if (typeof v === "boolean") {
      const cb = h("input", { type: "checkbox" }); cb.checked = v;
      cb.onchange = () => { obj[key] = cb.checked; change(o); };
      return h("label", { class: "field check" }, cb, h("span", {}, lab));
    }
    const opts = o.select || SELECTS[key];
    let el;
    if (opts) {
      el = h("select", {}, h("option", { value: "" }, "—"), (opts.some((x) => x[0] === v) || !v ? opts : [[v, v], ...opts]).map((x) => h("option", { value: x[0] }, x[1])));
      el.value = v ?? "";
    } else if (o.area || isArr(obj) || (typeof v === "string" && (v.length > 70 || /texte|intro|citation|description|justification/.test(key)))) {
      el = h("textarea", { rows: o.rows || 3 }); el.value = v ?? "";
    } else {
      el = h("input", { type: typeof v === "number" ? "number" : "text" }); el.value = v ?? "";
    }
    el.oninput = el.onchange = () => { obj[key] = typeof v === "number" ? Number(el.value) : el.value; change(o); };
    const wrap = h("label", { class: "field" }, h("span", {}, lab), el);
    if (key === "image") wrap.append(imageTools(obj, key, el, o));
    return wrap;
  }
  function imageTools(obj, key, input, o) {
    const prev = h("img", { alt: "" });
    const show = () => { prev.style.display = obj[key] ? "" : "none"; prev.src = obj[key] || ""; };
    show();
    const up = h("input", { type: "file", accept: "image/*" });
    up.onchange = async () => {
      const f = up.files[0]; if (!f) return;
      const path = `${Date.now()}-${f.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await sb.storage.from("nuance").upload(path, f);
      if (error) return toast("Envoi impossible : " + error.message, true);
      obj[key] = input.value = sb.storage.from("nuance").getPublicUrl(path).data.publicUrl; show(); change(o); toast("Image envoyée ✓");
    };
    input.addEventListener("input", show);
    return h("div", { class: "imgfield" }, prev, up);
  }

  /* éditeur générique (récursif) */
  function node(parent, key, title) {
    const v = parent[key];
    if (isArr(v)) return list(parent, key, title);
    if (v && typeof v === "object") {
      const fs = h("fieldset", {}, h("legend", {}, title || label(key)));
      Object.keys(v).forEach((k) => fs.append(node(v, k)));
      return fs;
    }
    return field(parent, key);
  }
  function list(parent, key, title) {
    const arr = parent[key];
    const fs = h("fieldset", {}, h("legend", {}, title || label(key)));
    const sample = arr.length && typeof arr[0] === "object" ? blank(arr[0]) : (SAMPLES[key] ? clone(SAMPLES[key]) : "");
    const redraw = () => { touch(); fs.replaceWith(list(parent, key, title)); };
    arr.forEach((item, i) => {
      const nm = typeof item === "object" ? item.nom || item.titre || item.etape || item.libelle || "" : "";
      const acts = h("span", { class: "acts" },
        h("button", { type: "button", class: "btn small", onclick: (e) => { e.preventDefault(); if (i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; redraw(); } } }, "↑"),
        h("button", { type: "button", class: "btn small", onclick: (e) => { e.preventDefault(); if (i < arr.length - 1) { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; redraw(); } } }, "↓"),
        h("button", { type: "button", class: "btn small danger", onclick: (e) => { e.preventDefault(); if (confirm("Supprimer cet élément ?")) { arr.splice(i, 1); redraw(); } } }, "✕"));
      const body = h("div", { class: "body" });
      if (typeof item === "object") Object.keys(item).forEach((k) => body.append(node(item, k))); else body.append(field(arr, i));
      fs.append(h("details", { class: "item", open: arr.length <= 8 }, h("summary", {}, `#${i + 1}${nm ? " — " + nm : typeof item === "string" ? " — " + item.slice(0, 50) : ""}`, acts), body));
    });
    fs.append(h("button", { type: "button", class: "btn small", onclick: () => { arr.push(clone(sample)); redraw(); } }, "+ Ajouter"));
    return fs;
  }
  function blank(v) {
    if (typeof v === "string") return "";
    if (typeof v === "number") return 0;
    if (typeof v === "boolean") return false;
    if (isArr(v)) return v.length && typeof v[0] === "object" ? [blank(v[0])] : [];
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)]));
  }

  /* ---------- gestionnaire maître / détail ---------- */
  const selIdx = {};
  const hue = (n) => [...(n || "?")].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);
  const ini = (n) => (n || "?").split(/[\s'’-]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  function ava(it) {
    return h("span", { class: "ava", style: `--h:${hue(it.nom || it.titre)}` }, it.image ? h("img", { src: it.image, alt: "" }) : ini(it.nom || it.titre));
  }

  function manager(cfg) {
    const arr = state[cfg.key];
    let q = "", f1 = "", f2 = "";
    const root = h("div", { class: "mgr" });
    const items = h("div", { class: "m-items" }), count = h("strong", {}), edit = h("div", { class: "m-edit" });
    const search = h("input", { type: "search", placeholder: `Rechercher…`, oninput: (e) => { q = e.target.value.toLowerCase(); drawList(); } });
    const filters = (cfg.filters || []).map((fl, n) => {
      const s = h("select", { onchange: (e) => { n ? (f2 = e.target.value) : (f1 = e.target.value); drawList(); } }, h("option", { value: "" }, fl.all), fl.opts.map((o) => h("option", { value: o[0] }, o[1])));
      return s;
    });
    function match(it) {
      if (q && !JSON.stringify(Object.values(it).filter((x) => typeof x === "string")).toLowerCase().includes(q)) return false;
      if (cfg.filters) { if (f1 && !cfg.filters[0].test(it, f1)) return false; if (f2 && !cfg.filters[1].test(it, f2)) return false; }
      return true;
    }
    function row(it, i) {
      return h("button", { class: "m-it" + (i === selIdx[cfg.key] ? " on" : ""), onclick: () => { selIdx[cfg.key] = i; drawList(); drawEdit(); } },
        cfg.avatar ? ava(it) : null,
        h("span", { class: "tx" }, h("div", { class: "t" }, cfg.title(it) || h("span", { class: "incomplete" }, "(sans nom)")), h("div", { class: "s" }, cfg.sub ? cfg.sub(it) : "")),
        cfg.badge ? h("span", { class: "ap", html: cfg.badge(it) }) : null);
    }
    function drawList() {
      items.innerHTML = "";
      const shown = arr.map((it, i) => [it, i]).filter(([it]) => match(it));
      count.textContent = `${shown.length} / ${arr.length} ${cfg.noun}`;
      if (!shown.length) items.append(h("div", { class: "empty" }, arr.length ? "Aucun résultat." : `Aucun(e) ${cfg.noun} — cliquez sur « + Nouveau ».`));
      if (cfg.groupBy) {
        for (const g of cfg.groupBy.groups) {
          const part = shown.filter(([it]) => cfg.groupBy.of(it) === g[0]);
          if (part.length) { items.append(h("h5", {}, `${g[1]} (${part.length})`)); part.forEach(([it, i]) => items.append(row(it, i))); }
        }
      } else shown.forEach(([it, i]) => items.append(row(it, i)));
    }
    function drawEdit() {
      edit.innerHTML = "";
      const i = selIdx[cfg.key], it = arr[i];
      if (!it) return edit.append(h("div", { class: "empty" }, "Sélectionnez un élément dans la liste ou créez-en un."));
      const refresh = () => drawList();
      const head = h("div", { class: "m-head" }, h("h3", {}, cfg.title(it) || "Nouveau"),
        cfg.order ? h("button", { class: "btn small", title: "Monter", onclick: () => move(-1) }, "↑") : null,
        cfg.order ? h("button", { class: "btn small", title: "Descendre", onclick: () => move(1) }, "↓") : null,
        h("button", { class: "btn small", onclick: () => { const c = clone(it); if (c.nom) c.nom += " (copie)"; if (c.titre) c.titre += " (copie)"; arr.splice(i + 1, 0, c); selIdx[cfg.key] = i + 1; touch(); drawSide(); drawList(); drawEdit(); } }, "⧉ Dupliquer"),
        h("button", { class: "btn small danger", onclick: () => { if (confirm(`Supprimer « ${cfg.title(it) || "cet élément"} » ?`)) { arr.splice(i, 1); selIdx[cfg.key] = Math.min(i, arr.length - 1); touch(); drawSide(); drawList(); drawEdit(); } } }, "🗑 Supprimer"));
      edit.append(head, cfg.editor(it, () => { head.firstChild.textContent = cfg.title(it) || "Nouveau"; refresh(); }));
    }
    function move(d) {
      const i = selIdx[cfg.key], j = i + d; if (j < 0 || j >= arr.length) return;
      [arr[i], arr[j]] = [arr[j], arr[i]]; selIdx[cfg.key] = j; touch(); drawList(); drawEdit();
    }
    const add = () => { arr.push(cfg.sample()); selIdx[cfg.key] = arr.length - 1; q = f1 = f2 = ""; search.value = ""; filters.forEach((s) => (s.value = "")); touch(); drawSide(); drawList(); drawEdit(); edit.querySelector("input")?.focus(); };
    root.append(
      h("div", { class: "m-list" },
        h("div", { class: "bar-in" }, h("button", { class: "btn primary small", onclick: add }, "+ Nouveau"), cfg.bulk ? h("button", { class: "btn small", onclick: () => cfg.bulk(() => { touch(); drawSide(); drawList(); drawEdit(); }) }, "⇪ En masse") : null),
        h("div", { class: "m-tools" }, search, filters.length ? h("div", { class: "bar-in" }, filters) : null, count),
        items),
      edit);
    if (selIdx[cfg.key] == null || selIdx[cfg.key] >= arr.length) selIdx[cfg.key] = arr.length ? 0 : -1;
    drawList(); drawEdit();
    return root;
  }

  /* ----- relations ----- */
  function relEditor(r, refresh) {
    const wrap = h("div");
    wrap.append(h("div", { class: "grid2" }, field(r, "nom", { on: refresh }), field(r, "lien", { on: refresh }), field(r, "groupe", { on: refresh }), field(r, "type", { on: refresh }),
      field(r, "clan", { on: refresh }), field(r, "rang", { on: refresh }), field(r, "joueur")), field(r, "image", { on: refresh }));
    const box = h("div", { class: "phases" });
    const draw = () => {
      box.innerHTML = "";
      r.phases.forEach((p, i) => {
        const chips = h("div", { class: "chips" }, APPR.map((a) => h("button", { type: "button", class: "chip" + (p.appreciation === a[0] ? " on" : ""), title: a[2], html: a[0] === "neutre" ? apprHtml("neutre") : apprHtml(a[0]), onclick: () => { p.appreciation = a[0]; touch(); refresh(); draw(); } })));
        box.append(h("div", { class: "phase" },
          field(p, "age", { label: "Âge (lunes)", on: refresh }),
          h("div", { class: "field" }, h("span", {}, "Appréciation à cet âge"), chips),
          h("div", { class: "desc" }, field(p, "description", { label: "Description de la relation à cet âge", rows: 3 })),
          h("button", { type: "button", class: "btn small danger del", title: "Supprimer cette période", onclick: () => { if (r.phases.length > 1 && !confirm("Supprimer cette période ?")) return; r.phases.splice(i, 1); touch(); refresh(); draw(); } }, "✕")));
      });
    };
    draw();
    wrap.append(h("h3", { style: "margin:16px 0 8px;font-style:italic;color:var(--eye-d)" }, "Évolution de la relation"),
      box,
      h("div", { class: "bar-in", style: "margin-top:10px;justify-content:flex-start" },
        h("button", { class: "btn small", onclick: () => { const last = r.phases[r.phases.length - 1] || {}; r.phases.push({ age: Math.min(curAge(), (Number(last.age) || 0) + 6) || curAge(), appreciation: last.appreciation || "neutre", description: "" }); touch(); refresh(); draw(); } }, "+ Ajouter une période"),
        h("button", { class: "btn small ghost", onclick: () => { r.phases.sort((a, b) => (Number(a.age) || 0) - (Number(b.age) || 0)); touch(); draw(); } }, "↕ Trier par âge")));
    return wrap;
  }
  const relBadge = (r) => { const p = [...(r.phases || [])].sort((a, b) => a.age - b.age).pop(); return p ? apprHtml(p.appreciation) : ""; };
  function bulkRelations(done) {
    const d = h("dialog");
    const ta = h("textarea", { placeholder: "Sérénité de Clématite ; Père ; famille ; Clan de l'Ombre ; Guerrier ; PNJ ; ; mort ; 74 ; Un guerrier respecté…" });
    d.append(h("h3", { style: "font-size:1.8rem;font-style:italic;margin-bottom:6px" }, "Ajouter plusieurs relations d'un coup"),
      h("p", { html: "Une relation par ligne, champs séparés par <code>;</code> (ou <code>|</code>) dans cet ordre :<br><code>Nom ; Lien ; famille/autres ; Clan ; Rang ; PNJ/PJ ; Joueur ; Appréciation ; Âge ; Description</code><br>Seul le nom est obligatoire. Appréciation : <code>pos1-3</code>, <code>neg1-3</code>, <code>neutre</code>, <code>respect</code>, <code>mort</code> (ou <code>+ ++ +++ - -- ---</code>)." }),
      ta, h("div", { class: "bar-in", style: "margin-top:12px;justify-content:flex-end" },
        h("button", { class: "btn", onclick: () => d.close() }, "Annuler"),
        h("button", { class: "btn primary", onclick: () => {
          const alias = { "+": "pos1", "++": "pos2", "+++": "pos3", "-": "neg1", "--": "neg2", "---": "neg3" };
          let n = 0;
          ta.value.split("\n").map((l) => l.trim()).filter(Boolean).forEach((l) => {
            const c = l.split(/\s*[;|\t]\s*/);
            if (!c[0]) return;
            const ap = (c[7] || "neutre").toLowerCase(); const g = (c[2] || "").toLowerCase();
            state.relations.push({ nom: c[0], lien: c[1] || "", groupe: g.startsWith("f") ? "famille" : "autres", clan: c[3] || "Clan de l'Ombre", rang: c[4] || "", type: /pj/i.test(c[5] || "") ? "PJ" : "PNJ", joueur: c[6] || "", image: "",
              phases: [{ age: parseInt(c[8]) || curAge(), appreciation: APPR.some((a) => a[0] === alias[ap] || a[0] === ap) ? alias[ap] || ap : "neutre", description: c.slice(9).join(" ; ") }] });
            n++;
          });
          d.close(); d.remove(); if (n) { toast(`${n} relation(s) ajoutée(s) — pensez à enregistrer`); done(); }
        } }, "Importer")));
    document.body.append(d); d.addEventListener("close", () => d.remove()); d.showModal();
  }
  const relView = () => manager({
    key: "relations", noun: "relations", avatar: true, bulk: bulkRelations,
    title: (r) => r.nom, sub: (r) => [r.lien, r.clan].filter(Boolean).join(" · "), badge: relBadge,
    groupBy: { of: (r) => (r.groupe === "famille" ? "famille" : "autres"), groups: [["famille", "Famille"], ["autres", "Autres relations"]] },
    filters: [
      { all: "Tous les groupes", opts: [["famille", "Famille"], ["autres", "Autres"]], test: (r, v) => (r.groupe === "famille" ? "famille" : "autres") === v },
      { all: "Toutes appréciations", opts: [["pos", "Positives"], ["neg", "Aversions"], ["neutre", "Neutres"], ["respect", "Respect"], ["mort", "Décédé(e)s"]],
        test: (r, v) => { const p = [...(r.phases || [])].sort((a, b) => a.age - b.age).pop(); return !!p && p.appreciation.replace(/\d/g, "") === v; } },
    ],
    sample: () => ({ nom: "", lien: "", groupe: "autres", clan: "Clan de l'Ombre", rang: "", type: "PNJ", joueur: "", image: "", phases: [{ age: curAge(), appreciation: "neutre", description: "" }] }),
    editor: relEditor,
  });

  /* ----- fils rp & galerie ----- */
  const filsView = () => manager({
    key: "fils", noun: "fils", order: true,
    title: (f) => f.titre, sub: (f) => [f.statut, f.lunes ? f.lunes + " lunes" : ""].filter(Boolean).join(" · "), badge: (f) => (/cours/i.test(f.statut) ? '<span class="h-r">●</span>' : "✓"),
    sample: () => ({ ...clone(SAMPLES.fils), lunes: curAge() }),
    editor: (f, refresh) => h("div", {}, h("div", { class: "grid2" }, field(f, "titre", { on: refresh }), field(f, "statut", { on: refresh }), field(f, "lunes", { label: "Lunes de Nuance pendant le fil" }), field(f, "lien", { label: "Lien Discord (https://…)" })),
      field(f, "description", { rows: 4 }), list(f, "participants", "Participants")),
  });
  const galView = () => manager({
    key: "galerie", noun: "images", order: true, avatar: true,
    title: (g) => g.titre, sub: (g) => (g.description || "").slice(0, 40),
    sample: () => clone(SAMPLES.galerie),
    editor: (g, refresh) => h("div", {}, field(g, "titre", { on: refresh }), field(g, "image", { label: "Image (URL ou envoi)", on: refresh }), field(g, "description", { rows: 3 })),
  });

  /* ----- purgatoire ----- */
  function purgView() {
    const P = state.purgatoire, root = h("div");
    const score = h("div", { class: "score" });
    const calc = () => {
      let t = 0;
      P.sections.forEach((s) => [...s.negatifs, ...s.positifs].forEach((it) => { if (it.coche) t += Number(it.points) || 0; }));
      ["bonne", "mauvaise"].forEach((k) => { if (P.staff[k].applicable) t += Number(P.staff[k].points) || 0; });
      const star = t <= (Number(P.seuil) || 15);
      score.innerHTML = `<span>Score final</span><b>${t > 0 ? "+" : ""}${t}</b><span class="v">${star ? "✨ Clan des Étoiles" : "🌑 Forêt Sombre"}</span>`;
    };
    const on = { on: calc };
    const itemRow = (it) => {
      const cb = h("input", { type: "checkbox" }); cb.checked = it.coche;
      const row = h("div", { class: "pitem" + (it.coche ? " on" : "") }, cb, h("span", {}, it.libelle, h("small", {}, it.detail)),
        h("input", { type: "number", value: it.points, oninput: (e) => { it.points = Number(e.target.value); touch(); calc(); } }));
      cb.onchange = () => { it.coche = cb.checked; row.classList.toggle("on", cb.checked); touch(); calc(); };
      return row;
    };
    root.append(score,
      h("div", { class: "card grid2" }, field(P, "actif", on), field(P, "seuil", on)),
      ...P.sections.map((s) => h("div", { class: "card" }, h("h3", {}, `${s.icone} ${s.titre}`),
        h("div", { class: "pgrid" }, h("div", {}, h("b", {}, "Points négatifs"), s.negatifs.map(itemRow)), h("div", {}, h("b", {}, "Points positifs"), s.positifs.map(itemRow))))),
      h("div", { class: "card" }, h("h3", {}, "V. Note staff"), h("div", { class: "grid2" },
        h("fieldset", {}, h("legend", {}, "Bonne cause non listée"), field(P.staff.bonne, "applicable", on), field(P.staff.bonne, "points", on), field(P.staff.bonne, "justification")),
        h("fieldset", {}, h("legend", {}, "Mauvaise cause non listée"), field(P.staff.mauvaise, "applicable", on), field(P.staff.mauvaise, "points", on), field(P.staff.mauvaise, "justification")))),
      h("details", { class: "card" }, h("summary", {}, "Informations de l'OC"), node(P, "infos", "Informations")));
    calc();
    return root;
  }

  /* ---------- navigation ---------- */
  const NAV = [
    ["Personnage", [["identite", "Identité", "🪪"], ["noms", "Noms", "🏷"], ["caractere", "Caractère", "🎭"], ["gouts", "Goûts & peurs", "🍃"], ["physique", "Physique", "🐾"], ["histoire", "Histoire", "📜"], ["convictions", "Convictions", "✨"]]],
    ["Liens & RP", [["relations", "Relations", "♥"], ["fils", "Fils RP", "✎"], ["galerie", "Galerie", "❀"]]],
    ["Après la vie", [["purgatoire", "Purgatoire", "🕊"]]],
  ];
  const DESC = {
    identite: "Fiche rapide : nom, lunes, PV/PA, image d'accueil…", relations: "Une fiche par relation, avec son évolution au fil des lunes.",
    fils: "Les fils role-play, en cours ou terminés.", galerie: "Les illustrations affichées dans la galerie.", purgatoire: "Le formulaire d'évaluation de l'âme.",
  };
  let view = "relations";
  const counts = () => ({ relations: state.relations.length, fils: state.fils.length, galerie: state.galerie.length, noms: state.noms.length });
  function drawSide() {
    const side = $("#side"), c = counts(); side.innerHTML = "";
    NAV.forEach(([g, items]) => {
      side.append(h("h4", {}, g));
      items.forEach(([k, t, ico]) => side.append(h("button", { class: k === view ? "on" : "", onclick: () => { view = k; try { localStorage.setItem("nl-view", k); } catch (e) {} drawSide(); drawView(); scrollTo(0, 0); } },
        h("span", { class: "ico" }, ico), t, c[k] != null ? h("span", { class: "cnt" }, c[k]) : null)));
    });
  }
  function drawView() {
    const v = $("#view"); v.innerHTML = ""; v.style.animation = "none"; void v.offsetWidth; v.style.animation = "";
    const title = NAV.flatMap((n) => n[1]).find((x) => x[0] === view);
    v.append(h("div", { class: "view-head" }, h("h2", {}, title ? title[1] : ""), DESC[view] ? h("p", {}, DESC[view]) : null));
    if (view === "relations") v.append(relView());
    else if (view === "fils") v.append(filsView());
    else if (view === "galerie") v.append(galView());
    else if (view === "purgatoire") v.append(purgView());
    else {
      const d = state[view];
      if (isArr(d)) v.append(list(state, view, title[1]));
      else Object.keys(d).forEach((k) => v.append(node(d, k)));
    }
  }

  sb.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_OUT") showLogin(); });
  checkAdmin();
})();
