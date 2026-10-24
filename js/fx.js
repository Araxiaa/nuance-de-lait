// Effets visuels : particules (pétales/lucioles ou étoiles), lueur du curseur, parallaxe, inclinaison des cartes, révélations au scroll.
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const isNight = () => root.dataset.theme === "night";

  /* ---- particules ---- */
  const cv = document.getElementById("fx");
  const ctx = cv.getContext("2d");
  let W = 0, H = 0, parts = [], raf = 0;
  const rnd = (a, b) => a + Math.random() * (b - a);

  function make() {
    const n = Math.min(70, Math.round((W * H) / 26000));
    parts = Array.from({ length: n }, () => ({
      x: rnd(0, W), y: rnd(0, H), r: rnd(1.5, 5), vy: rnd(0.12, 0.5), sw: rnd(0.4, 1.6),
      ph: rnd(0, 6.28), kind: Math.random() < 0.35 ? "leaf" : "mote", tw: rnd(0.6, 2),
    }));
  }
  function size() {
    const d = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * d; cv.height = H * d; cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(d, 0, 0, d, 0, 0); make();
  }
  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    const night = isNight();
    for (const p of parts) {
      const s = t / 1000;
      if (night) {
        const a = 0.25 + 0.75 * Math.abs(Math.sin(s * p.tw + p.ph));
        ctx.fillStyle = `rgba(255,236,200,${a * 0.85})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.45, 0, 6.28); ctx.fill();
        ctx.fillStyle = `rgba(255,236,200,${a * 0.12})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2.2, 0, 6.28); ctx.fill();
        p.y -= p.vy * 0.15; p.x += Math.sin(s * 0.3 + p.ph) * 0.1;
      } else {
        p.y += p.vy; p.x += Math.sin(s * p.sw + p.ph) * 0.45;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.sin(s * p.sw + p.ph) * 0.9);
        if (p.kind === "leaf") {
          ctx.fillStyle = "rgba(125,154,74,.38)";
          ctx.beginPath(); ctx.ellipse(0, 0, p.r * 1.9, p.r * 0.8, 0, 0, 6.28); ctx.fill();
        } else {
          ctx.fillStyle = "rgba(217,178,111,.5)";
          ctx.beginPath(); ctx.arc(0, 0, p.r * 0.7, 0, 6.28); ctx.fill();
        }
        ctx.restore();
      }
      if (p.y > H + 20) { p.y = -20; p.x = rnd(0, W); }
      if (p.y < -20) { p.y = H + 20; p.x = rnd(0, W); }
    }
    raf = requestAnimationFrame(frame);
  }
  size(); addEventListener("resize", size);
  if (!reduce) {
    raf = requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", () => {
      cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(frame);
    });
  }

  /* ---- lueur du curseur + parallaxe ---- */
  const glow = document.querySelector(".glow");
  let mx = innerWidth / 2, my = innerHeight / 2, ticking = false;
  addEventListener("pointermove", (e) => {
    mx = e.clientX; my = e.clientY;
    if (ticking || reduce) return; ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      glow.style.transform = `translate(${mx - 250}px, ${my - 250}px)`;
      const px = (mx / innerWidth - 0.5), py = (my / innerHeight - 0.5);
      root.style.setProperty("--px", px.toFixed(3)); root.style.setProperty("--py", py.toFixed(3));
    });
  }, { passive: true });

  /* ---- inclinaison des cartes ---- */
  document.addEventListener("pointermove", (e) => {
    if (reduce) return;
    const el = e.target.closest && e.target.closest(".tilt");
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", ((0.5 - y) * 8).toFixed(2) + "deg");
    el.style.setProperty("--ry", ((x - 0.5) * 10).toFixed(2) + "deg");
    el.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
    el.style.setProperty("--my", (y * 100).toFixed(1) + "%");
  }, { passive: true });
  document.addEventListener("pointerout", (e) => {
    const el = e.target.closest && e.target.closest(".tilt");
    if (el && !el.contains(e.relatedTarget)) { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); }
  });

  /* ---- révélations au scroll + compteurs ---- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("in");
      en.target.querySelectorAll("[data-count]").forEach(count);
      if (en.target.hasAttribute("data-count")) count(en.target);
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });

  function count(el) {
    if (el.dataset.done) return; el.dataset.done = 1;
    const to = Number(el.dataset.count) || 0;
    if (reduce) { el.textContent = to; return; }
    const t0 = performance.now(), dur = 1400;
    (function step(t) {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * e);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  window.FX = {
    observe(scope = document) {
      scope.querySelectorAll(".rv, .stat, [data-count]").forEach((el, i) => {
        if (reduce) { el.classList.add("in"); el.querySelectorAll("[data-count]").forEach(count); if (el.dataset.count) count(el); return; }
        io.observe(el);
      });
    },
  };
})();
