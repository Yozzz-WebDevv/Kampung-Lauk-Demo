/* ===== KONFIGURASI (ubah di sini) ===== */
const CONFIG = {
  whatsapp: "",   // contoh: "6281234567890" (kode negara tanpa +). Kosong = tombol diarahkan ke bagian Kontak.
  waMessage: "Halo Kampung Lauk, saya ingin reservasi.",
  phoneDisplay: "", // contoh: "0812-3456-7890"
  mapsQuery: "Kampung Lauk, Jl. Bukit Rawi Km No. 2, Pahandut Seberang, Pahandut, Palangka Raya, Kalimantan Tengah 73111"
};

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ===== Link WhatsApp & Maps ===== */
const q = encodeURIComponent(CONFIG.mapsQuery);
$$("[data-maps]").forEach(a => a.href = `https://www.google.com/maps/search/?api=1&query=${q}`);
$("#mapFrame").src = `https://www.google.com/maps?q=${q}&output=embed`;
if (CONFIG.whatsapp) {
  const wa = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.waMessage)}`;
  $$("[data-wa]").forEach(a => { a.href = wa; a.target = "_blank"; a.rel = "noopener"; });
} else {
  $$("[data-wa]").forEach(a => { a.href = "#kontak"; a.removeAttribute("target"); });
}
if (CONFIG.phoneDisplay) $("#phoneText").textContent = CONFIG.phoneDisplay;

/* ===== Loader + animasi hero ===== */
$$("[data-h]").forEach((el, i) => el.style.setProperty("--i", i));
const start = performance.now();
addEventListener("load", () => {
  const wait = Math.max(0, 600 - (performance.now() - start));
  setTimeout(() => {
    $("#loader").classList.add("done");
    document.body.classList.add("ready");
  }, wait);
});

/* ===== Navbar ===== */
const nav = $("#nav"), toggle = $("#navToggle");
const onScroll = () => nav.classList.toggle("scrolled", scrollY > 40);
addEventListener("scroll", onScroll, { passive: true }); onScroll();
toggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  toggle.setAttribute("aria-expanded", open);
  toggle.setAttribute("aria-label", open ? "Tutup menu navigasi" : "Buka menu navigasi");
});
$$("#navMenu a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false");
}));

/* ===== Reveal saat scroll ===== */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .15, rootMargin: "0px 0px -40px 0px" });
$$("[data-reveal]").forEach(el => io.observe(el));
$$("#menuGrid .dish").forEach((d, i) => { d.dataset.reveal = "up"; io.observe(d); });

/* ===== Filter menu ===== */
const tabs = $$(".tab"), dishes = $$(".dish");
tabs.forEach(t => t.addEventListener("click", () => {
  tabs.forEach(x => { x.classList.toggle("is-on", x === t); x.setAttribute("aria-pressed", x === t); });
  const cat = t.dataset.cat;
  dishes.forEach(d => {
    const show = cat === "all" || d.dataset.cat === cat;
    if (show) {
      if (!d.hidden) return;
      d.hidden = false; d.classList.add("hide"); void d.offsetWidth;
      d.classList.add("in"); d.style.transitionDelay = "0s"; d.classList.remove("hide");
    } else if (!d.hidden) {
      d.classList.add("hide");
      setTimeout(() => { if (d.classList.contains("hide")) d.hidden = true; }, 280);
    }
  });
}));

/* ===== Lightbox ===== */
const lb = $("#lb"), lbImg = $("#lbImg");
const items = $$("#gallery .g");
let cur = 0, lastFocus = null;
const show = i => {
  cur = (i + items.length) % items.length;
  const im = $("img", items[cur]);
  lbImg.src = im.currentSrc || im.src; lbImg.alt = im.alt;
};
const openLb = i => {
  lastFocus = document.activeElement; show(i); lb.hidden = false;
  requestAnimationFrame(() => lb.classList.add("show"));
  $(".lb__x").focus(); document.body.style.overflow = "hidden";
};
const closeLb = () => {
  lb.classList.remove("show");
  setTimeout(() => { lb.hidden = true; }, 300);
  document.body.style.overflow = ""; lastFocus && lastFocus.focus();
};
items.forEach((g, i) => g.addEventListener("click", () => openLb(i)));
$(".lb__x").addEventListener("click", closeLb);
$(".lb__n--p").addEventListener("click", () => show(cur - 1));
$(".lb__n--n").addEventListener("click", () => show(cur + 1));
lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowLeft") show(cur - 1);
  if (e.key === "ArrowRight") show(cur + 1);
});

/* ===== Parallax hero (nonaktif di mobile / reduced motion) ===== */
const heroImg = $("#heroImg");
if (!reduceMotion && matchMedia("(min-width: 901px)").matches) {
  let tick = false;
  addEventListener("scroll", () => {
    if (tick || scrollY > 900) return; tick = true;
    requestAnimationFrame(() => { heroImg.style.transform = `translateY(${scrollY * .06}px) scale(1.06)`; tick = false; });
  }, { passive: true });
}

/* ===== Animasi scroll tambahan ===== */
$$("[data-fade]").forEach(el => io.observe(el));
$$("#gallery .g").forEach((g, i) => { g.dataset.reveal = "scale"; g.style.setProperty("--d", `${(i % 4) * .08}s`); io.observe(g); });

const progress = $("#progress");
const spyLinks = $$("#navMenu a[href^='#']:not(.btn)");
const spy = spyLinks.map(a => ({ a, s: $(a.getAttribute("href")) })).filter(x => x.s);
let ticking = false;
const onScrollFx = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
  if (!reduceMotion) document.documentElement.style.setProperty("--sy", scrollY);
  let cur = null, best = -Infinity;
  spy.forEach(x => { const t = x.s.getBoundingClientRect().top; if (t <= innerHeight * .35 && t > best) { best = t; cur = x; } });
  spy.forEach(x => x.a.classList.toggle("is-active", x === cur));
  ticking = false;
};
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScrollFx); } }, { passive: true });
onScrollFx();
