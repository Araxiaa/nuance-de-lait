(function () {
  const C = window.SITE_CONFIG;
  const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY);
  const $ = (id) => document.getElementById(id);
  const clone = (o) => JSON.parse(JSON.stringify(o));

  const TABS = {
    identite: "Identité", noms: "Noms", caractere: "Caractère", gouts: "Goûts & peurs",
    physique: "Physique", histoire: "Histoire", convictions: "Convictions",
    relations: "Relations", fils: "Fils RP", galerie: "Galerie",
  };
  const SELECTS = {
    appreciation: [["pos1", "♥ Appréciation positive (1)"], ["pos2", "♥♥ Appréciation positive (2)"], ["pos3", "♥♥♥ Appréciation positive (3)"],
      ["neg1", "🩶 Aversion (1)"], ["neg2", "🩶🩶 Aversion (2)"], ["neg3", "🩶🩶🩶 Aversion (3)"],
      ["neutre", "♥🩶 Neutre"], ["respect", "★ Respect"], ["mort", "🕊 Décédé(e)"]],
    type: [["PNJ", "PNJ"], ["PJ", "PJ (joueur·se)"]],
    statut: [["En cours", "En cours"], ["Terminé", "Terminé"]],
  };
  const LABELS = { age: "Âge (lunes)", lunes: "Lunes de Nuance", lien: "Lien (Discord ou relation)", joueur: "Joueur·se (si PJ)",  pv: "PV", pa: "PA", nom: "Nom", texte: "Texte", titre: "Titre", lien: "Lien", statut: "Statut", etape: "Étape" };
  const label = (k) => LABELS[k] || (k.charAt(0).toUpperCase() + k.slice(1).replace(/_/g, " "));

  const PHASE = { age: 0, appreciation: "neutre", description: "" };
  const SAMPLES = {
    phases: PHASE,
    fils: { titre: "", lien: "", participants: [], lunes: 0, description: "", statut: "En cours" },
    galerie: { titre: "", image: "", description: "" },
    relations: { nom: "", lien: "", clan: "Clan de l'Ombre", rang: "", type: "PNJ", joueur: "", image: "", phases: [PHASE] },
  };

  let state = null;
  let tab = "identite";

  function toast(msg, err) {
    const t = $("toast");
    t.textContent = msg; t.className = "toast show" + (err ? " err" : "");
    clearTimeout(toast.t); toast.t = setTimeout(() => (t.className = "toast"), 3200);
  }

  /* ---------- auth ---------- */
  async function checkAdmin() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return showLogin();
    const { data: ok, error } = await sb.rpc("is_admin"); // vérifié côté serveur
    if (error || ok !== true) {
      await sb.auth.signOut();
      return showLogin(error ? "Base non configurée (voir supabase/setup.sql)." : "Ce compte Discord n'est pas autorisé.");
    }
    $("who").textContent = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "Admin";
    $("login").hidden = true; $("dash").hidden = false;
    await load();
  }
  function showLogin(msg) {
    $("dash").hidden = true; $("login").hidden = false; $("login-msg").textContent = msg || "";
  }
  $("btn-login").onclick = () =>
    sb.auth.signInWithOAuth({ provider: "discord", options: { redirectTo: location.origin + location.pathname } });
  $("btn-logout").onclick = async () => { await sb.auth.signOut(); showLogin(); };

  /* ---------- données ---------- */
  async function load() {
    const { data } = await sb.from("site_content").select("data").eq("id", C.CONTENT_ID).maybeSingle();
    state = Object.assign(clone(window.DEFAULT_CONTENT), data?.data || {});
    render();
  }
  $("btn-save").onclick = async () => {
    const { error } = await sb.from("site_content").upsert({ id: C.CONTENT_ID, data: state, updated_at: new Date().toISOString() });
    error ? toast("Erreur : " + error.message, true) : toast("Enregistré ✓ — le site est à jour");
  };
  $("btn-reset").onclick = () => {
    if (!confirm("Remplacer le contenu édité par les valeurs par défaut ? (Rien n'est enregistré tant que vous ne cliquez pas sur Enregistrer.)")) return;
    state = clone(window.DEFAULT_CONTENT); render();
  };
  $("btn-export").onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }));
    a.download = "nuance-de-lait.json"; a.click(); URL.revokeObjectURL(a.href);
  };

  /* ---------- éditeur générique ---------- */
  function blank(v) {
    if (typeof v === "string") return "";
    if (typeof v === "number") return 0;
    if (Array.isArray(v)) return v.length && typeof v[0] === "object" ? [blank(v[0])] : [];
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)]));
  }

  function field(obj, key, onChange) {
    const v = obj[key];
    const wrap = document.createElement("label");
    wrap.className = "field";
    const cap = document.createElement("span"); cap.textContent = Array.isArray(obj) ? "Texte" : label(key); wrap.append(cap);
    const long = typeof v === "string" && (v.length > 70 || Array.isArray(obj) || /texte|intro|citation|description/.test(key));
    const opts = SELECTS[key];
    const input = document.createElement(opts ? "select" : long ? "textarea" : "input");
    if (opts) {
      const list = opts.some((o) => o[0] === v) || !v ? opts : [[v, v], ...opts];
      input.innerHTML = '<option value="">—</option>' + list.map((o) => `<option value="${o[0].replace(/"/g, "&quot;")}">${o[1]}</option>`).join("");
    }
    if (typeof v === "number") input.type = "number";
    input.value = v;
    input.oninput = input.onchange = () => { obj[key] = typeof v === "number" ? Number(input.value) : input.value; onChange && onChange(); };
    wrap.append(input);
    if (key === "image") { // envoi vers le bucket Storage "nuance"
      const up = document.createElement("input"); up.type = "file"; up.accept = "image/*"; up.style.marginTop = "6px";
      up.onchange = async () => {
        const f = up.files[0]; if (!f) return;
        const path = `${Date.now()}-${f.name.replace(/[^\w.-]/g, "_")}`;
        const { error } = await sb.storage.from("nuance").upload(path, f);
        if (error) return toast("Envoi impossible : " + error.message, true);
        input.value = obj[key] = sb.storage.from("nuance").getPublicUrl(path).data.publicUrl;
        toast("Image envoyée — pensez à enregistrer");
      };
      wrap.append(up);
    }
    return wrap;
  }

  function node(parent, key, title) {
    const v = parent[key];
    if (Array.isArray(v)) return list(parent, key, title);
    if (v && typeof v === "object") {
      const fs = document.createElement("fieldset");
      const lg = document.createElement("legend"); lg.textContent = title || label(key); fs.append(lg);
      Object.keys(v).forEach((k) => fs.append(node(v, k)));
      return fs;
    }
    return field(parent, key);
  }

  function list(parent, key, title) {
    const arr = parent[key];
    const fs = document.createElement("fieldset");
    const lg = document.createElement("legend"); lg.textContent = title || label(key); fs.append(lg);
    const sample = arr.length && typeof arr[0] === "object" ? blank(arr[0]) : (SAMPLES[key] ? clone(SAMPLES[key]) : "");

    const redraw = () => { const n = list(parent, key, title); fs.replaceWith(n); };
    arr.forEach((item, i) => {
      const box = document.createElement("div"); box.className = "item";
      const head = document.createElement("div"); head.className = "item-head";
      const name = typeof item === "object" ? (item.nom || item.titre || item.etape || "") : "";
      head.innerHTML = `<span>#${i + 1} ${name ? "— " + name.replace(/[<>&]/g, "") : ""}</span>`;
      const acts = document.createElement("div"); acts.className = "acts";
      const btn = (t, fn, cls = "") => { const b = document.createElement("button"); b.type = "button"; b.className = "btn small " + cls; b.textContent = t; b.onclick = fn; acts.append(b); };
      btn("↑", () => { if (i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; redraw(); } });
      btn("↓", () => { if (i < arr.length - 1) { [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; redraw(); } });
      btn("Supprimer", () => { if (confirm("Supprimer cet élément ?")) { arr.splice(i, 1); redraw(); } }, "danger");
      head.append(acts); box.append(head);
      if (typeof item === "object") Object.keys(item).forEach((k) => box.append(node(item, k)));
      else box.append(field(arr, i));
      fs.append(box);
    });
    const add = document.createElement("button"); add.type = "button"; add.className = "btn small"; add.textContent = "+ Ajouter";
    add.onclick = () => { arr.push(typeof sample === "object" ? clone(sample) : ""); redraw(); };
    fs.append(add);
    return fs;
  }

  function render() {
    $("tabs").innerHTML = "";
    Object.entries(TABS).forEach(([k, t]) => {
      const b = document.createElement("button"); b.textContent = t; if (k === tab) b.className = "on";
      b.onclick = () => { tab = k; render(); scrollTo(0, 0); };
      $("tabs").append(b);
    });
    const ed = $("editor"); ed.innerHTML = "";
    const v = state[tab];
    if (Array.isArray(v)) ed.append(list(state, tab, TABS[tab]));
    else if (v && typeof v === "object") Object.keys(v).forEach((k) => ed.append(node(v, k)));
  }

  sb.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_OUT") showLogin(); });
  checkAdmin();
})();
